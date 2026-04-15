"use client";

import { Loader2, Route } from "lucide-react";
import type { SendungRow } from "@/hooks/useSendungen";
import { useTruckRoute } from "@/hooks/useTruckRoute";
import type { UseTruckRouteOptions } from "@/hooks/useTruckRoute";

function hasFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

interface TruckRouteSummarySectionProps extends UseTruckRouteOptions {
  sendungen: SendungRow[];
  preisProKilometer?: number;
  kosten?: number | null;
  /** Plain-text truck home base (city), forwarded as startLocation. */
  standortOrt?: string | null;
}

const labelBadgeRegex = /(.*) \(x(\d+) (Ladepunkte|Entladepunkte)\)$/;

function splitLabelAndBadge(label: string) {
  const match = label.match(labelBadgeRegex);
  if (!match) {
    return { text: label, badge: null };
  }
  return {
    text: match[1],
    badge: `x${match[2]} ${match[3]}`,
  };
}

export function TruckRouteSummarySection({
  sendungen,
  preisProKilometer,
  kosten,
  standortOrt,
  startPosition,
  respectOrder,
}: TruckRouteSummarySectionProps) {
  const startLocation =
    typeof standortOrt === "string" && standortOrt.trim().length > 0
      ? {
          plz: "",
          ort: standortOrt,
          land: "AT",
        }
      : null;

  const { route, isLoading: routeLoading } = useTruckRoute(sendungen, {
    startLocation,
    startPosition,
    respectOrder,
  });

  if (sendungen.length === 0) return null;

  const preisProKmValue = hasFiniteNumber(preisProKilometer)
    ? preisProKilometer
    : 0;

  const sumVerkaufspreis = sendungen.reduce((total, sendung) => {
    return hasFiniteNumber(sendung.verkaufspreis)
      ? total + sendung.verkaufspreis
      : total;
  }, 0);

  const kostenBasis = hasFiniteNumber(kosten)
    ? kosten
    : hasFiniteNumber(route?.totalKm)
      ? preisProKmValue * route.totalKm
      : 0;

  const marge = sumVerkaufspreis - kostenBasis;

  return (
    <div className="px-4 py-3 border-t border-slate-200">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        <Route className="h-3.5 w-3.5" />
        Route
      </h3>

      {routeLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Route wird berechnet…
        </div>
      )}

      {route && (
        <>
          <div className="grid gap-3 mb-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <Route className="h-3.5 w-3.5" />
                </span>
                Distanz
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {route.totalDistanceFormatted}
              </p>
            </div>

            <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <Loader2 className="h-3.5 w-3.5" />
                </span>
                Fahrzeit
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {route.totalDurationFormatted}
              </p>
            </div>

            <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <span className="text-[11px] font-semibold">€</span>
                </span>
                Preis pro km
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {preisProKmValue.toFixed(2)} €/km
              </p>
            </div>

            <div className="rounded-md bg-white border border-slate-200 px-3 py-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <span className="text-[11px] font-semibold">€</span>
                </span>
                Kosten
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {kostenBasis.toFixed(2)} €
              </p>
            </div>
          </div>

          {route.legs.length > 0 && (
            <div className="space-y-1 mb-3">
              {route.legs.map((leg, index) => {
                const isDeadheadLeg = leg.isDeadhead;
                const from = splitLabelAndBadge(leg.from);
                const to = splitLabelAndBadge(leg.to);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] ${
                      isDeadheadLeg
                        ? "bg-orange-50 border border-orange-200"
                        : "bg-white border border-slate-200"
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isDeadheadLeg ? "bg-orange-400" : "bg-emerald-500"
                      }`}
                    />
                    <span className="text-slate-700 truncate">{from.text}</span>
                    {from.badge !== null && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                        {from.badge}
                      </span>
                    )}
                    <span className="text-slate-300">→</span>
                    <span className="text-slate-700 truncate">{to.text}</span>
                    {to.badge !== null && (
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                        {to.badge}
                      </span>
                    )}
                    {isDeadheadLeg && (
                      <span className="text-orange-500 italic text-[10px]">
                        Leerfahrt
                      </span>
                    )}
                    <span className="ml-auto text-slate-500 font-semibold whitespace-nowrap">
                      {leg.distanceKm > 0 ? `${leg.distanceKm} km` : "–"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-2 rounded-md border border-slate-200 overflow-hidden">
            <div className="bg-white px-3 py-2 text-[10px] text-slate-400 uppercase tracking-wider">
              Finanzubersicht
            </div>
            <div className="bg-white px-3 py-2 text-[11px] text-slate-500">
              <div className="space-y-1">
                {sendungen.map((sendung) => {
                  const price = hasFiniteNumber(sendung.verkaufspreis)
                    ? sendung.verkaufspreis
                    : 0;
                  const ref = sendung.referenz || "Sendung";
                  return (
                    <div
                      key={sendung.id}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate text-slate-600">
                        {ref}
                        {sendung.lade_ort && sendung.entlade_ort
                          ? ` · ${sendung.lade_ort} → ${sendung.entlade_ort}`
                          : ""}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {price.toFixed(2)} €
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-2 text-xs">
              <span className="text-slate-500">Umsatz</span>
              <span className="font-semibold text-slate-700">
                {sumVerkaufspreis.toFixed(2)} €
              </span>
            </div>
            <div
              className={`flex items-center justify-between px-3 py-2 text-xs ${
                marge >= 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              <span className="font-semibold">Marge</span>
              <span className="font-bold">{marge.toFixed(2)} €</span>
            </div>
          </div>
          {(sumVerkaufspreis === 0 || kostenBasis === 0) && (
            <p className="mt-1 text-[10px] text-slate-400">
              {sumVerkaufspreis === 0 ? "Keine Verkaufspreise erfasst." : ""}
              {sumVerkaufspreis === 0 && kostenBasis === 0 ? " " : ""}
              {kostenBasis === 0 ? "Keine Truck-Kosten erfasst." : ""}
            </p>
          )}
        </>
      )}

      {!route && !routeLoading && (
        <p className="text-xs text-slate-400">
          Route konnte nicht berechnet werden.
        </p>
      )}
    </div>
  );
}
