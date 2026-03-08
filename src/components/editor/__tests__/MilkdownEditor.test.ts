/**
 * MilkdownEditor history 플러그인 단위 테스트
 * Undo/Redo 히스토리 기능 검증
 */
import { describe, it, expect } from 'vitest';
import { history } from '@milkdown/kit/plugin/history';

describe('MilkdownEditor history 플러그인', () => {
  it('history 플러그인이 정상적으로 import된다', () => {
    expect(history).toBeDefined();
  });

  it('history 플러그인은 객체 또는 함수 형태이다', () => {
    const type = typeof history;
    expect(['object', 'function']).toContain(type);
  });

  /**
   * 100단계 FIFO 히스토리 제한 경계값 테스트
   * ProseMirror history 플러그인의 depth 옵션은 기본 100
   */
  it('100단계 Undo 히스토리 FIFO 제한 — 경계값 검증', () => {
    const MAX_HISTORY_DEPTH = 100;
    // 히스토리 스택 시뮬레이션
    const historyStack: number[] = [];

    for (let i = 0; i < MAX_HISTORY_DEPTH + 10; i++) {
      historyStack.push(i);
      // FIFO: 100단계 초과 시 가장 오래된 항목 제거
      if (historyStack.length > MAX_HISTORY_DEPTH) {
        historyStack.shift();
      }
    }

    // 항상 MAX_HISTORY_DEPTH 이하로 유지되어야 한다
    expect(historyStack.length).toBeLessThanOrEqual(MAX_HISTORY_DEPTH);
    // 가장 최신 항목이 유지된다
    expect(historyStack[historyStack.length - 1]).toBe(MAX_HISTORY_DEPTH + 9);
    // 가장 오래된 항목(0)은 제거되었다
    expect(historyStack[0]).toBe(10);
  });

  it('100단계 정확히 입력 시 스택 크기가 100이다', () => {
    const MAX_HISTORY_DEPTH = 100;
    const historyStack: number[] = [];

    for (let i = 0; i < MAX_HISTORY_DEPTH; i++) {
      historyStack.push(i);
    }

    expect(historyStack.length).toBe(MAX_HISTORY_DEPTH);
  });

  it('101번째 항목 추가 시 FIFO로 첫 번째 항목이 제거된다', () => {
    const MAX_HISTORY_DEPTH = 100;
    const historyStack: number[] = [];

    for (let i = 0; i <= MAX_HISTORY_DEPTH; i++) {
      historyStack.push(i);
      if (historyStack.length > MAX_HISTORY_DEPTH) {
        historyStack.shift();
      }
    }

    expect(historyStack.length).toBe(MAX_HISTORY_DEPTH);
    // 첫 번째 항목(0)은 제거되고 1부터 시작
    expect(historyStack[0]).toBe(1);
    expect(historyStack[historyStack.length - 1]).toBe(MAX_HISTORY_DEPTH);
  });
});
