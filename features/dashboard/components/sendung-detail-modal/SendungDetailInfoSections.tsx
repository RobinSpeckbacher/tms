"use client";

import {
  MapPin,
  CalendarDays,
  Weight,
  Layers,
  Building2,
  Truck,
  Euro,
} from "lucide-react";
import type { EnrichedSendung } from "../ShipmentsTable";
import type { DistanceResult } from "@/services/distanceService";
import {
  formatEuroValue,
  formatIsoDateTime,
  formatWeightValue,
  hasTextValue,
  packagingUnitLabels,
  SendungDetailInfoRow,
  SendungDetailSectionHeader,
} from "./SendungDetailPresentation";

interface SendungDetailInfoSectionsProps {
  sendung: EnrichedSendung;
  distance: DistanceResult | null | undefined;
  distanceLoading: boolean;
}

export function SendungDetailInfoSections({
  sendung,
  distance,
  distanceLoading,
}: SendungDetailInfoSectionsProps) {
  const margin =
    sendung.verkaufspreis != null && sendung.einkaufspreis != null
      ? sendung.verkaufspreis - sendung.einkaufspreis
      : null;

  return (
    <>
      {/* ── Route ──────────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="Route" />
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
          {hasTextValue(sendung.lade_adresse) && (
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
          {hasTextValue(sendung.entlade_adresse) && (
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
              {distance.distanceFormatted} &middot;{" "}
              {distance.durationFormatted} Fahrzeit
            </span>
          ) : null}
        </div>
      )}

      {/* ── Zeitfenster ──────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="Zeitfenster" />
      <div className="grid grid-cols-2 gap-x-4">
        <SendungDetailInfoRow
          icon={CalendarDays}
          label="Beladung"
          value={formatIsoDateTime(sendung.ladedatum, sendung.ladezeit)}
        />
        <SendungDetailInfoRow
          icon={CalendarDays}
          label="Entladung"
          value={formatIsoDateTime(sendung.entladedatum, sendung.entladezeit)}
        />
      </div>

      {/* ── Ladung ───────────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="Ladung" />
      <div className="grid grid-cols-3 gap-x-4">
        <SendungDetailInfoRow
          icon={Weight}
          label="Gewicht"
          value={formatWeightValue(sendung.gewicht)}
        />
        <SendungDetailInfoRow
          icon={Layers}
          label="Packstücke"
          value={
            sendung.anzahl != null && hasTextValue(sendung.packungseinheit)
              ? `${sendung.anzahl} ${packagingUnitLabels[sendung.packungseinheit] ?? sendung.packungseinheit}`
              : "—"
          }
        />
        <SendungDetailInfoRow
          label="Lademeter"
          value={sendung.lademeter != null ? `${sendung.lademeter} ldm` : "—"}
        />
      </div>

      {/* ── Beteiligte ───────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="Beteiligte" />
      <div className="grid grid-cols-2 gap-x-4">
        <SendungDetailInfoRow
          icon={Building2}
          label="Kunde"
          value={sendung.kunde?.name ?? "—"}
        />
        <SendungDetailInfoRow
          icon={Truck}
          label="Frächter"
          value={sendung.fraechter_name ?? "—"}
        />
      </div>

      {/* ── LKW Details ──────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="LKW Details" />
      <div className="grid grid-cols-2 gap-x-4">
        <SendungDetailInfoRow
          icon={Truck}
          label="Kennzeichen"
          value={sendung.truck_kennzeichen ?? "—"}
        />
        <SendungDetailInfoRow
          label="Interne Ref"
          value={sendung.truck_interne_ref ?? "—"}
        />
        <SendungDetailInfoRow
          label="Fahrer"
          value={sendung.truck_fahrer ?? "—"}
        />
        <SendungDetailInfoRow
          label="Telefon Fahrer"
          value={sendung.truck_telefon_fahrer ?? "—"}
        />
        <SendungDetailInfoRow
          label="Truck Status"
          value={sendung.truck_status ?? "—"}
        />
      </div>

      {/* ── Finanzen ─────────────────────────────────────────────────── */}
      <SendungDetailSectionHeader title="Finanzen" />
      <div className="grid grid-cols-3 gap-x-4">
        <SendungDetailInfoRow
          icon={Euro}
          label="VK"
          value={formatEuroValue(sendung.verkaufspreis)}
        />
        <SendungDetailInfoRow
          label="EK"
          value={formatEuroValue(sendung.einkaufspreis)}
        />
        <SendungDetailInfoRow
          label="Marge"
          value={
            margin != null ? (
              <span
                className={
                  margin >= 0
                    ? "text-emerald-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {formatEuroValue(margin)}
              </span>
            ) : (
              "—"
            )
          }
        />
      </div>
    </>
  );
}
