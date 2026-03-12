import { create } from 'zustand';

export interface Tab {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
  fileHandle?: FileSystemFileHandle;
}

interface TabStore {
  tabs: Tab[];
  activeTabId: string | null;
  /** 파일 연결(더블클릭)로 열린 경우 true → 세션 복원 스킵 */
  isOpenedFromFileAssociation: boolean;
  openTab: (tab: Omit<Tab, 'id'>) => string;
  closeTab: (id: string) => void;
  switchTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  setDirty: (id: string, isDirty: boolean) => void;
  setFileHandle: (id: string, handle: FileSystemFileHandle, title: string) => void;
  getActiveTab: () => Tab | undefined;
  setOpenedFromFileAssociation: (value: boolean) => void;
}

const DEFAULT_TAB: Tab = {
  id: 'default',
  title: 'Untitled',
  content: '',
  isDirty: false,
};

export const useTabStore = create<TabStore>((set, get) => ({
  tabs: [DEFAULT_TAB],
  activeTabId: 'default',
  isOpenedFromFileAssociation: false,

  openTab: (tabData) => {
    /* 동일 fileHandle이 이미 열려 있으면 해당 탭으로 전환 */
    if (tabData.fileHandle) {
      const existing = get().tabs.find(
        (t) => t.fileHandle?.name === tabData.fileHandle!.name
      );
      if (existing) {
        set({ activeTabId: existing.id });
        return existing.id;
      }
    }
    const id = crypto.randomUUID();
    set((s) => ({ tabs: [...s.tabs, { ...tabData, id }], activeTabId: id }));
    return id;
  },

  closeTab: (id) =>
    set((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id);
      if (remaining.length === 0) {
        /* 마지막 탭 닫으면 새 빈 탭 자동 생성 */
        const newTab: Tab = { id: crypto.randomUUID(), title: 'Untitled', content: '', isDirty: false };
        return { tabs: [newTab], activeTabId: newTab.id };
      }
      /* 닫힌 탭이 활성 탭이었으면 바로 앞 탭(또는 첫 번째 탭)으로 전환 */
      const closedIndex = s.tabs.findIndex((t) => t.id === id);
      const newActive =
        s.activeTabId === id
          ? remaining[Math.max(0, Math.min(closedIndex - 1, remaining.length - 1))].id
          : s.activeTabId;
      return { tabs: remaining, activeTabId: newActive };
    }),

  switchTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, content, isDirty: true } : t)),
    })),

  setDirty: (id, isDirty) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty } : t)),
    })),

  setFileHandle: (id, handle, title) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, fileHandle: handle, title, isDirty: false } : t)),
    })),

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId);
  },

  setOpenedFromFileAssociation: (value) => set({ isOpenedFromFileAssociation: value }),
}));
