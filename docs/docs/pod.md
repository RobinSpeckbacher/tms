---
sidebar_position: 9
---

# POD – Proof of Delivery (Liefernachweis)

Der **Proof of Delivery (POD)** – auf Deutsch Liefernachweis – ist die digitale Bestätigung einer erfolgreich abgeschlossenen Lieferung. Im TMS können POD-Dokumente direkt an eine Sendung angehängt werden: als Foto, CMR-Scan oder sonstige Datei.

---

## Was ist ein POD?

Ein POD dokumentiert, dass eine Sendung beim Empfänger angekommen ist. Typische POD-Dokumente sind:

- **Unterschriebener CMR-Frachtbrief** (Scan oder Foto)
- **Lieferfoto** (z. B. Foto der abgestellten Ware)
- **Schadensdokumentation** (Fotos bei Transportschäden)
- **Empfangsbestätigung** des Kunden

---

## POD erstellen (CMR-Dokument generieren)

Das TMS kann automatisch einen **CMR-Frachtbrief** als PDF generieren:

1. Eine Sendung in der Tabelle oder im Dashboard anklicken – das **Sendungsdetail-Panel** öffnet sich.
2. Im Panel auf **„CMR generieren"** klicken.
3. Das System befüllt das CMR-Formular automatisch mit den Sendungsdaten:
   - Absender (Beladeadresse)
   - Empfänger (Entladeadresse)
   - Frachtbeschreibung (Gewicht, Lademeter, Verpackungsart)
   - Kundendaten und Referenznummer
4. Das fertige PDF öffnet sich im Browser und kann **heruntergeladen oder gedruckt** werden.

> Der CMR-Frachtbrief erfüllt die Anforderungen der CMR-Konvention und kann direkt für den internationalen Straßengüterverkehr verwendet werden.

---

## POD hochladen

Sobald die Lieferung abgeschlossen ist, kann der unterschriebene Liefernachweis direkt an die Sendung angehängt werden:

### Schritt-für-Schritt

1. Die betreffende Sendung im Dashboard oder in der Tabelle öffnen.
2. Im **Sendungsdetail-Panel** nach unten scrollen zum Abschnitt **„Dokumente / POD"**.
3. Auf **„Datei hochladen"** klicken oder die Datei per **Drag-and-Drop** in den Upload-Bereich ziehen.
4. Unterstützte Formate: `JPG`, `PNG`, `PDF`, `WEBP`
5. Nach dem Upload erscheint das Dokument als Vorschau-Thumbnail oder Download-Link im Panel.

### Mehrere Dateien

Es können mehrere Dateien pro Sendung hochgeladen werden – z. B. sowohl ein CMR-Scan als auch ein Lieferfoto.

---

## POD anzeigen & herunterladen

Hochgeladene POD-Dateien sind jederzeit über das Sendungsdetail-Panel abrufbar:

1. Sendung öffnen.
2. Im Abschnitt **„Dokumente / POD"** auf das Thumbnail oder den Dateinamen klicken.
3. Die Datei öffnet sich direkt im Browser (Bilder als Vollbild, PDFs im PDF-Viewer).
4. Über das Download-Symbol kann die Datei lokal gespeichert werden.

---

## Technische Details

| Detail | Beschreibung |
|---|---|
| **Speicherort** | Supabase Storage (sicher, verschlüsselt, zugriffsgeschützt) |
| **Zugriff** | Nur angemeldete Nutzer mit entsprechenden Rechten |
| **Dateigröße** | Maximal 10 MB pro Datei |
| **Dateitypen** | JPG, PNG, WEBP, PDF |

---

## Status aktualisieren

Nach erfolgreichem POD-Upload empfiehlt es sich, den Sendungsstatus auf **„Geliefert"** zu setzen:

1. Im Sendungsdetail-Panel auf **„Status ändern"** klicken.
2. **„Geliefert"** auswählen und bestätigen.
3. Die Sendung wird in der KPI-Tabelle als abgeschlossen gezählt.
