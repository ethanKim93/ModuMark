'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from '@/lib/pdf/pdfViewer';
import { DropZone } from './DropZone';
import { usePdfFileStore } from '@/stores/pdfFileStore';

interface PdfViewerProps {
  file?: File | null;
  /** 탭 ID: 제공 시 페이지/줌 상태를 스토어에 저장·복원 */
  fileId?: string;
  /** 사이드바 썸네일 클릭으로 페이지 이동 요청 (0-indexed, Task 5에서 연동) */
  currentPageIndex?: number;
  /** PDF 로드 완료 시 pdfDoc 전달 콜백 (사이드바 썸네일 생성에 사용) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPdfDocLoaded?: (doc: any) => void;
}

export function PdfViewer({ file, fileId, currentPageIndex, onPdfDocLoaded }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const setViewerState = usePdfFileStore((s) => s.setViewerState);
  const setCurrentPageStore = usePdfFileStore((s) => s.setCurrentPage);

  // 탭 전환 시 저장된 상태 복원 (마운트 시 1회만 읽음)
  const [currentPage, setCurrentPage] = useState(() => {
    if (!fileId) return 1;
    return usePdfFileStore.getState().viewerStates[fileId]?.currentPage ?? 1;
  });
  const [scale, setScale] = useState(() => {
    if (!fileId) return 1.2;
    return usePdfFileStore.getState().viewerStates[fileId]?.zoom ?? 1.2;
  });
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [internalFile, setInternalFile] = useState<File | null>(null);

  const activeFile = file ?? internalFile;

  /* PDF 특정 페이지를 canvas에 렌더링 */
  const renderPage = useCallback(async (doc: PDFDocumentProxy, pageNum: number, sc: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* 진행 중인 렌더 취소 */
    renderTaskRef.current?.cancel();

    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: sc });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const task = page.render({ canvasContext: ctx, viewport, canvas });
    renderTaskRef.current = task;

    try {
      await task.promise;
    } catch {
      /* 취소된 렌더는 무시 */
    }
  }, []);

  /* 파일 변경 시 PDF 로드 (scale은 deps에서 제외 — 줌 변경은 아래 effect에서 처리) */
  useEffect(() => {
    if (!activeFile) return;

    let cancelled = false;
    setLoading(true);

    const loadPdf = async () => {
      try {
        const arrayBuffer = await activeFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.destroy();
          return;
        }

        /* 이전 문서 해제 */
        pdfDocRef.current?.destroy();
        pdfDocRef.current = doc;

        setNumPages(doc.numPages);

        // 사이드바 썸네일 생성을 위해 pdfDoc 전달
        onPdfDocLoaded?.(doc);

        // 저장된 페이지 복원 (범위 초과 시 clamp)
        const savedPage = fileId
          ? (usePdfFileStore.getState().viewerStates[fileId]?.currentPage ?? 1)
          : 1;
        const validPage = Math.min(savedPage, doc.numPages);
        setCurrentPage(validPage);
        await renderPage(doc, validPage, scale);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
    };
    // scale 은 deps에서 의도적으로 제외 (파일 로드 시에만 실행)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, renderPage]);

  /* 페이지/줌 변경 시 재렌더 */
  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage, scale);
    }
  }, [currentPage, scale, renderPage]);

  /* 사이드바 썸네일 클릭 → currentPageIndex prop 변경 시 뷰어 페이지 이동 (0-indexed → 1-indexed) */
  useEffect(() => {
    if (currentPageIndex === undefined || !pdfDocRef.current || numPages === 0) return;
    const targetPage = currentPageIndex + 1;
    if (targetPage !== currentPage && targetPage >= 1 && targetPage <= numPages) {
      setCurrentPage(targetPage);
    }
    // currentPage는 deps에서 제외 — prop 변경 시에만 반응
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageIndex, numPages]);

  /* 상태 변경 시 스토어에 저장 */
  useEffect(() => {
    if (fileId) {
      setViewerState(fileId, { currentPage, zoom: scale });
    }
    // 뷰어 페이지 변경 → 스토어 동기화 (사이드바 하이라이트 연동)
    setCurrentPageStore(currentPage - 1);
  }, [fileId, currentPage, scale, setViewerState, setCurrentPageStore]);

  const SCALES = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 5.0];

  /* 현재 scale이 SCALES에 없으면(휠 줌으로 생성된 커스텀 값) 정렬 후 포함 */
  const displayScales = useMemo(
    () => (SCALES.includes(scale) ? SCALES : [...SCALES, scale].sort((a, b) => a - b)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scale]
  );

  /* 페이지 전환 시 컨테이너 스크롤 위치 초기화 */
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  /* 마우스 휠 핸들러 — canvas 위: 줌, 바깥: 페이지 이동 */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || !pdfDocRef.current) return;

      const target = e.target as Node;
      const isOverCanvas = canvas.contains(target) || target === canvas;

      if (isOverCanvas) {
        /* canvas 위: 휠로 줌 */
        e.preventDefault();
        setScale((prev) => {
          const next = e.deltaY > 0 ? prev * 0.9 : prev * 1.1;
          return Math.min(5.0, Math.max(0.25, next));
        });
      } else {
        /* canvas 바깥: 스크롤 끝에서 페이지 이동 (300ms 쓰로틀) */
        const { scrollTop, clientHeight, scrollHeight } = container;
        const atTop = scrollTop === 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
          const now = Date.now();
          if (now - lastWheelTimeRef.current < 300) return;
          lastWheelTimeRef.current = now;

          e.preventDefault();
          if (e.deltaY < 0) {
            setCurrentPage((p) => Math.max(1, p - 1));
          } else {
            setCurrentPage((p) => Math.min(numPages, p + 1));
          }
        }
      }
    },
    [numPages]
  );

  /* 휠 이벤트 리스너 등록 (passive:false → preventDefault 가능) */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  if (!activeFile) {
    return (
      <DropZone
        onDrop={(files) => setInternalFile(files[0])}
        label="PDF 파일을 드래그하거나 클릭하여 뷰어에서 열기"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 컨트롤 바 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0 flex-wrap">
        <span className="text-[13px] text-foreground font-medium truncate max-w-[200px]">
          {activeFile.name}
        </span>

        {/* 페이지 이동 */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-2 py-1 rounded text-[13px] bg-surface-secondary hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <span className="text-[13px] text-muted-foreground tabular-nums px-1">
            {currentPage} / {numPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            className="px-2 py-1 rounded text-[13px] bg-surface-secondary hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>

        {/* 줌 */}
        <select
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="text-[13px] bg-surface-secondary border border-border rounded px-2 py-1 text-foreground"
        >
          {displayScales.map((s) => (
            <option key={s} value={s}>
              {Math.round(s * 100)}%
            </option>
          ))}
        </select>

        <button
          onClick={() => { pdfDocRef.current?.destroy(); pdfDocRef.current = null; setInternalFile(null); setNumPages(0); }}
          className="text-[13px] text-muted-foreground hover:text-destructive transition-colors ml-1"
          title="닫기"
        >
          ✕
        </button>
      </div>

      {/* 캔버스 영역 */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center bg-background p-4">
        {loading && (
          <div className="flex items-center justify-center w-full">
            <p className="text-[14px] text-muted-foreground">로딩 중...</p>
          </div>
        )}
        {/* canvas를 항상 DOM에 유지 — loading 중에는 hidden 처리하여 canvasRef가 null이 되지 않도록 함 */}
        <canvas
          ref={canvasRef}
          className={`shadow-lg rounded${loading ? ' hidden' : ''}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}
