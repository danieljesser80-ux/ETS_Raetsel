# Änderungsregister – Weihnachtsfeierspiel

**Dokument-ID:** DOC-007 | **Version:** 0.7 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Änderungssammlung

### 1.1 Regeln für Änderungen

Ab Dokumentversion 0.1 wird jede neue oder geänderte Vorgabe als AEN erfasst. Die initiale Sammlung ist kein nachträglicher Änderungsantrag.

Ein Änderungsantrag enthält mindestens: ID, Datum, Urheber, Beschreibung/Begründung, betroffene KAN, Auswirkungen auf SWA/ARC/UNA/TST, Entscheidung, Umsetzungsstand und Nachweis. Zulässige Zustände: `gesammelt`, `in Analyse`, `zur Entscheidung`, `angenommen`, `abgelehnt`, `umgesetzt`, `verifiziert`.

Eine Annahme ist keine automatische Umsetzung oder Freigabe eines Releases. Angenommene Änderungen aktualisieren das Dokument und die Testabdeckung; ihre frühere Formulierung bleibt über den Änderungsvermerk nachvollziehbar.

### 1.2 Änderungsregister

Organisatorische Änderungen werden ebenfalls erfasst; sie ändern ohne ausdrückliche Entscheidung keine fachlichen Anforderungen.

| ID | Datum | Beschreibung / Begründung | Betroffene IDs / Auswirkungen | Entscheidung | Stand / Nachweis |
|---|---|---|---|---|---|
| AEN-001 | 05.11.2026 | Kunde: „ich folge deinem Vorschlag“. Aufteilung in sieben Dokumente nach Ebenen für übersichtliche, rückverfolgbare Entwicklung. | DOC-001 bis DOC-007; Definitionen KAN/SWA/ARC/UNA/ENT/TST unverändert übernommen, Abschnittsnummern dokumentlokal angepasst; v0.1 archiviert. Keine Spielregel geändert. | Dokumentstruktur vom Kunden angenommen; keine fachliche Baseline-Freigabe | Verifiziert am 05.11.2026: sieben aktive Dokumente, alle 87 bestehenden ID-Definitionen genau einmal erhalten, lokale Dokumentlinks gültig |
| AEN-002 | 05.11.2026 | Kunde: „ich folge deiner Empfehlung“. Tokenbewusste Modellstrategie mit Sonnet 5.5 als Standard, gezieltem Opus 5.5, Haiku 5.5 für einfache Aufgaben und unabhängiger Testentwicklung. | DOC-001 Abschnitt 1.3, DOC-007; keine Änderung an KAN/SWA/ARC/UNA/TST. Getrennte Agentenkontexte bei geeigneten Arbeitspaketen, begrenzter Kontext und gezielte Delegation. | Arbeitsstrategie angenommen; keine fachliche Baseline-Freigabe | Strategie dokumentiert; technische App-Konfiguration ausstehend: Referenzzugriff erfordert interaktive Berechtigung. Noch keine Agenten gestartet, da kein spezifiziertes Implementierungspaket vorliegt. |
| AEN-003 | 05.11.2026 | Kunde: „gehe die Entscheidungen Punkt für Punkt mit mir durch“. Vorbereitende Vorschläge für ENT-001 bis ENT-013. | DOC-002 Abschnitt 3.1, DOC-007; keine Änderung an KAN/SWA/ARC/UNA/TST. | Durch AEN-004 abgelöst | Vorschläge dokumentiert; nicht maßgeblich. |
| AEN-010 | 05.11.2026 | Kunde: „konsistenz immer prüfen“ und „Regel eintragen“. | DOC-001 Abschnitt 5 (Konsistenzregel). | Vom Kunden entschieden | Arbeitsregel für alle Änderungen. |
| AEN-009 | 05.11.2026 | Umsetzung der Baseline (AEN-006) mit getrennt entwickelten Tests: Kernlogik, Datenbankskript und Weboberfläche. Technische Festlegungen: Singleton-Runde; Admin per Code-Hash (`admin_set_code`, Code nicht im Repository); Spieler per Supabase Anonymous Auth; Befehle als SECURITY-DEFINER-Funktionen; Zeitquelle `app_now()` (Testhilfe); Veröffentlichung des Ordners `web` per GitHub Actions. | ARC-001 bis ARC-006 (Detail in `supabase/API.md`, `web/API.md`), UNA-002 bis UNA-009, TST-U/S (Lauf 001). | Umgesetzt (Entwurf) | 228 lokale Tests bestanden. Nicht auf echtem Supabase/Browser geprüft; Wortliste hat 25 statt 28 Wörter (Zählfehler korrigiert). Offen: TST-K, TST-A, TST-S-001/-006, Smartphone-Tests. |
| AEN-008 | 05.11.2026 | Kunde: „lokal entwickeln selbst veröffentlichen“. Repository und Supabase-Projekt angelegt (IDs in DOC-001 Abschnitt 5). | DOC-001 Abschnitt 5. | Vom Kunden entschieden | Kein Copilot-Zugriff auf private Konten; Veröffentlichung durch den Kunden. |
| AEN-007 | 05.11.2026 | Kunde: Einmaliger Einsatz an einem Nachmittag; ein Supabase-Projekt genügt, kein Docker. | DOC-001 Abschnitt 5. | Vom Kunden entschieden | Testumgebung ist das eine Supabase-Projekt; Daten werden vor der Feier zurückgesetzt. |
| AEN-006 | 05.11.2026 | Kunde: „ja freigegeben“ (Wortliste und Baseline der Dokumente v0.5). | DOC-001 bis DOC-007; Wortliste DOC-002 Abschnitt 2.1. | Vom Kunden freigegeben | Gilt für den ersten Release (nur Wortaufgabe). ENT-008 offen, nicht Teil davon. Keine Implementierung, keine Tests, keine Abnahme. |
| AEN-005 | 05.11.2026 | Kunde: Bei 7 oder weniger als 4 Teilnehmern nur Anmeldung erneut öffnen, keine Dreiergruppe. Wortliste (ca. 30 Begriffe) schlägt Copilot vor, Kunde gibt frei. | SWA-007 | Vom Kunden entschieden | Wortliste in DOC-002 Abschnitt 2.1 vom Kunden angepasst; Freigabe ausstehend. |
| AEN-004 | 05.11.2026 | Kunde entscheidet in interaktiver Abstimmung ENT-001 bis ENT-013, außer ENT-008. Wichtige Abweichungen: Gruppen mit 4 bis 6 statt Dreiergruppen; feste Punktetabelle; Rangliste nur Admin/Beamer; bis zu zwei Buchstaben pro Spieler; Wörter aus Automobil und Elektromobilität. | KAN-006, KAN-007, KAN-011, KAN-014, KAN-015; ENT-001 bis ENT-013; SWA-002 bis SWA-014; UNA-005; TST-U-005; ARC-Plattformstatus. | Vom Kunden entschieden | Dokumentiert am 05.11.2026. Offen: ENT-008, Wortliste, Admin-Regel bei 7 oder weniger als 4 Teilnehmern, Vorbereitung der Konten durch den Kunden. Noch nicht umgesetzt oder getestet. |

