"use client";

import dayjs from "dayjs";

export function formatIsoDate(isoDate: string | null) {
  const normalizedIsoDate = typeof isoDate === "string" ? isoDate.trim() : null;
  if (normalizedIsoDate === null || normalizedIsoDate === "") return "—";
  return dayjs(normalizedIsoDate).format("DD.MM.YYYY");
}

export function formatIsoDateTime(
  dateValue: string | null,
  timeValue: string | null,
) {
  const normalizedDate =
    typeof dateValue === "string" ? dateValue.trim() : null;
  if (normalizedDate === null || normalizedDate === "") return "—";

  const dateLabel = dayjs(normalizedDate).format("DD.MM.YYYY");
  const normalizedTime =
    typeof timeValue === "string" ? timeValue.trim() : null;
  if (normalizedTime === null || normalizedTime === "") return dateLabel;

  return `${dateLabel} ${normalizedTime.slice(0, 5)}`;
}

export function hasTextValue(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function formatEuroValue(value: number | null | undefined) {
  if (value == null) return "—";
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

export function formatWeightValue(kgValue: number | null) {
  if (kgValue == null) return "—";
  return kgValue >= 1000
    ? `${(kgValue / 1000).toFixed(kgValue % 1000 === 0 ? 0 : 1)} t`
    : `${kgValue} kg`;
}

export const packagingUnitLabels: Record<string, string> = {
  europalette: "Europalette",
  industriepalette: "Industriepalette",
  gitterbox: "Gitterbox",
  colli: "Colli",
  sonstige: "Sonstige",
};

export const sendungStatusOptions = [
  { value: "offen", label: "Offen" },
  { value: "zugewiesen", label: "Zugewiesen" },
  { value: "unterwegs", label: "Unterwegs" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "storniert", label: "Storniert" },
];

export const sendungStatusColorMap: Record<string, string> = {
  offen: "warning",
  zugewiesen: "primary",
  unterwegs: "primary",
  abgeschlossen: "success",
  storniert: "danger",
};

export function SendungDetailInfoRow({
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

export function SendungDetailSectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[#0f172b]/10 pb-1 mb-2 mt-4 first:mt-0">
      <p className="text-[0.7rem] font-semibold text-[#0f172b] uppercase tracking-wide">
        {title}
      </p>
    </div>
  );
}
