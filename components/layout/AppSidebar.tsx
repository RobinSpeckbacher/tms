"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck } from "lucide-react";
import { cn } from "@/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-500 rounded-md">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            TMS Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </p>
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              )}
            >
              <item.icon
                className={cn(
                  "w-4.5 h-4.5 flex-shrink-0",
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-white",
                )}
                size={18}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60 flex-shrink-0">
        <p className="text-slate-600 text-xs">TMS v1.0.0 · Beta</p>
      </div>
    </aside>
  );
}
