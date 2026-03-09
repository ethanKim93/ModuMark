import { describe, it, expect, beforeEach } from 'vitest';
import { usePdfFileStore } from '../pdfFileStore';

/** 각 테스트 전 스토어 초기화 */
beforeEach(() => {
  usePdfFileStore.setState({
    files: [],
    pages: [],
    activePageId: null,
    activeFile: null,
    viewerFiles: [],
    activeViewerFileId: null,
    viewerStates: {},
    history: [],
    selectedPageIds: new Set(),
  });
});

describe('pdfFileStore — viewerState', () => {
  describe('setViewerState', () => {
    it('새 탭 상태를 저장한다', () => {
      usePdfFileStore.getState().setViewerState('tab-1', { currentPage: 3, zoom: 1.5 });
      const state = usePdfFileStore.getState().viewerStates['tab-1'];
      expect(state.currentPage).toBe(3);
      expect(state.zoom).toBe(1.5);
    });

    it('부분 갱신 시 나머지 값은 유지된다', () => {
      usePdfFileStore.getState().setViewerState('tab-1', { currentPage: 5, zoom: 2.0 });
      usePdfFileStore.getState().setViewerState('tab-1', { currentPage: 7 });
      const state = usePdfFileStore.getState().viewerStates['tab-1'];
      expect(state.currentPage).toBe(7);
      expect(state.zoom).toBe(2.0); // zoom은 그대로 유지
    });

    it('존재하지 않는 탭에 부분 갱신 시 기본값이 적용된다', () => {
      usePdfFileStore.getState().setViewerState('new-tab', { currentPage: 4 });
      const state = usePdfFileStore.getState().viewerStates['new-tab'];
      expect(state.currentPage).toBe(4);
      expect(state.zoom).toBe(1.2); // 기본값
    });
  });

  describe('탭 간 독립성', () => {
    it('두 탭의 상태는 서로 독립적으로 유지된다', () => {
      usePdfFileStore.getState().setViewerState('tab-a', { currentPage: 2, zoom: 1.0 });
      usePdfFileStore.getState().setViewerState('tab-b', { currentPage: 10, zoom: 2.0 });

      const stateA = usePdfFileStore.getState().viewerStates['tab-a'];
      const stateB = usePdfFileStore.getState().viewerStates['tab-b'];

      expect(stateA.currentPage).toBe(2);
      expect(stateA.zoom).toBe(1.0);
      expect(stateB.currentPage).toBe(10);
      expect(stateB.zoom).toBe(2.0);
    });

    it('한 탭 상태 변경이 다른 탭에 영향을 주지 않는다', () => {
      usePdfFileStore.getState().setViewerState('tab-a', { currentPage: 1, zoom: 1.2 });
      usePdfFileStore.getState().setViewerState('tab-b', { currentPage: 5, zoom: 1.5 });

      // tab-a 상태 변경
      usePdfFileStore.getState().setViewerState('tab-a', { currentPage: 3, zoom: 0.75 });

      const stateB = usePdfFileStore.getState().viewerStates['tab-b'];
      expect(stateB.currentPage).toBe(5); // 변경되지 않음
      expect(stateB.zoom).toBe(1.5); // 변경되지 않음
    });
  });

  describe('closeViewerFile', () => {
    it('탭 닫기 시 해당 탭의 viewerState가 제거된다', () => {
      // setActiveFile로 탭 추가
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      usePdfFileStore.getState().setActiveFile(mockFile);
      const { activeViewerFileId } = usePdfFileStore.getState();
      expect(activeViewerFileId).not.toBeNull();

      // 상태 저장
      usePdfFileStore.getState().setViewerState(activeViewerFileId!, { currentPage: 4, zoom: 1.5 });
      expect(usePdfFileStore.getState().viewerStates[activeViewerFileId!]).toBeDefined();

      // 탭 닫기
      usePdfFileStore.getState().closeViewerFile(activeViewerFileId!);
      expect(usePdfFileStore.getState().viewerStates[activeViewerFileId!]).toBeUndefined();
    });

    it('다른 탭의 viewerState는 닫기 시 영향을 받지 않는다', () => {
      const fileA = new File(['a'], 'a.pdf', { type: 'application/pdf' });
      const fileB = new File(['b'], 'b.pdf', { type: 'application/pdf' });

      usePdfFileStore.getState().setActiveFile(fileA);
      const idA = usePdfFileStore.getState().activeViewerFileId!;

      usePdfFileStore.getState().setActiveFile(fileB);
      const idB = usePdfFileStore.getState().activeViewerFileId!;

      usePdfFileStore.getState().setViewerState(idA, { currentPage: 2, zoom: 1.0 });
      usePdfFileStore.getState().setViewerState(idB, { currentPage: 8, zoom: 2.0 });

      // tab A 닫기
      usePdfFileStore.getState().closeViewerFile(idA);

      expect(usePdfFileStore.getState().viewerStates[idA]).toBeUndefined();
      expect(usePdfFileStore.getState().viewerStates[idB]?.currentPage).toBe(8);
      expect(usePdfFileStore.getState().viewerStates[idB]?.zoom).toBe(2.0);
    });
  });
});
