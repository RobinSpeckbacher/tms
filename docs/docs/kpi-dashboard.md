---
sidebar_position: 8
---

# KPI-Dashboard & Transporttabelle

Das KPI-Dashboard gibt einen sofortigen Überblick über den aktuellen Betriebszustand. Live-Kennzahlen und eine vollständig filterbare Transporttabelle helfen dabei, Engpässe frühzeitig zu erkennen und die Auslastung im Blick zu behalten.

---

## Dashboard aufrufen

Das Dashboard ist die **Startseite** nach dem Login. Es kann jederzeit über den Navigationspunkt **„Dashboard"** in der Seitenleiste aufgerufen werden.

---

## KPI-Karten

Ganz oben im Dashboard befinden sich die **KPI-Kacheln** mit den wichtigsten Kennzahlen auf einen Blick:

| Kennzahl | Beschreibung |
|---|---|
| **Offene Sendungen** | Anzahl der Sendungen mit Status `Offen` – noch nicht disponiert |
| **Disponierte Transporte** | Sendungen, die einem Fahrzeug zugewiesen wurden |
| **Aktive Fahrzeuge** | Fahrzeuge mit Status `Im Einsatz` |
| **Geliefert heute** | Sendungen, die heute den Status `Geliefert` erhalten haben |
| **Lieferperformance** | Prozentualer Anteil pünktlicher Lieferungen |
| **Auslastung Flotte** | Durchschnittliche Kapazitätsauslastung der Fahrzeuge (%) |

Die Kacheln aktualisieren sich bei jedem Seitenaufruf automatisch mit den neuesten Datenbankwerten.

---

## Transporttabelle

Unterhalb der KPI-Kacheln befindet sich die **Transporttabelle** – eine vollständig interaktive Übersicht aller Sendungen.

### Tabellenspalten

| Spalte | Inhalt |
|---|---|
| **Sendungsnummer** | Eindeutige ID der Sendung |
| **Kunde** | Verknüpfter Kunde |
| **Beladeadresse** | Abholort |
| **Entladeadresse** | Lieferort |
| **Zeitfenster** | Geplantes Be- und Entladedatum |
| **Gewicht (kg)** | Frachtgewicht |
| **Lademeter** | Belegter Laderaum |
| **Fahrzeug** | Zugewiesenes Fahrzeug (oder leer, wenn offen) |
| **Status** | Aktueller Status der Sendung |
| **Verkaufspreis** | Vereinbarter Preis in EUR |

### Sortierung

Ein Klick auf eine **Spaltenüberschrift** sortiert die Tabelle auf- oder absteigend nach diesem Wert. Erneuter Klick kehrt die Reihenfolge um.

### Filterung & Suche

- **Globale Suche:** Das Suchfeld über der Tabelle filtert alle sichtbaren Spalten gleichzeitig.
- **Spaltenfilter:** Einzelne Spalten können über das Filter-Symbol (☰) individuell gefiltert werden (z. B. nur Sendungen mit Status `Disponiert`).
- **Datumsbereich:** Sendungen lassen sich auf einen bestimmten Zeitraum eingrenzen.

### Paginierung

Bei vielen Einträgen wird die Tabelle automatisch seitenweise angezeigt. Über die Steuerelemente unten rechts kann zwischen den Seiten navigiert werden und die Anzahl der Einträge pro Seite angepasst werden.

---

## Sendungsdetail aus der Tabelle öffnen

Ein Klick auf eine Tabellenzeile öffnet das **Sendungsdetail-Panel** mit allen Informationen zur gewählten Sendung – inklusive Bearbeitungsmöglichkeiten, POD-Uploads und Wiederkehrungsoptionen.

---

## Export

Die Transporttabelle kann über die Schaltfläche **„Exportieren"** (oben rechts in der Tabelle) als CSV-Datei heruntergeladen werden – zur weiteren Verarbeitung in Excel oder anderen Tools.
