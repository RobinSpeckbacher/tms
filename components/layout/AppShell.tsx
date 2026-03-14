"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0 lg:z-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AppSidebar onNavigate={closeSidebar} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AppHeader onMenuToggle={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
