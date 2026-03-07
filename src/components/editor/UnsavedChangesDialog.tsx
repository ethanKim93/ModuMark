'use client';

import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface UnsavedChangesDialogProps {
  open: boolean;
  tabTitle: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export function UnsavedChangesDialog({
  open,
  tabTitle,
  onSave,
  onDiscard,
  onCancel,
}: UnsavedChangesDialogProps) {
  // @base-ui/react가 버튼 클릭 시에도 onOpenChange를 호출하는 경우를 방지하기 위한 플래그
  const actionTakenRef = useRef(false);

  const handleSave = () => {
    actionTakenRef.current = true;
    onSave();
  };

  const handleDiscard = () => {
    actionTakenRef.current = true;
    onDiscard();
  };

  const handleCancel = () => {
    actionTakenRef.current = true;
    onCancel();
  };

  return (
    // onOpenChange는 ESC / 배경 클릭 시에만 onCancel 호출
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
          <DialogTitle>미저장 변경사항</DialogTitle>
          <DialogDescription>
            &apos;{tabTitle}&apos;의 변경사항을 저장하시겠습니까?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded text-[13px] border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDiscard}
            className="px-3 py-1.5 rounded text-[13px] bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
          >
            저장 안 함
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            저장
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
