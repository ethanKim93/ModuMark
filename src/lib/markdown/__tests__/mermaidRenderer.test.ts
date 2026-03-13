import { describe, it, expect, vi, beforeEach } from 'vitest';

/* 각 테스트마다 모듈을 재로드하여 initialized 상태 초기화 */
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

/* mermaid 패키지 모킹 — DOM 의존성 제거 */
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg><text>flowchart</text></svg>' }),
  },
}));

describe('renderMermaid', () => {
  it('flowchart 코드를 SVG 문자열로 변환한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const svg = await renderMermaid('flowchart TD\nA-->B');
    expect(svg).toContain('<svg>');
  });

  it('dark 테마로 mermaid를 초기화한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'dark');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  it('default 테마로 mermaid를 초기화한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'default');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'default' })
    );
  });

  it('theme 미지정 시 dark 테마를 기본으로 사용한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('sequenceDiagram\nA->>B: Hello');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' })
    );
  });

  it('잘못된 코드 입력 시 에러를 throw한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    vi.mocked(mermaid.render).mockRejectedValueOnce(new Error('parse error'));
    await expect(renderMermaid('invalid mermaid code')).rejects.toThrow('parse error');
  });

  it('startOnLoad: false로 초기화한다 (자동 실행 방지)', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B');
    expect(mermaid.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false })
    );
  });

  it('같은 테마로 두 번 호출 시 초기화는 1회만 수행한다', async () => {
    const { renderMermaid } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'dark');
    await renderMermaid('flowchart TD\nB-->C', 'dark');
    expect(mermaid.initialize).toHaveBeenCalledTimes(1);
  });

  it('테마 변경 시 재초기화한다', async () => {
    const { renderMermaid, setMermaidRendererTheme } = await import('../mermaidRenderer');
    const mermaid = (await import('mermaid')).default;
    await renderMermaid('flowchart TD\nA-->B', 'dark');
    setMermaidRendererTheme('default');
    await renderMermaid('flowchart TD\nB-->C', 'default');
    expect(mermaid.initialize).toHaveBeenCalledTimes(2);
  });
});
