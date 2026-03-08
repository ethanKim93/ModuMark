import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import { PDF_MAX_TOTAL_SIZE } from '@/lib/pdf/pdfMerge';

export interface PdfFileItem {
  id: string;
  file: File;
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
  history: HistoryEntry[];
  selectedPageIds: Set<string>;
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
}

export const usePdfFileStore = create<PdfFileStore>((set, get) => ({
  files: [],
  pages: [],
  activePageId: null,
  history: [],
  selectedPageIds: new Set<string>(),

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
}));
