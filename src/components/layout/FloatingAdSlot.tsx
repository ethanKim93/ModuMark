'use client';

import { AdSlot } from '@/components/ads/AdSlot';

export function FloatingAdSlot() {
  return (
    <div className="fixed bottom-4 left-4 z-40 max-lg:hidden w-[200px]">
      <AdSlot slot="markdown-floating" format="rectangle" />
    </div>
  );
}
