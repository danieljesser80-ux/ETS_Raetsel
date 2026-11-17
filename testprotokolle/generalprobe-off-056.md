# Generalprobe OFF-056 – zwei Gruppen

**Status:** geplant, nicht ausgeführt. **Stand:** 15.11.2026. Referenz: DOC-001, DOC-006, OFF-056. Softwarestand vor Durchführung: tatsächlichen main-/Pages-Commit eintragen. Keine Freigabe oder Live-Aktion durch dieses Dokument.

## Vorbereitung (10–15 Minuten)

- Admin-PC, Beamer/zweites Fenster, idealerweise 8 Smartphones bzw. unabhängige Browserprofile (4 Personen je Gruppe). Mindestens zwei echte Smartphones; weitere Sitzungen dürfen simuliert sein, dann im Protokoll vermerken. Keine zwei Teilnehmer im selben Browserprofil.
- Testnamen GP01–GP08; keine echten Namen, Lösungen oder Admincodes im Repository.
- [Spiel](https://danieljesser80-ux.github.io/ETS_Raetsel/) und [Admin](https://danieljesser80-ux.github.io/ETS_Raetsel/admin.html) öffnen. Pages-Version, Datum, Geräte/Browser notieren.
- **Nur in einem ausdrücklich freigegebenen Testzeitfenster:** keine echte Runde aktiv. Vorhandene Ergebnisse ggf. CSV sichern. Konfiguration privat sichern: Gruppengröße, Spielzeit, Wortliste, Aufgaben einschließlich Lösungen/Bildern, Schwierigkeiten, Punktestaffeln. CSV ist kein Konfigurationsbackup. Kein Import/Reset ohne ausdrückliche Freigabe des Betreibers.
- Admin-Reset löscht laut aktuellem schema.sql Teilnehmer, Gruppen, Antworten, Zeiten, Ergebnisse und Anzeigetokens; Aufgaben und Konfiguration bleiben erhalten. Vor Nutzung tatsächlichen Zustand prüfen. Bei Unsicherheit abbrechen. Nach Reset neue Beamerseite öffnen.
- Vorbereitung: Gruppengröße temporär 4–4, mindestens zwei gültige eindeutige Wörter, vollständige Aufgaben, gültige Punktestaffeln; Spielzeit 25 Minuten (oder bewusst kürzer, falls ausreichend für alle Schritte). Originalwerte notieren. Bereits vorhandene Aufgaben nicht durch Testimport ersetzen. „Bereit zum Start“ und Cron-Bereitschaft prüfen.
- Für die Probe zwei Aufgaben auswählen: X für beide Gruppen richtig, Y für Fehlversuche/Aufgeben; weitere Z für Ablaufprüfung. Lösungen nur privat beim Admin bereithalten. Falls zu wenige Aufgaben: Test blockiert, keine ungefragte Änderung.

## Ablauf (ca. 40–55 Minuten inklusive Vorbereitung)

| Nr. | Aktion | Erwartung | Ergebnis |
|---|---|---|---|
| GP-01 | Admin öffnet Anmeldung, GP01–GP08 scannen QR bzw. öffnen Spiel, melden sich an. | 8 Teilnehmer, gleicher Countdown, keine Unternehmensanmeldung; Admin zeigt Namen. | offen |
| GP-02 | Anmeldung regulär ablaufen lassen oder bewusst früh schließen; Gruppen einteilen. | Genau zwei Gruppen mit je 4 Mitgliedern, jeder genau einmal; keine Fehlermeldung; Spielzeit startet. | offen |
| GP-03 | Beamer aus Admin separat öffnen; je ein Nicht-Spielleiter öffnet mobile Bestenliste. | Admin bleibt bedienbar, 8 Teilnehmer/2 Gruppen, gleiche Zeit und Live-Daten; Projektor eine Zeile je Team, Mitglieder in Klammern, Statistik rechts. | offen |
| GP-04 | Gruppe A sammelt Buchstaben, prüft Vollständigkeit und löst Gruppenwort richtig. | Genau alle Zeichen, gleichmäßige Verteilung; erster richtiger Spieler wird Spielleiter, Punkte laut gespeicherter Staffel, Aufgaben freigeschaltet. | offen |
| GP-05 | Gruppe B gibt Gruppenwort nach Bestätigung auf. | Hinweis 0 Punkte und Spielleiterrolle; endgültig 0 Punkte, bestätigender Spieler wird Spielleiter, Aufgaben freigeschaltet. | offen |
| GP-06 | Beide Spielleiter prüfen Übersicht und Kategorien; Nicht-Spielleiter prüfen eigene Ansicht. | Live-Punkte/Platz/Fortschritt, kein Bestenlistenlink beim Spielleiter; Nicht-Spielleiter read-only; keine Spielleiter-Hinweise in Folgeaufgaben; leicht blau, mittel rot, schwer schwarz. | offen |
| GP-07 | Beide Gruppen öffnen X; A löst zuerst richtig, B danach richtig. | Je eigene Aufgabenzeit, Rückmeldung etwa 1 s, gespeicherte Zeiten nach Abschluss stabil; Punkte gemäß Schwierigkeit und Lösungsreihenfolge. | offen |
| GP-08 | A öffnet Y, gibt drei falsche Antworten mit zulässigem Abstand ab. | Nach 1/2 bleibt Aufgabe offen; nach 3 endgültig abgeschlossen, 0 Punkte, Rückkehr zur Übersicht; Fortschritt steigt. | offen |
| GP-09 | B öffnet Y, bricht Aufgeben-Dialog einmal ab, bestätigt danach. | Abbruch ohne Abschluss; Bestätigung endgültig 0 Punkte, keine Spielleiter-Übernahme; Fortschritt steigt. | offen |
| GP-10 | Während der Runde mobile Bestenliste und Beamer mit Admin vergleichen; ein Smartphone neu laden und kurz offline/online schalten. | Gleiche Gruppenpunkte/Plätze, keine doppelte Teilnahme, Wiederverbindung und korrekter Zustand; keine unberechtigten Steuerungselemente. | offen |
| GP-11 | Eine noch offene Aufgabe Z starten, nicht abschließen; Restzeit beobachten. | Warnungen bei konfigurierten Schwellen; Zeit läuft weiter, keine vorzeitige Beendigung. | offen |
| GP-12 | Countdown auf 0 laufen lassen, nicht manuell beenden. | Automatisches serverseitiges Ende; keine verspätete Antwort akzeptiert; finale Rangliste stabil. Für unabhängigen Cron-Nachweis alle Clients vor Ablauf schließen und nach Frist wieder öffnen; Zeitpunkt serverseitig prüfen, falls verfügbar. Ohne diesen Nachweis nur automatisches Ende aus Nutzersicht bestätigen. | offen |
| GP-13 | Finale Admin-, Beamer- und Spielerwertung vergleichen; CSV herunterladen. | Gleiche Summen/Plätze; Aufgabenzeiten und Status nachvollziehbar; keine Lösungen, Admincodes oder eingegebenen Antworten im CSV. | offen |
| GP-14 | Nach ausdrücklicher Freigabe Ergebnisse sichern, Reset durchführen und Originalwerte wiederherstellen. | Runde vorbereitet, keine Testteilnehmer/-ergebnisse, Aufgaben/Wörter/Staffeln erhalten; Originalgruppengröße und Spielzeit wieder gespeichert; Bereitschaft geprüft. | offen |

## Punkte-Kontrollblatt (privat ausfüllen)

Vor Start tatsächliche Staffeln notieren. Erwartete Punkte unabhängig von der angezeigten Rangliste aus den gespeicherten Staffeln ableiten; keine festen Punktwerte erfinden.

| Aufgabe | A erwartet / tatsächlich | B erwartet / tatsächlich |
|---|---|---|
| Gruppenwort | erster Lösungsplatz / ___ | 0 / ___ |
| X | erster Lösungsplatz / ___ | zweiter Lösungsplatz / ___ |
| Y | 0 / ___ | 0 / ___ |
| Summe | ___ / ___ | ___ / ___ |

## Ergebnisprotokoll

- Datum/Uhrzeit, Prüfer, Pages-Commit, Geräte/Browser: ___
- Originalkonfiguration privat gesichert: ___
- GP-01–14: je bestanden / fehlgeschlagen / blockiert / nicht ausgeführt; Abweichung und Beleg (ohne Geheimnisse) ergänzen.
- CSV privat gesichert: ___; Reset ausdrücklich genehmigt: ___; Originalwerte wiederhergestellt: ___
- Gesamturteil: offen. Kundenfreigabe: offen.

Abbruch bei Datenverlustgefahr, falscher Gruppenzuordnung, falscher Wertung, nicht funktionierendem Spielende oder unberechtigtem Zugriff. Fehler reproduzierbar dokumentieren, keine Gesamtfreigabe bei kritischem Fehler. Zwei Gruppen ersetzen keinen Lasttest mit 100 Teilnehmern/25 Gruppen. Manuelles Spielende und vollständige 25-Gruppen-Layoutprüfung bleiben separate Prüfungen.

**Supabase:** kein Schemawechsel erforderlich; die Durchführung verändert jedoch Rundendaten und ggf. temporäre Konfiguration. Nur Betreiber führt diese Schritte aus.
