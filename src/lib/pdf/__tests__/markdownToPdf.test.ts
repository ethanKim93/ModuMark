import { describe, it, expect, vi, beforeAll } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

/* NotoSansKR OTF 바이트를 실제 파일에서 로드 (public/ 폴더 기준)
 * __dirname: src/lib/pdf/__tests__ → 4단계 위가 프로젝트 루트 */
const fontPath = path.resolve(__dirname, '../../../../public/fonts/NotoSansKR-Regular.otf');
const boldFontPath = path.resolve(__dirname, '../../../../public/fonts/NotoSansKR-Bold.otf');

beforeAll(() => {
  /* fetch를 모킹하여 로컬 OTF 파일 바이트를 반환 */
  vi.stubGlobal('fetch', async (url: string) => {
    const filePath = url.includes('Bold') ? boldFontPath : fontPath;
    const nodeBuffer = fs.readFileSync(filePath);
    /* Node.js Buffer → 독립적인 ArrayBuffer 복사본 생성 */
    const arrayBuffer = new ArrayBuffer(nodeBuffer.length);
    new Uint8Array(arrayBuffer).set(nodeBuffer);
    return {
      ok: true,
      arrayBuffer: async () => arrayBuffer,
    };
  });
});

describe('markdownToPdf', () => {
  it('빈 마크다운도 정상적으로 PDF를 생성한다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const bytes = await markdownToPdf('');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('헤딩이 포함된 마크다운을 PDF로 변환한다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const md = '# 제목\n## 소제목\n### 세부 제목\n본문 텍스트';
    const bytes = await markdownToPdf(md);
    expect(bytes.length).toBeGreaterThan(0);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('한글 텍스트가 포함된 마크다운을 PDF로 변환한다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const md = '# 한글 제목\n\n안녕하세요. 이것은 한글 테스트입니다.\n\n- 목록 항목 1\n- 목록 항목 2';
    const bytes = await markdownToPdf(md, { title: '한글 테스트' });
    expect(bytes.length).toBeGreaterThan(0);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('코드블록이 포함된 마크다운을 PDF로 변환한다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const md = '```\nconst hello = "world";\nconsole.log(hello);\n```';
    const bytes = await markdownToPdf(md);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('목록이 포함된 마크다운을 PDF로 변환한다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const md = '- 항목 1\n- 항목 2\n- 항목 3\n\n* 별표 항목\n* 별표 항목 2';
    const bytes = await markdownToPdf(md);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it('긴 마크다운은 자동으로 여러 페이지로 분할된다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    /* 충분히 긴 콘텐츠 생성 */
    const longMd = Array.from({ length: 60 }, (_, i) => `## 섹션 ${i + 1}\n\n내용 ${i + 1}`).join('\n\n');
    const bytes = await markdownToPdf(longMd);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThan(1);
  });

  it('title 옵션 지정 시 PDF 메타데이터에 제목이 설정된다', async () => {
    const { markdownToPdf } = await import('../markdownToPdf');
    const bytes = await markdownToPdf('# 테스트', { title: '내 문서' });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getTitle()).toBe('내 문서');
  });
});
