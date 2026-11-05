# Übersicht und Rückverfolgbarkeit – Weihnachtsfeierspiel

## 1. Dokumentstand und Vorgehen

| Merkmal | Stand |
|---|---|
| Dokument-ID | DOC-001 |
| Version | 0.6 |
| Datum | 05.11.2026 |
| Status | Baseline für ersten Release freigegeben (AEN-006) |
| Zweck | Gemeinsame Grundlage für Anforderungen, Änderungen, Architektur, Implementierung und Prüfung |
| Einsatz | Private Weihnachtsfeier, maximal 100 Spieler |

Dieses Dokument ist der Einstieg in die maßgebliche, nach Ebenen getrennte Dokumentation. Die freigegebene Dokumentstruktur ersetzt keine fachliche Freigabe. Bestehende Dateien im Arbeitsordner sind durch dieses Dokument weder bewertet noch als Umsetzung anerkannt.

**Statusbegriffe:** „Bestätigt“ bezeichnet eine ausdrücklich genannte Kundenvorgabe. „Abgeleitet“ bezeichnet eine technische Anforderung zur Erfüllung dieser Vorgaben; sie ist noch nicht separat freigegeben. „Vorschlag“ bezeichnet eine mögliche Lösung. „Offen“ erfordert eine Entscheidung. „Freigegeben“ wird erst nach ausdrücklicher Zustimmung verwendet.

### 1.1 Kennzeichnung und Rückverfolgbarkeit

| Präfix | Ebene |
|---|---|
| KAN | Kundenanforderung: Was benötigt der Veranstalter beziehungsweise Spieler? |
| SWA | Softwareanforderung: Welches überprüfbare Verhalten muss die Software liefern? |
| ARC | Architekturentscheidung oder Architekturbaustein |
| UNA | Unit-/Komponentenanforderung: Vertrag eines abgegrenzten Softwarebausteins |
| TST-K | Kundenabnahme-/End-to-End-Test |
| TST-S | Software-/Systemtest |
| TST-A | Architektur-/Integrationstest |
| TST-U | Unit-/Komponententest |
| ENT | Offene Entscheidung |
| AEN | Änderungsantrag nach der initialen Sammlung |

„Unit“ meint hier eine Softwarekomponente mit klarer Verantwortung und Schnittstelle, nicht ausschließlich einen einzelnen Funktionsaufruf.

IDs bleiben dauerhaft stabil und werden nicht neu vergeben. Entfallene Anforderungen bleiben als „entfallen“ mit Begründung erhalten. Änderungen nennen die betroffenen IDs. Die Kette lautet: **KAN → SWA → ARC/UNA → TST**. Architektur und Komponenten dürfen mehrere Anforderungen erfüllen.

### 1.2 Entwicklungsablauf

1. Initiale Kundenanforderungen prüfen, offene Entscheidungen klären und Baseline ausdrücklich freigeben.
2. Änderungen als AEN erfassen, Auswirkungen analysieren und vor Umsetzung entscheiden.
3. Softwareanforderungen mit messbaren Akzeptanzkriterien aus Kundenanforderungen ableiten.
4. Architektur und Komponentenverträge festlegen und mit Anforderungen verknüpfen.
5. Implementieren und Tests auf allen Ebenen ausführen.
6. Ergebnisse und verbleibende Abweichungen dokumentieren; Kundenabnahme und Release ausdrücklich freigeben.

Keine Anforderung gilt allein durch ihre Dokumentation als implementiert oder bestanden. Zum Abschluss müssen auch zusätzliche, nicht rückverfolgbare Funktionen auf unbeabsichtigte Erweiterung des Umfangs geprüft werden.

### 1.3 Freigegebene KI-Arbeitsstrategie

Gemäß AEN-002 ist folgende Arbeitsstrategie angenommen. Sie ist eine organisatorische Vorgabe, keine Freigabe der Spielregeln und keine bereits aktivierte Modellkonfiguration.

