import { AppHeader } from './AppHeader';

interface AppShellProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <AppHeader />
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
