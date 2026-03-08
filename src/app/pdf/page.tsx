import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { PdfSidebar } from '@/components/layout/PdfSidebar';
import { PdfEditorLoader } from '@/components/pdf/PdfEditorLoader';

export const metadata: Metadata = {
  title: 'PDF 도구',
  description: 'PDF 병합·분할·편집. 서버 전송 없이 브라우저에서 처리.',
};

export default function PdfPage() {
  return (
    <AppShell sidebar={<PdfSidebar />}>
      <PdfEditorLoader />
    </AppShell>
  );
}
