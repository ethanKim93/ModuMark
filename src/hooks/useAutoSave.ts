import { useEffect, useRef } from 'react';
import { useTabStore } from '@/stores/tabStore';
import { saveMarkdownFile } from '@/lib/fileSystem';

const AUTO_SAVE_DELAY = 30_000; // 30초
const LS_PREFIX = 'modumark_autosave_';

export function useAutoSave(tabId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const content = useTabStore((s) => s.tabs.find((t) => t.id === tabId)?.content);
  const isDirty = useTabStore((s) => s.tabs.find((t) => t.id === tabId)?.isDirty);
  const fileHandle = useTabStore((s) => s.tabs.find((t) => t.id === tabId)?.fileHandle);

  useEffect(() => {
    if (!isDirty) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const store = useTabStore.getState();

      if (fileHandle) {
        /* 파일핸들 있으면 실제 파일 저장 */
        try {
          await saveMarkdownFile(content ?? '', fileHandle);
          store.setDirty(tabId, false);
        } catch {
          /* 저장 실패 — 조용히 무시 */
        }
      } else {
        /* 파일핸들 없으면 localStorage에 백업 */
        try {
          localStorage.setItem(LS_PREFIX + tabId, content ?? '');
        } catch {
          /* QuotaExceededError 무시 */
        }
      }
    }, AUTO_SAVE_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [content, isDirty, tabId, fileHandle]);
}
