import { pdfjsLib } from './pdfViewer';
import { usePdfFileStore, PdfFileItem } from '@/stores/pdfFileStore';

/**
 * PDF 파일에서 개별 페이지 아이템을 추출하여 스토어에 추가.
 * 각 페이지 썸네일은 비동기로 생성됨.
 */
export async function extractPages(fileItem: PdfFileItem): Promise<void> {
  const arrayBuffer = await fileItem.file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const baseName = fileItem.file.name.replace(/\.pdf$/i, '');

  const newPages = Array.from({ length: numPages }, (_, i) => ({
    id: crypto.randomUUID(),
    fileId: fileItem.id,
    fileName: fileItem.file.name,
    pageIndex: i,
    pageLabel: numPages > 1 ? `${baseName} p.${i + 1}` : baseName,
    thumbnail: null as null,
  }));

  usePdfFileStore.getState().addPages(newPages);

  // 각 페이지 썸네일 비동기 생성 (이미 로드된 PDF 재사용)
  const THUMB_HEIGHT = 128;
  for (const pageItem of newPages) {
    (async () => {
      try {
        const pdfPage = await pdf.getPage(pageItem.pageIndex + 1);
        const viewport = pdfPage.getViewport({ scale: 1 });
        const scale = THUMB_HEIGHT / viewport.height;
        const scaledViewport = pdfPage.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(scaledViewport.width);
        canvas.height = Math.floor(scaledViewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await pdfPage.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        usePdfFileStore.getState().setPageThumbnail(pageItem.id, dataUrl);
      } catch {
        // 썸네일 생성 실패 무시
      }
    })();
  }
}
