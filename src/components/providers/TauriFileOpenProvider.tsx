'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';
import { useTabStore } from '@/stores/tabStore';
import { usePdfFileStore } from '@/stores/pdfFileStore';

/**
 * Tauri 파일 연결 전역 라우팅 프로바이더
 * - layout.tsx에 배치하여 앱 전체에서 파일 열기 이벤트 수신
 * - app:open-files (.md) → tabStore에 탭 추가 → /markdown 이동
 * - app:open-pdf-files (.pdf) → pdfFileStore에 파일 추가 → /pdf 이동
 */
export function TauriFileOpenProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!isTauriApp()) return;

    let unlistenMd: (() => void) | null = null;
    let unlistenPdf: (() => void) | null = null;

    const setup = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { readTextFile, readFile } = await import('@tauri-apps/plugin-fs');

        /* .md 파일 이벤트: 마크다운 에디터 탭으로 열기 */
        unlistenMd = await listen<string[]>('app:open-files', async (event) => {
          const filePaths = event.payload;
          const store = useTabStore.getState();

          for (const filePath of filePaths) {
            try {
              const content = await readTextFile(filePath);
              const name = filePath.split(/[\\/]/).pop() ?? 'untitled.md';

              // 이미 열린 탭이면 전환, 없으면 새 탭 생성
              const existing = store.tabs.find((t) => t.title === name);
              if (existing) {
                store.switchTab(existing.id);
              } else {
                store.openTab({ title: name, content, isDirty: false });
              }
            } catch {
              // 파일 읽기 실패 무시
            }
          }

          router.push('/markdown');
        });

        /* .pdf 파일 이벤트: PDF 뷰어로 열기 */
        unlistenPdf = await listen<string[]>('app:open-pdf-files', async (event) => {
          const filePaths = event.payload;
          const files: File[] = [];

          for (const filePath of filePaths) {
            try {
              const bytes = await readFile(filePath);
              const name = filePath.split(/[\\/]/).pop() ?? 'document.pdf';
              files.push(new File([bytes], name, { type: 'application/pdf' }));
            } catch {
              // 파일 읽기 실패 무시
            }
          }

          if (files.length > 0) {
            usePdfFileStore.getState().addFiles(files);
            router.push('/pdf');
          }
        });
      } catch {
        // Tauri API 미사용 환경 무시
      }
    };

    setup();

    return () => {
      unlistenMd?.();
      unlistenPdf?.();
    };
  }, [router]);

  return null;
}
