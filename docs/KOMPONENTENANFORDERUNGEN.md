# Komponentenanforderungen – Weihnachtsfeierspiel

**Dokument-ID:** DOC-005 | **Version:** 0.3 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Abgeleitete Unit-/Komponentenanforderungen

**Status: Entwurf, nicht freigegeben.** Ein- und Ausgaben benennen fachliche Verträge; genaue API- und Datentypen werden mit der Architektur festgelegt.

| ID | Komponente / Architektur | Quelle | Vertrag |
|---|---|---|---|
| UNA-001 | Rundenzugang / ARC-001, ARC-002 | SWA-001, SWA-002, SWA-004 | Rundenadresse und lokale Sitzung einlesen; gültigen Einstieg oder expliziten Fehler liefern; vorhandene Identität weiterverwenden. |
| UNA-002 | Teilnehmerregistrierung / ARC-003, ARC-004 | SWA-003, SWA-004, SWA-005 | Identität, Runde und Name annehmen; Phase, Frist, Namensregeln und Kapazität atomar prüfen; Teilnehmer oder fachlichen Ablehnungsgrund liefern. Wiederholung darf nicht duplizieren. |
| UNA-003 | Phasensteuerung und Zeit / ARC-001, ARC-003, ARC-004 | SWA-005, SWA-006, SWA-015 | Autorisierte Übergänge verarbeiten, verbindlichen Endzeitpunkt speichern; Client liefert nichtnegative Restzeit aus synchronisierter Zeitbasis. |
| UNA-004 | Gruppenbildung / ARC-003, ARC-004 | SWA-007 | Geschlossene Teilnehmermenge und freigegebene Einteilungsregeln verarbeiten; vollständige, disjunkte Gruppenzuordnung erzeugen und einmalig persistieren. |
| UNA-005 | Wort-/Buchstabenzuweisung / ARC-003, ARC-004, ARC-005 | SWA-008, SWA-010 | Passendes Wort und Mitgliedermenge verarbeiten; ein bis zwei Buchstaben je Mitglied zuweisen; Wortlänge liegt zwischen Gruppengröße und doppelter Gruppengröße; Multimenge der Buchstaben entspricht dem Wort; Lösung bleibt geheim. |
| UNA-006 | Antwortannahme und Rang / ARC-003, ARC-004, ARC-005 | SWA-009 bis SWA-011 | Identität, Aufgabe und Antwort verarbeiten; Berechtigung und Lösung prüfen; einmaliges Gruppenergebnis mit eindeutigem Platz atomar erzeugen. |
| UNA-007 | Punkteberechnung / ARC-003, ARC-004 | SWA-012 | Platz und freigegebene Punktekonfiguration verarbeiten; deterministische Punkte liefern und zusammen mit dem ersten Ergebnis persistieren. |
| UNA-008 | Spielerzustand und Synchronisierung / ARC-001, ARC-005, ARC-006 | SWA-002, SWA-008, SWA-013, SWA-014 | Berechtigten Zustand anzeigen; Änderungen und Wiederverbindung verarbeiten; keine fremden persönlichen Buchstaben/geheimen Lösungen offenlegen; Verbindungsfehler sichtbar machen. |
| UNA-009 | Adminrechte und Datenlebenszyklus / ARC-002 bis ARC-005 | SWA-014, SWA-015 | Adminidentität für Steuer-/Löschaktionen prüfen; unberechtigte Aktionen ohne Zustandsänderung abweisen; freigegebene Löschregel umsetzen. |
