import { pdfjsLib } from './pdfViewer';

const THUMB_HEIGHT = 128;

async function renderPageToDataUrl(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfPage: any,
): Promise<string> {
  const viewport = pdfPage.getViewport({ scale: 1 });
  const scale = THUMB_HEIGHT / viewport.height;
  const scaledViewport = pdfPage.getViewport({ scale });

  // 고해상도 디스플레이(Retina) 대응: 물리 픽셀로 canvas 크기 설정
  const dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(scaledViewport.width * dpr);
  canvas.height = Math.floor(scaledViewport.height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context 생성 실패');
  ctx.scale(dpr, dpr);

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

/**
 * 이미 로드된 PDFDocumentProxy에서 특정 페이지 썸네일 생성 (1-based pageNumber)
 * 사이드바 네비게이션처럼 문서를 재로드하지 않고 썸네일을 생성할 때 사용
 */
export async function generateThumbnailFromDoc(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any,
  pageNumber: number,
): Promise<string> {
  const page = await pdfDoc.getPage(pageNumber);
  return renderPageToDataUrl(page);
}
