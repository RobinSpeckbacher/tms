"use client";

import { useRef, useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  MapPin,
  CalendarDays,
  Weight,
  Layers,
  FileText,
  Upload,
  Trash2,
  TriangleAlert,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  Truck,
  Euro,
} from "lucide-react";
import SlideOver from "@/components/common/SlideOver";
import Image from "next/image";
import type { EnrichedSendung } from "./ShipmentsTable";
import { useUploadCmr, useDeleteCmr, useGetCmrUrl } from "@/hooks/useCmr";
import { useDeleteSendung, useUpdateSendung } from "@/hooks/useSendungen";
import { useDistance } from "@/hooks/useDistance";
import { toast } from "react-toastify";
import Button from "@mui/joy/Button";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Typography from "@mui/joy/Typography";
import Chip from "@mui/joy/Chip";
import CircularProgress from "@mui/joy/CircularProgress";

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatDate(iso: string | null) {
  const normalizedIso = typeof iso === "string" ? iso.trim() : null;
  if (normalizedIso === null || normalizedIso === "") return "—";
  return dayjs(normalizedIso).format("DD.MM.YYYY");
}

function formatDateTime(date: string | null, time: string | null) {
  const normalizedDate = typeof date === "string" ? date.trim() : null;
  if (normalizedDate === null || normalizedDate === "") return "—";

  const d = dayjs(normalizedDate).format("DD.MM.YYYY");
  const normalizedTime = typeof time === "string" ? time.trim() : null;
  if (normalizedTime === null || normalizedTime === "") return d;

  return `${d} ${normalizedTime.slice(0, 5)}`;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function eur(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function formatWeight(kg: number | null) {
  if (kg == null) return "—";
  return kg >= 1000
    ? `${(kg / 1000).toFixed(kg % 1000 === 0 ? 0 : 1)} t`
    : `${kg} kg`;
}

const PE_LABELS: Record<string, string> = {
  europalette: "Europalette",
  industriepalette: "Industriepalette",
  gitterbox: "Gitterbox",
  colli: "Colli",
  sonstige: "Sonstige",
};

const STATUS_OPTIONS = [
  { value: "offen", label: "Offen" },
  { value: "zugewiesen", label: "Zugewiesen" },
  { value: "unterwegs", label: "Unterwegs" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "storniert", label: "Storniert" },
];

const STATUS_COLORS: Record<string, string> = {
  offen: "warning",
  zugewiesen: "primary",
  unterwegs: "primary",
  abgeschlossen: "success",
  storniert: "danger",
};

/* ── Info row component ──────────────────────────────────────────── */
function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 mt-0.5 text-[#57688e] shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-[0.65rem] text-[#57688e] uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-xs text-[#0f172b] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────── */
function Section({ title }: { title: string }) {
  return (
    <div className="border-b border-[#0f172b]/10 pb-1 mb-2 mt-4 first:mt-0">
      <p className="text-[0.7rem] font-semibold text-[#0f172b] uppercase tracking-wide">
        {title}
      </p>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
interface SendungDetailModalProps {
  open: boolean;
  onClose: () => void;
  sendung: EnrichedSendung | null;
  onEdit?: (sendung: EnrichedSendung) => void;
}

export default function SendungDetailModal({
  open,
  onClose,
  sendung,
  onEdit,
}: SendungDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteSendungOpen, setConfirmDeleteSendungOpen] =
    useState(false);
  const uploadCmr = useUploadCmr();
  const deleteCmr = useDeleteCmr();
  const deleteSendung = useDeleteSendung();
  const getCmrUrl = useGetCmrUrl();
  const updateSendung = useUpdateSendung();

  const ladePlz = sendung?.lade_plz;
  const ladeOrt = sendung?.lade_ort;
  const ladeLand = sendung?.lade_land ?? "AT";
  const entladePlz = sendung?.entlade_plz;
  const entladeOrt = sendung?.entlade_ort;
  const entladeLand = sendung?.entlade_land ?? "AT";
  const cmrPath = sendung?.cmr_path;

  // Distance between Ladeort ↔ Entladeort
  const { distance, isLoading: distanceLoading } = useDistance(
    hasText(ladePlz) && hasText(ladeOrt)
      ? {
          plz: ladePlz,
          ort: ladeOrt,
          land: ladeLand,
        }
      : null,
    hasText(entladePlz) && hasText(entladeOrt)
      ? {
          plz: entladePlz,
          ort: entladeOrt,
          land: entladeLand,
        }
      : null,
  );

  // CMR preview via react-query
  const { data: previewUrl, isLoading: previewLoading } = useQuery({
    queryKey: ["cmr-preview", sendung?.id, sendung?.cmr_path],
    queryFn: () =>
      hasText(cmrPath) ? getCmrUrl(cmrPath) : Promise.resolve(null),
    enabled: hasText(cmrPath),
  });

  const cmrFileName = sendung?.cmr_file_name;
  const isPdf = hasText(cmrFileName)
    ? cmrFileName.toLowerCase().endsWith(".pdf")
    : false;

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !sendung) return;

      uploadCmr.mutate(
        { sendungId: sendung.id, file },
        {
          onSuccess: () => toast.success("CMR hochgeladen"),
          onError: () => toast.error("Fehler beim Hochladen"),
        },
      );

      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [sendung, uploadCmr],
  );

  const handleRequestDeleteCmr = useCallback(() => {
    if (!sendung) return;
    setConfirmDeleteOpen(true);
  }, [sendung]);

  const handleDeleteCmr = useCallback(() => {
    if (!sendung) return;
    deleteCmr.mutate(sendung.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        toast.success("CMR entfernt");
      },
      onError: () => toast.error("Fehler beim Entfernen"),
    });
  }, [sendung, deleteCmr]);

  const handleOpenCmr = useCallback(async () => {
    if (!sendung) return;
    const url = await getCmrUrl(sendung.id);
    if (hasText(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Datei nicht gefunden");
    }
  }, [sendung, getCmrUrl]);

  const handleStatusChange = useCallback(
    (_e: unknown, value: string | null) => {
      if (!sendung) return;
      if (!hasText(value)) return;

      updateSendung.mutate(
        { id: sendung.id, status: value },
        {
          onSuccess: () => toast.success("Status aktualisiert"),
          onError: () => toast.error("Fehler beim Aktualisieren"),
        },
      );
    },
    [sendung, updateSendung],
  );

  const handleRequestDeleteSendung = useCallback(() => {
    if (!sendung) return;
    setConfirmDeleteSendungOpen(true);
  }, [sendung]);

  const handleDeleteSendung = useCallback(() => {
    if (!sendung) return;
    deleteSendung.mutate(sendung.id, {
      onSuccess: () => {
        setConfirmDeleteSendungOpen(false);
        toast.success("Sendung gelöscht");
        onClose();
      },
      onError: () => toast.error("Fehler beim Löschen"),
    });
  }, [deleteSendung, onClose, sendung]);

  if (!sendung) return null;

  const hasCmr = hasText(sendung.cmr_path);
  const marge =
    sendung.verkaufspreis != null && sendung.einkaufspreis != null
      ? sendung.verkaufspreis - sendung.einkaufspreis
      : null;

  const actions = (
    <>
      {onEdit && (
        <Button
          variant="outlined"
          size="sm"
          onClick={() => onEdit(sendung)}
          sx={{
            color: "#57688e",
            borderColor: "#d5dbe8",
            "&:hover": {
              bgcolor: "#f1f5f9",
              borderColor: "#155dfc",
              color: "#155dfc",
            },
          }}
        >
          Bearbeiten
        </Button>
      )}
      <Button
        variant="outlined"
        color="danger"
        size="sm"
        startDecorator={<Trash2 className="h-3.5 w-3.5" />}
        onClick={handleRequestDeleteSendung}
        sx={{ fontWeight: 500 }}
      >
        Sendung löschen
      </Button>
      <Button
        variant="plain"
        color="neutral"
        size="sm"
        onClick={onClose}
        sx={{ color: "#57688e" }}
      >
        Schließen
      </Button>
    </>
  );

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={`Sendung ${sendung.referenz}`}
      actions={actions}
      width={480}
    >
      {/* ── Status + Quick info ───────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4">
        <Chip
          size="sm"
          variant="soft"
          color={
            STATUS_COLORS[sendung.status] as
              | "warning"
              | "primary"
              | "success"
              | "danger"
              | undefined
          }
          sx={{ fontWeight: 600, textTransform: "capitalize" }}
        >
          {sendung.status}
        </Chip>
        {hasCmr && (
          <Chip
            size="sm"
            variant="soft"
            color="success"
            sx={{ fontWeight: 600 }}
          >
            CMR vorhanden
          </Chip>
        )}
      </div>

      {/* ── CMR Document Section ─────────────────────────────────── */}
      <Section title="CMR Dokument" />
      <div className="rounded-lg border border-[#0f172b]/10 bg-[#f8f9fb] p-3">
        {hasCmr ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <FileText className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0f172b] truncate">
                {sendung.cmr_file_name ?? "CMR Dokument"}
              </p>
              <p className="text-[0.65rem] text-[#57688e]">
                Hochgeladen am {formatDate(sendung.cmr_uploaded_at)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="rounded p-1.5 text-[#57688e] hover:bg-[#155dfc]/10 hover:text-[#155dfc] transition-colors"
                title={
                  showPreview ? "Vorschau ausblenden" : "Vorschau anzeigen"
                }
              >
                {showPreview ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleOpenCmr();
                }}
                className="rounded p-1.5 text-[#57688e] hover:bg-[#155dfc]/10 hover:text-[#155dfc] transition-colors"
                title="Öffnen"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRequestDeleteCmr}
                disabled={deleteCmr.isPending}
                className="rounded p-1.5 text-[#57688e] hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                title="CMR löschen"
              >
                <TriangleAlert className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <FileText className="h-6 w-6 mx-auto text-[#57688e]/40 mb-1.5" />
            <p className="text-xs text-[#57688e] mb-2">Kein CMR hochgeladen</p>
            <Button
              size="sm"
              variant="outlined"
              startDecorator={
                uploadCmr.isPending ? (
                  <CircularProgress
                    size="sm"
                    sx={{ "--CircularProgress-size": "14px" }}
                  />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )
              }
              disabled={uploadCmr.isPending}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                color: "#155dfc",
                borderColor: "#155dfc",
                fontSize: "0.75rem",
                "&:hover": { bgcolor: "#155dfc/10" },
              }}
            >
              CMR hochladen
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileSelect}
        />
        {/* Re-upload button when CMR already exists */}
        {hasCmr && (
          <div className="mt-2 pt-2 border-t border-[#0f172b]/5">
            <Button
              size="sm"
              variant="plain"
              startDecorator={
                uploadCmr.isPending ? (
                  <CircularProgress
                    size="sm"
                    sx={{ "--CircularProgress-size": "14px" }}
                  />
                ) : (
                  <Upload className="h-3 w-3" />
                )
              }
              disabled={uploadCmr.isPending}
              onClick={() => fileInputRef.current?.click()}
              sx={{ color: "#57688e", fontSize: "0.7rem", px: 1, py: 0.25 }}
            >
              Erneut hochladen
            </Button>
          </div>
        )}

        {/* CMR Preview */}
        {hasCmr && showPreview && (
          <div className="mt-3 pt-3 border-t border-[#0f172b]/5">
            {previewLoading ? (
              <div className="flex items-center justify-center py-8">
                <CircularProgress size="sm" />
              </div>
            ) : hasText(previewUrl) ? (
              <div className="rounded-md overflow-hidden border border-[#0f172b]/10 bg-white">
                {isPdf ? (
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0`}
                    title="CMR Vorschau"
                    className="w-full border-0"
                    style={{ height: 400 }}
                  />
                ) : (
                  <Image
                    src={previewUrl}
                    alt="CMR Vorschau"
                    width={440}
                    height={400}
                    className="w-full h-auto max-h-100 object-contain"
                    unoptimized
                  />
                )}
              </div>
            ) : (
              <p className="text-[0.65rem] text-[#57688e] text-center py-4">
                Vorschau nicht verfügbar
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Status Management ────────────────────────────────────── */}
      <Section title="Status" />
      <div className="flex items-center gap-2">
        <Typography
          level="body-xs"
          sx={{ color: "#57688e", fontWeight: 500, whiteSpace: "nowrap" }}
        >
          Status ändern:
        </Typography>
        <Select
          size="sm"
          value={sendung.status}
          onChange={handleStatusChange}
          sx={{
            flex: 1,
            "--Select-focusedHighlight": "#155dfc",
            fontSize: "0.75rem",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* ── Route ────────────────────────────────────────────────── */}
      <Section title="Route" />
      <div className="grid grid-cols-2 gap-x-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-green-500" />
            <p className="text-[0.65rem] font-semibold text-[#57688e] uppercase tracking-wide">
              Ladeort
            </p>
          </div>
          <p className="text-xs font-medium text-[#0f172b]">
            {sendung.lade_ort}
          </p>
          <p className="text-[0.65rem] text-[#57688e]">
            {sendung.lade_plz} {sendung.lade_land}
          </p>
          {hasText(sendung.lade_adresse) && (
            <p className="text-[0.65rem] text-[#57688e]">
              {sendung.lade_adresse}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-red-500" />
            <p className="text-[0.65rem] font-semibold text-[#57688e] uppercase tracking-wide">
              Entladeort
            </p>
          </div>
          <p className="text-xs font-medium text-[#0f172b]">
            {sendung.entlade_ort}
          </p>
          <p className="text-[0.65rem] text-[#57688e]">
            {sendung.entlade_plz} {sendung.entlade_land}
          </p>
          {hasText(sendung.entlade_adresse) && (
            <p className="text-[0.65rem] text-[#57688e]">
              {sendung.entlade_adresse}
            </p>
          )}
        </div>
      </div>

      {/* Distance indicator */}
      {(distance != null || distanceLoading === true) && (
        <div className="mt-2 flex items-center gap-2 rounded-md bg-[#f1f5f9] px-3 py-1.5">
          <Truck className="h-3.5 w-3.5 text-[#155dfc] shrink-0" />
          {distanceLoading === true ? (
            <span className="text-[0.7rem] text-[#57688e]">
              Entfernung wird berechnet…
            </span>
          ) : distance != null ? (
            <span className="text-[0.7rem] text-[#0f172b] font-medium">
              {distance.distanceFormatted} &middot; {distance.durationFormatted}{" "}
              Fahrzeit
            </span>
          ) : null}
        </div>
      )}

      {/* ── Zeitfenster ──────────────────────────────────────────── */}
      <Section title="Zeitfenster" />
      <div className="grid grid-cols-2 gap-x-4">
        <InfoRow
          icon={CalendarDays}
          label="Beladung"
          value={formatDateTime(sendung.ladedatum, sendung.ladezeit)}
        />
        <InfoRow
          icon={CalendarDays}
          label="Entladung"
          value={formatDateTime(sendung.entladedatum, sendung.entladezeit)}
        />
      </div>

      {/* ── Ladung ───────────────────────────────────────────────── */}
      <Section title="Ladung" />
      <div className="grid grid-cols-3 gap-x-4">
        <InfoRow
          icon={Weight}
          label="Gewicht"
          value={formatWeight(sendung.gewicht)}
        />
        <InfoRow
          icon={Layers}
          label="Packstücke"
          value={
            sendung.anzahl != null && hasText(sendung.packungseinheit)
              ? `${sendung.anzahl} ${PE_LABELS[sendung.packungseinheit] ?? sendung.packungseinheit}`
              : "—"
          }
        />
        <InfoRow
          label="Lademeter"
          value={sendung.lademeter != null ? `${sendung.lademeter} ldm` : "—"}
        />
      </div>

      {/* ── Beteiligte ───────────────────────────────────────────── */}
      <Section title="Beteiligte" />
      <div className="grid grid-cols-2 gap-x-4">
        <InfoRow
          icon={Building2}
          label="Kunde"
          value={sendung.kunde?.name ?? "—"}
        />
        <InfoRow
          icon={Truck}
          label="Frächter"
          value={sendung.fraechter_name ?? "—"}
        />
      </div>

      {/* ── LKW Details ─────────────────────────────────────────── */}
      <Section title="LKW Details" />
      <div className="grid grid-cols-2 gap-x-4">
        <InfoRow
          icon={Truck}
          label="Kennzeichen"
          value={sendung.truck_kennzeichen ?? "—"}
        />
        <InfoRow label="Interne Ref" value={sendung.truck_interne_ref ?? "—"} />
        <InfoRow label="Fahrer" value={sendung.truck_fahrer ?? "—"} />
        <InfoRow
          label="Telefon Fahrer"
          value={sendung.truck_telefon_fahrer ?? "—"}
        />
        <InfoRow label="Truck Status" value={sendung.truck_status ?? "—"} />
      </div>

      {/* ── Finanzen ─────────────────────────────────────────────── */}
      <Section title="Finanzen" />
      <div className="grid grid-cols-3 gap-x-4">
        <InfoRow icon={Euro} label="VK" value={eur(sendung.verkaufspreis)} />
        <InfoRow label="EK" value={eur(sendung.einkaufspreis)} />
        <InfoRow
          label="Marge"
          value={
            marge != null ? (
              <span
                className={
                  marge >= 0
                    ? "text-emerald-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {eur(marge)}
              </span>
            ) : (
              "—"
            )
          }
        />
      </div>

      {confirmDeleteOpen && (
        <div
          className="fixed inset-0 z-1400 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[#0f172b]/10 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-red-50 p-1.5 text-red-600">
                <TriangleAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172b]">
                  CMR wirklich löschen?
                </p>
                <p className="mt-1 text-xs text-[#57688e]">
                  Diese Aktion entfernt das CMR-Dokument von Sendung{" "}
                  {sendung.referenz}.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="solid"
                loading={deleteCmr.isPending}
                onClick={handleDeleteCmr}
              >
                Ja, löschen
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteSendungOpen && (
        <div
          className="fixed inset-0 z-1400 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setConfirmDeleteSendungOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-[#0f172b]/10 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-red-50 p-1.5 text-red-600">
                <Trash2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172b]">
                  Sendung wirklich löschen?
                </p>
                <p className="mt-1 text-xs text-[#57688e]">
                  Diese Aktion löscht die Sendung {sendung.referenz}.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setConfirmDeleteSendungOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="solid"
                loading={deleteSendung.isPending}
                onClick={handleDeleteSendung}
              >
                Ja, löschen
              </Button>
            </div>
          </div>
        </div>
      )}
    </SlideOver>
  );
}
