"use client";

import type { Dayjs } from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Route,
} from "lucide-react";
import type { Relation } from "@/hooks/useRelationen";
import { RelationVisibilityFilterMenu } from "./VersandnetzSubcomponents";

export type ViewMode = "day" | "3day" | "week";

const VIEW_LABELS: Record<ViewMode, string> = {
  day: "Tag",
  "3day": "3 Tage",
  week: "Woche",
};

interface VersandnetzHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentDate: Dayjs;
  onNavigate: (dir: -1 | 1) => void;
  onGoToday: () => void;
  dateLabel: string;
  weekNum: number;
  now: Dayjs;
  relationen: Relation[];
  activeRelationIds: Set<string>;
  onToggleRelation: (id: string) => void;
  filteredRelationenCount: number;
  onAddRelationClick: () => void;
  onCreateTruck: () => void;
}

export function VersandnetzHeader({
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToday,
  dateLabel,
  weekNum,
  now,
  relationen,
  activeRelationIds,
  onToggleRelation,
  filteredRelationenCount,
  onAddRelationClick,
  onCreateTruck,
}: VersandnetzHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 h-11 bg-white border-b border-slate-200 shrink-0">
      {/* Nav arrows */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onNavigate(-1)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate(1)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Date label — fixed width to prevent layout jumps */}
      <div className="flex items-center gap-2 w-64 shrink-0">
        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="text-sm font-semibold text-slate-800 truncate transition-opacity duration-100">
          {dateLabel}
        </span>
        <span
          className="text-[10px] font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 shrink-0 transition-opacity duration-100"
          style={{
            opacity: viewMode === "week" ? 1 : 0,
            pointerEvents: viewMode === "week" ? "auto" : "none",
          }}
        >
          KW {weekNum}
        </span>
      </div>

      <button
        onClick={onGoToday}
        className="text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100
                   rounded-md px-2.5 py-1 transition-colors shrink-0"
      >
        Heute
      </button>

      {/* Current time */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
        <Clock className="h-3 w-3" />
        <span className="font-mono font-medium" suppressHydrationWarning>
          {now.format("HH:mm")}
        </span>
      </div>

      {/* View switcher */}
      <div className="flex rounded-md border border-slate-200 overflow-hidden text-[11px] ml-2 shrink-0">
        {(["day", "3day", "week"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className={`px-2.5 py-1 font-medium transition-colors
              ${
                viewMode === mode
                  ? "bg-blue-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Right side: filter, relation count, buttons */}
      <div className="ml-auto flex items-center gap-2">
        {relationen.length > 0 && (
          <RelationVisibilityFilterMenu
            relationen={relationen}
            activeIds={activeRelationIds}
            onToggle={onToggleRelation}
          />
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Route className="h-3.5 w-3.5" />
          <span>{filteredRelationenCount} Relationen</span>
        </div>

        <button
          onClick={onAddRelationClick}
          className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px]
                     font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Relation
        </button>

        <button
          onClick={onCreateTruck}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px]
                     font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Neuer LKW
        </button>
      </div>
    </div>
  );
}
