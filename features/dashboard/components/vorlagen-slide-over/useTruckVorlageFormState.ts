import { useState } from "react";
import { toast } from "react-toastify";
import {
  useCreateTruckVorlage,
  useUpdateTruckVorlage,
  useGenerateRecurringTrucksWithShipments,
  type TruckVorlageRow,
} from "@/hooks/useTruckVorlagen";
import {
  type VorlageRow,
  type RecurrenceType,
} from "@/hooks/useVorlagen";
import type { Unternehmen } from "@/hooks/useUnternehmen";

export function useTruckVorlageFormState() {
  const createTruckVorlage = useCreateTruckVorlage();
  const updateTruckVorlage = useUpdateTruckVorlage();
  const generateTrucksWithShipments = useGenerateRecurringTrucksWithShipments();

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
  const [truckSelectedWeekdays, setTruckSelectedWeekdays] = useState<number[]>([
    1,
  ]);
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
      setTruckKosten(
        truckVorlage.kosten != null ? String(truckVorlage.kosten) : "",
      );
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
  }

  function resetTruckFormState() {
    setEditingTruckVorlageId(null);
    setTruckFormSubmitted(false);
  }

  function handleSaveTruckVorlage(
    sendungVorlagen: VorlageRow[],
    onSuccess: () => void,
  ) {
    setTruckFormSubmitted(true);
    if (
      !truckVorlageName.trim() ||
      !truckKennzeichen.trim() ||
      !truckRelationId
    ) {
      toast.error("Bitte Name, Kennzeichen und Relation ausfüllen.");
      return;
    }

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
      for (const vorlage of sendungVorlagen.filter((vorlage) =>
        linkedSendungVorlageIds.has(vorlage.id),
      )) {
        if (!vorlage.active) {
          toast.error(
            `"${vorlage.name}" ist inaktiv – Sendungen werden nicht erstellt.`,
          );
          hasBlockingError = true;
          continue;
        }
        if (vorlage.recurrence_type === "none") {
          toast.error(
            `"${vorlage.name}" hat keine Wiederholung – Sendungen werden nicht erstellt.`,
          );
          hasBlockingError = true;
          continue;
        }
        if (vorlage.recurrence_type === "daily") continue;

        if (vorlage.recurrence_type !== truckRecurrenceType) {
          toast.error(
            `"${vorlage.name}": Wiederholungstyp nicht kompatibel – LKW ist ${TYPE_LABELS[truckRecurrenceType]}, Sendung ist ${TYPE_LABELS[vorlage.recurrence_type]}.`,
          );
          hasBlockingError = true;
          continue;
        }
        if (
          truckRecurrenceType === "weekly" ||
          truckRecurrenceType === "biweekly"
        ) {
          const hasOverlap = (vorlage.recurrence_days ?? []).some((day) =>
            truckEffectiveDays.includes(day),
          );
          if (!hasOverlap) {
            const truckDayStr = truckEffectiveDays
              .map((day) => DAY_NAMES[day])
              .join(", ");
            const vorlageDayStr = (vorlage.recurrence_days ?? [])
              .map((day) => DAY_NAMES[day])
              .join(", ");
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

    function triggerGeneration(savedId: string) {
      const linkedVorlagen = sendungVorlagen.filter((vorlage) =>
        linkedSendungVorlageIds.has(vorlage.id),
      );
      const fullVorlage: TruckVorlageRow = {
        ...(payload as Omit<typeof payload, "linked_sendung_vorlage_ids">),
        id: savedId,
        fraechter: truckFraechter
          ? {
              id: truckFraechter.id,
              name: truckFraechter.name,
              kundennummer: truckFraechter.kundennummer,
            }
          : null,
        last_generated_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        linked_sendung_vorlagen: linkedVorlagen,
      };
      generateTrucksWithShipments.mutate([fullVorlage], {
        onSuccess: ({ trucksCreated, shipmentsCreated }) => {
          if (trucksCreated === 0) {
            toast.info(
              "LKW-Plan gespeichert – alle Termine bereits vorhanden.",
            );
          } else {
            toast.success(
              `LKW-Plan gespeichert – ${trucksCreated} LKW und ${shipmentsCreated} Sendung(en) generiert.`,
            );
          }
        },
        onError: () =>
          toast.error("LKW-Plan gespeichert, aber Fehler beim Generieren."),
      });
    }

    if (editingTruckVorlageId) {
      updateTruckVorlage.mutate(
        { id: editingTruckVorlageId, ...payload },
        {
          onSuccess: () => {
            onSuccess();
            triggerGeneration(editingTruckVorlageId);
          },
          onError: () => toast.error("Fehler beim Speichern"),
        },
      );
    } else {
      createTruckVorlage.mutate(payload, {
        onSuccess: (savedVorlage) => {
          onSuccess();
          triggerGeneration(savedVorlage.id);
        },
        onError: () => toast.error("Fehler beim Speichern"),
      });
    }
  }

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

  function handleGenerateTruckVorlage(truckVorlage: TruckVorlageRow) {
    generateTrucksWithShipments.mutate([truckVorlage], {
      onSuccess: ({ trucksCreated, shipmentsCreated }) => {
        if (trucksCreated === 0)
          toast.info("Alle LKW und Aufträge bereits vorhanden.");
        else
          toast.success(
            `${trucksCreated} LKW und ${shipmentsCreated} Aufträge erstellt.`,
          );
      },
      onError: () => toast.error("Fehler beim Generieren"),
    });
  }

  const isSaving =
    createTruckVorlage.isPending || updateTruckVorlage.isPending;
  const isGenerationRunning = generateTrucksWithShipments.isPending;

  return {
    editingTruckVorlageId,
    truckFormSubmitted,
    truckVorlageName,
    setTruckVorlageName,
    truckKennzeichen,
    setTruckKennzeichen,
    truckFraechter,
    setTruckFraechter,
    truckFahrer,
    setTruckFahrer,
    truckTelefonFahrer,
    setTruckTelefonFahrer,
    truckFahrzeugFarbe,
    setTruckFahrzeugFarbe,
    truckKosten,
    setTruckKosten,
    truckPreisProKm,
    setTruckPreisProKm,
    truckRelationId,
    setTruckRelationId,
    truckRecurrenceType,
    setTruckRecurrenceType,
    truckSelectedWeekdays,
    setTruckSelectedWeekdays,
    truckMonthlyDayOfMonth,
    setTruckMonthlyDayOfMonth,
    truckLoadingTime,
    setTruckLoadingTime,
    truckUnloadingTime,
    setTruckUnloadingTime,
    truckOffsetDays,
    setTruckOffsetDays,
    truckLookaheadDays,
    setTruckLookaheadDays,
    truckSkippedDates,
    truckNewSkipDateInput,
    setTruckNewSkipDateInput,
    linkedSendungVorlageIds,
    openTruckVorlageForm,
    resetTruckFormState,
    handleSaveTruckVorlage,
    addTruckSkippedDate,
    removeTruckSkippedDate,
    applyRecurrenceFromSendungVorlage,
    toggleLinkedSendungVorlage,
    handleGenerateTruckVorlage,
    isSaving,
    isGenerationRunning,
  };
}
