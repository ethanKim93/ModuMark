import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { PdfSidebar } from "@/components/layout/PdfSidebar";

export const metadata: Metadata = {
  title: "PDF OCR",
  description: "PDF에서 텍스트를 추출하는 무료 OCR 도구. 브라우저에서 로컬 처리.",
};

export default function PdfOcrPage() {
  return (
    <AppShell sidebar={<PdfSidebar />}>
      <div className="flex-1 overflow-auto bg-background p-6">
        <h1 className="text-lg font-bold text-foreground">PDF OCR</h1>
      </div>
    </AppShell>
  );
}
