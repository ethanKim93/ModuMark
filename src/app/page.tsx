import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Layers, Scissors, Shield, PanelTop, CloudOff } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSoftwareApplicationSchema, generateFaqJsonLd, generateOrganizationJsonLd } from "@/lib/structured-data";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "ModuMark - 무료 마크다운 편집기 + PDF 통합 도구",
  description:
    "브라우저에서 즉시 사용하는 무료 마크다운 WYSIWYG 편집기. PDF 병합·분할·변환까지. 파일은 외부 서버로 전송되지 않습니다.",
  alternates: {
    canonical: "https://modumark.app",
  },
  openGraph: {
    title: "ModuMark - 무료 마크다운 편집기 + PDF 통합 도구",
    description:
      "브라우저에서 즉시 사용하는 무료 마크다운 WYSIWYG 편집기. PDF 병합·분할·변환까지.",
  },
};

const features = [
  {
    icon: FileText,
    title: "WYSIWYG 마크다운 편집기",
    description:
      "Milkdown 기반의 강력한 WYSIWYG 편집기. 마크다운 문법을 몰라도 직관적으로 문서를 작성할 수 있습니다. 헤딩, 목록, 코드블록, 인용구 등 모든 마크다운 요소를 지원합니다.",
  },
  {
    icon: Layers,
    title: "PDF 병합 · 분할",
    description:
      "여러 PDF 파일을 하나로 합치거나 원하는 페이지 범위로 분할하세요. 최대 20개 파일, 100MB까지 지원합니다. 모든 처리는 브라우저 안에서 이루어집니다.",
  },
  {
    icon: PanelTop,
    title: "탭 기반 다중 문서 관리",
    description:
      "여러 마크다운 파일을 탭으로 동시에 열고 편집하세요. 새 창 없이 하나의 화면에서 여러 문서를 빠르게 전환할 수 있습니다.",
  },
  {
    icon: CloudOff,
    title: "완전한 로컬 처리",
    description:
      "파일이 외부 서버로 전송되거나 저장되지 않습니다. 모든 편집과 PDF 처리는 사용자의 브라우저 안에서만 이루어져 기업 보안 정책을 준수합니다.",
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={getSoftwareApplicationSchema()} />
      <JsonLd data={generateFaqJsonLd()} />
      <JsonLd data={generateOrganizationJsonLd()} />
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        <main className="max-w-5xl mx-auto px-6">
          {/* Hero 섹션 */}
          <section className="py-20 text-center">
            <div className="flex justify-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20">완전 무료</span>
              <span className="px-2.5 py-1 rounded-full bg-surface text-muted-foreground text-[12px] font-medium border border-border">로컬 처리</span>
              <span className="px-2.5 py-1 rounded-full bg-surface text-muted-foreground text-[12px] font-medium border border-border">광고 지원</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              무료 마크다운 편집기<br />+ PDF 통합 도구
            </h1>
            <p className="text-md text-muted-foreground mb-8 max-w-xl mx-auto">
              브라우저에서 즉시 사용하세요. 설치 불필요, 회원가입 불필요.
              <strong className="text-foreground"> 파일은 절대 외부 서버로 전송되지 않습니다.</strong>
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/markdown"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors"
              >
                마크다운 시작
              </Link>
              <Link
                href="/pdf/merge"
                className="px-6 py-3 bg-surface border border-border text-foreground rounded-lg text-base font-medium hover:bg-surface-secondary transition-colors"
              >
                PDF 도구 사용
              </Link>
              <Link
                href="/download"
                className="px-6 py-3 bg-surface border border-border text-foreground rounded-lg text-base font-medium hover:bg-surface-secondary transition-colors"
              >
                데스크탑 앱 다운로드
              </Link>
            </div>
          </section>

          {/* 기능 소개 섹션 */}
          <section className="py-16">
            <h2 className="text-xl font-bold text-foreground text-center mb-10">주요 기능</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-secondary transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 보안 안내 섹션 */}
          <section className="py-16 border-t border-border">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="p-3 rounded-lg bg-success/10 shrink-0">
                <Shield className="h-8 w-8 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-2">왜 ModuMark는 안전한가?</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">
                  ModuMark의 모든 파일 처리는 사용자 기기의 브라우저 안에서만 수행됩니다. 마크다운 파일 편집,
                  PDF 병합·분할·변환 등 어떤 작업도 외부 서버로 데이터가 전송되지 않습니다.
                  개인 문서, 기밀 자료를 안심하고 처리할 수 있습니다.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  File System Access API, pdf-lib 등 브라우저 네이티브 기술을 활용하여 서버 없이
                  강력한 문서 처리 기능을 제공합니다. 네트워크 탭을 열어서 직접 확인해보세요.
                </p>
                <Link href="/security" className="text-primary text-[14px] hover:underline font-medium">
                  보안 안내 자세히 보기 →
                </Link>
              </div>
            </div>
          </section>

          {/* PDF 기능 상세 */}
          <section className="py-16 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">PDF 작업을 더 쉽게</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
              ModuMark는 마크다운 편집기를 넘어 완전한 PDF 도구 모음을 제공합니다.
              별도 소프트웨어 설치 없이 브라우저에서 바로 사용할 수 있습니다.
            </p>
            <ul className="space-y-2 text-[14px] text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-primary shrink-0" />
                <span><strong className="text-foreground">PDF 분할</strong> — 원하는 페이지 범위를 별도 파일로 추출</span>
              </li>
              <li className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary shrink-0" />
                <span><strong className="text-foreground">PDF 병합</strong> — 여러 PDF를 원하는 순서로 합치기</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span><strong className="text-foreground">마크다운 → PDF 변환</strong> — 마크다운에서 바로 PDF로 내보내기</span>
              </li>
            </ul>
            <Link
              href="/pdf/merge"
              className="inline-block px-5 py-2.5 bg-surface border border-border text-foreground rounded-lg text-[14px] font-medium hover:bg-surface-secondary transition-colors"
            >
              PDF 도구 사용해보기
            </Link>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
