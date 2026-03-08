'use client';

import { useEffect, useState } from 'react';

/**
 * Ad Blocker 감지 훅
 * - 광고 프로브 URL에 fetch를 시도하여 차단 여부 확인
 * - 차단된 경우 isAdBlockDetected=true 반환
 */
export function useAdBlockDetect(): boolean {
  const [isAdBlockDetected, setIsAdBlockDetected] = useState(false);

  useEffect(() => {
    const detect = async () => {
      try {
        // 광고 차단기가 공통으로 차단하는 경로로 프로브 fetch
        const response = await fetch(
          '/ads/banner.js',
          {
            method: 'HEAD',
            cache: 'no-store',
          }
        );
        // 200이 아닌 경우도 차단으로 간주 (404는 파일 없음이므로 정상)
        if (!response.ok && response.status !== 404) {
          setIsAdBlockDetected(true);
        }
      } catch {
        // fetch 자체가 차단된 경우 (네트워크 오류)
        setIsAdBlockDetected(true);
      }

      // 보조 감지: DOM 기반 — 광고 차단기가 숨기는 클래스명 엘리먼트 생성
      try {
        const probe = document.createElement('div');
        probe.innerHTML = '&nbsp;';
        probe.className = 'adsbox ad-banner ads advertisement';
        probe.style.position = 'absolute';
        probe.style.top = '-9999px';
        probe.style.left = '-9999px';
        probe.style.width = '1px';
        probe.style.height = '1px';
        document.body.appendChild(probe);

        // 광고 차단기가 probe를 숨기거나 제거했는지 확인
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
        const isHidden =
          probe.offsetHeight === 0 ||
          probe.offsetParent === null ||
          getComputedStyle(probe).display === 'none' ||
          getComputedStyle(probe).visibility === 'hidden';

        document.body.removeChild(probe);

        if (isHidden) {
          setIsAdBlockDetected(true);
        }
      } catch {
        // DOM 조작 실패는 무시
      }
    };

    detect();
  }, []);

  return isAdBlockDetected;
}
