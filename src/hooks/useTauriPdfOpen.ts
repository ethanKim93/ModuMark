'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';
import { usePdfFileStore } from '@/stores/pdfFileStore';

/**
 * Tauri 앱에서 .pdf 파일 더블클릭 시 PDF 뷰어로 여는 훅
 * - app:open-pdf-files 이벤트 수신
 * - @tauri-apps/plugin-fs로 파일 바이너리 읽기
 * - pdfFileStore에 File 객체 추가 후 /pdf 페이지로 이동
 */
export function useTauriPdfOpen() {
  const router = useRouter();
  const { addFiles } = usePdfFileStore();

  useEffect(() => {
    if (!isTauriApp()) return;

    let unlisten: (() => void) | null = null;

    const setup = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { readFile } = await import('@tauri-apps/plugin-fs');

        unlisten = await listen<string[]>('app:open-pdf-files', async (event) => {
          const filePaths = event.payload;
          const files: File[] = [];

          for (const filePath of filePaths) {
            try {
              const bytes = await readFile(filePath);
              const name = filePath.split(/[\\/]/).pop() ?? 'document.pdf';
              const file = new File([bytes], name, { type: 'application/pdf' });
              files.push(file);
            } catch {
              // 파일 읽기 실패 무시
            }
          }

          if (files.length > 0) {
            addFiles(files);
            router.push('/pdf');
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
  }, [router, addFiles]);
}
