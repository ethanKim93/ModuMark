'use client';

import dynamic from 'next/dynamic';

export const PdfEditorLoader = dynamic(() => import('./PdfEditor').then((m) => ({ default: m.PdfEditor })), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
      로딩 중...
    </div>
  ),
});
