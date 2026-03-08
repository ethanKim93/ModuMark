'use client';

import { useEffect } from 'react';
import { isTauriApp } from '@/lib/environment';
import { useTabStore } from '@/stores/tabStore';

/**
 * Tauri 앱에서 .md 파일 더블클릭 시 에디터 탭으로 여는 훅
 * - app:open-files 이벤트 수신
 * - @tauri-apps/plugin-fs로 파일 읽기
 * - tabStore.openTab()으로 탭 생성
 */
export function useTauriFileOpen() {
  useEffect(() => {
    if (!isTauriApp()) return;

    let unlisten: (() => void) | null = null;

    const setup = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { readTextFile } = await import('@tauri-apps/plugin-fs');

        unlisten = await listen<string[]>('app:open-files', async (event) => {
          const filePaths = event.payload;
          const store = useTabStore.getState();

          for (const filePath of filePaths) {
            try {
              const content = await readTextFile(filePath);
              const name = filePath.split(/[\\/]/).pop() ?? 'untitled.md';

              // 이미 열린 같은 이름의 탭이 있으면 해당 탭으로 전환
              const existing = store.tabs.find((t) => t.title === name);
              if (existing) {
                store.switchTab(existing.id);
              } else {
                store.openTab({
                  title: name,
                  content,
                  isDirty: false,
                });
              }
            } catch {
              // 파일 읽기 실패 무시 (파일이 삭제됐거나 권한 없는 경우)
            }
          }
        });
      } catch {
        // Tauri API 미사용 환경 무시
      }
    };

    setup();

    return () => {
      unlisten?.();
    };
  }, []);
}
