'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';

/**
 * Tauri 앱 자동 리다이렉트 컴포넌트
 * - Tauri 환경에서 루트(/) 접근 시 /markdown으로 이동
 * - TauriFileOpenProvider의 __TAURI_FILE_OPEN_DONE__ 플래그를 확인하여
 *   파일 연결 처리가 완료된 후에만 리다이렉트 (경쟁 조건 방지)
 * - IPC 재시도 최대 2.5초(5회 × 500ms) 소요 가능 → 최대 3초까지 대기
 */
export function TauriAutoRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isTauriApp()) return;
    if (pathname !== '/') return;

    const MAX_WAIT_MS = 3000;
    const POLL_INTERVAL_MS = 100;
    let elapsed = 0;

    // __TAURI_FILE_OPEN_DONE__ 플래그가 설정될 때까지 폴링
    // 플래그가 설정되면 파일 연결 처리 완료 → 경로가 아직 /이면 /markdown으로 이동
    const timer = setInterval(() => {
      elapsed += POLL_INTERVAL_MS;

      const done = window.__TAURI_FILE_OPEN_DONE__;
      const stillAtRoot = window.location.pathname === '/';

      if (done && stillAtRoot) {
        clearInterval(timer);
        router.replace('/markdown');
        return;
      }

      if (done && !stillAtRoot) {
        // 파일 연결로 이미 다른 경로로 이동함 — 아무것도 안 함
        clearInterval(timer);
        return;
      }

      if (elapsed >= MAX_WAIT_MS) {
        // 최대 대기 시간 초과 — 현재 경로가 /이면 폴백 리다이렉트
        clearInterval(timer);
        if (window.location.pathname === '/') {
          router.replace('/markdown');
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [pathname, router]);

  return null;
}
