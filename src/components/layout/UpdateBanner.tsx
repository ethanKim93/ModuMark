'use client';

import { RefreshCw } from 'lucide-react';
import { useAutoUpdater } from '@/hooks/useAutoUpdater';

/**
 * Tauri 앱 업데이트 알림 배너
 * - 새 버전 감지 시 상단에 표시
 * - 업데이트 버튼 클릭 시 다운로드·설치·재시작
 * - 웹 환경에서는 useAutoUpdater가 항상 false 반환
 */
export function UpdateBanner() {
  const { updateAvailable, updateInfo, isInstalling, installUpdate } = useAutoUpdater();

  if (!updateAvailable) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border-b border-primary/20 text-[13px]">
      <RefreshCw className="h-4 w-4 text-primary shrink-0" />
      <p className="flex-1 text-foreground">
        <span className="font-medium">새 버전이 출시되었습니다.</span>
        {updateInfo?.version && (
          <span className="text-muted-foreground ml-1">(v{updateInfo.version})</span>
        )}
      </p>
      <button
        onClick={installUpdate}
        disabled={isInstalling}
        className="px-3 py-1 rounded bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
      >
        {isInstalling ? '설치 중...' : '지금 업데이트'}
      </button>
    </div>
  );
}
