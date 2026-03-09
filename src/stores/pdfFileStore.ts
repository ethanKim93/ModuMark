import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { PDF_MAX_TOTAL_SIZE } from '@/lib/pdf/pdfMerge';

export interface PdfFileItem {
  id: string;
  file: File;
}

/** 통합 사이드바 하단 병합 대상 파일 항목 */
export interface MergeFileEntry {
  id: string;
  file: File;
  name: string;
  pageCount: number;
}

/** 뷰어 탭에 열린 파일 항목 */
export interface ViewerFileItem {
  id: string;
  file: File;
}

/** 탭별 뷰어 상태 (현재 페이지, 줌 레벨) */
export interface ViewerState {
  currentPage: number;
  zoom: number;
}

export interface PdfPageItem {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number;    // 0-based
  pageLabel: string;    // "파일명 p.3" 표시용
  thumbnail: string | null;
}

interface HistoryEntry {
  files: PdfFileItem[];
  pages: PdfPageItem[];
}

const MAX_HISTORY = 30;

interface PdfFileStore {
  files: PdfFileItem[];
  pages: PdfPageItem[];
  activePageId: string | null;
  /** 뷰어·OCR·압축이 공유하는 단일 파일 컨텍스트 */
  activeFile: File | null;
  /** 뷰어 탭에 열린 파일 목록 (파일 탭 UI용) */
  viewerFiles: ViewerFileItem[];
  /** 현재 활성 뷰어 탭 ID */
  activeViewerFileId: string | null;
  /** 탭 ID → 뷰어 상태 (페이지, 줌) 맵 */
  viewerStates: Record<string, ViewerState>;
  history: HistoryEntry[];
  selectedPageIds: Set<string>;
  /** 통합 사이드바: 현재 뷰어 페이지 인덱스 (0-indexed) */
  currentPageIndex: number;
  /** 통합 사이드바: 너비 (200~400px) */
  sidebarWidth: number;
  /** 통합 사이드바 하단: 병합 대상 파일 목록 */
  mergeFiles: MergeFileEntry[];
  setActiveFile: (file: File | null) => void;
  clearActiveFile: () => void;
  /** 뷰어 탭 닫기 (이전/다음 탭으로 자동 포커스) */
  closeViewerFile: (id: string) => void;
  /** 뷰어 탭 전환 */
  setActiveViewerFileId: (id: string) => void;
  /** 탭 뷰어 상태 업데이트 (부분 갱신 가능) */
  setViewerState: (fileId: string, state: Partial<ViewerState>) => void;
  addFiles: (newFiles: File[]) => string | null;
  addPages: (newPages: PdfPageItem[]) => void;
  removePage: (pageId: string) => void;
  reorderPages: (activeId: string, overId: string) => void;
  clearAll: () => void;
  setPageThumbnail: (pageId: string, dataUrl: string) => void;
  setActivePageId: (id: string | null) => void;
  undo: () => void;
  togglePageSelection: (pageId: string) => void;
  selectAllPages: () => void;
  deselectAllPages: () => void;
  selectPageRange: (startId: string, endId: string) => void;
  /** 사이드바 현재 페이지 설정 */
  setCurrentPage: (index: number) => void;
  /** 사이드바 너비 설정 (200~400 clamp) */
  setSidebarWidth: (width: number) => void;
  /** 병합 파일 추가 (최대 19개, 합산 100MB 제한) */
  addMergeFile: (entry: MergeFileEntry) => string | null;
  /** 병합 파일 제거 */
  removeMergeFile: (id: string) => void;
  /** 병합 파일 순서 변경 (dnd-kit) */
  reorderMergeFiles: (activeId: string, overId: string) => void;
  /** 병합 파일 목록 초기화 */
  clearMergeFiles: () => void;
}

