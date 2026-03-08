"use client";

import { AdSlot } from "@/components/ads/AdSlot";
import { PdfThumbnailList } from "@/components/pdf/PdfThumbnailList";

export function PdfSidebar() {
  return (
    <aside className="flex flex-col bg-surface border-r border-border w-14 lg:w-60 transition-all h-full">
      {/* 썸네일 리스트 (항상 표시) */}
      <div className="flex-1 overflow-y-auto px-1 py-2">
        <p className="max-lg:hidden text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B] px-2 mb-2">
          페이지 목록
        </p>
        <PdfThumbnailList />
      </div>

      {/* AdSlot (하단 고정) */}
      <div className="border-t border-border">
        <AdSlot slot="sidebar-pdf" className="mx-2 mb-2" />
      </div>
    </aside>
  );
}
