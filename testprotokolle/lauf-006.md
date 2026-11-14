# Testprotokoll Lauf 006 – kompakte Anleitung und Monitor-Präsentation

**Datum:** 06.11.2026
**Befehle:** `npm run test:schnell`, `npm test`, `node tools\konsistenz.mjs`, `node tools\geheim.mjs`
**Umgebung:** Windows, Node v20.0.0, jsdom, PGlite; lokale Browser-Canvas mit Datei-URLs.
**Softwarestand:** AEN-034 / OFF-031 und OFF-032; DOC-001 v0.30, DOC-002 v0.13, DOC-004 v0.13, DOC-006 v0.17, DOC-007 v0.31, DOC-008 v0.18, DOC-009 v0.8. Keine neue Baseline oder Veröffentlichung.

Alle drei Stufen abgeschlossen: KAN-027 aktualisiert; SWA-032, ARC-001 und UNA-019 abgeleitet; Testspezifikation und Tests vor Code aktualisiert. Frühere Erwartungen zu einzelnen Rätseln, Vornamen-Sonderregel und Punktetabelle wurden gemäß Kundenauftrag durch allgemeine Erläuterungen ersetzt. Alle Backend-/Spielregeln und zugehörigen Tests unverändert.

Vor Umsetzung: 238 Tests bestanden, fünf Fälle erwartungsgemäß fehlgeschlagen (fehlende Seite/Navigation, zu lange Anleitung, einzelne Rätselnamen). Nach Umsetzung: **243 schnelle Tests bestanden**. Gewöhnlicher voller `npm test`-Lauf: **391 bestanden, 0 fehlgeschlagen/abgebrochen/übersprungen**, Exit 0, 115272 ms (etwa 115 s). Konsistenz und Geheimnisprüfung sauber.

| TST-ID | Erwartung | Tatsächlicher Nachweis | Status |
|---|---|---|---|
| TST-K-011, TST-S-028 | Nur allgemeine Spielprinzipien, keine einzelnen Rätselnamen/Kategorien/Spezialanweisungen; Anleitung behält allgemeine Regeln, Präsentation keine Detailregeln | Inhaltstests für beide Seiten bestanden; bestehende Rollen-/Versuchs-/Zeit-/Wertungs-/Grafiktests entsprechend aktuellem Vertrag bestanden | lokal bestanden |
| TST-U-020 | Anleitung höchstens 450 Wörter, Präsentation höchstens 100 | Hauptinhalt durch DOM-Textzählung geprüft: Anleitung 364 statt zuvor 980 Wörter (etwa 63 % weniger), Präsentation 57 Wörter | bestanden |
| TST-S-028, TST-A-006 | Gegenseitige relative Links, Rückkehr zur Spielseite, statische Ressourcen ohne Auth-/Backendabhängigkeit | Navigation auch unter Pages-Unterpfad und Ressourcenschutz für beide Seiten automatisiert bestanden | lokal bestanden |
| TST-K-011, TST-U-020 | Präsentation bei 1280×720 vollständig lesbar, mindestens 24 px Hauptinhalt | Identisches HTML mit tatsächlich geladenem CSS im Browserrahmen: Dokumentbreite 1280, Höhe 720, kein horizontaler/vertikaler Überlauf, keine abgeschnittenen Textlabels, minimale Textgröße 24 px, fünf Spalten | lokal bestanden |
| TST-K-011, TST-U-020 | Beide Seiten mobil ab 320 px ohne horizontalen Überlauf | Browserrahmen bei 320, 375, 640 px geprüft: keine überlaufenden Texte oder Dokumentbreiten; temporäre Rahmen entfernt | lokal bestanden |

Die horizontalen CSS-Pfeile liegen absichtlich zwischen den Präsentationskarten. Textüberlauf wurde separat an Überschriften, Absätzen und Beschriftungen geprüft, nicht an Karten einschließlich dekorativer Pfeile. Die Monitoransicht erfüllt die messbaren Grenzen; die schmale Browser-Seitenleiste verwendet stattdessen das responsive mobile Layout.

**Grenzen:** Veröffentlichung, echte Monitor-/Smartphoneabnahme, tatsächliche Supabase-/HTTPS-Verbindung, Last und parallele Transaktionen bleiben offen. Für diese Anleitungsänderung ist kein weiteres SQL-Update erforderlich; frühere Backendänderungen müssen vor Veröffentlichung weiterhin ausgerollt werden. Nach Abschlussdokumentation Konsistenz, schneller Lauf und Geheimnisprüfung erneut prüfen.
