"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import type { CalendarEvent } from "@ilamy/calendar";
import { Trash2, Truck, CalendarDays, Euro } from "lucide-react";

import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";

import SlideOver from "@/components/common/SlideOver";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import { toast } from "react-toastify";
import { useFahrzeugTypen } from "@/hooks/useFahrzeugTypen";
import {
  useCreateTruck,
  useUpdateTruck,
  useDeleteTruck,
  useNextTruckRef,
} from "@/hooks/useTrucks";
import { useRelationen } from "@/hooks/useRelationen";
import type { Unternehmen } from "@/hooks/useUnternehmen";

const inputSx = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        level="body-xs"
        sx={{ color: "#57688e", mb: 0.5, fontWeight: 500 }}
      >
        {label}
        {required && " *"}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Types ─────────────────────────────────────────────────────────── */
interface TruckFormProps {
  open?: boolean;
  selectedEvent?: CalendarEvent | null;
  onAdd?: (event: CalendarEvent) => void;
  onUpdate?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onClose: () => void;
}

type TruckStatus =
  | "verfügbar"
  | "geplant"
  | "unterwegs"
  | "beladen"
  | "entladen"
  | "abgeschlossen"
  | "problem";

const STATUS_OPTIONS: { value: TruckStatus; label: string; color: string }[] = [
  { value: "verfügbar", label: "Verfügbar", color: "#22c55e" },
  { value: "geplant", label: "Geplant", color: "#3b82f6" },
  { value: "unterwegs", label: "Unterwegs", color: "#eab308" },
  { value: "beladen", label: "Beladen", color: "#f97316" },
  { value: "entladen", label: "Entladen", color: "#f97316" },
  { value: "abgeschlossen", label: "Abgeschlossen", color: "#15803d" },
  { value: "problem", label: "Problem", color: "#ef4444" },
];

