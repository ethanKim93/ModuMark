'use client';

import { useEffect, useState } from 'react';
import { isTauriApp } from '@/lib/environment';

/** IndexedDB 소프트 한도 (50MB) */
const STORAGE_SOFT_LIMIT_MB = 50;
const STORAGE_SOFT_LIMIT_BYTES = STORAGE_SOFT_LIMIT_MB * 1024 * 1024;

/**
 * 웹 환경 IndexedDB 스토리지 사용량 체크 훅
 * - navigator.storage.estimate() API 활용
 * - 50MB 초과 시 storageExceeded = true 반환
 * - Tauri 환경에서는 항상 false
 */
export function useStorageWarning() {
  const [storageExceeded, setStorageExceeded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Tauri 환경에서는 스토리지 경고 불필요
    if (isTauriApp()) return;
    // Storage Estimation API 미지원 환경 무시
    if (!navigator.storage?.estimate) return;

    const checkStorage = async () => {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage ?? 0;
        if (usage > STORAGE_SOFT_LIMIT_BYTES) {
          setStorageExceeded(true);
        }
      } catch {
        // 스토리지 체크 실패 무시
      }
    };

    // 앱 시작 시 1회 체크
    checkStorage();
  }, []);

  const dismiss = () => setDismissed(true);

  return {
    show: storageExceeded && !dismissed,
    dismiss,
  };
}
