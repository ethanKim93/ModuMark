"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, Layers, PenSquare, Scissors, ScanText } from "lucide-react";
import { StorageIndicator } from "./StorageIndicator";
import { AdSlot } from "@/components/ads/AdSlot";
import { useTabStore } from "@/stores/tabStore";
import { openMarkdownFile } from "@/lib/fileSystem";

const pdfTools = [
  { label: "Merge", href: "/pdf/merge", icon: Layers },
  { label: "Split", href: "/pdf/split", icon: Scissors },
  { label: "OCR", href: "/pdf/ocr", icon: ScanText },
];

export function EditorSidebar() {
  const pathname = usePathname();
  const { tabs, activeTabId, openTab } = useTabStore();

  const handleOpenFile = async () => {
    const result = await openMarkdownFile();
    if (!result) return;
    openTab({
      title: result.name,
      content: result.content,
      isDirty: false,
      fileHandle: result.handle ?? undefined,
    });
  };

  const openFiles = tabs.filter((t) => t.fileHandle);
  const editorActive = pathname.startsWith("/editor");

  return (
    <aside className="flex flex-col bg-surface border-r border-border w-14 lg:w-60 transition-all">
      {/* 로고 */}
      <div className="px-2 lg:px-4 py-4 border-b border-border flex items-center justify-center lg:justify-start">
        <Link href="/" className="text-primary">
          <FileText className="h-5 w-5 lg:hidden" />
          <span className="hidden lg:block text-xl font-bold text-foreground">ModuMark</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-1 lg:px-2 py-3 space-y-4">
        {/* LOCAL WORKSPACE */}
        <div>
          <p className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B] px-2 mb-2">
            Local Workspace
          </p>
          {/* 에디터 링크 */}
          <Link
            href="/editor"
            title="에디터"
            className={`flex items-center justify-center lg:justify-start gap-2 w-full px-2 py-2 rounded-md text-[14px] transition-colors min-h-[44px] ${
              editorActive
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            }`}
          >
            <PenSquare className="h-4 w-4 shrink-0" />
            <span className="hidden lg:block">에디터</span>
          </Link>
          {/* 파일 열기 버튼 */}
          <button
            onClick={handleOpenFile}
            title="파일 열기"
            className="flex items-center justify-center lg:justify-start gap-2 w-full px-2 py-2 rounded-md text-[13px] text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors min-h-[40px]"
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span className="hidden lg:block">파일 열기</span>
          </button>
          {/* 열린 파일 목록 */}
          {openFiles.length > 0 && (
            <div className="hidden lg:block mt-1 space-y-0.5">
              {openFiles.map((t) => (
                <div
                  key={t.id}
                  className={`px-2 py-1.5 rounded text-[12px] truncate cursor-pointer transition-colors ${
                    t.id === activeTabId
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.isDirty && <span className="text-primary mr-1">●</span>}
                  {t.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PDF Power Tools */}
        <div>
          <p className="hidden lg:block text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748B] px-2 mb-2">
            PDF Power Tools
          </p>
          <nav className="space-y-0.5">
            {pdfTools.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`flex items-center justify-center lg:justify-start gap-3 px-2 py-2 rounded-md text-[14px] transition-colors min-h-[44px] ${
                    active
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* StorageIndicator + AdSlot */}
      <div className="border-t border-border">
        <div className="hidden lg:block">
          <StorageIndicator />
        </div>
        <AdSlot slot="sidebar-editor" className="mx-2 mb-2" />
      </div>
    </aside>
  );
}
