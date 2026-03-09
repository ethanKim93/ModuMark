/**
 * OCR 결과 → 마크다운 탭 전송 유틸리티 단위 테스트
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

/* tabStore 모킹 */
const mockOpenTab = vi.fn(() => 'new-tab-id');

vi.mock('@/stores/tabStore', () => ({
  useTabStore: {
    getState: vi.fn(() => ({
      tabs: [],
      activeTabId: null,
      openTab: mockOpenTab,
      closeTab: vi.fn(),
      switchTab: vi.fn(),
      updateContent: vi.fn(),
      setDirty: vi.fn(),
      setFileHandle: vi.fn(),
      getActiveTab: vi.fn(),
    })),
  },
}));

import { openTabWithOcrResult } from '../ocrToMarkdown';

type TabArg = { title: string; content: string; isDirty: boolean };

describe('openTabWithOcrResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenTab.mockReturnValue('new-tab-id');
  });

  it('OCR 텍스트를 마크다운 형식으로 변환하여 새 탭 생성', () => {
    const tabId = openTabWithOcrResult('Hello World', 'document.pdf');

    expect(mockOpenTab).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArg = (mockOpenTab.mock.calls as unknown as TabArg[][])[0]![0] as TabArg;
    expect(callArg.title).toBe('document_ocr.md');
    expect(callArg.isDirty).toBe(true);
    expect(callArg.content).toContain('# document (OCR)');
    expect(callArg.content).toContain('Hello World');
    expect(tabId).toBe('new-tab-id');
  });

  it('PDF 확장자가 탭 제목에서 제거된다', () => {
    openTabWithOcrResult('텍스트', 'report.pdf');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArg = (mockOpenTab.mock.calls as unknown as TabArg[][])[0]![0] as TabArg;
    expect(callArg.title).toBe('report_ocr.md');
    expect(callArg.title).not.toContain('.pdf');
  });

  it('연속 줄바꿈이 단락 구분으로 정리된다', () => {
    openTabWithOcrResult('첫 번째 줄\n\n\n\n두 번째 줄', 'test.pdf');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArg = (mockOpenTab.mock.calls as unknown as TabArg[][])[0]![0] as TabArg;
    // 4개 줄바꿈 → 2개로 정리
    expect(callArg.content).not.toContain('\n\n\n');
  });

  it('OCR 텍스트가 비어있어도 탭이 생성된다', () => {
    openTabWithOcrResult('', 'empty.pdf');

    expect(mockOpenTab).toHaveBeenCalledOnce();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArg = (mockOpenTab.mock.calls as unknown as TabArg[][])[0]![0] as TabArg;
    expect(callArg.content).toContain('# empty (OCR)');
  });
});
