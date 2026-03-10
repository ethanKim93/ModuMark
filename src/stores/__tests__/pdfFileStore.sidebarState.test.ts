import { describe, it, expect, beforeEach } from 'vitest';
import { usePdfFileStore } from '../pdfFileStore';

/** 각 테스트 전 사이드바 상태 초기화 */
beforeEach(() => {
  usePdfFileStore.setState({
    currentPageIndex: 0,
    sidebarWidth: 260,
    pages: [],
    files: [],
    selectedPageIds: new Set(),
    history: [],
  });
});

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

  // ────── reorderMultiplePages ──────
  describe('reorderMultiplePages', () => {
    /** 테스트용 PdfPageItem 생성 헬퍼 */
    function makePage(id: string, pageIndex = 0) {
      return {
        id,
        fileId: 'file-1',
        fileName: 'test.pdf',
        pageIndex,
        pageLabel: `p.${pageIndex + 1}`,
        thumbnail: null,
      };
    }

    it('선택된 여러 페이지를 targetId 위치로 이동한다', () => {
      const a = makePage('mp-a', 0);
      const b = makePage('mp-b', 1);
      const c = makePage('mp-c', 2);
      const d = makePage('mp-d', 3);
      usePdfFileStore.setState({ pages: [a, b, c, d], history: [] });

      // b, c를 선택하여 d 위치로 이동
      usePdfFileStore.getState().reorderMultiplePages(new Set(['mp-b', 'mp-c']), 'mp-d');

      const ids = usePdfFileStore.getState().pages.map((p) => p.id);
      // rest = [a, d], insertIndex = 1(d의 위치) → [a, b, c, d]
      expect(ids).toEqual(['mp-a', 'mp-b', 'mp-c', 'mp-d']);
    });

    it('존재하지 않는 targetId면 순서를 변경하지 않는다', () => {
      const a = makePage('mx-a', 0);
      const b = makePage('mx-b', 1);
      usePdfFileStore.setState({ pages: [a, b], history: [] });

      usePdfFileStore.getState().reorderMultiplePages(new Set(['mx-a']), 'nonexistent');
      const ids = usePdfFileStore.getState().pages.map((p) => p.id);
      // targetId 가 pages에 없으면 early return → 순서 그대로 유지
      expect(ids).toEqual(['mx-a', 'mx-b']);
    });
  });

  // ────── removeSelectedPages ──────
  describe('removeSelectedPages', () => {
    function makePage(id: string) {
      return {
        id,
        fileId: 'file-1',
        fileName: 'test.pdf',
        pageIndex: 0,
        pageLabel: 'p.1',
        thumbnail: null,
      };
    }

    it('선택된 페이지를 모두 삭제한다', () => {
      const a = makePage('a');
      const b = makePage('b');
      const c = makePage('c');
      usePdfFileStore.setState({
        pages: [a, b, c],
        selectedPageIds: new Set(['a', 'c']),
      });

      usePdfFileStore.getState().removeSelectedPages();

      const { pages, selectedPageIds } = usePdfFileStore.getState();
      expect(pages.map((p) => p.id)).toEqual(['b']);
      expect(selectedPageIds.size).toBe(0);
    });

    it('선택이 없으면 아무것도 변경하지 않는다', () => {
      const a = makePage('a');
      usePdfFileStore.setState({ pages: [a], selectedPageIds: new Set() });

      usePdfFileStore.getState().removeSelectedPages();

      expect(usePdfFileStore.getState().pages).toHaveLength(1);
    });
  });
});
