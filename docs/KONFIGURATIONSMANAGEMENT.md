# Konfigurationsmanagement – Weihnachtsfeierspiel

**Dokument-ID:** DOC-009 | **Version:** 1.2 | **Datum:** 15.11.2026

Rekonstruktion der fehlenden Datei anhand DOC-001, DOC-007 und DOC-008; keine Wiederherstellung des unbekannten Originalwortlauts. [Einstieg](../ANFORDERUNGEN.md).

## Änderungskontrolle

1. OFF erfassen und Kundenentscheidung dokumentieren; IDs nie wiederverwenden.
2. AEN mit Auswirkungen auf KAN, SWA, ARC, UNA, TST und Konfigurationselemente erfassen.
3. Branch aus main; Dokumentation, Code und Tests gemeinsam ändern. Historische Nachweise erhalten.
4. Automatisierte Tests und Konsistenzprüfung; bei grünen Tests nach main mergen gemäß Kundenregel. GitHub Pages danach visuell prüfen. Abweichungen und Abnahme dokumentieren.
5. Supabase-Änderungen vorab ausdrücklich benennen; Kunde führt SQL aus. Keine ungefragte Mutation der Live-Konfiguration, kein Reset oder Spielstart.

## Konfigurationselemente

| Element | Quelle |
|---|---|
| Anforderungen, Architektur, Tests, Register | DOC-001/002/004/006/007/008/009 |
| Anwendung | web/, src/ |
| Datenbank | supabase/schema.sql und API-Dokumentation |
| Tests und Nachweise | tests/, testprotokolle/, GitHub Actions |
| Deployment | GitHub main, Pages, Supabase-Schema |
| Private Aufgaben, Lösungen, Admincodes | außerhalb Git; keine Geheimnisse in Nachweisen |

## Baselines

Eine Baseline benennt Commit, Dokumentversionen, Schema-/Deploymentstand, Testnachweise, offene Abweichungen und Freigabe. Eine Veröffentlichung oder Designabnahme ersetzt keine Gesamtfreigabe.

| ID | Historischer Stand |
|---|---|
| BL-001 | Anforderungsbaseline v0.5, freigegeben 05.11.2026 (AEN-006) |
| BL-002 | Gesamtstand eingefroren, Freigabe nicht belegt |
| BL-003–007 | Abgelöst laut DOC-001; Originaldetails nicht verfügbar |
| BL-008 | Stand nach AEN-021 eingefroren, Freigabe offen |

Neue Einsatzbaseline erst nach Generalprobe, finaler Aufgabenbestätigung und ausdrücklicher Kundenfreigabe. Kein neuer BL-Identifier ohne tatsächlichen eingefrorenen Stand.
