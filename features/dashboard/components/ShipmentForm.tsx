"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import { MapPin, Package, Euro } from "lucide-react";
import SlideOver from "@/components/common/SlideOver";
import PlzOrtInput from "@/components/common/PlzOrtInput";
import UnternehmenAutocomplete from "@/components/common/UnternehmenAutocomplete";
import { useCreateSendung, useUpdateSendung, type SendungRow } from "@/hooks/useSendungen";
import { toast } from "react-toastify";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Stack from "@mui/joy/Stack";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import type { Unternehmen } from "@/hooks/useUnternehmen";

const inputSx = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

const errorSx = {
  "--Input-focusedHighlight": "#ef4444",
  borderColor: "#ef4444",
} as const;

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        level="body-xs"
        sx={{ color: error ? "#ef4444" : "#57688e", mb: 0.5, fontWeight: 500 }}
      >
        {label}
        {required && " *"}
      </Typography>
      {children}
    </Box>
  );
}

/* ── Lademeter lookup per unit ─────────────────────────────────────── */
const PACKUNGSEINHEITEN = [
  { value: "europalette", label: "Europalette (120×80)", ldmPerUnit: 0.4 },
  { value: "industriepalette", label: "Industriepalette (120×100)", ldmPerUnit: 0.5 },
  { value: "gitterbox", label: "Gitterbox (124×84)", ldmPerUnit: 0.4 },
  { value: "colli", label: "Colli / Karton", ldmPerUnit: 0 },
  { value: "sonstige", label: "Sonstige", ldmPerUnit: 0 },
] as const;

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  sendung?: SendungRow | null;
}

