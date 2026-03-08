'use client';

import { useEffect } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { saveMarkdownFile } from '@/lib/fileSystem';

/**
 * 에디터 전역 키보드 단축키 훅
 * - Ctrl+S: 저장
 * - Ctrl+Shift+S: 다른 이름으로 저장
 * - Ctrl+T: 새 탭
 * - Ctrl+W: 현재 탭 닫기
 * Ctrl+Z(Undo) / Ctrl+B / Ctrl+I / Ctrl+K 는 Milkdown 에디터가 기본 처리
 */
export function useKeyboard() {
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 's': {
          // Ctrl+S / Ctrl+Shift+S 는 EditorCanvas에서도 처리하므로 중복 방지
          // useKeyboard 에서는 저장 로직 자체는 EditorCanvas에 위임
          // 여기서는 preventDefault만 보장
          e.preventDefault();

          const store = useTabStore.getState();
          const tab = store.getActiveTab();
          if (!tab) break;

          const forceNew = e.shiftKey;
          const result = await saveMarkdownFile(
            tab.content,
            forceNew ? null : (tab.fileHandle ?? null)
          );
          if (result) {
            store.setFileHandle(tab.id, result.handle, result.name);
          } else {
            store.setDirty(tab.id, false);
          }
          break;
        }

        case 't': {
          // Ctrl+T: 새 빈 탭 생성 (브라우저 새 탭 기본 동작 방지)
          e.preventDefault();
          useTabStore.getState().openTab({
            title: 'Untitled',
            content: '',
            isDirty: false,
          });
          break;
        }

        case 'w': {
          // Ctrl+W: 현재 활성 탭 닫기 (브라우저 탭 닫기 기본 동작 방지)
          e.preventDefault();
          const store = useTabStore.getState();
          const activeId = store.activeTabId;
          if (activeId) {
            store.closeTab(activeId);
          }
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
