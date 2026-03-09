'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ProcessingProgress } from '@/components/pdf/ProcessingProgress';
import type { CompressionQuality, CompressResult } from '@/lib/pdf/pdfCompress';
import { downloadPdf } from '@/lib/pdf/downloadPdf';

interface CompressDialogProps {
  open: boolean;
  onClose: () => void;
  file: File;
}

const QUALITY_OPTIONS: { value: CompressionQuality; label: string; desc: string }[] = [
  { value: 'low', label: '최대 압축', desc: '파일 크기 최소화, 화질 저하' },
  { value: 'medium', label: '보통', desc: '크기와 화질 균형' },
  { value: 'high', label: '고화질', desc: '화질 우선, 압축률 낮음' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CompressDialog({ open, onClose, file }: CompressDialogProps) {
  const [quality, setQuality] = useState<CompressionQuality>('medium');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [result, setResult] = useState<CompressResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actionTakenRef = useRef(false);

  const handleClose = () => {
    if (loading) return;
    actionTakenRef.current = true;
    setResult(null);
    setError(null);
    setProgress(0);
    onClose();
  };

  const handleCompress = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    setProgress(0);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : '압축 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const basename = file.name.replace(/\.pdf$/i, '');
    downloadPdf(result.bytes, `${basename}_compressed.pdf`);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !actionTakenRef.current) handleClose();
        actionTakenRef.current = false;
      }}
    >
      <DialogContent showCloseButton={!loading} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PDF 압축</DialogTitle>
          <DialogDescription>
            압축 레벨을 선택하고 실행하세요. 모든 처리는 브라우저에서 수행됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 파일명 표시 */}
          <p className="text-[12px] text-muted-foreground truncate">{file.name}</p>

          {/* 압축 레벨 선택 */}
          {!result && (
            <div className="flex flex-col gap-2">
              <label className="text-[13px] text-muted-foreground">압축 레벨</label>
              <div className="flex gap-2 flex-wrap">
                {QUALITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setQuality(opt.value)}
                    disabled={loading}
                    className={`flex-1 min-w-[100px] px-3 py-2.5 rounded-lg border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      quality === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:border-primary/50 text-foreground'
                    }`}
                  >
                    <p className="text-[12px] font-medium">{opt.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 진행률 */}
          <ProcessingProgress
            progress={progress}
            status={progressStatus}
            isVisible={loading}
          />

          {/* 에러 */}
          {error && (
            <p className="text-[12px] text-destructive">{error}</p>
          )}

          {/* 압축 결과 */}
          {result && (
            <div className="rounded-lg border border-border bg-surface p-3 space-y-2">
              <p className="text-[13px] font-medium text-foreground">압축 완료</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded bg-surface-secondary px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">원본</p>
                  <p className="text-[12px] font-semibold">{formatSize(result.originalSize)}</p>
                </div>
                <div className="rounded bg-surface-secondary px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">압축 후</p>
                  <p className="text-[12px] font-semibold text-primary">{formatSize(result.compressedSize)}</p>
                </div>
                <div className="rounded bg-surface-secondary px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground mb-0.5">압축률</p>
                  <p className="text-[12px] font-semibold">{result.compressionRatio}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-3 py-1.5 rounded text-[13px] border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {result ? '닫기' : '취소'}
          </button>
          {result ? (
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              다운로드
            </button>
          ) : (
            <button
              onClick={handleCompress}
              disabled={loading}
              className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '압축 중...' : '압축 실행'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
