'use client';

import { Code, Eye } from 'lucide-react';

export type MarkdownEditorMode = 'wysiwyg' | 'raw';

interface ModeToggleProps {
  mode: MarkdownEditorMode;
  onToggle: (mode: MarkdownEditorMode) => void;
}

/**
 * WYSIWYG ↔ Raw 모드 전환 토글 버튼
 */
export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const isRaw = mode === 'raw';

  return (
    <button
      onClick={() => onToggle(isRaw ? 'wysiwyg' : 'raw')}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
      title={isRaw ? '미리보기 모드로 전환' : '코드 모드로 전환'}
    >
      {isRaw ? (
        <>
          <Eye className="h-3.5 w-3.5" />
          미리보기
        </>
      ) : (
        <>
          <Code className="h-3.5 w-3.5" />
          코드
        </>
      )}
    </button>
  );
}
