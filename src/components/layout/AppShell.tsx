import { MobileNav } from "./MobileNav";

interface AppShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 모바일(md 미만): 숨김 */}
      <div className="hidden md:flex md:flex-col shrink-0">{sidebar}</div>
      <main className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        {children}
      </main>
      {/* 모바일 하단 네비게이션 */}
      <MobileNav />
    </div>
  );
}