### 1.3 Dokumenthistorie

| Version | Datum | Inhalt | Freigabe |
|---|---|---|---|
| 0.1 | 05.11.2026 | Initiale Kundenanforderungen, offene Entscheidungen, technische Ableitung, Architekturentwurf, Komponentenverträge, Testanforderungen und Änderungssystem | Ausstehend |
| 0.2 | 05.11.2026 | Aufteilung gemäß AEN-001; sieben aktive Dokumente, unverändertes Archiv v0.1; separate Testprotokolle vorgesehen | Struktur angenommen; fachliche und technische Freigaben ausstehend |
| 0.3 | 05.11.2026 | DOC-001 und DOC-007: angenommene KI-Arbeitsstrategie gemäß AEN-002 und expliziter Konfigurationsstand; übrige Dokumente bleiben v0.2 | Arbeitsstrategie angenommen; Spielregeln und technische Entwürfe unverändert nicht freigegeben |
| 0.4 | 05.11.2026 | AEN-003: Entscheidungsvorschläge in DOC-002 v0.3; DOC-001 bleibt v0.3 und DOC-007 wird v0.4 | Vorschläge nicht freigegeben |
| 0.5 | 05.11.2026 | AEN-004: Kundenentscheidungen in DOC-002 v0.4 und abgeleitete Änderungen in DOC-003 bis DOC-006 v0.3; DOC-001 wird v0.4 | Entscheidungen getroffen; Baseline nicht freigegeben |
| 0.6 | 05.11.2026 | AEN-005 bis AEN-009: Admin-Regel bei 7 Teilnehmern, Wortliste, Baseline-Freigabe, Arbeitsumgebung, Umsetzung und Testlauf 001; Stand der Dokumente DOC-001 (0.5), DOC-004 und DOC-006 (0.4) und DOC-007 (0.6) | Baseline v0.5 freigegeben; Umsetzung Entwurf |
| 0.7 | 05.11.2026 | AEN-010: Konsistenzregel in DOC-001 Abschnitt 5; DOC-001 wird v0.6, DOC-007 v0.7 | Arbeitsregel angenommen |
