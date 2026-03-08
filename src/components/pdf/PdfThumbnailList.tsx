'use client';

import { useEffect, useRef } from 'react';
import { X, GripVertical, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePdfFileStore, PdfPageItem } from '@/stores/pdfFileStore';

/* 개별 페이지 썸네일 아이템 */
function SortableItem({
  item,
  index,
  isActive,
  isSelected,
  itemRef,
  onClick,
  onCheckboxClick,
}: {
  item: PdfPageItem;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
  onCheckboxClick: (e: React.MouseEvent) => void;
}) {
  const { removePage } = usePdfFileStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={(el) => { setNodeRef(el); itemRef(el); }}
      style={style}
      onClick={onClick}
      className={`group flex items-center gap-1.5 rounded-md p-1 transition-colors cursor-pointer ${
        isSelected
          ? 'bg-primary/15'
          : isActive
          ? 'bg-primary/10 ring-1 ring-primary/50'
          : 'hover:bg-surface-secondary'
      }`}
    >
      {/* 체크박스 */}
      <button
        onClick={onCheckboxClick}
        className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors touch-none ${
          isSelected
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border hover:border-primary/60'
        }`}
        title="페이지 선택"
      >
        {isSelected && <Check className="h-2.5 w-2.5" />}
      </button>

      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0 touch-none"
        title="드래그하여 순서 변경"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* 순서 번호 */}
      <span className="text-[10px] text-muted-foreground tabular-nums w-4 shrink-0 text-center">
        {index + 1}
      </span>

      {/* 썸네일 */}
      <div className="shrink-0 w-8 h-10 bg-surface border border-border rounded overflow-hidden flex items-center justify-center">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail}
            alt={item.pageLabel}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted-foreground/10 animate-pulse" />
        )}
      </div>

      {/* 페이지 레이블 (lg 이상에서만 표시) */}
      <span className="max-lg:hidden flex-1 text-[11px] text-muted-foreground truncate min-w-0">
        {item.pageLabel}
      </span>

      {/* 삭제 버튼 */}
      <button
        onClick={(e) => { e.stopPropagation(); removePage(item.id); }}
        className="shrink-0 p-0.5 rounded text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
        title="제거"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* 페이지 썸네일 리스트 전체 */
export function PdfThumbnailList() {
  const {
    pages,
    reorderPages,
    activePageId,
    setActivePageId,
    selectedPageIds,
    togglePageSelection,
    selectAllPages,
    deselectAllPages,
    selectPageRange,
  } = usePdfFileStore();
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastClickedIdRef = useRef<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderPages(String(active.id), String(over.id));
    }
  };

  // activePageId 변경 시 사이드바 썸네일 자동 스크롤
  useEffect(() => {
    if (!activePageId) return;
    const el = itemRefs.current.get(activePageId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activePageId]);

  const handleClick = (id: string) => {
    setActivePageId(id);
    // 메인 뷰어의 해당 페이지로 스크롤
    const el = document.querySelector(`[data-page-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCheckboxClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIdRef.current) {
      // Shift+클릭: 범위 선택
      selectPageRange(lastClickedIdRef.current, id);
    } else {
      togglePageSelection(id);
    }
    lastClickedIdRef.current = id;
  };

  const allSelected = pages.length > 0 && selectedPageIds.size === pages.length;

  if (pages.length === 0) {
    return (
      <p className="max-lg:hidden text-[11px] text-muted-foreground/50 px-2 py-3 text-center select-none">
        페이지 없음
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* 전체 선택 / 해제 토글 */}
      <button
        onClick={allSelected ? deselectAllPages : selectAllPages}
        className="max-lg:hidden text-[10px] text-primary hover:text-primary/80 px-2 py-0.5 text-left transition-colors"
      >
        {allSelected ? '전체 해제' : '전체 선택'}
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-0.5">
            {pages.map((item, i) => (
              <SortableItem
                key={item.id}
                item={item}
                index={i}
                isActive={item.id === activePageId}
                isSelected={selectedPageIds.has(item.id)}
                itemRef={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                  else itemRefs.current.delete(item.id);
                }}
                onClick={() => handleClick(item.id)}
                onCheckboxClick={(e) => handleCheckboxClick(e, item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
