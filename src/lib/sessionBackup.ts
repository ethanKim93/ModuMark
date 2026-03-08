/**
 * Tauri 세션 백업 인프라
 * - %APPDATA%/com.modumark/backup/session.json 에 탭 상태 저장
 * - Tauri 환경에서만 동작 (웹에서는 no-op)
 * - 백업은 선택적 기능 — 실패 시 오류를 무시
 */
import { isTauriApp } from './environment';
import type { Tab } from '@/stores/tabStore';

/** 백업 파일명 */
const BACKUP_FILENAME = 'session.json';

/** 백업 디렉토리 (BaseDirectory.AppData 기준 상대 경로) */
const BACKUP_DIR = 'backup';

/** 백업 파일 전체 경로 (상대) */
const BACKUP_PATH = `${BACKUP_DIR}/${BACKUP_FILENAME}`;

export interface BackupData {
  version: number;
  savedAt: string;
  tabs: Pick<Tab, 'id' | 'title' | 'content' | 'isDirty'>[];
  activeTabId: string | null;
}

/**
 * 탭 상태를 백업 파일로 저장
 * @param tabs 현재 탭 목록
 * @param activeTabId 현재 활성 탭 ID
 */
export async function saveBackup(
  tabs: Tab[],
  activeTabId: string | null
): Promise<void> {
  if (!isTauriApp()) return;

  try {
    const { writeTextFile, mkdir, BaseDirectory } = await import('@tauri-apps/plugin-fs');

    // 백업 디렉토리 자동 생성 (없으면 생성)
    await mkdir(BACKUP_DIR, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    }).catch(() => { /* 이미 존재하면 무시 */ });

    const data: BackupData = {
      version: 1,
      savedAt: new Date().toISOString(),
      // FileHandle은 직렬화 불가 → 제외
      tabs: tabs.map(({ id, title, content, isDirty }) => ({
        id, title, content, isDirty,
      })),
      activeTabId,
    };

    await writeTextFile(BACKUP_PATH, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppData,
    });
  } catch {
    // 백업 실패는 무시 — 선택적 기능
  }
}

/**
 * 백업 파일에서 탭 상태 읽기
 * @returns 백업 데이터 또는 null (백업 없거나 읽기 실패)
 */
export async function loadBackup(): Promise<BackupData | null> {
  if (!isTauriApp()) return null;

  try {
    const { readTextFile, BaseDirectory } = await import('@tauri-apps/plugin-fs');

    const raw = await readTextFile(BACKUP_PATH, {
      baseDir: BaseDirectory.AppData,
    });

    const data = JSON.parse(raw) as BackupData;

    // 버전 검증
    if (data.version !== 1 || !Array.isArray(data.tabs)) {
      return null;
    }

    return data;
  } catch {
    // 파일 없거나 파싱 실패 → null 반환
    return null;
  }
}

/**
 * 백업 파일 삭제 (명시적 저장 후 호출)
 */
export async function clearBackup(): Promise<void> {
  if (!isTauriApp()) return;

  try {
    const { remove, BaseDirectory } = await import('@tauri-apps/plugin-fs');

    await remove(BACKUP_PATH, {
      baseDir: BaseDirectory.AppData,
    });
  } catch {
    // 파일 없어도 무시
  }
}
