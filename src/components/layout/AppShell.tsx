import React from 'react';
import { AppHeader } from './AppHeader';
import { AdBlockBanner } from '@/components/ads/AdBlockBanner';
import { StorageWarningBanner } from './StorageWarningBanner';
import { UpdateBanner } from './UpdateBanner';

interface AppShellProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      {/* Tauri 앱 새 버전 업데이트 알림 */}
      <UpdateBanner />
      {/* Ad Blocker 감지 시 비침습적 안내 배너 */}
      <AdBlockBanner />
      {/* 웹 환경 스토리지 50MB 초과 시 앱 다운로드 안내 배너 */}
      <StorageWarningBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바가 있을 때만 렌더링 */}
        {sidebar && (
          <div className="flex flex-col shrink-0 h-full">{sidebar}</div>
        )}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
