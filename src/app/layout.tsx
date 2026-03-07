import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://modumark.app"),
  title: {
    default: "ModuMark - 무료 마크다운 편집기 + PDF 도구",
    template: "%s | ModuMark",
  },
  description:
    "브라우저에서 즉시 사용하는 무료 마크다운 WYSIWYG 편집기. PDF 병합·분할·변환까지. 파일은 외부 서버로 전송되지 않습니다.",
  keywords: ["마크다운 편집기", "WYSIWYG", "PDF 병합", "PDF 분할", "무료"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://modumark.app",
    siteName: "ModuMark",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ModuMark" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@modumark",
  },
  robots: {
    index: true,
    follow: true,
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
          {children}
        </ThemeProvider>
        {/* Google AdSense — lazyOnload: 페이지 로드 완료 후 로드 */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
