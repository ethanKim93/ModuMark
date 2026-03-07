import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "ModuMark 이용약관. 서비스 이용 조건, 금지 행위, 면책 조항.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">ModuMark</Link>
        <Link href="/" className="text-[14px] text-muted-foreground hover:text-foreground">← 홈으로</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">이용약관</h1>
        <p className="text-[12px] text-muted-foreground mb-8">최초 작성일: 2026년 3월 7일</p>

        <div className="space-y-8 text-[14px]">
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">1. 서비스 제공</h2>
            <p className="text-muted-foreground leading-relaxed">
              ModuMark는 마크다운 WYSIWYG 편집기 및 PDF 처리 도구를 무료로 제공합니다.
              서비스는 Google AdSense 광고 수익으로 운영됩니다.
              회원가입 없이 즉시 사용할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">2. 무료 이용</h2>
            <p className="text-muted-foreground leading-relaxed">
              서비스의 모든 핵심 기능은 무료로 제공됩니다.
              유료 구독, 숨겨진 비용, 기능 잠금이 없습니다.
              서비스 운영은 광고 수익을 통해 이루어집니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">3. 금지 행위</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>서비스를 이용하여 불법적인 활동을 수행하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>자동화 도구를 사용하여 서비스에 과도한 부하를 가하는 행위</li>
              <li>광고 차단 소프트웨어를 사용하여 광고를 우회하는 행위 (서비스 이용은 가능하나 권장하지 않음)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">4. 면책 조항</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              서비스는 클라이언트 사이드에서 파일을 처리합니다.
              파일 처리 중 발생하는 데이터 손실에 대해 서비스는 책임을 지지 않습니다.
              중요한 파일은 반드시 백업을 유지하시기 바랍니다.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              서비스는 "있는 그대로(AS IS)" 제공됩니다.
              특정 목적에의 적합성, 무결성, 가용성 등에 대한 명시적 또는 묵시적 보증을 제공하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">5. 서비스 변경 및 중단</h2>
            <p className="text-muted-foreground leading-relaxed">
              서비스는 사전 고지 없이 기능을 변경하거나 서비스를 중단할 수 있습니다.
              서비스 중단으로 인한 손해에 대해 책임을 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">6. 지적 재산권</h2>
            <p className="text-muted-foreground leading-relaxed">
              서비스의 코드, 디자인, 로고 등은 ModuMark의 지적 재산입니다.
              사용자가 작성한 문서 내용의 저작권은 사용자에게 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. 약관 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 약관은 서비스 변경 시 업데이트될 수 있습니다.
              지속적인 서비스 이용은 변경된 약관에 동의한 것으로 간주합니다.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border mt-8 py-6 px-6">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Link href="/privacy" className="text-[12px] text-muted-foreground hover:text-foreground">개인정보처리방침</Link>
          <Link href="/security" className="text-[12px] text-muted-foreground hover:text-foreground">보안 안내</Link>
        </div>
      </footer>
    </div>
  );
}
