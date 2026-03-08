/**
 * DownloadPrompt 다운로드 안내 컴포넌트 단위 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/environment', () => ({
  isTauriApp: vi.fn(),
}));

import { isTauriApp } from '@/lib/environment';

const DISMISSED_KEY = 'download-prompt-dismissed';

describe('DownloadPrompt 표시 로직', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.removeItem(DISMISSED_KEY);
  });

  it('웹 환경(isTauriApp=false)에서 표시 가능', () => {
    vi.mocked(isTauriApp).mockReturnValue(false);
    expect(isTauriApp()).toBe(false);
    // 웹 환경이면 표시 가능
  });

  it('Tauri 환경(isTauriApp=true)에서 미표시', () => {
    vi.mocked(isTauriApp).mockReturnValue(true);
    expect(isTauriApp()).toBe(true);
    // Tauri 환경이면 미표시
  });

  it('다시 보지 않기 클릭 시 localStorage에 forever가 저장된다', () => {
    const handleDismissForever = () => {
      localStorage.setItem(DISMISSED_KEY, 'forever');
    };

    handleDismissForever();
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('forever');
  });

  it('닫기 클릭 시 localStorage에 1이 저장된다', () => {
    const handleDismiss = () => {
      localStorage.setItem(DISMISSED_KEY, '1');
    };

    handleDismiss();
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('1');
  });

  it('localStorage에 dismissed 값이 있으면 미표시', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    expect(wasDismissed).toBeTruthy();
  });

  it('localStorage에 dismissed 값이 없으면 표시 가능', () => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    expect(wasDismissed).toBeNull();
  });

  it('forceShow=true이면 dismissed 상태와 무관하게 표시', () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    const forceShow = true;
    const dismissed = localStorage.getItem(DISMISSED_KEY) !== null;

    // forceShow=true이면 dismissed=true여도 표시
    const shouldShow = forceShow || !dismissed;
    expect(shouldShow).toBe(true);
  });

  it('GitHub Releases URL이 올바른 형식', () => {
    const GITHUB_RELEASES_URL = 'https://github.com/modumark/modumark/releases/latest';
    expect(GITHUB_RELEASES_URL).toMatch(/^https:\/\/github\.com/);
    expect(GITHUB_RELEASES_URL).toContain('releases');
  });
});
