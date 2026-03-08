'use client';

import { useEffect, useRef, useState } from 'react';
import { useEnvironment } from '@/hooks/useEnvironment';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle';
  className?: string;
}

const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID ?? '';
const isPlaceholder = !adsenseId || adsenseId === 'ca-pub-placeholder';

/** 광고 로드 실패 판단 대기 시간 (ms) */
const AD_LOAD_TIMEOUT = 5000;

export function AdSlot({ slot, format = 'auto', className }: AdSlotProps) {
  const { isTauri } = useEnvironment();
  const adRef = useRef<HTMLElement>(null);
  /* 광고 로드 실패 시 슬롯을 제거 — minHeight도 함께 제거하여 CLS 방지 */
  const [adFailed, setAdFailed] = useState(false);

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

  /* MutationObserver: ins 요소 크기/style 변화 감지 → 광고 실패 판단 */
  useEffect(() => {
    if (isTauri || isPlaceholder || !adRef.current) return;

    const insEl = adRef.current;

    // 5초 타임아웃: 광고가 로드되지 않으면 실패로 판단
    const timeout = setTimeout(() => {
      const height = insEl.offsetHeight;
      const hasContent = insEl.innerHTML.trim().length > 0;
      if (height === 0 || !hasContent) {
        setAdFailed(true);
      }
    }, AD_LOAD_TIMEOUT);

    // MutationObserver: ins 속성/자식 변경 감지
    const mutationObserver = new MutationObserver(() => {
      const height = insEl.offsetHeight;
      const adStatus = insEl.getAttribute('data-ad-status');

      if (adStatus === 'unfilled' || height === 0) {
        // AdSense가 광고 없음(unfilled)으로 표시하거나 높이가 0이면 실패
        clearTimeout(timeout);
        setAdFailed(true);
        mutationObserver.disconnect();
      } else if (height > 0) {
        // 광고 로드 성공 — 타임아웃 취소
        clearTimeout(timeout);
        mutationObserver.disconnect();
      }
    });

    mutationObserver.observe(insEl, {
      attributes: true,
      attributeFilter: ['style', 'class', 'data-ad-status'],
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeout);
      mutationObserver.disconnect();
    };
  }, [isTauri]);

  /* Tauri 데스크탑 앱에서는 광고 미노출 */
  if (isTauri) return null;

  /* 광고 로드 실패 시 슬롯 제거 → 레이아웃 복구 (minHeight 없음) */
  if (adFailed) return null;

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
