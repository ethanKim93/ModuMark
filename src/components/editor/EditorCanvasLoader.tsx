'use client';

import dynamic from 'next/dynamic';

/* Milkdown은 브라우저 전용 — SSR 비활성화 */
const EditorCanvas = dynamic(
  () => import('./EditorCanvas').then((m) => ({ default: m.EditorCanvas })),
  { ssr: false, loading: () => <div className="flex-1 bg-background" /> }
);

export function EditorCanvasLoader() {
  return <EditorCanvas />;
}
