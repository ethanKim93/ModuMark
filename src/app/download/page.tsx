import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Monitor, Shield, Zap, HardDrive } from 'lucide-react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: '데스크탑 앱 다운로드',
  description: 'ModuMark Windows 데스크탑 앱을 다운로드하세요. 로컬 파일 무제한 저장, 오프라인 지원, 광고 없이 이용 가능합니다.',
  alternates: {
    canonical: 'https://modumark.app/download',
  },
};

const GITHUB_RELEASES_URL = 'https://github.com/ethanKim93/ModuMark/releases/latest';

const features = [
  {
    icon: HardDrive,
    title: '로컬 파일 무제한 저장',
    description: '웹 브라우저 스토리지 한계 없이 .md 파일을 로컬에 직접 저장합니다.',
  },
  {
    icon: Zap,
    title: '빠른 속도',
    description: '네이티브 앱으로 더 빠른 파일 처리 및 응답 속도를 제공합니다.',
  },
  {
    icon: Shield,
    title: '보안 강화',
    description: '파일이 외부 서버로 전송되지 않습니다. 완전한 로컬 처리.',
  },
  {
    icon: Monitor,
    title: '광고 없는 경험',
    description: '데스크탑 앱에서는 광고 없이 모든 기능을 이용할 수 있습니다.',
  },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            ModuMark 데스크탑 앱
          </h1>
          <p className="text-[16px] text-muted-foreground">
            Windows 전용 — 로컬 파일 무제한, 오프라인 지원, 광고 없음
          </p>
          <a
            href={GITHUB_RELEASES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-[15px] font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-5 w-5" />
            최신 버전 다운로드 (GitHub Releases)
          </a>
          <p className="text-[12px] text-muted-foreground">
            Windows 10/11 이상 | 64비트 (.msi 설치 파일)
          </p>
        </div>

        {/* 기능 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3 p-4 rounded-lg border border-border bg-surface-secondary/50">
              <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-[14px] font-medium text-foreground">{title}</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 웹 버전으로 돌아가기 */}
        <div className="text-center">
          <Link
            href="/markdown"
            className="text-[13px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
          >
            웹 버전 계속 사용하기
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