export default function ShipmentForm({
  open,
  onClose,
  sendung,
}: ShipmentFormProps) {
  const isEdit = !!sendung;
  const createSendung = useCreateSendung();
  const updateSendung = useUpdateSendung();
  const [referenz, setReferenz] = useState(sendung?.referenz ?? "");
  const [submitted, setSubmitted] = useState(false);

  // Kunde
  const [kunde, setKunde] = useState<Unternehmen | null>(
    sendung?.kunde
      ? ({ id: sendung.kunde.id, name: sendung.kunde.name, kundennummer: sendung.kunde.kundennummer } as Unternehmen)
      : null,
  );

  // Tab
  const [activeTab, setActiveTab] = useState(0);

  // Ladeort
  const [ladePlz, setLadePlz] = useState(sendung?.lade_plz ?? "");
  const [ladeort, setLadeort] = useState(sendung?.lade_ort ?? "");
  const [ladeAdresse, setLadeAdresse] = useState(sendung?.lade_adresse ?? "");
  const [ladeLand, setLadeLand] = useState(sendung?.lade_land ?? "AT");

  // Entladeort
  const [entladePlz, setEntladePlz] = useState(sendung?.entlade_plz ?? "");
  const [entladeort, setEntladeort] = useState(sendung?.entlade_ort ?? "");
  const [entladeAdresse, setEntladeAdresse] = useState(sendung?.entlade_adresse ?? "");
  const [entladeLand, setEntladeLand] = useState(sendung?.entlade_land ?? "AT");

  // Details
  const [gewicht, setGewicht] = useState(sendung?.gewicht != null ? String(sendung.gewicht) : "");
  const [packungseinheit, setPackungseinheit] = useState(sendung?.packungseinheit ?? "europalette");
  const [anzahl, setAnzahl] = useState(sendung?.anzahl != null ? String(sendung.anzahl) : "");
  const [lademeterOverride, setLademeterOverride] = useState(sendung?.lademeter != null ? String(sendung.lademeter) : "");
  const [startDate, setStartDate] = useState(sendung?.ladedatum ?? dayjs().format("YYYY-MM-DD"));
  const [startTime, setStartTime] = useState(sendung?.ladezeit ?? "08:00");
  const [endDate, setEndDate] = useState(sendung?.entladedatum ?? dayjs().format("YYYY-MM-DD"));
  const [endTime, setEndTime] = useState(sendung?.entladezeit ?? "17:00");

  // Kosten
  const [verkaufspreis, setVerkaufspreis] = useState(sendung?.verkaufspreis != null ? String(sendung.verkaufspreis) : "");

  // ── Auto-calculated Lademeter
  const lademeter = useMemo(() => {
    if (lademeterOverride) return lademeterOverride;
    const unit = PACKUNGSEINHEITEN.find((p) => p.value === packungseinheit);
    if (!unit || !unit.ldmPerUnit || !anzahl) return "";
    return (unit.ldmPerUnit * Number(anzahl)).toFixed(2);
  }, [packungseinheit, anzahl, lademeterOverride]);

  const resetForm = () => {
    setReferenz("");
    setKunde(null);
    setLadePlz("");
    setLadeort("");
    setLadeAdresse("");
    setLadeLand("AT");
    setEntladePlz("");
    setEntladeort("");
    setEntladeAdresse("");
    setEntladeLand("AT");
    setGewicht("");
    setPackungseinheit("europalette");
    setAnzahl("");
    setLademeterOverride("");
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setStartTime("08:00");
    setEndDate(dayjs().format("YYYY-MM-DD"));
    setEndTime("17:00");
    setVerkaufspreis("");
    setSubmitted(false);
    setActiveTab(0);
  };

  const handleSubmit = () => {
    setSubmitted(true);

    const missing: string[] = [];
    if (!referenz.trim()) missing.push("Referenz");
    if (!ladePlz.trim()) missing.push("Lade-PLZ");
    if (!ladeort.trim()) missing.push("Ladeort");
    if (!ladeLand.trim()) missing.push("Lade-Land");
    if (!entladePlz.trim()) missing.push("Entlade-PLZ");
    if (!entladeort.trim()) missing.push("Entladeort");
    if (!entladeLand.trim()) missing.push("Entlade-Land");

    if (missing.length > 0) {
      toast.error(`Bitte ausfüllen: ${missing.join(", ")}`);
      if (
        !ladePlz.trim() || !ladeort.trim() || !ladeLand.trim() ||
        !entladePlz.trim() || !entladeort.trim() || !entladeLand.trim()
      ) setActiveTab(0);
      return;
    }

    const payload = {
      referenz: referenz.trim(),
      kunde_id: kunde?.id || null,
      lade_plz: ladePlz.trim() || null,
      lade_ort: ladeort.trim(),
      lade_adresse: ladeAdresse.trim() || null,
      lade_land: ladeLand.trim() || null,
      entlade_plz: entladePlz.trim() || null,
      entlade_ort: entladeort.trim(),
      entlade_adresse: entladeAdresse.trim() || null,
      entlade_land: entladeLand.trim() || null,
      ladedatum: startDate,
      ladezeit: startTime || null,
      entladedatum: endDate,
      entladezeit: endTime || null,
      gewicht: gewicht ? Number(gewicht) : null,
      packungseinheit: packungseinheit || null,
      anzahl: anzahl ? Number(anzahl) : null,
      lademeter: lademeter ? Number(lademeter) : null,
      verkaufspreis: verkaufspreis ? Number(verkaufspreis) : null,
    };

    const options = {
      onSuccess: () => {
        toast.success(isEdit ? "Sendeauftrag aktualisiert" : "Sendeauftrag erstellt");
        resetForm();
        onClose();
      },
      onError: () => {
        toast.error(isEdit ? "Fehler beim Aktualisieren" : "Fehler beim Erstellen");
      },
    };

    if (isEdit) {
      updateSendung.mutate({ id: sendung.id, ...payload }, options);
    } else {
      createSendung.mutate(payload, options);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const actions = (
    <>
      <Button
        variant="plain"
        color="neutral"
        size="sm"
        onClick={handleClose}
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
    </>
  );

  return (
    <SlideOver
      open={open}
      onClose={handleClose}
      title={isEdit ? "Sendeauftrag bearbeiten" : "Neuer Sendeauftrag"}
      actions={actions}
    >
      {/* ── Always visible: Referenz + Kunde ────────────────────────── */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Field label="Referenz" required error={submitted && !referenz.trim()}>
          <Input
            size="sm"
            required
            value={referenz}
            onChange={(e) => setReferenz(e.target.value)}
            placeholder="z.B. SA-20260315-001"
            sx={{
              ...inputSx,
              ...(submitted && !referenz.trim() ? errorSx : {}),
            }}
          />
        </Field>

        <Field label="Kunde">
          <UnternehmenAutocomplete
            value={kunde}
            onChange={setKunde}
            placeholder="Kundenname oder Kundennr."
            defaultRollen={["kunde"]}
          />
        </Field>

        {kunde && (
          <>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Field label="Adresse">
                  <Input
                    size="sm"
                    readOnly
                    value={kunde.adresse}
                    sx={{ ...inputSx, bgcolor: "#f8f9fb" }}
                  />
                </Field>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ width: 100 }}>
                <Field label="PLZ">
                  <Input
                    size="sm"
                    readOnly
                    value={kunde.plz}
                    sx={{ ...inputSx, bgcolor: "#f8f9fb" }}
                  />
                </Field>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Field label="Ort">
                  <Input
                    size="sm"
                    readOnly
                    value={kunde.ort}
                    sx={{ ...inputSx, bgcolor: "#f8f9fb" }}
                  />
                </Field>
              </Box>
              <Box sx={{ width: 60 }}>
                <Field label="Land">
                  <Input
                    size="sm"
                    readOnly
                    value={kunde.land}
                    sx={{ ...inputSx, bgcolor: "#f8f9fb" }}
                  />
                </Field>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  setLadePlz(kunde.plz);
                  setLadeort(kunde.ort);
                  setLadeAdresse(kunde.adresse);
                  setLadeLand(kunde.land);
                  setActiveTab(0);
                }}
                sx={{
                  flex: 1,
                  color: "#57688e",
                  borderColor: "#d5dbe8",
                  fontSize: "0.75rem",
                  "&:hover": { bgcolor: "#f1f5f9", borderColor: "#155dfc", color: "#155dfc" },
                }}
              >
                → Ladeort übernehmen
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  setEntladePlz(kunde.plz);
                  setEntladeort(kunde.ort);
                  setEntladeAdresse(kunde.adresse);
                  setEntladeLand(kunde.land);
                  setActiveTab(0);
                }}
                sx={{
                  flex: 1,
                  color: "#57688e",
                  borderColor: "#d5dbe8",
                  fontSize: "0.75rem",
                  "&:hover": { bgcolor: "#f1f5f9", borderColor: "#155dfc", color: "#155dfc" },
                }}
              >
                → Entladeort übernehmen
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onChange={(_e, val) => setActiveTab(val as number)} sx={{ bgcolor: "transparent" }}>
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
            <MapPin className="h-3 w-3" /> Adressen
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Package className="h-3 w-3" /> Details
          </Tab>
          <Tab variant="plain" sx={{ fontSize: "0.75rem", gap: 0.5 }}>
            <Euro className="h-3 w-3" /> Kosten
          </Tab>
        </TabList>

        {/* ── TAB: Adressen ─────────────────────────────────────────── */}
        <TabPanel value={0} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Typography
              level="body-xs"
              sx={{ color: submitted && (!ladePlz.trim() || !ladeort.trim() || !ladeLand.trim()) ? "#ef4444" : "#57688e", fontWeight: 600 }}
            >
              Ladeort *
            </Typography>

            <PlzOrtInput
              plz={ladePlz}
              ort={ladeort}
              land={ladeLand}
              onPlzChange={setLadePlz}
              onOrtChange={setLadeort}
              onLandChange={setLadeLand}
              required
              error={submitted && (!ladePlz.trim() || !ladeort.trim() || !ladeLand.trim())}
            />

            <Field label="Adresse">
              <Input
                size="sm"
                value={ladeAdresse}
                onChange={(e) => setLadeAdresse(e.target.value)}
                placeholder="z.B. Industriestraße 12"
                sx={inputSx}
              />
            </Field>

            <Divider />

            <Typography
              level="body-xs"
              sx={{ color: submitted && (!entladePlz.trim() || !entladeort.trim() || !entladeLand.trim()) ? "#ef4444" : "#57688e", fontWeight: 600 }}
            >
              Entladeort *
            </Typography>

            <PlzOrtInput
              plz={entladePlz}
              ort={entladeort}
              land={entladeLand}
              onPlzChange={setEntladePlz}
              onOrtChange={setEntladeort}
              onLandChange={setEntladeLand}
              required
              error={submitted && !entladeort.trim()}
            />

            <Field label="Adresse">
              <Input
                size="sm"
                value={entladeAdresse}
                onChange={(e) => setEntladeAdresse(e.target.value)}
                placeholder="z.B. Lagerweg 5"
                sx={inputSx}
              />
            </Field>
          </Stack>
        </TabPanel>

        {/* ── TAB: Details ──────────────────────────────────────────── */}
        <TabPanel value={1} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ flex: 1 }}>
                <Field label="Ladedatum" required>
                  <Input
                    size="sm"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
              <Box sx={{ width: 120 }}>
                <Field label="Uhrzeit">
                  <Input
                    size="sm"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
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
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
              <Box sx={{ width: 120 }}>
                <Field label="Uhrzeit">
                  <Input
                    size="sm"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    sx={inputSx}
                  />
                </Field>
              </Box>
            </Stack>

            <Divider />
            <Typography
              level="body-xs"
              sx={{ color: "#57688e", fontWeight: 600 }}
            >
              Ladung
            </Typography>

            <Field label="Gewicht (kg)">
              <Input
                size="sm"
                type="number"
                value={gewicht}
                onChange={(e) => setGewicht(e.target.value)}
                placeholder="z.B. 12000"
                sx={inputSx}
              />
            </Field>

            <Field label="Packungseinheit">
              <Select
                size="sm"
                value={packungseinheit}
                onChange={(_e, val) => val && setPackungseinheit(val)}
                sx={{ "--Select-focusedHighlight": "#155dfc", color: "#0f172b" }}
              >
                {PACKUNGSEINHEITEN.map((p) => (
                  <Option key={p.value} value={p.value}>
                    {p.label}
                  </Option>
                ))}
              </Select>
            </Field>

            <Stack direction="row" spacing={1.5}>
              <Field label="Anzahl">
                <Input
                  size="sm"
                  type="number"
                  value={anzahl}
                  onChange={(e) => setAnzahl(e.target.value)}
                  placeholder="z.B. 33"
                  sx={inputSx}
                />
              </Field>
              <Field label="Lademeter (ldm)">
                <Input
                  size="sm"
                  type="number"
                  value={lademeter}
                  onChange={(e) => setLademeterOverride(e.target.value)}
                  placeholder="auto"
                  sx={{
                    ...inputSx,
                    bgcolor: lademeterOverride ? undefined : "#f8f9fb",
                  }}
                />
              </Field>
            </Stack>
          </Stack>
        </TabPanel>

        {/* ── TAB: Kosten ───────────────────────────────────────────── */}
        <TabPanel value={2} sx={{ p: 0 }}>
          <Stack spacing={2}>
            <Field label="Verkaufspreis (€)">
              <Input
                size="sm"
                type="number"
                value={verkaufspreis}
                onChange={(e) => setVerkaufspreis(e.target.value)}
                placeholder="Preis vom Kunden"
                sx={inputSx}
              />
            </Field>

            <Typography level="body-xs" sx={{ color: "#57688e" }}>
              Der Einkaufspreis ergibt sich automatisch aus den zugewiesenen
              LKW-Kosten (Preis pro km × Distanz).
            </Typography>
          </Stack>
        </TabPanel>
      </Tabs>
    </SlideOver>
  );
}
