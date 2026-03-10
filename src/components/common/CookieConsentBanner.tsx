'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';

export function CookieConsentBanner() {
  /* 하이드레이션 안전: 클라이언트 마운트 후에만 표시 */
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      /* localStorage 접근 불가 환경에서는 배너 숨김 */
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch { /* 무시 */ }
    setVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'rejected');
    } catch { /* 무시 */ }
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border px-4 py-4 shadow-lg"
      role="dialog"
      aria-label="쿠키 동의"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
          ModuMark는 더 나은 서비스를 위해 쿠키를 사용합니다.{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            개인정보처리방침
          </Link>
          을 참조하세요. 사용자 파일은 어떤 서버로도 전송되지 않습니다.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-md text-[13px] text-muted-foreground border border-border hover:bg-surface-secondary transition-colors"
          >
            거부
          </button>
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-md text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
