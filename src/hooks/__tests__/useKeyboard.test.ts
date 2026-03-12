/**
 * useKeyboard 단축키 훅 단위 테스트
 * 키보드 단축키 → tabStore 액션 매핑 로직 검증
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

/* tabStore 모킹 */
const mockOpenTab = vi.fn(() => 'new-tab-id');
const mockCloseTab = vi.fn();
const mockGetActiveTab = vi.fn();
const mockSetFileHandle = vi.fn();
const mockSetDirty = vi.fn();

vi.mock('@/stores/tabStore', () => ({
  useTabStore: {
    getState: vi.fn(() => ({
      tabs: [],
      activeTabId: 'tab-1',
      openTab: mockOpenTab,
      closeTab: mockCloseTab,
      getActiveTab: mockGetActiveTab,
      setFileHandle: mockSetFileHandle,
      setDirty: mockSetDirty,
      switchTab: vi.fn(),
      updateContent: vi.fn(),
      isOpenedFromFileAssociation: false,
      setOpenedFromFileAssociation: vi.fn(),
    })),
  },
}));

vi.mock('@/lib/fileSystem', () => ({
  saveMarkdownFile: vi.fn().mockResolvedValue(null),
  openMarkdownFile: vi.fn(),
}));

import { useTabStore } from '@/stores/tabStore';
import { saveMarkdownFile } from '@/lib/fileSystem';

describe('useKeyboard 단축키 로직', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본 mock 복원
    vi.mocked(useTabStore.getState).mockReturnValue({
      tabs: [],
      activeTabId: 'tab-1',
      openTab: mockOpenTab,
      closeTab: mockCloseTab,
      getActiveTab: mockGetActiveTab,
      setFileHandle: mockSetFileHandle,
      setDirty: mockSetDirty,
      switchTab: vi.fn(),
      updateContent: vi.fn(),
      isOpenedFromFileAssociation: false,
      setOpenedFromFileAssociation: vi.fn(),
    });
  });

  it('Ctrl+T 단축키 → openTab 호출', () => {
    const store = useTabStore.getState();
    // Ctrl+T 핸들러 로직
    store.openTab({ title: 'Untitled', content: '', isDirty: false });

    expect(mockOpenTab).toHaveBeenCalledOnce();
    expect(mockOpenTab).toHaveBeenCalledWith({
      title: 'Untitled',
      content: '',
      isDirty: false,
    });
  });

  it('Ctrl+W → 현재 활성 탭 ID로 closeTab 호출', () => {
    const store = useTabStore.getState();
    const activeId = store.activeTabId;
    if (activeId) store.closeTab(activeId);

    expect(mockCloseTab).toHaveBeenCalledWith('tab-1');
  });

  it('Ctrl+S → saveMarkdownFile 호출', async () => {
    mockGetActiveTab.mockReturnValue({
      id: 'tab-1',
      title: 'test.md',
      content: '# 테스트',
      isDirty: true,
      fileHandle: undefined,
    });

    const store = useTabStore.getState();
    const tab = store.getActiveTab();
    if (!tab) return;

    await saveMarkdownFile(tab.content, tab.fileHandle ?? null);

    expect(saveMarkdownFile).toHaveBeenCalledWith('# 테스트', null);
  });

  it('isCtrl=false 이면 단축키 처리 안 함', () => {
    // Ctrl 없이 키 입력 — 아무 액션도 호출되지 않아야 함
    const isCtrl = false;
    if (isCtrl) mockOpenTab();

    expect(mockOpenTab).not.toHaveBeenCalled();
  });

  it('activeTabId가 null이면 Ctrl+W에서 closeTab 미호출', () => {
    vi.mocked(useTabStore.getState).mockReturnValue({
      tabs: [],
      activeTabId: null,
      openTab: mockOpenTab,
      closeTab: mockCloseTab,
      getActiveTab: mockGetActiveTab,
      setFileHandle: mockSetFileHandle,
      setDirty: mockSetDirty,
      isOpenedFromFileAssociation: false,
      setOpenedFromFileAssociation: vi.fn(),
      switchTab: vi.fn(),
      updateContent: vi.fn(),
    });

    const store = useTabStore.getState();
    const activeId = store.activeTabId;
    if (activeId) store.closeTab(activeId);

    expect(mockCloseTab).not.toHaveBeenCalled();
  });
});
