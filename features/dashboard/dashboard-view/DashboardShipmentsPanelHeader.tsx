"use client";

import { motion } from "motion/react";
import { Package, Plus, RepeatIcon, ChevronDown } from "lucide-react";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";

interface DashboardShipmentsPanelHeaderProps {
  availableCalendarWeeks: number[];
  selectedCalendarWeek: number | "all";
  onCalendarWeekChange: (week: number | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isAuftraegePanelExpanded: boolean;
  onToggleAuftraegePanelExpanded: () => void;
  sendungenLoading: boolean;
  offeneSendungenCount: number;
  onNewShipmentClick: () => void;
  onVorlagenClick: () => void;
}

export function DashboardShipmentsPanelHeader({
  availableCalendarWeeks,
  selectedCalendarWeek,
  onCalendarWeekChange,
  searchQuery,
  onSearchQueryChange,
  isAuftraegePanelExpanded,
  onToggleAuftraegePanelExpanded,
  sendungenLoading,
  offeneSendungenCount,
  onNewShipmentClick,
  onVorlagenClick,
}: DashboardShipmentsPanelHeaderProps) {
  const showBorderBottom =
    isAuftraegePanelExpanded && (sendungenLoading || offeneSendungenCount > 0);

  return (
    <div
      className={`flex items-center gap-2 px-3 h-11 shrink-0 ${showBorderBottom ? "border-b border-[#0f172b]/10" : ""}`}
    >
      <Package className="h-4 w-4 text-[#155dfc]" />
      <h3 className="text-sm font-semibold text-[#0f172b]">Sendeaufträge</h3>

      {/* KW pills or empty state */}
      {!sendungenLoading && offeneSendungenCount === 0 ? (
        <span className="text-xs text-[#57688e] ml-2">
          Keine offenen Aufträge
        </span>
      ) : (
        <div className="flex items-center gap-1 ml-3">
          {availableCalendarWeeks.map((calendarWeek) => (
            <button
              key={calendarWeek}
              onClick={() => onCalendarWeekChange(calendarWeek)}
              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                selectedCalendarWeek === calendarWeek
                  ? "bg-[#155dfc] text-white"
                  : "text-[#57688e] hover:bg-[#155dfc]/10"
              }`}
            >
              KW {calendarWeek}
            </button>
          ))}
          <button
            onClick={() => onCalendarWeekChange("all")}
            className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
              selectedCalendarWeek === "all"
                ? "bg-[#155dfc] text-white"
                : "text-[#57688e] hover:bg-[#155dfc]/10"
            }`}
          >
            Alle
          </button>
        </div>
      )}

      <Input
        size="sm"
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        placeholder="Suchen…"
        sx={{
          ml: "auto",
          width: 150,
          fontSize: "0.75rem",
          "--Input-focusedHighlight": "#155dfc",
        }}
      />
      <Button
        size="sm"
        variant="plain"
        startDecorator={<Plus className="h-3 w-3" />}
        onClick={onNewShipmentClick}
        sx={{
          fontSize: "0.7rem",
          color: "#57688e",
          minHeight: 0,
          px: 0.75,
          py: 0.25,
        }}
      >
        Neuer Auftrag
      </Button>
      <Button
        size="sm"
        variant="plain"
        startDecorator={<RepeatIcon className="h-3 w-3" />}
        onClick={onVorlagenClick}
        sx={{
          fontSize: "0.7rem",
          color: "#57688e",
          minHeight: 0,
          px: 0.75,
          py: 0.25,
        }}
      >
        Wiederkehrende Aufträge
      </Button>

      <IconButton
        size="sm"
        variant="plain"
        color="neutral"
        onClick={onToggleAuftraegePanelExpanded}
        aria-expanded={isAuftraegePanelExpanded}
        aria-label={
          isAuftraegePanelExpanded
            ? "Sendeaufträge einklappen"
            : "Sendeaufträge ausklappen"
        }
        sx={{ ml: 0.5 }}
      >
        <motion.span
          animate={{ rotate: isAuftraegePanelExpanded ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="inline-flex"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </IconButton>
    </div>
  );
}
