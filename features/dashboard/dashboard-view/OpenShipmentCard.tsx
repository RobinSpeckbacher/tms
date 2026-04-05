"use client";

import Image from "next/image";
import dayjs from "dayjs";
import {
  ArrowRight,
  CalendarDays,
  CircleX,
  MapPin,
  MoreVertical,
} from "lucide-react";
import Tooltip from "@mui/joy/Tooltip";
import type { SendungRow } from "@/hooks/useSendungen";

function formatDateTimeLabel(dateValue: string, timeValue?: string | null) {
  const dateLabel = dayjs(dateValue).format("DD.MM.YYYY");
  const timeLabel =
    timeValue != null && timeValue.trim() !== ""
      ? ` ${timeValue.slice(0, 5)}`
      : "";
  return `${dateLabel}${timeLabel}`;
}

function formatAddressLine(
  postalCode?: string | null,
  city?: string | null,
  country?: string | null,
) {
  return [postalCode, city, country].filter(Boolean).join(" ");
}

function buildInitials(name: string) {
  const nameParts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials !== "" ? initials : "U";
}

interface OpenShipmentCardProps {
  sendung: SendungRow;
  onEdit: () => void;
  onCancel: () => void;
  onToggleSelect: (checked: boolean) => void;
  isSelected: boolean;
  isCancelPending?: boolean;
  fallbackCreatorName?: string | null;
  fallbackCreatorAvatarUrl?: string | null;
}

export function OpenShipmentCard({
  sendung,
  onEdit,
  onCancel,
  onToggleSelect,
  isSelected,
  isCancelPending,
  fallbackCreatorName,
  fallbackCreatorAvatarUrl,
}: OpenShipmentCardProps) {
  const creatorName =
    (sendung as SendungRow & { created_by_name?: string | null })
      .created_by_name ?? null;
  const creatorAvatarUrl =
    (sendung as SendungRow & { created_by_avatar_url?: string | null })
      .created_by_avatar_url ?? null;
  const resolvedCreatorName = creatorName ?? fallbackCreatorName ?? "-";
  const resolvedCreatorAvatarUrl = creatorAvatarUrl ?? fallbackCreatorAvatarUrl;

  return (
    <div
      className="group relative flex overflow-hidden rounded-xl border border-[#0f172b]/10 bg-white
                 cursor-grab active:cursor-grabbing hover:border-[#155dfc]/40 hover:shadow-md
                 active:scale-[1.01] transition-all"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", sendung.id);
        event.dataTransfer.effectAllowed = "move";
      }}
    >
      <div className="w-1.5 shrink-0 bg-[#155dfc]" />

      <div className="flex-1 min-w-0 flex flex-col px-3 pt-2 pb-1.5 gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(event) => onToggleSelect(event.target.checked)}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                draggable={false}
                className="h-3.5 w-3.5 rounded border-[#94a3b8] text-[#155dfc] focus:ring-[#155dfc]"
                aria-label={`Sendung ${sendung.referenz} auswählen`}
              />
              <span className="inline-flex text-[10px] font-semibold uppercase tracking-wide text-[#155dfc] bg-[#155dfc]/8 px-1.5 py-0.5 rounded">
                {sendung.status}
              </span>
              <span className="text-[11px] font-semibold text-[#64748b] truncate">
                {sendung.referenz}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              draggable={false}
              disabled={isCancelPending}
              aria-label="Sendung stornieren"
              className="shrink-0 rounded-md p-1 text-red-600 opacity-100 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stornieren"
            >
              <CircleX className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              onMouseDown={(event) => event.stopPropagation()}
              draggable={false}
              aria-label="Sendung bearbeiten"
              className="shrink-0 rounded-md p-1 text-[#57688e] opacity-100
                       hover:bg-[#155dfc]/10 hover:text-[#155dfc] transition-all"
              title="Bearbeiten"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-semibold uppercase tracking-wider text-[#94a3b8]">
            Strecke
          </span>
          <div className="flex items-center gap-1 text-xs text-[#0f172b]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-green-600" />
            <span className="font-medium truncate max-w-24">
              {sendung.lade_ort}
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" />
            <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span className="font-medium truncate">{sendung.entlade_ort}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-[11px] text-[#57688e] truncate">
            A:{" "}
            {sendung.lade_adresse != null && sendung.lade_adresse.trim() !== ""
              ? `${sendung.lade_adresse}, `
              : ""}
            {formatAddressLine(
              sendung.lade_plz,
              sendung.lade_ort,
              sendung.lade_land,
            ) || "-"}
          </p>
          <p className="text-[11px] text-[#57688e] truncate">
            Z:{" "}
            {sendung.entlade_adresse != null &&
            sendung.entlade_adresse.trim() !== ""
              ? `${sendung.entlade_adresse}, `
              : ""}
            {formatAddressLine(
              sendung.entlade_plz,
              sendung.entlade_ort,
              sendung.entlade_land,
            ) || "-"}
          </p>
        </div>

        <div className="mt-0.5 rounded-md border border-[#0f172b]/5 bg-[#f8f9fb] px-2 py-1">
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#334155]">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#57688e]" />
                <p className="truncate">
                  Ladung:{" "}
                  {formatDateTimeLabel(sendung.ladedatum, sendung.ladezeit)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#57688e]" />
                <p className="truncate">
                  Entladung:{" "}
                  {formatDateTimeLabel(
                    sendung.entladedatum,
                    sendung.entladezeit,
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip title={resolvedCreatorName} variant="soft" size="sm">
                <span className="inline-flex">
                  {resolvedCreatorAvatarUrl != null &&
                  resolvedCreatorAvatarUrl.trim() !== "" ? (
                    <Image
                      src={resolvedCreatorAvatarUrl}
                      alt={resolvedCreatorName}
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#155dfc]/15 text-[10px] font-semibold text-[#155dfc]">
                      {buildInitials(resolvedCreatorName)}
                    </div>
                  )}
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
