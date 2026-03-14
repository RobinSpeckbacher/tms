"use client";

import { Fragment, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Marker,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Truck, Shipment } from "@/types/planning";

// ── Truck icon (blue truck SVG as data-uri) ──────────────────────────────
const truckIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:32px; height:32px; border-radius:50%; background:#1d4ed8;
    display:flex; align-items:center; justify-content:center;
    border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,.3);
  "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// ── Colors ───────────────────────────────────────────────────────────────
const PICKUP_COLOR = "#16a34a"; // green-600
const DELIVERY_COLOR = "#dc2626"; // red-600

const DE_CENTER: [number, number] = [51.1657, 10.4515];

interface DashboardMapProps {
  trucks: Truck[];
  shipments: Shipment[];
}

/**
 * OpenStreetMap-based overview map.
 * Renders:
 *  - Blue truck markers for each truck with a known position
 *  - Green circle markers for loading points (Ladeorte)
 *  - Red circle markers for unloading points (Entladeorte)
 */
export function DashboardMap({ trucks, shipments }: DashboardMapProps) {
  // Deduplicate points by city name to avoid stacking
  const { pickups, deliveries } = useMemo(() => {
    const pickupMap = new Map<string, [number, number]>();
    const deliveryMap = new Map<string, [number, number]>();
    for (const s of shipments) {
      if (s.ladeortCoords) pickupMap.set(s.ladeort, s.ladeortCoords);
      if (s.entladeortCoords) deliveryMap.set(s.entladeort, s.entladeortCoords);
    }
    return {
      pickups: Array.from(pickupMap.entries()),
      deliveries: Array.from(deliveryMap.entries()),
    };
  }, [shipments]);

  return (
    <MapContainer
      center={DE_CENTER}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ── Truck markers ── */}
      {trucks.map((t) =>
        t.position ? (
          <Marker key={t.id} position={t.position} icon={truckIcon}>
            <Tooltip direction="top" offset={[0, -18]}>
              <strong>{t.licensePlate}</strong>
              <br />
              {t.driverName} · {t.status}
            </Tooltip>
          </Marker>
        ) : null,
      )}

      {/* ── Loading points (green) ── */}
      {pickups.map(([name, coords]) => (
        <Fragment key={`p-${name}`}>
          <CircleMarker
            center={coords}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: PICKUP_COLOR,
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <span style={{ color: PICKUP_COLOR, fontWeight: 600 }}>
                Ladeort
              </span>
              <br />
              {name}
            </Tooltip>
          </CircleMarker>
        </Fragment>
      ))}

      {/* ── Unloading points (red) ── */}
      {deliveries.map(([name, coords]) => (
        <Fragment key={`d-${name}`}>
          <CircleMarker
            center={coords}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: DELIVERY_COLOR,
              fillOpacity: 0.9,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              <span style={{ color: DELIVERY_COLOR, fontWeight: 600 }}>
                Entladeort
              </span>
              <br />
              {name}
            </Tooltip>
          </CircleMarker>
        </Fragment>
      ))}
    </MapContainer>
  );
}
