'use client';

import { useState, useCallback } from 'react';
import { X, ArrowUp, ArrowDown, Merge } from 'lucide-react';
import { DropZone } from './DropZone';
import { FileValidationAlert } from './FileValidationAlert';
import { ProcessingProgress } from './ProcessingProgress';
import { mergePdfs, PdfMergeError, PDF_MAX_TOTAL_SIZE } from '@/lib/pdf/pdfMerge';
import { downloadPdf } from '@/lib/pdf/downloadPdf';

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    /* 즉시 파일 크기 검증 */
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const filtered = newFiles.filter((f) => !existing.has(f.name));
      const combined = [...prev, ...filtered];

      const totalSize = combined.reduce((s, f) => s + f.size, 0);
      if (totalSize > PDF_MAX_TOTAL_SIZE) {
        setError('총 파일 크기가 100MB를 초과합니다.');
        return prev;
      }
      if (combined.length > 20) {
        setError('최대 20개 파일까지만 추가할 수 있습니다.');
        return prev;
      }
      return combined;
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('병합할 PDF 파일을 2개 이상 추가하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const bytes = await mergePdfs(files, (p, s) => {
        setProgress(p);
        setProgressStatus(s);
      });
      downloadPdf(bytes, 'merged.pdf');

      /* 완료 후 2초 뒤 진행률 숨김 */
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      if (err instanceof PdfMergeError) {
        setError(err.message);
      } else {
        setError('병합 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-4 bg-surface shrink-0">
        <h1 className="text-lg font-bold text-foreground">PDF 병합</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          여러 PDF를 하나로 합칩니다. 최대 20개 파일, 100MB.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <DropZone onDrop={addFiles} multiple label="PDF 파일을 드래그하거나 클릭하여 추가" />

        <FileValidationAlert error={error} onDismiss={() => setError(null)} />

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-muted-foreground">
                {files.length}개 파일 · 총 {formatBytes(totalSize)}
              </p>
              <button
                onClick={() => { setFiles([]); setError(null); }}
                className="text-[12px] text-muted-foreground hover:text-destructive transition-colors"
              >
                전체 제거
              </button>
            </div>

            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                <span className="text-[12px] text-muted-foreground tabular-nums w-5 shrink-0">{i + 1}</span>
                <span className="flex-1 text-[13px] text-foreground truncate">{file.name}</span>
                <span className="text-[12px] text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 rounded hover:bg-surface-secondary disabled:opacity-30 transition-colors">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="p-1 rounded hover:bg-surface-secondary disabled:opacity-30 transition-colors">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button onClick={() => removeFile(i)} className="p-1 rounded hover:bg-surface-secondary text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ProcessingProgress progress={progress} status={progressStatus} isVisible={loading} />

        <button
          onClick={handleMerge}
          disabled={files.length < 2 || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-[14px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Merge className="h-4 w-4" />
          {loading ? '병합 중...' : 'PDF 병합'}
        </button>
      </div>
    </div>
  );
}
