'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { StorageWarning } from './StorageWarning';
import { useAppVersion } from '@/hooks/useAppVersion';

const navItems = [
  { label: 'Markdown', href: '/markdown' },
  { label: 'PDF', href: '/pdf' },
];

export function AppHeader() {
  const pathname = usePathname();
  const { version } = useAppVersion();

  return (
    <>
    <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-surface shrink-0">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-1.5 text-foreground font-bold text-base shrink-0">
        <FileText className="h-4 w-4 text-primary" />
        <span>ModuMark</span>
        {version && (
          <span className="text-xs text-muted-foreground font-normal">v{version}</span>
        )}
      </Link>

      <div className="w-px h-4 bg-border" />

      {/* 네비게이션 링크 */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map(({ label, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-secondary'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 우측: 테마 토글 */}
      <div className="flex items-center gap-1 shrink-0">
        <ThemeToggle />
      </div>
    </header>
    {/* 스토리지 사용량 80% 초과 시 경고 배너 */}
    <StorageWarning />
    </>
  );
}
