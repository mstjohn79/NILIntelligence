"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ArrowRightLeft,
  Building2,
  Search,
  Settings,
  Target,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Players", href: "/players", icon: Users },
  { name: "Transfer Portal", href: "/portal", icon: ArrowRightLeft },
  { name: "Teams", href: "/teams", icon: Building2 },
  { name: "Coach Search", href: "/search", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          NIL
        </div>
        <span className="font-semibold text-lg">Intelligence</span>
      </div>

      {/* Search */}
      <div className="p-4">
        <button className="flex w-full items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Search className="h-4 w-4" />
          <span>Search players...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
