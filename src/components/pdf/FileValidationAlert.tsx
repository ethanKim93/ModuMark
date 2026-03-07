'use client';

import { AlertCircle, X } from 'lucide-react';

interface FileValidationAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export function FileValidationAlert({ error, onDismiss }: FileValidationAlertProps) {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-destructive">파일 오류</p>
        <p className="text-[13px] text-destructive/80 mt-0.5">{error}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded text-destructive/60 hover:text-destructive transition-colors"
        aria-label="닫기"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
