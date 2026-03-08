'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FilePlus2, Merge, Trash2, Undo2, Scissors } from 'lucide-react';
import { DropZone } from './DropZone';
import { PdfPageViewer } from './PdfPageViewer';
import { FileValidationAlert } from './FileValidationAlert';
import { ProcessingProgress } from './ProcessingProgress';
import { DownloadDialog } from './DownloadDialog';
import { mergePagesPdf, MergePageSpec, PdfMergeError } from '@/lib/pdf/pdfMerge';
import { downloadPdf } from '@/lib/pdf/downloadPdf';
import { extractPages } from '@/lib/pdf/extractPages';
import { usePdfFileStore } from '@/stores/pdfFileStore';

export function PdfEditor() {
  const { pages, files, addFiles, clearAll, undo, history, selectedPageIds } = usePdfFileStore();
  const canUndo = history.length > 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [pendingBytes, setPendingBytes] = useState<Uint8Array | null>(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadMode, setDownloadMode] = useState<'merge' | 'extract'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ctrl+Z 키보드 단축키로 Undo 실행
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // 입력 필드에 포커스가 있을 때는 기본 동작 유지
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  const handleAddFiles = useCallback(async (newFiles: File[]) => {
    setError(null);

    // 중복 파일명 감지
    const currentFiles = usePdfFileStore.getState().files;
    const existingNames = new Set(currentFiles.map((f) => f.file.name));
    const duplicates = newFiles.filter((f) => existingNames.has(f.name));
    const uniqueFiles = newFiles.filter((f) => !existingNames.has(f.name));

    if (duplicates.length > 0 && uniqueFiles.length === 0) {
      setError(`이미 추가된 파일입니다: ${duplicates.map((f) => f.name).join(', ')}`);
      return;
    }
    if (duplicates.length > 0) {
      setError(`다음 파일은 이미 추가되어 건너뜁니다: ${duplicates.map((f) => f.name).join(', ')}`);
    }

    // 추가 전 기존 파일 ID 기록
    const beforeIds = new Set(usePdfFileStore.getState().files.map((f) => f.id));
    const addErr = addFiles(uniqueFiles);
    if (addErr) { setError(addErr); return; }

    // 실제로 추가된 파일 항목만 페이지 추출
    const afterFiles = usePdfFileStore.getState().files;
    const newFileItems = afterFiles.filter((f) => !beforeIds.has(f.id));
    const failedFiles: string[] = [];
    for (const fileItem of newFileItems) {
      try {
        await extractPages(fileItem);
      } catch (err) {
        console.error(`페이지 추출 실패: ${fileItem.file.name}`, err);
        failedFiles.push(fileItem.file.name);
      }
    }
    if (failedFiles.length > 0) {
      setError(`페이지 추출에 실패했습니다: ${failedFiles.join(', ')}`);
    }
  }, [addFiles]);

  // 전체 페이지 병합
  const handleMerge = async () => {
    if (pages.length < 2) {
      setError('병합할 페이지를 2개 이상 추가하세요.');
      return;
    }

    const specs: MergePageSpec[] = pages
      .map((p) => {
        const fileItem = files.find((f) => f.id === p.fileId);
        return fileItem ? { file: fileItem.file, pageIndex: p.pageIndex } : null;
      })
      .filter((s): s is MergePageSpec => s !== null);

    setLoading(true);
    setError(null);
    setProgress(0);
    setDownloadMode('merge');

    try {
      const bytes = await mergePagesPdf(specs, (p, s) => {
        setProgress(p);
        setProgressStatus(s);
      });
      setPendingBytes(bytes);
      setDownloadDialogOpen(true);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      if (err instanceof PdfMergeError) {
        setError(err.message);
      } else {
        setError('병합 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // 선택된 페이지 추출
  const handleExtract = async () => {
    const selectedIds = usePdfFileStore.getState().selectedPageIds;
    if (selectedIds.size === 0) return;

    // 현재 페이지 순서 기준으로 선택된 페이지 필터링
    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const specs: MergePageSpec[] = selectedPages
      .map((p) => {
        const fileItem = files.find((f) => f.id === p.fileId);
        return fileItem ? { file: fileItem.file, pageIndex: p.pageIndex } : null;
      })
      .filter((s): s is MergePageSpec => s !== null);

    setLoading(true);
    setError(null);
    setProgress(0);
    setDownloadMode('extract');

    try {
      const bytes = await mergePagesPdf(specs, (p, s) => {
        setProgress(p);
        setProgressStatus(s);
      });
      setPendingBytes(bytes);
      setDownloadDialogOpen(true);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      if (err instanceof PdfMergeError) {
        setError(err.message);
      } else {
        setError('페이지 추출 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const defaultMergeFilename =
    files.length > 0 ? `${files[0].file.name.replace(/\.pdf$/i, '')}_merged` : 'merged';
  const defaultExtractFilename = 'extracted_pages';

  const defaultFilename = downloadMode === 'merge' ? defaultMergeFilename : defaultExtractFilename;
  const downloadDescription =
    downloadMode === 'merge'
      ? '병합된 PDF의 파일명을 입력하세요.'
      : '추출된 페이지 PDF의 파일명을 입력하세요.';

  return (
    <>
      <DownloadDialog
        open={downloadDialogOpen}
        defaultFilename={defaultFilename}
        description={downloadDescription}
        onConfirm={(filename) => {
          setDownloadDialogOpen(false);
          if (pendingBytes) downloadPdf(pendingBytes, filename);
          setPendingBytes(null);
        }}
        onCancel={() => {
          setDownloadDialogOpen(false);
          setPendingBytes(null);
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <div className="border-b border-border px-4 sm:px-6 py-4 bg-surface shrink-0 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-foreground">PDF 도구</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {pages.length > 0
                ? selectedPageIds.size > 0
                  ? `${selectedPageIds.size}페이지 선택됨 · ${pages.length}페이지 전체`
                  : `${pages.length}페이지 · 사이드바에서 순서 변경 및 삭제 가능`
                : '여러 PDF를 하나로 합치거나 원하는 페이지를 추출합니다. 최대 20개 파일, 100MB.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 파일 추가 버튼 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-[13px] text-foreground transition-colors"
            >
              <FilePlus2 className="h-4 w-4" />
              <span className="hidden sm:inline">파일 추가</span>
            </button>

            {/* Undo 버튼 */}
            {canUndo && (
              <button
                onClick={undo}
                title="실행 취소 (Ctrl+Z)"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-[13px] text-foreground transition-colors"
              >
                <Undo2 className="h-4 w-4" />
                <span className="hidden sm:inline">실행 취소</span>
              </button>
            )}

            {/* 전체 제거 */}
            {pages.length > 0 && (
              <button
                onClick={() => { clearAll(); setError(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-[13px] text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">전체 제거</span>
              </button>
            )}

            {/* 선택 추출 버튼 */}
            {selectedPageIds.size > 0 && (
              <button
                onClick={handleExtract}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-[13px] font-medium hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Scissors className="h-4 w-4" />
                {loading && downloadMode === 'extract' ? '추출 중...' : `${selectedPageIds.size}페이지 추출`}
              </button>
            )}

            {/* 병합 버튼 */}
            <button
              onClick={handleMerge}
              disabled={pages.length < 2 || loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Merge className="h-4 w-4" />
              {loading && downloadMode === 'merge' ? '병합 중...' : 'PDF 병합'}
            </button>
          </div>
        </div>

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            handleAddFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />

        {/* 에러 / 진행 상태 */}
        <FileValidationAlert error={error} onDismiss={() => setError(null)} />
        <ProcessingProgress progress={progress} status={progressStatus} isVisible={loading} />

        {/* 메인 영역 */}
        {pages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xl">
              <DropZone
                onDrop={handleAddFiles}
                multiple
                label="PDF 파일을 드래그하거나 클릭하여 추가"
              />
            </div>
          </div>
        ) : (
          <PdfPageViewer onDrop={handleAddFiles} />
        )}
      </div>
    </>
  );
}