| Tätigkeit | Modell | Einsatzregel |
|---|---|---|
| Kunden- und Softwareanforderungen | Sonnet 5.5 | Regeln präzisieren und überprüfbare Kriterien ableiten |
| Architektur | Sonnet 5.5; gezielt Opus 5.5 | Opus nur für klar abgegrenzte schwierige Fragen zu Parallelität, Berechtigungen oder Transaktionen |
| Komponentenverträge und Implementierung | Sonnet 5.5 | Zusammenhängende, begrenzte Arbeitspakete |
| Unabhängige Testentwicklung | Sonnet 5.5 | Erwartetes Verhalten aus freigegebenen Anforderungen und Schnittstellen ableiten |
| Einfache Dokumentpflege und delegierte Testausführung | Haiku 5.5 | Nur eindeutige, begrenzte Aufgaben; gewöhnliche Testbefehle direkt ausführen |

Normalen Kontext statt langen Kontext verwenden. Agenten erhalten nur relevante Dokumentauszüge, IDs, Schnittstellen und ein eindeutiges Abschlusskriterium. Kleine Änderungen werden direkt erledigt, ohne zusätzliche Agenten. Keine dauerhaft laufenden Agenten und keine mehrfachen Reviews ohne konkrete neue Fragestellung. Einsparungen sind tarif- und aufgabenabhängig; diese Regeln garantieren keine bestimmte Token- oder Kostengrenze.

Für geeignete Implementierungspakete sind zwei getrennte Agentenkontexte vorgesehen: Implementierung und unabhängige Testentwicklung. Der Testagent erhält zunächst keine Implementierung, sondern Anforderungen, Komponentenverträge und nötige Testwerkzeugkonfiguration. Er schreibt nicht in Implementierungsdateien; der Implementierungsagent verändert nicht die unabhängig erstellten Tests. Parallele Arbeit nutzt getrennte Dateibereiche. Danach werden Tests gegen die Umsetzung ausgeführt; Abweichungen werden anhand der Anforderungen geklärt, nicht durch bloßes Anpassen der Erwartungen an den Code.

Agenten werden erst gestartet, wenn ein konkretes Arbeitspaket mit ausreichend geklärten Regeln und Schnittstellen vorliegt. Modellwahl für gestartete Agenten wird explizit gemäß dieser Strategie gesetzt, soweit verfügbar. Nicht verfügbare Modelle werden offengelegt; es wird kein stiller Ersatz als identische Konfiguration dargestellt. Das Modell dieser Hauptsitzung bleibt von der App-Auswahl abhängig.

**Technischer Konfigurationsstand:** Noch keine Modellkonfiguration gespeichert. Die Referenz für `.github/github-app.yml` konnte wegen einer erforderlichen, im Autopilot nicht verfügbaren interaktiven Berechtigung nicht abgerufen werden. Ohne bestätigtes Schema werden keine Modellschlüssel erfunden. Die geplante App-Konfiguration muss außerdem auf Anwendbarkeit für diese ordnerbasierte Sitzung geprüft werden.

## 2. Dokumentverzeichnis

Jede ID hat genau eine maßgebliche Definitionsstelle. Querverweise und die Matrix ersetzen diese Definition nicht. Die sieben aktiven Dokumente werden bei Änderungen gemeinsam auf Konsistenz geprüft.

