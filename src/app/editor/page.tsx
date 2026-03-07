import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { EditorSidebar } from "@/components/layout/EditorSidebar";
import { TabBar } from "@/components/layout/TabBar";
import { EditorCanvasLoader } from "@/components/editor/EditorCanvasLoader";

export const metadata: Metadata = {
  title: "마크다운 에디터",
  description: "강력한 WYSIWYG 마크다운 편집기. 파일을 열고 편집하고 저장하세요.",
  openGraph: {
    title: "마크다운 에디터 | ModuMark",
    description: "강력한 WYSIWYG 마크다운 편집기",
  },
};

export default function EditorPage() {
  return (
    <AppShell sidebar={<EditorSidebar />}>
      <TabBar />
      <EditorCanvasLoader />
    </AppShell>
  );
}
