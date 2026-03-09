import { describe, it, expect, beforeEach } from 'vitest';
import { useTabStore } from '../../stores/tabStore';

/* 마크다운↔탭 스토어 통합 테스트 */
describe('Markdown ↔ TabStore 통합', () => {
  beforeEach(() => {
    useTabStore.setState({
      tabs: [{ id: 'default', title: 'Untitled', content: '', isDirty: false }],
      activeTabId: 'default',
    });
  });

  it('탭 전환 시 각 탭의 콘텐츠가 독립적으로 유지된다', () => {
    const store = useTabStore.getState();

    /* 탭 2개 생성 */
    const id1 = store.openTab({ title: 'Tab1.md', content: '', isDirty: false });
    const id2 = store.openTab({ title: 'Tab2.md', content: '', isDirty: false });

    /* 탭1에 콘텐츠 입력 */
    store.switchTab(id1);
    store.updateContent(id1, '# Tab1 내용');

    /* 탭2에 다른 콘텐츠 입력 */
    store.switchTab(id2);
    store.updateContent(id2, '# Tab2 내용');

    /* 탭1으로 전환해도 탭1 콘텐츠 유지 */
    store.switchTab(id1);
    const tab1 = useTabStore.getState().tabs.find((t) => t.id === id1);
    expect(tab1?.content).toBe('# Tab1 내용');

    /* 탭2 콘텐츠도 유지 */
    const tab2 = useTabStore.getState().tabs.find((t) => t.id === id2);
    expect(tab2?.content).toBe('# Tab2 내용');
  });

  it('콘텐츠 편집 시 해당 탭만 isDirty가 true가 된다', () => {
    const store = useTabStore.getState();
    const id1 = store.openTab({ title: 'A.md', content: '', isDirty: false });
    const id2 = store.openTab({ title: 'B.md', content: '', isDirty: false });

    store.updateContent(id1, '변경됨');

    const tab1 = useTabStore.getState().tabs.find((t) => t.id === id1);
    const tab2 = useTabStore.getState().tabs.find((t) => t.id === id2);
    expect(tab1?.isDirty).toBe(true);
    expect(tab2?.isDirty).toBe(false);
  });

  it('getActiveTab은 현재 활성 탭의 최신 콘텐츠를 반환한다', () => {
    const store = useTabStore.getState();
    store.updateContent('default', '# 최신 내용');
    const active = useTabStore.getState().getActiveTab();
    expect(active?.content).toBe('# 최신 내용');
  });

  it('탭 닫기 후 다른 탭으로 활성 탭이 변경된다', () => {
    const store = useTabStore.getState();
    const id1 = store.openTab({ title: 'A.md', content: '', isDirty: false });
    const id2 = store.openTab({ title: 'B.md', content: '', isDirty: false });

    /* id2가 활성 상태에서 닫기 */
    store.switchTab(id2);
    store.closeTab(id2);

    expect(useTabStore.getState().activeTabId).not.toBe(id2);
    /* id1 또는 default 탭이 활성화됨 */
    const { activeTabId, tabs } = useTabStore.getState();
    expect(tabs.find((t) => t.id === activeTabId)).toBeTruthy();
  });
});