| Dokument-ID | Dokument | Maßgeblicher Inhalt | Version |
|---|---|---|---|
| DOC-001 | [Übersicht und Rückverfolgbarkeit](ANFORDERUNGEN.md) | Vorgehen, KI-Arbeitsstrategie, Statusbegriffe, Dokumentverzeichnis, Matrix und Freigabestand | 0.6 |
| DOC-002 | [Kundenanforderungen](docs/KUNDENANFORDERUNGEN.md) | KAN, ENT, Entscheidungen und Aufgabenideen | 0.4 |
| DOC-003 | [Softwareanforderungen](docs/SOFTWAREANFORDERUNGEN.md) | SWA | 0.3 |
| DOC-004 | [Architektur](docs/ARCHITEKTUR.md) | ARC, Daten-/Zustandsentwurf und Infrastrukturrahmen | 0.4 |
| DOC-005 | [Komponentenanforderungen](docs/KOMPONENTENANFORDERUNGEN.md) | UNA | 0.3 |
| DOC-006 | [Testkonzept und Testspezifikation](docs/TESTSPEZIFIKATION.md) | TST-K, TST-S, TST-A, TST-U und Nachweisregeln | 0.4 |
| DOC-007 | [Änderungsregister](docs/AENDERUNGSREGISTER.md) | AEN und Dokumenthistorie | 0.7 |

Die [ursprüngliche Gesamtsammlung v0.1](docs/archiv/ANFORDERUNGEN-v0.1.md) ist ausschließlich ein historischer, unveränderter Stand und keine aktive Definitionsquelle.

## 3. Rückverfolgbarkeitsmatrix

Diese Matrix fasst die Ableitung zusammen; Detailbeziehungen stehen in den Tabellen oben. Sie wird bei jeder akzeptierten Änderung aktualisiert.

| Kundenanforderungen | Softwareanforderungen | Architektur | Komponenten | Kundenabnahme |
|---|---|---|---|---|
| KAN-001 | SWA-014 | ARC-001, ARC-005 | UNA-009 | TST-K-001 |
| KAN-002 | SWA-003, SWA-013 | ARC-003, ARC-004, ARC-006 | UNA-002, UNA-008 | TST-K-005 |
| KAN-003, KAN-004 | SWA-001 bis SWA-004, SWA-014 | ARC-001 bis ARC-005 | UNA-001, UNA-002, UNA-008, UNA-009 | TST-K-001 |
| KAN-005 | SWA-005, SWA-006, SWA-013, SWA-015 | ARC-001, ARC-003, ARC-004, ARC-006 | UNA-003, UNA-008, UNA-009 | TST-K-001 |
| KAN-006, KAN-007 | SWA-005, SWA-007, SWA-015 | ARC-003, ARC-004 | UNA-003, UNA-004, UNA-009 | TST-K-002 |
| KAN-008, KAN-009, KAN-010 | SWA-002, SWA-004, SWA-007, SWA-008, SWA-013 | ARC-001 bis ARC-006 | UNA-001, UNA-004, UNA-005, UNA-008 | TST-K-002 |
| KAN-011, KAN-012 | SWA-002, SWA-008 bis SWA-010 | ARC-001, ARC-003 bis ARC-005 | UNA-005, UNA-006, UNA-008 | TST-K-003 |
| KAN-013, KAN-014 | SWA-010 bis SWA-013, SWA-015 | ARC-003 bis ARC-006 | UNA-006 bis UNA-009 | TST-K-004 |
| KAN-015 | SWA-016 | Noch abzuleiten | Noch abzuleiten | TST-K-006 |

## 4. Freigabe- und Entwicklungsstand

| Ebene | Stand |
|---|---|
| Kundenanforderungen | Entschieden mit AEN-004; offen sind ENT-008, Wortliste und Admin-Regel bei 7 oder weniger als 4 Teilnehmern |
| Softwareanforderungen | Entwurf, an AEN-004 angepasst |
| Architektur | GitHub Pages + Supabase vom Kunden gewählt (ENT-011); Details Entwurf |
| Komponentenanforderungen | Abgeleiteter Entwurf |
| Implementierung | Erster Entwurf von Kernlogik (`src/core`), Datenbank (`supabase/schema.sql`) und Weboberfläche (`web/`); Verträge in `src/core/API.md`, `supabase/API.md`, `web/API.md`; AEN-009. Nicht auf echtem Supabase/Browser erprobt. |
| Tests | Lauf 001: 228 automatisierte Tests lokal bestanden ([Protokoll](testprotokolle/lauf-001.md)); alle Tests gegen echte Umgebung, Smartphones, Parallelität und Last offen |
| Baseline / Kundenabnahme / Release | Baseline v0.5 für den ersten Release (nur Wortaufgabe) vom Kunden freigegeben am 05.11.2026 (AEN-006); Kundenabnahme und Release nicht erfolgt |

