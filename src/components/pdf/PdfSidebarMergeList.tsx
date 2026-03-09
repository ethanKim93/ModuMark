'use client';

import { useRef, useState } from 'react';
import { GripVertical, X, Loader2, FileText, Plus } from 'lucide-react';
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
import { usePdfFileStore, MergeFileEntry } from '@/stores/pdfFileStore';
import { pdfjsLib } from '@/lib/pdf/pdfViewer';

interface Props {
  onMerge: () => void;
  isMerging: boolean;
}

/** 파일명 최대 20자 truncate */
function truncateName(name: string, maxLen = 20): string {
  return name.length > maxLen ? `${name.slice(0, maxLen)}…` : name;
}

/** 정렬 가능한 파일 항목 */
function SortableFileItem({
  entry,
  onRemove,
}: {
  entry: MergeFileEntry;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-muted/50 hover:bg-muted group"
    >
      {/* 드래그 핸들 */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
        aria-label="드래그하여 순서 변경"
      >
        <GripVertical size={14} />
      </button>

      {/* 파일 아이콘 */}
      <FileText size={14} className="text-muted-foreground shrink-0" />

      {/* 파일명 + 페이지 수 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs truncate leading-tight" title={entry.name}>
          {truncateName(entry.name)}
        </p>
        <p className="text-[10px] text-muted-foreground">{entry.pageCount}페이지</p>
      </div>

      {/* 제거 버튼 */}
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`${entry.name} 제거`}
      >
        <X size={12} />
      </button>
    </div>
  );
}

/**
 * 사이드바 하단: 병합 파일 목록
 * - dnd-kit 드래그 정렬
 * - 파일 추가/제거
 * - 하단 고정 [병합 저장] 버튼
 */
export default function PdfSidebarMergeList({ onMerge, isMerging }: Props) {
  const { mergeFiles, addMergeFile, removeMergeFile, reorderMergeFiles } = usePdfFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderMergeFiles(String(active.id), String(over.id));
    }
  };

  /** 파일 선택 시 pageCount 계산 후 스토어에 추가 */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setErrorMsg(null);

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdf.numPages;

        const entry: MergeFileEntry = {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          pageCount,
        };

        const error = addMergeFile(entry);
        if (error) {
          setErrorMsg(error);
          break;
        }
      } catch {
        setErrorMsg('PDF 파일을 읽을 수 없습니다.');
        break;
      }
    }

    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = '';
  };

  const canMerge = mergeFiles.length >= 1 && !isMerging;

  return (
    <div className="flex flex-col h-full">
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          병합 파일 {mergeFiles.length > 0 && `(${mergeFiles.length})`}
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-0.5 text-xs text-primary hover:underline"
          disabled={isMerging}
          aria-label="병합할 파일 추가"
        >
          <Plus size={12} />
          추가
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 오류 메시지 */}
      {errorMsg && (
        <p className="text-[10px] text-destructive px-3 pb-1 shrink-0">{errorMsg}</p>
      )}

      {/* 파일 목록 / 빈 상태 드롭존 */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {mergeFiles.length === 0 ? (
          /* 빈 상태 드롭존 */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isMerging}
            className="w-full h-full min-h-[80px] flex flex-col items-center justify-center gap-1.5 border border-dashed border-border rounded text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
          >
            <Plus size={16} />
            <span className="text-center leading-tight px-2">
              PDF 파일을 끌어다 놓거나<br />클릭하여 추가하세요
            </span>
          </button>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={mergeFiles.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-1">
                {mergeFiles.map((entry) => (
                  <SortableFileItem
                    key={entry.id}
                    entry={entry}
                    onRemove={removeMergeFile}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* 하단 고정: 병합 저장 버튼 */}
      <div className="shrink-0 p-2 border-t border-border">
        <button
          type="button"
          onClick={onMerge}
          disabled={!canMerge}
          className={[
            'w-full py-1.5 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5',
            canMerge
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed',
          ].join(' ')}
        >
          {isMerging ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              병합 중...
            </>
          ) : (
            '병합 저장'
          )}
        </button>
      </div>
    </div>
  );
}

