import React from 'react';
import { AppHeader } from './AppHeader';
import { AdBlockBanner } from '@/components/ads/AdBlockBanner';

interface AppShellProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
      {/* Ad Blocker 감지 시 비침습적 안내 배너 */}
      <AdBlockBanner />
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
