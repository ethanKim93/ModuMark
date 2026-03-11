import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "ModuMark 개인정보처리방침. 수집하는 정보, Google AdSense 쿠키 사용, GDPR 사용자 권리에 대한 안내.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">개인정보처리방침</h1>
        <p className="text-[12px] text-muted-foreground mb-8">최초 작성일: 2026년 3월 7일 | 최종 수정일: 2026년 3월 12일</p>

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
              Google을 포함한 제3자 광고 업체는 사용자가 이전에 본 서비스 또는 다른 웹사이트를 방문한 이력을 기반으로
              쿠키를 사용하여 광고를 게재할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3">
              <li>광고 게재 및 보고를 위한 쿠키</li>
              <li>DoubleClick 쿠키 (맞춤형 광고)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-3">
              이러한 쿠키는 사용자의 광고 경험 개선 및 광고 효과 측정에 사용됩니다.
              사용자의 파일 내용이나 편집 데이터는 광고 목적으로 사용되지 않습니다.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Google이 파트너 사이트에서 데이터를 사용하는 방식은{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google 파트너 사이트 데이터 사용 방식
              </a>
              에서 확인하실 수 있습니다.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              사용자는{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google 광고 설정(adssettings.google.com)
              </a>
              에서 맞춤형 광고를 비활성화할 수 있습니다.
              또한{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.aboutads.info
              </a>
              에서 제3자 업체의 맞춤형 광고용 쿠키 사용을 비활성화할 수 있습니다.
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
            <h2 className="text-lg font-bold text-foreground mb-3">6. 데이터 처리 법적 근거 (GDPR 제6조)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              EU/EEA 거주자에 대한 개인정보 처리는 다음 법적 근거를 기반으로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">정당한 이익 (Legitimate Interest)</strong>: 서비스 운영 및 보안 유지를 위한 기본 로그 처리
              </li>
              <li>
                <strong className="text-foreground">동의 (Consent)</strong>: Google AdSense 광고 쿠키 사용. 사이트 첫 방문 시 동의 배너를 통해 동의를 얻습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">7. 데이터 보유 기간</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ModuMark는 사용자 파일 데이터를 서버에 보관하지 않습니다.
              모든 파일 처리는 브라우저 메모리 내에서만 이루어지며, 세션 종료 시 삭제됩니다.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              광고 쿠키(Google AdSense)의 보유 기간은{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google 개인정보처리방침
              </a>
              에 따릅니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">8. EU 거주자의 권리 (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              EU/EEA 거주자는 다음 권리를 보유합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">열람권</strong>: 처리 중인 개인정보 확인 요청</li>
              <li><strong className="text-foreground">정정권</strong>: 부정확한 개인정보 수정 요청</li>
              <li><strong className="text-foreground">삭제권(잊힐 권리)</strong>: 개인정보 삭제 요청</li>
              <li><strong className="text-foreground">처리 제한권</strong>: 특정 상황에서 처리 일시 중지 요청</li>
              <li><strong className="text-foreground">이동권</strong>: 개인정보를 구조화된 형태로 받을 권리</li>
              <li><strong className="text-foreground">반대권</strong>: 정당한 이익에 근거한 처리에 대한 이의 제기</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              권리 행사를 원하시면 아래 연락처로 문의해 주세요. ModuMark는 서버에 개인 식별 데이터를 보관하지 않으므로
              대부분의 요청은 광고 쿠키 관련 Google 정책을 안내하는 방식으로 처리됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">9. 쿠키 동의 철회</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              언제든지 쿠키 동의를 철회할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>페이지 하단의 <strong className="text-foreground">쿠키 설정</strong> 링크를 클릭하여 동의를 철회하고 배너를 다시 표시할 수 있습니다.</li>
              <li>브라우저 설정에서 쿠키를 삭제하면 동의 기록이 초기화됩니다.</li>
              <li>사이트 재방문 시 동의 배너가 다시 표시됩니다.</li>
              <li>Google 맞춤형 광고 설정은{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google 광고 설정
                </a>
                에서 관리할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">10. 방침 변경</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 방침은 서비스 변경 시 업데이트될 수 있습니다.
              중요한 변경 사항이 있을 경우 서비스 내에서 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3">11. 문의</h2>
            <p className="text-muted-foreground leading-relaxed">
              개인정보 관련 문의는{" "}
              <a href="mailto:modu.markdown@gmail.com" className="text-primary hover:underline">
                modu.markdown@gmail.com
              </a>
              으로 이메일을 보내거나{" "}
              <a
                href="https://github.com/modumark/modumark/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub Issues
              </a>
              를 통해 제출해 주세요.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
