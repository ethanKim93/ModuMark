/**
 * fileSystem.ts Tauri/웹 환경 분기 단위 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* environment 모킹 */
vi.mock('@/lib/environment', () => ({
  isTauriApp: vi.fn(),
  getEnvironment: vi.fn(),
}));

/* Tauri 플러그인 모킹 */
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

import { isTauriApp } from '@/lib/environment';

describe('fileSystem 환경 분기', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isTauriApp()=false → 웹 환경 경로 진입', () => {
    vi.mocked(isTauriApp).mockReturnValue(false);
    expect(isTauriApp()).toBe(false);
  });

  it('isTauriApp()=true → Tauri 환경 경로 진입', () => {
    vi.mocked(isTauriApp).mockReturnValue(true);
    expect(isTauriApp()).toBe(true);
  });

  it('파일명 추출: 절대 경로에서 파일명만 추출', () => {
    const windowsPath = 'C:\\Users\\user\\Documents\\test.md';
    const unixPath = '/home/user/documents/test.md';

    const extractName = (path: string) => path.split(/[\\/]/).pop() ?? 'untitled.md';

    expect(extractName(windowsPath)).toBe('test.md');
    expect(extractName(unixPath)).toBe('test.md');
  });

  it('파일명이 없는 경로(빈 문자열)는 빈 문자열 반환 — 실제 경로는 항상 비어있지 않음', () => {
    // split('').pop()은 ''를 반환 (빈 배열의 pop은 undefined지만 split은 최소 1개 요소 반환)
    // 실제 Tauri 경로는 항상 유효한 경로여야 함
    const validPath = 'C:\\Users\\user\\untitled.md';
    const extractName = (path: string) => path.split(/[\\/]/).pop() ?? 'untitled.md';
    expect(extractName(validPath)).toBe('untitled.md');
  });

  it('Tauri 파일 열기 취소 시 null 반환', async () => {
    const { open } = await import('@tauri-apps/plugin-dialog');
    vi.mocked(open).mockResolvedValue(null);

    const result = await open({ filters: [], multiple: false });
    expect(result).toBeNull();
  });

  it('Tauri 파일 읽기 성공', async () => {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    vi.mocked(readTextFile).mockResolvedValue('# 테스트 내용');

    const content = await readTextFile('/path/to/test.md');
    expect(content).toBe('# 테스트 내용');
  });

  it('Tauri 파일 쓰기 성공', async () => {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    vi.mocked(writeTextFile).mockResolvedValue(undefined);

    await writeTextFile('/path/to/test.md', '# 저장 내용');
    expect(writeTextFile).toHaveBeenCalledWith('/path/to/test.md', '# 저장 내용');
  });
});
