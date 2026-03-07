'use client';

import { useEffect } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { saveMarkdownFile } from '@/lib/fileSystem';
import { useAutoSave } from '@/hooks/useAutoSave';
import { MilkdownEditor } from './MilkdownEditor';
import { EditorToolbar } from './EditorToolbar';

export function EditorCanvas() {
  const { tabs, activeTabId, updateContent, setFileHandle, setDirty } = useTabStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  /* 활성 탭 자동 저장 (30초 디바운스) */
  useAutoSave(activeTabId ?? '');

  /* 미저장 탭 있을 때 브라우저 닫기/새로고침 경고 */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasDirty = useTabStore.getState().tabs.some((t) => t.isDirty);
      if (hasDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  /* Ctrl+S / Ctrl+Shift+S 저장 단축키 */
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 's') return;
      e.preventDefault();

      const store = useTabStore.getState();
      const tab = store.getActiveTab();
      if (!tab) return;

      /* Ctrl+Shift+S: Save As */
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
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setFileHandle, setDirty]);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-[14px] text-muted-foreground">탭을 선택하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorToolbar />
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8 min-h-full">
          {/* 탭 전환 시 key를 변경하여 에디터를 re-mount → 콘텐츠 초기화 */}
          <MilkdownEditor
            key={activeTab.id}
            defaultValue={activeTab.content}
            onChange={(markdown) => updateContent(activeTab.id, markdown)}
          />
        </div>
      </div>
    </div>
  );
}
