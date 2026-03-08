'use client';

import type { OcrPageResult, OcrWord } from '@/lib/pdf/pdfOcr';

/** 신뢰도 임계값 */
const LOW_CONFIDENCE_THRESHOLD = 80;
const HIGH_CONFIDENCE_THRESHOLD = 95;

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * 신뢰도 점수를 레벨로 분류
 */
export function classifyConfidence(confidence: number): ConfidenceLevel {
  if (confidence < LOW_CONFIDENCE_THRESHOLD) return 'low';
  if (confidence < HIGH_CONFIDENCE_THRESHOLD) return 'medium';
  return 'high';
}

function WordSpan({ word }: { word: OcrWord }) {
  const level = classifyConfidence(word.confidence);
  const highlightClass =
    level === 'low'
      ? 'bg-yellow-300/50 dark:bg-yellow-500/30 rounded px-0.5'
      : '';

  return (
    <span
      className={highlightClass}
      title={`신뢰도: ${Math.round(word.confidence)}%`}
    >
      {word.text}{' '}
    </span>
  );
}

interface OcrPageResultCardProps {
  result: OcrPageResult;
}

function OcrPageResultCard({ result }: OcrPageResultCardProps) {
  const levelCounts = result.words.reduce(
    (acc, word) => {
      const level = classifyConfidence(word.confidence);
      acc[level]++;
      return acc;
    },
    { low: 0, medium: 0, high: 0 } as Record<ConfidenceLevel, number>
  );

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-foreground">
          페이지 {result.pageNumber}
        </span>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>평균 신뢰도: {Math.round(result.confidence)}%</span>
          {levelCounts.low > 0 && (
            <span className="text-yellow-600 dark:text-yellow-400">
              저신뢰도 {levelCounts.low}단어
            </span>
          )}
        </div>
      </div>

      <div className="text-[13px] text-foreground leading-relaxed bg-surface-secondary rounded p-3 max-h-48 overflow-y-auto">
        {result.words.length > 0 ? (
          result.words.map((word, idx) => (
            <WordSpan key={idx} word={word} />
          ))
        ) : (
          <span className="text-muted-foreground italic">{result.text}</span>
        )}
      </div>
    </div>
  );
}

interface OcrResultProps {
  results: OcrPageResult[];
}

/**
 * OCR 결과 신뢰도 표시 컴포넌트
 * - 신뢰도 80% 미만 단어 노란색 하이라이트
 * - 신뢰도 범례: LOW < 80%, MEDIUM 80~95%, HIGH > 95%
 */
export function OcrResult({ results }: OcrResultProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* 범례 */}
      <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="font-medium">신뢰도 범례:</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-yellow-300/50 dark:bg-yellow-500/30" />
          LOW (&lt; 80%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-transparent border border-border" />
          MEDIUM (80~95%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-transparent border border-border" />
          HIGH (&gt; 95%)
        </span>
      </div>

      {/* 페이지별 결과 */}
      <div className="space-y-3">
        {results
          .sort((a, b) => a.pageNumber - b.pageNumber)
          .map((result) => (
            <OcrPageResultCard key={result.pageNumber} result={result} />
          ))}
      </div>
    </div>
  );
}
