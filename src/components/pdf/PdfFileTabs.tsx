'use client';

import { useRef } from 'react';
import { X, Plus } from 'lucide-react';
import type { ViewerFileItem } from '@/stores/pdfFileStore';

interface PdfFileTabsProps {
  files: ViewerFileItem[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  /** 새 파일 열기 콜백 */
  onOpenFile: (file: File) => void;
}

/**
 * PDF 파일 탭 바.
 * - 파일이 1개 이상이면 항상 렌더링 (단일 파일도 탭 표시)
 * - "+" 버튼으로 새 파일 추가
 */
export function PdfFileTabs({ files, activeFileId, onSelect, onClose, onOpenFile }: PdfFileTabsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onOpenFile(file);
    e.target.value = '';
  };

  // 파일이 없어도 "+" 버튼은 항상 표시
  return (
    <div className="flex items-end overflow-x-auto shrink-0 border-b border-border bg-surface px-2 pt-1 gap-0.5">
      {files.map((item) => {
        const isActive = item.id === activeFileId;
        return (
          <div
            key={item.id}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[12px] font-medium cursor-pointer max-w-[180px] shrink-0 transition-colors border border-b-0 ${
              isActive
                ? 'bg-background border-border text-foreground'
                : 'bg-surface border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
            }`}
            onClick={() => onSelect(item.id)}
            title={item.file.name}
          >
            {/* 파일명 (최대 너비 초과 시 truncate) */}
            <span className="truncate flex-1 min-w-0">
              {item.file.name.replace(/\.pdf$/i, '')}
            </span>

            {/* 닫기 버튼 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(item.id);
              }}
              className="shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-border transition-opacity"
              title="탭 닫기"
              aria-label={`${item.file.name} 닫기`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      {/* 새 파일 열기 버튼 */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 flex items-center justify-center w-7 h-7 mb-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
        title="새 PDF 파일 열기"
        aria-label="새 PDF 파일 열기"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {/* 숨겨진 파일 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
