import { PDFDocument } from 'pdf-lib';

const MAX_FILES = 20;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
export const PDF_MAX_TOTAL_SIZE = MAX_TOTAL_SIZE;

export class PdfMergeError extends Error {
  constructor(public code: 'TOO_MANY_FILES' | 'TOO_LARGE' | 'ENCRYPTED', message: string) {
    super(message);
    this.name = 'PdfMergeError';
  }
}

type ProgressCallback = (progress: number, status: string) => void;

export async function mergePdfs(files: File[], onProgress?: ProgressCallback): Promise<Uint8Array> {
  if (files.length > MAX_FILES) {
    throw new PdfMergeError('TOO_MANY_FILES', `최대 ${MAX_FILES}개까지 병합 가능합니다.`);
  }
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new PdfMergeError('TOO_LARGE', '총 파일 크기는 100MB를 초과할 수 없습니다.');
  }

  onProgress?.(0, '파일 읽는 중...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(Math.round((i / files.length) * 80), `파일 처리 중 (${i + 1}/${files.length})`);

    let pdf: PDFDocument;
    try {
      const bytes = await file.arrayBuffer();
      pdf = await PDFDocument.load(bytes);
    } catch {
      throw new PdfMergeError('ENCRYPTED', `"${file.name}": 암호화된 PDF는 지원하지 않습니다.`);
    }
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));
  }

  onProgress?.(90, 'PDF 생성 중...');
  const result = await mergedPdf.save();
  onProgress?.(100, '완료!');
  return result;
}

export interface MergePageSpec {
  file: File;
  pageIndex: number;  // 0-based
}

/**
 * 개별 페이지 스펙 목록을 받아 지정 순서대로 병합.
 * 같은 파일이 여러 번 참조될 경우 PDFDocument 로드를 캐시.
 */
export async function mergePagesPdf(
  specs: MergePageSpec[],
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  if (specs.length === 0) {
    throw new PdfMergeError('TOO_MANY_FILES', '병합할 페이지가 없습니다.');
  }

  onProgress?.(0, '파일 읽는 중...');
  const mergedPdf = await PDFDocument.create();

  // 파일명 기준 PDFDocument 캐시
  const fileCache = new Map<string, PDFDocument>();

  for (let i = 0; i < specs.length; i++) {
    const { file, pageIndex } = specs[i];
    onProgress?.(Math.round((i / specs.length) * 80), `페이지 처리 중 (${i + 1}/${specs.length})`);

    let srcPdf = fileCache.get(file.name);
    if (!srcPdf) {
      try {
        const bytes = await file.arrayBuffer();
        srcPdf = await PDFDocument.load(bytes);
        fileCache.set(file.name, srcPdf);
      } catch {
        throw new PdfMergeError('ENCRYPTED', `"${file.name}": 암호화된 PDF는 지원하지 않습니다.`);
      }
    }

    const [page] = await mergedPdf.copyPages(srcPdf, [pageIndex]);
    mergedPdf.addPage(page);
  }

  onProgress?.(90, 'PDF 생성 중...');
  const result = await mergedPdf.save();
  onProgress?.(100, '완료!');
  return result;
}
