'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';
import { useTabStore } from '@/stores/tabStore';
import { usePdfFileStore } from '@/stores/pdfFileStore';

// TauriAutoRedirect가 파일 연결 처리 완료 전에 리다이렉트하지 않도록 하는 전역 플래그
declare global {
  interface Window {
    __TAURI_FILE_OPEN_DONE__?: boolean;
  }
}

// Rust에서 직렬화되어 오는 파일 데이터 타입
interface MdFileData {
  name: string;
  content: string;
}

interface PdfFileData {
  name: string;
  bytes: number[];
}

interface InitialFileData {
  md_files: MdFileData[];
  pdf_files: PdfFileData[];
}

/**
 * Tauri 파일 연결 전역 라우팅 프로바이더
 * - layout.tsx에 배치하여 앱 전체에서 파일 열기 처리
 *
 * [Pull 방식] 앱 시작 시 invoke('get_initial_files')로 초기 파일 수신
 *   → 레이스 컨디션 없음: 리스너 등록 전에 이벤트가 emit되어도 데이터 손실 없음
 *   → FS Scope 제한 없음: Rust가 std::fs로 직접 읽어서 내용을 반환
 *
 * [Push 방식] 앱 실행 중 파일 더블클릭 시 이벤트 수신 (single-instance)
 *   → app:open-files (.md) → tabStore에 탭 추가 → /markdown 이동
 *   → app:open-pdf-files (.pdf) → pdfFileStore에 파일 추가 → /pdf 이동
 */

/** IPC 채널 준비 전 호출 방지를 위한 재시도 헬퍼 */
async function invokeWithRetry<T>(
  invoker: () => Promise<T>,
  maxRetries = 5,
  delayMs = 500
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await invoker();
    } catch (e) {
      lastError = e;
      console.log(`[TauriFileOpen] invoke 재시도 ${i + 1}/${maxRetries}...`, e);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

/** router.push 후 경로 미이동 시 hard navigation 폴백 */
function navigateTo(router: ReturnType<typeof useRouter>, path: string) {
  console.log(`[TauriFileOpen] 페이지 이동: ${path}`);
  router.push(path);
  // 1초 후 경로 미이동 시 window.location.href 폴백
  setTimeout(() => {
    if (!window.location.pathname.startsWith(path.split('?')[0])) {
      console.log(`[TauriFileOpen] router.push 실패, hard navigation 폴백: ${path}`);
      window.location.href = path;
    }
  }, 1000);
}

export function TauriFileOpenProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!isTauriApp()) return;

    console.log('[TauriFileOpen] 초기화 시작');

    let unlistenMd: (() => void) | null = null;
    let unlistenPdf: (() => void) | null = null;

    const setup = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { invoke } = await import('@tauri-apps/api/core');

        console.log('[TauriFileOpen] Tauri API 로드 완료, get_initial_files 호출 시작');

        // Pull 방식: 마운트 후 즉시 초기 파일 데이터 요청
        // IPC 채널 미준비 시 최대 5회 재시도 (500ms 간격)
        const initialFiles = await invokeWithRetry<InitialFileData>(
          () => invoke<InitialFileData>('get_initial_files')
        );

        console.log(
          `[TauriFileOpen] 초기 파일 수신: md=${initialFiles.md_files.length}, pdf=${initialFiles.pdf_files.length}`
        );

        // 초기 MD 파일 처리
        if (initialFiles.md_files.length > 0) {
          console.log('[TauriFileOpen] MD 파일 처리 시작:', initialFiles.md_files.map((f) => f.name));
          const store = useTabStore.getState();
          // 파일 연결로 열린 경우 세션 복원 스킵 플래그 설정
          store.setOpenedFromFileAssociation(true);
          for (const file of initialFiles.md_files) {
            const existing = store.tabs.find((t) => t.title === file.name);
            if (existing) {
              store.switchTab(existing.id);
            } else {
              store.openTab({ title: file.name, content: file.content, isDirty: false });
            }
          }
          // 파일 연결로 탭을 추가한 후 기본 빈 탭("Untitled") 제거
          const updatedStore = useTabStore.getState();
          const defaultTab = updatedStore.tabs.find(
            (t) => t.title === 'Untitled' && t.content === ''
          );
          if (defaultTab) {
            updatedStore.closeTab(defaultTab.id);
          }
          // 파일 연결 처리 완료 신호 — TauriAutoRedirect가 이 플래그 확인
          window.__TAURI_FILE_OPEN_DONE__ = true;
          navigateTo(router, '/markdown');
        }

        // 초기 PDF 파일 처리
        if (initialFiles.pdf_files.length > 0) {
          console.log('[TauriFileOpen] PDF 파일 처리 시작:', initialFiles.pdf_files.map((f) => f.name));
          useTabStore.getState().setOpenedFromFileAssociation(true);
          // setActiveFile()로 viewerFiles 탭 추가 + activeFile + activeViewerFileId 일괄 설정
          for (const f of initialFiles.pdf_files) {
            const file = new File([new Uint8Array(f.bytes)], f.name, { type: 'application/pdf' });
            usePdfFileStore.getState().setActiveFile(file);
          }
          // 파일 연결 처리 완료 신호 — TauriAutoRedirect가 이 플래그 확인
          window.__TAURI_FILE_OPEN_DONE__ = true;
          navigateTo(router, '/pdf');
        }

        // 파일이 없는 경우에도 완료 신호 설정 (TauriAutoRedirect가 즉시 리다이렉트 가능)
        if (initialFiles.md_files.length === 0 && initialFiles.pdf_files.length === 0) {
          window.__TAURI_FILE_OPEN_DONE__ = true;
        }

        // Push 방식: 앱 실행 중 파일 열기 이벤트 수신 (single-instance 케이스)
        unlistenMd = await listen<MdFileData[]>('app:open-files', (event) => {
          console.log('[TauriFileOpen] app:open-files 이벤트 수신:', event.payload.map((f) => f.name));
          const store = useTabStore.getState();
          for (const file of event.payload) {
            const existing = store.tabs.find((t) => t.title === file.name);
            if (existing) {
              store.switchTab(existing.id);
            } else {
              store.openTab({ title: file.name, content: file.content, isDirty: false });
            }
          }
          navigateTo(router, '/markdown');
        });

        unlistenPdf = await listen<PdfFileData[]>('app:open-pdf-files', (event) => {
          console.log('[TauriFileOpen] app:open-pdf-files 이벤트 수신:', event.payload.map((f) => f.name));
          if (event.payload.length > 0) {
            // setActiveFile()로 viewerFiles 탭 추가 + activeFile + activeViewerFileId 일괄 설정
            for (const f of event.payload) {
              const file = new File([new Uint8Array(f.bytes)], f.name, { type: 'application/pdf' });
              usePdfFileStore.getState().setActiveFile(file);
            }
            navigateTo(router, '/pdf');
          }
        });

        console.log('[TauriFileOpen] 이벤트 리스너 등록 완료');
      } catch (e) {
        console.error('[TauriFileOpen] 설정 중 오류 발생:', e);
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
