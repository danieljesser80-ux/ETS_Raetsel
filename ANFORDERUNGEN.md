# Übersicht und Rückverfolgbarkeit – Weihnachtsfeierspiel

## 0. Sitzungseinstieg und aktueller Arbeitsstand

**Weihnachtsdekoration (15.11.2026):** Kundenfreigabe für Mix aus realistischen Tannenzweigen, warmen Lichtern und bestehendem Geheimakten-Stil. CSS mit eingebettetem WebP-Ausschnitt aus der freigegebenen Vorschau, Special Elite/Courier Prime unverändert; Spielleiter und beide Bestenlisten, keine Spielregel- oder SQL-Änderung. PR #6 in main (ba8b8e3), Testlauf #65 erfolgreich. Visuelle Kundenabnahme am 15.11.2026: Darstellung weicht von der Vorschau ab, dennoch ausdrücklich abgenommen. Keine weiteren Designkorrekturen gefordert. Einzelprüfungen für 25 Gruppen bei 1920×1080 und Handybreite nicht separat bestätigt.

**Aktuelle Übergabe 15.11.2026:** OFF-065 ist in main (PR #4). OFF-066/067: Kundenfreigabe zur Umsetzung Variante 2; PR #5 in main (d5e82e0), Tests grün. Bestenliste mobil und Projektor, Projektor ein Team je Zeile mit rechter Infospalte; Spielleiter ohne Bestenlistenlink, Live-Gesamtwertung und Aufgabenfortschritt. Bestehender Spieler-Bestenlisten-RPC wird zusätzlich abgefragt; keine SQL-Änderung. Visuelle Prüfung offen. Die nachfolgenden älteren Angaben zu OFF-064 sind historisch.


**Stand: 14.11.2026 (AEN-062).** Dieser Abschnitt ist die maßgebliche kompakte Übergabe für neue Sitzungen, nicht die Freigabe eines Releases. Er ersetzt einen Starttext aus dem Chat. Zuerst diesen Abschnitt, das Dokumentverzeichnis (Abschnitt 2) und die verbindlichen Regeln in `docs\KONFIGURATIONSMANAGEMENT.md` lesen; weitere Quellen nur passend zur konkreten Nutzeraufgabe. Frühere Chats, Sitzungsdateien und historische Änderungsbeschreibungen sind für den normalen Einstieg nicht erforderlich.

| Thema | Aktueller Stand |
|---|---|
| Projekt und Arbeitsweise | Weihnachtsfeier-Rätselspiel in `C:\Raetsel`, ordnerbasiert ohne Git. Statische Weboberfläche in `web\`, Supabase-Schema in `supabase\schema.sql`, Kernlogik in `src\core\`. Kunde veröffentlicht selbst; kein automatischer Upload, Reset oder Live-Spielstart. |
| Kostenbewusste Arbeitsweise | OFF-057/AEN-056: gezielte Kontextauszüge, kleine Aufgaben ohne zusätzliche Agenten, tätigkeitsbezogene Modellstrategie und gebündelte Umsetzung verankert und lokal geprüft. AEN-057 ersetzt auf Kundenauftrag Haiku durch Gemini 3.8 Flash für einfache Aufgaben in Abschnitt 1.3; lokal verifiziert. Nachweise DOC-007 AEN-056/AEN-057. Keine neue Infrastruktur oder geänderten Spiel-/Testregeln. Hauptmodell nicht umgestellt; App-Referenz dokumentiert keine Modellschlüssel, Hauptmodellwahl bleibt beim Kunden. Keine gemessene Ersparnis oder neue Sitzungserprobung. |
| Umsetzung | AEN-053/AEN-054 und AEN-061 abgeschlossen. OFF-064 auf `change/off-064-beamer-difficulty-progress` umgesetzt: kompakte Beamer-Gruppenzeilen mit Live-Punkten, Fortschrittszähler, Schwierigkeits-Tags, 1-s-UI-Rückmeldung (unabhängig von 3-s-Serverdrosselung), freie Admin-Wortauswahl, read-only-Spieler-Beamer und differenzierte Aufgeben-Hinweise. Kein Merge nach `main`, keine Veröffentlichung. |
| Performanceanalyse | AEN-061: OFF-058 bis OFF-061 umgesetzt und lokal verifiziert: Fristprüfung ohne Dauersperre (`expire_game_exclusive`), einmalige Rangberechnung je Status-RPC (`ranking_json`), Render-Skip bei unverändertem Zustand in Spieler-, Beamer- und Adminansicht, Konfigurationsrevision (`config_rev`) und Antwortzähler statt voller Konfiguration im 2-s-Poll. Keine gemessene Beschleunigung: echte Mehrverbindungs-/Lastmessung, `EXPLAIN (ANALYZE, BUFFERS)`, Nutzlastvergleich und Chrome-/Safari-Messung mit 100 Teilnehmern offen. |
| Aufgabenimport | AEN-061: OFF-062/OFF-063 umgesetzt und lokal verifiziert. Format `raetsel-aufgaben/1` in `docs\AUFGABENFORMAT.md` (inklusive KI-Prompt), Parser `web\js\aufgabenformat.js`, RPC `admin_import_tasks` (Vorschau, Übernahme nur in vorbereitet/anmeldung, ersetzt den gesamten Aufgabensatz), Importkarte im Reiter Vorbereitung, aufklappbare Kategorien in der Spieleransicht. Aufgabendatei mit den aktuellen Aufgaben: `C:\Raetsel-geheim\aufgaben.md` (Lösungen für Locker, Lampen, 2× Geocaching und Wissensquiz sowie Geocaching-Bilder fehlen noch; die Vorschau zeigt dazu Warnungen). Kunde bestätigte am 09.11.2026 die Veröffentlichung und die Kundenprüfung der Schritte 1–4 (Import mit Vorschau, Übernahme, Kategorien, Anzeige) als erfolgreich; Lastverhalten nicht geprüft. |
| Lokale/CI-Prüfung | GitHub Actions Lauf 43653360311 vor abschließender Reviewkorrektur: 559/559 Tests bestanden. Danach wurden die bestehende 3-s-Serverdrosselung wiederhergestellt und die Beamer-Authentifizierung/Token-Nachrichtenbehandlung auf den jeweiligen Modus begrenzt; erneuter CI-Lauf steht noch aus. Konsistenz-/Geheimnisprüfung und Smartphoneprüfung nicht ausgeführt. |
| Veröffentlichung | Kunde bestätigt am 08.11.2026 Upload von `web\` auf GitHub `main` und grünen Pages-Lauf sowie Supabase-Schema einschließlich AEN-054. Website: https://danieljesser80-ux.github.io/ETS_Raetsel/ ; Repository `danieljesser80-ux/ETS_Raetsel`; Supabase-Projekt `myvknbqoxocpkagjnrjc`. |
| Reale Einrichtungsprüfung | Kunde bestätigt Cron aktiviert und `automatic_end_ready() = true`, Anonymous Sign-Ins, Adminzugang, erfolgreichen korrigierten Reset und bearbeitbare Vorbereitung. Öffentliche Punktetabelle ohne Fehler und separate Beamerseite bei geöffnetem Admin funktionieren laut Kunde. |
| Gespeicherte Spielkonfiguration | Kunde bestätigt Default-Wortimport und Speicherung, Gruppengröße 4–6, Spielzeit 25 Minuten, Gruppenwort-Schwierigkeit mittel und vereinbarte Staffeln leicht/mittel/schwer; Vorbereitung zeigt „Bereit zum Start“. Countdown beginnt mit Gruppeneinteilung. Live-Konfiguration nicht ungefragt überschreiben; der bestätigte Stand ist keine dauerhafte Live-Messung. |
| Noch offen | OFF-064: erneuten CI-Testlauf nach Reviewkorrekturen abwarten, Konsistenz-/Geheimnisprüfung und Smartphoneprüfung durchführen; anschließend PR prüfen und nur nach ausdrücklicher Freigabe mergen/veröffentlichen. DOC-009 (`docs/KONFIGURATIONSMANAGEMENT.md`) wird hier referenziert, ist im aktuellen Repository-Stand aber nicht vorhanden. Zusätzlich bleiben die bisherigen Generalprobe-, Aufgabeninhalt-, Last-/Gerätemessungs- und Release-Freigaben offen. |
| Baseline | Keine neue Baseline nach AEN-053/AEN-054. BL-008 ist eingefroren, aber nicht freigegeben; die bestätigte Veröffentlichung des aktuellen Arbeitsstands ist keine Veröffentlichung/Freigabe von BL-008. Regeln vor Generalprobe/Feier in DOC-009 beachten; Freigabe nur durch Kunden. |
| Geheimnisse | Lösungen und Default-Wortdatei ausschließlich in `C:\Raetsel-geheim`; Defaultimport aus `gruppenwoerter-default.txt`. Keine Lösungen, Admincodes oder geheimen Schlüssel in Projekt, Chat, Exporte oder Screenshots übernehmen. |
| Aktuelle Anschlussaufgabe | OFF-064 ist auf `change/off-064-beamer-difficulty-progress` umgesetzt und als Draft-PR #2 zur Prüfung geöffnet; Testausführung, Review und Verifikation stehen aus. Die neue Nutzernachricht autorisiert weder Merge nach `main` noch Veröffentlichung, Live-Lasttest oder Datenlöschung. OFF-056 reale Generalprobe bleibt unabhängig offen. |

**Pflege:** Bei Abschluss eines Arbeitspakets, bestätigter Veröffentlichung/Kundenprüfung oder Unterbrechung diesen Abschnitt aktualisieren: tatsächliche Änderungen, Nachweis, offen/blockiert und gegebenenfalls präzise Fortsetzung. Nur belegte Ergebnisse eintragen; Umsetzung, Veröffentlichung und Abnahme nicht gleichsetzen. Details bleiben in ihren maßgeblichen Dokumenten/Testprotokollen, statt Chatverläufe oder Logs zu kopieren. Dauerhafte Einstiegsregeln stehen in `.github\copilot-instructions.md`; DOC-009 wird referenziert, die Datei `docs/KONFIGURATIONSMANAGEMENT.md` fehlt jedoch im aktuellen Repository-Stand.

## 1. Dokumentstand und Vorgehen

| Merkmal | Stand |
|---|---|
| Dokument-ID | DOC-001 |
| Version | 0.63 |
| Datum | 14.11.2026 |
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
| OFF | Änderungsantrag des Kunden mit Status (DOC-008) |
| BL | Baseline: eingefrorener, nachprüfbarer Gesamtstand (DOC-009) |

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

### 1.3 Freigegebene kostenbewusste KI-Arbeitsstrategie

Gemäß AEN-002, OFF-057/AEN-056 und AEN-057 gilt folgende Arbeitsstrategie. Sie ist eine organisatorische Vorgabe, keine Freigabe der Spielregeln und keine bereits aktivierte Modellkonfiguration. Kostenoptimierung berücksichtigt die tatsächliche Tarifabrechnung und Nacharbeit; kleinere Modelle oder weniger Tokens garantieren keine bestimmte Geldersparnis.

| Tätigkeit | Modell | Einsatzregel |
|---|---|---|
| Kunden- und Softwareanforderungen | Sonnet 5.5 | Regeln präzisieren und überprüfbare Kriterien ableiten |
| Architektur | Sonnet 5.5; gezielt Opus 5.5 | Opus nur für klar abgegrenzte schwierige Fragen zu Parallelität, Berechtigungen oder Transaktionen, die den zusätzlichen Aufwand rechtfertigen; keine pauschale zweite Begutachtung |
| Komponentenverträge und Implementierung | Sonnet 5.5 | Zusammenhängende, begrenzte Arbeitspakete |
| Unabhängige Testentwicklung | Sonnet 5.5 | Erwartetes Verhalten aus freigegebenen Anforderungen und Schnittstellen ableiten |
| Einfache Dokumentpflege und delegierte Testausführung | Gemini 3.8 Flash | Nur eindeutige, begrenzte Aufgaben; keinen zusätzlichen Agenten allein für ein günstigeres Modell starten, gewöhnliche Testbefehle direkt ausführen |

**Modellersatz (AEN-057, 09.11.2026):** Kunde verlangt „ersetze Haiku mit Gemini Flash“. Gemeint ist Gemini 3.8 Flash aus der gezeigten Modellauswahl; es ersetzt Haiku 5.5 ausschließlich in der aktiven Strategie für einfache Aufgaben. Historische AEN-/OFF-Einträge bleiben als damalige Entscheidungen erhalten. In der vorgelegten Preistabelle fehlen Preise für Gemini 3.8 Flash; daraus keine belegte Kostenersparnis ableiten. Sichtbare Hauptmodellverfügbarkeit ist keine Garantie der Agentenverfügbarkeit; bei Delegation weiterhin explizit auswählen und fehlende Verfügbarkeit offenlegen. Keine automatische Umschaltung des Hauptmodells.

**Kontextauswahl:** Zum Einstieg DOC-001 nur Abschnitt 0 und 2 sowie DOC-009 lesen; Abschnitt 1.3 bei Fragen zu Arbeitsweise/Modellwahl. Hinweis für diesen Stand: DOC-009 ist im Repository nicht vorhanden; deshalb konnte dessen Inhalt nicht geprüft werden. Anschließend betroffene OFF/KAN/SWA/ARC/UNA/TST anhand ihrer IDs suchen und nur maßgebliche Definitionen, notwendige Querverweise, relevante Codeabschnitte und Nachweise lesen. Ganze OFF-/AEN-Historien, Archive oder vollständige Sitzungsverläufe nicht vorsorglich laden. Definitionen nicht so kürzen, dass Bedingungen oder Ausnahmen verloren gehen. Bereits gelesenen unveränderten Kontext innerhalb einer Sitzung nicht erneut vollständig laden.

**Delegation:** Normalen Kontext statt langen Kontext verwenden. Kleine Aufgaben direkt erledigen; Agenten nur für konkrete größere Pakete einsetzen, deren unabhängige Bearbeitung den zusätzlichen Kontext und Aufruf rechtfertigt. Agenten erhalten nur relevante Dokumentauszüge, IDs, Schnittstellen und ein eindeutiges Abschlusskriterium. Keine dauerhaft laufenden Agenten, doppelten Erkundungen oder mehrfachen Reviews ohne konkrete neue Fragestellung.

Für geeignete Implementierungspakete sind zwei getrennte Agentenkontexte vorgesehen: Implementierung und unabhängige Testentwicklung. Der Testagent erhält zunächst keine Implementierung, sondern Anforderungen, Komponentenverträge und nötige Testwerkzeugkonfiguration. Er schreibt nicht in Implementierungsdateien; der Implementierungsagent verändert nicht die unabhängig erstellten Tests. Parallele Arbeit nutzt getrennte Dateibereiche. Danach werden Tests gegen die Umsetzung ausgeführt; Abweichungen werden anhand der Anforderungen geklärt, nicht durch bloßes Anpassen der Erwartungen an den Code.

Agenten werden erst gestartet, wenn ein konkretes Arbeitspaket mit ausreichend geklärten Regeln und Schnittstellen vorliegt. Modellwahl für gestartete Agenten wird explizit gemäß dieser Strategie gesetzt, soweit verfügbar. Nicht verfügbare Modelle werden offengelegt; es wird kein stiller Ersatz als identische Konfiguration dargestellt. Das Modell dieser Hauptsitzung bleibt von der App-Auswahl abhängig.

**Bündelung:** Änderungswünsche weiterhin bis „umsetzen“ sammeln; alle geklärten offenen Anträge gemeinsam bearbeiten. Zusammengehörige Änderungen je Stufe kohärent bündeln, relevante gemeinsame Definitionen nur einmal prüfen und doppelte Ableitungen vermeiden. Keine zusätzlichen Freigaben zwischen den drei Stufen. Dokumentenkette, Prüfungen nach jeder Änderung, unabhängige Tests bei geeigneten größeren Paketen und Kundenhoheit bleiben erhalten.

**Technischer Konfigurationsstand (09.11.2026):** Die [offizielle App-Konfigurationsreferenz](https://docs.github.com/en/copilot/reference/github-copilot-app-reference/repository-configuration) ist geprüft. Sie dokumentiert keine Schlüssel für Haupt- oder Agentenmodelle. Daher keine erfundene Modellkonfiguration in `.github\github-app.yml` und keine neue Konfigurationsdatei allein für diese Maßnahmen. Die Regeln werden über die bestehende Projektinstruktionsdatei eingebunden; Hauptmodellwahl durch den Kunden in der App, explizite Agentenmodellwahl bei tatsächlicher Delegation. Das Hauptmodell wurde durch AEN-056 nicht umgestellt; Tarifersparnis und Befolgung in künftigen Sitzungen sind nicht gemessen.

## 2. Dokumentverzeichnis

Jede ID hat genau eine maßgebliche Definitionsstelle. Querverweise und die Matrix ersetzen diese Definition nicht. Die sechs im Repository vorhandenen aktiven Dokumente werden bei Änderungen gemeinsam auf Konsistenz geprüft; DOC-009 ist als siebtes Dokument referenziert, fehlt aber im aktuellen Repository-Stand (AEN-022: SWA in DOC-002, UNA in DOC-004 aufgegangen; die Dokument-IDs DOC-003 und DOC-005 sind entfallen und werden nicht neu vergeben).

| Dokument-ID | Dokument | Maßgeblicher Inhalt | Version |
|---|---|---|---|
| DOC-001 | [Übersicht und Rückverfolgbarkeit](ANFORDERUNGEN.md) | Sitzungseinstieg/Arbeitsstand, Vorgehen, KI-Arbeitsstrategie, Statusbegriffe, Dokumentverzeichnis, Matrix und Freigabestand | 0.63 |
| DOC-002 | [Kunden- und Softwareanforderungen](docs/KUNDENANFORDERUNGEN.md) | KAN, ENT, Entscheidungen, Aufgabenideen und SWA | 0.19 |
| DOC-004 | [Architektur und Komponenten](docs/ARCHITEKTUR.md) | ARC, UNA, Daten-/Zustandsentwurf und Infrastrukturrahmen | 0.19 |
| DOC-006 | [Testkonzept und Testspezifikation](docs/TESTSPEZIFIKATION.md) | TST, Testkonzept und Nachweisregeln | 0.26 |
| DOC-007 | [Änderungsregister](docs/AENDERUNGSREGISTER.md) | AEN und Dokumenthistorie | 0.63 |
| DOC-008 | [Änderungsanträge](docs/AENDERUNGSANTRAEGE.md) | Änderungsanträge (OFF) mit Status und Statusverlauf; nie gelöscht | 0.43 |
| DOC-009 | [Konfigurationsmanagement](docs/KONFIGURATIONSMANAGEMENT.md) | Änderungskontrolle, Konfigurationselemente, Baselines (BL) | 1.1 (Datei im Repository nicht vorhanden) |
Die [ursprüngliche Gesamtsammlung v0.1](docs/archiv/ANFORDERUNGEN-v0.1.md) ist ausschließlich ein historischer, unveränderter Stand und keine aktive Definitionsquelle.

## 3. Rückverfolgbarkeitsmatrix

Seit AEN-022 nur noch Kundenanforderung → Kundenabnahmetest. Die Ableitung SWA → ARC → UNA steht in den Quellspalten der Tabellen in DOC-002 und DOC-004 und in der Testspezifikation. Die Matrix wird bei jeder akzeptierten Änderung aktualisiert.

| Kundenanforderungen | Kundenabnahme |
|---|---|
| KAN-001, KAN-003, KAN-004, KAN-005 | TST-K-001 |
| KAN-002 | TST-K-005 |
| KAN-006 bis KAN-010 | TST-K-002 |
| KAN-011, KAN-012 | TST-K-003 |
| KAN-013, KAN-014, KAN-018, KAN-019, KAN-020 | TST-K-004, TST-K-008 |
| KAN-015 | TST-K-006 |
| KAN-016, KAN-017 | TST-K-007 |
| KAN-021 bis KAN-026 | TST-K-009, TST-K-010 |
| KAN-027 | TST-K-011 |
| KAN-028 bis KAN-033 | TST-K-012 |
| KAN-034 | TST-K-013 |
| KAN-035 | TST-K-014 |
| KAN-036 bis KAN-047 | TST-K-015 |
| KAN-052 bis KAN-058 | TST-K-016 |

## 4. Freigabe- und Entwicklungsstand

| Ebene | Stand |
|---|---|
| Kundenanforderungen | Entscheidungen einschließlich ENT-008 getroffen; Anforderungsbaseline für ersten Release freigegeben (AEN-006), Folgeänderungen beauftragt, keine neue Release-Freigabe |
| Softwareanforderungen | Abgeleitet, einschließlich OFF-064/AEN-062 (SWA-058 bis SWA-064) angepasst |
| Architektur | GitHub Pages + Supabase vom Kunden gewählt (ENT-011); Details Entwurf |
| Komponentenanforderungen | Abgeleiteter Entwurf, ergänzt um UNA-041 bis UNA-045 für OFF-064 |
| Implementierung | AEN-053/AEN-054 und OFF-058..063 umgesetzt/verifiziert. OFF-064 auf separatem Branch implementiert; keine Übernahme nach `main`, keine Veröffentlichung. Spieler-Beamer erfordert das neue `supabase/schema.sql` und eine bereits angemeldete Spielersitzung. |
| Tests | Letzter nachgewiesener Lauf: AEN-061 (345 schnelle/558 volle Tests, Lauf 010). OFF-064-Testfälle ergänzt; Ausführung, Konsistenz und Geheimnisprüfung stehen aus. Smartphone-/Beamerprüfung nach Schema-Update ebenfalls offen. |
| Baseline / Kundenabnahme / Release | Konfigurationsmanagement nach DOC-009 (AEN-014). BL-001: Anforderungsbaseline „v0.5“ für den ersten Release vom Kunden freigegeben am 05.11.2026 (AEN-006). BL-002: Gesamtstand eingefroren, Freigabe offen. BL-003 bis BL-007 abgelöst. BL-008: Stand nach AEN-021 eingefroren, Freigabe offen; die nächste Baseline folgt vor der Generalprobe (AEN-022). Kundenabnahme und Release nicht erfolgt. |

Der kompakte aktuelle Kunden-/Arbeitsstand und die offenen Anschlussarbeiten stehen maßgeblich in Abschnitt 0. Die folgenden Änderungsbeschreibungen sind historische Nachweise; sie sind keine zusätzlichen aktuellen Aufträge und keine Aufforderung, bereits bestätigte Veröffentlichungen erneut durchzuführen.

**Aktueller Änderungsstand (06.11.2026):** OFF-022 (AEN-024) ist lokal verifiziert, Nachweis [Lauf 002](testprotokolle/lauf-002.md). OFF-023 bis OFF-029 sind mit AEN-028 in drei Stufen umgesetzt und lokal verifiziert, Nachweis [Lauf 003](testprotokolle/lauf-003.md). Vor Veröffentlichung das aktualisierte `supabase\schema.sql` ausführen; bestehende abgeschlossene Antworten bleiben auch nach der Migration abgeschlossen. Keine neue Baseline oder Veröffentlichung.

OFF-030 (Sammlung AEN-029) ist mit AEN-030 in drei Stufen umgesetzt und lokal verifiziert: grafischer Ablauf in der Anleitung mit wiederholter freier Rätselwahl, manuellem Ende durch den Admin nach 45 Minuten und begleitendem Monitor-Ranglistenhinweis. Nachweis [Lauf 004](testprotokolle/lauf-004.md); reine Anleitungsänderung, keine automatische Abschaltung.

Die lokale Prüfung vor Veröffentlichung wurde mit AEN-031 erfolgreich ausgeführt, Nachweis [Lauf 005](testprotokolle/lauf-005.md). Keine Produktionscodeänderung, keine neue Baseline, Kunden-/Release-Freigabe und Veröffentlichung unverändert offen.

OFF-031 (Sammlung AEN-032) ist mit AEN-034 umgesetzt und lokal verifiziert: separate kurze Präsentation unter `web\praesentation.html`, nur Grundprinzipien, keine einzelnen Rätsel.

OFF-032 (Sammlung AEN-033) ist mit OFF-031 in drei Stufen umgesetzt und lokal verifiziert: bestehende Anleitung kompakter und allgemeiner, ohne einzelne Rätsel. Hauptinhalt von 980 auf 364 Wörter reduziert; Präsentation 57 Wörter. Nachweis [Lauf 006](testprotokolle/lauf-006.md); keine Spielregel-/Backendänderung, Veröffentlichung durch den Kunden offen.

OFF-033 bis OFF-035 sind mit AEN-036 in drei Stufen umgesetzt und lokal verifiziert ([Lauf 007](testprotokolle/lauf-007.md)). Desktop-Admin mit erhaltenen Tabpanels/internem Scrollen; einseitige Monitor-Anleitung mit kompakter Grafik; Präsentation mit gemeinsamem QR-Renderer zur Spielseite derselben Website. Lokale Datei-/Loopbackvorschauen zeigen einen Veröffentlichungshinweis statt eines unbrauchbaren Smartphone-QR. Spieler/Spielregeln/Backend unverändert; Sammlung AEN-035 bleibt erhalten.

### 4.1 Strukturierte Konsistenzstatus

**Fehlerkorrektur AEN-054:** „DELETE requires a WHERE clause“ beim Reset durch explizite WHERE-Bedingungen der Token-Löschung in Reset und Admincode-Wechsel behoben. Bestehende KAN/SWA unverändert; UNA-031 und TST-S-036/TST-U-028 präzisiert. 329 schnelle/530 volle Tests lokal bestanden, Konsistenz/Geheimnisse sauber. Kunde bestätigt erneutes SQL-Update und erfolgreichen Reset mit bearbeitbaren Vorbereitungsfeldern. Admincode-Wechsel nur lokal geprüft.

**Aktueller Stand AEN-053 (08.11.2026):** Drei Stufen abgeschlossen: KAN-036 bis KAN-047 → SWA-041 bis SWA-050 → UNA-027 bis UNA-032 → TST und Umsetzung. OFF-037 bis OFF-055 lokal verifiziert; OFF-056 vorbereitet und lokal simuliert, reale Durchführung beim Kunden offen. Nachweis [Lauf 009](testprotokolle/lauf-009.md). Keine neue Baseline, Veröffentlichung oder Kundenabnahme. Nachfolgende Wartehinweise sind historische Sammlung, nicht erneut ausstehende Umsetzung.

OFF-052 bis OFF-056 (AEN-052) sind als vom Kunden übernommene Vorschläge gesammelt/geklärt: Vorbereitungsstatus, Spieler-Verbindungsanzeige, Restzeit-Warnungen, CSV-Ergebnisexport und Generalprobe mit zwei Gruppen. Keine Anwendungsänderung; reale Geräte-/Supabaseabnahme bleibt separat nachzuweisen. Alle offenen Anträge OFF-037 bis OFF-056 gemeinsam auf „umsetzen“.

OFF-051 (AEN-051) ist gesammelt/geklärt: Beamer-Ansicht als eigene Seite in neuem Tab/Fenster, Admin bleibt geöffnet, Beamer-beenden-Button entfällt. Laufende Aktualisierung und Countdown erhalten; bisherige integrierte Rückkehrvorgabe ersetzt. Noch keine Anwendungsänderung. Alle offenen Anträge OFF-037 bis OFF-051 gemeinsam auf „umsetzen“.

OFF-050 (AEN-050) ist gesammelt/geklärt: eigene Gruppenzeit je Aufgabe, live im Rätsel und in Übersicht, nach Abschluss feste Dauer; Gruppenwort ab Einteilung ausdrücklich eingeschlossen. Gesamtspielzeit separat, bestehende Mess-/Wertungsregeln erhalten. Noch keine Anwendungsänderung. Alle offenen Anträge OFF-037 bis OFF-050 gemeinsam auf „umsetzen“.

OFF-049 (AEN-049) ist gesammelt/geklärt: Anmeldecountdown im Admin nur bei offener Anmeldung, danach ausblenden; ab Gruppeneinteilung allein Spielcountdown gemäß OFF-048. Lokale Ursache geprüft, noch keine Codeänderung. Alle offenen Anträge OFF-037 bis OFF-049 gemeinsam auf „umsetzen“.

OFF-048 (AEN-048) ist gesammelt/geklärt: Spielcountdown ab Gruppeneinteilung, Dauer in Vorbereitung konfigurierbar, Startwert 25 Minuten, Anzeige Spieler/Admin/Beamer und automatisches serverseitiges Ende. Ersetzt bei Umsetzung die bisherige 45-Minuten-/Nur-manuell-Regel; noch keine Anwendungsänderung. Alle offenen Anträge OFF-037 bis OFF-048 gemeinsam auf „umsetzen“.

OFF-047 (AEN-047) ist gesammelt/geklärt: neuer zentraler Admin-Reiter Vorbereitung für Gruppengröße, Wortliste, Aufgaben/Lösungen/Schwierigkeiten und Punktestaffeln; ersetzt die zuvor vorgesehenen Konfigurationsorte aus OFF-042/044/046. Steuerung bleibt für Start/Ende/laufende Bedienung; Phasen und Monitorvorgaben bleiben. Noch keine Anwendungsänderung. Alle offenen Anträge OFF-037 bis OFF-047 gemeinsam auf „umsetzen“.

OFF-046 (AEN-046) ist gesammelt/geklärt: Gruppenwortliste im Admin-Reiter Aufgaben, nur vor Gruppeneinteilung bearbeitbar; bestätigter Default-Vorschlag extern gespeichert. Noch keine Anwendungsänderung. Alle offenen Anträge OFF-037 bis OFF-046 gemeinsam auf „umsetzen“.

OFF-045 (AEN-045) ist gesammelt/geklärt: Gruppenwörter der ersten Aufgabe ungefähr gleich lang und gleich schwer auswählen, ohne feste oder automatische Regel. Noch keine Inhalts-/Codeänderung. Alle offenen Anträge OFF-037 bis OFF-045 gemeinsam auf „umsetzen“.

OFF-037 bis OFF-039 (AEN-039) sind gesammelt und geklärt: Fehlversuch 1/2 bleibt im Rätsel, nach dem dritten zurück; Anleitungslink nur in geöffneten Rätseln ausblenden; Aufgeben nach Bestätigung endgültig mit 0 Punkten. Noch keine Code-/Schemaänderung; gemeinsame Umsetzung auf „umsetzen“.

OFF-036 ist mit AEN-038 in drei Stufen umgesetzt und lokal verifiziert ([Lauf 008](testprotokolle/lauf-008.md)). Spielerübersicht kompakter, Gruppenname größer; nach Wortlösung weder Buchstaben noch Wortaufgabenbereich, Teilnehmerliste bleibt. Spielregeln/Backend unverändert. Sammlung AEN-037 bleibt erhalten; Veröffentlichung durch Kunden offen.

Diese Querverweise sind keine neuen Definitionen. Die Prüfung vergleicht sie mit den maßgeblichen Statusspalten.

| Referenz | Status |
|---|---|
| ENT-008 | entschieden |
| OFF-022 | verifiziert |
| OFF-023 | verifiziert |
| OFF-024 | verifiziert |
| OFF-025 | verifiziert |
| OFF-026 | verifiziert |
| OFF-027 | verifiziert |
| OFF-028 | verifiziert |
| OFF-029 | verifiziert |
| OFF-030 | verifiziert |
| OFF-031 | verifiziert |
| OFF-032 | verifiziert |
| OFF-033 | verifiziert |
| OFF-034 | verifiziert |
| OFF-035 | verifiziert |
| OFF-036 | verifiziert |
| OFF-037 | verifiziert |
| OFF-038 | verifiziert |
| OFF-039 | verifiziert |
| OFF-040 | verifiziert |
| OFF-041 | verifiziert |
| OFF-042 | verifiziert |
| OFF-043 | verifiziert |
| OFF-044 | verifiziert |
| OFF-045 | verifiziert |
| OFF-046 | verifiziert |
| OFF-047 | verifiziert |
| OFF-048 | verifiziert |
| OFF-049 | verifiziert |
| OFF-050 | verifiziert |
| OFF-051 | verifiziert |
| OFF-052 | verifiziert |
| OFF-053 | verifiziert |
| OFF-054 | verifiziert |
| OFF-055 | verifiziert |
| OFF-056 | umgesetzt |

OFF-040 (AEN-040) ist zusätzlich gesammelt/geklärt: Punktevergabe mit Platz-/Punktestaffel, Fehlversuchen/Abschluss, Gesamtpunkten und vorläufiger/finaler Wertung in der einseitigen Anleitung erläutern. Keine Änderung der Spielregeln oder Präsentation; gemeinsame Umsetzung OFF-037 bis OFF-040 auf „umsetzen“.

## 5. Arbeitsumgebung und Voraussetzungen (AEN-007)

OFF-044 (AEN-044) ist gesammelt/geklärt: drei vollständige Schwierigkeitspunktestaffeln im Admin-Steuerungsbereich, bestätigte Startwerte, Änderungen nur vor Gruppeneinteilung; Gruppenwort ebenfalls einstufbar, zunächst mittel. Erweitert OFF-040/OFF-042, keine Implementierung bisher. Alle offenen Anträge OFF-037 bis OFF-044 gemeinsam auf „umsetzen“.

OFF-043 (AEN-043) erweitert das geplante Aufgeben auf das Starträtsel: bestätigender Spieler wird Spielleiter, Gruppenwort endgültig 0 Punkte, Folgerätsel freigeschaltet. Noch keine Code-/Schemaänderung. Gemeinsame Umsetzung aller offenen Anträge OFF-037 bis OFF-043 auf „umsetzen“.

OFF-042 (AEN-042) ist gesammelt/geklärt: zusätzliche Schwierigkeitsstufe leicht/mittel/schwer je Aufgabe im Admin konfigurierbar, bisherige Kategorien bleiben; vorhandene Aufgaben zunächst mittel, Wertung unverändert. Noch keine Code-/Schemaänderung; gemeinsame Umsetzung OFF-037 bis OFF-042 auf „umsetzen“.

OFF-041 (AEN-041) ist gesammelt/geklärt: Geocaching in der Spielerübersicht dauerhaft neutral nummerieren, tatsächlichen Ort erst nach Öffnen/Zeitstart anzeigen; Adminbezeichnungen erhalten. Noch keine Code-/Schemaänderung. Alle offenen Anträge OFF-037 bis OFF-041 gemeinsam auf „umsetzen“.

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
| Änderungsablauf | Änderungswünsche werden als Anträge (OFF) in DOC-008 gesammelt, nie gelöscht, sondern mit Status und Verlauf geführt, und erst auf Anweisung des Kunden in einem Zug umgesetzt (Dokumente, Code, Tests, Konsistenzprüfung). Bei Unklarheit wird vorher nachgefragt. Konfigurationsmanagement und Baselines: DOC-009. (AEN-012, AEN-013, AEN-014) |
| Konsistenzregel | Nach jeder Änderung an Dokumenten oder Code wird die Konsistenz geprüft: jede ID genau einmal definiert (Matrix und historische Vorschläge ausgenommen), keine Referenz ohne Definition, lokale Links gültig, Versionen in Kopfzeile, Dokumentverzeichnis und Dokumenthistorie gleich, `npm test` grün. Ergebnis wird berichtet, auch wenn nicht geprüft werden konnte. (AEN-010) |
| Altdateien | index.html, falsch.html, geloest.html, style.css, n8n-* sind nicht bewertet und gehören nicht zur Baseline. |
