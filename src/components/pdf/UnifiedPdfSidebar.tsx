'use client';

import { useRef, useCallback } from 'react';
import { Loader2, FilePlus2, Layers } from 'lucide-react';
import { usePdfFileStore } from '@/stores/pdfFileStore';
import { PdfThumbnailList } from './PdfThumbnailList';

interface Props {
  onMergeSave: () => void;
  onAddPages: () => void;
  isMerging: boolean;
}

/**
 * 통합 PDF 사이드바 (페이지 단위 썸네일 리스트)
 * - 스크롤 가능한 페이지 썸네일 리스트 (PdfThumbnailList)
 * - 하단 고정 버튼 영역: 선택 삭제 / 페이지 추가 / 병합 저장
 * - 오른쪽 경계 드래그로 너비 조절 (200~400px)
 */
export default function UnifiedPdfSidebar({ onMergeSave, onAddPages, isMerging }: Props) {
  const { selectedPageIds, removeSelectedPages, pages, sidebarWidth, setSidebarWidth } =
    usePdfFileStore();

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

  const hasSelection = selectedPageIds.size > 0;
  const hasPages = pages.length > 0;

  return (
    <aside
      className="relative flex flex-col h-full bg-surface border-r border-border overflow-hidden shrink-0"
      style={{ width: sidebarWidth }}
    >
      {/* 스크롤 가능한 페이지 썸네일 리스트 */}
      <div className="flex-1 overflow-y-auto p-2">
        <PdfThumbnailList />
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="shrink-0 border-t border-border p-2 flex flex-col gap-1.5">
        {/* 선택된 페이지 삭제 버튼 (선택 시에만 표시) */}
        {hasSelection && (
          <button
            type="button"
            onClick={removeSelectedPages}
            className="w-full py-1.5 px-3 rounded text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1.5"
          >
            {selectedPageIds.size}개 선택 삭제
          </button>
        )}

        {/* 페이지 추가 버튼 */}
        <button
          type="button"
          onClick={onAddPages}
          className="w-full py-1.5 px-3 rounded text-xs font-medium border border-border bg-surface hover:bg-surface-secondary text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
          페이지 추가
        </button>

        {/* 병합 저장 버튼 */}
        <button
          type="button"
          onClick={onMergeSave}
          disabled={!hasPages || isMerging}
          className={[
            'w-full py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
            hasPages && !isMerging
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed',
          ].join(' ')}
        >
          {isMerging ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              저장 중...
            </>
          ) : (
            <>
              <Layers className="h-3.5 w-3.5" />
              병합 저장
            </>
          )}
        </button>
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
