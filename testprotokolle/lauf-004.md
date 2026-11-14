# Testprotokoll Lauf 004 – grafischer Ablauf in der Anleitung

**Datum:** 06.11.2026
**Befehle:** `npm run test:schnell`, `node tools\konsistenz.mjs`, `node tools\geheim.mjs`
**Umgebung:** Windows, Node v20.0.0, jsdom; lokale Browser-Canvas mit Datei-URL ohne Supabase.
**Softwarestand:** AEN-030 / OFF-030; DOC-001 v0.26, DOC-002 v0.12, DOC-004 v0.12, DOC-006 v0.15, DOC-007 v0.27, DOC-008 v0.15, DOC-009 v0.8. Kein Git, keine neue Baseline.

Die Umsetzung folgte den drei Stufen: KAN-027 ergänzt; SWA-032, ARC-001 und UNA-019 präzisiert; Testspezifikation ergänzt und zwei Tests vor dem Grafikcode geschrieben. Vor Umsetzung bestanden 238 bestehende Tests, zwei neue Grafiktests schlugen wegen der fehlenden Grafik erwartungsgemäß fehl. Nach Umsetzung: **240 schnelle Tests bestanden, 0 fehlgeschlagen**. Konsistenz sauber (237 IDs); Geheimnisprüfung ohne Treffer.

| TST-ID | Voraussetzungen / erwartetes Ergebnis | Tatsächliches Ergebnis / Nachweis | Status |
|---|---|---|---|
| TST-K-011, TST-U-020 | Beschriftete Grafik ergänzt, ohne die ausführliche Anleitung zu ersetzen; Schrittfolge Anmeldung, Gruppenwort, erster richtiger Worteingeber als Spielleiter, Rätselphase, Ende | DOM-Test prüft semantische Beschriftung, geordnete Schritte und erhaltene ausführliche Anleitung | lokal bestanden |
| TST-S-028, TST-U-020 | Wiederholbare Übersicht → freie Auswahl → gemeinsame Lösung / Abgabe durch Spielleiter → zurück zur Übersicht; Monitor-Rangliste begleitet das Spiel; manueller Abschluss nach 45 Minuten, nicht automatisch | Zweiter Grafiktest und bestehende Inhalts-/Regeltests bestanden; Monitorhinweis außerhalb der Schrittliste, kein neuer Timer oder Live-Ranglistenaufruf | bestanden |
| TST-A-006, TST-S-028 | Statische Grafik ohne Skripte, externe Grafikbibliothek, Bilddatei oder Backendzugriff; bestehende Navigation und Geheimnisschutz | Bestehende Ressourcen-/Navigationstests und Geheimnisprüfung bestanden; Grafik ausschließlich HTML und gemeinsames CSS | lokal bestanden; Veröffentlichung offen |
| TST-K-011, TST-U-020 | Grafik ab 320 px ohne horizontale Überläufe oder abgeschnittene Beschriftungen; sichtbare Vorwärts- und Rückkehrpfeile | Tatsächliche Seite im Browser neu geladen und Grafik gesichtet. Zusätzlich identisches HTML mit tatsächlich geladenen CSS-Regeln in temporären Browserrahmen bei 320, 375 und 640 px geprüft: kein Dokumentüberlauf und keine überlaufenden Grafikbeschriftungen; Vorwärtspfeil ↓ und Rückkehrpfeil ↑ gerendert. Rahmen danach entfernt | lokal bestanden; echte Smartphoneabnahme offen |

**Umfang:** Regression aller schnellen Logik-/Web-/Werkzeugtests. Kein voller Datenbanklauf, da nur Anleitung, anleitungsspezifisches CSS, Webvertrag und Dokumentation geändert wurden. Letzter voller Nachweis vor dieser Änderung: Lauf 003. Das manuelle Admin-Ende bleibt unverändert; 45 Minuten sind ein Moderationshinweis. Veröffentlichung des aktualisierten Ordners `web\`, echte HTTPS-/Chrome-/Safari-Smartphoneprüfung und Kundenfreigabe bleiben beim Kunden. Kein SQL-Update durch diese Änderung erforderlich.
