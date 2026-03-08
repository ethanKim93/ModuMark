/**
 * OCR 신뢰도 분류 단위 테스트
 */
import { describe, it, expect } from 'vitest';
import { classifyConfidence, type ConfidenceLevel } from '../OcrResult';

describe('classifyConfidence 신뢰도 분류', () => {
  it('신뢰도 79% → LOW 분류', () => {
    expect(classifyConfidence(79)).toBe<ConfidenceLevel>('low');
  });

  it('신뢰도 80% → MEDIUM 분류 (임계값 포함)', () => {
    expect(classifyConfidence(80)).toBe<ConfidenceLevel>('medium');
  });

  it('신뢰도 81% → MEDIUM 분류', () => {
    expect(classifyConfidence(81)).toBe<ConfidenceLevel>('medium');
  });

  it('신뢰도 94% → MEDIUM 분류', () => {
    expect(classifyConfidence(94)).toBe<ConfidenceLevel>('medium');
  });

  it('신뢰도 95% → HIGH 분류 (임계값 포함)', () => {
    expect(classifyConfidence(95)).toBe<ConfidenceLevel>('high');
  });

  it('신뢰도 100% → HIGH 분류', () => {
    expect(classifyConfidence(100)).toBe<ConfidenceLevel>('high');
  });

  it('신뢰도 0% → LOW 분류', () => {
    expect(classifyConfidence(0)).toBe<ConfidenceLevel>('low');
  });

  it('신뢰도 79.9% → LOW 분류 (소수점)', () => {
    expect(classifyConfidence(79.9)).toBe<ConfidenceLevel>('low');
  });

  it('신뢰도 80.1% → MEDIUM 분류 (소수점)', () => {
    expect(classifyConfidence(80.1)).toBe<ConfidenceLevel>('medium');
  });
});
