import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderMermaid } from '../mermaidRenderer';

/* mermaid 패키지 모킹 — DOM 의존성 제거 */
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg><text>flowchart</text></svg>' }),
  },
}));

describe('renderMermaid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('flowchart 코드를 SVG 문자열로 변환한다', async () => {
    const svg = await renderMermaid('flowchart TD\nA-->B');
    expect(svg).toContain('<svg>');
  });

  it('dark 테마로 mermaid를 초기화한다', async () => {
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'dark');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  it('default 테마로 mermaid를 초기화한다', async () => {
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'default');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'default' })
    );
  });

  it('theme 미지정 시 dark 테마를 기본으로 사용한다', async () => {
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('sequenceDiagram\nA->>B: Hello');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  it('잘못된 코드 입력 시 에러를 throw한다', async () => {
    const mermaid = (await import('mermaid')).default;
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error('parse error'));
    await expect(renderMermaid('invalid mermaid code')).rejects.toThrow('parse error');
  });

  it('startOnLoad: false로 초기화한다 (자동 실행 방지)', async () => {
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false })
    );
  });
});
