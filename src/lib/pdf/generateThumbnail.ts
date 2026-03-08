import { pdfjsLib } from './pdfViewer';

const THUMB_HEIGHT = 128;

async function renderPageToDataUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfPage: any,
): Promise<string> {
  const viewport = pdfPage.getViewport({ scale: 1 });
  const scale = THUMB_HEIGHT / viewport.height;
  const scaledViewport = pdfPage.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaledViewport.width);
  canvas.height = Math.floor(scaledViewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context 생성 실패');

  // PDF.js v5: canvas 필드 필수
  await pdfPage.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;
  return canvas.toDataURL('image/jpeg', 0.7);
}

/**
 * PDF 첫 페이지를 썸네일 dataURL로 변환
 */
export async function generateThumbnail(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  return renderPageToDataUrl(page);
}

/**
 * PDF 특정 페이지를 썸네일 dataURL로 변환 (1-based pageNumber)
 */
export async function generatePageThumbnail(file: File, pageNumber: number): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  return renderPageToDataUrl(page);
}
