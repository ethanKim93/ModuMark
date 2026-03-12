import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { PDF_MAX_TOTAL_SIZE } from '@/lib/pdf/pdfMerge';

export interface PdfFileItem {
  id: string;
  file: File;
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

/** 탭별 페이지·파일·선택 상태 스냅샷 */
interface TabSnapshot {
  pages: PdfPageItem[];
  files: PdfFileItem[];
  selectedPageIds: Set<string>;
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
  /** 탭 ID → 페이지 목록 스냅샷 (탭 전환 시 저장/복원) */
  tabPages: Record<string, PdfPageItem[]>;
  /** 탭 ID → 파일 목록 스냅샷 */
  tabFiles: Record<string, PdfFileItem[]>;
  /** 탭 ID → 선택된 페이지 ID 집합 */
  tabSelectedPageIds: Record<string, Set<string>>;

  setActiveFile: (file: File | null) => void;
  clearActiveFile: () => void;
  /** 뷰어 탭 닫기 (이전/다음 탭으로 자동 포커스) */
  closeViewerFile: (id: string) => void;
  /** 뷰어 탭 전환 (탭별 pages/files/selectedPageIds 저장·복원) */
  setActiveViewerFileId: (id: string) => void;
  /** 탭 뷰어 상태 업데이트 (부분 갱신 가능) */
  setViewerState: (fileId: string, state: Partial<ViewerState>) => void;
  addFiles: (newFiles: File[]) => string | null;
  addPages: (newPages: PdfPageItem[]) => void;
  removePage: (pageId: string) => void;
  reorderPages: (activeId: string, overId: string) => void;
  /** 선택된 여러 페이지를 targetId 위치로 이동 */
  reorderMultiplePages: (pageIds: Set<string>, targetId: string) => void;
  /** 현재 selectedPageIds 에 포함된 페이지 모두 삭제 */
  removeSelectedPages: () => void;
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
  tabPages: {},
  tabFiles: {},
  tabSelectedPageIds: {},

  setActiveFile: (file) => {
    if (!file) {
      set({ activeFile: null });
      return;
    }
    const { viewerFiles, activeViewerFileId, pages, files, selectedPageIds,
            tabPages, tabFiles, tabSelectedPageIds } = get();

    // 동일 파일명이 이미 탭에 있으면 setActiveViewerFileId로 위임 (스냅샷 저장/복원 포함)
    const existing = viewerFiles.find((vf) => vf.file.name === file.name);
    if (existing) {
      get().setActiveViewerFileId(existing.id);
      return;
    }

    // 새 탭 생성: 현재 탭 상태를 스냅샷에 저장 후 새 탭은 빈 상태로 시작
    let newTabPages = tabPages;
    let newTabFiles = tabFiles;
    let newTabSelectedPageIds = tabSelectedPageIds;

    if (activeViewerFileId) {
      newTabPages = { ...tabPages, [activeViewerFileId]: pages };
      newTabFiles = { ...tabFiles, [activeViewerFileId]: files };
      newTabSelectedPageIds = { ...tabSelectedPageIds, [activeViewerFileId]: selectedPageIds };
    }

    const newItem: ViewerFileItem = { id: crypto.randomUUID(), file };
    set({
      activeFile: file,
      viewerFiles: [...viewerFiles, newItem],
      activeViewerFileId: newItem.id,
      // 새 탭은 빈 상태로 시작
      pages: [],
      files: [],
      selectedPageIds: new Set<string>(),
      // 이전 탭 스냅샷 보존
      tabPages: newTabPages,
      tabFiles: newTabFiles,
      tabSelectedPageIds: newTabSelectedPageIds,
    });
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

      // 닫힌 탭의 뷰어 상태·스냅샷 제거
      const newViewerStates = { ...s.viewerStates };
      delete newViewerStates[id];

      const newTabPages = { ...s.tabPages };
      delete newTabPages[id];
      const newTabFiles = { ...s.tabFiles };
      delete newTabFiles[id];
      const newTabSelectedPageIds = { ...s.tabSelectedPageIds };
      delete newTabSelectedPageIds[id];

      return {
        viewerFiles: newViewerFiles,
        activeViewerFileId: newActiveViewerFileId,
        activeFile: newActiveFile,
        viewerStates: newViewerStates,
        tabPages: newTabPages,
        tabFiles: newTabFiles,
        tabSelectedPageIds: newTabSelectedPageIds,
      };
    }),

