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
import { mergePdfs, PdfMergeError } from '@/lib/pdf/pdfMerge';
import { downloadPdf } from '@/lib/pdf/downloadPdf';
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
    mergeFiles: storeMergeFiles,
    addMergeFile,
    removeMergeFile,
    clearMergeFiles,
    setCurrentPage,
    currentPageIndex,
  } = usePdfFileStore();

  // 파일 추가(병합용) 숨겨진 input 참조
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // 사이드바에 전달할 pdfDoc (Task 5에서 PdfViewer로부터 콜백으로 연결)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);

  // 다이얼로그 열림 상태
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [compressDialogOpen, setCompressDialogOpen] = useState(false);
  const [ocrDialogOpen, setOcrDialogOpen] = useState(false);

  // 병합 흐름 상태 (pdfFileStore.mergeFiles 기반)
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

  const handleSplit = () => setSplitDialogOpen(true);
  const handleCompress = () => setCompressDialogOpen(true);
  const handleOcr = () => setOcrDialogOpen(true);
  const handleAddFile = () => addFileInputRef.current?.click();

  /* 병합용 파일 추가 input 핸들러 */
  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      addMergeFile({ id: crypto.randomUUID(), file, name: file.name, pageCount: 0 });
    });
    e.target.value = '';
  };

  // 사이드바 페이지 변경 핸들러 (Task 5에서 뷰어 스크롤 동기화 추가)
  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  // activeFile 변경 시 pdfDoc 초기화
  useEffect(() => {
    setPdfDoc(null);
  }, [activeFile]);

  // 병합 실행: activeFile + pdfFileStore.mergeFiles를 하나로 합치기
  const handleMergeSave = useCallback(async () => {
    if (!activeFile || storeMergeFiles.length === 0) return;
    setMergeError(null);
    setMergeLoading(true);
    setMergeProgress(0);

    try {
      const allFiles = [activeFile, ...storeMergeFiles.map((e) => e.file)];
      const bytes = await mergePdfs(allFiles, (p, s) => {
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
  }, [activeFile, storeMergeFiles]);

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
          clearMergeFiles();
        }}
        onCancel={() => {
          setMergeDownloadOpen(false);
          setPendingMergeBytes(null);
        }}
      />

      {/* 메인 레이아웃: 통합 사이드바 + 콘텐츠 영역 */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* 통합 PDF 사이드바 (뷰어 페이지 네비게이션 + 병합 파일 목록) */}
        <UnifiedPdfSidebar
          pdfDoc={pdfDoc}
          onPageChange={handlePageChange}
          onMerge={handleMergeSave}
          isMerging={mergeLoading}
        />

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 파일 탭 바 (2개 이상일 때만 표시) */}
          <PdfFileTabs
            files={viewerFiles}
            activeFileId={activeViewerFileId}
            onSelect={setActiveViewerFileId}
            onClose={closeViewerFile}
          />

          {/* 액션 버튼 툴바 */}
          <PdfActionToolbar
            hasFile={!!activeFile}
            onSplit={handleSplit}
            onCompress={handleCompress}
            onOcr={handleOcr}
            onAddFile={handleAddFile}
          />

          {/* 병합용 숨겨진 파일 input (툴바 [파일 추가] 버튼용) */}
          <input
            ref={addFileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="sr-only"
            onChange={handleAddFileChange}
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
                  onPdfDocLoaded={setPdfDoc}
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
