import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PdfSidebar } from "@/components/layout/PdfSidebar";
import { PdfSplitLoader } from "@/components/pdf/PdfSplitLoader";

export const metadata: Metadata = {
  title: "PDF 분할",
  description: "PDF를 페이지 범위로 무료 분할. 서버 전송 없이 브라우저에서 처리.",
};

export default function PdfSplitPage() {
  return (
    <AppShell sidebar={<PdfSidebar />}>
      <PdfSplitLoader />
    </AppShell>
  );
}
