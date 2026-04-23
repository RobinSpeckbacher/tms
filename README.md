<div align="center">

# TMS – Transportmanagementsystem

**Eine moderne, fullstack Transportmanagementplattform zur Planung, Disposition und Echtzeit-Verfolgung von Logistikprozessen.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

<!-- PROJEKT DEMO VIDEO -->
> **Vollständige Demo**

https://github.com/user-attachments/assets/REPLACE_WITH_VIDEO_ID

*Die obige Zeile durch die GitHub-Asset-URL der eigenen `.mp4`-Demovideo ersetzen.*

---

</div>

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Funktionen](#funktionen)
  - [Sendungserstellung](#1-sendungserstellung)
  - [Fahrzeugverwaltung](#2-fahrzeugverwaltung)
  - [Kundenverwaltung](#3-kundenverwaltung)
  - [KPI-Dashboard & Tabellen](#4-kpi-dashboard--tabellen)
  - [Transportorganisation](#5-transportorganisation)
  - [Automatische Routenberechnung](#6-automatische-routenberechnung)
  - [Wiederkehrende Aufträge](#7-wiederkehrende-aufträge)
  - [Bildupload](#8-bildupload)
- [Technologie-Stack](#technologie-stack)
- [Erste Schritte](#erste-schritte)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Projektstruktur](#projektstruktur)

---

## Überblick

TMS ist ein internes Transportmanagementsystem für Logistikteams, die Sendungen, Fahrzeuge, Fahrer und Routen über eine einheitliche Oberfläche koordinieren müssen. Entwickelt mit Next.js und Supabase bietet es Echtzeit-Updates, interaktive Karten, automatische Routenoptimierung und exportierbare CMR-Dokumente – alles in einer übersichtlichen, responsiven Benutzeroberfläche.

---

## Funktionen

### 1. Sendungserstellung

Detaillierte Sendungen in Sekunden anlegen. Be- und Entladeorte, Frachtdaten (Gewicht, Volumen, Lademeter, Verpackungsart), Kundenreferenz, Verkaufspreis und Zeitfenster – alles in einem strukturierten Formular.

![Sendungserstellung](docs/assets/screenshots/sendungserstellung.png)

> **Bild hinzufügen:** Screenshot des Sendungserstellungs-Modals aufnehmen und unter `docs/assets/screenshots/sendungserstellung.png` speichern.

---

### 2. Fahrzeugverwaltung

Die gesamte Fahrzeugflotte erfassen und verwalten. Jeder Eintrag speichert Kennzeichen, Fahrername, aktuellen Status (`verfügbar`, `geplant`, `im Einsatz`) sowie Live-GPS-Koordinaten, die direkt auf der Karte erscheinen.

![Fahrzeugverwaltung](docs/assets/screenshots/truck-management.png)

> **Bild hinzufügen:** Screenshot der Fahrzeugliste bzw. des Erstellungsdialogs unter `docs/assets/screenshots/truck-management.png` speichern.

---

### 3. Kundenverwaltung

Eine zentrale Kundendatenbank pflegen. Kunden werden mit Sendungen verknüpft – für lückenlose Nachverfolgung, Auswertungen und automatisches Vorausfüllen von Dokumenten.

![Kundenverwaltung](docs/assets/screenshots/customer-management.png)

> **Bild hinzufügen:** Screenshot des Kundenerstellungs-Dialogs unter `docs/assets/screenshots/customer-management.png` speichern.

---

### 4. KPI-Dashboard & Tabellen

Einen Live-Überblick über den Betrieb erhalten. Das Dashboard zeigt Kennzahlen – offene Sendungen, zugewiesene Transporte, aktive Fahrzeuge und Lieferperformance – unterstützt durch eine vollständig sortier- und filterbare Datentabelle auf Basis von TanStack Table.

![KPI-Dashboard](docs/assets/screenshots/kpi-dashboard.png)

> **Bild hinzufügen:** Screenshot der Dashboard-Übersicht mit KPI-Karten und Transporttabelle unter `docs/assets/screenshots/kpi-dashboard.png` speichern.

---

### 5. Transportorganisation

Sendungen per Drag-and-Drop Fahrzeugen zuweisen. Sendungen sind farblich nach Status kodiert und können innerhalb des Fahrzeugplans neu angeordnet werden. Das Dispositionspanel aktualisiert die Karte in Echtzeit.

![Transportorganisation](docs/assets/screenshots/transport-organisation.png)

> **Bild hinzufügen:** Screenshot des Dispositionspanels mit sichtbaren Drag-and-Drop-Spalten unter `docs/assets/screenshots/transport-organisation.png` speichern.

---

### 6. Automatische Routenberechnung

Nach der Zuweisung berechnet TMS automatisch die optimale Route mithilfe der **OSRM**-Routing-Engine. Der berechnete Streckenverlauf wird als interaktiver Leaflet-Kartenoverlay dargestellt – inklusive Wegpunkten und Gesamtdistanz.

![Routenberechnung](docs/assets/screenshots/route-calculation.png)

> **Bild hinzufügen:** Screenshot der Versandnetz-Kartenansicht mit sichtbarer Routenlinie unter `docs/assets/screenshots/route-calculation.png` speichern.

---

### 7. Wiederkehrende Aufträge

Manuelle Arbeit reduzieren, indem Sendungen als wiederkehrende Aufträge angelegt werden. Ein Wiederholungsmuster (täglich, wöchentlich, benutzerdefinierte Intervalle) festlegen – TMS generiert zukünftige Sendungen automatisch und hält das Planungsboard stets aktuell.

![Wiederkehrende Aufträge](docs/assets/screenshots/wiederkehrende-auftraege.png)

> **Bild hinzufügen:** Screenshot der Wiederholungs-/Vorlagenkonfiguration unter `docs/assets/screenshots/wiederkehrende-auftraege.png` speichern.

---

### 8. Bildupload

Lieferfotos, CMR-Scans oder Schadensdokumentationen direkt an eine Sendung anhängen. Bilder werden sicher über Supabase Storage gespeichert und sind inline im Sendungsdetail-Panel abrufbar.

![Bildupload](docs/assets/screenshots/image-upload.png)

> **Bild hinzufügen:** Screenshot der Bildupload-Komponente in der Sendungsdetailansicht unter `docs/assets/screenshots/image-upload.png` speichern.

---

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Sprache | TypeScript 5 |
| Authentifizierung | [Clerk](https://clerk.com/) |
| Datenbank | [Supabase](https://supabase.com/) (PostgreSQL) |
| UI-Komponenten | [MUI Joy](https://mui.com/joy-ui/getting-started/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| Karten | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| Routing-Engine | [OSRM](http://project-osrm.org/) |
| Tabellen | [TanStack Table v8](https://tanstack.com/table) |
| Server-State | [TanStack Query v5](https://tanstack.com/query) |
| Drag & Drop | [dnd-kit](https://dndkit.com/) |
| PDF-Generierung | [PDFme](https://pdfme.com/) |
| Animationen | [Motion](https://motion.dev/) |
| Tests | Jest + ts-jest |

---

## Erste Schritte

### Voraussetzungen

- Node.js >= 18
- Ein [Supabase](https://supabase.com/)-Projekt
- Eine [Clerk](https://clerk.com/)-Anwendung

### Installation

```bash
# Repository klonen
git clone https://github.com/YOUR_ORG/tms-projekt.git
cd tms-projekt/tms

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local

# Datenbankmigrationen ausführen
# (SQL-Dateien aus tms/data/ im Supabase-Projekt anwenden)

# Entwicklungsserver starten
npm run dev
```

Anschließend [http://localhost:3000](http://localhost:3000) im Browser öffnen.

---

## Umgebungsvariablen

Eine `.env.local`-Datei im Verzeichnis `tms/` mit folgenden Variablen anlegen:

```env
# Clerk Authentifizierung
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Webhooks (optional)
SVIX_SECRET=whsec_...
```

---

## Projektstruktur

```
tms/
├── app/
│   ├── (auth)/          # Anmelde- und Registrierungsseiten
│   └── (app)/
│       └── dashboard/   # Hauptanwendungs-Shell
├── components/
│   ├── common/          # Geteilte UI-Grundkomponenten
│   ├── layout/          # AppShell, Sidebar, Header
│   └── map/             # Leaflet-Karten-Wrapper
├── features/
│   └── dashboard/       # Alle Dashboard-Feature-Module
│       ├── components/  # Feature-spezifische Komponenten
│       ├── hooks/       # Feature-Hooks
│       └── types/       # Feature-Typdefinitionen
├── services/
│   ├── cmrService.ts    # CMR-Dokumentgenerierung
│   ├── distanceService.ts
│   ├── geocodingService.ts
│   └── osrmService.ts   # Automatische Routenberechnung
├── types/               # Globale TypeScript-Typen
└── data/                # SQL-Migrationsdateien
```

---

<div align="center">

Entwickelt mit Next.js · Betrieben von Supabase · Geroutet durch OSRM

</div>
