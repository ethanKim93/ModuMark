import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { PdfEditorLoader } from '@/components/pdf/PdfEditorLoader';

export const metadata: Metadata = {
  title: 'PDF 도구',
  description: 'PDF 병합·분할·편집·OCR. 서버 전송 없이 브라우저에서 처리.',
  alternates: {
    canonical: "https://modumark.app/pdf",
  },
};

export default function PdfPage() {
  // 통합 사이드바는 PdfEditor 내부에서 렌더링 (UnifiedPdfSidebar)
  return (
    <AppShell>
      <PdfEditorLoader />
    </AppShell>
  );
}
