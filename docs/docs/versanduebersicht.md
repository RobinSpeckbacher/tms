---
sidebar_position: 6
---

# Versandübersicht (Shipping Overview)

Die Versandübersicht – auch **Dispositionspanel** oder **Versandnetz** genannt – ist das zentrale Arbeitswerkzeug für die tägliche Transportplanung. Hier werden offene Sendungen Fahrzeugen zugewiesen, Routen visualisiert und der Betrieb in Echtzeit überwacht.

---

## Versandübersicht öffnen

1. In der Seitenleiste auf **„Versandnetz"** oder **„Karte"** klicken.
2. Die interaktive Kartenansicht wird geladen – Fahrzeugpositionen und bereits berechnete Routen sind sofort sichtbar.

---

## Aufbau der Oberfläche

Die Versandübersicht besteht aus zwei Hauptbereichen:

### Linke Seite – Dispositionspanel

Das Panel zeigt zwei Spalten nebeneinander:

| Spalte | Inhalt |
|---|---|
| **Offene Sendungen** | Alle noch nicht disponierten Sendungen |
| **Fahrzeuge & Touren** | Zugewiesene Sendungen je Fahrzeug |

Jede Sendungskachel zeigt:
- Be- und Entladeadresse
- Frachtgewicht und Lademeter
- Zeitfenster
- Farbliche Statuskodierung

### Rechte Seite – Interaktive Karte

Die Leaflet-Karte zeigt:
- **Fahrzeug-Marker** mit aktuellem GPS-Standort
- **Routenlinien** (berechnet via OSRM) der disponierten Touren
- **Wegpunkte** (Be- und Entladeorte) als Kartenmarkierungen
- **Popup-Infos** bei Klick auf Marker oder Routenlinie

---

## Sendung einem Fahrzeug zuweisen

1. Im Dispositionspanel eine Sendung aus der linken Spalte **„Offene Sendungen"** per **Drag-and-Drop** in die gewünschte Fahrzeugspalte ziehen.
2. Die Sendung wechselt den Status von `Offen` auf `Disponiert`.
3. Die Route des Fahrzeugs wird **automatisch neu berechnet** und auf der Karte aktualisiert.

> Eine Sendung kann auch durch Klick auf sie und Auswahl des Fahrzeugs im Dropdown zugewiesen werden.

---

## Reihenfolge der Sendungen ändern

Innerhalb einer Fahrzeugspalte können Sendungen per **Drag-and-Drop** neu angeordnet werden. Die Routenberechnung berücksichtigt die neue Reihenfolge und aktualisiert Distanz und Kosten automatisch.

---

## Sendung aus Disposition entfernen

- Eine Sendung zurück in die linke Spalte ziehen (Drag-and-Drop).
- Alternativ: Im Sendungsdetail auf **„Zuweisung aufheben"** klicken.
- Der Status wechselt zurück auf `Offen`.

---

## Fahrzeug-Detailpanel

Ein Klick auf ein Fahrzeug in der Karte oder im Dispositionspanel öffnet das **Fahrzeug-Detailpanel** (rechts einblendbar). Es zeigt:

- Fahrzeugstammdaten (Kennzeichen, Fahrername, Kapazität)
- Liste aller zugewiesenen Sendungen in Reihenfolge
- **Gesamtstrecke** der berechneten Route in km
- **Geschätzte Gesamtkosten** (automatisch berechnet)
- Karte mit der vollständigen Routenlinie

---

## Statusfarben

Sendungskacheln sind farblich kodiert:

| Farbe | Status |
|---|---|
| Grau | Offen |
| Blau | Disponiert |
| Orange | In Zustellung |
| Grün | Geliefert |
| Rot | Storniert |
