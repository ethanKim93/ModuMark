'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';

/**
 * Tauri 앱 자동 리다이렉트 컴포넌트
 * - Tauri 환경에서 루트(/) 접근 시 /markdown으로 이동
 * - TauriFileOpenProvider의 __TAURI_FILE_OPEN_TARGET__ 플래그가 설정되면 절대 간섭하지 않음
 *   (플래그가 있으면 TauriFileOpenProvider가 이미 라우팅을 처리 중)
 * - 플래그 미설정 상태로 5초 경과 시 비상 폴백: /markdown으로 이동
 */
export function TauriAutoRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isTauriApp()) return;
    if (pathname !== '/') return;

    const MAX_WAIT_MS = 5000; // TauriFileOpenProvider 완전 실패 대비 대기 (5초)
    const POLL_INTERVAL_MS = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += POLL_INTERVAL_MS;
      const target = window.__TAURI_FILE_OPEN_TARGET__;

      if (target) {
        // TauriFileOpenProvider가 이미 라우팅을 처리 중 → 간섭 금지
        clearInterval(timer);
        return;
      }

      if (elapsed >= MAX_WAIT_MS && window.location.pathname === '/') {
        // TauriFileOpenProvider가 5초 내 플래그조차 설정 못함 → 비상 폴백
        clearInterval(timer);
        router.replace('/markdown');
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [pathname, router]);

  return null;
}
