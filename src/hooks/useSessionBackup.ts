'use client';

import { useEffect, useRef } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { isTauriApp } from '@/lib/environment';
import { saveBackup, clearBackup } from '@/lib/sessionBackup';

/** 세션 백업 디바운스 지연 시간 (5초) */
const BACKUP_DEBOUNCE_MS = 5000;

/**
 * Tauri 환경 전용 에디터 세션 자동 백업 훅
 * - 탭 상태 변경 감지 → 5초 디바운스 후 백업 저장
 * - window.beforeunload 시 즉시 백업 저장
 * - 웹 환경(isTauriApp()=false)에서는 완전 비활성화
 */
export function useSessionBackup() {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Tauri 환경이 아니면 비활성화
    if (!isTauriApp()) return;

    // tabs 변경 구독 (Zustand store)
    const unsubscribe = useTabStore.subscribe((state) => {
      const { tabs, activeTabId } = state;

      // 5초 디바운스 타이머 재시작
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        saveBackup(tabs, activeTabId);
      }, BACKUP_DEBOUNCE_MS);
    });

    // 앱 종료 시 즉시 백업 저장 (debounce 무시)
    const handleBeforeUnload = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      const { tabs, activeTabId } = useTabStore.getState();
      // beforeunload는 비동기 불가 — 동기적 처리를 위해 최선을 다함
      saveBackup(tabs, activeTabId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * 명시적 저장 후 백업 파일 삭제
   * EditorToolbar의 저장 버튼 클릭 시 호출
   */
  const onExplicitSave = async () => {
    if (!isTauriApp()) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    await clearBackup();
  };

  return { onExplicitSave };
}
