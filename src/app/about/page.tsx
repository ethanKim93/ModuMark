import type { Metadata } from "next";
import { FileText, Shield, Layers, Zap } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "About ModuMark",
  description:
    "ModuMark는 마크다운 WYSIWYG 편집기와 PDF 도구를 하나로 통합한 무료 문서 도구입니다. 파일은 브라우저에서만 처리되며 외부 서버로 전송되지 않습니다.",
  alternates: {
    canonical: "https://modumark.app/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* 헤더 */}
        <h1 className="text-3xl font-bold text-foreground mb-3">ModuMark란?</h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10">
          마크다운 WYSIWYG 편집기 + PDF 도구를 하나의 앱에서 무료로 제공하는 통합 문서 도구입니다.
          모든 처리는 브라우저 안에서 이루어지며, 파일은 어떤 서버에도 전송·저장되지 않습니다.
        </p>

        {/* 왜 만들었나 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">왜 만들었나요?</h2>
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3 text-[14px] text-muted-foreground leading-relaxed">
            <p>
              좋은 마크다운 편집기와 PDF 도구는 많지만, 대부분 유료이거나 파일을 서버에 업로드해야 합니다.
              특히 기업 환경에서는 보안 정책상 문서를 외부 서버로 보낼 수 없어 불편함이 컸습니다.
            </p>
            <p>
              ModuMark는 <strong className="text-foreground">핵심 기능 전체를 무료</strong>로 제공하고,
              <strong className="text-foreground"> 파일을 로컬에서만 처리</strong>함으로써 이 두 가지 문제를 동시에 해결합니다.
              서비스 운영 비용은 비침습적인 광고로 충당합니다.
            </p>
          </div>
        </section>

        {/* 핵심 가치 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">핵심 가치</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <Zap className="h-5 w-5 text-primary" />,
                title: "무료",
                desc: "마크다운 편집, PDF 병합·분할·OCR 등 핵심 기능 전체 무료. 회원가입 불필요.",
              },
              {
                icon: <Shield className="h-5 w-5 text-primary" />,
                title: "로컬 우선 처리",
                desc: "모든 파일 처리는 브라우저에서 수행됩니다. 외부 서버로 파일이 전송·저장되지 않아 기업 보안 정책에 적합합니다.",
              },
              {
                icon: <Layers className="h-5 w-5 text-primary" />,
                title: "통합 도구",
                desc: "마크다운 편집과 PDF(뷰어·병합·분할·OCR·변환)를 하나의 앱에서. 여러 도구를 오가는 번거로움이 없습니다.",
              },
              {
                icon: <FileText className="h-5 w-5 text-primary" />,
                title: "탭 기반 멀티 문서",
                desc: "여러 문서를 탭으로 동시에 열고 관리합니다. 새 창 없이 깔끔한 작업 환경을 제공합니다.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  {icon}
                  <p className="text-[14px] font-semibold text-foreground">{title}</p>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 주요 기능 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">주요 기능</h2>
          <div className="space-y-3 text-[14px]">
            <div className="rounded border border-border bg-surface p-4">
              <p className="font-semibold text-foreground mb-1">마크다운 WYSIWYG 편집기</p>
              <p className="text-muted-foreground leading-relaxed">
                Milkdown 기반의 실시간 미리보기 편집기. .md 파일 열기·저장, 자동 저장(30초),
                마크다운 → PDF 변환(한글 지원), 미저장 경고 다이얼로그.
              </p>
            </div>
            <div className="rounded border border-border bg-surface p-4">
              <p className="font-semibold text-foreground mb-1">PDF 병합</p>
              <p className="text-muted-foreground leading-relaxed">
                최대 20개, 100MB의 PDF 파일을 드래그앤드롭으로 순서를 조정하여 병합합니다.
                모든 처리는 브라우저에서 수행됩니다.
              </p>
            </div>
            <div className="rounded border border-border bg-surface p-4">
              <p className="font-semibold text-foreground mb-1">PDF 분할</p>
              <p className="text-muted-foreground leading-relaxed">
                페이지 범위를 지정하여 PDF를 분할합니다. 특정 페이지만 추출하거나
                여러 구간으로 나눌 수 있습니다.
              </p>
            </div>
            <div className="rounded border border-border bg-surface p-4">
              <p className="font-semibold text-foreground mb-1">PDF OCR (텍스트 추출)</p>
              <p className="text-muted-foreground leading-relaxed">
                Tesseract.js를 사용하여 PDF의 이미지에서 텍스트를 추출합니다.
                한국어·영어 지원. 추출 결과를 마크다운 탭으로 바로 열기 가능.
              </p>
            </div>
          </div>
        </section>

        {/* 기술 스택 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">기술 스택</h2>
          <div className="rounded-lg border border-border bg-surface p-5 text-[13px] text-muted-foreground leading-relaxed space-y-2">
            <p><span className="text-foreground font-medium">프레임워크:</span> Next.js (App Router), React, TypeScript</p>
            <p><span className="text-foreground font-medium">스타일링:</span> Tailwind CSS v4, shadcn/ui</p>
            <p><span className="text-foreground font-medium">편집기:</span> Milkdown (WYSIWYG 마크다운)</p>
            <p><span className="text-foreground font-medium">PDF 처리:</span> PDF.js (뷰어), pdf-lib (생성/편집)</p>
            <p><span className="text-foreground font-medium">OCR:</span> Tesseract.js (브라우저 내 실행)</p>
            <p><span className="text-foreground font-medium">데스크탑 앱:</span> Tauri 2.0 (Windows)</p>
          </div>
        </section>

        {/* 연락처 */}
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-[15px] font-bold text-foreground mb-2">문의 및 피드백</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            버그 신고, 기능 제안, 기타 문의는{" "}
            <a
              href="https://github.com/modumark/modumark/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GitHub Issues
            </a>
            를 이용하거나 이메일{" "}
            <a href="mailto:modu.markdown@gmail.com" className="text-primary hover:underline">
              modu.markdown@gmail.com
            </a>
            으로 연락해 주세요.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
