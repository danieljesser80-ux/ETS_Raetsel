# Lauf 009 – Vorbereitung, Wertung und automatische Spielzeit

Datum: 08.11.2026. Auftrag: AEN-053, OFF-037 bis OFF-056.

## Lokaler Stand

Stufe 1: KAN-036 bis KAN-047 aufgenommen, Konsistenz sauber, 267 schnelle Tests bestanden.
Stufe 2: SWA-041 bis SWA-050, UNA-027 bis UNA-032 und TST-K-015/TST-S-034 bis TST-S-036/TST-U-027 bis TST-U-028 festgelegt.
Konsistenz sauber, 267 schnelle Tests vor neuen Tests bestanden.

Stufe 3 abgeschlossen: unabhängige Testentwicklung mit Sonnet 5.5 vor Produktionsänderungen,
Umsetzung durch Hauptsitzung. Fixturefehler (persistente Konfiguration, erforderliche RPC-Argumente,
nicht konfigurierte Aufgaben, öffentliche Geo-IDs) und ersetzte Altverträge anhand der Anforderungen
korrigiert; echte Fehler bei Sperren, Zeitanzeigen, CSV-Steuerzeichen und Verbindungsstatus behoben.

| Lokale Prüfung | Ergebnis |
|---|---|
| Schneller Lauf `npm run test:schnell` | 328 bestanden, keine Fehler/Abbrüche/übersprungenen Tests |
| Voller Lauf `npm test` | 529 bestanden, 16 Suites, keine Fehler/Abbrüche/übersprungenen Tests |
| Konsistenz und Geheimnisprüfung | Sauber, 334 IDs; geschützte Wortdefaults ausschließlich außerhalb des Projekts |
| Datenbank | Wiederholbare Migration, Konfiguration/Reset, Berechtigungen, Aufgeben, Zeit-/Wertungsgrenzen, Export/Anzeigetoken; PGlite ohne echten Cron |
| Browser 1920×1200 | Vorbereitung ohne Dokumentüberlauf, internes Panel 1008 px / Inhalt 5313 px; Select-Entwurf/Element/Fokus bei Neuzeichnung erhalten |
| Anleitung 1920×1200 | Mit tatsächlichem `guide.js` und synthetischer Konfigurationsantwort: alle drei angenommenen Neuner-Staffeln korrekt, Dokumenthöhe 1128 px, kein horizontaler Überlauf, mindestens 18 px Text |
| Beamer 1920×1200 | 100 Teilnehmer/20 Gruppen synthetisch; kein Dokumentüberlauf, Rangliste intern scrollbar (794 / 1883 px). Fünf-/Ein-Minuten-Warnungen unterschiedlich, nach Ablauf ausgeblendet |
| Spieler 320/375/640 px | Sechs synthetische Mitglieder, acht Aufgaben/drei Kategorien; Übersicht 1614/1550/1496 px, neun eigene Zeitanzeigen. Jeweils unter 80 % der ursprünglichen Referenzhöhe aus Lauf 008; 32 px Gruppenname, 18 px Text, knapp 48 px Buttons, kein horizontaler Überlauf |

OFF-037 bis OFF-055 lokal verifiziert. OFF-056 vorbereitet und lokal simuliert, reale Probe offen.
Browserprüfung verwendet ausschließlich synthetische Daten und verändert keine produktive Runde.
Die bereits veröffentlichte öffentliche Konfigurations-RPC war noch nicht vorhanden; der sichtbare
Anleitungsfehler wurde beobachtet, kein erfolgreicher Live-Schema-/Cronbetrieb behauptet.
Keine Veröffentlichung, Baseline oder echte Abnahme.

## Generalprobe mit zwei Gruppen – vom Kunden auszuführen

### Ergänzung AEN-054 – Supabase-Löschschutz

Der Kunde hat SQL-Update, Cron-Bereitschaft, Anonymous Sign-Ins und GitHub-Pages-Lauf bestätigt.
Beim anschließenden Reset einer alten Runde meldet Supabase „DELETE requires a WHERE clause“.
Die neue Token-Löschung in `admin_reset` und `admin_set_code` hatte im Gegensatz zu den übrigen
Rundendaten keine WHERE-Bedingung. Beide Stellen verwenden jetzt `WHERE true`; Löschschutz
wird nicht deaktiviert. Ein neuer Regressionstest erfasst alle Schema-DELETEs einschließlich
beider Token-Löschungen: vor Code fehlgeschlagen, nach Korrektur bestanden.

329 schnelle Tests und 530 volle Tests, 16 Suites, ohne Fehler/Abbrüche/übersprungene Tests;
voller Lauf 171 s. Konsistenz sauber (335 IDs), Geheimnisprüfung sauber. PGlite unterstützt
hier nicht den echten Supabase-Löschschutz; reale erneute Prüfung nach SQL-Aktualisierung
und bewusst bestätigtem Reset durch den Kunden: erneutes Schema erfolgreich ausgeführt,
Reset erfolgreich und Vorbereitungsfelder wieder bearbeitbar (Kundenbestätigung 08.11.2026).
Admincode-Wechsel weiterhin nur lokal geprüft. Kein automatischer Reset/Upload durch Copilot.

### Ablauf der realen Probe

