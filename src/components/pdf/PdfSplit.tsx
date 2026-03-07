'use client';

import { useState } from 'react';
import { Plus, X, Scissors } from 'lucide-react';
import { DropZone } from './DropZone';
import { FileValidationAlert } from './FileValidationAlert';
import { ProcessingProgress } from './ProcessingProgress';
import { splitPdf, PdfSplitError, SplitRange, PDF_MAX_SIZE } from '@/lib/pdf/pdfSplit';
import { downloadPdf } from '@/lib/pdf/downloadPdf';

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [ranges, setRanges] = useState<SplitRange[]>([
    { id: crypto.randomUUID(), from: 1, to: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  const handleFileAdd = (files: File[]) => {
    const f = files[0];
    if (f.size > PDF_MAX_SIZE) {
      setError('100MB를 초과하는 파일은 처리할 수 없습니다.');
      return;
    }
    setFile(f);
    setError(null);
  };

  const addRange = () => {
    setRanges((prev) => [...prev, { id: crypto.randomUUID(), from: 1, to: 1 }]);
  };

  const removeRange = (id: string) => {
    setRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRange = (id: string, field: 'from' | 'to', value: number) => {
    setRanges((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setError(null);
  };

  const handleSplit = async () => {
    if (!file) {
      setError('PDF 파일을 먼저 업로드하세요.');
      return;
    }
    if (ranges.length === 0) {
      setError('분할 범위를 하나 이상 추가하세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const results = await splitPdf(file, ranges, (p, s) => {
        setProgress(p);
        setProgressStatus(s);
      });

      for (const result of results) {
        downloadPdf(result.bytes, result.name);
        await new Promise((r) => setTimeout(r, 200));
      }

      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      if (err instanceof PdfSplitError) {
        setError(err.message);
      } else {
        setError('분할 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border px-6 py-4 bg-surface shrink-0">
        <h1 className="text-lg font-bold text-foreground">PDF 분할</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          페이지 범위를 지정하여 PDF를 분리합니다.
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {!file ? (
          <DropZone onDrop={handleFileAdd} label="분할할 PDF 파일을 드래그하거나 클릭하여 선택" />
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-foreground truncate">{file.name}</p>
              <p className="text-[12px] text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={() => { setFile(null); setError(null); }}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <FileValidationAlert error={error} onDismiss={() => setError(null)} />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-foreground">분할 범위</p>
            <button
              onClick={addRange}
              className="flex items-center gap-1 text-[12px] text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              범위 추가
            </button>
          </div>

          {ranges.map((range, i) => (
            <div key={range.id} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <span className="text-[12px] text-muted-foreground w-5 shrink-0">{i + 1}</span>
              <span className="text-[13px] text-muted-foreground">페이지</span>
              <input
                type="number"
                min={1}
                value={range.from}
                onChange={(e) => updateRange(range.id, 'from', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-[13px] bg-background border border-border rounded text-foreground text-center"
              />
              <span className="text-[13px] text-muted-foreground">~</span>
              <input
                type="number"
                min={1}
                value={range.to}
                onChange={(e) => updateRange(range.id, 'to', parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-[13px] bg-background border border-border rounded text-foreground text-center"
              />
              <span className="text-[13px] text-muted-foreground">페이지</span>
              <button
                onClick={() => removeRange(range.id)}
                disabled={ranges.length === 1}
                className="ml-auto p-1 rounded text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <ProcessingProgress progress={progress} status={progressStatus} isVisible={loading} />

        <button
          onClick={handleSplit}
          disabled={!file || ranges.length === 0 || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-[14px] font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Scissors className="h-4 w-4" />
          {loading ? '분할 중...' : 'PDF 분할'}
        </button>
      </div>
    </div>
  );
}