  setActiveViewerFileId: (id) =>
    set((s) => {
      const target = s.viewerFiles.find((vf) => vf.id === id);
      if (!target) return s;

      // 현재 탭 상태를 스냅샷에 저장 (탭 이탈 시)
      const prevTabId = s.activeViewerFileId;
      let newTabPages = s.tabPages;
      let newTabFiles = s.tabFiles;
      let newTabSelectedPageIds = s.tabSelectedPageIds;

      if (prevTabId && prevTabId !== id) {
        newTabPages = { ...s.tabPages, [prevTabId]: s.pages };
        newTabFiles = { ...s.tabFiles, [prevTabId]: s.files };
        newTabSelectedPageIds = { ...s.tabSelectedPageIds, [prevTabId]: s.selectedPageIds };
      }

      // 전환할 탭의 스냅샷 복원
      const restoredSnapshot: TabSnapshot | null = newTabPages[id]
        ? {
            pages: newTabPages[id],
            files: newTabFiles[id] ?? [],
            selectedPageIds: newTabSelectedPageIds[id] ?? new Set<string>(),
          }
        : null;

      return {
        activeViewerFileId: id,
        activeFile: target.file,
        tabPages: newTabPages,
        tabFiles: newTabFiles,
        tabSelectedPageIds: newTabSelectedPageIds,
        ...(restoredSnapshot
          ? {
              pages: restoredSnapshot.pages,
              files: restoredSnapshot.files,
              selectedPageIds: restoredSnapshot.selectedPageIds,
            }
          : {}),
      };
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
    set((s) => {
      const updatedPages = [...s.pages, ...newPages];
      return {
        pages: updatedPages,
        // activePageId가 없으면 첫 번째 페이지를 자동 선택 (초기 로드 시 사이드바 하이라이트)
        activePageId: s.activePageId ?? updatedPages[0]?.id ?? null,
      };
    }),

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

  reorderMultiplePages: (pageIds, targetId) =>
    set((s) => {
      const targetIndex = s.pages.findIndex((p) => p.id === targetId);
      if (targetIndex === -1) return s;

      // 선택된 페이지와 나머지 페이지 분리
      const selected = s.pages.filter((p) => pageIds.has(p.id));
      const rest = s.pages.filter((p) => !pageIds.has(p.id));

      // targetId 가 선택 목록에 없으면 rest 기준으로 삽입 위치 계산
      const insertIndex = rest.findIndex((p) => p.id === targetId);
      const newPages =
        insertIndex === -1
          ? [...rest, ...selected]
          : [...rest.slice(0, insertIndex), ...selected, ...rest.slice(insertIndex)];

      const newHistory = [...s.history, { files: s.files, pages: s.pages }].slice(-MAX_HISTORY);
      return { pages: newPages, history: newHistory };
    }),

  removeSelectedPages: () =>
    set((s) => {
      if (s.selectedPageIds.size === 0) return s;
      const newPages = s.pages.filter((p) => !s.selectedPageIds.has(p.id));
      const usedFileIds = new Set(newPages.map((p) => p.fileId));
      const newFiles = s.files.filter((f) => usedFileIds.has(f.id));
      const newActivePageId = s.activePageId && s.selectedPageIds.has(s.activePageId)
        ? null
        : s.activePageId;
      const newHistory = [...s.history, { files: s.files, pages: s.pages }].slice(-MAX_HISTORY);
      return {
        pages: newPages,
        files: newFiles,
        activePageId: newActivePageId,
        selectedPageIds: new Set<string>(),
        history: newHistory,
      };
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

  setCurrentPage: (index) => set((s) => {
    // 현재 activeFile과 동일 파일의 해당 pageIndex 페이지 찾아 activePageId 동기화
    const matchingPage = s.pages.find((p) => {
      const fileItem = s.files.find((f) => f.id === p.fileId);
      return fileItem?.file.name === s.activeFile?.name && p.pageIndex === index;
    });
    return {
      currentPageIndex: index,
      activePageId: matchingPage?.id ?? s.activePageId,
    };
  }),

  setSidebarWidth: (width) =>
    set({ sidebarWidth: Math.min(400, Math.max(200, width)) }),
}));
