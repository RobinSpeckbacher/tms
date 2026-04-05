"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import type { CalendarEvent } from "@ilamy/calendar";
import { Trash2 } from "lucide-react";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Stack from "@mui/joy/Stack";

import SlideOver from "@/components/common/SlideOver";
import { toast } from "react-toastify";
import { useFahrzeugTypen } from "@/hooks/useFahrzeugTypen";
import {
  truckInputStyles,
  TruckFormField,
  TruckFormTabsSection,
  type TruckOperationalStatus,
} from "./truck-form/TruckFormSections";

import {
  useCreateTruck,
  useUpdateTruck,
  useDeleteTruck,
  useNextTruckRef,
} from "@/hooks/useTrucks";
import { useRelationen } from "@/hooks/useRelationen";
import type { Unternehmen } from "@/hooks/useUnternehmen";

/* ── Types ─────────────────────────────────────────────────────────── */
interface TruckFormProps {
  open?: boolean;
  selectedEvent?: CalendarEvent | null;
  onAdd?: (event: CalendarEvent) => void;
  onUpdate?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onClose: () => void;
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function TruckForm(props: TruckFormProps) {
  if (props.open !== true) return null;

  const resetKey = `${props.selectedEvent?.id ?? "new"}`;
  return <TruckFormInner key={resetKey} {...props} />;
}

function TruckFormInner({
  open,
  selectedEvent,
  onAdd,
  onDelete,
  onClose,
}: TruckFormProps) {
  const isEdit = selectedEvent?.id != null;
  const { data: fahrzeugTypen = [] } = useFahrzeugTypen();
  const { data: nextRef = "" } = useNextTruckRef();
  const createTruck = useCreateTruck();
  const updateTruck = useUpdateTruck();
  const deleteTruck = useDeleteTruck();

  const initial = useMemo(() => {
    if (selectedEvent) {
      const ext = selectedEvent as unknown as Record<string, unknown>;
      const truck = ext.truckData as Record<string, unknown> | undefined;
      const s = dayjs(selectedEvent.start as unknown as string);

      if (truck) {
        // Editing an existing truck from DB
        const entlade = truck.entladedatum as string | undefined;
        return {
          kennzeichen: (truck.kennzeichen as string) || "",
          fraechter: (truck.fraechter as Unternehmen | null) || null,
          fahrer: (truck.fahrer as string) || "",
          telefonFahrer: (truck.telefon_fahrer as string) || "",
          fahrzeugTyp: (truck.fahrzeug_typ_id as string) || "sattelzug",
          bgColor: (truck.farbe as string) || "#155dfc",
          ref: (truck.interne_ref as string) || nextRef,
          kundenRef: (truck.kunden_ref as string) || "",
          startDate: s.format("YYYY-MM-DD"),
          startTime:
            ((truck.ladezeit as string) || "").slice(0, 5) || s.format("HH:mm"),
          entladedatum:
            entlade != null && entlade.trim() !== ""
              ? entlade
              : s.format("YYYY-MM-DD"),
          entladezeit:
            ((truck.entladezeit as string) || "").slice(0, 5) || "17:00",
          status:
            (truck.status as TruckOperationalStatus | null | undefined) ??
            "verfügbar",
          relationId: (truck.relation_id as string) || "",
          maxPaletten:
            truck.max_paletten != null ? String(truck.max_paletten) : "",
          maxGewicht:
            truck.max_gewicht != null ? String(truck.max_gewicht) : "",
          lademeter: truck.lademeter != null ? String(truck.lademeter) : "",
          preisProKm:
            truck.preis_pro_km != null ? String(truck.preis_pro_km) : "",
          kosten: truck.kosten != null ? String(truck.kosten) : "",
        };
      }

      return {
        kennzeichen: "",
        fraechter: null as Unternehmen | null,
        fahrer: selectedEvent.description ?? "",
        telefonFahrer: "",
        fahrzeugTyp: "sattelzug",
        bgColor: selectedEvent.backgroundColor ?? "#155dfc",
        ref: (ext.ref as string) || nextRef,
        kundenRef: "",
        startDate: s.format("YYYY-MM-DD"),
        startTime: s.format("HH:mm"),
        entladedatum: s.format("YYYY-MM-DD"),
        entladezeit: "17:00",
        status: "verfügbar" as TruckOperationalStatus,
        relationId: "",
        maxPaletten: "",
        maxGewicht: "",
        lademeter: "",
        preisProKm: "",
        kosten: "",
      };
    }
    return {
      kennzeichen: "",
      fraechter: null as Unternehmen | null,
      fahrer: "",
      telefonFahrer: "",
      fahrzeugTyp: "sattelzug",
      bgColor: "#155dfc",
      ref: nextRef,
      kundenRef: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      startTime: "08:00",
      entladedatum: dayjs().format("YYYY-MM-DD"),
      entladezeit: "17:00",
      status: "verfügbar" as TruckOperationalStatus,
      relationId: "",
      maxPaletten: "",
      maxGewicht: "",
      lademeter: "",
      preisProKm: "",
      kosten: "",
    };
  }, [selectedEvent, nextRef]);

  // ── Fahrzeug
  const [kennzeichen, setKennzeichen] = useState(initial.kennzeichen);
  const [fraechter, setFraechter] = useState<Unternehmen | null>(
    initial.fraechter,
  );
  const [fahrer, setFahrer] = useState(initial.fahrer);
  const [telefonFahrer, setTelefonFahrer] = useState(initial.telefonFahrer);
  const [fahrzeugTyp, setFahrzeugTyp] = useState(initial.fahrzeugTyp);
  const [bgColor, setBgColor] = useState(initial.bgColor);

  // ── Referenzen
  const interneRef = isEdit ? initial.ref : nextRef || initial.ref;
  const [kundenRef, setKundenRef] = useState(initial.kundenRef);

  // ── Relation
  const [relationId, setRelationId] = useState(initial.relationId);
  const { data: relationen = [] } = useRelationen();

  // ── Planung
  const [ladedatum, setLadedatum] = useState(initial.startDate);
  const [ladezeit, setLadezeit] = useState(initial.startTime);
  const [entladedatum, setEntladedatum] = useState(initial.entladedatum);
  const [entladezeit, setEntladezeit] = useState(initial.entladezeit);
  const [status, setStatus] = useState<TruckOperationalStatus>(initial.status);

  // ── Kapazitäten
  const [maxPaletten, setMaxPaletten] = useState(initial.maxPaletten);
  const [maxGewicht, setMaxGewicht] = useState(initial.maxGewicht);
  const [lademeter, setLademeter] = useState(initial.lademeter);

  // ── Kosten
  const [preisProKm, setPreisProKm] = useState(initial.preisProKm);
  const [kosten, setKosten] = useState(initial.kosten);

  if (open !== true) return null;

  const handleSubmit = async () => {
    if (!kennzeichen.trim()) {
      toast.error("Bitte Kennzeichen eingeben");
      return;
    }
    if (!relationId) {
      toast.error("Bitte eine Relation auswählen");
      return;
    }

    const input = {
      interne_ref: interneRef,
      kunden_ref: kundenRef.trim() || undefined,
      kennzeichen: kennzeichen.trim(),
      fraechter_id: fraechter?.id ?? null,
      fahrer: fahrer.trim() || null,
      telefon_fahrer: telefonFahrer.trim() || null,
      fahrzeug_typ_id: fahrzeugTyp || null,
      farbe: bgColor,
      ladedatum,
      ladezeit: ladezeit || undefined,
      entladedatum,
      entladezeit: entladezeit || undefined,
      status,
      max_paletten: maxPaletten ? Number(maxPaletten) : undefined,
      max_gewicht: maxGewicht ? Number(maxGewicht) : undefined,
      lademeter: lademeter ? Number(lademeter) : undefined,
      preis_pro_km: preisProKm ? Number(preisProKm) : undefined,
      kosten: kosten ? Number(kosten) : undefined,
      relation_id: relationId,
    };

    if (isEdit) {
      const truckId = (selectedEvent as unknown as Record<string, string>)
        .truckId;
      try {
        await toast.promise(
          updateTruck.mutateAsync({ id: truckId, ...input }),
          {
            pending: "Wird gespeichert…",
            success: "LKW wurde gespeichert",
            error: "Fehler beim Speichern",
          },
        );
        onClose();
      } catch {
        // error toast already shown by toast.promise
      }
    } else {
      try {
        const saved = await toast.promise(createTruck.mutateAsync(input), {
          pending: "Wird erstellt…",
          success: "LKW wurde erstellt",
          error: "Fehler beim Erstellen",
        });
        const start = dayjs(`${ladedatum}T${ladezeit || "08:00"}:00`);
        const end = start.add(1, "hour");
        const displayTitle = fraechter
          ? `${kennzeichen} \u00b7 ${fraechter.name}`
          : kennzeichen;

        const event = {
          id: `evt-${saved.id}`,
          title: displayTitle,
          description: fahrer,
          start,
          end,
          allDay: false,
          backgroundColor: bgColor,
          color: "#fff",
          ref: interneRef,
          truckId: saved.id,
        } as unknown as CalendarEvent;

        onAdd?.(event);
        onClose();
      } catch {
        // error toast already shown by toast.promise
      }
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      const truckId = (selectedEvent as unknown as Record<string, string>)
        .truckId;
      if (truckId) {
        try {
          await toast.promise(deleteTruck.mutateAsync(truckId), {
            pending: "Wird gelöscht…",
            success: "LKW wurde gelöscht",
            error: "Fehler beim Löschen",
          });
        } catch {
          return;
        }
      }
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

  const actions = (
    <>
      {isEdit && (
        <Button
          variant="plain"
          color="danger"
          size="sm"
          loading={deleteTruck.isPending}
          startDecorator={<Trash2 className="h-3.5 w-3.5" />}
          onClick={() => {
            void handleDelete();
          }}
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
        disabled={
          createTruck.isPending ||
          updateTruck.isPending ||
          deleteTruck.isPending
        }
        sx={{ color: "#57688e" }}
      >
        Abbrechen
      </Button>
      <Button
        size="sm"
        loading={createTruck.isPending || updateTruck.isPending}
        onClick={() => {
          void handleSubmit();
        }}
        sx={{ bgcolor: "#155dfc", "&:hover": { bgcolor: "#1250d4" } }}
      >
        {isEdit ? "Speichern" : "Erstellen"}
      </Button>
    </>
  );

  return (
    <SlideOver
      open={!!open}
      onClose={onClose}
      title={isEdit ? "LKW bearbeiten" : "Neuer LKW"}
      actions={actions}
    >
      {/* ── Referenzen (immer sichtbar) ─────────────────────────────── */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TruckFormField label="Interne Referenz">
          <Input
            size="sm"
            readOnly
            value={interneRef}
            sx={{ ...truckInputStyles, bgcolor: "#f8f9fb" }}
          />
        </TruckFormField>
        <TruckFormField label="Kunden-Referenz">
          <Input
            size="sm"
            value={kundenRef}
            onChange={(e) => setKundenRef(e.target.value)}
            placeholder="Kunden-Ref."
            sx={truckInputStyles}
          />
        </TruckFormField>
      </Stack>

      <TruckFormTabsSection
        vehicleTypeOptions={fahrzeugTypen}
        relationOptions={relationen}
        colorOptions={colorOptions}
        licensePlate={kennzeichen}
        onLicensePlateChange={setKennzeichen}
        freightCarrier={fraechter}
        onFreightCarrierChange={setFraechter}
        driverName={fahrer}
        onDriverNameChange={setFahrer}
        driverPhoneNumber={telefonFahrer}
        onDriverPhoneNumberChange={setTelefonFahrer}
        vehicleTypeId={fahrzeugTyp}
        onVehicleTypeIdChange={setFahrzeugTyp}
        selectedColor={bgColor}
        onSelectedColorChange={setBgColor}
        loadingDate={ladedatum}
        onLoadingDateChange={setLadedatum}
        loadingTime={ladezeit}
        onLoadingTimeChange={setLadezeit}
        unloadingDate={entladedatum}
        onUnloadingDateChange={setEntladedatum}
        unloadingTime={entladezeit}
        onUnloadingTimeChange={setEntladezeit}
        relationId={relationId}
        onRelationIdChange={setRelationId}
        status={status}
        onStatusChange={setStatus}
        maximumPallets={maxPaletten}
        onMaximumPalletsChange={setMaxPaletten}
        maximumWeightInKilograms={maxGewicht}
        onMaximumWeightInKilogramsChange={setMaxGewicht}
        loadingMeterCapacity={lademeter}
        onLoadingMeterCapacityChange={setLademeter}
        pricePerKilometer={preisProKm}
        onPricePerKilometerChange={setPreisProKm}
        purchaseCost={kosten}
        onPurchaseCostChange={setKosten}
      />
    </SlideOver>
  );
}
