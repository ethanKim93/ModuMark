import { Progress } from "@/components/ui/progress";

interface StorageIndicatorProps {
  used?: number;
  total?: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function StorageIndicator({
  used = 0,
  total = 52428800,
}: StorageIndicatorProps) {
  const percent = Math.min((used / total) * 100, 100);

  return (
    <div className="space-y-1 px-4 py-2">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Storage</span>
        <span>
          {formatBytes(used)} / {formatBytes(total)} used
        </span>
      </div>
      <Progress value={percent} className="h-1" />
    </div>
  );
}
