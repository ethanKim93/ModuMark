import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTauriFileOpen } from '../useTauriFileOpen';

// vi.mock 호이스팅 문제 방지: vi.hoisted()로 모킹 변수를 미리 선언
const { mockOpenTab, mockSwitchTab, mockGetState } = vi.hoisted(() => {
  const mockOpenTab = vi.fn().mockReturnValue('new-tab-id');
  const mockSwitchTab = vi.fn();
  const mockGetState = vi.fn(() => ({
    tabs: [] as { id: string; title: string; content: string; isDirty: boolean }[],
    openTab: mockOpenTab,
    switchTab: mockSwitchTab,
  }));
  return { mockOpenTab, mockSwitchTab, mockGetState };
});

// isTauriApp 모킹
vi.mock('@/lib/environment', () => ({
  isTauriApp: vi.fn(),
}));

// tabStore 모킹
vi.mock('@/stores/tabStore', () => ({
  useTabStore: {
    getState: mockGetState,
  },
}));

describe('useTauriFileOpen', () => {
  let mockListen: ReturnType<typeof vi.fn>;
  let mockReadTextFile: ReturnType<typeof vi.fn>;
  let mockUnlisten: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUnlisten = vi.fn();
    mockListen = vi.fn().mockResolvedValue(mockUnlisten);
    mockReadTextFile = vi.fn().mockResolvedValue('# 테스트 파일');
    mockGetState.mockReturnValue({
      tabs: [],
      openTab: mockOpenTab,
      switchTab: mockSwitchTab,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('Tauri 환경이 아닌 경우 listen을 호출하지 않아야 한다', async () => {
    const { isTauriApp } = await import('@/lib/environment');
    vi.mocked(isTauriApp).mockReturnValue(false);

    const { unmount } = renderHook(() => useTauriFileOpen());
    await new Promise((r) => setTimeout(r, 10));
    unmount();

    expect(mockListen).not.toHaveBeenCalled();
  });

  it('Tauri 환경인 경우 app:open-files 이벤트를 구독해야 한다', async () => {
    const { isTauriApp } = await import('@/lib/environment');
    vi.mocked(isTauriApp).mockReturnValue(true);

    vi.doMock('@tauri-apps/api/event', () => ({ listen: mockListen }));
    vi.doMock('@tauri-apps/plugin-fs', () => ({ readTextFile: mockReadTextFile }));

    renderHook(() => useTauriFileOpen());

    await vi.waitFor(() => {
      expect(mockListen).toHaveBeenCalledWith('app:open-files', expect.any(Function));
    });
  });

  it('이미 열린 탭 이름과 동일한 파일이면 switchTab을 호출해야 한다', async () => {
    const { isTauriApp } = await import('@/lib/environment');
    vi.mocked(isTauriApp).mockReturnValue(true);

    mockGetState.mockReturnValue({
      tabs: [{ id: 'tab-1', title: 'test.md', content: '# 기존', isDirty: false }],
      openTab: mockOpenTab,
      switchTab: mockSwitchTab,
    });

    let capturedCallback:
      | ((event: { payload: string[] }) => Promise<void>)
      | null = null;

    mockListen.mockImplementation(
      (
        _event: string,
        cb: (event: { payload: string[] }) => Promise<void>
      ) => {
        capturedCallback = cb;
        return Promise.resolve(mockUnlisten);
      }
    );

    vi.doMock('@tauri-apps/api/event', () => ({ listen: mockListen }));
    vi.doMock('@tauri-apps/plugin-fs', () => ({ readTextFile: mockReadTextFile }));

    renderHook(() => useTauriFileOpen());

    await vi.waitFor(() => {
      expect(capturedCallback).not.toBeNull();
    });

    await capturedCallback!({ payload: ['/path/to/test.md'] });

    expect(mockSwitchTab).toHaveBeenCalledWith('tab-1');
    expect(mockOpenTab).not.toHaveBeenCalled();
  });

  it('새 파일인 경우 파일을 읽어 openTab을 호출해야 한다', async () => {
    const { isTauriApp } = await import('@/lib/environment');
    vi.mocked(isTauriApp).mockReturnValue(true);

    mockGetState.mockReturnValue({
      tabs: [],
      openTab: mockOpenTab,
      switchTab: mockSwitchTab,
    });

    let capturedCallback:
      | ((event: { payload: string[] }) => Promise<void>)
      | null = null;

    mockListen.mockImplementation(
      (
        _event: string,
        cb: (event: { payload: string[] }) => Promise<void>
      ) => {
        capturedCallback = cb;
        return Promise.resolve(mockUnlisten);
      }
    );
    mockReadTextFile.mockResolvedValue('# 새 파일');

    vi.doMock('@tauri-apps/api/event', () => ({ listen: mockListen }));
    vi.doMock('@tauri-apps/plugin-fs', () => ({ readTextFile: mockReadTextFile }));

    renderHook(() => useTauriFileOpen());

    await vi.waitFor(() => {
      expect(capturedCallback).not.toBeNull();
    });

    await capturedCallback!({ payload: ['/path/to/new.md'] });

    expect(mockOpenTab).toHaveBeenCalledWith({
      title: 'new.md',
      content: '# 새 파일',
      isDirty: false,
    });
  });

  it('컴포넌트 언마운트 시 unlisten을 호출해야 한다', async () => {
    const { isTauriApp } = await import('@/lib/environment');
    vi.mocked(isTauriApp).mockReturnValue(true);

    vi.doMock('@tauri-apps/api/event', () => ({ listen: mockListen }));
    vi.doMock('@tauri-apps/plugin-fs', () => ({ readTextFile: mockReadTextFile }));

    const { unmount } = renderHook(() => useTauriFileOpen());

    await vi.waitFor(() => {
      expect(mockListen).toHaveBeenCalled();
    });

    unmount();
    expect(mockUnlisten).toHaveBeenCalled();
  });
});
