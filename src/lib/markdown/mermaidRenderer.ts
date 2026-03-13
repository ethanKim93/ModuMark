/**
 * Mermaid 다이어그램 렌더러
 * - dynamic import로 초기 번들 크기 영향 최소화 (~1.5MB)
 * - SSR 비호환: 클라이언트에서만 호출 필요
 * - 초기화 1회만 수행, 렌더링 큐 직렬화, 5초 타임아웃
 */

export type MermaidTheme = 'dark' | 'default';

/** 초기화 상태 */
let initialized = false;
let currentTheme: MermaidTheme = 'dark';

/** 렌더링 큐 — 동시 렌더링 레이스 컨디션 방지 */
let renderQueue: Promise<void> = Promise.resolve();

/** Mermaid 초기화 (최초 1회 + 테마 변경 시만) */
async function ensureInitialized(theme: MermaidTheme) {
  const mermaid = (await import('mermaid')).default;
  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'strict',
    });
    initialized = true;
    currentTheme = theme;
  }
  return mermaid;
}

/** 렌더링 타임아웃 래퍼 (5초) */
async function renderWithTimeout(
  mermaid: Awaited<ReturnType<typeof ensureInitialized>>,
  id: string,
  code: string,
  timeout = 5000,
): Promise<{ svg: string }> {
  return Promise.race([
    mermaid.render(id, code),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('렌더링 시간 초과 (5초)')), timeout),
    ),
  ]);
}

/**
 * 테마 변경 알림 — 다음 렌더링 시 재초기화 트리거
 */
export function setMermaidRendererTheme(theme: MermaidTheme) {
  if (theme !== currentTheme) {
    currentTheme = theme;
    initialized = false;
  }
}

/**
 * Mermaid 코드를 SVG 문자열로 렌더링
 * - 렌더링 큐로 직렬화하여 레이스 컨디션 방지
 * - 5초 타임아웃 적용
 */
export function renderMermaid(
  code: string,
  theme: MermaidTheme = 'dark',
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    renderQueue = renderQueue.then(async () => {
      try {
        /* 테마 불일치 시 재초기화 */
        if (theme !== currentTheme) {
          initialized = false;
        }
        const mermaid = await ensureInitialized(theme);
        const id = 'mermaid-' + Math.random().toString(36).slice(2);
        const { svg } = await renderWithTimeout(mermaid, id, code);
        resolve(svg);
      } catch (err) {
        reject(err);
      }
    });
  });
}
