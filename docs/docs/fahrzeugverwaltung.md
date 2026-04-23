---
sidebar_position: 5
---

# Fahrzeuge erstellen & verwalten

Die Fahrzeugverwaltung bildet das Rückgrat der Disposition. Jedes Fahrzeug kann mit Fahrer, Kennzeichen und Echtzeit-Status gepflegt werden und erscheint automatisch auf der Versandnetzkarte.

---

## Fahrzeugliste aufrufen

1. In der Seitenleiste auf **„Fahrzeuge"** klicken.
2. Es erscheint eine Liste aller erfassten Fahrzeuge mit ihrem aktuellen Status.

---

## Neues Fahrzeug anlegen

1. Oben rechts auf **„+ Fahrzeug anlegen"** klicken.
2. Es öffnet sich das **Fahrzeugformular**:

### Fahrzeugdaten-Formular

| Feld | Beschreibung | Pflichtfeld |
|---|---|---|
| **Kennzeichen** | Amtliches Kfz-Kennzeichen (z. B. `B-TMS 123`) | Ja |
| **Fahrzeugtyp** | z. B. Sattelzug, Koffer, Transporter | Nein |
| **Fahrername** | Name des zugeordneten Fahrers | Nein |
| **Fahrer Telefon** | Mobilnummer des Fahrers | Nein |
| **Max. Lademeter** | Kapazität in Lademeter | Nein |
| **Max. Nutzlast (kg)** | Maximale Zuladung in Kilogramm | Nein |
| **GPS-Breite** | Aktueller Breitengrad (wird auf Karte angezeigt) | Nein |
| **GPS-Länge** | Aktueller Längengrad (wird auf Karte angezeigt) | Nein |
| **Status** | Aktueller Betriebsstatus (siehe unten) | Ja |

### Fahrzeugstatus

| Status | Bedeutung |
|---|---|
| `Verfügbar` | Fahrzeug ist frei und einsatzbereit |
| `Geplant` | Fahrzeug hat zugewiesene Sendungen, noch nicht gestartet |
| `Im Einsatz` | Fahrzeug ist aktiv unterwegs |
| `Außer Betrieb` | Fahrzeug steht aufgrund von Wartung oder Schaden nicht zur Verfügung |

3. Auf **„Speichern"** klicken – das Fahrzeug erscheint sofort in der Liste und auf der Karte.

---

## Fahrzeug bearbeiten

1. In der Fahrzeugliste auf das gewünschte Fahrzeug klicken – das **Fahrzeugdetail-Panel** öffnet sich.
2. Über **„Bearbeiten"** Daten anpassen.
3. Mit **„Speichern"** bestätigen.

Änderungen am Status oder GPS-Koordinaten werden sofort in der Kartenansicht und im Dispositionspanel aktualisiert.

---

## Fahrzeug löschen

- Über das Drei-Punkte-Menü (⋮) des Fahrzeugeintrags auf **„Löschen"** klicken.
- Fahrzeuge mit aktiv zugewiesenen Sendungen sollten vorher aus der Disposition entfernt werden.

---

## GPS-Koordinaten aktualisieren

GPS-Koordinaten können manuell im Bearbeitungsformular hinterlegt oder über eine externe Integration aktualisiert werden. Der Fahrzeug-Marker auf der Versandnetzkarte aktualisiert sich automatisch beim nächsten Laden der Seite.

---

## Fahrzeugdetail-Panel

Ein Klick auf ein Fahrzeug in der Liste oder auf der Karte öffnet das Detailpanel. Es zeigt:

- Alle Stammdaten des Fahrzeugs
- Aktuell zugewiesene Sendungen
- Gesamtstrecke und -kosten der aktuellen Route
- Möglichkeit zum direkten Neuanordnen der Sendungsreihenfolge
