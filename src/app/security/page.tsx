import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CloudOff, Code, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "보안 안내",
  description:
    "ModuMark는 파일을 외부 서버에 전송하지 않습니다. 모든 처리는 브라우저에서 로컬로 수행됩니다.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 네비게이션 */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">ModuMark</Link>
        <Link href="/" className="text-[14px] text-muted-foreground hover:text-foreground">← 홈으로</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-lg bg-success/10">
            <Shield className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">보안 및 개인정보 보호</h1>
        </div>

        <p className="text-[14px] text-muted-foreground leading-relaxed mb-10">
          ModuMark는 사용자의 파일과 데이터를 외부 서버로 전송하지 않습니다.
          모든 문서 편집 및 PDF 처리는 사용자의 기기 브라우저 안에서만 이루어집니다.
        </p>

        {/* 로컬 처리 원칙 */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CloudOff className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">로컬 처리 원칙</h2>
          </div>
          <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-1">외부 서버 전송 없음</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                마크다운 파일 열기·편집·저장, PDF 병합·분할·변환 등 모든 작업에서
                파일 데이터는 외부 서버로 전송되지 않습니다. 인터넷 연결 없이도
                대부분의 기능을 사용할 수 있습니다.
              </p>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-1">브라우저 내 처리</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                File System Access API를 사용하여 운영체제의 파일 시스템에 직접 접근합니다.
                파일 내용은 브라우저 메모리에만 존재하며, 어떤 서버로도 전송되지 않습니다.
              </p>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-1">클라우드 동기화 비활성화</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                ModuMark는 클라우드 동기화 또는 원격 저장소 기능을 제공하지 않습니다.
                문서는 항상 사용자 기기의 로컬 파일 시스템에 저장됩니다.
              </p>
            </div>
          </div>
        </section>

        {/* 기술적 구현 */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">기술적 구현</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "File System Access API",
                desc: "브라우저 네이티브 API로 로컬 파일을 읽고 씁니다. 서버 업로드 없이 직접 파일 시스템에 접근합니다.",
              },
              {
                name: "pdf-lib (클라이언트 사이드)",
                desc: "PDF 병합·분할·변환을 브라우저에서 직접 처리합니다. 외부 PDF 처리 서버를 사용하지 않습니다.",
              },
              {
                name: "Tesseract.js (클라이언트 사이드)",
                desc: "OCR(광학 문자 인식)을 브라우저에서 직접 실행합니다. 이미지나 PDF 데이터가 외부 서버로 전송되지 않습니다.",
              },
              {
                name: "Milkdown (WYSIWYG 편집기)",
                desc: "마크다운 편집기는 완전히 클라이언트에서 동작합니다. 입력한 텍스트는 서버로 전송되지 않습니다.",
              },
            ].map(({ name, desc }) => (
              <div key={name} className="rounded border border-border bg-surface p-4">
                <p className="text-[13px] font-semibold text-foreground mb-1">{name}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 광고에 대해 */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">광고에 대해</h2>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5 space-y-3">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              ModuMark는 Google AdSense 광고를 통해 서비스를 무료로 운영합니다.
              광고 스크립트(Google AdSense)는 광고 관련 쿠키를 사용할 수 있습니다.
              이는 서비스 운영을 위한 표준적인 광고 방식입니다.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">편집 영역(마크다운 에디터, PDF 뷰어)에는 광고가 표시되지 않습니다.</strong>
              광고는 사이드바 하단 등 편집 작업을 방해하지 않는 위치에만 배치됩니다.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              사용자의 파일 내용이나 편집 데이터는 광고 목적으로 수집되거나
              Google에 전송되지 않습니다.
            </p>
          </div>
        </section>

        {/* 직접 확인하는 방법 */}
        <section className="mb-10 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-[14px] font-bold text-foreground mb-2">직접 확인하는 방법</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            브라우저 개발자 도구(F12) → Network 탭을 열고 ModuMark를 사용해보세요.
            파일을 편집하거나 PDF를 처리하는 동안 사용자 파일 데이터가 외부 서버로
            전송되는 네트워크 요청이 발생하지 않는 것을 직접 확인할 수 있습니다.
          </p>
        </section>

        {/* 문의 */}
        <section>
          <h2 className="text-[14px] font-bold text-foreground mb-2">문의</h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            보안 관련 문의사항이 있으시면 GitHub Issues를 통해 제보해 주세요.
          </p>
        </section>
      </main>

      <footer className="border-t border-border mt-8 py-6 px-6">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Link href="/privacy" className="text-[12px] text-muted-foreground hover:text-foreground">개인정보처리방침</Link>
          <Link href="/terms" className="text-[12px] text-muted-foreground hover:text-foreground">이용약관</Link>
        </div>
      </footer>
    </div>
  );
}
