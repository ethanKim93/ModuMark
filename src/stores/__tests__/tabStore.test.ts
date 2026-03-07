import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore } from '../tabStore';

/* 각 테스트 전 스토어 초기화 */
beforeEach(() => {
  useTabStore.setState({
    tabs: [{ id: 'default', title: 'Untitled', content: '', isDirty: false }],
    activeTabId: 'default',
  });
});

describe('tabStore', () => {
  describe('openTab', () => {
    it('새 탭을 열고 활성화한다', () => {
      const id = useTabStore.getState().openTab({ title: 'Test.md', content: '# Hello', isDirty: false });
      const { tabs, activeTabId } = useTabStore.getState();
      expect(tabs.find((t) => t.id === id)).toBeTruthy();
      expect(activeTabId).toBe(id);
    });

    it('동일 fileHandle 탭은 중복 생성하지 않고 전환한다', () => {
      const mockHandle = { name: 'file.md' } as FileSystemFileHandle;
      useTabStore.getState().openTab({ title: 'file.md', content: '', isDirty: false, fileHandle: mockHandle });
      const firstCount = useTabStore.getState().tabs.length;

      useTabStore.getState().openTab({ title: 'file.md', content: '', isDirty: false, fileHandle: mockHandle });
      expect(useTabStore.getState().tabs.length).toBe(firstCount);
    });
  });

  describe('closeTab', () => {
    it('탭을 닫으면 목록에서 제거된다', () => {
      const id = useTabStore.getState().openTab({ title: 'Close.md', content: '', isDirty: false });
      useTabStore.getState().closeTab(id);
      const { tabs } = useTabStore.getState();
      expect(tabs.find((t) => t.id === id)).toBeUndefined();
    });

    it('마지막 탭을 닫으면 새 빈 탭이 자동 생성된다', () => {
      /* 기본 탭만 남긴 상태 */
      useTabStore.setState({ tabs: [{ id: 'only', title: 'Only', content: '', isDirty: false }], activeTabId: 'only' });
      useTabStore.getState().closeTab('only');
      const { tabs } = useTabStore.getState();
      expect(tabs.length).toBe(1);
      expect(tabs[0].title).toBe('Untitled');
    });

    it('활성 탭 닫힘 시 다른 탭으로 전환된다', () => {
      const id1 = useTabStore.getState().openTab({ title: 'A.md', content: '', isDirty: false });
      useTabStore.getState().openTab({ title: 'B.md', content: '', isDirty: false });
      useTabStore.getState().switchTab(id1);
      useTabStore.getState().closeTab(id1);
      expect(useTabStore.getState().activeTabId).not.toBe(id1);
    });
  });

  describe('switchTab', () => {
    it('activeTabId를 변경한다', () => {
      const id = useTabStore.getState().openTab({ title: 'Switch.md', content: '', isDirty: false });
      useTabStore.getState().switchTab('default');
      expect(useTabStore.getState().activeTabId).toBe('default');
      useTabStore.getState().switchTab(id);
      expect(useTabStore.getState().activeTabId).toBe(id);
    });
  });

  describe('updateContent', () => {
    it('콘텐츠 업데이트 시 isDirty가 true로 설정된다', () => {
      useTabStore.getState().updateContent('default', '# Updated');
      const tab = useTabStore.getState().tabs.find((t) => t.id === 'default');
      expect(tab?.content).toBe('# Updated');
      expect(tab?.isDirty).toBe(true);
    });
  });

  describe('setDirty', () => {
    it('isDirty 값을 명시적으로 설정한다', () => {
      useTabStore.getState().setDirty('default', true);
      expect(useTabStore.getState().tabs[0].isDirty).toBe(true);
      useTabStore.getState().setDirty('default', false);
      expect(useTabStore.getState().tabs[0].isDirty).toBe(false);
    });
  });

  describe('setFileHandle', () => {
    it('fileHandle과 title을 설정하고 isDirty를 false로 리셋한다', () => {
      useTabStore.getState().updateContent('default', 'dirty content');
      const mockHandle = { name: 'saved.md' } as FileSystemFileHandle;
      useTabStore.getState().setFileHandle('default', mockHandle, 'saved.md');
      const tab = useTabStore.getState().tabs[0];
      expect(tab.title).toBe('saved.md');
      expect(tab.fileHandle).toBe(mockHandle);
      expect(tab.isDirty).toBe(false);
    });
  });

  describe('getActiveTab', () => {
    it('현재 활성 탭을 반환한다', () => {
      const tab = useTabStore.getState().getActiveTab();
      expect(tab?.id).toBe('default');
    });
  });
});
