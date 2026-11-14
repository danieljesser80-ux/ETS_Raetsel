# Lauf 008 – Kompakte Spielerübersicht

Datum: 06.11.2026. Stand AEN-038 / OFF-036: DOC-001 v0.34, DOC-002 v0.15, DOC-004 v0.15, DOC-006 v0.19, DOC-007 v0.35, DOC-008 v0.22, DOC-009 v0.8. Windows, Node 20.0.0, lokaler Arbeitsordner. Keine Veröffentlichung oder Baseline.

## Vorgehen und automatisierte Ergebnisse

KAN-035 → SWA-040 → ARC-001/UNA-026 → TST-K-014/TST-S-033/TST-U-026 vor Tests und Code aktualisiert. Kleines Paket direkt bearbeitet, ohne zusätzliche Agenten. Acht Tests in `tests\web\spieler-kompakt.test.js` vor Produktionsänderung: vier erwartete Fehler für fehlende Darstellung/Entfernung, vier bestehende Verhaltensnachweise bestanden.

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| TST-U-026 | Gruppenname/Mitglieder/Eigenmarkierung, Wortaufgabe ungelöst bedienbar; nach Lösung für Spielleiter und Mitglieder vollständig aus DOM entfernt | Bestanden |
| TST-U-026 / UNA-021 | Lösungsübergang entfernt alte Buchstaben/Eingabe trotz weiter übergebener Buchstaben; Polling erhält Entwurf/Fokus/Selektion | Bestanden |
| TST-U-026 | Aufgabenwahl/Rechte, Einzelaufgabe/Login/Admin unverändert | Bestanden |
| Schneller Lauf | Alle Tests ohne Datenbank | 267 bestanden, keine Fehler/Abbrüche/übersprungenen Tests |
| Voller Lauf `npm test` | Einschließlich PGlite | 415 bestanden, 13 Suites, keine Fehler/Abbrüche/übersprungenen Tests; 135 s |
| Konsistenz / Geheimnisprüfung | Sauberer Gesamtstand, keine geheimen Lösungen | Sauber |

## Lokaler Browsernachweis TST-S-033

Originalzustand vor Änderung als HTML/CSS-Snapshot ausschließlich im Browser gespeichert; Vergleich mit neuer Darstellung in temporären Iframes bei identischer Breite. Sechs synthetische Mitglieder, acht verfügbare Aufgaben, drei Kategorien, gelöstes Gruppenwort. Snapshot und Iframes anschließend entfernt.

| Breite | Höhe vorher | Höhe nachher | Verringerung |
|---|---|---|---|
| 320 px | 2240,9 px | 1378,2 px | 38,5 % |
| 375 px | 2190,5 px | 1289,4 px | 41,1 % |
| 640 px | 2140,1 px | 1209,9 px | 43,5 % |

Mindestens 20 % erfüllt. Gruppenname 32 statt 20,8 px; kleinste Textschrift 18 px. Buttons CSS-min-height 48 px, gemessene Rundung 47,995 px, damit sicher über 44 px. Ein erster Entwurf mit 44 px wurde wegen gemessener Rundung knapp unter 44 px vor dem finalen Lauf auf 48 px erhöht.

Bei allen Breiten kein horizontaler Überlauf. Zusätzliche Fälle mit 14 langen Teilnehmernamen und langem Gruppennamen ohne Leerzeichen: sämtliche Mitglieder vorhanden, Umbruch ohne Überlauf. Keine fixe Inhalts-/Seitenhöhe oder abgeschnittene Texte. Wortplatz/Versuchsstatus und freie Rätselwahl erhalten.

Im Browser bei 375 px: Entwurf, identisches Feld, Fokus und Selektion 2–6 beim Polling erhalten. Nach Wortlösung auch in Mitgliedsansicht keine Buchstaben/Worteingabe; sechs Mitglieder, keine unberechtigten Öffnen-Buttons. Login, Einzelaufgabe und Admin erhalten ihre bisherigen Layoutklassen; Änderungen nur in `web\js\views.js` und scoped CSS.

## Grenzen

Lokale technische Nachweise, keine echte Smartphone-/Feierabnahme oder veröffentlichte Prüfung. Keine Backend-, Rechte-, Spielregel- oder Schemaänderung; keine echten Lösungen im Projekt. Für die Veröffentlichung müssen `web\js\views.js` und `web\style.css` aktualisiert werden.
