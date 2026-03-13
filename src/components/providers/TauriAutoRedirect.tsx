'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';

/**
 * Tauri 앱 자동 리다이렉트 컴포넌트
 * - Tauri 환경에서 루트(/) 접근 시 /markdown으로 이동
 * - 파일 연결로 열린 경우 TauriFileOpenProvider가 먼저 처리하므로 충돌 없음
 * - 300ms 지연으로 TauriFileOpenProvider 우선권 보장
 */
export function TauriAutoRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isTauriApp()) return;
    if (pathname !== '/') return;

    // TauriFileOpenProvider가 파일 연결 라우팅을 먼저 처리할 수 있도록 지연
    const timer = setTimeout(() => {
      // 파일 연결로 이미 다른 경로로 이동했다면 무시
      if (window.location.pathname === '/') {
        router.replace('/markdown');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, router]);

  return null;
}
