'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

/* 순환 순서: dark → light → system */
const THEME_CYCLE = ['dark', 'light', 'system'] as const;
type ThemeValue = (typeof THEME_CYCLE)[number];

const THEME_LABELS: Record<ThemeValue, string> = {
  dark: '다크 모드',
  light: '라이트 모드',
  system: '시스템 모드',
};

const THEME_ICONS: Record<ThemeValue, React.ReactNode> = {
  dark: <Moon className="h-3.5 w-3.5" />,
  light: <Sun className="h-3.5 w-3.5" />,
  system: <Monitor className="h-3.5 w-3.5" />,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  /* 하이드레이션 불일치 방지 — 클라이언트에서만 렌더 */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[28px] h-[28px]" />;
  }

  const current = (THEME_CYCLE.includes(theme as ThemeValue) ? theme : 'dark') as ThemeValue;
  const nextIndex = (THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length;
  const nextTheme = THEME_CYCLE[nextIndex];

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
      title={`현재: ${THEME_LABELS[current]} — 클릭하여 ${THEME_LABELS[nextTheme]}으로 전환`}
    >
      {THEME_ICONS[current]}
    </button>
  );
}
