'use client';

import React, { useState } from 'react';
import { Save, FileDown, FolderOpen } from 'lucide-react';
import { useTabStore } from '@/stores/tabStore';
import { openMarkdownFile, saveMarkdownFile } from '@/lib/fileSystem';
import { markdownToPdf } from '@/lib/pdf/markdownToPdf';
import { downloadPdf } from '@/lib/pdf/downloadPdf';
import { DownloadDialog } from '@/components/pdf/DownloadDialog';

interface MarkdownToolbarProps {
  children?: React.ReactNode;
}

export function MarkdownToolbar({ children }: MarkdownToolbarProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const { openTab } = useTabStore();

  const handleOpenFile = async () => {
    const result = await openMarkdownFile();
    if (!result) return;
    openTab({
      title: result.name,
      content: result.content,
      isDirty: false,
      fileHandle: result.handle ?? undefined,
    });
  };

  const handleSave = async () => {
    const store = useTabStore.getState();
    const tab = store.getActiveTab();
    if (!tab || isSaving) return;

    setIsSaving(true);
    try {
      const result = await saveMarkdownFile(tab.content, tab.fileHandle ?? null);
      if (result) {
        store.setFileHandle(tab.id, result.handle, result.name);
      } else {
        /* 폴백 다운로드 — isDirty는 유지 */
        store.setDirty(tab.id, false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdfClick = () => {
    const tab = useTabStore.getState().getActiveTab();
    if (!tab || isExporting) return;
    setIsPdfDialogOpen(true);
  };

  const handleExportPdfConfirm = async (filename: string) => {
    setIsPdfDialogOpen(false);
    const tab = useTabStore.getState().getActiveTab();
    if (!tab) return;

    setIsExporting(true);
    try {
      const bytes = await markdownToPdf(tab.content, { title: tab.title });

      /* showSaveFilePicker 지원 시 OS 파일 저장 다이얼로그 표시 */
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const fileHandle = await (window as Window & { showSaveFilePicker: (opts?: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'PDF 문서', accept: { 'application/pdf': ['.pdf'] } }],
          });
          const writable = await fileHandle.createWritable();
          const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
          await writable.write(new Blob([ab], { type: 'application/pdf' }));
          await writable.close();
          return;
        } catch (pickerErr) {
          /* 사용자가 취소한 경우 (AbortError) 무시 */
          if (pickerErr instanceof Error && pickerErr.name === 'AbortError') return;
          /* 그 외 오류: 폴백으로 계속 */
        }
      }

      /* 폴백: 자동 다운로드 */
      downloadPdf(bytes, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF 변환 중 오류가 발생했습니다.';
      alert(`PDF 내보내기 실패: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-surface shrink-0">
      <button
        onClick={handleOpenFile}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
        title="파일 열기"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        파일 열기
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="저장 (Ctrl+S)"
      >
        <Save className="h-3.5 w-3.5" />
        {isSaving ? '저장 중...' : '저장'}
      </button>

      <div className="w-px h-4 bg-border mx-0.5" />

      <button
        onClick={handleExportPdfClick}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="PDF로 내보내기"
      >
        <FileDown className="h-3.5 w-3.5" />
        {isExporting ? '변환 중...' : 'PDF 내보내기'}
      </button>

      {/* 추가 툴바 항목 (모드 토글 등) */}
      {children}

      {/* PDF 내보내기 파일명 입력 다이얼로그 */}
      <PdfExportDialogWrapper
        open={isPdfDialogOpen}
        onConfirm={handleExportPdfConfirm}
        onCancel={() => setIsPdfDialogOpen(false)}
      />
    </div>
  );
}

/** 활성 탭 제목 기반으로 기본 파일명을 계산하여 DownloadDialog에 전달 */
function PdfExportDialogWrapper({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: (filename: string) => void;
  onCancel: () => void;
}) {
  const tabs = useTabStore((s) => s.tabs);
  const activeTabId = useTabStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const defaultFilename = (activeTab?.title ?? '문서').replace(/\.md$/i, '');

  return (
    <DownloadDialog
      open={open}
      defaultFilename={defaultFilename}
      description="PDF로 저장할 파일명을 입력하세요."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
