"use client";

import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface DashboardToolbarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onCreateTruck: () => void;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getWeekRange(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt: Date) =>
    dt.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  return `KW ${getISOWeek(monday)} · ${fmt(monday)} – ${fmt(sunday)}`;
}

function getISOWeek(d: Date): number {
  const tmp = new Date(d.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    )
  );
}

export function DashboardToolbar({
  selectedDate,
  onDateChange,
  onCreateTruck,
}: DashboardToolbarProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: 1.5,
        borderRadius: "md",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          size="sm"
          variant="plain"
          onClick={() => onDateChange(addDays(selectedDate, -7))}
          aria-label="Vorherige Woche"
        >
          <ChevronLeft size={16} />
        </IconButton>

        <Typography
          level="title-sm"
          sx={{ minWidth: 260, textAlign: "center" }}
        >
          {getWeekRange(selectedDate)}
        </Typography>

        <IconButton
          size="sm"
          variant="plain"
          onClick={() => onDateChange(addDays(selectedDate, 7))}
          aria-label="Nächste Woche"
        >
          <ChevronRight size={16} />
        </IconButton>

        <Button size="sm" variant="plain" onClick={() => onDateChange(today)}>
          Heute
        </Button>

        <Input
          type="date"
          size="sm"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          sx={{ ml: 1, fontSize: "xs" }}
        />
      </Stack>

      <Button
        size="sm"
        startDecorator={<Plus size={16} />}
        onClick={onCreateTruck}
      >
        LKW anlegen
      </Button>
    </Sheet>
  );
}
