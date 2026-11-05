# Architektur – Weihnachtsfeierspiel

**Dokument-ID:** DOC-004 | **Version:** 0.4 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Architekturentwurf

**Status: Vorschlag.** GitHub Pages plus Supabase ist gemäß ENT-011 die vom Kunden gewählte Zielplattform; Konten gehören dem Kunden. Die Architekturdetails bleiben Entwurf. Kein eigener lokaler Server ist vorgesehen. Ein Internetzugang am Veranstaltungsort ist erforderlich.

| ID | Baustein/Entscheidung | Verantwortung | Zugeordnete SWA |
|---|---|---|---|
| ARC-001 | Statischer Webclient auf GitHub Pages über HTTPS | Einstieg, QR-Zieladresse, mobile Spieleransicht, vorgeschlagene Adminansicht | SWA-001, SWA-002, SWA-006, SWA-008, SWA-013, SWA-015 |
| ARC-002 | Supabase Auth mit anonymen Spielersitzungen; geschützter Adminzugang | Stabile Identität ohne sichtbare Kontoanmeldung, Rollenprüfung; Wiederzugang zu entscheiden | SWA-004, SWA-009, SWA-014, SWA-015 |
| ARC-003 | Serverseitige Befehle über geschützte Datenbankfunktionen; Edge Functions nur bei Bedarf | Anmeldung, Phasenwechsel, Einteilung, Antwortprüfung und atomare Platz-/Punktevergabe | SWA-003, SWA-005, SWA-007, SWA-009 bis SWA-012, SWA-015 |
| ARC-004 | PostgreSQL in Supabase | Persistente Runden-, Teilnehmer-, Gruppen-, Aufgaben- und Ergebnisdaten; Constraints und Transaktionen | SWA-003 bis SWA-005, SWA-007 bis SWA-012, SWA-014 |
| ARC-005 | Zugriffsschutz und getrennte geheime Daten | Row Level Security, eingeschränkte Funktionsrechte, geheime Lösungen außerhalb des Client-Lesezugriffs; keine privilegierten Schlüssel im Frontend/Repository | SWA-008 bis SWA-010, SWA-012, SWA-014, SWA-015 |
| ARC-006 | Supabase Realtime, ergänzender Zustandsabruf bei Einstieg/Wiederverbindung | Eine Verbindung je geöffnetem Spielerclient, Updates bei Änderungen, Countdown lokal | SWA-006, SWA-008, SWA-013 |

### 1.1 Vorgeschlagener Daten- und Zustandsentwurf

- **Runde:** Identität, Phase, Anmeldeschluss, freigegebene Spielkonfiguration.
- **Teilnehmer:** Identität, Runde, Anzeigename, Gruppenzuordnung.
- **Gruppe:** Identität, Runde, Name.
- **Aufgabe/Zuweisung:** Aufgabenidentität, Gruppe, persönliche Buchstaben; geheime Lösung separat geschützt.
- **Gruppenergebnis:** Aufgabe, Gruppe, erste korrekte Annahme, Platz, Punkte; eindeutige Kombination aus Aufgabe und Gruppe sowie Aufgabe und Platz.

Vorgeschlagene Zustandsfolge: `vorbereitet → anmeldung → gruppen_eingeteilt → wortaufgabe_aktiv → aufgabe_abgeschlossen`. Der erste Release enthält nur die Wortaufgabe (ENT-007); weitere Aufgaben sind nicht Teil davon. Erlaubte Übergänge, Auslöser und Fehlerreaktionen werden vor Implementierung spezifiziert.

Der Client darf Anzeigezustand berechnen, aber keine verbindlichen Anmeldefristen, Gruppen, richtigen Antworten, Plätze oder Punkte bestimmen. Für gemeinsame Rangfolgen ist eine transaktionale Serialisierung pro Aufgabe nötig; ein Clientzeitstempel oder Zeitstempel allein reicht nicht.

Umsetzungsdetails (Tabellen, Funktionen, Rückgabeformate) stehen in `supabase/API.md` und `web/API.md` und gelten als Konkretisierung dieser Bausteine (AEN-009).

### 1.2 Infrastrukturrahmen

Die am 05.11.2026 recherchierten Free-Limits sind **externe Randbedingungen, keine Verfügbarkeitszusagen**: GitHub Pages 100 GB monatlicher Datenverkehr als weiches Limit; Supabase 200 gleichzeitige Realtime-Verbindungen, 100 Realtime-Nachrichten pro Sekunde, 500 MB Datenbank und 5 GB ausgehender Datenverkehr.

Updates an viele Empfänger verbrauchen mehrfach Nachrichtenbudget. Ein lokaler Countdown und gezielte statt pauschaler Datenübertragung vermeiden unnötige Last. Mehrere Tabs sowie Admin/Beamer benötigen Reserve. Kostenlose Supabase-Projekte können nach einer Woche Inaktivität pausiert werden.

Vor Release werden aktuelle Limits, Auth-Anmelderaten und Nutzungsbedingungen geprüft. Ein Lasttest muss den tatsächlichen Anmelde- und Nachrichtenpfad prüfen, nicht nur die Teilnehmerzahl in der Datenbank.

Quellen: [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Supabase Preise](https://supabase.com/pricing), [Realtime Limits](https://supabase.com/docs/guides/realtime/limits).
