"use client";

import { CircleX, Check } from "lucide-react";
import Button from "@mui/joy/Button";

interface DashboardSelectionToolbarProps {
  selectedCount: number;
  allFilteredSelected: boolean;
  onToggleAll: () => void;
  bulkCancelIsPending: boolean;
  onBulkCancel: () => void;
}

export function DashboardSelectionToolbar({
  selectedCount,
  allFilteredSelected,
  onToggleAll,
  bulkCancelIsPending,
  onBulkCancel,
}: DashboardSelectionToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#0f172b]/10 bg-white">
      <button
        type="button"
        onClick={onToggleAll}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-[#57688e] hover:bg-[#155dfc]/10 hover:text-[#155dfc]"
      >
        <Check className="h-3 w-3" />
        {allFilteredSelected ? "Auswahl aufheben" : "Alle sichtbaren"}
      </button>
      <span className="text-[11px] text-[#57688e]">
        {selectedCount} ausgewählt
      </span>
      <Button
        size="sm"
        color="danger"
        variant="soft"
        startDecorator={<CircleX className="h-3.5 w-3.5" />}
        loading={bulkCancelIsPending}
        onClick={onBulkCancel}
        sx={{
          ml: "auto",
          fontSize: "0.7rem",
          minHeight: 0,
          px: 1,
          py: 0.35,
        }}
      >
        Ausgewählte stornieren
      </Button>
    </div>
  );
}
