'use client';

import { useEffect, useState } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSessionBackup } from '@/hooks/useSessionBackup';
import { useSessionRestore } from '@/hooks/useSessionRestore';
import { MilkdownEditor } from './MilkdownEditor';
import { MarkdownToolbar } from './MarkdownToolbar';
import { RawMarkdown } from './RawMarkdown';
import { ModeToggle, type MarkdownEditorMode } from './ModeToggle';

export function MarkdownCanvas() {
  const { tabs, activeTabId, updateContent } = useTabStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  /* 에디터 모드 상태: 탭 전환 시 WYSIWYG로 초기화 */
  const [mode, setMode] = useState<MarkdownEditorMode>('wysiwyg');

  /* 탭이 변경되면 WYSIWYG 모드로 초기화 */
  useEffect(() => {
    setMode('wysiwyg');
  }, [activeTabId]);

  /* 활성 탭 자동 저장 (30초 디바운스) */
  useAutoSave(activeTabId ?? '');

  /* Ctrl+S / Ctrl+T / Ctrl+W 키보드 단축키 통합 훅 */
  useKeyboard();

  /* Tauri 환경: 앱 시작 시 이전 세션 복원 */
  useSessionRestore();

  /* Tauri 환경: 5초 디바운스 세션 자동 백업 */
  useSessionBackup();
  /* 파일 연결 라우팅은 TauriFileOpenProvider(layout.tsx)에서 전역 처리 */

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
      <MarkdownToolbar>
        {/* 모드 토글 버튼을 툴바에 삽입 */}
        <div className="w-px h-4 bg-border mx-0.5" />
        <ModeToggle mode={mode} onToggle={setMode} />
      </MarkdownToolbar>
      <div className="flex-1 overflow-auto bg-background py-6 px-4">
        <div
          className="max-w-4xl mx-auto px-8 py-10 min-h-full rounded-lg bg-markdown-surface border border-border/30"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}
        >
          {mode === 'wysiwyg' ? (
            /* 탭 전환 시 key를 변경하여 에디터를 re-mount → 콘텐츠 초기화 */
            <MilkdownEditor
              key={activeTab.id}
              defaultValue={activeTab.content}
              onChange={(markdown) => updateContent(activeTab.id, markdown)}
            />
          ) : (
            /* Raw 모드: textarea로 마크다운 직접 편집 — 내용이 탭 스토어와 동기화됨 */
            <RawMarkdown
              value={activeTab.content}
              onChange={(markdown) => updateContent(activeTab.id, markdown)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
