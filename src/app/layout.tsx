import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TauriFileOpenProvider } from "@/components/providers/TauriFileOpenProvider";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  /* CLS 방지: 웹폰트 로드 전 fallback 폰트 표시 */
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1773CF",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://modumark.app"),
  title: {
    default: "ModuMark - 무료 마크다운 편집기 + PDF 도구",
    template: "%s | ModuMark",
  },
  description:
    "브라우저에서 즉시 사용하는 무료 마크다운 WYSIWYG 편집기. PDF 병합·분할·변환까지. 파일은 외부 서버로 전송되지 않습니다.",
  keywords: ["마크다운 편집기", "WYSIWYG", "PDF 병합", "PDF 분할", "PDF 변환", "무료", "로컬 처리", "보안"],
  alternates: {
    canonical: "https://modumark.app",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://modumark.app",
    siteName: "ModuMark",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ModuMark - 무료 마크다운 편집기 + PDF 도구" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@modumark",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ModuMark",
  },
  other: {
    /* AdSense 퍼블리셔 계정 인증 메타 태그 */
    "google-adsense-account": "ca-pub-1815575117157423",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning: next-themes가 html 클래스를 클라이언트에서 주입 */
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          {/* Tauri 파일 연결 전역 라우팅 (.md→/markdown, .pdf→/pdf) */}
          <TauriFileOpenProvider />
          {children}
          <CookieConsentBanner />
          {/* AdSense: 쿠키 동의 여부 확인 후 조건부 로드 */}
          <AdSenseScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
