'use client';

import dynamic from 'next/dynamic';

const PdfSplit = dynamic(
  () => import('./PdfSplit').then((m) => ({ default: m.PdfSplit })),
  { ssr: false, loading: () => <div className="flex-1 bg-background" /> }
);

export function PdfSplitLoader() {
  return <PdfSplit />;
}
