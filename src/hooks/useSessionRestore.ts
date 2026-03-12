'use client';

import { useEffect } from 'react';
import { isTauriApp } from '@/lib/environment';
import { loadBackup, clearBackup } from '@/lib/sessionBackup';
import { useTabStore } from '@/stores/tabStore';

/**
 * Tauri 환경 전용 세션 복원 훅
 * - 마운트 시 backup/session.json을 읽어 탭 상태 복원
 * - 기본 탭('Untitled', 빈 콘텐츠)만 있을 때만 복원 (사용자 작업 보호)
 * - 복원 성공 시 백업 파일 삭제
 */
export function useSessionRestore() {
  useEffect(() => {
    if (!isTauriApp()) return;

    const restore = async () => {
      const backup = await loadBackup();
      if (!backup || backup.tabs.length === 0) return;

      const store = useTabStore.getState();
      const currentTabs = store.tabs;

      // 파일 연결로 열린 경우 세션 복원 스킵 (경쟁 조건 방지)
      if (store.isOpenedFromFileAssociation) return;

      // 기본 탭(Untitled, 빈 콘텐츠)만 있을 때만 복원
      const isDefaultState =
        currentTabs.length === 1 &&
        currentTabs[0].title === 'Untitled' &&
        currentTabs[0].content === '';

      if (!isDefaultState) return;

      // 백업 탭 복원
      for (const tab of backup.tabs) {
        store.openTab({
          title: tab.title,
          content: tab.content,
          isDirty: tab.isDirty,
        });
      }

      // 기존 기본 탭 제거 (openTab 후 초기 Untitled 탭 닫기)
      if (currentTabs.length > 0) {
        store.closeTab(currentTabs[0].id);
      }

      // 활성 탭 복원
      if (backup.activeTabId) {
        const restored = useTabStore.getState().tabs.find(
          (t) => t.title === backup.tabs.find((b) => b.id === backup.activeTabId)?.title
        );
        if (restored) {
          store.switchTab(restored.id);
        }
      }

      // 복원 완료 후 백업 파일 삭제
      await clearBackup();
    };

    restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
