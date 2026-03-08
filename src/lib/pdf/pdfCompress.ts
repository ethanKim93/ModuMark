/**
 * PDF 압축 로직
 * - PDF.js로 각 페이지를 canvas에 렌더링
 * - JPEG 압축(품질 조정)으로 이미지 크기 감소
 * - pdf-lib으로 이미지를 임베딩하여 새 PDF 생성
 */
import { pdfjsLib } from './pdfViewer';

export type CompressionQuality = 'low' | 'medium' | 'high';

/** 압축 품질별 JPEG quality 값 */
const QUALITY_MAP: Record<CompressionQuality, number> = {
  low: 0.5,
  medium: 0.75,
  high: 0.9,
};

/** 압축 품질별 렌더링 스케일 */
const SCALE_MAP: Record<CompressionQuality, number> = {
  low: 1.0,
  medium: 1.5,
  high: 2.0,
};

export interface CompressResult {
  /** 압축된 PDF 바이트 배열 */
  bytes: Uint8Array;
  /** 원본 파일 크기 (bytes) */
  originalSize: number;
  /** 압축 후 파일 크기 (bytes) */
  compressedSize: number;
  /** 압축률 (0~100%) */
  compressionRatio: number;
}

export interface CompressOptions {
  quality: CompressionQuality;
  /** 진행률 콜백 (0~100) */
  onProgress?: (progress: number, status: string) => void;
}

/**
 * PDF 파일을 압축
 * @param file 원본 PDF 파일
 * @param options 압축 옵션
 */
export async function compressPdf(file: File, options: CompressOptions): Promise<CompressResult> {
  const { quality, onProgress } = options;
  const jpegQuality = QUALITY_MAP[quality];
  const scale = SCALE_MAP[quality];

  onProgress?.(0, 'PDF 읽는 중...');

  const arrayBuffer = await file.arrayBuffer();
  const originalSize = file.size;

  // PDF.js로 PDF 로드
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  // pdf-lib으로 새 PDF 생성
  const { PDFDocument } = await import('pdf-lib');
  const newPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const pageProgress = Math.round(((pageNum - 1) / totalPages) * 90);
    onProgress?.(pageProgress, `페이지 ${pageNum}/${totalPages} 압축 중...`);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // canvas에 페이지 렌더링
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas context 생성 실패');

    // PDF.js v5: canvas 필드 필수
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    // JPEG로 압축
    const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
    const jpegBase64 = jpegDataUrl.split(',')[1];
    if (!jpegBase64) continue;

    const jpegBytes = Uint8Array.from(atob(jpegBase64), (c) => c.charCodeAt(0));

    // pdf-lib에 이미지 임베딩
    const jpegImage = await newPdf.embedJpg(jpegBytes);

    // 원본 페이지와 동일한 크기로 새 페이지 생성
    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  onProgress?.(95, 'PDF 생성 중...');

  const pdfBytes = await newPdf.save();
  const compressedBytes = new Uint8Array(pdfBytes);
  const compressedSize = compressedBytes.byteLength;
  const compressionRatio = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

  onProgress?.(100, '압축 완료');

  return {
    bytes: compressedBytes,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

/** 파일 크기를 사람이 읽기 좋은 형식으로 변환 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
