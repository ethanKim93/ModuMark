import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PdfSidebar } from "@/components/layout/PdfSidebar";
import { PdfMergeLoader } from "@/components/pdf/PdfMergeLoader";

export const metadata: Metadata = {
  title: "PDF 병합",
  description: "여러 PDF 파일을 하나로 무료 병합. 서버 전송 없이 브라우저에서 처리.",
};

export default function PdfMergePage() {
  return (
    <AppShell sidebar={<PdfSidebar />}>
      <PdfMergeLoader />
    </AppShell>
  );
}
