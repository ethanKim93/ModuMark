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
import { splitPdf, SplitRange, PdfSplitError } from '@/lib/pdf/pdfSplit';
import { downloadPdf } from '@/lib/pdf/downloadPdf';

interface SplitDialogProps {
  open: boolean;
  onClose: () => void;
  file: File;
}

/** 페이지 범위 문자열 "1-3,5,7-10" → SplitRange[] 파싱 */
function parseRanges(input: string, totalPages: number): SplitRange[] | string {
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return '페이지 범위를 입력하세요.';

  const ranges: SplitRange[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) return `"${part}"는 올바른 범위 형식이 아닙니다. 예: 1-3,5,7-10`;
    const from = parseInt(match[1], 10);
    const to = match[2] ? parseInt(match[2], 10) : from;
    if (from < 1 || to < from) return `범위 ${part}이(가) 유효하지 않습니다.`;
    if (to > totalPages) return `파일은 ${totalPages}페이지입니다. 범위 ${part}을(를) 확인하세요.`;
    ranges.push({ id: crypto.randomUUID(), from, to });
  }
  return ranges;
}

export function SplitDialog({ open, onClose, file }: SplitDialogProps) {
  const [rangeInput, setRangeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const actionTakenRef = useRef(false);

  const handleClose = () => {
    if (loading) return; // 처리 중 닫기 방지
    actionTakenRef.current = true;
    setRangeInput('');
    setError(null);
    setProgress(0);
    onClose();
  };

  const handleSplit = async () => {
    setError(null);

    // 기본 페이지 수 파악 없이 우선 파싱 시도 (totalPages는 splitPdf 내부에서 검증)
    const ranges = parseRanges(rangeInput, Infinity as number);
    if (typeof ranges === 'string') {
      setError(ranges);
      return;
    }

    setLoading(true);
    setProgress(0);
    try {
      const results = await splitPdf(file, ranges, (p, s) => {
        setProgress(p);
        setProgressStatus(s);
      });
      // 각 분할 결과 파일 순서대로 다운로드
      for (const result of results) {
        downloadPdf(result.bytes, result.name);
        await new Promise((r) => setTimeout(r, 300));
      }
      handleClose();
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
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !actionTakenRef.current) handleClose();
        actionTakenRef.current = false;
      }}
    >
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>PDF 분할</DialogTitle>
          <DialogDescription>
            추출할 페이지 범위를 입력하세요. 쉼표로 여러 범위를 구분합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {/* 파일명 표시 */}
          <p className="text-[12px] text-muted-foreground truncate">{file.name}</p>

          {/* 페이지 범위 입력 */}
          <div>
            <label className="block text-[13px] text-foreground mb-1.5">
              페이지 범위
            </label>
            <input
              type="text"
              value={rangeInput}
              onChange={(e) => { setRangeInput(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleSplit()}
              placeholder="예: 1-3, 5, 7-10"
              disabled={loading}
              className="w-full px-3 py-1.5 text-[13px] bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              각 범위마다 별도 PDF 파일로 다운로드됩니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-[12px] text-destructive">{error}</p>
          )}

          {/* 진행률 */}
          <ProcessingProgress
            progress={progress}
            status={progressStatus}
            isVisible={loading}
          />
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-3 py-1.5 rounded text-[13px] border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSplit}
            disabled={loading || !rangeInput.trim()}
            className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '분할 중...' : '분할 실행'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