/* ── Component ─────────────────────────────────────────────────────── */
export default function TruckForm(props: TruckFormProps) {
  if (!props.open) return null;

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
  const isEdit = !!selectedEvent?.id;
  const { data: fahrzeugTypen = [] } = useFahrzeugTypen();
  const { data: nextRef = "" } = useNextTruckRef();
  const createTruck = useCreateTruck();
  const updateTruck = useUpdateTruck();
  const deleteTruck = useDeleteTruck();

  const initial = useMemo(() => {
    if (selectedEvent) {
      const ext = selectedEvent as unknown as Record<string, unknown>;
      const truck = ext.truckData as Record<string, unknown> | undefined;
      const s = selectedEvent.start
        ? dayjs(selectedEvent.start as unknown as string)
        : dayjs();

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
            (truck.ladezeit as string)?.slice(0, 5) || s.format("HH:mm"),
          entladedatum: entlade || s.format("YYYY-MM-DD"),
          entladezeit: (truck.entladezeit as string)?.slice(0, 5) || "17:00",
          status: (truck.status as TruckStatus) || "verfügbar",
          relationId: (truck.relation_id as string) || "",
          maxPaletten:
            truck.max_paletten != null ? String(truck.max_paletten) : "",
          maxGewicht:
            truck.max_gewicht != null ? String(truck.max_gewicht) : "",
          lademeter: truck.lademeter != null ? String(truck.lademeter) : "",
          preisProKm:
            truck.preis_pro_km != null ? String(truck.preis_pro_km) : "",
          gesamtpreis:
            truck.gesamtpreis != null ? String(truck.gesamtpreis) : "",
          kosten: truck.kosten != null ? String(truck.kosten) : "",
        };
      }

      return {
        kennzeichen: "",
        fraechter: null as Unternehmen | null,
        fahrer: selectedEvent.description || "",
        telefonFahrer: "",
        fahrzeugTyp: "sattelzug",
        bgColor: selectedEvent.backgroundColor || "#155dfc",
        ref: (ext.ref as string) || nextRef,
        kundenRef: "",
        startDate: s.format("YYYY-MM-DD"),
        startTime: s.format("HH:mm"),
        entladedatum: s.format("YYYY-MM-DD"),
        entladezeit: "17:00",
        status: "verfügbar" as TruckStatus,
        relationId: "",
        maxPaletten: "",
        maxGewicht: "",
        lademeter: "",
        preisProKm: "",
        gesamtpreis: "",
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
      status: "verfügbar" as TruckStatus,
      relationId: "",
      maxPaletten: "",
      maxGewicht: "",
      lademeter: "",
      preisProKm: "",
      gesamtpreis: "",
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
  const [status, setStatus] = useState<TruckStatus>(initial.status);

  // ── Kapazitäten
  const [maxPaletten, setMaxPaletten] = useState(initial.maxPaletten);
  const [maxGewicht, setMaxGewicht] = useState(initial.maxGewicht);
  const [lademeter, setLademeter] = useState(initial.lademeter);

  // ── Kosten
  const [preisProKm, setPreisProKm] = useState(initial.preisProKm);
  const [gesamtpreis, setGesamtpreis] = useState(initial.gesamtpreis);
  const [kosten, setKosten] = useState(initial.kosten);

  // ── Gewinn (computed)
  const gewinn = useMemo(() => {
    const g = Number(gesamtpreis) - Number(kosten);
    if (!gesamtpreis && !kosten) return "–";
    return isNaN(g) ? "–" : `${g.toFixed(2)} €`;
  }, [gesamtpreis, kosten]);

  if (!open) return null;

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
      gesamtpreis: gesamtpreis ? Number(gesamtpreis) : undefined,
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
        onClick={handleSubmit}
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
        <Field label="Interne Referenz">
          <Input
            size="sm"
            readOnly
            value={interneRef}
            sx={{ ...inputSx, bgcolor: "#f8f9fb" }}
          />
        </Field>
        <Field label="Kunden-Referenz">
          <Input
            size="sm"
            value={kundenRef}
            onChange={(e) => setKundenRef(e.target.value)}
            placeholder="Kunden-Ref."
            sx={inputSx}
          />
        </Field>
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs defaultValue={0} sx={{ bgcolor: "transparent" }}>
        <TabList
          size="sm"
          sx={{
            gap: 0.5,
            "--ListItem-radius": "6px",
            "--List-padding": "0",
            mb: 2,
          }}
        >
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Truck className="h-3 w-3" /> Fahrzeug
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <CalendarDays className="h-3 w-3" /> Planung
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Euro className="h-3 w-3" /> Kosten
          </Tab>
        </TabList>

        {/* ── TAB: Fahrzeug ─────────────────────────────────────────── */}
        <TabPanel value={0} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Field label="Kennzeichen" required>
              <Input
                autoFocus
                size="sm"
                required
                value={kennzeichen}
                onChange={(e) => setKennzeichen(e.target.value)}
                placeholder="z.B. W-12345X"
                sx={inputSx}
              />
            </Field>

            <Field label="Frächter">
              <UnternehmenAutocomplete
                rolle="fraechter"
                value={fraechter}
                onChange={setFraechter}
                placeholder="Name oder Kundennr."
                defaultRollen={["fraechter"]}
              />
            </Field>

            <Stack direction="row" spacing={1.5}>
              <Field label="Fahrer">
                <Input
                  size="sm"
                  value={fahrer}
                  onChange={(e) => setFahrer(e.target.value)}
                  placeholder="Vor- & Nachname"
                  sx={inputSx}
                />
              </Field>
              <Field label="Telefon Fahrer">
                <Input
                  size="sm"
                  type="tel"
                  value={telefonFahrer}
                  onChange={(e) => setTelefonFahrer(e.target.value)}
                  placeholder="+43 …"
                  sx={inputSx}
                />
              </Field>
            </Stack>

            <Field label="Fahrzeugtyp">
              <Select
                size="sm"
                value={fahrzeugTyp}
                onChange={(_e, val) => val && setFahrzeugTyp(val)}
                sx={{
                  "--Select-focusedHighlight": "#155dfc",
                  color: "#0f172b",
                }}
              >
                {fahrzeugTypen.map((o) => (
                  <Option key={o.id} value={o.id}>
                    {o.label}
                  </Option>
                ))}
              </Select>
            </Field>

            {/* Farbe */}
            <Field label="Farbe">
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
            </Field>
          </Stack>
        </TabPanel>

        {/* ── TAB: Planung ──────────────────────────────────────────── */}
        <TabPanel value={1} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Field label="Ladedatum" required>
                  <Input
                    size="sm"
                    type="date"
                    value={ladedatum}
                    onChange={(e) => setLadedatum(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
              <Box sx={{ width: 120 }}>
                <Field label="Uhrzeit">
                  <Input
                    size="sm"
                    type="time"
                    value={ladezeit}
                    onChange={(e) => setLadezeit(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Field label="Entladedatum" required>
                  <Input
                    size="sm"
                    type="date"
                    value={entladedatum}
                    onChange={(e) => setEntladedatum(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
              <Box sx={{ width: 120 }}>
                <Field label="Uhrzeit">
                  <Input
                    size="sm"
                    type="time"
                    value={entladezeit}
                    onChange={(e) => setEntladezeit(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
            </Stack>

            <Field label="Relation" required>
              <Select
                size="sm"
                value={relationId}
                onChange={(_e, val) => setRelationId(val || "")}
                placeholder="Keine Relation"
                sx={{
                  "--Select-focusedHighlight": "#155dfc",
                  color: "#0f172b",
                }}
              >
                {relationen.map((r) => (
                  <Option key={r.id} value={r.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: r.farbe || "#155dfc",
                          flexShrink: 0,
                        }}
                      />
                      {r.nummer} – {r.name}
                    </Box>
                  </Option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select
                size="sm"
                value={status}
                onChange={(_e, val) => val && setStatus(val)}
                renderValue={(selected) => {
                  const opt = STATUS_OPTIONS.find(
                    (o) => o.value === selected?.value,
                  );
                  return opt ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: opt.color,
                          flexShrink: 0,
                        }}
                      />
                      {opt.label}
                    </Box>
                  ) : null;
                }}
                sx={{
                  "--Select-focusedHighlight": "#155dfc",
                  color: "#0f172b",
                }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <Option key={o.value} value={o.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: o.color,
                          flexShrink: 0,
                        }}
                      />
                      {o.label}
                    </Box>
                  </Option>
                ))}
              </Select>
            </Field>

            <Divider />
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", fontWeight: 600 }}
            >
              Kapazitäten
            </Typography>

            <Stack direction="row" spacing={1.5}>
              <Field label="Max Paletten">
                <Input
                  size="sm"
                  type="number"
                  value={maxPaletten}
                  onChange={(e) => setMaxPaletten(e.target.value)}
                  placeholder="z.B. 33"
                  sx={inputSx}
                />
              </Field>
              <Field label="Max Gewicht (kg)">
                <Input
                  size="sm"
                  type="number"
                  value={maxGewicht}
                  onChange={(e) => setMaxGewicht(e.target.value)}
                  placeholder="z.B. 24000"
                  sx={inputSx}
                />
              </Field>
            </Stack>

            <Field label="Lademeter (ldm)">
              <Input
                size="sm"
                type="number"
                value={lademeter}
                onChange={(e) => setLademeter(e.target.value)}
                placeholder="z.B. 13.6"
                sx={inputSx}
              />
            </Field>
          </Stack>
        </TabPanel>

        {/* ── TAB: Kosten ───────────────────────────────────────────── */}
        <TabPanel value={2} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Field label="Preis pro km (€)">
              <Input
                size="sm"
                type="number"
                value={preisProKm}
                onChange={(e) => setPreisProKm(e.target.value)}
                placeholder="z.B. 1.20"
                sx={inputSx}
              />
            </Field>

            <Field label="Gesamtpreis (€)">
              <Input
                size="sm"
                type="number"
                value={gesamtpreis}
                onChange={(e) => setGesamtpreis(e.target.value)}
                placeholder="Verkaufspreis"
                sx={inputSx}
              />
            </Field>

            <Field label="Kosten (€)">
              <Input
                size="sm"
                type="number"
                value={kosten}
                onChange={(e) => setKosten(e.target.value)}
                placeholder="Einkaufspreis"
                sx={inputSx}
              />
            </Field>

            <Divider />

            <Field label="Gewinn">
              <Box
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: "sm",
                  bgcolor: "#f8f9fb",
                  border: "1px solid #d5dbe8",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color:
                    Number(gesamtpreis) - Number(kosten) >= 0
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {gewinn}
              </Box>
            </Field>
          </Stack>
        </TabPanel>
      </Tabs>
    </SlideOver>
  );
}
