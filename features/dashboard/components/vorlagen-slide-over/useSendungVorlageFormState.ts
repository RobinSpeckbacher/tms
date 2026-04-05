import { useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateVorlage,
  useUpdateVorlage,
  useGenerateRecurringSendungen,
  type VorlageRow,
  type RecurrenceType,
} from "@/hooks/useVorlagen";
import type { Unternehmen } from "@/hooks/useUnternehmen";

export function useSendungVorlageFormState() {
  const createSendungVorlage = useCreateVorlage();
  const updateSendungVorlage = useUpdateVorlage();
  const generateStandaloneSendungen = useGenerateRecurringSendungen();

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
        setSendungMonthlyDayOfMonth(String(vorlage.recurrence_days?.[0] ?? 1));
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
  }

  function resetSendungFormState() {
    setEditingSendungVorlageId(null);
    setSendungFormSubmitted(false);
  }

  function handleSaveSendungVorlage(onSuccess: () => void) {
    setSendungFormSubmitted(true);
    if (
      !sendungVorlageName.trim() ||
      !sendungLadeort.trim() ||
      !sendungEntladeort.trim()
    ) {
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
        onSuccess();
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

  function handleGenerateSendungVorlage(vorlage: VorlageRow) {
    generateStandaloneSendungen.mutate([vorlage], {
      onSuccess: (shipmentsCreated) => {
        if (shipmentsCreated === 0)
          toast.info("Alle Aufträge bereits vorhanden.");
        else
          toast.success(
            `${shipmentsCreated} Auftrag${shipmentsCreated !== 1 ? "aufträge" : ""} erstellt.`,
          );
      },
      onError: () => toast.error("Fehler beim Generieren"),
    });
  }

  const isSaving =
    createSendungVorlage.isPending || updateSendungVorlage.isPending;
  const isGenerationRunning = generateStandaloneSendungen.isPending;

  return {
    editingSendungVorlageId,
    sendungFormSubmitted,
    sendungVorlageName,
    setSendungVorlageName,
    sendungKunde,
    setSendungKunde,
    sendungLadePlz,
    setSendungLadePlz,
    sendungLadeort,
    setSendungLadeort,
    sendungLadeAdresse,
    setSendungLadeAdresse,
    sendungLadeLand,
    setSendungLadeLand,
    sendungEntladePlz,
    setSendungEntladePlz,
    sendungEntladeort,
    setSendungEntladeort,
    sendungEntladeAdresse,
    setSendungEntladeAdresse,
    sendungEntladeLand,
    setSendungEntladeLand,
    sendungGewicht,
    setSendungGewicht,
    sendungPackungseinheit,
    setSendungPackungseinheit,
    sendungAnzahl,
    setSendungAnzahl,
    sendungLademeter,
    setSendungLademeter,
    sendungVerkaufspreis,
    setSendungVerkaufspreis,
    sendungRecurrenceType,
    setSendungRecurrenceType,
    sendungSelectedWeekdays,
    setSendungSelectedWeekdays,
    sendungMonthlyDayOfMonth,
    setSendungMonthlyDayOfMonth,
    sendungLoadingTime,
    setSendungLoadingTime,
    sendungUnloadingTime,
    setSendungUnloadingTime,
    sendungOffsetDays,
    setSendungOffsetDays,
    sendungLookaheadDays,
    setSendungLookaheadDays,
    sendungSkippedDates,
    sendungNewSkipDateInput,
    setSendungNewSkipDateInput,
    openSendungVorlageForm,
    resetSendungFormState,
    handleSaveSendungVorlage,
    addSendungSkippedDate,
    removeSendungSkippedDate,
    handleGenerateSendungVorlage,
    isSaving,
    isGenerationRunning,
  };
}
