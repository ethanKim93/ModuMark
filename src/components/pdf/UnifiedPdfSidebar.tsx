'use client';

import { useRef, useCallback } from 'react';
import { usePdfFileStore } from '@/stores/pdfFileStore';
import PdfSidebarPageNav from './PdfSidebarPageNav';
import PdfSidebarMergeList from './PdfSidebarMergeList';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdfDoc: any | null; // PDF.js PDFDocumentProxy
  onPageChange: (pageIndex: number) => void;
  onMerge: () => void;
  isMerging: boolean;
}

/**
 * 통합 PDF 사이드바
 * - 상단: 현재 PDF 페이지 썸네일 네비게이션 (PdfSidebarPageNav)
 * - 수평 divider
 * - 하단: 병합 파일 목록 + 병합 저장 버튼 (PdfSidebarMergeList)
 * - 오른쪽 경계 드래그로 너비 조절 (200~400px)
 */
export default function UnifiedPdfSidebar({ pdfDoc, onPageChange, onMerge, isMerging }: Props) {
  const { currentPageIndex, sidebarWidth, setSidebarWidth } = usePdfFileStore();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(sidebarWidth);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarWidth;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = ev.clientX - startX.current;
        setSidebarWidth(startWidth.current + delta);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [sidebarWidth, setSidebarWidth],
  );

  return (
    <aside
      className="relative flex flex-col h-full bg-surface border-r border-border overflow-hidden shrink-0"
      style={{ width: sidebarWidth }}
    >
      {/* 상단: 페이지 썸네일 네비게이션 (독립 스크롤) */}
      <div className="flex-1 overflow-hidden">
        <PdfSidebarPageNav
          pdfDoc={pdfDoc}
          currentPage={currentPageIndex}
          onPageChange={onPageChange}
        />
      </div>

      {/* 수평 구분선 */}
      <div className="border-t border-border shrink-0" />

      {/* 하단: 병합 파일 목록 (독립 스크롤, 고정 최소 높이) */}
      <div className="shrink-0" style={{ height: 220 }}>
        <PdfSidebarMergeList onMerge={onMerge} isMerging={isMerging} />
      </div>

      {/* 오른쪽 경계 드래그 핸들 */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/40 transition-colors z-10"
        aria-hidden="true"
      />
    </aside>
  );
}
