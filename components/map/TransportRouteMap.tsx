"use client";

import { useEffect, useState, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Transport, TransportStatus } from "@/types";
import {
  fetchDrivingRoute,
  formatDistance,
  formatDuration,
  type OsrmRouteResult,
} from "@/services/osrmService";
import { getCityCoordinates } from "@/utils/cityCoordinates";

// Status → colour mapping (matches StatusBadge colours)
const STATUS_COLOR: Record<TransportStatus, string> = {
  geplant: "#3b82f6",
  zugewiesen: "#f59e0b",
  unterwegs: "#8b5cf6",
  zugestellt: "#22c55e",
  storniert: "#ef4444",
};

const STATUS_LABEL: Record<TransportStatus, string> = {
  geplant: "Geplant",
  zugewiesen: "Zugewiesen",
  unterwegs: "Unterwegs",
  zugestellt: "Zugestellt",
  storniert: "Storniert",
};

interface RouteEntry {
  transportId: string;
  referenceNumber: string;
  status: TransportStatus;
  result: OsrmRouteResult;
  originCoord: [number, number];
  destCoord: [number, number];
  originCity: string;
  destCity: string;
}

interface TransportRouteMapProps {
  transports: Transport[];
}

// Germany center
const DE_CENTER: [number, number] = [51.1657, 10.4515];

export function TransportRouteMap({ transports }: TransportRouteMapProps) {
  const [routes, setRoutes] = useState<RouteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      setLoading(true);
      setFailedCount(0);

      const results = await Promise.allSettled(
        transports.map(async (t): Promise<RouteEntry | null> => {
          const originCoord = getCityCoordinates(t.origin.city);
          const destCoord = getCityCoordinates(t.destination.city);
          if (!originCoord || !destCoord) return null;

          const result = await fetchDrivingRoute(
            { lon: originCoord[1], lat: originCoord[0] },
            { lon: destCoord[1], lat: destCoord[0] },
          );
          if (!result) return null;

          return {
            transportId: t.id,
            referenceNumber: t.referenceNumber,
            status: t.status,
            result,
            originCoord,
            destCoord,
            originCity: t.origin.city,
            destCity: t.destination.city,
          };
        }),
      );

      if (cancelled) return;

      let failed = 0;
      const loaded: RouteEntry[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value !== null) {
          loaded.push(r.value);
        } else {
          failed++;
        }
      }

      setRoutes(loaded);
      setFailedCount(failed);
      setLoading(false);
    }

    loadRoutes();
    return () => {
      cancelled = true;
    };
  }, [transports]);

  // Unique statuses present in loaded routes for the legend
  const legendStatuses = [...new Set(routes.map((r) => r.status))];

  return (
    <div className="flex flex-col gap-0">
      {/* Map */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-white/80 rounded-t-lg gap-2">
            <div className="animate-spin rounded-full h-7 w-7 border-2 border-slate-200 border-t-blue-600" />
            <p className="text-xs text-slate-500">Routen werden berechnet…</p>
          </div>
        )}

        <MapContainer
          center={DE_CENTER}
          zoom={6}
          scrollWheelZoom={false}
          style={{
            height: "420px",
            width: "100%",
            borderRadius: "0.5rem 0.5rem 0 0",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors · Routing by <a href="https://project-osrm.org" target="_blank">OSRM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routes.map((entry) => {
            const color = STATUS_COLOR[entry.status];
            return (
              <Fragment key={entry.transportId}>
                {/* Route polyline */}
                <Polyline
                  positions={entry.result.geometry}
                  pathOptions={{ color, weight: 4, opacity: 0.85 }}
                >
                  <Tooltip sticky>
                    <strong>{entry.referenceNumber}</strong>
                    <br />
                    {entry.originCity} → {entry.destCity}
                    <br />
                    {formatDistance(entry.result.distance)} ·{" "}
                    {formatDuration(entry.result.duration)}
                  </Tooltip>
                </Polyline>

                {/* Origin marker (filled circle) */}
                <CircleMarker
                  center={entry.originCoord}
                  radius={6}
                  pathOptions={{
                    color: "#fff",
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <strong>Abholung</strong>
                    <br />
                    {entry.originCity}
                  </Tooltip>
                </CircleMarker>

                {/* Destination marker (ring) */}
                <CircleMarker
                  center={entry.destCoord}
                  radius={7}
                  pathOptions={{
                    color,
                    weight: 3,
                    fillColor: "#fff",
                    fillOpacity: 1,
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <strong>Zustellung</strong>
                    <br />
                    {entry.destCity}
                  </Tooltip>
                </CircleMarker>
              </Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend + info bar */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg flex flex-wrap items-center gap-x-5 gap-y-2">
        {legendStatuses.length > 0 && (
          <>
            <span className="text-xs text-slate-400 font-medium">Legende:</span>
            {legendStatuses.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 text-xs text-slate-600"
              >
                <span
                  className="inline-block w-3 h-1.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[s] }}
                />
                {STATUS_LABEL[s]}
              </span>
            ))}
          </>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {routes.length} Route{routes.length !== 1 ? "n" : ""} geladen
          {failedCount > 0 && ` · ${failedCount} nicht verfügbar`}
        </span>
      </div>
    </div>
  );
}
