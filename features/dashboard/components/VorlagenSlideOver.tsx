"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  ChevronLeft,
  RepeatIcon,
  Truck,
  X,
} from "lucide-react";
import SlideOver from "@/components/common/SlideOver";
import PlzOrtInput from "@/components/common/PlzOrtInput";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import {
  useVorlagen,
  useCreateVorlage,
  useUpdateVorlage,
  useDeleteVorlage,
  useToggleVorlageActive,
  useGenerateRecurringSendungen,
  calculateExpectedDates,
  type VorlageRow,
  type RecurrenceType,
} from "@/hooks/useVorlagen";
import {
  useTruckVorlagen,
  useCreateTruckVorlage,
  useUpdateTruckVorlage,
  useDeleteTruckVorlage,
  useToggleTruckVorlageActive,
  useGenerateRecurringTrucksWithShipments,
  type TruckVorlageRow,
} from "@/hooks/useTruckVorlagen";
import { useRelationen } from "@/hooks/useRelationen";
import { toast } from "react-toastify";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import Switch from "@mui/joy/Switch";
import Chip from "@mui/joy/Chip";
import Checkbox from "@mui/joy/Checkbox";
import dayjs from "dayjs";
import type { Unternehmen } from "@/hooks/useUnternehmen";

/* ── Shared style constants ─────────────────────────────────────────── */
const focusedInputSx = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

const focusedInputErrorSx = {
  "--Input-focusedHighlight": "#ef4444",
  borderColor: "#ef4444",
} as const;

const sectionLabelSx = {
  color: "#57688e",
  fontWeight: 600,
} as const;

/* ── Shared UI components ───────────────────────────────────────────── */
function FieldLabel({
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
          color: hasError ? "#ef4444" : "#57688e",
          mb: 0.5,
          fontWeight: 500,
        }}
      >
        {label}
        {required && " *"}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Recurrence configuration constants ────────────────────────────── */
const RECURRENCE_TYPE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: "none", label: "Keine Wiederholung" },
  { value: "daily", label: "Täglich" },
  { value: "weekly", label: "Wöchentlich" },
  { value: "biweekly", label: "Alle 2 Wochen" },
  { value: "monthly", label: "Monatlich" },
];

const ISO_WEEKDAYS = [
  { isoValue: 1, shortLabel: "Mo" },
  { isoValue: 2, shortLabel: "Di" },
  { isoValue: 3, shortLabel: "Mi" },
  { isoValue: 4, shortLabel: "Do" },
  { isoValue: 5, shortLabel: "Fr" },
  { isoValue: 6, shortLabel: "Sa" },
  { isoValue: 7, shortLabel: "So" },
];

const PACKAGING_UNIT_OPTIONS = [
  { value: "europalette", label: "Europalette" },
  { value: "industriepalette", label: "Industriepalette" },
  { value: "gitterbox", label: "Gitterbox" },
  { value: "colli", label: "Colli / Karton" },
  { value: "sonstige", label: "Sonstige" },
];

/* ── Human-readable recurrence summary for list display ────────────── */
function buildRecurrenceSummaryLabel(recurrenceType: RecurrenceType, recurrenceDays: number[] | null): string {
  if (recurrenceType === "none") return "Keine";
  if (recurrenceType === "daily") return "Täglich";
  if (recurrenceType === "monthly") {
    const dayOfMonth = recurrenceDays?.[0];
    return dayOfMonth ? `Monatlich am ${dayOfMonth}.` : "Monatlich";
  }
  const typeLabel = recurrenceType === "weekly" ? "Wöchentlich" : "Alle 2 Wo.";
  if (recurrenceDays?.length) {
    const weekdayNames = recurrenceDays.map(
      (isoDay) => ISO_WEEKDAYS.find((weekday) => weekday.isoValue === isoDay)?.shortLabel ?? isoDay,
    );
    return `${typeLabel}: ${weekdayNames.join(", ")}`;
  }
  return typeLabel;
}

/* ── Next upcoming date for a vorlage ──────────────────────────────── */
function findNextUpcomingDate(vorlage: Pick<VorlageRow | TruckVorlageRow, "recurrence_type" | "recurrence_days" | "active" | "skipped_dates">): string {
  if (vorlage.recurrence_type === "none" || !vorlage.active) return "—";
  const upcomingDates = calculateExpectedDates(vorlage, dayjs(), dayjs().add(60, "day"));
  if (!upcomingDates.length) return "—";
  return dayjs(upcomingDates[0]).format("DD.MM.YYYY");
}

