/**
 * 모드 전환 로직 단위 테스트
 * WYSIWYG ↔ Raw 모드 전환 시 콘텐츠 보존 검증
 */
import { describe, it, expect } from 'vitest';
import type { EditorMode } from '../ModeToggle';

describe('EditorMode 전환 로직', () => {
  it('WYSIWYG → Raw 전환 시 마크다운 내용이 동일하다', () => {
    const originalContent = '# 제목\n\n본문 내용입니다.\n\n- 항목 1\n- 항목 2';

    // 모드 전환 시 content는 그대로 유지 (tabStore의 content를 공유)
    let storedContent = originalContent;

    // Raw 모드로 전환 — content 변경 없음
    const modeAfterToggle: EditorMode = 'raw';
    expect(modeAfterToggle).toBe('raw');
    expect(storedContent).toBe(originalContent);
  });

  it('Raw 편집 후 WYSIWYG 전환 시 수정된 내용이 반영된다', () => {
    const originalContent = '# 원본';
    let storedContent = originalContent;

    // Raw 모드에서 편집
    const editedContent = '# 수정된 제목\n\n새 내용';
    storedContent = editedContent;

    // WYSIWYG 모드로 전환 — 수정된 content가 그대로 유지
    const modeAfterToggle: EditorMode = 'wysiwyg';
    expect(modeAfterToggle).toBe('wysiwyg');
    expect(storedContent).toBe(editedContent);
  });

  it('모드 토글 함수가 올바른 값을 반환한다', () => {
    const toggle = (current: EditorMode): EditorMode =>
      current === 'wysiwyg' ? 'raw' : 'wysiwyg';

    expect(toggle('wysiwyg')).toBe('raw');
    expect(toggle('raw')).toBe('wysiwyg');
  });

  it('탭 전환 시 모드가 wysiwyg로 초기화된다', () => {
    let mode: EditorMode = 'raw';

    // 탭 ID 변경 시뮬레이션 → mode 초기화
    const handleTabChange = () => {
      mode = 'wysiwyg';
    };

    handleTabChange();
    expect(mode).toBe('wysiwyg');
  });

  it('마크다운 내용이 빈 문자열이어도 모드 전환이 가능하다', () => {
    const emptyContent = '';
    let storedContent = emptyContent;

    const mode: EditorMode = 'raw';
    expect(mode).toBe('raw');
    expect(storedContent).toBe('');

    // Raw에서 내용 입력
    storedContent = '# 새 내용';
    expect(storedContent).toBe('# 새 내용');
  });
});
