import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TabBar } from "@/components/layout/TabBar";
import { MarkdownCanvasLoader } from "@/components/markdown/MarkdownCanvasLoader";
import { FloatingAdSlot } from "@/components/layout/FloatingAdSlot";
import { ToolHero } from "@/components/common/ToolHero";

export const metadata: Metadata = {
  title: "마크다운 에디터",
  description: "강력한 WYSIWYG 마크다운 편집기. 파일을 열고 편집하고 저장하세요.",
  alternates: {
    canonical: "https://modumark.app/markdown",
  },
  openGraph: {
    title: "마크다운 에디터 | ModuMark",
    description: "강력한 WYSIWYG 마크다운 편집기",
  },
};

export default function MarkdownPage() {
  return (
    <>
      <AppShell>
        <TabBar />
        <MarkdownCanvasLoader />
      </AppShell>
      <FloatingAdSlot />
      {/* SSR 콘텐츠: 크롤러가 읽는 도구 설명 */}
      <ToolHero
        title="ModuMark 마크다운 에디터"
        description="실시간 WYSIWYG 마크다운 편집기로 문서를 작성하세요. 파일이 외부 서버에 전송되지 않아 안전합니다. 브라우저에서 즉시 사용 가능하며 설치나 회원가입이 필요하지 않습니다."
        features={[
          '실시간 WYSIWYG 편집 — 마크다운 문법 없이도 직관적으로 작성',
          '한글 지원 PDF 내보내기 — NotoSansKR 폰트 내장',
          '자동 저장 (30초) — 미저장 데이터 보호',
          '탭 기반 다중 문서 관리 — 새 창 없이 여러 파일 동시 편집',
          '다크/라이트/시스템 테마 — 눈에 편한 편집 환경',
          '로컬 우선 처리 — 파일이 외부 서버로 전송되지 않음',
        ]}
        usageSteps={[
          '상단 탭에서 새 문서를 만들거나 기존 .md 파일을 엽니다',
          '에디터에서 마크다운 문법으로 자유롭게 편집합니다',
          'Ctrl+S로 저장하거나 PDF로 내보내기 버튼을 클릭합니다',
        ]}
      />
    </>
  );
}
