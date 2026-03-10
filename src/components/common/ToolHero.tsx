/** SSR 서버 컴포넌트 — 크롤러가 읽을 수 있는 도구 설명 콘텐츠 */

interface ToolHeroProps {
  title: string;
  description: string;
  features?: string[];
  usageSteps?: string[];
}

export function ToolHero({ title, description, features, usageSteps }: ToolHeroProps) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12 border-t border-border">
      {/* 도구 소개 */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {/* 주요 기능 */}
        {features && features.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">주요 기능</h3>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  {/* 체크 아이콘 */}
                  <svg
                    className="shrink-0 mt-0.5 h-4 w-4 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 사용 방법 */}
        {usageSteps && usageSteps.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">사용 방법</h3>
            <ol className="space-y-3">
              {usageSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-muted-foreground">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[12px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="mt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
