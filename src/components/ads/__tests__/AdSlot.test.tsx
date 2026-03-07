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

  it('웹 환경에서 ins 요소를 렌더링한다', () => {
    mockUseEnvironment.mockReturnValue({ isTauri: false, isWeb: true });
    const { container } = render(<AdSlot slot="1234567890" />);
    const ins = container.querySelector('ins');
    expect(ins).not.toBeNull();
  });

  it('Tauri 환경에서 null을 반환한다 (광고 미노출)', () => {
    mockUseEnvironment.mockReturnValue({ isTauri: true, isWeb: false });
    const { container } = render(<AdSlot slot="1234567890" />);
    /* Tauri 환경: 컴포넌트가 null 반환 → DOM 비어있음 */
    expect(container.querySelector('ins')).toBeNull();
  });
});
