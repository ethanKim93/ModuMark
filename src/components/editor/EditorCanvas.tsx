'use client';

import { useEffect, useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSessionBackup } from '@/hooks/useSessionBackup';
import { useTauriFileOpen } from '@/hooks/useTauriFileOpen';
import { MilkdownEditor } from './MilkdownEditor';
import { EditorToolbar } from './EditorToolbar';
import { RawEditor } from './RawEditor';
import { ModeToggle, type EditorMode } from './ModeToggle';

export function EditorCanvas() {
  const { tabs, activeTabId, updateContent } = useTabStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  /* 에디터 모드 상태: 탭 전환 시 WYSIWYG로 초기화 */
  const [mode, setMode] = useState<EditorMode>('wysiwyg');

  /* 탭이 변경되면 WYSIWYG 모드로 초기화 */
  useEffect(() => {
    setMode('wysiwyg');
  }, [activeTabId]);

  /* 활성 탭 자동 저장 (30초 디바운스) */
  useAutoSave(activeTabId ?? '');

  /* Ctrl+S / Ctrl+T / Ctrl+W 키보드 단축키 통합 훅 */
  useKeyboard();

  /* Tauri 환경: 5초 디바운스 세션 자동 백업 */
  useSessionBackup();

  /* Tauri 환경: OS 파일 연결 — .md 파일 더블클릭 시 탭으로 열기 */
  useTauriFileOpen();

  /* 미저장 탭 있을 때 브라우저 닫기/새로고침 경고 */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const hasDirty = useTabStore.getState().tabs.some((t) => t.isDirty);
      if (hasDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="text-[14px] text-muted-foreground">탭을 선택하세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorToolbar>
        {/* 모드 토글 버튼을 툴바에 삽입 */}
        <div className="w-px h-4 bg-border mx-0.5" />
        <ModeToggle mode={mode} onToggle={setMode} />
      </EditorToolbar>
      <div className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8 min-h-full">
          {mode === 'wysiwyg' ? (
            /* 탭 전환 시 key를 변경하여 에디터를 re-mount → 콘텐츠 초기화 */
            <MilkdownEditor
              key={activeTab.id}
              defaultValue={activeTab.content}
              onChange={(markdown) => updateContent(activeTab.id, markdown)}
            />
          ) : (
            /* Raw 모드: textarea로 마크다운 직접 편집 — 내용이 탭 스토어와 동기화됨 */
            <RawEditor
              value={activeTab.content}
              onChange={(markdown) => updateContent(activeTab.id, markdown)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
