'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isTauriApp } from '@/lib/environment';
import { useTabStore } from '@/stores/tabStore';
import { usePdfFileStore } from '@/stores/pdfFileStore';

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
export function TauriFileOpenProvider() {
  const router = useRouter();

  useEffect(() => {
    if (!isTauriApp()) return;

    let unlistenMd: (() => void) | null = null;
    let unlistenPdf: (() => void) | null = null;

    const setup = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const { invoke } = await import('@tauri-apps/api/core');

        // Pull 방식: 마운트 후 즉시 초기 파일 데이터 요청
        // Rust가 std::fs로 파일을 읽어 반환 → FS Scope 제한 우회
        const initialFiles = await invoke<InitialFileData>('get_initial_files');

        // 초기 MD 파일 처리
        if (initialFiles.md_files.length > 0) {
          const store = useTabStore.getState();
          for (const file of initialFiles.md_files) {
            const existing = store.tabs.find((t) => t.title === file.name);
            if (existing) {
              store.switchTab(existing.id);
            } else {
              store.openTab({ title: file.name, content: file.content, isDirty: false });
            }
          }
          router.push('/markdown');
        }

        // 초기 PDF 파일 처리
        if (initialFiles.pdf_files.length > 0) {
          const files = initialFiles.pdf_files.map(
            (f) => new File([new Uint8Array(f.bytes)], f.name, { type: 'application/pdf' })
          );
          usePdfFileStore.getState().addFiles(files);
          router.push('/pdf');
        }

        // Push 방식: 앱 실행 중 파일 열기 이벤트 수신 (single-instance 케이스)
        // Rust가 파일 내용을 이벤트 페이로드에 포함하여 emit → FS Scope 제한 우회
        unlistenMd = await listen<MdFileData[]>('app:open-files', (event) => {
          const store = useTabStore.getState();
          for (const file of event.payload) {
            const existing = store.tabs.find((t) => t.title === file.name);
            if (existing) {
              store.switchTab(existing.id);
            } else {
              store.openTab({ title: file.name, content: file.content, isDirty: false });
            }
          }
          router.push('/markdown');
        });

        unlistenPdf = await listen<PdfFileData[]>('app:open-pdf-files', (event) => {
          const files = event.payload.map(
            (f) => new File([new Uint8Array(f.bytes)], f.name, { type: 'application/pdf' })
          );
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
