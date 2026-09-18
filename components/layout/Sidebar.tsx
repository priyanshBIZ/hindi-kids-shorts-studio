"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  CalendarDays, 
  Settings, 
  BarChart3, 
  Sparkles,
  Clapperboard
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Content Library", href: "/content", icon: FolderKanban },
    { name: "Create New Story", href: "/content/new", icon: PlusCircle, highlight: true },
    { name: "Content Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Analytics & Usage", href: "/analytics", icon: BarChart3 },
    { name: "Settings & API Status", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between p-4 fixed top-0 bottom-0 z-30">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800/80">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-xl">
            🐘
          </div>
          <div>
            <h1 className="font-bold text-slate-100 leading-tight text-sm flex items-center gap-1.5">
              Hindi Kids Shorts <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">V1</span>
            </h1>
            <p className="text-xs text-slate-400">Studio & Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href) && item.href !== "/content/new");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/80",
                  item.highlight && !isActive && "text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-orange-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Workflow pill */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
          <Clapperboard className="h-3.5 w-3.5 text-orange-400" />
          <span>V1 Google Flow</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Manual prompt checkpoint active. No UseAPI credentials required.
        </p>
      </div>
    </aside>
  );
}