/* ── Weekday toggle buttons ─────────────────────────────────────────── */
function WeekdayToggleButtons({
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

/* ── Skip dates manager (reused in both sendung and truck forms) ────── */
function SkippedDatesManager({
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
              onChange={(e) => onNewDateInputChange(e.target.value)}
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Button
          size="sm"
          variant="outlined"
          onClick={onAddDate}
          disabled={!newDateInputValue}
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

/* ── Recurrence configuration section (reused in both forms) ────────── */
function RecurrenceConfigSection({
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
          onChange={(_event, value) =>
            value && onRecurrenceTypeChange(value as RecurrenceType)
          }
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
            onChange={(e) => onMonthlyDayOfMonthChange(e.target.value)}
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
              onChange={(e) => onLoadingTimeChange(e.target.value)}
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
              onChange={(e) => onUnloadingTimeChange(e.target.value)}
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
              onChange={(e) => onOffsetDaysChange(e.target.value)}
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
              onChange={(e) => onLookaheadDaysChange(e.target.value)}
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

/* ── Props ─────────────────────────────────────────────────────────── */
interface VorlagenSlideOverProps {
  open: boolean;
  onClose: () => void;
}

type MainSectionTab = "sendungsVorlagen" | "lkwVorlagen";
type PageView = "list" | "form";

/* ══════════════════════════════════════════════════════════════════════
   Main VorlagenSlideOver component
   ══════════════════════════════════════════════════════════════════════ */
export default function VorlagenSlideOver({
  open,
  onClose,
}: VorlagenSlideOverProps) {
  /* ── Data hooks ────────────────────────────────────────────────────── */
  const { data: sendungVorlagen = [], isLoading: isSendungVorlagenLoading } =
    useVorlagen();
  const { data: truckVorlagen = [], isLoading: isTruckVorlagenLoading } =
    useTruckVorlagen();
  const { data: availableRelationen = [] } = useRelationen();

  const createSendungVorlage = useCreateVorlage();
  const updateSendungVorlage = useUpdateVorlage();
  const deleteSendungVorlage = useDeleteVorlage();
  const toggleSendungVorlageActive = useToggleVorlageActive();
  const generateStandaloneSendungen = useGenerateRecurringSendungen();

  const createTruckVorlage = useCreateTruckVorlage();
  const updateTruckVorlage = useUpdateTruckVorlage();
  const deleteTruckVorlage = useDeleteTruckVorlage();
  const toggleTruckVorlageActive = useToggleTruckVorlageActive();
  const generateTrucksWithShipments = useGenerateRecurringTrucksWithShipments();

  /* ── Navigation state ──────────────────────────────────────────────── */
  const [activeMainSection, setActiveMainSection] =
    useState<MainSectionTab>("sendungsVorlagen");
  const [currentPageView, setCurrentPageView] = useState<PageView>("list");

  /* ── Sendung vorlage form state ─────────────────────────────────────── */
  const [editingSendungVorlageId, setEditingSendungVorlageId] = useState<
    string | null
  >(null);
  const [sendungFormSubmitted, setSendungFormSubmitted] = useState(false);
  const [sendungVorlageName, setSendungVorlageName] = useState("");
  const [sendungKunde, setSendungKunde] = useState<Unternehmen | null>(null);
  const [sendungLadePlz, setSendungLadePlz] = useState("");
  const [sendungLadeort, setSendungLadeort] = useState("");
  const [sendungLadeAdresse, setSendungLadeAdresse] = useState("");
  const [sendungLadeLand, setSendungLadeLand] = useState("AT");
  const [sendungEntladePlz, setSendungEntladePlz] = useState("");
  const [sendungEntladeort, setSendungEntladeort] = useState("");
  const [sendungEntladeAdresse, setSendungEntladeAdresse] = useState("");
  const [sendungEntladeLand, setSendungEntladeLand] = useState("AT");
  const [sendungGewicht, setSendungGewicht] = useState("");
  const [sendungPackungseinheit, setSendungPackungseinheit] =
    useState("europalette");
  const [sendungAnzahl, setSendungAnzahl] = useState("");
  const [sendungLademeter, setSendungLademeter] = useState("");
  const [sendungVerkaufspreis, setSendungVerkaufspreis] = useState("");
  const [sendungRecurrenceType, setSendungRecurrenceType] =
    useState<RecurrenceType>("weekly");
  const [sendungSelectedWeekdays, setSendungSelectedWeekdays] = useState<
    number[]
  >([1]);
  const [sendungMonthlyDayOfMonth, setSendungMonthlyDayOfMonth] = useState("1");
  const [sendungLoadingTime, setSendungLoadingTime] = useState("08:00");
  const [sendungUnloadingTime, setSendungUnloadingTime] = useState("17:00");
  const [sendungOffsetDays, setSendungOffsetDays] = useState("0");
  const [sendungLookaheadDays, setSendungLookaheadDays] = useState("14");
  const [sendungSkippedDates, setSendungSkippedDates] = useState<string[]>([]);
  const [sendungNewSkipDateInput, setSendungNewSkipDateInput] = useState("");

  /* ── Truck vorlage form state ───────────────────────────────────────── */
  const [editingTruckVorlageId, setEditingTruckVorlageId] = useState<
    string | null
  >(null);
  const [truckFormSubmitted, setTruckFormSubmitted] = useState(false);
  const [truckVorlageName, setTruckVorlageName] = useState("");
  const [truckKennzeichen, setTruckKennzeichen] = useState("");
  const [truckFraechter, setTruckFraechter] = useState<Unternehmen | null>(
    null,
  );
  const [truckFahrer, setTruckFahrer] = useState("");
  const [truckTelefonFahrer, setTruckTelefonFahrer] = useState("");
  const [truckFahrzeugFarbe, setTruckFahrzeugFarbe] = useState("#155dfc");
  const [truckKosten, setTruckKosten] = useState("");
  const [truckPreisProKm, setTruckPreisProKm] = useState("");
  const [truckRelationId, setTruckRelationId] = useState<string>("");
  const [truckRecurrenceType, setTruckRecurrenceType] =
    useState<RecurrenceType>("weekly");
  const [truckSelectedWeekdays, setTruckSelectedWeekdays] = useState<number[]>(
    [1],
  );
  const [truckMonthlyDayOfMonth, setTruckMonthlyDayOfMonth] = useState("1");
  const [truckLoadingTime, setTruckLoadingTime] = useState("08:00");
  const [truckUnloadingTime, setTruckUnloadingTime] = useState("17:00");
  const [truckOffsetDays, setTruckOffsetDays] = useState("0");
  const [truckLookaheadDays, setTruckLookaheadDays] = useState("14");
  const [truckSkippedDates, setTruckSkippedDates] = useState<string[]>([]);
  const [truckNewSkipDateInput, setTruckNewSkipDateInput] = useState("");
  const [linkedSendungVorlageIds, setLinkedSendungVorlageIds] = useState<
    Set<string>
  >(new Set());

  /* ── Computed helpers ───────────────────────────────────────────────── */
  const editingSendungVorlage = useMemo(
    () =>
      sendungVorlagen.find(
        (vorlage) => vorlage.id === editingSendungVorlageId,
      ) ?? null,
    [sendungVorlagen, editingSendungVorlageId],
  );

  const editingTruckVorlage = useMemo(
    () =>
      truckVorlagen.find(
        (truckVorlage) => truckVorlage.id === editingTruckVorlageId,
      ) ?? null,
    [truckVorlagen, editingTruckVorlageId],
  );

  /* ── Tab navigation ─────────────────────────────────────────────────── */
  function switchToMainSection(section: MainSectionTab) {
    setActiveMainSection(section);
    setCurrentPageView("list");
  }

  /* ── Sendung vorlage form open/reset ────────────────────────────────── */
  function openSendungVorlageForm(vorlage?: VorlageRow) {
    if (vorlage) {
      setEditingSendungVorlageId(vorlage.id);
      setSendungVorlageName(vorlage.name);
      setSendungKunde(
        vorlage.kunde
          ? ({
              id: vorlage.kunde.id,
              name: vorlage.kunde.name,
              kundennummer: vorlage.kunde.kundennummer,
              adresse: "",
              plz: "",
              ort: "",
              land: "",
              rollen: [],
            } as Unternehmen)
          : null,
      );
      setSendungLadePlz(vorlage.lade_plz ?? "");
      setSendungLadeort(vorlage.lade_ort);
      setSendungLadeAdresse(vorlage.lade_adresse ?? "");
      setSendungLadeLand(vorlage.lade_land ?? "AT");
      setSendungEntladePlz(vorlage.entlade_plz ?? "");
      setSendungEntladeort(vorlage.entlade_ort);
      setSendungEntladeAdresse(vorlage.entlade_adresse ?? "");
      setSendungEntladeLand(vorlage.entlade_land ?? "AT");
      setSendungGewicht(vorlage.gewicht != null ? String(vorlage.gewicht) : "");
      setSendungPackungseinheit(vorlage.packungseinheit ?? "europalette");
      setSendungAnzahl(vorlage.anzahl != null ? String(vorlage.anzahl) : "");
      setSendungLademeter(
        vorlage.lademeter != null ? String(vorlage.lademeter) : "",
      );
      setSendungVerkaufspreis(
        vorlage.verkaufspreis != null ? String(vorlage.verkaufspreis) : "",
      );
      setSendungRecurrenceType(vorlage.recurrence_type);
      if (vorlage.recurrence_type === "monthly") {
        setSendungMonthlyDayOfMonth(
          String(vorlage.recurrence_days?.[0] ?? 1),
        );
        setSendungSelectedWeekdays([]);
      } else {
        setSendungSelectedWeekdays(vorlage.recurrence_days ?? [1]);
      }
      setSendungLoadingTime(vorlage.recurrence_time_lade ?? "08:00");
      setSendungUnloadingTime(vorlage.recurrence_time_entlade ?? "17:00");
      setSendungOffsetDays(String(vorlage.recurrence_offset_days ?? 0));
      setSendungLookaheadDays(String(vorlage.lookahead_days ?? 14));
      setSendungSkippedDates(vorlage.skipped_dates ?? []);
    } else {
      setEditingSendungVorlageId(null);
      setSendungVorlageName("");
      setSendungKunde(null);
      setSendungLadePlz("");
      setSendungLadeort("");
      setSendungLadeAdresse("");
      setSendungLadeLand("AT");
      setSendungEntladePlz("");
      setSendungEntladeort("");
      setSendungEntladeAdresse("");
      setSendungEntladeLand("AT");
      setSendungGewicht("");
      setSendungPackungseinheit("europalette");
      setSendungAnzahl("");
      setSendungLademeter("");
      setSendungVerkaufspreis("");
      setSendungRecurrenceType("weekly");
      setSendungSelectedWeekdays([1]);
      setSendungMonthlyDayOfMonth("1");
      setSendungLoadingTime("08:00");
      setSendungUnloadingTime("17:00");
      setSendungOffsetDays("0");
      setSendungLookaheadDays("14");
      setSendungSkippedDates([]);
    }
    setSendungNewSkipDateInput("");
    setSendungFormSubmitted(false);
    setCurrentPageView("form");
  }

  /* ── Truck vorlage form open/reset ──────────────────────────────────── */
  function openTruckVorlageForm(truckVorlage?: TruckVorlageRow) {
    if (truckVorlage) {
      setEditingTruckVorlageId(truckVorlage.id);
      setTruckVorlageName(truckVorlage.name);
      setTruckKennzeichen(truckVorlage.kennzeichen);
      setTruckFraechter(
        truckVorlage.fraechter
          ? ({
              id: truckVorlage.fraechter.id,
              name: truckVorlage.fraechter.name,
              kundennummer: truckVorlage.fraechter.kundennummer,
              adresse: "",
              plz: "",
              ort: "",
              land: "",
              rollen: [],
            } as Unternehmen)
          : null,
      );
      setTruckFahrer(truckVorlage.fahrer ?? "");
      setTruckTelefonFahrer(truckVorlage.telefon_fahrer ?? "");
      setTruckFahrzeugFarbe(truckVorlage.fahrzeug_farbe ?? "#155dfc");
      setTruckKosten(truckVorlage.kosten != null ? String(truckVorlage.kosten) : "");
      setTruckPreisProKm(
        truckVorlage.preis_pro_km != null
          ? String(truckVorlage.preis_pro_km)
          : "",
      );
      setTruckRelationId(truckVorlage.relation_id ?? "");
      setTruckRecurrenceType(truckVorlage.recurrence_type);
      if (truckVorlage.recurrence_type === "monthly") {
        setTruckMonthlyDayOfMonth(
          String(truckVorlage.recurrence_days?.[0] ?? 1),
        );
        setTruckSelectedWeekdays([]);
      } else {
        setTruckSelectedWeekdays(truckVorlage.recurrence_days ?? [1]);
      }
      setTruckLoadingTime(truckVorlage.recurrence_time_lade ?? "08:00");
      setTruckUnloadingTime(truckVorlage.recurrence_time_entlade ?? "17:00");
      setTruckOffsetDays(String(truckVorlage.recurrence_offset_days ?? 0));
      setTruckLookaheadDays(String(truckVorlage.lookahead_days ?? 14));
      setTruckSkippedDates(truckVorlage.skipped_dates ?? []);
      setLinkedSendungVorlageIds(
        new Set(
          truckVorlage.linked_sendung_vorlagen.map((vorlage) => vorlage.id),
        ),
      );
    } else {
      setEditingTruckVorlageId(null);
      setTruckVorlageName("");
      setTruckKennzeichen("");
      setTruckFraechter(null);
      setTruckFahrer("");
      setTruckTelefonFahrer("");
      setTruckFahrzeugFarbe("#155dfc");
      setTruckKosten("");
      setTruckPreisProKm("");
      setTruckRelationId("");
      setTruckRecurrenceType("weekly");
      setTruckSelectedWeekdays([1]);
      setTruckMonthlyDayOfMonth("1");
      setTruckLoadingTime("08:00");
      setTruckUnloadingTime("17:00");
      setTruckOffsetDays("0");
      setTruckLookaheadDays("14");
      setTruckSkippedDates([]);
      setLinkedSendungVorlageIds(new Set());
    }
    setTruckNewSkipDateInput("");
    setTruckFormSubmitted(false);
    setCurrentPageView("form");
  }

  function navigateBackToList() {
    setCurrentPageView("list");
    setEditingSendungVorlageId(null);
    setEditingTruckVorlageId(null);
    setSendungFormSubmitted(false);
    setTruckFormSubmitted(false);
  }

  /* ── Sendung vorlage save ───────────────────────────────────────────── */
  function handleSaveSendungVorlage() {
    setSendungFormSubmitted(true);
    if (!sendungVorlageName.trim() || !sendungLadeort.trim() || !sendungEntladeort.trim()) {
      toast.error("Bitte Name, Ladeort und Entladeort ausfüllen.");
      return;
    }

    const payload = {
      name: sendungVorlageName.trim(),
      kunde_id: sendungKunde?.id ?? null,
      lade_plz: sendungLadePlz.trim() || null,
      lade_ort: sendungLadeort.trim(),
      lade_adresse: sendungLadeAdresse.trim() || null,
      lade_land: sendungLadeLand.trim() || null,
      entlade_plz: sendungEntladePlz.trim() || null,
      entlade_ort: sendungEntladeort.trim(),
      entlade_adresse: sendungEntladeAdresse.trim() || null,
      entlade_land: sendungEntladeLand.trim() || null,
      gewicht: sendungGewicht ? Number(sendungGewicht) : null,
      packungseinheit: sendungPackungseinheit || null,
      anzahl: sendungAnzahl ? Number(sendungAnzahl) : null,
      lademeter: sendungLademeter ? Number(sendungLademeter) : null,
      verkaufspreis: sendungVerkaufspreis ? Number(sendungVerkaufspreis) : null,
      recurrence_type: sendungRecurrenceType,
      recurrence_days:
        sendungRecurrenceType === "monthly"
          ? [Number(sendungMonthlyDayOfMonth)]
          : sendungRecurrenceType === "weekly" ||
              sendungRecurrenceType === "biweekly"
            ? sendungSelectedWeekdays
            : null,
      recurrence_time_lade: sendungLoadingTime || null,
      recurrence_time_entlade: sendungUnloadingTime || null,
      recurrence_offset_days: Number(sendungOffsetDays) || 0,
      lookahead_days: Number(sendungLookaheadDays) || 14,
      skipped_dates: sendungSkippedDates,
      active: true,
    };

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          editingSendungVorlageId ? "Vorlage gespeichert" : "Vorlage erstellt",
        );
        navigateBackToList();
      },
      onError: () => toast.error("Fehler beim Speichern"),
    };

    if (editingSendungVorlageId) {
      updateSendungVorlage.mutate(
        { id: editingSendungVorlageId, ...payload },
        mutationOptions,
      );
    } else {
      createSendungVorlage.mutate(payload, mutationOptions);
    }
  }

  /* ── Truck vorlage save ─────────────────────────────────────────────── */
  function handleSaveTruckVorlage() {
    setTruckFormSubmitted(true);
    if (!truckVorlageName.trim() || !truckKennzeichen.trim() || !truckRelationId) {
      toast.error("Bitte Name, Kennzeichen und Relation ausfüllen.");
      return;
    }

    // ── Compatibility check: linked sendung vorlagen must share recurrence ──
    if (linkedSendungVorlageIds.size > 0) {
      const DAY_NAMES = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const TYPE_LABELS: Record<RecurrenceType, string> = {
        none: "Keine",
        daily: "Täglich",
        weekly: "Wöchentlich",
        biweekly: "Alle 2 Wochen",
        monthly: "Monatlich",
      };
      const truckEffectiveDays =
        truckRecurrenceType === "monthly"
          ? [Number(truckMonthlyDayOfMonth)]
          : truckSelectedWeekdays;

      let hasBlockingError = false;
      for (const vorlage of sendungVorlagen.filter((v) => linkedSendungVorlageIds.has(v.id))) {
        if (!vorlage.active) {
          toast.error(`"${vorlage.name}" ist inaktiv – Sendungen werden nicht erstellt.`);
          hasBlockingError = true;
          continue;
        }
        if (vorlage.recurrence_type === "none") {
          toast.error(`"${vorlage.name}" hat keine Wiederholung – Sendungen werden nicht erstellt.`);
          hasBlockingError = true;
          continue;
        }
        // "daily" sendung vorlagen match every truck schedule
        if (vorlage.recurrence_type === "daily") continue;

        if (vorlage.recurrence_type !== truckRecurrenceType) {
          toast.error(
            `"${vorlage.name}": Wiederholungstyp nicht kompatibel – LKW ist ${TYPE_LABELS[truckRecurrenceType]}, Sendung ist ${TYPE_LABELS[vorlage.recurrence_type]}.`,
          );
          hasBlockingError = true;
          continue;
        }
        if (truckRecurrenceType === "weekly" || truckRecurrenceType === "biweekly") {
          const hasOverlap = (vorlage.recurrence_days ?? []).some((d) => truckEffectiveDays.includes(d));
          if (!hasOverlap) {
            const truckDayStr = truckEffectiveDays.map((d) => DAY_NAMES[d]).join(", ");
            const vorlageDayStr = (vorlage.recurrence_days ?? []).map((d) => DAY_NAMES[d]).join(", ");
            toast.error(
              `"${vorlage.name}": Keine gemeinsamen Wochentage – LKW: ${truckDayStr}, Sendung: ${vorlageDayStr}.`,
            );
            hasBlockingError = true;
          }
        }
        if (truckRecurrenceType === "monthly") {
          const vorlageDay = vorlage.recurrence_days?.[0];
          const truckDay = Number(truckMonthlyDayOfMonth);
          if (vorlageDay !== truckDay) {
            toast.error(
              `"${vorlage.name}": Unterschiedliche Monatstage – LKW: ${truckDay}., Sendung: ${vorlageDay}.`,
            );
            hasBlockingError = true;
          }
        }
      }
      if (hasBlockingError) return;
    }

    const recurrenceDays =
      truckRecurrenceType === "monthly"
        ? [Number(truckMonthlyDayOfMonth)]
        : truckRecurrenceType === "weekly" || truckRecurrenceType === "biweekly"
          ? truckSelectedWeekdays
          : null;

    const payload = {
      name: truckVorlageName.trim(),
      kennzeichen: truckKennzeichen.trim(),
      fraechter_id: truckFraechter?.id ?? null,
      fahrer: truckFahrer.trim() || null,
      telefon_fahrer: truckTelefonFahrer.trim() || null,
      fahrzeug_farbe: truckFahrzeugFarbe,
      kosten: truckKosten ? Number(truckKosten) : null,
      preis_pro_km: truckPreisProKm ? Number(truckPreisProKm) : null,
      relation_id: truckRelationId || null,
      recurrence_type: truckRecurrenceType,
      recurrence_days: recurrenceDays,
      recurrence_time_lade: truckLoadingTime || null,
      recurrence_time_entlade: truckUnloadingTime || null,
      recurrence_offset_days: Number(truckOffsetDays) || 0,
      lookahead_days: Number(truckLookaheadDays) || 14,
      skipped_dates: truckSkippedDates,
      active: true,
      linked_sendung_vorlage_ids: Array.from(linkedSendungVorlageIds),
    };

    // After saving, immediately trigger generation so trucks/shipments appear
    // without a page reload. We reconstruct the full TruckVorlageRow from form
    // state so we don't need an extra round-trip.
    function triggerGeneration(savedId: string) {
      const linkedVorlagen = sendungVorlagen.filter((v) =>
        linkedSendungVorlageIds.has(v.id),
      );
      const fullVorlage: TruckVorlageRow = {
        ...(payload as Omit<typeof payload, "linked_sendung_vorlage_ids">),
        id: savedId,
        fraechter: truckFraechter
          ? { id: truckFraechter.id, name: truckFraechter.name, kundennummer: truckFraechter.kundennummer }
          : null,
        last_generated_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        linked_sendung_vorlagen: linkedVorlagen,
      };
      generateTrucksWithShipments.mutate([fullVorlage], {
        onSuccess: ({ trucksCreated, shipmentsCreated }) => {
          if (trucksCreated === 0) {
            toast.info("LKW-Plan gespeichert – alle Termine bereits vorhanden.");
          } else {
            toast.success(
              `LKW-Plan gespeichert – ${trucksCreated} LKW und ${shipmentsCreated} Sendung(en) generiert.`,
            );
          }
        },
        onError: () => toast.error("LKW-Plan gespeichert, aber Fehler beim Generieren."),
      });
    }

    if (editingTruckVorlageId) {
      updateTruckVorlage.mutate(
        { id: editingTruckVorlageId, ...payload },
        {
          onSuccess: () => {
            navigateBackToList();
            triggerGeneration(editingTruckVorlageId);
          },
          onError: () => toast.error("Fehler beim Speichern"),
        },
      );
    } else {
      createTruckVorlage.mutate(payload, {
        onSuccess: (savedVorlage) => {
          navigateBackToList();
          triggerGeneration(savedVorlage.id);
        },
        onError: () => toast.error("Fehler beim Speichern"),
      });
    }
  }

  /* ── Skip date helpers (sendung) ────────────────────────────────────── */
  function addSendungSkippedDate() {
    if (
      sendungNewSkipDateInput &&
      !sendungSkippedDates.includes(sendungNewSkipDateInput)
    ) {
      setSendungSkippedDates((previous) =>
        [...previous, sendungNewSkipDateInput].sort(),
      );
      setSendungNewSkipDateInput("");
    }
  }

  function removeSendungSkippedDate(dateString: string) {
    setSendungSkippedDates((previous) =>
      previous.filter((date) => date !== dateString),
    );
  }

  /* ── Skip date helpers (truck) ──────────────────────────────────────── */
  function addTruckSkippedDate() {
    if (
      truckNewSkipDateInput &&
      !truckSkippedDates.includes(truckNewSkipDateInput)
    ) {
      setTruckSkippedDates((previous) =>
        [...previous, truckNewSkipDateInput].sort(),
      );
      setTruckNewSkipDateInput("");
    }
  }

  function removeTruckSkippedDate(dateString: string) {
    setTruckSkippedDates((previous) =>
      previous.filter((date) => date !== dateString),
    );
  }

  /* ── Apply recurrence from a linked sendung vorlage ────────────────── */
  function applyRecurrenceFromSendungVorlage(vorlage: VorlageRow) {
    setTruckRecurrenceType(vorlage.recurrence_type);
    if (vorlage.recurrence_type === "monthly") {
      setTruckMonthlyDayOfMonth(String(vorlage.recurrence_days?.[0] ?? 1));
      setTruckSelectedWeekdays([]);
    } else {
      setTruckSelectedWeekdays(vorlage.recurrence_days ?? [1]);
      setTruckMonthlyDayOfMonth("1");
    }
    setTruckLoadingTime(vorlage.recurrence_time_lade ?? "08:00");
    setTruckUnloadingTime(vorlage.recurrence_time_entlade ?? "17:00");
    setTruckOffsetDays(String(vorlage.recurrence_offset_days ?? 0));
    setTruckLookaheadDays(String(vorlage.lookahead_days ?? 14));
    toast.success(`Wiederholung von "${vorlage.name}" übernommen.`);
  }

  /* ── Linked sendung vorlage toggle ──────────────────────────────────── */
  function toggleLinkedSendungVorlage(sendungVorlageId: string) {
    setLinkedSendungVorlageIds((previous) => {
      const updated = new Set(previous);
      if (updated.has(sendungVorlageId)) {
        updated.delete(sendungVorlageId);
      } else {
        updated.add(sendungVorlageId);
      }
      return updated;
    });
  }

  /* ── Generate handlers ──────────────────────────────────────────────── */
  function handleGenerateSendungVorlage(vorlage: VorlageRow) {
    generateStandaloneSendungen.mutate([vorlage], {
      onSuccess: (shipmentsCreated) => {
        if (shipmentsCreated === 0) toast.info("Alle Aufträge bereits vorhanden.");
        else toast.success(`${shipmentsCreated} Auftrag${shipmentsCreated !== 1 ? "aufträge" : ""} erstellt.`);
      },
      onError: () => toast.error("Fehler beim Generieren"),
    });
  }

  function handleGenerateTruckVorlage(truckVorlage: TruckVorlageRow) {
    generateTrucksWithShipments.mutate([truckVorlage], {
      onSuccess: ({ trucksCreated, shipmentsCreated }) => {
        if (trucksCreated === 0) toast.info("Alle LKW und Aufträge bereits vorhanden.");
        else toast.success(`${trucksCreated} LKW und ${shipmentsCreated} Aufträge erstellt.`);
      },
      onError: () => toast.error("Fehler beim Generieren"),
    });
  }

  /* ── Slide-over title ───────────────────────────────────────────────── */
  function buildSlideOverTitle(): string {
    if (currentPageView === "form") {
      if (activeMainSection === "sendungsVorlagen") {
        return editingSendungVorlageId
          ? "Sendungs-Vorlage bearbeiten"
          : "Neue Sendungs-Vorlage";
      } else {
        return editingTruckVorlageId
          ? "LKW-Plan bearbeiten"
          : "Neuer LKW-Plan";
      }
    }
    return "Wiederkehrende Aufträge";
  }

  /* ── Slide-over action buttons ──────────────────────────────────────── */
  const listViewActions =
    currentPageView === "list" ? (
      <Button
        size="sm"
        startDecorator={<Plus className="h-3 w-3" />}
        onClick={() => {
          if (activeMainSection === "sendungsVorlagen") {
            openSendungVorlageForm();
          } else {
            openTruckVorlageForm();
          }
        }}
        sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
      >
        {activeMainSection === "sendungsVorlagen"
          ? "Neue Vorlage"
          : "Neuer LKW-Plan"}
      </Button>
    ) : null;

  const formViewActions =
    currentPageView === "form" ? (
      <>
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          startDecorator={<ChevronLeft className="h-3 w-3" />}
          onClick={navigateBackToList}
          sx={{ color: "#57688e" }}
        >
          Zurück
        </Button>
        <Button
          size="sm"
          onClick={
            activeMainSection === "sendungsVorlagen"
              ? handleSaveSendungVorlage
              : handleSaveTruckVorlage
          }
          loading={
            createSendungVorlage.isPending ||
            updateSendungVorlage.isPending ||
            createTruckVorlage.isPending ||
            updateTruckVorlage.isPending
          }
          sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
        >
          {editingSendungVorlageId || editingTruckVorlageId
            ? "Speichern"
            : "Erstellen"}
        </Button>
      </>
    ) : null;

  /* ════════════════════════════════════════════════════════════════════
     Render
     ════════════════════════════════════════════════════════════════════ */
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={buildSlideOverTitle()}
      actions={currentPageView === "list" ? listViewActions : formViewActions}
      width={580}
    >
      {/* ── Tab navigation (only in list view) ─────────────────────── */}
      {currentPageView === "list" && (
        <Stack direction="row" spacing={0} sx={{ mb: 2 }}>
          {(
            [
              { sectionKey: "sendungsVorlagen", label: "Sendungs-Vorlagen" },
              { sectionKey: "lkwVorlagen", label: "LKW-Pläne" },
            ] as { sectionKey: MainSectionTab; label: string }[]
          ).map(({ sectionKey, label }) => (
            <button
              key={sectionKey}
              type="button"
              onClick={() => switchToMainSection(sectionKey)}
              className={`flex-1 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeMainSection === sectionKey
                  ? "border-[#155dfc] text-[#155dfc]"
                  : "border-transparent text-[#57688e] hover:text-[#0f172b]"
              }`}
            >
              {label}
            </button>
          ))}
        </Stack>
      )}

      {/* ── Sendungs-Vorlagen section ───────────────────────────────── */}
      {activeMainSection === "sendungsVorlagen" &&
        currentPageView === "list" && (
          <SendungVorlagenListPanel
            vorlagen={sendungVorlagen}
            isLoading={isSendungVorlagenLoading}
            onEditVorlage={openSendungVorlageForm}
            onDeleteVorlage={(vorlageId) =>
              deleteSendungVorlage.mutate(vorlageId, {
                onSuccess: () => toast.success("Vorlage gelöscht"),
                onError: () => toast.error("Fehler beim Löschen"),
              })
            }
            onToggleVorlageActive={(vorlageId, isActive) =>
              toggleSendungVorlageActive.mutate({ vorlageId, isActive })
            }
            onGenerateForVorlage={handleGenerateSendungVorlage}
            isGenerationRunning={generateStandaloneSendungen.isPending}
          />
        )}

      {activeMainSection === "sendungsVorlagen" &&
        currentPageView === "form" && (
          <SendungVorlagenFormPanel
            isSubmitted={sendungFormSubmitted}
            vorlageName={sendungVorlageName}
            onVorlageNameChange={setSendungVorlageName}
            selectedKunde={sendungKunde}
            onKundeChange={setSendungKunde}
            ladePlz={sendungLadePlz}
            onLadePlzChange={setSendungLadePlz}
            ladeort={sendungLadeort}
            onLadeortChange={setSendungLadeort}
            ladeAdresse={sendungLadeAdresse}
            onLadeAdresseChange={setSendungLadeAdresse}
            ladeLand={sendungLadeLand}
            onLadeLandChange={setSendungLadeLand}
            entladePlz={sendungEntladePlz}
            onEntladePlzChange={setSendungEntladePlz}
            entladeort={sendungEntladeort}
            onEntladeortChange={setSendungEntladeort}
            entladeAdresse={sendungEntladeAdresse}
            onEntladeAdresseChange={setSendungEntladeAdresse}
            entladeLand={sendungEntladeLand}
            onEntladeLandChange={setSendungEntladeLand}
            gewicht={sendungGewicht}
            onGewichtChange={setSendungGewicht}
            packungseinheit={sendungPackungseinheit}
            onPackungseinheitChange={setSendungPackungseinheit}
            anzahl={sendungAnzahl}
            onAnzahlChange={setSendungAnzahl}
            lademeter={sendungLademeter}
            onLademeterChange={setSendungLademeter}
            verkaufspreis={sendungVerkaufspreis}
            onVerkaufspreisChange={setSendungVerkaufspreis}
            recurrenceType={sendungRecurrenceType}
            onRecurrenceTypeChange={setSendungRecurrenceType}
            selectedWeekdays={sendungSelectedWeekdays}
            onToggleWeekday={(isoWeekday) =>
              setSendungSelectedWeekdays((previous) =>
                previous.includes(isoWeekday)
                  ? previous.filter((day) => day !== isoWeekday)
                  : [...previous, isoWeekday],
              )
            }
            monthlyDayOfMonth={sendungMonthlyDayOfMonth}
            onMonthlyDayOfMonthChange={setSendungMonthlyDayOfMonth}
            loadingTime={sendungLoadingTime}
            onLoadingTimeChange={setSendungLoadingTime}
            unloadingTime={sendungUnloadingTime}
            onUnloadingTimeChange={setSendungUnloadingTime}
            offsetDays={sendungOffsetDays}
            onOffsetDaysChange={setSendungOffsetDays}
            lookaheadDays={sendungLookaheadDays}
            onLookaheadDaysChange={setSendungLookaheadDays}
            skippedDates={sendungSkippedDates}
            onAddSkippedDate={addSendungSkippedDate}
            onRemoveSkippedDate={removeSendungSkippedDate}
            newSkipDateInputValue={sendungNewSkipDateInput}
            onNewSkipDateInputChange={setSendungNewSkipDateInput}
          />
        )}

      {/* ── LKW-Vorlagen section ────────────────────────────────────── */}
      {activeMainSection === "lkwVorlagen" && currentPageView === "list" && (
        <TruckVorlagenListPanel
          truckVorlagen={truckVorlagen}
          isLoading={isTruckVorlagenLoading}
          onEditTruckVorlage={openTruckVorlageForm}
          onDeleteTruckVorlage={(truckVorlageId) =>
            deleteTruckVorlage.mutate(truckVorlageId, {
              onSuccess: () => toast.success("LKW-Plan gelöscht"),
              onError: () => toast.error("Fehler beim Löschen"),
            })
          }
          onToggleTruckVorlageActive={(truckVorlageId, isActive) =>
            toggleTruckVorlageActive.mutate({ truckVorlageId, isActive })
          }
          onGenerateForTruckVorlage={handleGenerateTruckVorlage}
          isGenerationRunning={generateTrucksWithShipments.isPending}
        />
      )}

      {activeMainSection === "lkwVorlagen" && currentPageView === "form" && (
        <TruckVorlagenFormPanel
          isSubmitted={truckFormSubmitted}
          truckVorlageName={truckVorlageName}
          onTruckVorlageNameChange={setTruckVorlageName}
          kennzeichen={truckKennzeichen}
          onKennzeichenChange={setTruckKennzeichen}
          selectedFraechter={truckFraechter}
          onFraechterChange={setTruckFraechter}
          fahrer={truckFahrer}
          onFahrerChange={setTruckFahrer}
          telefonFahrer={truckTelefonFahrer}
          onTelefonFahrerChange={setTruckTelefonFahrer}
          fahrzeugFarbe={truckFahrzeugFarbe}
          onFahrzeugFarbeChange={setTruckFahrzeugFarbe}
          kosten={truckKosten}
          onKostenChange={setTruckKosten}
          preisProKm={truckPreisProKm}
          onPreisProKmChange={setTruckPreisProKm}
          selectedRelationId={truckRelationId}
          onRelationIdChange={setTruckRelationId}
          availableRelationen={availableRelationen}
          recurrenceType={truckRecurrenceType}
          onRecurrenceTypeChange={setTruckRecurrenceType}
          selectedWeekdays={truckSelectedWeekdays}
          onToggleWeekday={(isoWeekday) =>
            setTruckSelectedWeekdays((previous) =>
              previous.includes(isoWeekday)
                ? previous.filter((day) => day !== isoWeekday)
                : [...previous, isoWeekday],
            )
          }
          monthlyDayOfMonth={truckMonthlyDayOfMonth}
          onMonthlyDayOfMonthChange={setTruckMonthlyDayOfMonth}
          loadingTime={truckLoadingTime}
          onLoadingTimeChange={setTruckLoadingTime}
          unloadingTime={truckUnloadingTime}
          onUnloadingTimeChange={setTruckUnloadingTime}
          offsetDays={truckOffsetDays}
          onOffsetDaysChange={setTruckOffsetDays}
          lookaheadDays={truckLookaheadDays}
          onLookaheadDaysChange={setTruckLookaheadDays}
          skippedDates={truckSkippedDates}
          onAddSkippedDate={addTruckSkippedDate}
          onRemoveSkippedDate={removeTruckSkippedDate}
          newSkipDateInputValue={truckNewSkipDateInput}
          onNewSkipDateInputChange={setTruckNewSkipDateInput}
          allSendungVorlagen={sendungVorlagen}
          linkedSendungVorlageIds={linkedSendungVorlageIds}
          onToggleLinkedSendungVorlage={toggleLinkedSendungVorlage}
          onApplyRecurrenceFromSendungVorlage={applyRecurrenceFromSendungVorlage}
        />
      )}
    </SlideOver>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Sendung Vorlagen — List panel
   ══════════════════════════════════════════════════════════════════════ */
function SendungVorlagenListPanel({
  vorlagen,
  isLoading,
  onEditVorlage,
  onDeleteVorlage,
  onToggleVorlageActive,
  onGenerateForVorlage,
  isGenerationRunning,
}: {
  vorlagen: VorlageRow[];
  isLoading: boolean;
  onEditVorlage: (vorlage: VorlageRow) => void;
  onDeleteVorlage: (vorlageId: string) => void;
  onToggleVorlageActive: (vorlageId: string, isActive: boolean) => void;
  onGenerateForVorlage: (vorlage: VorlageRow) => void;
  isGenerationRunning: boolean;
}) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((index) => (
          <Box
            key={index}
            sx={{ height: 68, borderRadius: "8px", bgcolor: "#f1f5f9" }}
          />
        ))}
      </Stack>
    );
  }

  if (!vorlagen.length) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
        }}
      >
        <RepeatIcon className="h-8 w-8 text-[#d5dbe8]" />
        <Typography level="body-sm" sx={{ color: "#57688e" }}>
          Noch keine Sendungs-Vorlagen angelegt
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {vorlagen.map((vorlage) => {
        const isLinkedToTruck =
          (vorlage.truck_vorlage_links?.length ?? 0) > 0;
        return (
          <Box
            key={vorlage.id}
            sx={{
              border: "1px solid #e8ecf4",
              borderRadius: "8px",
              p: 1.5,
              bgcolor: vorlage.active ? "#fff" : "#f8f9fb",
              opacity: vorlage.active ? 1 : 0.65,
            }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                  <Typography
                    level="body-sm"
                    sx={{ fontWeight: 600, color: "#0f172b" }}
                  >
                    {vorlage.name}
                  </Typography>
                  {isLinkedToTruck && (
                    <Chip
                      size="sm"
                      variant="soft"
                      startDecorator={<Truck className="h-2.5 w-2.5" />}
                      sx={{ fontSize: "0.6rem", bgcolor: "#eff6ff", color: "#155dfc" }}
                    >
                      LKW-Plan
                    </Chip>
                  )}
                </Stack>
                <Typography
                  level="body-xs"
                  sx={{ color: "#57688e", mb: 0.5 }}
                  noWrap
                >
                  {vorlage.lade_ort} → {vorlage.entlade_ort}
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{
                      fontSize: "0.65rem",
                      bgcolor: "#eff6ff",
                      color: "#155dfc",
                    }}
                  >
                    {buildRecurrenceSummaryLabel(vorlage.recurrence_type, vorlage.recurrence_days)}
                  </Chip>
                  {vorlage.recurrence_type !== "none" && (
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{
                        fontSize: "0.65rem",
                        bgcolor: "#f1f5f9",
                        color: "#57688e",
                      }}
                    >
                      Nächster: {findNextUpcomingDate(vorlage)}
                    </Chip>
                  )}
                  {(vorlage.skipped_dates?.length ?? 0) > 0 && (
                    <Chip
                      size="sm"
                      variant="soft"
                      sx={{ fontSize: "0.65rem", bgcolor: "#fff0f0", color: "#ef4444" }}
                    >
                      {vorlage.skipped_dates.length} Ausnahme{vorlage.skipped_dates.length !== 1 ? "n" : ""}
                    </Chip>
                  )}
                </Stack>
              </Box>

              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ ml: 1, flexShrink: 0 }}
              >
                <Switch
                  size="sm"
                  checked={vorlage.active}
                  onChange={(event) =>
                    onToggleVorlageActive(vorlage.id, event.target.checked)
                  }
                  sx={{
                    "--Switch-trackBackground": vorlage.active
                      ? "#155dfc"
                      : "#d5dbe8",
                    "--Switch-trackWidth": "32px",
                    "--Switch-trackHeight": "18px",
                  }}
                />
                <IconButton
                  size="sm"
                  variant="plain"
                  disabled={
                    isGenerationRunning ||
                    !vorlage.active ||
                    vorlage.recurrence_type === "none" ||
                    isLinkedToTruck
                  }
                  onClick={() => onGenerateForVorlage(vorlage)}
                  title={
                    isLinkedToTruck
                      ? "Wird vom LKW-Plan generiert"
                      : "Aufträge jetzt generieren"
                  }
                  sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => onEditVorlage(vorlage)}
                  sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="plain"
                  color="danger"
                  onClick={() => {
                    if (confirm(`Vorlage "${vorlage.name}" wirklich löschen?`)) {
                      onDeleteVorlage(vorlage.id);
                    }
                  }}
                  sx={{ minWidth: 0, px: 0.5 }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Sendung Vorlagen — Form panel
   ══════════════════════════════════════════════════════════════════════ */
interface SendungVorlagenFormPanelProps {
  isSubmitted: boolean;
  vorlageName: string;
  onVorlageNameChange: (value: string) => void;
  selectedKunde: Unternehmen | null;
  onKundeChange: (kunde: Unternehmen | null) => void;
  ladePlz: string;
  onLadePlzChange: (value: string) => void;
  ladeort: string;
  onLadeortChange: (value: string) => void;
  ladeAdresse: string;
  onLadeAdresseChange: (value: string) => void;
  ladeLand: string;
  onLadeLandChange: (value: string) => void;
  entladePlz: string;
  onEntladePlzChange: (value: string) => void;
  entladeort: string;
  onEntladeortChange: (value: string) => void;
  entladeAdresse: string;
  onEntladeAdresseChange: (value: string) => void;
  entladeLand: string;
  onEntladeLandChange: (value: string) => void;
  gewicht: string;
  onGewichtChange: (value: string) => void;
  packungseinheit: string;
  onPackungseinheitChange: (value: string) => void;
  anzahl: string;
  onAnzahlChange: (value: string) => void;
  lademeter: string;
  onLademeterChange: (value: string) => void;
  verkaufspreis: string;
  onVerkaufspreisChange: (value: string) => void;
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
  offsetDays: string;
  onOffsetDaysChange: (value: string) => void;
  lookaheadDays: string;
  onLookaheadDaysChange: (value: string) => void;
  skippedDates: string[];
  onAddSkippedDate: () => void;
  onRemoveSkippedDate: (dateString: string) => void;
  newSkipDateInputValue: string;
  onNewSkipDateInputChange: (value: string) => void;
}

function SendungVorlagenFormPanel(props: SendungVorlagenFormPanelProps) {
  return (
    <Stack spacing={2.5}>
      <FieldLabel
        label="Vorlagen-Name"
        required
        hasError={props.isSubmitted && !props.vorlageName.trim()}
      >
        <Input
          size="sm"
          value={props.vorlageName}
          onChange={(e) => props.onVorlageNameChange(e.target.value)}
          placeholder="z.B. Wien → München wöchentlich"
          sx={{
            ...focusedInputSx,
            ...(props.isSubmitted && !props.vorlageName.trim()
              ? focusedInputErrorSx
              : {}),
          }}
        />
      </FieldLabel>

      <FieldLabel label="Kunde">
        <UnternehmenAutocomplete
          value={props.selectedKunde}
          onChange={props.onKundeChange}
          placeholder="Kundenname oder Kundennr."
          defaultRollen={["kunde"]}
        />
      </FieldLabel>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ladeort *
      </Typography>
      <PlzOrtInput
        plz={props.ladePlz}
        ort={props.ladeort}
        land={props.ladeLand}
        onPlzChange={props.onLadePlzChange}
        onOrtChange={props.onLadeortChange}
        onLandChange={props.onLadeLandChange}
        required
        error={props.isSubmitted && !props.ladeort.trim()}
      />
      <FieldLabel label="Adresse">
        <Input
          size="sm"
          value={props.ladeAdresse}
          onChange={(e) => props.onLadeAdresseChange(e.target.value)}
          placeholder="z.B. Industriestraße 12"
          sx={focusedInputSx}
        />
      </FieldLabel>

      <Typography level="body-xs" sx={sectionLabelSx}>
        Entladeort *
      </Typography>
      <PlzOrtInput
        plz={props.entladePlz}
        ort={props.entladeort}
        land={props.entladeLand}
        onPlzChange={props.onEntladePlzChange}
        onOrtChange={props.onEntladeortChange}
        onLandChange={props.onEntladeLandChange}
        required
        error={props.isSubmitted && !props.entladeort.trim()}
      />
      <FieldLabel label="Adresse">
        <Input
          size="sm"
          value={props.entladeAdresse}
          onChange={(e) => props.onEntladeAdresseChange(e.target.value)}
          placeholder="z.B. Lagerweg 5"
          sx={focusedInputSx}
        />
      </FieldLabel>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ladung
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Gewicht (kg)">
            <Input
              size="sm"
              type="number"
              value={props.gewicht}
              onChange={(e) => props.onGewichtChange(e.target.value)}
              placeholder="z.B. 12000"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Verkaufspreis (€)">
            <Input
              size="sm"
              type="number"
              value={props.verkaufspreis}
              onChange={(e) => props.onVerkaufspreisChange(e.target.value)}
              placeholder="Preis"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 2 }}>
          <FieldLabel label="Packungseinheit">
            <Select
              size="sm"
              value={props.packungseinheit}
              onChange={(_event, value) =>
                value && props.onPackungseinheitChange(value)
              }
              sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
            >
              {PACKAGING_UNIT_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Anzahl">
            <Input
              size="sm"
              type="number"
              value={props.anzahl}
              onChange={(e) => props.onAnzahlChange(e.target.value)}
              placeholder="z.B. 33"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="LDM">
            <Input
              size="sm"
              type="number"
              value={props.lademeter}
              onChange={(e) => props.onLademeterChange(e.target.value)}
              placeholder="auto"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Wiederholung
      </Typography>
      <RecurrenceConfigSection
        recurrenceType={props.recurrenceType}
        onRecurrenceTypeChange={props.onRecurrenceTypeChange}
        selectedWeekdays={props.selectedWeekdays}
        onToggleWeekday={props.onToggleWeekday}
        monthlyDayOfMonth={props.monthlyDayOfMonth}
        onMonthlyDayOfMonthChange={props.onMonthlyDayOfMonthChange}
        loadingTime={props.loadingTime}
        onLoadingTimeChange={props.onLoadingTimeChange}
        unloadingTime={props.unloadingTime}
        onUnloadingTimeChange={props.onUnloadingTimeChange}
        offsetDaysValue={props.offsetDays}
        onOffsetDaysChange={props.onOffsetDaysChange}
        lookaheadDaysValue={props.lookaheadDays}
        onLookaheadDaysChange={props.onLookaheadDaysChange}
      />

      <Divider />

      <Typography level="body-xs" sx={sectionLabelSx}>
        Ausnahmen (ausgenommene Termine)
      </Typography>
      <SkippedDatesManager
        skippedDates={props.skippedDates}
        onAddDate={props.onAddSkippedDate}
        onRemoveDate={props.onRemoveSkippedDate}
        newDateInputValue={props.newSkipDateInputValue}
        onNewDateInputChange={props.onNewSkipDateInputChange}
      />
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Truck Vorlagen — List panel
   ══════════════════════════════════════════════════════════════════════ */
function TruckVorlagenListPanel({
  truckVorlagen,
  isLoading,
  onEditTruckVorlage,
  onDeleteTruckVorlage,
  onToggleTruckVorlageActive,
  onGenerateForTruckVorlage,
  isGenerationRunning,
}: {
  truckVorlagen: TruckVorlageRow[];
  isLoading: boolean;
  onEditTruckVorlage: (truckVorlage: TruckVorlageRow) => void;
  onDeleteTruckVorlage: (truckVorlageId: string) => void;
  onToggleTruckVorlageActive: (truckVorlageId: string, isActive: boolean) => void;
  onGenerateForTruckVorlage: (truckVorlage: TruckVorlageRow) => void;
  isGenerationRunning: boolean;
}) {
  if (isLoading) {
    return (
      <Stack spacing={1.5}>
        {[1, 2, 3].map((index) => (
          <Box
            key={index}
            sx={{ height: 68, borderRadius: "8px", bgcolor: "#f1f5f9" }}
          />
        ))}
      </Stack>
    );
  }

  if (!truckVorlagen.length) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 1,
        }}
      >
        <Truck className="h-8 w-8 text-[#d5dbe8]" />
        <Typography level="body-sm" sx={{ color: "#57688e" }}>
          Noch keine LKW-Pläne angelegt
        </Typography>
        <Typography level="body-xs" sx={{ color: "#94a3b8", textAlign: "center" }}>
          Erstelle einen LKW-Plan um LKW und deren Sendungen automatisch zu generieren.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {truckVorlagen.map((truckVorlage) => (
        <Box
          key={truckVorlage.id}
          sx={{
            border: "1px solid #e8ecf4",
            borderRadius: "8px",
            p: 1.5,
            bgcolor: truckVorlage.active ? "#fff" : "#f8f9fb",
            opacity: truckVorlage.active ? 1 : 0.65,
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: truckVorlage.fahrzeug_farbe ?? "#155dfc",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  level="body-sm"
                  sx={{ fontWeight: 600, color: "#0f172b" }}
                >
                  {truckVorlage.name}
                </Typography>
              </Stack>

              <Typography level="body-xs" sx={{ color: "#57688e", mb: 0.5 }}>
                {truckVorlage.kennzeichen}
                {truckVorlage.fahrer && ` · ${truckVorlage.fahrer}`}
              </Typography>

              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                <Chip
                  size="sm"
                  variant="soft"
                  sx={{ fontSize: "0.65rem", bgcolor: "#eff6ff", color: "#155dfc" }}
                >
                  {buildRecurrenceSummaryLabel(truckVorlage.recurrence_type, truckVorlage.recurrence_days)}
                </Chip>
                {truckVorlage.recurrence_type !== "none" && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{ fontSize: "0.65rem", bgcolor: "#f1f5f9", color: "#57688e" }}
                  >
                    Nächster: {findNextUpcomingDate(truckVorlage)}
                  </Chip>
                )}
                {truckVorlage.linked_sendung_vorlagen.length > 0 && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{ fontSize: "0.65rem", bgcolor: "#f0fdf4", color: "#15803d" }}
                  >
                    {truckVorlage.linked_sendung_vorlagen.length} Sendung{truckVorlage.linked_sendung_vorlagen.length !== 1 ? "en" : ""}
                  </Chip>
                )}
                {(truckVorlage.skipped_dates?.length ?? 0) > 0 && (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{ fontSize: "0.65rem", bgcolor: "#fff0f0", color: "#ef4444" }}
                  >
                    {truckVorlage.skipped_dates.length} Ausnahme{truckVorlage.skipped_dates.length !== 1 ? "n" : ""}
                  </Chip>
                )}
              </Stack>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ ml: 1, flexShrink: 0 }}
            >
              <Switch
                size="sm"
                checked={truckVorlage.active}
                onChange={(event) =>
                  onToggleTruckVorlageActive(
                    truckVorlage.id,
                    event.target.checked,
                  )
                }
                sx={{
                  "--Switch-trackBackground": truckVorlage.active
                    ? "#155dfc"
                    : "#d5dbe8",
                  "--Switch-trackWidth": "32px",
                  "--Switch-trackHeight": "18px",
                }}
              />
              <IconButton
                size="sm"
                variant="plain"
                disabled={
                  isGenerationRunning ||
                  !truckVorlage.active ||
                  truckVorlage.recurrence_type === "none"
                }
                onClick={() => onGenerateForTruckVorlage(truckVorlage)}
                title="LKW und Aufträge jetzt generieren"
                sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                size="sm"
                variant="plain"
                onClick={() => onEditTruckVorlage(truckVorlage)}
                sx={{ color: "#57688e", minWidth: 0, px: 0.5 }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                size="sm"
                variant="plain"
                color="danger"
                onClick={() => {
                  if (
                    confirm(`LKW-Plan "${truckVorlage.name}" wirklich löschen?`)
                  ) {
                    onDeleteTruckVorlage(truckVorlage.id);
                  }
                }}
                sx={{ minWidth: 0, px: 0.5 }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Truck Vorlagen — Form panel
   ══════════════════════════════════════════════════════════════════════ */
interface TruckVorlagenFormPanelProps {
  isSubmitted: boolean;
  truckVorlageName: string;
  onTruckVorlageNameChange: (value: string) => void;
  kennzeichen: string;
  onKennzeichenChange: (value: string) => void;
  selectedFraechter: Unternehmen | null;
  onFraechterChange: (fraechter: Unternehmen | null) => void;
  fahrer: string;
  onFahrerChange: (value: string) => void;
  telefonFahrer: string;
  onTelefonFahrerChange: (value: string) => void;
  fahrzeugFarbe: string;
  onFahrzeugFarbeChange: (value: string) => void;
  kosten: string;
  onKostenChange: (value: string) => void;
  preisProKm: string;
  onPreisProKmChange: (value: string) => void;
  selectedRelationId: string;
  onRelationIdChange: (value: string) => void;
  availableRelationen: { id: string; nummer: string; name: string }[];
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
  offsetDays: string;
  onOffsetDaysChange: (value: string) => void;
  lookaheadDays: string;
  onLookaheadDaysChange: (value: string) => void;
  skippedDates: string[];
  onAddSkippedDate: () => void;
  onRemoveSkippedDate: (dateString: string) => void;
  newSkipDateInputValue: string;
  onNewSkipDateInputChange: (value: string) => void;
  allSendungVorlagen: VorlageRow[];
  linkedSendungVorlageIds: Set<string>;
  onToggleLinkedSendungVorlage: (sendungVorlageId: string) => void;
  onApplyRecurrenceFromSendungVorlage: (vorlage: VorlageRow) => void;
}

function TruckVorlagenFormPanel(props: TruckVorlagenFormPanelProps) {
  return (
    <Stack spacing={2.5}>
      {/* ── Name + Kennzeichen ──────────────────────────────────────── */}
      <FieldLabel
        label="Plan-Name"
        required
        hasError={props.isSubmitted && !props.truckVorlageName.trim()}
      >
        <Input
          size="sm"
          value={props.truckVorlageName}
          onChange={(e) => props.onTruckVorlageNameChange(e.target.value)}
          placeholder="z.B. WI-123 Montags Wien → München"
          sx={{
            ...focusedInputSx,
            ...(props.isSubmitted && !props.truckVorlageName.trim()
              ? focusedInputErrorSx
              : {}),
          }}
        />
      </FieldLabel>

      <Stack direction="row" spacing={1.5} alignItems="flex-end">
        <Box sx={{ flex: 1 }}>
          <FieldLabel
            label="Kennzeichen"
            required
            hasError={props.isSubmitted && !props.kennzeichen.trim()}
          >
            <Input
              size="sm"
              value={props.kennzeichen}
              onChange={(e) => props.onKennzeichenChange(e.target.value)}
              placeholder="z.B. WI-123AB"
              sx={{
                ...focusedInputSx,
                ...(props.isSubmitted && !props.kennzeichen.trim()
                  ? focusedInputErrorSx
                  : {}),
              }}
            />
          </FieldLabel>
        </Box>
        <Box>
          <FieldLabel label="Farbe">
            <input
              type="color"
              value={props.fahrzeugFarbe}
              onChange={(e) => props.onFahrzeugFarbeChange(e.target.value)}
              style={{
                width: 40,
                height: 34,
                border: "1px solid #d5dbe8",
                borderRadius: 6,
                padding: 2,
                cursor: "pointer",
              }}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Divider />

      {/* ── Frächter + Fahrer ───────────────────────────────────────── */}
      <Typography level="body-xs" sx={sectionLabelSx}>
        Frächter & Fahrer
      </Typography>

      <FieldLabel label="Frächter">
        <UnternehmenAutocomplete
          value={props.selectedFraechter}
          onChange={props.onFraechterChange}
          placeholder="Frächter suchen"
          defaultRollen={["fraechter"]}
        />
      </FieldLabel>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Fahrer">
            <Input
              size="sm"
              value={props.fahrer}
              onChange={(e) => props.onFahrerChange(e.target.value)}
              placeholder="Name des Fahrers"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Telefon Fahrer">
            <Input
              size="sm"
              value={props.telefonFahrer}
              onChange={(e) => props.onTelefonFahrerChange(e.target.value)}
              placeholder="+43 123 456 789"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <Divider />

      {/* ── Kosten + Relation ───────────────────────────────────────── */}
      <Typography level="body-xs" sx={sectionLabelSx}>
        Kosten & Relation
      </Typography>

      <Stack direction="row" spacing={1.5}>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Einkaufspreis (€)">
            <Input
              size="sm"
              type="number"
              value={props.kosten}
              onChange={(e) => props.onKostenChange(e.target.value)}
              placeholder="z.B. 850"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FieldLabel label="Preis pro km (€)">
            <Input
              size="sm"
              type="number"
              value={props.preisProKm}
              onChange={(e) => props.onPreisProKmChange(e.target.value)}
              placeholder="z.B. 1.20"
              sx={focusedInputSx}
            />
          </FieldLabel>
        </Box>
      </Stack>

      <FieldLabel label="Relation" required hasError={props.isSubmitted && !props.selectedRelationId}>
        <Select
          size="sm"
          value={props.selectedRelationId || null}
          onChange={(_event, value) =>
            props.onRelationIdChange(value ?? "")
          }
          placeholder="Relation auswählen (optional)"
          sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
        >
          {props.availableRelationen.map((relation) => (
            <Option key={relation.id} value={relation.id}>
              {relation.nummer} – {relation.name}
            </Option>
          ))}
        </Select>
      </FieldLabel>

      <Divider />

      {/* ── Wiederholung ────────────────────────────────────────────── */}
      <Typography level="body-xs" sx={sectionLabelSx}>
        Wiederholung
      </Typography>
      <RecurrenceConfigSection
        recurrenceType={props.recurrenceType}
        onRecurrenceTypeChange={props.onRecurrenceTypeChange}
        selectedWeekdays={props.selectedWeekdays}
        onToggleWeekday={props.onToggleWeekday}
        monthlyDayOfMonth={props.monthlyDayOfMonth}
        onMonthlyDayOfMonthChange={props.onMonthlyDayOfMonthChange}
        loadingTime={props.loadingTime}
        onLoadingTimeChange={props.onLoadingTimeChange}
        unloadingTime={props.unloadingTime}
        onUnloadingTimeChange={props.onUnloadingTimeChange}
        offsetDaysValue={props.offsetDays}
        onOffsetDaysChange={props.onOffsetDaysChange}
        lookaheadDaysValue={props.lookaheadDays}
        onLookaheadDaysChange={props.onLookaheadDaysChange}
      />

      <Divider />

      {/* ── Ausnahmen ───────────────────────────────────────────────── */}
      <Typography level="body-xs" sx={sectionLabelSx}>
        Ausnahmen (ausgenommene Termine)
      </Typography>
      <SkippedDatesManager
        skippedDates={props.skippedDates}
        onAddDate={props.onAddSkippedDate}
        onRemoveDate={props.onRemoveSkippedDate}
        newDateInputValue={props.newSkipDateInputValue}
        onNewDateInputChange={props.onNewSkipDateInputChange}
      />

      <Divider />

      {/* ── Verknüpfte Sendungs-Vorlagen ─────────────────────────────── */}
      <Typography level="body-xs" sx={sectionLabelSx}>
        Verknüpfte Sendungs-Vorlagen
      </Typography>
      <Typography level="body-xs" sx={{ color: "#94a3b8" }}>
        Diese Sendungen werden automatisch erstellt und dem LKW zugewiesen.
      </Typography>

      {props.allSendungVorlagen.length === 0 ? (
        <Typography level="body-xs" sx={{ color: "#57688e", fontStyle: "italic" }}>
          Noch keine Sendungs-Vorlagen vorhanden. Erstelle zuerst Sendungs-Vorlagen.
        </Typography>
      ) : (
        <Stack spacing={0.75}>
          {props.allSendungVorlagen.map((sendungVorlage) => (
            <Box
              key={sendungVorlage.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: "6px",
                border: "1px solid",
                borderColor: props.linkedSendungVorlageIds.has(sendungVorlage.id)
                  ? "#155dfc"
                  : "#e8ecf4",
                bgcolor: props.linkedSendungVorlageIds.has(sendungVorlage.id)
                  ? "#eff6ff"
                  : "#fff",
                cursor: "pointer",
                transition: "all 0.15s",
                "&:hover": { borderColor: "#155dfc" },
              }}
              onClick={() =>
                props.onToggleLinkedSendungVorlage(sendungVorlage.id)
              }
            >
              <Checkbox
                size="sm"
                checked={props.linkedSendungVorlageIds.has(sendungVorlage.id)}
                onChange={() =>
                  props.onToggleLinkedSendungVorlage(sendungVorlage.id)
                }
                sx={{ "--Checkbox-size": "16px" }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  level="body-xs"
                  sx={{ fontWeight: 600, color: "#0f172b" }}
                  noWrap
                >
                  {sendungVorlage.name}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "#57688e" }}
                  noWrap
                >
                  {sendungVorlage.lade_ort} → {sendungVorlage.entlade_ort}
                </Typography>
              </Box>
              {props.linkedSendungVorlageIds.has(sendungVorlage.id) && (
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onApplyRecurrenceFromSendungVorlage(sendungVorlage);
                  }}
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    px: 1,
                    py: 0.25,
                    minHeight: 0,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Wiederholung übernehmen
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
