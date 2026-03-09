'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function LandingHeader() {
  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between">
      <span className="text-xl font-bold text-primary">ModuMark</span>
      <nav className="flex items-center gap-4">
        <Link href="/markdown" className="text-base text-muted-foreground hover:text-foreground transition-colors">
          마크다운
        </Link>
        <Link href="/pdf/merge" className="text-base text-muted-foreground hover:text-foreground transition-colors">
          PDF 도구
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
