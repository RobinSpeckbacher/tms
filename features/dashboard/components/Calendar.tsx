"use client";

import {
  IlamyCalendar,
  useIlamyCalendarContext,
} from "@ilamy/calendar";
import type { CalendarEvent } from "@ilamy/calendar";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";

import TruckForm from "./TruckForm";
import TruckEvent from "./TruckEvent";
import type { SendungRow } from "@/hooks/useSendungen";

/* ── Custom Header ────────────────────────────────────────────────── */
function CalendarHeader() {
  const { currentDate, view, setView, nextPeriod, prevPeriod, openEventForm } =
    useIlamyCalendarContext();

  const views = [
    { key: "day" as const, label: "Tag" },
    { key: "week" as const, label: "Woche" },
  ];

  const formatTitle = () => {
    if (view === "day") return currentDate.format("DD. MMMM YYYY");
    if (view === "week") {
      const start = currentDate.startOf("week");
      const end = currentDate.endOf("week");
      return `${start.format("DD.MM.")} – ${end.format("DD.MM.YYYY")}`;
    }
    return currentDate.format("MMMM YYYY");
  };

  return (
    <div className="border-b border-slate-200">
      <div className="flex items-center justify-between px-4 h-11">
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            variant="plain"
            onClick={prevPeriod}
            sx={{ color: "#0f172b", "&:hover": { bgcolor: "#155dfc14" } }}
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton
            size="sm"
            variant="plain"
            onClick={nextPeriod}
            sx={{ color: "#0f172b", "&:hover": { bgcolor: "#155dfc14" } }}
          >
            <ChevronRight className="h-4 w-4" />
          </IconButton>
          <Typography
            level="title-sm"
            sx={{ ml: 1, color: "#0f172b", fontWeight: 600 }}
          >
            {formatTitle()}
          </Typography>
        </div>

        <Stack direction="row" spacing={1} alignItems="center">
          <div className="flex rounded-md border border-[#0f172b]/15 overflow-hidden text-xs">
            {views.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  view === key
                    ? "bg-[#155dfc] text-white"
                    : "text-[#57688e] hover:bg-[#155dfc]/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            startDecorator={<Plus className="h-3.5 w-3.5" />}
            onClick={() => openEventForm()}
            sx={{
              bgcolor: "#155dfc",
              fontSize: "0.75rem",
              "&:hover": { bgcolor: "#1250d4" },
            }}
          >
            Neuer LKW
          </Button>
        </Stack>
      </div>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
interface CalendarProps {
  events?: CalendarEvent[];
  truckSendungenMap?: Map<string, SendungRow[]>;
  onEventClick?: (event: CalendarEvent) => void;
  onCellClick?: (info: { start: unknown; end: unknown }) => void;
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onDropSendung?: (truckId: string, sendungId: string) => void;
  onUnassignSendung?: (sendungId: string) => void;
  onTruckClick?: (truckId: string) => void;
}

export default function Calendar({
  events = [],
  truckSendungenMap = new Map(),
  onEventClick,
  onCellClick,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  onDropSendung,
  onUnassignSendung,
  onTruckClick,
}: CalendarProps) {
  return (
    <div className="ilamy-custom h-full w-full flex flex-col">
      <IlamyCalendar
        events={events}
        initialView="day"
        firstDayOfWeek="monday"
        locale="de"
        timeFormat="24-hour"
        headerComponent={<CalendarHeader />}
        renderEvent={(event) => {
          const ext = event as unknown as Record<string, unknown>;
          const truckId = ext.truckId as string | undefined;
          return (
            <TruckEvent
              event={event}
              assignedSendungen={truckId ? truckSendungenMap.get(truckId) ?? [] : []}
              onDropSendung={onDropSendung ?? (() => {})}
              onUnassignSendung={onUnassignSendung ?? (() => {})}
              onClick={truckId ? () => onTruckClick?.(truckId) : undefined}
            />
          );
        }}
        renderEventForm={(props) => <TruckForm {...props} />}
        onEventClick={onEventClick}
        onCellClick={onCellClick}
        onEventAdd={onEventAdd}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
      />
    </div>
  );
}
