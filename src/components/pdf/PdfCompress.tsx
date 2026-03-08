'use client';

import { useState, useCallback } from 'react';
import { FileText, Upload, Download } from 'lucide-react';
import { ProcessingProgress } from './ProcessingProgress';
import type { CompressionQuality } from '@/lib/pdf/pdfCompress';

type CompressStatus = 'idle' | 'processing' | 'done' | 'error';

/** 허용 최대 파일 크기: 100MB */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

const QUALITY_LABELS: Record<CompressionQuality, string> = {
  low: '낮음 (최대 압축)',
  medium: '중간 (균형)',
  high: '높음 (최소 손실)',
};

export function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const [status, setStatus] = useState<CompressStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState<{
    bytes: Uint8Array;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null>(null);
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
    setFile(f);
    setError(null);
    setResult(null);
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

  const handleCompress = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(0);
    setError(null);

    try {
      const { compressPdf } = await import('@/lib/pdf/pdfCompress');
      const compressResult = await compressPdf(file, {
        quality,
        onProgress: (p, s) => {
          setProgress(p);
          setProgressStatus(s);
        },
      });
      setResult(compressResult);
      setStatus('done');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF 압축 중 오류가 발생했습니다.';
      setError(message);
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const { downloadPdf } = require('@/lib/pdf/downloadPdf');
    const baseName = file.name.replace(/\.pdf$/i, '');
    downloadPdf(result.bytes, `${baseName}_compressed.pdf`);
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">PDF 압축</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          PDF 파일 크기를 줄입니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.
        </p>
      </div>

      {/* 드롭존 */}
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onKeyDown={(e) => e.key === 'Enter' && document.getElementById('compress-file-input')?.click()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-surface-secondary/50'
        }`}
      >
        <input
          id="compress-file-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <label htmlFor="compress-file-input" className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          {file ? (
            <div>
              <p className="text-[14px] font-medium text-foreground flex items-center justify-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                {file.name}
              </p>
              <p className="text-[12px] text-muted-foreground mt-1">
                {formatSize(file.size)}
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

      {/* 오류 메시지 */}
      {error && (
        <div className="px-4 py-2 rounded bg-destructive/10 text-destructive text-[13px]">
          {error}
        </div>
      )}

      {/* 품질 슬라이더 */}
      <div className="space-y-2">
        <label className="text-[13px] font-medium text-foreground">압축 품질</label>
        <div className="flex gap-2">
          {(Object.keys(QUALITY_LABELS) as CompressionQuality[]).map((q) => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              disabled={status === 'processing'}
              className={`flex-1 px-3 py-2 rounded border text-[13px] transition-colors disabled:opacity-50 ${
                quality === q
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>
      </div>

      {/* 압축 버튼 */}
      <button
        onClick={handleCompress}
        disabled={!file || status === 'processing'}
        className="px-4 py-2 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'processing' ? '압축 중...' : 'PDF 압축'}
      </button>

      {/* 진행률 */}
      <ProcessingProgress
        progress={progress}
        status={progressStatus}
        isVisible={status === 'processing'}
      />

      {/* 압축 결과 */}
      {status === 'done' && result && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h2 className="text-[14px] font-medium text-foreground">압축 결과</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[12px] text-muted-foreground">원본 크기</p>
              <p className="text-[15px] font-medium text-foreground mt-1">
                {formatSize(result.originalSize)}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">압축 후</p>
              <p className="text-[15px] font-medium text-primary mt-1">
                {formatSize(result.compressedSize)}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground">압축률</p>
              <p className="text-[15px] font-medium text-green-600 dark:text-green-400 mt-1">
                -{result.compressionRatio}%
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            압축된 PDF 다운로드
          </button>
        </div>
      )}
    </div>
  );
}
