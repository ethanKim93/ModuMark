'use client';

import { useEffect, useRef } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle';
  className?: string;
}

export function AdSlot({ slot, format = 'auto', className }: AdSlotProps) {
  const { isTauri } = useEnvironment();
  const adRef = useRef<HTMLElement>(null);

  /* Tauri 데스크탑 앱에서는 광고 미노출 */
  if (isTauri) return null;

  useEffect(() => {
    /* Intersection Observer: 뷰포트 진입 시 광고 로드 */
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
  }, []);

  return (
    /* 모바일 숨김 — 편집 영역 오버레이 금지 */
    <div className={`hidden sm:block ${className ?? ''}`}>
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
