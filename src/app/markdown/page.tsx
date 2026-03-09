import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TabBar } from "@/components/layout/TabBar";
import { MarkdownCanvasLoader } from "@/components/markdown/MarkdownCanvasLoader";
import { FloatingAdSlot } from "@/components/layout/FloatingAdSlot";

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
    </>
  );
}
