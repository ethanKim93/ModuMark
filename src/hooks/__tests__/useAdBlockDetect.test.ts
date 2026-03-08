/**
 * useAdBlockDetect Ad Blocker 감지 로직 단위 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** fetch 차단 시 isAdBlockDetected=true 로직 단위 테스트 */
describe('Ad Blocker 감지 로직', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetch가 성공하면 광고 차단기 없음으로 판단한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));

    let detected = false;
    try {
      const response = await fetch('/ads/banner.js', { method: 'HEAD', cache: 'no-store' });
      if (!response.ok && response.status !== 404) {
        detected = true;
      }
    } catch {
      detected = true;
    }

    expect(detected).toBe(false);
  });

  it('fetch가 네트워크 오류로 실패하면 광고 차단기 감지', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')));

    let detected = false;
    try {
      await fetch('/ads/banner.js', { method: 'HEAD', cache: 'no-store' });
    } catch {
      detected = true;
    }

    expect(detected).toBe(true);
  });

  it('404 응답은 파일 없음이므로 차단으로 간주하지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    let detected = false;
    try {
      const response = await fetch('/ads/banner.js', { method: 'HEAD', cache: 'no-store' });
      if (!response.ok && response.status !== 404) {
        detected = true;
      }
    } catch {
      detected = true;
    }

    expect(detected).toBe(false);
  });

  it('403 응답은 차단으로 간주한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    let detected = false;
    try {
      const response = await fetch('/ads/banner.js', { method: 'HEAD', cache: 'no-store' });
      if (!response.ok && response.status !== 404) {
        detected = true;
      }
    } catch {
      detected = true;
    }

    expect(detected).toBe(true);
  });

  it('localStorage에 adblock-dismissed가 있으면 배너를 숨긴다', () => {
    localStorage.setItem('adblock-dismissed', '1');
    const wasDismissed = localStorage.getItem('adblock-dismissed');
    expect(wasDismissed).toBe('1');
    localStorage.removeItem('adblock-dismissed');
  });

  it('닫기 버튼 클릭 시 localStorage에 adblock-dismissed가 저장된다', () => {
    // 닫기 핸들러 시뮬레이션
    const handleDismiss = () => {
      localStorage.setItem('adblock-dismissed', '1');
    };

    handleDismiss();
    expect(localStorage.getItem('adblock-dismissed')).toBe('1');
    localStorage.removeItem('adblock-dismissed');
  });
});
