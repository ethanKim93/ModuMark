'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { DownloadPrompt } from '@/components/platform/DownloadPrompt';

/** 스토리지 사용량 경고 임계값 (80%) */
const WARNING_THRESHOLD = 0.8;

/** localStorage 사용량을 바이트 단위로 추정 */
function estimateLocalStorageUsage(): number {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) ?? '';
      const value = localStorage.getItem(key) ?? '';
      // UTF-16 인코딩: 각 문자 2바이트
      total += (key.length + value.length) * 2;
    }
    return total;
  } catch {
    return 0;
  }
}

interface StorageInfo {
  usage: number;
  quota: number;
  ratio: number;
}

/**
 * 웹 스토리지 사용량 모니터링 및 경고 배너
 * - navigator.storage.estimate() 미지원 시 localStorage 직접 추정
 * - 80% 초과 시 경고 배너 표시
 */
export function StorageWarning() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 이미 닫은 경우 재표시 안 함 (세션 내 유지)
    const wasDismissed = sessionStorage.getItem('storage-warning-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    const checkStorage = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
          // 표준 Storage API 사용
          const estimate = await navigator.storage.estimate();
          const usage = estimate.usage ?? 0;
          const quota = estimate.quota ?? 0;
          if (quota > 0) {
            setStorageInfo({ usage, quota, ratio: usage / quota });
          }
        } else {
          // 폴백: localStorage 사용량 직접 추정 (quota 5MB 가정)
          const usage = estimateLocalStorageUsage();
          const quota = 5 * 1024 * 1024; // 5MB
          setStorageInfo({ usage, quota, ratio: usage / quota });
        }
      } catch {
        // 스토리지 API 오류 시 경고 표시 안 함
      }
    };

    checkStorage();
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('storage-warning-dismissed', '1');
    setDismissed(true);
  };

  // 경고 조건: 80% 초과 + 닫지 않은 상태
  if (!storageInfo || storageInfo.ratio < WARNING_THRESHOLD || dismissed) {
    return null;
  }

  const usedMB = (storageInfo.usage / 1024 / 1024).toFixed(1);
  const quotaMB = (storageInfo.quota / 1024 / 1024).toFixed(0);
  const percent = Math.round(storageInfo.ratio * 100);

  return (
    <div
      role="alert"
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 text-[13px]"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
      <span className="text-yellow-600 dark:text-yellow-400 flex-1">
        저장공간 {percent}% 사용 중 ({usedMB}MB / {quotaMB}MB).{' '}
        <Link
          href="/download"
          className="underline underline-offset-2 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium"
        >
          데스크탑 앱
        </Link>
        을 사용하면 로컬 파일로 무제한 저장할 수 있습니다.
      </span>
      <button
        onClick={handleDismiss}
        aria-label="경고 닫기"
        className="shrink-0 p-0.5 rounded hover:bg-yellow-500/20 text-yellow-500 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * 스토리지 초과 시 DownloadPrompt를 강제 표시하는 래퍼
 * AppHeader에서 StorageWarning 옆에 배치하거나 독립 사용 가능
 */
export function StorageDownloadPrompt() {
  const [storageOverLimit, setStorageOverLimit] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
          const estimate = await navigator.storage.estimate();
          const ratio = (estimate.usage ?? 0) / (estimate.quota ?? 1);
          setStorageOverLimit(ratio >= WARNING_THRESHOLD);
        }
      } catch {
        // 무시
      }
    };
    check();
  }, []);

  return <DownloadPrompt forceShow={storageOverLimit} />;
}
