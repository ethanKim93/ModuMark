'use client';

import Link from 'next/link';
import { HardDrive, X } from 'lucide-react';
import { useStorageWarning } from '@/hooks/useStorageWarning';

/**
 * 웹 환경 스토리지 50MB 초과 시 표시되는 비침습적 배너
 * - /download 페이지로 연결하는 CTA 포함
 * - Tauri 환경에서는 useStorageWarning이 항상 false 반환
 */
export function StorageWarningBanner() {
  const { show, dismiss } = useStorageWarning();

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[13px]">
      <HardDrive className="h-4 w-4 text-amber-500 shrink-0" />
      <p className="flex-1 text-amber-700 dark:text-amber-400">
        브라우저 저장 공간이 50MB를 초과했습니다. 파일이 많아질수록 저장에 실패할 수 있습니다.
        <Link
          href="/download"
          className="ml-2 font-medium underline underline-offset-2 hover:text-amber-600"
        >
          데스크탑 앱 다운로드 →
        </Link>
      </p>
      <button
        onClick={dismiss}
        className="p-0.5 rounded hover:bg-amber-500/20 transition-colors"
        aria-label="닫기"
      >
        <X className="h-4 w-4 text-amber-500" />
      </button>
    </div>
  );
}
