'use client';

import { useEffect } from 'react';

const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`;
const CONSENT_KEY = 'cookie-consent';

function loadAdSenseScript() {
  /* 이미 로드된 경우 중복 방지 */
  if (document.querySelector(`script[data-adsense]`)) return;
  const script = document.createElement('script');
  script.src = ADSENSE_SRC;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.adsense = 'true';
  document.head.appendChild(script);
}

export function AdSenseScript() {
  useEffect(() => {
    /* 초기 동의 상태 확인: 명시적 동의(accepted)인 경우에만 로드 (opt-in) */
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (consent === 'accepted') {
        loadAdSenseScript();
      }
    } catch {
      /* localStorage 접근 불가 시 로드하지 않음 */
    }

    /* 동의 상태 변경 이벤트 수신 */
    const handleConsentChange = () => {
      try {
        const consent = localStorage.getItem(CONSENT_KEY);
        if (consent === 'accepted') {
          loadAdSenseScript();
        }
      } catch {
        /* 무시 */
      }
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange);
  }, []);

  return null;
}
