/**
 * OCR 결과를 마크다운 탭으로 전송하는 유틸리티
 * - OCR 텍스트를 마크다운 형식으로 변환 후 새 탭 생성
 */
import { useTabStore } from '@/stores/tabStore';

/**
 * OCR 텍스트를 마크다운 형식으로 정리
 * - 연속 줄바꿈을 단락 구분으로 변환
 * - 앞뒤 공백 제거
 */
function normalizeOcrTextToMarkdown(text: string, sourceFilename: string): string {
  const baseName = sourceFilename.replace(/\.pdf$/i, '');

  // 연속 공백 라인 정리 → 단락 구분 (빈 줄 1개)
  const normalized = text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `# ${baseName} (OCR)\n\n${normalized}`;
}

/**
 * OCR 결과 텍스트를 새 마크다운 탭으로 열기
 * @param text OCR로 추출된 텍스트
 * @param sourceFilename 원본 PDF 파일명
 * @returns 새로 생성된 탭 ID
 */
export function openTabWithOcrResult(text: string, sourceFilename: string): string {
  const markdownContent = normalizeOcrTextToMarkdown(text, sourceFilename);
  const tabTitle = sourceFilename.replace(/\.pdf$/i, '') + '_ocr.md';

  const tabId = useTabStore.getState().openTab({
    title: tabTitle,
    content: markdownContent,
    isDirty: true,
  });

  return tabId;
}
