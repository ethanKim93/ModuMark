"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Layers, Scissors } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Editor", href: "/editor", icon: FileText },
  { label: "Merge", href: "/pdf/merge", icon: Layers },
  { label: "Split", href: "/pdf/split", icon: Scissors },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex md:hidden bg-surface border-t border-border z-50">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[44px] text-[10px] transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
