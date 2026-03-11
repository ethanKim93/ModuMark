import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "문의하기 | ModuMark",
  description: "ModuMark 문의 및 피드백. 버그 신고, 기능 제안, 개인정보 관련 문의는 이메일 또는 GitHub Issues를 통해 연락하세요.",
  alternates: {
    canonical: "https://modumark.app/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">문의하기</h1>
        <p className="text-[14px] text-muted-foreground mb-10 leading-relaxed">
          버그 신고, 기능 제안, 개인정보 관련 문의 등 어떤 내용이든 아래 채널을 통해 연락해 주세요.
        </p>

        <div className="space-y-6">
          {/* 이메일 문의 */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-[15px] font-bold text-foreground mb-2">이메일</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
              개인정보 관련 문의, 비공개 피드백은 이메일로 보내주세요.
            </p>
            <a
              href="mailto:modu.markdown@gmail.com"
              className="text-[14px] text-primary hover:underline font-medium"
            >
              modu.markdown@gmail.com
            </a>
          </section>

          {/* GitHub Issues */}
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-[15px] font-bold text-foreground mb-2">GitHub Issues</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-2">
              버그 신고, 기능 제안은 GitHub Issues에 올려주세요. 공개적으로 트래킹되어 더 빠르게 처리됩니다.
            </p>
            <a
              href="https://github.com/modumark/modumark/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-primary hover:underline font-medium"
            >
              github.com/modumark/modumark/issues
            </a>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-[15px] font-bold text-foreground mb-4">자주 묻는 질문</h2>
            <div className="space-y-4">
              {[
                {
                  q: "파일이 외부 서버로 전송되나요?",
                  a: "아니요. 모든 파일 처리(마크다운 편집, PDF 병합·분할·OCR)는 브라우저 안에서만 수행됩니다. 어떤 서버로도 파일이 전송·저장되지 않습니다.",
                },
                {
                  q: "서비스 이용 요금이 있나요?",
                  a: "없습니다. 마크다운 편집, PDF 병합·분할·OCR 등 핵심 기능 전체가 무료입니다. 회원가입도 필요하지 않습니다. 서비스 운영 비용은 광고로 충당합니다.",
                },
                {
                  q: "데스크탑 앱을 사용하면 광고가 없나요?",
                  a: "네. Tauri 기반 Windows 데스크탑 앱에서는 광고가 표시되지 않습니다.",
                },
                {
                  q: "기능 요청이나 버그 신고는 어떻게 하나요?",
                  a: "위의 GitHub Issues 링크를 이용하거나 이메일로 보내주세요.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="rounded border border-border bg-surface p-4">
                  <p className="text-[14px] font-semibold text-foreground mb-1">{q}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
