"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { IlamyCalendar, useIlamyCalendarContext } from "@ilamy/calendar";
import type { CalendarEvent } from "@ilamy/calendar";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import Checkbox from "@mui/joy/Checkbox";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";

/* ── Types ────────────────────────────────────────────────────────── */
interface EventFormProps {
  open?: boolean;
  selectedEvent?: CalendarEvent | null;
  onAdd?: (event: CalendarEvent) => void;
  onUpdate?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onClose: () => void;
}

/* ── Custom Event Form Modal ──────────────────────────────────────── */
function EventFormModal({
  open,
  selectedEvent,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: EventFormProps) {
  const isEdit = !!selectedEvent?.id;

  const initial = useMemo(() => {
    if (selectedEvent) {
      const s = selectedEvent.start
        ? dayjs(selectedEvent.start as unknown as string)
        : dayjs();
      return {
        title: selectedEvent.title || "",
        description: selectedEvent.description || "",
        allDay: selectedEvent.allDay || false,
        startDate: s.format("YYYY-MM-DD"),
        startTime: s.format("HH:mm"),
        bgColor: selectedEvent.backgroundColor || "#155dfc",
      };
    }
    return {
      title: "",
      description: "",
      allDay: false,
      startDate: dayjs().format("YYYY-MM-DD"),
      startTime: "08:00",
      bgColor: "#155dfc",
    };
  }, [selectedEvent]);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [allDay, setAllDay] = useState(initial.allDay);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [bgColor, setBgColor] = useState(initial.bgColor);

  // Reset form when modal opens/event changes
  const resetKey = `${open}-${selectedEvent?.id ?? "new"}`;
  useMemo(() => {
    setTitle(initial.title);
    setDescription(initial.description);
    setAllDay(initial.allDay);
    setStartDate(initial.startDate);
    setStartTime(initial.startTime);
    setBgColor(initial.bgColor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    const start = allDay
      ? dayjs(`${startDate}T00:00:00`)
      : dayjs(`${startDate}T${startTime}:00`);
    const end = allDay ? dayjs(`${startDate}T23:59:59`) : start.add(1, "hour");

    const event = {
      id: selectedEvent?.id || `evt-${Date.now()}`,
      title,
      description,
      start,
      end,
      allDay,
      backgroundColor: bgColor,
      color: "#fff",
    } as unknown as CalendarEvent;

    if (isEdit) {
      onUpdate?.(event);
    } else {
      onAdd?.(event);
    }
    onClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      onDelete?.(selectedEvent);
      onClose();
    }
  };

  const colorOptions = [
    "#155dfc",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#57688e",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <Box
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={{
          width: "100%",
          maxWidth: 420,
          bgcolor: "#fff",
          borderRadius: "lg",
          border: "1px solid #d5dbe8",
          boxShadow: "lg",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography level="title-sm" sx={{ color: "#0f172b" }}>
            {isEdit ? "LKW bearbeiten" : "Neuer LKW"}
          </Typography>
          <IconButton
            size="sm"
            variant="plain"
            onClick={onClose}
            sx={{ color: "#57688e" }}
          >
            <span className="text-lg leading-none">×</span>
          </IconButton>
        </Box>
        <Divider />

        {/* Body */}
        <Stack spacing={2} sx={{ px: 2.5, py: 2 }}>
          {/* Kennzeichen */}
          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Kennzeichen
            </Typography>
            <Input
              size="sm"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. W-12345X"
              sx={{ "--Input-focusedHighlight": "#155dfc", color: "#0f172b" }}
            />
          </Box>

          {/* Beschreibung */}
          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
            >
              Beschreibung
            </Typography>
            <Textarea
              size="sm"
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionale Details…"
              sx={{
                "--Textarea-focusedHighlight": "#155dfc",
                color: "#0f172b",
              }}
            />
          </Box>

          {/* Ganztägig */}
          <Checkbox
            size="sm"
            label="Ganztägig"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            sx={{ color: "#0f172b" }}
          />

          {/* Start */}
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ flex: 1 }}>
              <Typography
                level="body-xs"
                sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
              >
                Datum
              </Typography>
              <Input
                size="sm"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={{ "--Input-focusedHighlight": "#155dfc" }}
              />
            </Box>
            {!allDay && (
              <Box sx={{ width: 120 }}>
                <Typography
                  level="body-xs"
                  sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
                >
                  Uhrzeit
                </Typography>
                <Input
                  size="sm"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  sx={{ "--Input-focusedHighlight": "#155dfc" }}
                />
              </Box>
            )}
          </Stack>

          {/* Farbe */}
          <Box>
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", mb: 0.75, fontWeight: 500 }}
            >
              Farbe
            </Typography>
            <Stack direction="row" spacing={1}>
              {colorOptions.map((c) => (
                <Box
                  key={c}
                  onClick={() => setBgColor(c)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: c,
                    cursor: "pointer",
                    border:
                      bgColor === c
                        ? "2px solid #0f172b"
                        : "2px solid transparent",
                    transform: bgColor === c ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider />

        {/* Actions */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 2.5, py: 1.5, justifyContent: "flex-end" }}
        >
          {isEdit && (
            <Button
              variant="plain"
              color="danger"
              size="sm"
              startDecorator={<Trash2 className="h-3.5 w-3.5" />}
              onClick={handleDelete}
              sx={{ mr: "auto" }}
            >
              Löschen
            </Button>
          )}
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            onClick={onClose}
            sx={{ color: "#57688e" }}
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
          >
            {isEdit ? "Speichern" : "Erstellen"}
          </Button>
        </Stack>
      </Box>
    </div>
  );
}

/* ── Custom Header (rendered inside IlamyCalendar context) ────────── */
function CalendarHeader() {
  const { currentDate, view, setView, nextPeriod, prevPeriod, openEventForm } =
    useIlamyCalendarContext();

  const views = [
    { key: "month" as const, label: "Monat" },
    { key: "week" as const, label: "Woche" },
    { key: "day" as const, label: "Tag" },
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
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#0f172b]/10">
      {/* Navigation */}
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

      {/* View switcher + Add button */}
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
          Neu
        </Button>
      </Stack>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onCellClick?: (info: { start: unknown; end: unknown }) => void;
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
}

export default function Calendar({
  events = [],
  onEventClick,
  onCellClick,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: CalendarProps) {
  return (
    <div className="ilamy-custom h-full w-full flex flex-col">
      <IlamyCalendar
        events={events}
        initialView="week"
        firstDayOfWeek="monday"
        locale="de"
        timeFormat="24-hour"
        headerComponent={<CalendarHeader />}
        renderEventForm={(props) => <EventFormModal {...props} />}
        onEventClick={onEventClick}
        onCellClick={onCellClick}
        onEventAdd={onEventAdd}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
      />
    </div>
  );
}
