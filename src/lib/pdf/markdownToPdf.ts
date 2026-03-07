import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

interface ConvertOptions {
  title?: string;
}

/* 폰트 바이트 캐시 (반복 fetch 방지) */
let cachedRegularFont: ArrayBuffer | null = null;
let cachedBoldFont: ArrayBuffer | null = null;

async function loadFontBytes(path: string): Promise<ArrayBuffer> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`폰트 로드 실패: ${path}`);
  return res.arrayBuffer();
}

/* 마크다운을 줄 단위로 파싱하여 PDF 생성 (클라이언트 사이드) */
export async function markdownToPdf(markdown: string, options?: ConvertOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  if (options?.title) {
    pdfDoc.setTitle(options.title);
  }

  /* fontkit 등록 후 NotoSansKR OTF 임베딩 (한글 지원) */
  pdfDoc.registerFontkit(fontkit);

  if (!cachedRegularFont) {
    cachedRegularFont = await loadFontBytes('/fonts/NotoSansKR-Regular.otf');
  }
  if (!cachedBoldFont) {
    cachedBoldFont = await loadFontBytes('/fonts/NotoSansKR-Bold.otf');
  }

  const font = await pdfDoc.embedFont(cachedRegularFont);
  const boldFont = await pdfDoc.embedFont(cachedBoldFont);
  /* 코드블록용 모노스페이스는 ASCII만 사용하므로 StandardFonts 유지 */
  const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842; // A4
  const MARGIN = 60;
  const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
  const LINE_HEIGHT = 18;
  const PARA_GAP = 8;

  const addPage = () => {
    const p = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page: p, y: PAGE_HEIGHT - MARGIN };
  };

  let { page, y } = addPage();

  const checkPage = (needed: number) => {
    if (y - needed < MARGIN) {
      const next = addPage();
      page = next.page;
      y = next.y;
    }
  };

  /* 텍스트를 MAX_WIDTH 기준으로 줄바꿈 */
  const wrapText = (text: string, size: number, f: PDFFont): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      try {
        const width = f.widthOfTextAtSize(test, size);
        if (width > MAX_WIDTH && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      } catch {
        /* 폰트에 없는 글리프 발생 시 단어 단위 강제 줄바꿈 */
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [''];
  };

  const drawText = (text: string, size: number, f: PDFFont, color = rgb(0.1, 0.1, 0.1)) => {
    const wrapped = wrapText(text, size, f);
    for (const line of wrapped) {
      checkPage(size + LINE_HEIGHT);
      try {
        page.drawText(line, { x: MARGIN, y, size, font: f, color });
      } catch {
        /* 렌더링 실패 시 스킵 (깨진 글리프 방지) */
      }
      y -= size + PARA_GAP;
    }
  };

  const lines = markdown.split('\n');
  let inCodeBlock = false;
  const codeLines: string[] = [];

  const flushCodeBlock = () => {
    const blockHeight = codeLines.length * (10 + PARA_GAP) + 16;
    checkPage(blockHeight);

    /* 코드블록 배경 */
    page.drawRectangle({
      x: MARGIN - 4,
      y: y - blockHeight + 8,
      width: MAX_WIDTH + 8,
      height: blockHeight,
      color: rgb(0.93, 0.94, 0.95),
    });

    for (const cl of codeLines) {
      const wrapped = wrapText(cl || ' ', 10, monoFont);
      for (const wl of wrapped) {
        checkPage(14);
        try {
          page.drawText(wl, { x: MARGIN + 4, y, size: 10, font: monoFont, color: rgb(0.2, 0.2, 0.2) });
        } catch {
          /* 코드블록 내 특수문자 렌더링 실패 시 스킵 */
        }
        y -= 10 + PARA_GAP;
      }
    }
    y -= 4;
    codeLines.length = 0;
  };

  for (const rawLine of lines) {
    /* 코드블록 처리 */
    if (rawLine.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    /* 헤딩 */
    if (rawLine.startsWith('# ')) {
      y -= 4;
      drawText(rawLine.slice(2), 22, boldFont, rgb(0.05, 0.05, 0.05));
      /* 헤딩 아래 구분선 */
      page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + MAX_WIDTH, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
      y -= 8;
      continue;
    }
    if (rawLine.startsWith('## ')) {
      y -= 2;
      drawText(rawLine.slice(3), 18, boldFont);
      y -= 4;
      continue;
    }
    if (rawLine.startsWith('### ')) {
      drawText(rawLine.slice(4), 14, boldFont);
      continue;
    }

    /* 인용구 */
    if (rawLine.startsWith('> ')) {
      page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN, y: y - 14 }, thickness: 2, color: rgb(0.35, 0.55, 0.85) });
      drawText(rawLine.slice(2), 11, font, rgb(0.45, 0.45, 0.45));
      continue;
    }

    /* 비순서 목록 */
    if (rawLine.startsWith('- ') || rawLine.startsWith('* ')) {
      const content = rawLine.slice(2);
      checkPage(14);
      page.drawText('•', { x: MARGIN + 4, y, size: 12, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
      const wrapped = wrapText(content, 12, font);
      for (let i = 0; i < wrapped.length; i++) {
        checkPage(14);
        try {
          page.drawText(wrapped[i], { x: MARGIN + 16, y, size: 12, font, color: rgb(0.1, 0.1, 0.1) });
        } catch {
          /* 렌더링 실패 시 스킵 */
        }
        y -= 12 + PARA_GAP;
      }
      continue;
    }

    /* 수평선 */
    if (rawLine.match(/^---+$/) || rawLine.match(/^\*\*\*+$/)) {
      checkPage(16);
      page.drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + MAX_WIDTH, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 16;
      continue;
    }

    /* 빈 줄 */
    if (rawLine.trim() === '') {
      y -= LINE_HEIGHT / 2;
      continue;
    }

    /* 굵게(**text**) 간단 처리 — 전체 볼드 적용 */
    const isBold = rawLine.includes('**') || rawLine.startsWith('####');
    const cleanLine = rawLine.replace(/\*\*/g, '').replace(/^####\s*/, '');
    drawText(cleanLine, 12, isBold ? boldFont : font);
  }

  /* 열린 코드블록 처리 */
  if (inCodeBlock && codeLines.length > 0) {
    flushCodeBlock();
  }

  return pdfDoc.save();
}
