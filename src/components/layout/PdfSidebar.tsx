"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Scissors, ScanText } from "lucide-react";
import { StorageIndicator } from "./StorageIndicator";
import { AdSlot } from "@/components/ads/AdSlot";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Merge", href: "/pdf/merge", icon: Layers },
  { label: "Split", href: "/pdf/split", icon: Scissors },
  { label: "OCR", href: "/pdf/ocr", icon: ScanText },
];

export function PdfSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col bg-surface border-r border-border w-14 lg:w-70 transition-all">
      {/* 로고 */}
      <div className="px-2 lg:px-4 py-4 border-b border-border flex items-center justify-center lg:justify-start">
        <Link href="/" className="text-primary lg:text-foreground">
          <Layers className="h-5 w-5 lg:hidden" />
          <div className="hidden lg:block">
            <span className="text-xl font-bold">ModuMark</span>
            <p className="text-[11px] text-muted-foreground mt-0.5">PDF Tools</p>
          </div>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-1 lg:px-2 py-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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

      {/* StorageIndicator + AdSlot */}
      <div className="border-t border-border">
        <div className="hidden lg:block">
          <StorageIndicator />
        </div>
        <AdSlot slot="sidebar-pdf" className="mx-2 mb-2" />
      </div>
    </aside>
  );
}
