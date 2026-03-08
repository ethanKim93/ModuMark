/**
 * sessionBackup.ts 세션 백업 인프라 단위 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/environment', () => ({
  isTauriApp: vi.fn(),
}));

const mockWriteTextFile = vi.fn().mockResolvedValue(undefined);
const mockReadTextFile = vi.fn();
const mockRemove = vi.fn().mockResolvedValue(undefined);
const mockMkdir = vi.fn().mockResolvedValue(undefined);

vi.mock('@tauri-apps/plugin-fs', () => ({
  writeTextFile: mockWriteTextFile,
  readTextFile: mockReadTextFile,
  remove: mockRemove,
  mkdir: mockMkdir,
  BaseDirectory: {
    AppData: 'AppData',
  },
}));

import { isTauriApp } from '@/lib/environment';
import { saveBackup, loadBackup, clearBackup } from '../sessionBackup';
import type { Tab } from '@/stores/tabStore';

const mockTabs: Tab[] = [
  { id: 'tab-1', title: 'test.md', content: '# 테스트', isDirty: false },
  { id: 'tab-2', title: 'Untitled', content: '', isDirty: true },
];

describe('sessionBackup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveBackup', () => {
    it('Tauri 환경이 아니면 아무것도 하지 않는다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(false);
      await saveBackup(mockTabs, 'tab-1');
      expect(mockWriteTextFile).not.toHaveBeenCalled();
    });

    it('Tauri 환경에서 백업 파일을 저장한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      await saveBackup(mockTabs, 'tab-1');
      expect(mockMkdir).toHaveBeenCalledWith('backup', {
        baseDir: 'AppData',
        recursive: true,
      });
      expect(mockWriteTextFile).toHaveBeenCalledOnce();
    });

    it('저장되는 JSON에 version, savedAt, tabs, activeTabId가 포함된다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      await saveBackup(mockTabs, 'tab-1');
      const savedJson = mockWriteTextFile.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(savedJson);
      expect(parsed.version).toBe(1);
      expect(parsed.savedAt).toBeDefined();
      expect(parsed.tabs).toHaveLength(2);
      expect(parsed.activeTabId).toBe('tab-1');
    });

    it('FileHandle은 직렬화에서 제외된다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      const tabsWithHandle: Tab[] = [
        {
          id: 'tab-1',
          title: 'test.md',
          content: '# 테스트',
          isDirty: false,
          fileHandle: {} as FileSystemFileHandle,
        },
      ];
      await saveBackup(tabsWithHandle, 'tab-1');
      const savedJson = mockWriteTextFile.mock.calls[0]?.[1] as string;
      const parsed = JSON.parse(savedJson);
      expect(parsed.tabs[0].fileHandle).toBeUndefined();
    });

    it('저장 실패 시 오류를 무시한다 (선택적 기능)', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      mockWriteTextFile.mockRejectedValueOnce(new Error('FS Error'));
      // 오류가 throw되지 않아야 함
      await expect(saveBackup(mockTabs, 'tab-1')).resolves.toBeUndefined();
    });
  });

  describe('loadBackup', () => {
    it('Tauri 환경이 아니면 null을 반환한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(false);
      const result = await loadBackup();
      expect(result).toBeNull();
    });

    it('유효한 백업 파일을 읽어 반환한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      const backupData = {
        version: 1,
        savedAt: '2026-03-08T00:00:00.000Z',
        tabs: [{ id: 'tab-1', title: 'test.md', content: '# 내용', isDirty: false }],
        activeTabId: 'tab-1',
      };
      mockReadTextFile.mockResolvedValue(JSON.stringify(backupData));
      const result = await loadBackup();
      expect(result).toEqual(backupData);
    });

    it('파일이 없으면 null을 반환한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      mockReadTextFile.mockRejectedValue(new Error('File not found'));
      const result = await loadBackup();
      expect(result).toBeNull();
    });

    it('버전이 다른 백업은 null을 반환한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      mockReadTextFile.mockResolvedValue(JSON.stringify({ version: 2, tabs: [] }));
      const result = await loadBackup();
      expect(result).toBeNull();
    });
  });

  describe('clearBackup', () => {
    it('Tauri 환경이 아니면 아무것도 하지 않는다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(false);
      await clearBackup();
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('Tauri 환경에서 백업 파일을 삭제한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      await clearBackup();
      expect(mockRemove).toHaveBeenCalledWith('backup/session.json', {
        baseDir: 'AppData',
      });
    });

    it('파일이 없어도 오류를 무시한다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      mockRemove.mockRejectedValueOnce(new Error('File not found'));
      await expect(clearBackup()).resolves.toBeUndefined();
    });
  });

  describe('백업 경로 검증', () => {
    it('백업 경로는 backup/session.json 이다', async () => {
      vi.mocked(isTauriApp).mockReturnValue(true);
      await saveBackup(mockTabs, null);
      expect(mockWriteTextFile).toHaveBeenCalledWith(
        'backup/session.json',
        expect.any(String),
        { baseDir: 'AppData' }
      );
    });
  });
});
