# Testprotokoll Lauf 005 – lokale Veröffentlichungsprüfung

**Datum:** 06.11.2026
**Befehle:** `npm test`, `node tools\konsistenz.mjs`, `node tools\geheim.mjs`; nach Dokumentation zusätzlich `npm run test:schnell`.
**Umgebung:** Windows, Node v20.0.0, jsdom und PGlite; keine echte Supabase-Verbindung.
**Softwarestand:** Produktionscode nach AEN-030 / OFF-030 unverändert; Prüfungsnachweis AEN-031. Abschließender Dokumentstand: DOC-001 v0.27, DOC-002 v0.12, DOC-004 v0.12, DOC-006 v0.16, DOC-007 v0.28, DOC-008 v0.15, DOC-009 v0.8. Kein Git, keine neue Baseline.

Der Agent führte die zuvor dem Kunden beschriebene technische Prüfung selbst aus. Der gewöhnliche vollständige Befehl `npm test` mit unverändertem Testrunner endete erfolgreich mit Exit 0 nach **122565 ms (etwa 123 Sekunden)**:

| Kennzahl | Ergebnis |
|---|---|
| Tests | 388 |
| Bestanden | 388 |
| Fehlgeschlagen | 0 |
| Abgebrochen | 0 |
| Übersprungen | 0 |

Kein serieller Ersatzlauf und keine Änderung am Testrunner erforderlich. Der zuvor in Lauf 003 dokumentierte PGlite-Start-Hänger trat diesmal nicht auf. Seine Ursache ist weiterhin nicht belegt; aus dem erfolgreichen Wiederholungslauf wird keine behobene Fehlerursache behauptet.

**Weitere Ergebnisse:** Konsistenz sauber; Geheimnisprüfung meldet „Keine geheimen Lösungen im Projekt gefunden“. Nach Dokumentation dieses Nachweises werden beide Prüfungen und der schnelle Lauf erneut ausgeführt. Die Spezifikationen und Test-Erwartungen bleiben unverändert.

**Abdeckung:** Alle vorhandenen automatisierten Logik-, Datenbank-, Web- und Werkzeugtests einschließlich der Grafiktests nach AEN-030. Die zugehörigen TST-IDs stehen in den Testtiteln und DOC-006; dieser Lauf ergänzt die Nachweise aus Lauf 003 und Lauf 004.

**Grenzen:** Kein Nachweis echter Supabase-/HTTPS-Veröffentlichung, Smartphoneabnahme, gleichzeitiger Transaktionen oder 100-Spieler-Last. Kunden-/Release-Freigabe, Veröffentlichung und neue Baseline wurden nicht ausgeführt. Es wurde kein Produktionscode geändert.
