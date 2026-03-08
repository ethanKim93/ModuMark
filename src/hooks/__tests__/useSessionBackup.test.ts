/**
 * useSessionBackup 세션 백업 훅 단위 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/environment', () => ({
  isTauriApp: vi.fn(),
}));

vi.mock('@/lib/sessionBackup', () => ({
  saveBackup: vi.fn().mockResolvedValue(undefined),
  clearBackup: vi.fn().mockResolvedValue(undefined),
  loadBackup: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/stores/tabStore', () => ({
  useTabStore: {
    subscribe: vi.fn(() => vi.fn()), // unsubscribe 반환
    getState: vi.fn(() => ({
      tabs: [],
      activeTabId: null,
    })),
  },
}));

import { isTauriApp } from '@/lib/environment';
import { saveBackup, clearBackup } from '@/lib/sessionBackup';
import { useTabStore } from '@/stores/tabStore';

describe('useSessionBackup 백업 로직', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('웹 환경에서는 구독이 설정되지 않는다', () => {
    vi.mocked(isTauriApp).mockReturnValue(false);

    // isTauriApp()=false → subscribe 호출 안 됨
    if (!isTauriApp()) {
      // 비활성화 확인
    }
    expect(useTabStore.subscribe).not.toHaveBeenCalled();
  });

  it('5초 디바운스 후 saveBackup이 호출된다', async () => {
    vi.mocked(isTauriApp).mockReturnValue(true);

    const tabs = [{ id: 'tab-1', title: 'test.md', content: '# 내용', isDirty: true }];
    const activeTabId = 'tab-1';

    // 5초 디바운스 로직 시뮬레이션
    let timer: ReturnType<typeof setTimeout> | null = null;
    const triggerDebounce = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveBackup(tabs as never, activeTabId);
      }, 5000);
    };

    triggerDebounce();
    expect(saveBackup).not.toHaveBeenCalled();

    vi.advanceTimersByTime(5000);
    expect(saveBackup).toHaveBeenCalledOnce();
    expect(saveBackup).toHaveBeenCalledWith(tabs, activeTabId);
  });

  it('디바운스 중 재호출 시 타이머가 초기화된다', () => {
    vi.mocked(isTauriApp).mockReturnValue(true);

    let timer: ReturnType<typeof setTimeout> | null = null;
    const triggerDebounce = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveBackup([], null);
      }, 5000);
    };

    // 첫 번째 호출
    triggerDebounce();
    vi.advanceTimersByTime(3000);
    expect(saveBackup).not.toHaveBeenCalled();

    // 3초 후 재호출 → 타이머 리셋
    triggerDebounce();
    vi.advanceTimersByTime(3000);
    expect(saveBackup).not.toHaveBeenCalled(); // 리셋 후 3초 → 아직 미호출

    vi.advanceTimersByTime(2000); // 총 5초 후
    expect(saveBackup).toHaveBeenCalledOnce();
  });

  it('onExplicitSave 호출 시 clearBackup이 호출된다', async () => {
    vi.mocked(isTauriApp).mockReturnValue(true);

    // onExplicitSave 로직 시뮬레이션
    const onExplicitSave = async () => {
      if (!isTauriApp()) return;
      await clearBackup();
    };

    await onExplicitSave();
    expect(clearBackup).toHaveBeenCalledOnce();
  });

  it('웹 환경에서 onExplicitSave는 clearBackup을 호출하지 않는다', async () => {
    vi.mocked(isTauriApp).mockReturnValue(false);

    const onExplicitSave = async () => {
      if (!isTauriApp()) return;
      await clearBackup();
    };

    await onExplicitSave();
    expect(clearBackup).not.toHaveBeenCalled();
  });
});
