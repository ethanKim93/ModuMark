'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { X } from 'lucide-react';
import { pdfjsLib } from '@/lib/pdf/pdfViewer';
import { usePdfFileStore, PdfFileItem, PdfPageItem } from '@/stores/pdfFileStore';

// 파일 ID별 PDFDocumentProxy 캐시 (모듈 레벨)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfDocCache = new Map<string, any>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrLoadPdf(fileItem: PdfFileItem): Promise<any> {
  if (pdfDocCache.has(fileItem.id)) return pdfDocCache.get(fileItem.id);
  const arrayBuffer = await fileItem.file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  pdfDocCache.set(fileItem.id, pdf);
  return pdf;
}

/* 개별 페이지 캔버스 */
function PageCanvas({
  pageItem,
  fileItem,
  onVisible,
  onDelete,
}: {
  pageItem: PdfPageItem;
  fileItem: PdfFileItem | undefined;
  onVisible: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // PDF 페이지 렌더링
  useEffect(() => {
    if (!fileItem || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const pdf = await getOrLoadPdf(fileItem);
        if (cancelled || !canvasRef.current) return;
        const page = await pdf.getPage(pageItem.pageIndex + 1);
        if (cancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = canvasRef.current.parentElement?.clientWidth ?? 600;
        const scale = Math.max((containerWidth - 32) / viewport.width, 0.1);
        const scaledViewport = page.getViewport({ scale });

        canvasRef.current.width = Math.floor(scaledViewport.width);
        canvasRef.current.height = Math.floor(scaledViewport.height);

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport,
          canvas: canvasRef.current,
        }).promise;
      } catch {
        // 렌더링 실패 무시
      }
    })();

    return () => { cancelled = true; };
  }, [fileItem, pageItem.fileId, pageItem.pageIndex]);

  // IntersectionObserver: 페이지 진입 시 activePageId 업데이트
  useEffect(() => {
    if (!wrapRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onVisible(pageItem.id);
      },
      { threshold: 0.4 },
    );
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [pageItem.id, onVisible]);

  return (
    <div
      ref={wrapRef}
      data-page-id={pageItem.id}
      className="relative group mx-4 mb-4 bg-white shadow-md rounded overflow-hidden"
    >
      {/* 페이지 레이블 */}
      <div className="absolute top-2 left-2 bg-black/50 text-white text-[11px] px-1.5 py-0.5 rounded select-none z-10">
        {pageItem.pageLabel}
      </div>

      {/* hover 시 삭제 버튼 오버레이 */}
      <button
        onClick={() => onDelete(pageItem.id)}
        className="absolute top-2 right-2 bg-black/50 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
        title="페이지 제거"
      >
        <X className="h-3 w-3" />
      </button>

      {fileItem ? (
        <canvas ref={canvasRef} className="w-full h-auto block" />
      ) : (
        <div className="h-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">
          파일을 찾을 수 없음
        </div>
      )}
    </div>
  );
}

/* 메인 영역 PDF 페이지 뷰어 */
export function PdfPageViewer({ onDrop }: { onDrop?: (files: File[]) => void }) {
  const { pages, files, removePage, setActivePageId } = usePdfFileStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleVisible = useCallback((id: string) => {
    setActivePageId(id);
  }, [setActivePageId]);

  const handleDelete = useCallback((id: string) => {
    // 캐시에서도 제거 (파일이 완전히 삭제된 경우 처리됨)
    removePage(id);
  }, [removePage]);

  // 파일 캐시 정리: files에서 제거된 항목 캐시 삭제
  useEffect(() => {
    const fileIds = new Set(files.map((f) => f.id));
    for (const id of pdfDocCache.keys()) {
      if (!fileIds.has(id)) pdfDocCache.delete(id);
    }
  }, [files]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // 자식 요소로 이동할 때는 무시
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!onDrop) return;
    const pdfFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf',
    );
    if (pdfFiles.length > 0) onDrop(pdfFiles);
  }, [onDrop]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-4 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 드래그 오버 오버레이 */}
      {isDragOver && (
        <div className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary rounded flex items-center justify-center pointer-events-none">
          <p className="text-primary text-base font-medium">PDF 파일을 놓아 추가</p>
        </div>
      )}

      {pages.map((page) => {
        const fileItem = files.find((f) => f.id === page.fileId);
        return (
          <PageCanvas
            key={page.id}
            pageItem={page}
            fileItem={fileItem}
            onVisible={handleVisible}
            onDelete={handleDelete}
          />
        );
      })}
    </div>
  );
}
