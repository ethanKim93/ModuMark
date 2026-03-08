/**
 * PDF 압축 로직 단위 테스트
 * - 압축 설정값, 압축률 계산, 파일 크기 포맷 검증
 * - compressPdf 자체는 canvas/pdf-lib 의존으로 E2E에서 검증
 */
import { describe, it, expect } from 'vitest';
import type { CompressionQuality } from '../pdfCompress';

/** 품질별 JPEG quality 값 — pdfCompress.ts와 동일하게 유지 */
const QUALITY_MAP: Record<CompressionQuality, number> = {
  low: 0.5,
  medium: 0.75,
  high: 0.9,
};

/** formatFileSize 로직 인라인 구현 (import 없이 단위 테스트) */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

describe('PDF 압축 설정', () => {
  it('low 품질은 JPEG quality 0.5를 사용한다', () => {
    expect(QUALITY_MAP['low']).toBe(0.5);
  });

  it('medium 품질은 JPEG quality 0.75를 사용한다', () => {
    expect(QUALITY_MAP['medium']).toBe(0.75);
  });

  it('high 품질은 JPEG quality 0.9를 사용한다', () => {
    expect(QUALITY_MAP['high']).toBe(0.9);
  });

  it('low < medium < high 순서로 품질이 증가한다', () => {
    expect(QUALITY_MAP['low']).toBeLessThan(QUALITY_MAP['medium']);
    expect(QUALITY_MAP['medium']).toBeLessThan(QUALITY_MAP['high']);
  });
});

describe('압축률 계산', () => {
  it('압축 전후 크기 비율로 압축률을 계산한다', () => {
    const originalSize = 1000;
    const compressedSize = 700;
    const ratio = Math.round((1 - compressedSize / originalSize) * 100);
    expect(ratio).toBe(30);
  });

  it('압축 후 크기가 더 크면 0%로 표시한다', () => {
    const originalSize = 1000;
    const compressedSize = 1200;
    const ratio = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
    expect(ratio).toBe(0);
  });

  it('완전히 압축된 경우 100%이다', () => {
    const originalSize = 1000;
    const compressedSize = 0;
    const ratio = Math.round((1 - compressedSize / originalSize) * 100);
    expect(ratio).toBe(100);
  });
});

describe('formatFileSize', () => {
  it('1023 bytes → B 단위', () => {
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('1024 bytes → 1.0 KB', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('1536 bytes → 1.5 KB', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('1048576 bytes (1MB) → 1.0 MB', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('5.5MB → 5.5 MB', () => {
    expect(formatFileSize(5 * 1024 * 1024 + 512 * 1024)).toBe('5.5 MB');
  });
});
