"use client";

import { CalendarDays, Euro, Truck } from "lucide-react";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import TabPanel from "@mui/joy/TabPanel";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";
import type { Unternehmen } from "@/hooks/useUnternehmen";
import {
  TruckFormVehicleTab,
  TruckFormPlanningTab,
  TruckFormPricingTab,
} from "./TruckFormTabPanels";

export const truckInputStyles = {
  "--Input-focusedHighlight": "#155dfc",
  color: "#0f172b",
} as const;

export type TruckOperationalStatus =
  | "verfügbar"
  | "geplant"
  | "unterwegs"
  | "beladen"
  | "entladen"
  | "abgeschlossen"
  | "problem";

export const truckStatusOptions: {
  value: TruckOperationalStatus;
  label: string;
  color: string;
}[] = [
  { value: "verfügbar", label: "Verfügbar", color: "#22c55e" },
  { value: "geplant", label: "Geplant", color: "#3b82f6" },
  { value: "unterwegs", label: "Unterwegs", color: "#eab308" },
  { value: "beladen", label: "Beladen", color: "#f97316" },
  { value: "entladen", label: "Entladen", color: "#f97316" },
  { value: "abgeschlossen", label: "Abgeschlossen", color: "#15803d" },
  { value: "problem", label: "Problem", color: "#ef4444" },
];

export function TruckFormField({
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
        {required === true ? " *" : ""}
      </Typography>
      {children}
    </Box>
  );
}

export interface TruckFormTabsSectionProps {
  vehicleTypeOptions: { id: string; label: string }[];
  relationOptions: {
    id: string;
    nummer: string;
    name: string;
    farbe: string | null;
  }[];
  colorOptions: string[];
  licensePlate: string;
  onLicensePlateChange: (value: string) => void;
  freightCarrier: Unternehmen | null;
  onFreightCarrierChange: (value: Unternehmen | null) => void;
  driverName: string;
  onDriverNameChange: (value: string) => void;
  driverPhoneNumber: string;
  onDriverPhoneNumberChange: (value: string) => void;
  vehicleTypeId: string;
  onVehicleTypeIdChange: (value: string) => void;
  selectedColor: string;
  onSelectedColorChange: (value: string) => void;
  loadingDate: string;
  onLoadingDateChange: (value: string) => void;
  loadingTime: string;
  onLoadingTimeChange: (value: string) => void;
  unloadingDate: string;
  onUnloadingDateChange: (value: string) => void;
  unloadingTime: string;
  onUnloadingTimeChange: (value: string) => void;
  relationId: string;
  onRelationIdChange: (value: string) => void;
  status: TruckOperationalStatus;
  onStatusChange: (value: TruckOperationalStatus) => void;
  maximumPallets: string;
  onMaximumPalletsChange: (value: string) => void;
  maximumWeightInKilograms: string;
  onMaximumWeightInKilogramsChange: (value: string) => void;
  loadingMeterCapacity: string;
  onLoadingMeterCapacityChange: (value: string) => void;
  pricePerKilometer: string;
  onPricePerKilometerChange: (value: string) => void;
  purchaseCost: string;
  onPurchaseCostChange: (value: string) => void;
}

export function TruckFormTabsSection(props: TruckFormTabsSectionProps) {
  return (
    <>
      <Divider sx={{ mb: 1 }} />

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

        <TabPanel value={0} sx={{ p: 0 }}>
          <TruckFormVehicleTab {...props} />
        </TabPanel>

        <TabPanel value={1} sx={{ p: 0 }}>
          <TruckFormPlanningTab {...props} />
        </TabPanel>

        <TabPanel value={2} sx={{ p: 0 }}>
          <TruckFormPricingTab {...props} />
        </TabPanel>
      </Tabs>
    </>
  );
}
