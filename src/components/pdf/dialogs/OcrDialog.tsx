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
import { extractTextFromPdf, mergeOcrResults, type OcrLanguage } from '@/lib/pdf/pdfOcr';
import { openTabWithOcrResult } from '@/lib/pdf/ocrToMarkdown';

interface OcrDialogProps {
  open: boolean;
  onClose: () => void;
  file: File;
}

const LANGUAGE_OPTIONS: { value: OcrLanguage; label: string }[] = [
  { value: 'kor', label: '한국어' },
  { value: 'eng', label: '영어' },
  { value: 'kor+eng', label: '한국어 + 영어' },
];

const LOW_CONFIDENCE_THRESHOLD = 80;

export function OcrDialog({ open, onClose, file }: OcrDialogProps) {
  const [language, setLanguage] = useState<OcrLanguage>('kor');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [done, setDone] = useState(false);
  const actionTakenRef = useRef(false);

  const handleClose = () => {
    if (loading) return;
    actionTakenRef.current = true;
    setError(null);
    setDone(false);
    setLowConfidence(false);
    setProgress(0);
    onClose();
  };

  const handleOcr = async () => {
    setError(null);
    setLowConfidence(false);
    setDone(false);
    setLoading(true);
    setProgress(0);

    try {
      const results = await extractTextFromPdf(file, {
        language,
        onProgress: (p, s) => {
          setProgress(p);
          setProgressStatus(s);
        },
      });

      // 신뢰도 확인: 페이지 평균 신뢰도가 80% 미만이면 경고
      if (results.length > 0) {
        const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
        if (avgConfidence < LOW_CONFIDENCE_THRESHOLD) {
          setLowConfidence(true);
        }
      }

      // 결과를 마크다운 에디터 탭으로 전달
      const mergedText = mergeOcrResults(results);
      openTabWithOcrResult(mergedText, file.name);

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR 처리 중 오류가 발생했습니다.');
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
          <DialogTitle>OCR 텍스트 추출</DialogTitle>
          <DialogDescription>
            PDF에서 텍스트를 추출하여 마크다운 에디터 탭으로 전달합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* 파일명 표시 */}
          <p className="text-[12px] text-muted-foreground truncate">{file.name}</p>

          {/* 언어 선택 */}
          {!done && (
            <div>
              <label className="block text-[13px] text-foreground mb-1.5">OCR 언어</label>
              <div className="flex gap-2 flex-wrap">
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLanguage(opt.value)}
                    disabled={loading}
                    className={`px-3 py-1.5 rounded-lg border text-[13px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      language === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:border-primary/50 text-foreground'
                    }`}
                  >
                    {opt.label}
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

          {/* LOW_CONFIDENCE 경고 */}
          {lowConfidence && (
            <div className="rounded-lg bg-warning/10 border border-warning/30 px-3 py-2">
              <p className="text-[12px] text-warning font-medium">LOW_CONFIDENCE</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                일부 텍스트의 인식 정확도가 낮습니다. 결과를 확인하고 수정해 주세요.
              </p>
            </div>
          )}

          {/* 완료 메시지 */}
          {done && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
              <p className="text-[12px] text-primary font-medium">OCR 완료</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                마크다운 에디터 탭에서 추출된 텍스트를 확인하세요.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-3 py-1.5 rounded text-[13px] border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {done ? '닫기' : '취소'}
          </button>
          {!done && (
            <button
              onClick={handleOcr}
              disabled={loading}
              className="px-3 py-1.5 rounded text-[13px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'OCR 처리 중...' : 'OCR 실행'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