export const usePdfFileStore = create<PdfFileStore>((set, get) => ({
  files: [],
  pages: [],
  activePageId: null,
  activeFile: null,
  viewerFiles: [],
  activeViewerFileId: null,
  viewerStates: {},
  history: [],
  selectedPageIds: new Set<string>(),
  currentPageIndex: 0,
  sidebarWidth: 260,
  mergeFiles: [],

  setActiveFile: (file) => {
    if (!file) {
      set({ activeFile: null });
      return;
    }
    const { viewerFiles } = get();
    // 동일 파일명이 이미 탭에 있으면 해당 탭 활성화
    const existing = viewerFiles.find((vf) => vf.file.name === file.name);
    if (existing) {
      set({ activeFile: file, activeViewerFileId: existing.id });
    } else {
      const newItem: ViewerFileItem = { id: crypto.randomUUID(), file };
      set({
        activeFile: file,
        viewerFiles: [...viewerFiles, newItem],
        activeViewerFileId: newItem.id,
      });
    }
  },

  clearActiveFile: () => set({ activeFile: null, activeViewerFileId: null }),

  closeViewerFile: (id) =>
    set((s) => {
      const idx = s.viewerFiles.findIndex((vf) => vf.id === id);
      if (idx === -1) return s;
      const newViewerFiles = s.viewerFiles.filter((vf) => vf.id !== id);

      // 닫히는 탭이 활성 탭인 경우 이전 탭(없으면 다음 탭)으로 이동
      let newActiveViewerFileId = s.activeViewerFileId;
      let newActiveFile = s.activeFile;
      if (s.activeViewerFileId === id) {
        const newIdx = idx > 0 ? idx - 1 : 0;
        const next = newViewerFiles[newIdx];
        newActiveViewerFileId = next?.id ?? null;
        newActiveFile = next?.file ?? null;
      }

      // 닫힌 탭의 뷰어 상태 제거
      const newViewerStates = { ...s.viewerStates };
      delete newViewerStates[id];

      return {
        viewerFiles: newViewerFiles,
        activeViewerFileId: newActiveViewerFileId,
        activeFile: newActiveFile,
        viewerStates: newViewerStates,
      };
    }),

  setActiveViewerFileId: (id) =>
    set((s) => {
      const target = s.viewerFiles.find((vf) => vf.id === id);
      if (!target) return s;
      return { activeViewerFileId: id, activeFile: target.file };
    }),

  setViewerState: (fileId, state) =>
    set((s) => ({
      viewerStates: {
        ...s.viewerStates,
        [fileId]: {
          currentPage: s.viewerStates[fileId]?.currentPage ?? 1,
          zoom: s.viewerStates[fileId]?.zoom ?? 1.2,
          ...state,
        },
      },
    })),

  addFiles: (newFiles) => {
    const { files } = get();
    const existing = new Set(files.map((f) => f.file.name));
    const filtered = newFiles.filter((f) => !existing.has(f.name));
    const combined = [
      ...files,
      ...filtered.map((f) => ({ id: crypto.randomUUID(), file: f })),
    ];

    const totalSize = combined.reduce((s, f) => s + f.file.size, 0);
    if (totalSize > PDF_MAX_TOTAL_SIZE) {
      return '총 파일 크기가 100MB를 초과합니다.';
    }
    if (combined.length > 20) {
      return '최대 20개 파일까지만 추가할 수 있습니다.';
    }

    set({ files: combined });
    return null;
  },

  addPages: (newPages) =>
    set((s) => ({ pages: [...s.pages, ...newPages] })),

  removePage: (pageId) =>
    set((s) => {
      const newPages = s.pages.filter((p) => p.id !== pageId);
      // 페이지가 모두 제거된 파일은 files에서도 제거
      const usedFileIds = new Set(newPages.map((p) => p.fileId));
      const newFiles = s.files.filter((f) => usedFileIds.has(f.id));
      const newActivePageId = s.activePageId === pageId ? null : s.activePageId;
      // 선택 목록에서도 제거
      const newSelected = new Set(s.selectedPageIds);
      newSelected.delete(pageId);
      // 현재 상태를 히스토리에 저장 (최대 30개)
      const newHistory = [...s.history, { files: s.files, pages: s.pages }].slice(-MAX_HISTORY);
      return { pages: newPages, files: newFiles, activePageId: newActivePageId, history: newHistory, selectedPageIds: newSelected };
    }),

  reorderPages: (activeId, overId) =>
    set((s) => {
      const oldIndex = s.pages.findIndex((p) => p.id === activeId);
      const newIndex = s.pages.findIndex((p) => p.id === overId);
      if (oldIndex === -1 || newIndex === -1) return s;
      // 현재 상태를 히스토리에 저장 (최대 30개)
      const newHistory = [...s.history, { files: s.files, pages: s.pages }].slice(-MAX_HISTORY);
      return { pages: arrayMove(s.pages, oldIndex, newIndex), history: newHistory };
    }),

  clearAll: () => set({ files: [], pages: [], activePageId: null, history: [], selectedPageIds: new Set() }),

  setPageThumbnail: (pageId, dataUrl) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === pageId ? { ...p, thumbnail: dataUrl } : p)),
    })),

  setActivePageId: (id) => set({ activePageId: id }),

  undo: () =>
    set((s) => {
      if (s.history.length === 0) return s;
      const prev = s.history[s.history.length - 1];
      return {
        files: prev.files,
        pages: prev.pages,
        history: s.history.slice(0, -1),
      };
    }),

  togglePageSelection: (pageId) =>
    set((s) => {
      const newSelected = new Set(s.selectedPageIds);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return { selectedPageIds: newSelected };
    }),

  selectAllPages: () =>
    set((s) => ({ selectedPageIds: new Set(s.pages.map((p) => p.id)) })),

  deselectAllPages: () => set({ selectedPageIds: new Set() }),

  selectPageRange: (startId, endId) =>
    set((s) => {
      const startIdx = s.pages.findIndex((p) => p.id === startId);
      const endIdx = s.pages.findIndex((p) => p.id === endId);
      if (startIdx === -1 || endIdx === -1) return s;
      const from = Math.min(startIdx, endIdx);
      const to = Math.max(startIdx, endIdx);
      const newSelected = new Set(s.selectedPageIds);
      s.pages.slice(from, to + 1).forEach((p) => newSelected.add(p.id));
      return { selectedPageIds: newSelected };
    }),

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.min(400, Math.max(200, width)) }),

  addMergeFile: (entry) => {
    const { mergeFiles } = get();
    // 최대 19개 제한 (현재 열린 파일 1개 포함 총 20개)
    if (mergeFiles.length >= 19) {
      return '최대 20개 파일까지 병합 가능합니다.';
    }
    // 합산 크기 100MB 제한
    const totalSize = mergeFiles.reduce((sum, f) => sum + f.file.size, 0) + entry.file.size;
    if (totalSize > PDF_MAX_TOTAL_SIZE) {
      return '파일 크기 합계가 100MB를 초과합니다.';
    }
    set({ mergeFiles: [...mergeFiles, entry] });
    return null;
  },

  removeMergeFile: (id) =>
    set((s) => ({ mergeFiles: s.mergeFiles.filter((f) => f.id !== id) })),

  reorderMergeFiles: (activeId, overId) =>
    set((s) => {
      const oldIndex = s.mergeFiles.findIndex((f) => f.id === activeId);
      const newIndex = s.mergeFiles.findIndex((f) => f.id === overId);
      if (oldIndex === -1 || newIndex === -1) return s;
      return { mergeFiles: arrayMove(s.mergeFiles, oldIndex, newIndex) };
    }),

  clearMergeFiles: () => set({ mergeFiles: [] }),
}));
