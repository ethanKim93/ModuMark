'use client';

import { useEffect, useState } from 'react';
import { isTauriApp } from '@/lib/environment';

export interface UpdateInfo {
  version: string;
  body: string | null;
}

/**
 * Tauri 자동 업데이터 훅
 * - 앱 시작 시 GitHub Releases에서 새 버전 감지
 * - 업데이트 가능 시 updateAvailable=true, updateInfo 반환
 * - installUpdate(): 사용자 동의 후 다운로드·설치·재시작
 * - 웹 환경에서는 비활성화
 */
export function useAutoUpdater() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!isTauriApp()) return;

    const checkUpdate = async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        const update = await check();

        if (update?.available) {
          setUpdateAvailable(true);
          setUpdateInfo({
            version: update.version,
            body: update.body ?? null,
          });
        }
      } catch {
        // 업데이트 체크 실패 무시 (오프라인 등)
      }
    };

    // 앱 시작 후 3초 뒤 체크 (UI 로딩 완료 후)
    const timer = setTimeout(checkUpdate, 3000);
    return () => clearTimeout(timer);
  }, []);

  const installUpdate = async () => {
    if (!updateAvailable || isInstalling) return;

    setIsInstalling(true);
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');
      const update = await check();

      if (update?.available) {
        // 다운로드 및 설치
        await update.downloadAndInstall();
        // 설치 완료 후 앱 재시작
        await relaunch();
      }
    } catch {
      setIsInstalling(false);
    }
  };

  return { updateAvailable, updateInfo, isInstalling, installUpdate };
}
