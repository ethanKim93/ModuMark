/**
 * StorageWarning 스토리지 사용량 경고 단위 테스트
 */
import { describe, it, expect } from 'vitest';

/** 테스트용 스토리지 비율 계산 함수 */
function calcStorageRatio(usage: number, quota: number): number {
  if (quota <= 0) return 0;
  return usage / quota;
}

/** 경고 표시 여부 결정 함수 */
function shouldShowWarning(ratio: number, threshold = 0.8): boolean {
  return ratio >= threshold;
}

describe('StorageWarning 사용량 경고 로직', () => {
  it('사용량 79% → 경고 미표시', () => {
    const quota = 64 * 1024 * 1024; // 64MB
    const usage = quota * 0.79;
    const ratio = calcStorageRatio(usage, quota);
    expect(shouldShowWarning(ratio)).toBe(false);
  });

  it('사용량 81% → 경고 표시', () => {
    const quota = 64 * 1024 * 1024; // 64MB
    const usage = quota * 0.81;
    const ratio = calcStorageRatio(usage, quota);
    expect(shouldShowWarning(ratio)).toBe(true);
  });

  it('사용량 80% 정확히 → 경고 표시 (임계값 포함)', () => {
    const quota = 64 * 1024 * 1024;
    const usage = quota * 0.8;
    const ratio = calcStorageRatio(usage, quota);
    expect(shouldShowWarning(ratio)).toBe(true);
  });

  it('quota가 0이면 비율이 0이다 (division by zero 방지)', () => {
    const ratio = calcStorageRatio(1000, 0);
    expect(ratio).toBe(0);
    expect(shouldShowWarning(ratio)).toBe(false);
  });

  it('49MB 사용 / 64MB quota → 약 76.5% → 경고 미표시', () => {
    const quota = 64 * 1024 * 1024;
    const usage = 49 * 1024 * 1024;
    const ratio = calcStorageRatio(usage, quota);
    expect(ratio).toBeCloseTo(0.765, 2);
    expect(shouldShowWarning(ratio)).toBe(false);
  });

  it('51MB 사용 / 64MB quota → 약 79.6% → 경고 미표시', () => {
    const quota = 64 * 1024 * 1024;
    const usage = 51 * 1024 * 1024;
    const ratio = calcStorageRatio(usage, quota);
    expect(ratio).toBeCloseTo(0.796, 2);
    expect(shouldShowWarning(ratio)).toBe(false);
  });

  it('52MB 사용 / 64MB quota → 약 81.25% → 경고 표시', () => {
    const quota = 64 * 1024 * 1024;
    const usage = 52 * 1024 * 1024;
    const ratio = calcStorageRatio(usage, quota);
    expect(ratio).toBeCloseTo(0.8125, 3);
    expect(shouldShowWarning(ratio)).toBe(true);
  });

  it('사용량이 quota를 초과해도 경고를 표시한다', () => {
    const quota = 64 * 1024 * 1024;
    const usage = quota * 1.1; // 110%
    const ratio = calcStorageRatio(usage, quota);
    expect(shouldShowWarning(ratio)).toBe(true);
  });
});
