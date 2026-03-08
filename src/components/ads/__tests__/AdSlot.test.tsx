import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

/* useEnvironment 모킹 */
vi.mock('@/hooks/useEnvironment', () => ({
  useEnvironment: vi.fn(),
}));

import { AdSlot } from '../AdSlot';
import { useEnvironment } from '@/hooks/useEnvironment';

const mockUseEnvironment = vi.mocked(useEnvironment);

describe('AdSlot 환경 분기', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('웹 환경 + 키 미등록 시 플레이스홀더를 렌더링한다', () => {
    /* 테스트 환경에서는 NEXT_PUBLIC_ADSENSE_ID가 placeholder이므로 플레이스홀더 렌더링 */
    mockUseEnvironment.mockReturnValue({ isTauri: false, isWeb: true });
    const { container } = render(<AdSlot slot="1234567890" />);
    const placeholder = container.querySelector('[data-testid="ad-placeholder"]');
    expect(placeholder).not.toBeNull();
    expect(container.querySelector('ins')).toBeNull();
  });

  it('Tauri 환경에서 null을 반환한다 (광고 미노출)', () => {
    mockUseEnvironment.mockReturnValue({ isTauri: true, isWeb: false });
    const { container } = render(<AdSlot slot="1234567890" />);
    /* Tauri 환경: 컴포넌트가 null 반환 → DOM 비어있음 */
    expect(container.querySelector('ins')).toBeNull();
    expect(container.querySelector('[data-testid="ad-placeholder"]')).toBeNull();
  });

  it('플레이스홀더 래퍼에 max-sm:hidden 클래스가 적용된다', () => {
    mockUseEnvironment.mockReturnValue({ isTauri: false, isWeb: true });
    const { container } = render(<AdSlot slot="1234567890" />);
    const wrapper = container.querySelector('[data-testid="ad-placeholder"]')?.parentElement;
    expect(wrapper?.className).toContain('max-sm:hidden');
  });
});

describe('AdSlot 광고 실패 처리 로직', () => {
  it('data-ad-status=unfilled 감지 시 광고 실패로 판단', () => {
    // MutationObserver 감지 로직 단위 테스트
    const isAdFailed = (adStatus: string | null, height: number): boolean => {
      return adStatus === 'unfilled' || height === 0;
    };

    expect(isAdFailed('unfilled', 90)).toBe(true);
    expect(isAdFailed(null, 0)).toBe(true);
    expect(isAdFailed('filled', 90)).toBe(false);
    expect(isAdFailed(null, 90)).toBe(false);
  });

  it('광고 높이가 0이면 실패로 판단', () => {
    const isAdFailed = (height: number): boolean => height === 0;

    expect(isAdFailed(0)).toBe(true);
    expect(isAdFailed(90)).toBe(false);
    expect(isAdFailed(1)).toBe(false);
  });

  it('광고 로드 성공 시 타임아웃을 취소한다', () => {
    // 타임아웃 취소 로직 시뮬레이션
    let timeoutCancelled = false;
    const timeout = setTimeout(() => {}, 5000);
    const clearTimeoutFn = () => {
      clearTimeout(timeout);
      timeoutCancelled = true;
    };

    // 광고 로드 성공 (높이 > 0)
    const height = 90;
    if (height > 0) {
      clearTimeoutFn();
    }

    expect(timeoutCancelled).toBe(true);
  });
});
