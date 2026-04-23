---
sidebar_position: 3
---

# Sendungserstellung

In diesem Kapitel wird erklärt, wie eine neue Sendung im TMS angelegt wird.

---

## Neue Sendung anlegen

1. In der linken Seitenleiste auf **„Sendungen"** klicken.
2. Oben rechts auf die Schaltfläche **„+ Sendung erstellen"** klicken.
3. Es öffnet sich das **Sendungsformular** als Modal-Dialog.

---

## Felder im Sendungsformular

Das Formular ist in mehrere Abschnitte gegliedert:

### Allgemeine Informationen

| Feld | Beschreibung | Pflichtfeld |
|---|---|---|
| **Kundennummer / Kunde** | Auswahl aus der Kundendatenbank (Autocomplete) | Ja |
| **Referenznummer** | Interne oder kundeneigene Referenz | Nein |
| **Verkaufspreis** | Berechneter oder vereinbarter Preis in EUR | Nein |

### Be- und Entladeort

| Feld | Beschreibung |
|---|---|
| **Beladeadresse** | Straße, PLZ, Ort des Abholortes |
| **Entladeadresse** | Straße, PLZ, Ort des Lieferortes |
| **Zeitfenster Beladung** | Datum und Uhrzeit (von/bis) |
| **Zeitfenster Entladung** | Datum und Uhrzeit (von/bis) |

> Die Adressen werden automatisch geocodiert – bei der Eingabe erscheinen Vorschläge.

### Frachtdaten

| Feld | Beschreibung | Einheit |
|---|---|---|
| **Gewicht** | Gesamtgewicht der Fracht | kg |
| **Volumen** | Frachtvolumen | m³ |
| **Lademeter** | Belegter Laderaum | LDM |
| **Verpackungsart** | z. B. Palette, Karton, Colli | – |
| **Anzahl Packstücke** | Anzahl der einzelnen Einheiten | Stück |

### Status

Beim Erstellen wird der Status automatisch auf **„Offen"** gesetzt. Mögliche Status-Werte:

| Status | Bedeutung |
|---|---|
| `Offen` | Sendung angelegt, noch nicht disponiert |
| `Disponiert` | Einem Fahrzeug zugewiesen |
| `In Zustellung` | Fahrzeug ist unterwegs |
| `Geliefert` | Zustellung bestätigt |
| `Storniert` | Sendung abgebrochen |

---

## Sendung speichern

Nach Ausfüllen aller Pflichtfelder auf **„Speichern"** klicken. Die Sendung erscheint sofort in der Sendungstabelle und steht für die Disposition zur Verfügung.

---

## Sendung bearbeiten

1. In der Sendungstabelle auf die gewünschte Zeile klicken – es öffnet sich das **Sendungsdetail-Panel**.
2. Auf **„Bearbeiten"** klicken, Änderungen vornehmen und mit **„Speichern"** bestätigen.

---

## Sendung löschen / stornieren

- Über das Drei-Punkte-Menü (⋮) in der Tabellenzeile kann eine Sendung **storniert** oder **gelöscht** werden.
- Gelöschte Sendungen können nicht wiederhergestellt werden – bitte mit Bedacht verwenden.

---

## Tipps

- **Kundendaten vorausfüllen:** Wird ein bestehender Kunde ausgewählt, werden Adress- und Kontaktdaten automatisch übernommen.
- **Schnellfilter:** Die Tabelle lässt sich nach Status, Datum oder Kunde filtern, um Sendungen schnell zu finden.
