'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/', label: '홈' },
  { href: '/markdown', label: '마크다운' },
  { href: '/pdf', label: 'PDF' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-primary shrink-0">
          ModuMark
        </Link>

        {/* 데스크탑 네비게이션 (1280px+) */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map(({ href, label }) => {
            /* 홈은 정확히 일치, 나머지는 startsWith */
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors ${
                  active
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>

        {/* 모바일: 테마 토글 + 햄버거 (1280px 미만) */}
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border px-6 py-3 flex flex-col gap-1 bg-background">
          {navLinks.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-2 py-2 text-sm rounded-md transition-colors ${
                  active
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
