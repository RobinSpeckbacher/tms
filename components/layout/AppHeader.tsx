"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";

const subscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [key, label] of Object.entries(pageTitles)) {
    if (pathname.startsWith(key) && key !== "/dashboard") return label;
  }
  return "TMS Portal";
}

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const hydrated = useHydrated();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Menü öffnen"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          aria-label="Benachrichtigungen"
        >
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        {hydrated ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
        )}
      </div>
    </header>
  );
}
