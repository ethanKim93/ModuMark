import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { PdfEditorLoader } from '@/components/pdf/PdfEditorLoader';
import { ToolHero } from '@/components/common/ToolHero';

export const metadata: Metadata = {
  title: 'PDF 도구',
  description: 'PDF 병합·분할·편집·OCR. 서버 전송 없이 브라우저에서 처리.',
  alternates: {
    canonical: "https://modumark.app/pdf",
  },
};

export default function PdfPage() {
  return (
    <>
      {/* 통합 사이드바는 PdfEditor 내부에서 렌더링 (UnifiedPdfSidebar) */}
      <AppShell>
        <PdfEditorLoader />
      </AppShell>
      {/* SSR 콘텐츠: 크롤러가 읽는 도구 설명 */}
      <ToolHero
        title="ModuMark PDF 도구"
        description="온라인에서 무료로 PDF를 병합, 분할, OCR 텍스트 추출하세요. 모든 처리는 브라우저에서 로컬로 수행되어 파일이 서버에 전송되지 않습니다. 기업 보안 정책을 준수하면서 PDF 작업을 처리할 수 있습니다."
        features={[
          'PDF 병합 — 최대 20개 파일, 100MB까지 지원',
          'PDF 분할 — 원하는 페이지 범위를 별도 파일로 추출',
          'OCR 텍스트 추출 — 한국어·영어 지원 (tesseract.js)',
          '드래그앤드롭으로 파일 순서 변경',
          '로컬 처리 — 파일이 외부 서버로 전송되지 않음',
          '완전 무료 — 설치·회원가입 불필요',
        ]}
        usageSteps={[
          'PDF 파일을 드래그앤드롭 또는 파일 선택으로 업로드합니다',
          '병합·분할·OCR 중 원하는 작업 탭을 선택합니다',
          '처리 완료 후 결과 파일을 다운로드합니다',
        ]}
      />
    </>
  );
}
