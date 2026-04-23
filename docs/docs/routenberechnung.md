---
sidebar_position: 7
---

# Automatische Routen- und Kostenberechnung

Das TMS berechnet Routen und Transportkosten vollautomatisch – sobald einer Sendung ein Fahrzeug zugewiesen wird. Kein manuelles Nachschlagen, kein Taschenrechner.

---

## Wie funktioniert die Routenberechnung?

Das TMS nutzt die Open-Source-Routing-Engine **OSRM** (Open Source Routing Machine), um für jedes Fahrzeug die optimale Route durch alle zugewiesenen Be- und Entladeorte zu berechnen.

### Ablauf im Hintergrund

1. **Geocodierung:** Jede eingetragene Adresse wird in GPS-Koordinaten (Breiten- und Längengrad) umgewandelt.
2. **Routenanfrage:** Die Koordinaten aller Wegpunkte (in der festgelegten Reihenfolge) werden an OSRM übermittelt.
3. **Streckenverlauf:** OSRM liefert die optimale Route als GeoJSON-Linie zurück.
4. **Darstellung:** Die Linie wird als interaktiver Overlay auf der Leaflet-Karte angezeigt.
5. **Distanz & Kosten:** Aus der Gesamtdistanz wird automatisch der Kostenwert errechnet.

---

## Routenberechnung auslösen

Die Berechnung erfolgt **automatisch** in folgenden Situationen:

- Eine Sendung wird per Drag-and-Drop einem Fahrzeug zugewiesen.
- Die Reihenfolge der Sendungen innerhalb eines Fahrzeugs wird geändert.
- Eine Sendung wird aus der Disposition entfernt oder hinzugefügt.

Eine manuelle Auslösung ist nicht notwendig – das System reagiert in Echtzeit.

---

## Streckendarstellung auf der Karte

Die berechnete Route wird auf der Karte wie folgt visualisiert:

| Element | Beschreibung |
|---|---|
| **Routenlinie** | Farbige Linie entlang der tatsächlichen Straßen |
| **Startmarker** | Erster Beladepunkt des Fahrzeugs |
| **Zwischenstopps** | Alle weiteren Be- und Entladeadressen als nummerierte Marker |
| **Endmarker** | Letzter Entladepunkt der Tour |
| **Popup** | Klick auf Marker oder Linie zeigt Adresse und Stoppdetails |

---

## Kostenberechnung

Aus der ermittelten Gesamtdistanz berechnet das TMS automatisch die geschätzten Transportkosten.

### Berechnungsgrundlage

| Parameter | Beschreibung |
|---|---|
| **Distanz (km)** | Gesamtstrecke der Route, berechnet durch OSRM |
| **Kostensatz (€/km)** | Hinterlegter oder konfigurierter Kilometersatz |
| **Gesamtkosten** | `Distanz × Kostensatz` |

Die berechneten Kosten werden im **Fahrzeug-Detailpanel** angezeigt und können für die Kalkulation des Verkaufspreises genutzt werden.

---

## Anzeige im Fahrzeug-Detailpanel

Das Detailpanel zeigt nach der Routenberechnung:

- **Gesamtstrecke:** z. B. `342 km`
- **Geschätzte Kosten:** z. B. `€ 478,80`
- **Karte** mit vollständiger Routenlinie und allen Stopps
- **Sendungsliste** in Reihenfolge der Tour

---

## Hinweise & Grenzen

- Die Routenberechnung basiert auf dem **Straßennetz** – Fährverbindungen oder Mautrouten können abweichen.
- Bei fehlerhafter oder nicht geocodierbarer Adresse erscheint eine Fehlermeldung im Dispositionspanel.
- Die Kosten sind **Schätzwerte** auf Basis der Distanz; Faktoren wie Maut, Treibstoffpreis oder Wartezeiten sind separat zu berücksichtigen.
