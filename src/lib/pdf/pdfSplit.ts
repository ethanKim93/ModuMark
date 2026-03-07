import { PDFDocument } from 'pdf-lib';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB
export const PDF_MAX_SIZE = MAX_SIZE;

export interface SplitRange {
  id: string;
  from: number;
  to: number;
}

export class PdfSplitError extends Error {
  constructor(public code: 'TOO_LARGE' | 'INVALID_RANGE' | 'ENCRYPTED', message: string) {
    super(message);
    this.name = 'PdfSplitError';
  }
}

export interface SplitResult {
  name: string;
  bytes: Uint8Array;
}

type ProgressCallback = (progress: number, status: string) => void;

export async function splitPdf(
  file: File,
  ranges: SplitRange[],
  onProgress?: ProgressCallback
): Promise<SplitResult[]> {
  if (file.size > MAX_SIZE) {
    throw new PdfSplitError('TOO_LARGE', '100MB를 초과하는 파일은 처리할 수 없습니다.');
  }

  onProgress?.(0, 'PDF 읽는 중...');

  let srcPdf: PDFDocument;
  try {
    const bytes = await file.arrayBuffer();
    srcPdf = await PDFDocument.load(bytes);
  } catch {
    throw new PdfSplitError('ENCRYPTED', '암호화된 PDF는 지원하지 않습니다.');
  }

  const totalPages = srcPdf.getPageCount();
  const results: SplitResult[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    onProgress?.(
      Math.round(10 + (i / ranges.length) * 80),
      `범위 분할 중 (${i + 1}/${ranges.length})`
    );

    const from = Math.max(1, range.from);
    const to = Math.min(totalPages, range.to);

    if (from > to || range.from < 1) {
      throw new PdfSplitError(
        'INVALID_RANGE',
        `범위 ${range.from}-${range.to}이(가) 유효하지 않습니다. (총 ${totalPages}페이지)`
      );
    }

    const pageIndices = Array.from({ length: to - from + 1 }, (_, idx) => from - 1 + idx);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(srcPdf, pageIndices);
    pages.forEach((p) => newPdf.addPage(p));

    const baseName = file.name.replace(/\.pdf$/i, '');
    results.push({
      name: `${baseName}_p${from}-${to}.pdf`,
      bytes: await newPdf.save(),
    });
  }

  onProgress?.(100, '완료!');
  return results;
}
