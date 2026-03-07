'use client';

import dynamic from 'next/dynamic';

const PdfMerge = dynamic(
  () => import('./PdfMerge').then((m) => ({ default: m.PdfMerge })),
  { ssr: false, loading: () => <div className="flex-1 bg-background" /> }
);

export function PdfMergeLoader() {
  return <PdfMerge />;
}
