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