Voraussetzungen: aktualisierte Webdateien veröffentlicht, SQL-Migration ausgeführt,
Supabase Cron eingerichtet und im Admin als bereit erkannt, Anonymous Sign-Ins aktiv.
Zwei Gruppen mit passenden Gruppengrößen auf echten Smartphones (Chrome und Safari soweit
verfügbar) sowie Admin und separater Beamerseite auf dem vorgesehenen Bildschirm.
Keine produktiven Rundendaten ohne ausdrückliche Entscheidung zurücksetzen.

| Schritt | Erwartetes Ergebnis | Reales Ergebnis |
|---|---|---|
| Vorbereitung öffnen | Gespeicherte Größen, Wörter, Aufgaben, Schwierigkeiten, Staffeln, Spielzeit und konkrete fehlende Angaben sichtbar. | Kunde bestätigt Reiter, Bearbeitbarkeit nach Reset und „Bereit zum Start“. Größe 4–6, Dauer 25 Minuten, Gruppenwort mittel und angenommene Staffeln gespeichert. |
| Defaultwortliste aus geschützter lokaler Datei importieren | Liste nur im Admin gespeichert; keine öffentlich veröffentlichte Lösungsdatei. Passende Wörter vorhanden. | Kunde bestätigt Import und erfolgreiches Speichern der geschützten Defaultdatei. |
| Dauer für Probe kurz einstellen, speichern | Übernahme sichtbar; Eingaben anderer Bereiche bleiben erhalten. | Offen |
| Anmeldung starten, Teilnehmer anmelden, schließen | Anmeldung zählt gemeinsam; nach Schließen kein weiterlaufender Anmeldecountdown. | Offen |
| Gruppen einteilen | Beide Gruppen vollständig; Spielzeit beginnt jetzt, Konfiguration für laufende Runde gesperrt. | Offen |
| Beamer-Ansicht öffnen | Neue Seite in separatem Fenster/Tab, Admin unverändert. Rangliste und Restzeit aktualisieren unabhängig. Kein Exitbutton. | Separates Öffnen ohne Fehler bei weiterhin geöffnetem Admin bestätigt. Laufende Rundendaten/Countdown noch nicht real geprüft. |
| Erste Gruppe löst Wort, zweite gibt Wort auf | Jeweils bestimmter Spielleiter; zweite Gruppe 0 Wortpunkte, aber Folgerätsel frei. Teilnehmer und Wortdauer bleiben sichtbar. | Offen |
| Exakte Folgeaufgabe falsch/falsch/richtig | Erste zwei Fehlversuche bleiben geöffnet; dritte richtige Lösung schließt nach Rückmeldung. Keine Zeitneustarts. | Offen |
| Andere Aufgabe falsch/falsch/falsch | Endgültig falsch, 0 Punkte, nicht wieder aufnehmbar. | Offen |
| Geocaching öffnen und zur Übersicht zurückkehren | Vor Start neutrale Namen, tatsächliche Bezeichnung nur geöffnet; Übersicht bleibt neutral. | Offen |
| Aufgeben abbrechen, dann bestätigen | Abbruch ändert nichts; bestätigter Abschluss endgültig 0 Punkte, Dauer steht. Auch Schätzaufgabe testen. | Offen |
| Neuladen, Netz kurz unterbrechen und wiederverbinden | Gruppe/Eingaben soweit gültig erhalten, Zeiten unverändert; Verbindung/unsicherer Eingang verständlich, keine automatische zweite Antwort. | Offen |
| Restzeitwarnungen bei fünf/einer Minute | Visuelle Hinweise ohne Pop-up oder Eingabeunterbrechung; bei kurzer Probe passende bereits erreichte Stufe. | Offen |
| Frist ablaufen lassen, Adminseite vorher schließen | Supabase beendet unabhängig vom Adminbrowser; finale Wertung, keine verspätete Antwort, offene Aufgabenzeiten stoppen. | Offen |
| CSV nach Ende exportieren | Finale Gruppen-/Aufgabenwerte und Zeiten, keine Antworten/Lösungen/Code; in Tabellenkalkulation korrekt lesbar. | Offen |
| Manuelles frühes Ende in zweiter Probe | Derselbe endgültige Abschluss; Zeiten am tatsächlichen Ende fixiert. | Offen |
| Reset nach Ergebnissicherung | Teilnehmer/Ergebnisse/alte Fristen weg; Konfiguration/Wortliste/Aufgaben bleiben. | Reset der nicht mehr benötigten alten Runde nach AEN-054 erfolgreich bestätigt. Zusätzlicher Reset nach finaler Ergebnissicherung der Generalprobe offen. |

Die kurze Probe ersetzt keine Prüfung des tatsächlichen 25-Minuten-Standardlaufs oder der
gewählten Feierdauer. Ein echter Lastnachweis für 100 Teilnehmer, gleichzeitige Transaktionen
und Kundenfreigabe bleibt separat. Lösungen weder in dieses Protokoll noch in Screenshots übernehmen.

Öffentliche Anleitung: Kunde bestätigt sichtbare aktuelle Punktetabelle ohne Konfigurationsfehler.
Vollständiger Spielablauf einschließlich echter Cron-Ausführung, Antworten/Fehlversuchen und finalem
CSV-Export weiterhin offen; Einrichtungsbestätigungen sind keine vollständige Kundenabnahme.
