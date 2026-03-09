'use client';

import { useState, useCallback } from 'react';
import { FileText, Upload, Minimize2 } from 'lucide-react';
import { ProcessingProgress } from './ProcessingProgress';
import { DownloadDialog } from './DownloadDialog';
import { downloadPdf } from '@/lib/pdf/downloadPdf';
import { usePdfFileStore } from '@/stores/pdfFileStore';
import type { CompressionQuality, CompressResult } from '@/lib/pdf/pdfCompress';

type CompressStatus = 'idle' | 'processing' | 'done' | 'error';

/** 허용 최대 파일 크기: 100MB */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** 압축 레벨 옵션 */
const QUALITY_OPTIONS: { value: CompressionQuality; label: string; desc: string }[] = [
  { value: 'low', label: '최대 압축', desc: '파일 크기 최소화, 화질 저하' },
  { value: 'medium', label: '보통', desc: '크기와 화질 균형' },
  { value: 'high', label: '고화질', desc: '화질 우선, 압축률 낮음' },
];

export function CompressPanel() {
  // activeFile이 있으면 스토어 파일 사용, 없으면 로컬 파일 선택
  const { activeFile } = usePdfFileStore();
  const [localFile, setLocalFile] = useState<File | null>(null);
  const file = activeFile ?? localFile;
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const [status, setStatus] = useState<CompressStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const handleStartCompress = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // 번들 크기 최소화를 위한 동적 import
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
      const message = err instanceof Error ? err.message : '압축 중 오류가 발생했습니다.';
      setError(message);
      setStatus('error');
    }
  };

  const defaultFilename = file ? `${file.name.replace(/\.pdf$/i, '')}_compressed` : 'compressed';

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">PDF 압축</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          PDF 파일 크기를 줄입니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.
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
            onChange={handleFileInput}
          />
          <label htmlFor="compress-file-input" className="cursor-pointer">
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

      {/* 압축 레벨 선택 */}
      <div className="flex flex-col gap-2">
        <label className="text-[13px] text-muted-foreground">압축 레벨</label>
        <div className="flex gap-2 flex-wrap">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuality(opt.value)}
              disabled={status === 'processing'}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                quality === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface hover:border-primary/50 text-foreground'
              }`}
            >
              <p className="text-[13px] font-medium">{opt.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 실행 버튼 */}
      <button
        onClick={handleStartCompress}
        disabled={!file || status === 'processing'}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minimize2 className="h-4 w-4" />
        {status === 'processing' ? '압축 중...' : '압축 시작'}
      </button>

      {/* 진행률 */}
      <ProcessingProgress
        progress={progress}
        status={progressStatus}
        isVisible={status === 'processing'}
      />

      {/* 압축 결과 */}
      {status === 'done' && result && (
        <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
          <h2 className="text-[14px] font-medium text-foreground">압축 완료</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded bg-surface-secondary px-3 py-2">
              <p className="text-[11px] text-muted-foreground mb-1">원본 크기</p>
              <p className="text-[14px] font-semibold text-foreground">
                {formatFileSizeSync(result.originalSize)}
              </p>
            </div>
            <div className="rounded bg-surface-secondary px-3 py-2">
              <p className="text-[11px] text-muted-foreground mb-1">압축 후</p>
              <p className="text-[14px] font-semibold text-primary">
                {formatFileSizeSync(result.compressedSize)}
              </p>
            </div>
            <div className="rounded bg-surface-secondary px-3 py-2">
              <p className="text-[11px] text-muted-foreground mb-1">압축률</p>
              <p className="text-[14px] font-semibold text-foreground">
                {result.compressionRatio}%
              </p>
            </div>
          </div>
          <button
            onClick={() => setDownloadDialogOpen(true)}
            className="w-full px-4 py-2 rounded bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
          >
            다운로드
          </button>
        </div>
      )}

      {/* 다운로드 다이얼로그 */}
      <DownloadDialog
        open={downloadDialogOpen}
        defaultFilename={defaultFilename}
        description="압축된 PDF의 파일명을 입력하세요."
        onConfirm={(filename) => {
          setDownloadDialogOpen(false);
          if (result) downloadPdf(result.bytes, filename);
        }}
        onCancel={() => setDownloadDialogOpen(false)}
      />
    </div>
  );
}

/** 파일 크기 포맷 (pdfCompress.ts의 formatFileSize와 동일 로직, 동적 import 없이 인라인) */
function formatFileSizeSync(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
