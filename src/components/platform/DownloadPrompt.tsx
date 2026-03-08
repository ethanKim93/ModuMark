'use client';

import { useState, useEffect } from 'react';
import { Download, X, Monitor } from 'lucide-react';
import { isTauriApp } from '@/lib/environment';

const DISMISSED_KEY = 'download-prompt-dismissed';

/** GitHub Releases 다운로드 URL */
const GITHUB_RELEASES_URL = 'https://github.com/modumark/modumark/releases/latest';

interface DownloadPromptProps {
  /** 강제 표시 여부 (스토리지 초과 등 조건 충족 시) */
  forceShow?: boolean;
}

/**
 * 웹 사용자에게 데스크탑 앱 다운로드를 안내하는 배너 컴포넌트
 * - 웹 환경(isTauriApp()=false)에서만 표시
 * - 스토리지 80% 초과 시 또는 forceShow=true 시 표시
 * - localStorage에 다시 보지 않기 상태 저장
 */
export function DownloadPrompt({ forceShow = false }: DownloadPromptProps) {
  const [dismissed, setDismissed] = useState(true); // 초기 hidden (hydration 안전)
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    // Tauri 앱에서는 표시 안 함
    if (isTauriApp()) return;

    setIsWeb(true);
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    if (!wasDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleDismissForever = () => {
    localStorage.setItem(DISMISSED_KEY, 'forever');
    setDismissed(true);
  };

  // Tauri 환경이거나, 강제 표시 아닌데 닫힌 경우 미표시
  if (!isWeb || (!forceShow && dismissed)) {
    return null;
  }

  return (
    <div
      role="complementary"
      aria-label="데스크탑 앱 다운로드 안내"
      className="flex items-start gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg text-[13px]"
    >
      <Monitor className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">
          ModuMark 데스크탑 앱을 사용해 보세요
        </p>
        <p className="text-muted-foreground mt-0.5">
          로컬 파일로 무제한 저장, 빠른 속도, 오프라인 지원.
          광고 없이 더 나은 경험을 제공합니다.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <a
            href={GITHUB_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Windows 다운로드
          </a>
          <button
            onClick={handleDismissForever}
            className="px-3 py-1.5 rounded border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-secondary transition-colors"
          >
            다시 보지 않기
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="안내 닫기"
        className="shrink-0 p-0.5 rounded hover:bg-primary/10 text-muted-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
