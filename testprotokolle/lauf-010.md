# Lauf 010 – Performance, Aufgabenimport und aufklappbare Kategorien

Datum: 09.11.2026. Auftrag: AEN-061, OFF-058 bis OFF-063 (gemeinsam auf „umsetzen“).

## Lokaler Stand

Stufe 1: KAN-048 bis KAN-051 aufgenommen.
Stufe 2: SWA-051 bis SWA-057, ARC-010/011, UNA-033 bis UNA-040 und TST-S-037 bis TST-S-042, TST-A-007, TST-U-029 bis TST-U-034 festgelegt.
Stufe 3: Tests und Umsetzung (`supabase\schema.sql`, `web\js`). Altverträge (Sperre in `expire_game`, `admin_overview`-Signatur, Player-Controller mit `stateKey`) wegen geänderter Anforderung angepasst.

| Lokale Prüfung | Ergebnis |
|---|---|
| Schneller Lauf `npm run test:schnell` | 345 bestanden, keine Fehler |
| Datenbanktests (10 Dateien einzeln nacheinander, PGlite) | 213 bestanden, keine Fehler; neu: `off058-import-ranking.test.js` (12) |
| Gesamt (schnell + Datenbank) | 558 bestanden |
| Konsistenz und Geheimnisprüfung | Sauber (`node tools\konsistenz.mjs`, `node tools\geheim.mjs`) |
| Aufgabenparser gegen `C:\Raetsel-geheim\aufgaben.md` | 8 Aufgaben erkannt, 5 Warnungen (fehlende Lösungen/Optionen) |

Hinweis: Der gleichzeitige Gesamtlauf `npm test` lief mit PGlite weit über eine Stunde; die DB-Dateien laufen einzeln jeweils in unter 100 s.

## Nicht nachgewiesen

- Keine gemessene Beschleunigung: keine echte Mehrverbindungs-/Lastmessung, kein `EXPLAIN (ANALYZE, BUFFERS)`, kein Nutzlastvergleich, keine Chrome-/Safari-Messung mit 100 Teilnehmern.
- Kein Livebetrieb von Schema, Import und Cron; keine Veröffentlichung, keine Baseline.
- Die Schemaänderung (`admin_overview(text, bigint)`) und `web\` müssen vom Kunden gemeinsam veröffentlicht werden.
- OFF-056 reale Generalprobe weiterhin offen.
