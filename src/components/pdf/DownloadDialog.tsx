'use client';

import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface DownloadDialogProps {
  open: boolean;
  defaultFilename: string;
  description?: string;
  onConfirm: (filename: string) => void;
  onCancel: () => void;
}

export function DownloadDialog({
  open,
  defaultFilename,
  description,
  onConfirm,
  onCancel,
}: DownloadDialogProps) {
  const [filename, setFilename] = useState(defaultFilename);
  const actionTakenRef = useRef(false);

  // open이 바뀔 때마다 기본값 동기화
  const prevOpenRef = useRef(open);
  if (prevOpenRef.current !== open) {
    prevOpenRef.current = open;
    if (open) setFilename(defaultFilename);
  }

  const handleConfirm = () => {
    actionTakenRef.current = true;
    // 공백이면 기본값 사용, .pdf 확장자 자동 추가
    const name = (filename.trim() || defaultFilename).replace(/\.pdf$/i, '');
    onConfirm(`${name}.pdf`);
  };

  const handleCancel = () => {
    actionTakenRef.current = true;
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !actionTakenRef.current) {
          onCancel();
        }
        actionTakenRef.current = false;
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>파일 저장</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-2">
          <label className="block text-[13px] text-muted-foreground mb-1.5">
            파일명
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              className="flex-1 px-3 py-1.5 text-[13px] bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <span className="text-[13px] text-muted-foreground shrink-0">.pdf</span>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded text-[13px] border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            다운로드
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
