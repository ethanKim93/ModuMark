/**
 * PDF OCR 처리 로직
 * - Tesseract.js 동적 import (~15MB 번들 방지)
 * - PDF 각 페이지를 canvas로 렌더링 후 OCR 수행
 * - CDN 언어팩: tessdata.projectnaptha.com
 */

export type OcrLanguage = 'kor' | 'eng' | 'kor+eng';

export interface OcrPageResult {
  /** 페이지 번호 (1-indexed) */
  pageNumber: number;
  /** 추출된 텍스트 */
  text: string;
  /** 신뢰도 (0~100) */
  confidence: number;
  /** 단어별 상세 결과 */
  words: OcrWord[];
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

export interface OcrOptions {
  language: OcrLanguage;
  /** 진행률 콜백 (0~100) */
  onProgress?: (progress: number, status: string) => void;
  /** 처리할 페이지 범위 (기본: 전체) */
  pageRange?: { from: number; to: number };
}

/**
 * PDF 파일에서 OCR로 텍스트 추출
 * @param file PDF 파일
 * @param options OCR 옵션
 * @returns 페이지별 OCR 결과
 */
export async function extractTextFromPdf(
  file: File,
  options: OcrOptions
): Promise<OcrPageResult[]> {
  const { language, onProgress, pageRange } = options;

  // PDF.js 동적 import
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  const fromPage = pageRange?.from ?? 1;
  const toPage = pageRange?.to ?? totalPages;
  const pagesToProcess = toPage - fromPage + 1;

  // Tesseract.js 동적 import — CDN 언어팩 + IndexedDB 캐싱
  // cacheMethod: 'write' → 첫 다운로드 후 idb-keyval(IndexedDB)에 저장,
  // 이후 재방문 시 CDN 요청 없이 캐시에서 로드
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(language, 1, {
    langPath: 'https://tessdata.projectnaptha.com/4.0.0/',
    cacheMethod: 'write',
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text') {
        // Tesseract 내부 진행률 — 외부 진행률과 합산하지 않음
      }
    },
  });

  const results: OcrPageResult[] = [];

  try {
    for (let pageNum = fromPage; pageNum <= toPage; pageNum++) {
      const pageIndex = pageNum - fromPage;
      const pageProgress = Math.round((pageIndex / pagesToProcess) * 80);
      onProgress?.(pageProgress, `페이지 ${pageNum}/${toPage} 처리 중...`);

      // PDF 페이지를 canvas로 렌더링
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 고해상도로 렌더링

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // PDF.js v5: canvas 파라미터 필수
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      // OCR 수행
      const { data } = await worker.recognize(canvas);

      // 단어별 결과 변환 (Tesseract.js RecognizeResult 타입)
      type TesseractWord = {
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawWords: TesseractWord[] = ((data as unknown as Record<string, unknown>).words as TesseractWord[]) ?? [];
      const words: OcrWord[] = rawWords.map((w) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      }));

      results.push({
        pageNumber: pageNum,
        text: data.text,
        confidence: data.confidence,
        words,
      });
    }
  } finally {
    await worker.terminate();
  }

  onProgress?.(100, 'OCR 완료');
  return results;
}

/**
 * OCR 결과를 하나의 텍스트로 합치기
 */
export function mergeOcrResults(results: OcrPageResult[]): string {
  return results
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((r) => r.text.trim())
    .filter(Boolean)
    .join('\n\n');
}
