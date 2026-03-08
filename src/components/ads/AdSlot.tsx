'use client';

import { useEffect, useRef } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle';
  className?: string;
}

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID ?? '';
const isPlaceholder = !adsenseId || adsenseId === 'ca-pub-placeholder';

export function AdSlot({ slot, format = 'auto', className }: AdSlotProps) {
  const { isTauri } = useEnvironment();
  const adRef = useRef<HTMLElement>(null);

  /* Intersection Observer: 뷰포트 진입 시 광고 로드 (유효한 키일 때만) */
  useEffect(() => {
    if (isTauri || isPlaceholder) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch {
          /* 광고 초기화 실패 무시 */
        }
        observer.disconnect();
      }
    });
    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [isTauri]);

  /* Tauri 데스크탑 앱에서는 광고 미노출 */
  if (isTauri) return null;

  /* AdSense 키 미등록 시 플레이스홀더 표시 */
  if (isPlaceholder) {
    return (
      <div className={`max-sm:hidden ${className ?? ''}`}>
        <div
          className="min-h-[90px] flex items-center justify-center rounded border border-dashed border-border bg-muted/30 text-[11px] text-muted-foreground"
          data-testid="ad-placeholder"
        >
          광고 영역 (키 미등록)
        </div>
      </div>
    );
  }

  return (
    /* 모바일 숨김 — 편집 영역 오버레이 금지 */
    <div className={`max-sm:hidden ${className ?? ''}`}>
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