Nächste Schritte beim Kunden: SQL-Skript in Supabase ausführen, Admincode setzen (`select admin_set_code('…')`, Code nicht im Repository), Anonymous Sign-Ins aktivieren, Dateien in das Repository hochladen und Pages auf GitHub Actions stellen (siehe Abschnitt 5). ENT-008 bleibt offen und gehört nicht zum ersten Release.

## 5. Arbeitsumgebung und Voraussetzungen (AEN-007)

| Punkt | Festlegung / Stand |
|---|---|
| Betrieb | Einmaliger Einsatz an einem Nachmittag; danach Projekt und Daten löschen (ENT-012). |
| Supabase | Ein einziges Projekt (Free) für Entwicklung, Test und Feier. Kein zweites Testprojekt. Daten werden vor der Feier zurückgesetzt (Tabellen leeren, Wortliste laden). Docker ist nicht vorhanden und nicht vorgesehen. |
| Hosting | GitHub-Repository mit GitHub Pages, Konto beim Kunden: `danieljesser80-ux/ETS_Raetsel` (privates Konto). Supabase-Projekt-ID `myvknbqoxocpkagjnrjc`, URL `https://myvknbqoxocpkagjnrjc.supabase.co`, publishable Key `sb_publishable_FvEnlcSBsbL8B9By4EeesQ_EZB_2ArP` (öffentlich, darf im Browser stehen). |
| Arbeitsweise | Entwicklung lokal in `C:\Raetsel`; Veröffentlichung (Push, Pages, SQL in Supabase ausführen) macht der Kunde selbst. Copilot erhält keinen Zugriff auf private Konten (die `gh`-CLI ist nur bei einer Firmeninstanz angemeldet). Supabase war vom Entwicklungsrechner nicht erreichbar (SSL-Fehler, vermutlich Firmen-Proxy); automatisierte Tests laufen daher lokal gegen einen Ersatz, End-zu-End-Tests macht der Kunde. |
| Zugangsdaten | Legt der Kunde an und hinterlegt sie selbst (Umgebungsvariablen oder GitHub Secrets); keine Geheimnisse im Chat oder in Dokumenten. Im Browser nur der öffentliche (anon) Schlüssel. |
| Offen beim Kunden | GitHub-Konto/Repository mit Pages; Supabase-Konto/Projekt; Hauptsitzung auf Sonnet 5.5; Autopilot und Freigabe der Befehle. |
| Nur durch Menschen prüfbar | Smartphone-Tests (Chrome, Safari), Kundenabnahme, Lasttest mit 100 Spielern kurz vor der Feier. |
| Vorgehen | Neue Sitzungen starten mit DOC-001; Entscheidungen stehen in DOC-002 Abschnitt 2, Änderungen in DOC-007. |
| Konsistenzregel | Nach jeder Änderung an Dokumenten oder Code wird die Konsistenz geprüft: jede ID genau einmal definiert (Matrix und historische Vorschläge ausgenommen), keine Referenz ohne Definition, lokale Links gültig, Versionen in Kopfzeile, Dokumentverzeichnis und Dokumenthistorie gleich, `npm test` grün. Ergebnis wird berichtet, auch wenn nicht geprüft werden konnte. (AEN-010) |
| Altdateien | index.html, falsch.html, geloest.html, style.css, n8n-* sind nicht bewertet und gehören nicht zur Baseline. |
