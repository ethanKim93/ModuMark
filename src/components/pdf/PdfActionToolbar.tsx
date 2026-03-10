'use client';

import { Scissors, Minimize2, ScanText } from 'lucide-react';

interface PdfActionToolbarProps {
  hasFile: boolean;
  onSplit: () => void;
  onCompress: () => void;
  onOcr: () => void;
}

/** 뷰어 상단 액션 버튼 툴바. 파일이 없으면 버튼 비활성화 */
export function PdfActionToolbar({ hasFile, onSplit, onCompress, onOcr }: PdfActionToolbarProps) {
  const btnBase =
    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-[13px] font-medium transition-colors';
  const btnActive = 'bg-surface hover:bg-surface-secondary text-foreground';
  const btnDisabled = 'opacity-40 cursor-not-allowed bg-surface text-muted-foreground';

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface shrink-0">
      {/* 분할 */}
      <button
        onClick={onSplit}
        disabled={!hasFile}
        className={`${btnBase} ${hasFile ? btnActive : btnDisabled}`}
        title="PDF 분할"
      >
        <Scissors className="h-4 w-4" />
        <span className="hidden sm:inline">분할</span>
      </button>

      {/* 압축 */}
      <button
        onClick={onCompress}
        disabled={!hasFile}
        className={`${btnBase} ${hasFile ? btnActive : btnDisabled}`}
        title="PDF 압축"
      >
        <Minimize2 className="h-4 w-4" />
        <span className="hidden sm:inline">압축</span>
      </button>

      {/* OCR */}
      <button
        onClick={onOcr}
        disabled={!hasFile}
        className={`${btnBase} ${hasFile ? btnActive : btnDisabled}`}
        title="OCR 텍스트 추출"
      >
        <ScanText className="h-4 w-4" />
        <span className="hidden sm:inline">OCR</span>
      </button>
    </div>
  );
}
