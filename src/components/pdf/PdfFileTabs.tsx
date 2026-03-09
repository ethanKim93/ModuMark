'use client';

import { X } from 'lucide-react';
import type { ViewerFileItem } from '@/stores/pdfFileStore';

interface PdfFileTabsProps {
  files: ViewerFileItem[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

/** 여러 PDF 파일을 브라우저 탭처럼 표시하는 탭 바. 단일 파일일 때는 렌더링하지 않음 */
export function PdfFileTabs({ files, activeFileId, onSelect, onClose }: PdfFileTabsProps) {
  // 파일이 2개 미만이면 탭 바 숨김
  if (files.length < 2) return null;

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
    </div>
  );
}
