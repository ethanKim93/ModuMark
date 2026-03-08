'use client';

import { useState } from 'react';
import { Save, FileDown, FolderOpen } from 'lucide-react';
import { useTabStore } from '@/stores/tabStore';
import { openMarkdownFile, saveMarkdownFile } from '@/lib/fileSystem';
import { markdownToPdf } from '@/lib/pdf/markdownToPdf';
import { downloadPdf } from '@/lib/pdf/downloadPdf';

export function EditorToolbar() {
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExportPdf = async () => {
    const tab = useTabStore.getState().getActiveTab();
    if (!tab || isExporting) return;

    setIsExporting(true);
    try {
      const bytes = await markdownToPdf(tab.content, { title: tab.title });
      downloadPdf(bytes, tab.title.replace(/\.md$/i, '') + '.pdf');
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
        onClick={handleExportPdf}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="PDF로 내보내기"
      >
        <FileDown className="h-3.5 w-3.5" />
        {isExporting ? '변환 중...' : 'PDF 내보내기'}
      </button>

    </div>
  );
}
