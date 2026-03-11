import Link from 'next/link';
import { CookieResetButton } from '@/components/common/CookieResetButton';

const toolLinks = [
  { href: '/markdown', label: '마크다운 에디터' },
  { href: '/pdf', label: 'PDF 도구' },
  { href: '/pdf/merge', label: 'PDF 병합' },
  { href: '/pdf/split', label: 'PDF 분할' },
  { href: '/pdf/ocr', label: 'PDF OCR' },
];

const legalLinks = [
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/terms', label: '이용약관' },
  { href: '/security', label: '보안 안내' },
];

const infoLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: '문의하기' },
  { href: '/download', label: '데스크탑 앱' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-12 py-10 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
          {/* 브랜드 */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-base font-bold text-primary mb-2">ModuMark</p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              무료 마크다운 편집기 + PDF 통합 도구. 파일은 서버로 전송되지 않습니다.
            </p>
            <p className="text-[12px] text-muted-foreground mt-3">
              문의:{' '}
              <a
                href="mailto:modu.markdown@gmail.com"
                className="text-primary hover:underline"
              >
                modu.markdown@gmail.com
              </a>
            </p>
          </div>

          {/* 도구 */}
          <div>
            <p className="text-[12px] font-semibold text-foreground mb-3">도구</p>
            <ul className="space-y-2">
              {toolLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <p className="text-[12px] font-semibold text-foreground mb-3">정보</p>
            <ul className="space-y-2">
              {infoLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 법적 */}
          <div>
            <p className="text-[12px] font-semibold text-foreground mb-3">법적 고지</p>
            <ul className="space-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieResetButton />
              </li>
              <li>
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Google 데이터 사용 방식
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">© 2026 ModuMark. 무료로 제공됩니다.</p>
          <p className="text-[11px] text-muted-foreground">
            <a
              href="https://github.com/modumark/modumark/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub Issues
            </a>
            {' '}에서 피드백을 보내주세요
          </p>
        </div>
      </div>
    </footer>
  );
}
