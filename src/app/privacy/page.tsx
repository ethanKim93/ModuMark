import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "ModuMark 개인정보처리방침. 수집하는 정보, Google AdSense 쿠키 사용에 대한 안내.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">개인정보처리방침</h1>
        <p className="text-[12px] text-muted-foreground mb-8">최초 작성일: 2026년 3월 7일</p>

        <div className="space-y-8 text-[14px]">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. 개요</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModuMark(이하 "서비스")는 사용자의 개인정보를 수집하거나 외부 서버에 저장하지 않습니다.
              모든 파일 처리는 사용자의 브라우저 안에서 로컬로 수행됩니다.
              본 방침은 서비스 운영에 사용되는 광고 서비스의 쿠키 사용에 대해 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. 수집하는 개인정보</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ModuMark는 회원가입, 로그인 기능이 없으며 사용자의 이름, 이메일 등
              개인 식별 정보를 수집하지 않습니다.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              사용자가 편집하는 파일 내용은 사용자의 기기에만 저장되며,
              어떠한 서버로도 전송되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. 쿠키 및 광고</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              서비스는 Google AdSense를 통해 광고를 표시합니다.
              Google AdSense는 다음과 같은 쿠키를 사용할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3">
              <li>광고 게재 및 보고를 위한 쿠키</li>
              <li>DoubleClick 쿠키 (맞춤형 광고)</li>
              <li>Google Analytics 쿠키 (서비스 개선 목적)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-3">
              이러한 쿠키는 사용자의 광고 경험 개선 및 광고 효과 측정에 사용됩니다.
              사용자의 파일 내용이나 편집 데이터는 광고 목적으로 사용되지 않습니다.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Google의 개인정보처리방침은{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://policies.google.com/privacy
              </a>
              에서 확인하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. 쿠키 거부 방법</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              브라우저 설정에서 쿠키를 비활성화할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
              <li>Firefox: 설정 → 개인 정보 및 보안 → 쿠키 및 사이트 데이터</li>
              <li>Safari: 환경설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. 로컬 스토리지</h2>
            <p className="text-muted-foreground leading-relaxed">
              서비스는 자동 저장 기능을 위해 브라우저의 localStorage를 사용할 수 있습니다.
              이 데이터는 사용자의 기기에만 저장되며 외부로 전송되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. 방침 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 방침은 서비스 변경 시 업데이트될 수 있습니다.
              중요한 변경 사항이 있을 경우 서비스 내에서 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. 문의</h2>
            <p className="text-muted-foreground leading-relaxed">
              개인정보 관련 문의는 GitHub Issues를 통해 제출해 주세요.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
