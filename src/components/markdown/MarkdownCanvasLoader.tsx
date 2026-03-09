'use client';

import dynamic from 'next/dynamic';

/* Milkdown은 브라우저 전용 — SSR 비활성화 */
const MarkdownCanvas = dynamic(
  () => import('./MarkdownCanvas').then((m) => ({ default: m.MarkdownCanvas })),
  { ssr: false, loading: () => <div className="flex-1 bg-background" /> }
);

export function MarkdownCanvasLoader() {
  return <MarkdownCanvas />;
}
