"use client";

import dayjs from "dayjs";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import { X } from "lucide-react";
import {
  calculateExpectedDates,
  type VorlageRow,
  type RecurrenceType,
} from "@/hooks/useVorlagen";
import type { TruckVorlageRow } from "@/hooks/useTruckVorlagen";

export const focusedInputSx = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

export const focusedInputErrorSx = {
  "--Input-focusedHighlight": "#ef4444",
  borderColor: "#ef4444",
} as const;

export const sectionLabelSx = {
  color: "#57688e",
  fontWeight: 600,
} as const;

export function FieldLabel({
  label,
  required,
  hasError,
  children,
}: {
  label: string;
  required?: boolean;
  hasError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        level="body-xs"
        sx={{
          color: hasError === true ? "#ef4444" : "#57688e",
          mb: 0.5,
          fontWeight: 500,
        }}
      >
        {label}
        {required === true ? " *" : ""}
      </Typography>
      {children}
    </Box>
  );
}

export const RECURRENCE_TYPE_OPTIONS: {
  value: RecurrenceType;
  label: string;
}[] = [
  { value: "none", label: "Keine Wiederholung" },
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "biweekly", label: "Alle 2 Wochen" },
  { value: "monthly", label: "Monatlich" },
];

export const ISO_WEEKDAYS = [
  { isoValue: 1, shortLabel: "Mo" },
  { isoValue: 2, shortLabel: "Di" },
  { isoValue: 3, shortLabel: "Mi" },
  { isoValue: 4, shortLabel: "Do" },
  { isoValue: 5, shortLabel: "Fr" },
  { isoValue: 6, shortLabel: "Sa" },
  { isoValue: 7, shortLabel: "So" },
];

export const PACKAGING_UNIT_OPTIONS = [
  { value: "europalette", label: "Europalette" },
  { value: "industriepalette", label: "Industriepalette" },
  { value: "gitterbox", label: "Gitterbox" },
  { value: "colli", label: "Colli / Karton" },
  { value: "sonstige", label: "Sonstige" },
];

export function buildRecurrenceSummaryLabel(
  recurrenceType: RecurrenceType,
  recurrenceDays: number[] | null,
): string {
  if (recurrenceType === "none") return "Keine";
  if (recurrenceType === "daily") return "Täglich";
  if (recurrenceType === "monthly") {
    const dayOfMonth = recurrenceDays?.[0];
    if (typeof dayOfMonth !== "number") return "Monatlich";
    if (!Number.isInteger(dayOfMonth)) return "Monatlich";
    if (dayOfMonth <= 0) return "Monatlich";
    return `Monatlich am ${dayOfMonth}.`;
  }
  const typeLabel = recurrenceType === "weekly" ? "Wöchentlich" : "Alle 2 Wo.";
  if (Array.isArray(recurrenceDays) && recurrenceDays.length > 0) {
    const weekdayNames = recurrenceDays.map(
      (isoDay) =>
        ISO_WEEKDAYS.find((weekday) => weekday.isoValue === isoDay)
          ?.shortLabel ?? isoDay,
    );
    return `${typeLabel}: ${weekdayNames.join(", ")}`;
  }
  return typeLabel;
}

export function findNextUpcomingDate(
  vorlage: Pick<
    VorlageRow | TruckVorlageRow,
    "recurrence_type" | "recurrence_days" | "active" | "skipped_dates"
  >,
): string {
  if (vorlage.recurrence_type === "none" || vorlage.active !== true) return "—";
  const upcomingDates = calculateExpectedDates(
    vorlage,
    dayjs(),
    dayjs().add(60, "day"),
  );
  if (!upcomingDates.length) return "—";
  return dayjs(upcomingDates[0]).format("DD.MM.YYYY");
}

