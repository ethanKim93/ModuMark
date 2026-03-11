'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PdfViewer } from './PdfViewer';
import { PdfFileTabs } from './PdfFileTabs';
import { PdfActionToolbar } from './PdfActionToolbar';
import { DropZone } from './DropZone';
import { ProcessingProgress } from './ProcessingProgress';
import { DownloadDialog } from './DownloadDialog';
import { SplitDialog } from './dialogs/SplitDialog';
import { CompressDialog } from './dialogs/CompressDialog';
import { OcrDialog } from './dialogs/OcrDialog';
import UnifiedPdfSidebar from './UnifiedPdfSidebar';
import { mergePagesPdf, MergePageSpec, PdfMergeError } from '@/lib/pdf/pdfMerge';
import { downloadPdf } from '@/lib/pdf/downloadPdf';
import { extractPages } from '@/lib/pdf/extractPages';
import { usePdfFileStore } from '@/stores/pdfFileStore';

export function PdfEditor() {
  const {
    undo,
    activeFile,
    setActiveFile,
    viewerFiles,
    activeViewerFileId,
    closeViewerFile,
    setActiveViewerFileId,
    setCurrentPage,
    currentPageIndex,
    clearAll,
    pages,
    files,
  } = usePdfFileStore();

  // 페이지 추가용 숨겨진 input 참조
  const addPagesInputRef = useRef<HTMLInputElement>(null);

  // 다이얼로그 열림 상태
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [compressDialogOpen, setCompressDialogOpen] = useState(false);
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false);

  // 병합 흐름 상태
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergeProgressStatus, setMergeProgressStatus] = useState('');
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [pendingMergeBytes, setPendingMergeBytes] = useState<Uint8Array | null>(null);
  const [mergeDownloadOpen, setMergeDownloadOpen] = useState(false);

  // Ctrl+Z 키보드 단축키로 Undo 실행
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo]);

  // activeFile 변경 시 pages 초기화 후 extractPages 자동 실행
  useEffect(() => {
    if (!activeFile) return;

    // 탭 전환 시 이미 해당 탭 스냅샷이 복원된 경우 재추출 불필요
    // (activeViewerFileId 기준 tabPages 스냅샷이 있으면 스킵)
    // extractPages는 pages가 비어 있을 때만 실행
    if (pages.length > 0) return;

    const fileItem = files.find((f) => f.file.name === activeFile.name);
    if (!fileItem) {
      // addFiles 없이 setActiveFile만 호출된 경우 직접 fileItem 생성
      const newFileItem = { id: crypto.randomUUID(), file: activeFile };
      extractPages(newFileItem).catch(() => {
        // 페이지 추출 실패 무시
      });
    } else {
      extractPages(fileItem).catch(() => {
        // 페이지 추출 실패 무시
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  const handleSplit = () => setSplitDialogOpen(true);
  const handleCompress = () => setCompressDialogOpen(true);
  const handleOcr = () => setOcrDialogOpen(true);
  const handleAddPages = () => addPagesInputRef.current?.click();

  // 사이드바 페이지 변경 핸들러
  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  /* 페이지 추가 input 핸들러: 새 파일의 페이지를 기존 pages에 append */
  const handleAddPagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    for (const file of selectedFiles) {
      const newFileItem = { id: crypto.randomUUID(), file };
      // files 배열에 먼저 등록해야 병합 시 fileId로 올바른 파일을 찾을 수 있음
      const { files: currentFiles } = usePdfFileStore.getState();
      usePdfFileStore.setState({ files: [...currentFiles, newFileItem] });
      await extractPages(newFileItem).catch(() => {
        // 개별 파일 추출 실패 무시
      });
    }
    e.target.value = '';
  };

  /* 병합 저장: pages 배열 순서대로 MergePageSpec 구성 후 mergePagesPdf 호출 */
  const handleMergeSave = useCallback(async () => {
    if (pages.length === 0) return;
    setMergeError(null);
    setMergeLoading(true);
    setMergeProgress(0);

    try {
      // pages 순서대로 파일 참조 구성
      const specs: MergePageSpec[] = pages.map((p) => {
        const fileItem = files.find((f) => f.id === p.fileId);
        return {
          file: fileItem?.file ?? activeFile!,
          pageIndex: p.pageIndex,
        };
      });

      const bytes = await mergePagesPdf(specs, (p, s) => {
        setMergeProgress(p);
        setMergeProgressStatus(s);
      });
      setPendingMergeBytes(bytes);
      setMergeDownloadOpen(true);
    } catch (err) {
      if (err instanceof PdfMergeError) {
        setMergeError(err.message);
      } else {
        setMergeError('병합 중 오류가 발생했습니다.');
      }
    } finally {
      setMergeLoading(false);
      setMergeProgress(0);
    }
  }, [pages, files, activeFile]);

  /* 새 파일 열기 (PdfFileTabs "+" 버튼) */
  const handleOpenFile = useCallback((file: File) => {
    setActiveFile(file);
  }, [setActiveFile]);

  const mergeDefaultFilename = activeFile
    ? `${activeFile.name.replace(/\.pdf$/i, '')}_merged`
    : 'merged';

  return (
    <>
      {/* 분할 다이얼로그 */}
      {activeFile && splitDialogOpen && (
        <SplitDialog
          open={splitDialogOpen}
          onClose={() => setSplitDialogOpen(false)}
          file={activeFile}
        />
      )}

      {/* 압축 다이얼로그 */}
      {activeFile && compressDialogOpen && (
        <CompressDialog
          open={compressDialogOpen}
          onClose={() => setCompressDialogOpen(false)}
          file={activeFile}
        />
      )}

      {/* OCR 다이얼로그 */}
      {activeFile && ocrDialogOpen && (
        <OcrDialog
          open={ocrDialogOpen}
          onClose={() => setOcrDialogOpen(false)}
          file={activeFile}
        />
      )}

      {/* 병합 저장 다운로드 다이얼로그 */}
      <DownloadDialog
        open={mergeDownloadOpen}
        defaultFilename={mergeDefaultFilename}
        description="병합된 PDF의 파일명을 입력하세요."
        onConfirm={(filename) => {
          setMergeDownloadOpen(false);
          if (pendingMergeBytes) downloadPdf(pendingMergeBytes, filename);
          setPendingMergeBytes(null);
          clearAll();
        }}
        onCancel={() => {
          setMergeDownloadOpen(false);
          setPendingMergeBytes(null);
        }}
      />

      {/* 메인 레이아웃: 통합 사이드바 + 콘텐츠 영역 */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* 통합 PDF 사이드바 (페이지 단위 썸네일 리스트) */}
        <UnifiedPdfSidebar
          onMergeSave={handleMergeSave}
          onAddPages={handleAddPages}
          isMerging={mergeLoading}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 파일 탭 바 */}
          <PdfFileTabs
            files={viewerFiles}
            activeFileId={activeViewerFileId}
            onSelect={setActiveViewerFileId}
            onClose={closeViewerFile}
            onOpenFile={handleOpenFile}
          />

          {/* 액션 버튼 툴바 */}
          <PdfActionToolbar
            hasFile={!!activeFile}
            onSplit={handleSplit}
            onCompress={handleCompress}
            onOcr={handleOcr}
          />

          {/* 페이지 추가 숨겨진 파일 input */}
          <input
            ref={addPagesInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="sr-only"
            onChange={handleAddPagesChange}
          />

          {/* 병합 진행률 */}
          {mergeLoading && (
            <div className="px-4 py-2 shrink-0 border-b border-border">
              <ProcessingProgress
                progress={mergeProgress}
                status={mergeProgressStatus}
                isVisible={mergeLoading}
              />
            </div>
          )}

          {/* 병합 오류 */}
          {mergeError && (
            <p className="px-4 py-1 text-xs text-destructive shrink-0">{mergeError}</p>
          )}

          {/* 뷰어 영역 */}
          <div className="flex-1 overflow-auto flex flex-col">
            {activeFile ? (
              /* 메인 PDF 뷰어 — key로 탭 전환 시 새 인스턴스 마운트 */
              <div className="flex-1 min-h-0 overflow-hidden">
                <PdfViewer
                  key={activeViewerFileId ?? undefined}
                  file={activeFile}
                  fileId={activeViewerFileId ?? undefined}
                  currentPageIndex={currentPageIndex}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-xl">
                  <DropZone
                    onDrop={(droppedFiles) => {
                      const first = droppedFiles[0];
                      if (first) setActiveFile(first);
                    }}
                    multiple={false}
                    label="PDF 파일을 드래그하거나 클릭하여 열기"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
