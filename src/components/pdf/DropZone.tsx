'use client';

import { useRef, useState, DragEvent } from 'react';

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
}

export function DropZone({ onDrop, accept = 'application/pdf', multiple = false, label }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) =>
      accept === 'application/pdf' ? f.type === 'application/pdf' || f.name.endsWith('.pdf') : true
    );
    if (files.length > 0) onDrop(files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDropEvent = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDropEvent}
      className={[
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface hover:border-primary/50 hover:bg-surface-secondary',
      ].join(' ')}
    >
      <p className="text-[14px] text-muted-foreground text-center">
        {label ?? 'PDF 파일을 드래그하거나 클릭하여 선택하세요'}
      </p>
      <p className="text-[12px] text-muted-foreground/60">PDF 형식만 지원</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