export function WeekdayToggleButtons({
  selectedDays,
  onToggleDay,
}: {
  selectedDays: number[];
  onToggleDay: (isoWeekday: number) => void;
}) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {ISO_WEEKDAYS.map((weekday) => (
        <button
          key={weekday.isoValue}
          type="button"
          onClick={() => onToggleDay(weekday.isoValue)}
          className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
            selectedDays.includes(weekday.isoValue)
              ? "bg-[#155dfc] text-white border-[#155dfc]"
              : "bg-white text-[#57688e] border-[#d5dbe8] hover:border-[#155dfc]"
          }`}
        >
          {weekday.shortLabel}
        </button>
      ))}
    </Stack>
  );
}

export function SkippedDatesManager({
  skippedDates,
  onAddDate,
  onRemoveDate,
  newDateInputValue,
  onNewDateInputChange,
}: {
  skippedDates: string[];
  onAddDate: () => void;
  onRemoveDate: (dateString: string) => void;
  newDateInputValue: string;
  onNewDateInputChange: (value: string) => void;
}) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Datum überspringen">
            <Input
              size="sm"
              type="date"
              value={newDateInputValue}
              onChange={(event) => onNewDateInputChange(event.target.value)}
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Button
          size="sm"
          variant="outlined"
          onClick={onAddDate}
          disabled={newDateInputValue === ""}
          sx={{
            color: "#57688e",
            borderColor: "#d5dbe8",
            fontSize: "0.75rem",
            minHeight: 0,
            py: 0.75,
            "&:hover": { borderColor: "#155dfc", color: "#155dfc" },
          }}
        >
          Hinzufügen
        </Button>
      </Stack>

      {skippedDates.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {skippedDates.map((skippedDate) => (
            <Chip
              key={skippedDate}
              size="sm"
              variant="soft"
              endDecorator={
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onRemoveDate(skippedDate)}
                  sx={{ minWidth: 0, p: 0.25, ml: 0.25 }}
                >
                  <X className="h-2.5 w-2.5" />
                </IconButton>
              }
              sx={{
                fontSize: "0.65rem",
                bgcolor: "#fff0f0",
                color: "#ef4444",
                borderColor: "#fecaca",
              }}
            >
              {dayjs(skippedDate).format("DD.MM.YYYY")}
            </Chip>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export function RecurrenceConfigSection({
  recurrenceType,
  onRecurrenceTypeChange,
  selectedWeekdays,
  onToggleWeekday,
  monthlyDayOfMonth,
  onMonthlyDayOfMonthChange,
  loadingTime,
  onLoadingTimeChange,
  unloadingTime,
  onUnloadingTimeChange,
  offsetDaysValue,
  onOffsetDaysChange,
  lookaheadDaysValue,
  onLookaheadDaysChange,
}: {
  recurrenceType: RecurrenceType;
  onRecurrenceTypeChange: (type: RecurrenceType) => void;
  selectedWeekdays: number[];
  onToggleWeekday: (isoWeekday: number) => void;
  monthlyDayOfMonth: string;
  onMonthlyDayOfMonthChange: (value: string) => void;
  loadingTime: string;
  onLoadingTimeChange: (value: string) => void;
  unloadingTime: string;
  onUnloadingTimeChange: (value: string) => void;
  offsetDaysValue: string;
  onOffsetDaysChange: (value: string) => void;
  lookaheadDaysValue: string;
  onLookaheadDaysChange: (value: string) => void;
}) {
  const requiresWeekdaySelection =
    recurrenceType === "weekly" || recurrenceType === "biweekly";

  return (
    <Stack spacing={2}>
      <FieldLabel label="Wiederholungstyp">
        <Select
          size="sm"
          value={recurrenceType}
          onChange={(_event, value) => {
            if (value != null) {
              onRecurrenceTypeChange(value as RecurrenceType);
            }
          }}
          sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
        >
          {RECURRENCE_TYPE_OPTIONS.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FieldLabel>

      {requiresWeekdaySelection && (
        <FieldLabel label="Wochentage">
          <WeekdayToggleButtons
            selectedDays={selectedWeekdays}
            onToggleDay={onToggleWeekday}
          />
        </FieldLabel>
      )}

      {recurrenceType === "monthly" && (
        <FieldLabel label="Tag im Monat (1–31)">
          <Input
            size="sm"
            type="number"
            value={monthlyDayOfMonth}
            onChange={(event) => onMonthlyDayOfMonthChange(event.target.value)}
            slotProps={{ input: { min: 1, max: 31 } }}
            sx={focusedInputSx}
          />
        </FieldLabel>
      )}

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Ladezeit">
            <Input
              size="sm"
              type="time"
              value={loadingTime}
              onChange={(event) => onLoadingTimeChange(event.target.value)}
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Entladezeit">
            <Input
              size="sm"
              type="time"
              value={unloadingTime}
              onChange={(event) => onUnloadingTimeChange(event.target.value)}
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Tage bis Entladung">
            <Input
              size="sm"
              type="number"
              value={offsetDaysValue}
              onChange={(event) => onOffsetDaysChange(event.target.value)}
              slotProps={{ input: { min: 0 } }}
              endDecorator={
                <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
                  Tage
                </Typography>
              }
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Vorausplanungszeitraum">
            <Input
              size="sm"
              type="number"
              value={lookaheadDaysValue}
              onChange={(event) => onLookaheadDaysChange(event.target.value)}
              slotProps={{ input: { min: 1 } }}
              endDecorator={
                <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
                  Tage
                </Typography>
              }
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>
    </Stack>
  );
}
