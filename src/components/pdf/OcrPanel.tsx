'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, FileEdit } from 'lucide-react';
import { ProcessingProgress } from './ProcessingProgress';
import { OcrResult } from './OcrResult';
import { usePdfFileStore } from '@/stores/pdfFileStore';
import type { OcrLanguage, OcrPageResult } from '@/lib/pdf/pdfOcr';

type OcrStatus = 'idle' | 'processing' | 'done' | 'error';

/** 허용 최대 파일 크기: 100MB */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export function OcrPanel() {
  const router = useRouter();
  // activeFile이 있으면 스토어 파일 사용, 없으면 로컬 파일 선택
  const { activeFile } = usePdfFileStore();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const file = activeFile ?? localFile;
  const [language, setLanguage] = useState<OcrLanguage>('kor+eng');
  const [status, setStatus] = useState<OcrStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [results, setResults] = useState<OcrPageResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('PDF 파일만 지원합니다.');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError('파일 크기가 100MB를 초과합니다.');
      return;
    }
    setLocalFile(f);
    setError(null);
    setResults([]);
    setStatus('idle');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleStartOcr = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      // 동적 import — 번들 크기 최소화
      const { extractTextFromPdf } = await import('@/lib/pdf/pdfOcr');
      const ocrResults = await extractTextFromPdf(file, {
        language,
        onProgress: (p, s) => {
          setProgress(p);
          setProgressStatus(s);
        },
      });
      setResults(ocrResults);
      setStatus('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR 처리 중 오류가 발생했습니다.';
      setError(message);
      setStatus('error');
    }
  };

  const fullText = results
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((r) => r.text.trim())
    .filter(Boolean)
    .join('\n\n');

  const avgConfidence =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.confidence, 0) / results.length)
      : 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">PDF OCR</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          PDF에서 텍스트를 추출합니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.
        </p>
      </div>

      {/* activeFile이 있으면 파일 정보 표시, 없으면 드롭존 */}
      {activeFile ? (
        <div className="border border-border rounded-lg p-4 flex items-center gap-3 bg-surface-secondary">
          <FileText className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-foreground truncate">{activeFile.name}</p>
            <p className="text-[12px] text-muted-foreground">
              {(activeFile.size / 1024 / 1024).toFixed(1)} MB · 뷰어에서 불러온 파일
            </p>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={(e) => e.key === 'Enter' && document.getElementById('ocr-file-input')?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-surface-secondary/50'
          }`}
        >
          <input
            id="ocr-file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInput}
          />
          <label htmlFor="ocr-file-input" className="cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            {localFile ? (
              <div>
                <p className="text-[14px] font-medium text-foreground flex items-center justify-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  {localFile.name}
                </p>
                <p className="text-[12px] text-muted-foreground mt-1">
                  {(localFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[14px] text-muted-foreground">
                  PDF 파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-[12px] text-muted-foreground/60 mt-1">최대 100MB</p>
              </div>
            )}
          </label>
        </div>
      )}

      {/* 오류 메시지 */}
      {error && (
        <div className="px-4 py-2 rounded bg-destructive/10 text-destructive text-[13px]">
          {error}
        </div>
      )}

      {/* 언어 선택 + 실행 버튼 */}
      <div className="flex items-center gap-3">
        <label className="text-[13px] text-muted-foreground shrink-0">언어</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
          disabled={status === 'processing'}
          className="flex-1 max-w-[200px] px-3 py-1.5 rounded border border-border bg-background text-foreground text-[13px] focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="kor+eng">한국어 + 영어</option>
          <option value="kor">한국어</option>
          <option value="eng">영어</option>
        </select>

        <button
          onClick={handleStartOcr}
          disabled={!file || status === 'processing'}
          className="px-4 py-1.5 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'processing' ? 'OCR 처리 중...' : 'OCR 시작'}
        </button>
      </div>

      {/* 진행률 */}
      <ProcessingProgress
        progress={progress}
        status={progressStatus}
        isVisible={status === 'processing'}
      />

      {/* OCR 결과 — 신뢰도 하이라이트 포함 */}
      {status === 'done' && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-foreground">
              추출 결과 ({results.length}페이지)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground">
                평균 신뢰도: {avgConfidence}%
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(fullText)}
                className="px-3 py-1.5 rounded border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
              >
                텍스트 복사
              </button>
              {/* OCR 결과를 새 마크다운 탭으로 열기 */}
              <button
                onClick={async () => {
                  const { openTabWithOcrResult } = await import('@/lib/pdf/ocrToMarkdown');
                  openTabWithOcrResult(fullText, file?.name ?? 'ocr-result.pdf');
                  router.push('/markdown');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 text-primary text-[13px] hover:bg-primary/20 transition-colors"
              >
                <FileEdit className="h-3.5 w-3.5" />
                마크다운에서 열기
              </button>
            </div>
          </div>
          {/* 신뢰도별 하이라이트 표시 */}
          <OcrResult results={results} />
        </div>
      )}
    </div>
  );
}
