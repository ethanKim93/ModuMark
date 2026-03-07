'use client';

interface ProcessingProgressProps {
  progress: number;  // 0~100
  status: string;
  isVisible: boolean;
}

export function ProcessingProgress({ progress, status, isVisible }: ProcessingProgressProps) {
  if (!isVisible) return null;

  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between text-[13px] text-muted-foreground">
        <span>{status}</span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
