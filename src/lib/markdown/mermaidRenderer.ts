/**
 * Mermaid 다이어그램 렌더러
 * - dynamic import로 초기 번들 크기 영향 최소화 (~1.5MB)
 * - SSR 비호환: 클라이언트에서만 호출 필요
 */

export type MermaidTheme = 'dark' | 'default';

/**
 * Mermaid 코드를 SVG 문자열로 렌더링
 * @param code - mermaid 다이어그램 코드
 * @param theme - 테마 ('dark' | 'default')
 * @returns SVG 문자열
 */
export async function renderMermaid(
  code: string,
  theme: MermaidTheme = 'dark'
): Promise<string> {
  const mermaid = (await import('mermaid')).default;

  mermaid.initialize({
    startOnLoad: false,
    theme,
    securityLevel: 'loose',
  });

  /* 고유 ID 생성 (mermaid.render 내부에서 DOM 요소 ID로 사용) */
  const id = 'mermaid-' + Math.random().toString(36).slice(2);
  const { svg } = await mermaid.render(id, code);
  return svg;
}
