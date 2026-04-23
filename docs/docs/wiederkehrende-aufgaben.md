---
sidebar_position: 10
---

# Wiederkehrende Aufgaben (Sendungsvorlagen)

Viele Transportaufträge wiederholen sich regelmäßig – gleiche Strecke, gleicher Kunde, ähnliche Fracht. Mit der Funktion **„Wiederkehrende Aufgaben"** lassen sich Sendungsvorlagen einrichten, die das TMS automatisch in festgelegten Intervallen neu generiert.

---

## Wozu wiederkehrende Aufgaben?

- **Zeitersparnis:** Kein manuelles Neuanlegen gleichartiger Sendungen.
- **Fehlerreduzierung:** Adressen, Frachtdaten und Kundendaten bleiben konsistent.
- **Planungssicherheit:** Das Planungsboard ist stets mit den nächsten Touren vorausgefüllt.

---

## Wiederkehrende Sendung anlegen

Es gibt zwei Wege, eine wiederkehrende Sendung einzurichten:

### Weg 1 – Beim Erstellen einer neuen Sendung

1. Im Sendungsformular (beim Erstellen oder Bearbeiten) den Abschnitt **„Wiederholung"** aufklappen.
2. Die gewünschte Wiederholungsoption auswählen (siehe unten).
3. Sendung speichern – das System generiert die erste Instanz und plant automatisch alle Folgeinstanzen.

### Weg 2 – Über den Vorlagen-Bereich

1. In der Seitenleiste auf **„Vorlagen"** oder **„Wiederkehrende Aufgaben"** klicken.
2. Es erscheint das **Vorlagen-SlideOver-Panel** mit einer Liste aller aktiven Vorlagen.
3. Über **„+ Neue Vorlage"** eine neue Vorlage anlegen.

---

## Wiederholungsmuster konfigurieren

Das TMS unterstützt folgende Wiederholungsintervalle:

| Intervall | Beschreibung | Beispiel |
|---|---|---|
| **Täglich** | Sendung wird jeden Tag neu erstellt | Tägliche Milk-Run-Tour |
| **Wöchentlich** | Sendung wird an bestimmten Wochentagen erstellt | Montags und donnerstags |
| **Monatlich** | Sendung wird einmal pro Monat erstellt | Jeden 1. des Monats |
| **Benutzerdefiniert** | Frei konfiguriertes Intervall in Tagen | Alle 10 Tage |

### Konfigurationsfelder

| Feld | Beschreibung |
|---|---|
| **Wiederholungstyp** | Täglich / Wöchentlich / Monatlich / Benutzerdefiniert |
| **Wochentage** | (nur bei „Wöchentlich") Auswahl der aktiven Wochentage |
| **Intervall in Tagen** | (nur bei „Benutzerdefiniert") Anzahl der Tage zwischen Wiederholungen |
| **Startdatum** | Erster Gültigkeitstag der Vorlage |
| **Enddatum** | Optionales Ablaufdatum (danach werden keine neuen Sendungen mehr generiert) |

---

## Vorlagen verwalten

Im **Vorlagen-SlideOver-Panel** sind alle aktiven Sendungsvorlagen aufgelistet:

| Spalte | Beschreibung |
|---|---|
| **Name / Beschreibung** | Freitext-Bezeichnung der Vorlage |
| **Kunde** | Verknüpfter Kunde |
| **Route** | Belade- und Entladeadresse |
| **Muster** | Konfiguriertes Wiederholungsintervall |
| **Nächste Ausführung** | Datum der nächsten automatisch generierten Sendung |
| **Status** | Aktiv / Pausiert / Abgelaufen |

### Vorlage bearbeiten

1. Auf den Vorlageneintrag klicken.
2. Parameter anpassen (z. B. neues Enddatum, anderes Intervall).
3. Speichern – bestehende, noch nicht ausgeführte Instanzen werden angepasst.

### Vorlage pausieren / deaktivieren

- Über das Toggle-Symbol neben dem Vorlageneintrag kann eine Vorlage **pausiert** werden.
- Pausierte Vorlagen generieren keine neuen Sendungen, bleiben aber erhalten und können später wieder aktiviert werden.

### Vorlage löschen

- Über das Drei-Punkte-Menü (⋮) auf **„Löschen"** klicken.
- Bereits generierte Sendungen bleiben erhalten – nur zukünftige Instanzen werden nicht mehr angelegt.

---

## Automatisch generierte Sendungen

Sendungen, die durch eine Vorlage entstanden sind, erscheinen wie normale Sendungen in der Sendungstabelle und im Dispositionspanel. Sie tragen einen Hinweis **„Aus Vorlage"**, damit sie leicht erkennbar sind.

Sie können wie gewohnt:
- Einem Fahrzeug zugewiesen werden
- Bearbeitet und angepasst werden
- Einen POD erhalten
- Manuell gelöscht werden (ohne die Vorlage zu beeinflussen)

---

## Tipps

- **Regelmäßige Routen vorplanen:** Vorlagen lassen sich Wochen oder Monate im Voraus einrichten – ideal für Planungsrunden mit dem Vertrieb.
- **Enddatum nutzen:** Für saisonale oder befristete Aufträge ein Enddatum hinterlegen, damit keine unerwünschten Sendungen entstehen.
- **Änderungen an Einzelinstanzen:** Das Bearbeiten einer automatisch generierten Sendung hat keine Auswirkung auf die Vorlage oder zukünftige Sendungen.
