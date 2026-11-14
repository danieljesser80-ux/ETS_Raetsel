# Testprotokoll Lauf 002 – öffentliche Spielanleitung

**Datum:** 06.11.2026 | **Befehle:** `npm run test:schnell`, `node tools\konsistenz.mjs`, `node tools\geheim.mjs`
**Umgebung:** Windows, Node v20.0.0, jsdom; lokale Browser-Canvas mit Datei-URL, ohne Supabase.
**Softwarestand:** AEN-024 / OFF-022, DOC-001 v0.19, DOC-002 v0.10, DOC-004 v0.10, DOC-006 v0.12, DOC-007 v0.20, DOC-008 v0.9; kein Git, keine neue Baseline.

Die vollständige Dokumentenkette wurde vor Tests und Code aktualisiert. Die fünf neuen Tests wurden vor der Umsetzung geschrieben: zunächst 175 bestehende Tests bestanden, fünf neue Tests fehlgeschlagen (Seite und Einstiegslink fehlten). Nach der Umsetzung: **180 Tests bestanden, 0 fehlgeschlagen** im schnellen Lauf. Konsistenz sauber (200 IDs); Geheimnisprüfung ohne Treffer.

| TST-ID | Voraussetzungen und erwartetes Ergebnis | Tatsächliches Ergebnis / Nachweis | Status |
|---|---|---|---|
| TST-U-020 | Deutsche statische HTML-Seite mit Viewport, benannten Abschnitten, gemeinsamem CSS und relativen Links; Einstiegslink außerhalb dynamischer Bereiche | `tests\web\erklaerung.test.js`: Struktur, Ressourcen und Navigation entsprechen dem Vertrag | bestanden |
| TST-S-028 | Rollen, Ablauf, Versuchslimits, Zeiten, Punkte, Vornamenregel und Ranglistensichtbarkeit entsprechen SWA-032; Link bleibt nach Rendering und Netzfehler sichtbar | DOM- und Inhaltstests ohne Skriptausführung bestanden; lokale Linkziele und Pages-Unterpfad geprüft; Geheimnisprüfung sauber | bestanden |
| TST-A-006 | Reines HTML und CSS ohne Anmeldung, Skripte, Formulare oder externe Ressourcen; Veröffentlichung aus `web` | Statische Dateien und bestehender Pages-Workflow geprüft; lokale Seite im Browser geladen und gesichtet | lokal bestanden; veröffentlichte HTTPS-Seite offen |
| TST-K-011 | Anleitung ohne Anmeldung öffnen und alle Spielregeln lesen können, auch mobil | Inhalt und Navigation lokal bestanden; Browser-Layout bei Rahmenbreiten 320, 375 und 640 px: kein horizontaler Überlauf, gemeinsames CSS geladen | lokal bestanden; echte Smartphone-Kundenabnahme offen |

**Umfang:** Regressionsprüfung aller schnellen Tests, einschließlich Logik, Web und Werkzeuge. Kein voller Datenbanklauf: Datenbank und Spiellogik unverändert; keine Baseline oder Veröffentlichung erstellt. Der volle Lauf vor Veröffentlichung sowie Tests auf echten Chrome-/Safari-Smartphones und die Kundenabnahme bleiben erforderlich.
