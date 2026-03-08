'use client';

import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { useAdBlockDetect } from '@/hooks/useAdBlockDetect';

const DISMISSED_KEY = 'adblock-dismissed';

/**
 * Ad Blocker 감지 시 비침습적 안내 배너
 * - 상단 고정 배너 (팝업 아님)
 * - 닫기 버튼으로 닫으면 localStorage에 저장하여 재표시 안 함
 */
export function AdBlockBanner() {
  const isAdBlockDetected = useAdBlockDetect();
  const [dismissed, setDismissed] = useState(true); // 초기에는 숨김 (hydration 안전)

  useEffect(() => {
    // localStorage에서 닫기 상태 확인
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  // 감지 안 됨 또는 이미 닫은 경우 렌더링 안 함
  if (!isAdBlockDetected || dismissed) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="광고 차단기 감지 안내"
      className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/20 text-[13px]"
    >
      <Heart className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-foreground/80 flex-1">
        광고 차단기를 사용 중이시군요.{' '}
        <strong className="font-medium text-foreground">ModuMark는 광고 수익으로 무료 서비스를 유지합니다.</strong>{' '}
        광고 허용을 고려해 주시면 감사하겠습니다.
      </span>
      <button
        onClick={handleDismiss}
        aria-label="안내 배너 닫기"
        className="shrink-0 p-0.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
