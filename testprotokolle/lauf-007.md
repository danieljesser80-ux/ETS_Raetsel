# Lauf 007 – Desktop-Admin und Monitor-Erläuterungen

Datum: 06.11.2026. Stand: AEN-036, OFF-033 bis OFF-035; DOC-001 v0.32, DOC-002 v0.14, DOC-004 v0.14, DOC-006 v0.18, DOC-007 v0.33, DOC-008 v0.20, DOC-009 v0.8. Windows, Node 20.0.0, lokaler Arbeitsordner; keine Veröffentlichung oder Baseline.

## Testentwicklung und automatische Ergebnisse

Anforderungen und Komponenten-/Testverträge wurden vor Tests und Produktionscode aktualisiert. Unabhängiger Sonnet-5.5-Testkontext schrieb `tests\web\desktop-qr.test.js` (14 Fälle) und aktualisierte ausschließlich die Ressourcenerwartung der Präsentation in `erklaerung.test.js`. Erwartete rote Fälle: fehlende Tabs/Seitenklassen/Detailwrapper und QR-Modul. Vorhandene Inhaltstests blieben erhalten.

Ein unabhängiger Test enthielt den Tippfehler `data-actions` statt des bestehenden Vertrags `data-action`; unabhängig korrigiert, ohne Produktions-Scheinattribut. Die Browserprüfung zeigte, dass die lokale Dateivorschau intern über eine `.localhost`-HTTP-Adresse läuft. Der dokumentierte Datei-/Vorschauvertrag wurde vor der Korrektur auf lokale HTTP-/Loopbackhosts präzisiert: keine irreführende Smartphoneadresse. Zwei zusätzliche Tests in `qr-preview.test.js`, zuerst erwartetes Rot, danach Grün; unabhängiger HTTP-Erfolgsfall auf reale LAN-Adresse statt localhost angepasst.

| Prüfung | Erwartung | Ergebnis |
|---|---|---|
| TST-U-024, TST-S-032 | Sechs ARIA-Tabs, alle Panels im DOM; Entwürfe/Selektion und Aktionen erhalten, Detailwrapper | Bestanden |
| TST-U-025, TST-S-032 | HTTP(S)/Pages-Unterpfad, Query/Hash entfernen, Datei/ungültig/Vorschau/Encoderfehler sichtbar | Bestanden |
| TST-U-025 | Echt erzeugtes 360×360-PNG aus qrcode 1.5.4; weißer Ruhebereich, unabhängiger jsQR-Decoder liefert exakte synthetische Spieladresse | Bestanden |
| TST-U-020, TST-S-028, TST-A-006 | Allgemeine Inhalte/Wortlimits/Navigation; nur Präsentation mit QR-Modul, Anleitung rein HTML/CSS | Bestanden |
| Gesamtauswahl schnell | Alle schnellen Tests | 259 bestanden, keine Fehler/Abbrüche/übersprungenen Tests |
| Gesamtauswahl voll, `npm test` | Einschließlich PGlite-Datenbanktests | 407 bestanden, 13 Suites, keine Fehler/Abbrüche/übersprungenen Tests; 118 s |
| Konsistenz/Geheimnisse/Syntax | Keine Widersprüche, geheimen Lösungen oder Syntaxfehler | Sauber |

## Lokale Browsernachweise

Isolierte temporäre Iframes mit exakt 1920×1200 CSS-px und geladenem Original-CSS, danach entfernt. Keine versteckten Anleitungstexte oder abgeschnittenen Regeln als Ersatz für Einseitenlayout.

- Adminzugang sowie alle sechs Tabs in vorbereitet, Anmeldung, aktiver und abgeschlossener Runde: Dokument 1920×1200, kein horizontaler/vertikaler Dokumentüberlauf, keine außerhalb des Rahmens abgeschnittenen Texte. Künstliche 100 Teilnehmer, 20 Gruppen, acht Aufgaben. Lange Panels intern scrollbar: Teilnehmer 2604/931 px, Gruppen 2124/931 px, Aufgaben 4150/931 px (Scroll-/Clienthöhe).
- Phase `gruppen_eingeteilt` zusätzlich geprüft: Teilnehmerpanel bleibt identisch, Scrollposition 900 px nach Tabwechsel und Polling unverändert; Dokument 1920×1200.
- Detailansicht mit 25 künstlichen Antwortzeilen: Tabelle intern scrollbar (1006/877 px), Rückkehr erreichbar. Beamer in Anmeldung/aktiver/abgeschlossener Runde: Liste intern scrollbar; Dokument passt, Exit innerhalb des Rahmens.
- Tatsächlicher `admin.js`-Controller in isolierter Browserumgebung mit injiziertem Fake-RPC, ohne Supabaseaufrufe: Login, Polling, Tabwechsel, Speichern, Detail-/Beamer-Rückkehr und Reset. Aufgabe behält identisches Feld, Text, Fokus und Selektion 2–7 beim Polling; beim Tabwechsel Text/Selektion erhalten. Speicherung sendet aktuellen Entwurf, gewählter Tab bleibt bestehen. Detailrückkehr auf Gruppen, Beamerrückkehr auf Rangliste, erfolgreicher Reset auf Steuerung. Keine Browserfehler. Ein erster Harnesslauf wartete auf einen Vorschauhinweis, verwendete jedoch `about:srcdoc` als Adresse; Harness mit tatsächlicher Seitenadresse korrigiert, kein Produktionsfehler.
- Anleitung: 364 Hauptinhaltswörter, alle Abschnitte/Grafik/Navigation vollständig sichtbar, Dokument 1920×1200, kleinste Textschrift 18 px.
- Präsentation mit echter dynamischer QR-Bibliothek und ausschließlich temporärer synthetischer HTTPS-Adresse: Dokument 1920×1200, keine abgeschnittenen Texte; QR genau 360×360 px vollständig sichtbar, kleinste Hauptschrift 28 px (Adresslink ausgenommen), 60 Hauptinhaltswörter einschließlich QR-Titel/Adresse. Live-Vorschau zeigt stattdessen verständlichen Veröffentlichungshinweis; keine erfundene Adresse bleibt in der Seite.
- Mobile Spieler bei 320/375/640 px: Anmeldung, Gruppenwort und Einzelaufgabe ohne horizontalen Überlauf.

## Grenzen

Lokale Nachweise für TST-K-013/TST-S-032 und Komponenten, keine Kundenabnahme. Echter Smartphone-Scan der veröffentlichten Website, reales 1920×1200-Monitorgerät, Supabaseveröffentlichung, Netz-/Transaktionsparallelität und 100 gleichzeitig aktive Clients bleiben offen. Synthetische Teilnehmerzahlen und Fake-RPC sind keine Last-/Backendabnahme. Spielregeln, Lösungen und Schema unverändert.
