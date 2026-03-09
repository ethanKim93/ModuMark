import { describe, it, expect, beforeEach } from 'vitest';
import { usePdfFileStore, MergeFileEntry } from '../pdfFileStore';

/** 각 테스트 전 사이드바 상태 초기화 */
beforeEach(() => {
  usePdfFileStore.setState({
    currentPageIndex: 0,
    sidebarWidth: 260,
    mergeFiles: [],
  });
});

/** 테스트용 MergeFileEntry 생성 헬퍼 */
function makeMergeFile(name: string, sizeBytes: number, pageCount = 5): MergeFileEntry {
  const file = new File([new Uint8Array(sizeBytes)], name, { type: 'application/pdf' });
  return { id: crypto.randomUUID(), file, name, pageCount };
}

describe('pdfFileStore — sidebarState', () => {

  // ────── currentPageIndex ──────
  describe('setCurrentPage', () => {
    it('현재 페이지 인덱스를 설정한다', () => {
      const { setCurrentPage } = usePdfFileStore.getState();
      setCurrentPage(3);
      expect(usePdfFileStore.getState().currentPageIndex).toBe(3);
    });

    it('0으로 재설정한다', () => {
      usePdfFileStore.setState({ currentPageIndex: 5 });
      usePdfFileStore.getState().setCurrentPage(0);
      expect(usePdfFileStore.getState().currentPageIndex).toBe(0);
    });
  });

  // ────── sidebarWidth ──────
  describe('setSidebarWidth', () => {
    it('정상 범위 너비를 설정한다', () => {
      usePdfFileStore.getState().setSidebarWidth(300);
      expect(usePdfFileStore.getState().sidebarWidth).toBe(300);
    });

    it('200px 미만이면 200으로 고정된다', () => {
      usePdfFileStore.getState().setSidebarWidth(100);
      expect(usePdfFileStore.getState().sidebarWidth).toBe(200);
    });

    it('400px 초과이면 400으로 고정된다', () => {
      usePdfFileStore.getState().setSidebarWidth(500);
      expect(usePdfFileStore.getState().sidebarWidth).toBe(400);
    });

    it('경계값 200px를 허용한다', () => {
      usePdfFileStore.getState().setSidebarWidth(200);
      expect(usePdfFileStore.getState().sidebarWidth).toBe(200);
    });

    it('경계값 400px를 허용한다', () => {
      usePdfFileStore.getState().setSidebarWidth(400);
      expect(usePdfFileStore.getState().sidebarWidth).toBe(400);
    });
  });

  // ────── mergeFiles — 추가 ──────
  describe('addMergeFile', () => {
    it('파일을 목록에 추가한다', () => {
      const entry = makeMergeFile('a.pdf', 1024);
      const result = usePdfFileStore.getState().addMergeFile(entry);
      expect(result).toBeNull();
      expect(usePdfFileStore.getState().mergeFiles).toHaveLength(1);
      expect(usePdfFileStore.getState().mergeFiles[0].name).toBe('a.pdf');
    });

    it('19개 초과 시 추가를 거부하고 오류 메시지를 반환한다', () => {
      // 19개 채우기
      for (let i = 0; i < 19; i++) {
        usePdfFileStore.getState().addMergeFile(makeMergeFile(`file${i}.pdf`, 100));
      }
      const result = usePdfFileStore.getState().addMergeFile(makeMergeFile('overflow.pdf', 100));
      expect(result).toMatch(/20개/);
      expect(usePdfFileStore.getState().mergeFiles).toHaveLength(19);
    });

    it('합산 100MB 초과 시 추가를 거부하고 오류 메시지를 반환한다', () => {
      // 50MB 파일 1개 추가
      const MB50 = 50 * 1024 * 1024;
      usePdfFileStore.getState().addMergeFile(makeMergeFile('big1.pdf', MB50));
      // 60MB 파일 추가 시 초과
      const MB60 = 60 * 1024 * 1024;
      const result = usePdfFileStore.getState().addMergeFile(makeMergeFile('big2.pdf', MB60));
      expect(result).toMatch(/100MB/);
      expect(usePdfFileStore.getState().mergeFiles).toHaveLength(1);
    });
  });

  // ────── mergeFiles — 제거 ──────
  describe('removeMergeFile', () => {
    it('특정 ID의 파일을 목록에서 제거한다', () => {
      const entry1 = makeMergeFile('a.pdf', 100);
      const entry2 = makeMergeFile('b.pdf', 100);
      usePdfFileStore.getState().addMergeFile(entry1);
      usePdfFileStore.getState().addMergeFile(entry2);

      usePdfFileStore.getState().removeMergeFile(entry1.id);
      const { mergeFiles } = usePdfFileStore.getState();
      expect(mergeFiles).toHaveLength(1);
      expect(mergeFiles[0].name).toBe('b.pdf');
    });
  });

  // ────── mergeFiles — 재정렬 ──────
  describe('reorderMergeFiles', () => {
    it('dnd-kit 방식으로 파일 순서를 변경한다', () => {
      const a = makeMergeFile('a.pdf', 100);
      const b = makeMergeFile('b.pdf', 100);
      const c = makeMergeFile('c.pdf', 100);
      usePdfFileStore.getState().addMergeFile(a);
      usePdfFileStore.getState().addMergeFile(b);
      usePdfFileStore.getState().addMergeFile(c);

      // a를 c 위치로 이동
      usePdfFileStore.getState().reorderMergeFiles(a.id, c.id);
      const names = usePdfFileStore.getState().mergeFiles.map((f) => f.name);
      expect(names).toEqual(['b.pdf', 'c.pdf', 'a.pdf']);
    });

    it('존재하지 않는 ID는 상태를 변경하지 않는다', () => {
      const a = makeMergeFile('a.pdf', 100);
      usePdfFileStore.getState().addMergeFile(a);
      usePdfFileStore.getState().reorderMergeFiles('invalid-id', a.id);
      expect(usePdfFileStore.getState().mergeFiles).toHaveLength(1);
    });
  });

  // ────── mergeFiles — 초기화 ──────
  describe('clearMergeFiles', () => {
    it('모든 병합 파일을 초기화한다', () => {
      usePdfFileStore.getState().addMergeFile(makeMergeFile('a.pdf', 100));
      usePdfFileStore.getState().addMergeFile(makeMergeFile('b.pdf', 100));
      usePdfFileStore.getState().clearMergeFiles();
      expect(usePdfFileStore.getState().mergeFiles).toHaveLength(0);
    });
  });
});
