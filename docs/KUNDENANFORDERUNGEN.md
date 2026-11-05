# Kundenanforderungen – Weihnachtsfeierspiel

**Dokument-ID:** DOC-002 | **Version:** 0.4 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Initiale Kundenanforderungen

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-001 | Das Spiel dient einer privaten Weihnachtsfeier. | Bestätigt | Das Nutzungsszenario wird ohne Unternehmenssysteme umgesetzt. |
| KAN-002 | Maximal 100 Spieler können an einer Spielrunde teilnehmen. | Bestätigt | 100 Teilnehmer können registriert und im Spiel geführt werden; der 101. Teilnehmer wird verständlich abgewiesen. |
| KAN-003 | Potenzielle Spieler erhalten einen QR-Code, der auf die Spielwebsite führt. | Bestätigt | Ein Scan mit einem Smartphone öffnet die Einstiegsseite der vorgesehenen Runde. |
| KAN-004 | Spieler tragen ihren Namen oder Spitznamen auf der Website ein. | Bestätigt | Eine erfolgreiche Anmeldung führt zu einem Teilnehmer mit dem eingegebenen Anzeigenamen. |
| KAN-005 | Die Anmeldezeit beträgt fünf Minuten und wird als globaler Countdown angezeigt. | Bestätigt | Alle Geräte beziehen sich auf denselben Anmeldeschluss; nach fünf Minuten ist die Anmeldung geschlossen. |
| KAN-006 | Wenn alle angemeldet sind, werden die Gruppen eingeteilt. | Bestätigt; Auslösung durch Admin (ENT-002) | Die Einteilung erfolgt nach abgeschlossener Anmeldung auf Auslösung durch den Admin. |
| KAN-007 | Die Gruppen haben vier bis sechs Mitglieder. Ursprüngliche Vorgabe: vier bis fünf; Erweiterung auf sechs gemäß AEN-004/ENT-003. | Bestätigt (geändert durch AEN-004) | Jede gebildete Gruppe hat vier bis sechs Mitglieder; nicht aufteilbare Teilnehmerzahlen folgen ENT-003. |
| KAN-008 | Jede Gruppe bekommt einen Namen. | Bestätigt | Jede gebildete Gruppe besitzt einen angezeigten Gruppennamen. |
| KAN-009 | Jeder Spieler erfährt, welcher Gruppe er angehört. | Bestätigt | Nach Einteilung sieht jeder angemeldete Spieler seine eigene Gruppenzuordnung. |
| KAN-010 | Die erste Aufgabe lautet: Finde deine Gruppenmitglieder. | Bestätigt | Die erste Aufgabe wird den Teilnehmern nach Gruppeneinteilung angezeigt. |
| KAN-011 | Jedes Mitglied erhält ein bis zwei Buchstaben eines gemeinsamen Lösungswortes. Ursprüngliche Vorgabe: ein Buchstabe; Erweiterung gemäß AEN-004/ENT-009. | Bestätigt (geändert durch AEN-004) | Jedes Mitglied sieht seine persönlichen Buchstaben; zusammen bilden die Buchstaben aller Mitglieder das Gruppenwort. |
| KAN-012 | Die Gruppe trägt ihr Lösungswort in der Weboberfläche ein. | Bestätigt | Eine Gruppe kann eine Antwort zu ihrer eigenen Wortaufgabe abgeben. |
| KAN-013 | Es wird erfasst, welche Gruppe ihr richtiges Wort als erste, zweite und weitere gelöst hat. | Bestätigt | Jede erfolgreich gelöste Gruppe erhält einen nachvollziehbaren Platz in der Lösungsreihenfolge. |
| KAN-014 | Auf Basis der Lösungsreihenfolge werden Punkte vergeben. | Bestätigt; Punkte gemäß ENT-006 | Die Punkte jeder Gruppe entsprechen der in ENT-006 festgelegten Punktetabelle. |
| KAN-015 | Das Spiel soll verschiedene Aufgabenkategorien enthalten. | Bestätigt; erster Release nur Wortaufgabe (ENT-007) | Der erste Release enthält die Wortaufgabe; weitere Kategorien folgen als eigene Änderungsanträge. |

### 1.1 Gesammelte Aufgabenideen, noch keine Umsetzungsvorgaben

| Kategorie/Idee | Herkunft | Einordnung |
|---|---|---|
| Action: maximale Anzahl Liegestütze | Kunde | Aufgabenidee; Regeln und Ergebniserfassung offen |
| Schätzquiz: „anzahl locker“ | Kunde | Bedeutung und Zielgröße unklar; siehe ENT-008 |
| Wissensquiz: Patentnummer Motorwagen | Kunde | Aufgabenidee; konkrete Frage und gültige Antwort offen |
| Foto-Suche/Geocaching: Gegenstand anhand eines Fotos finden, Nummer unter dem Gegenstand | Kunde | Aufgabenidee; Antwortformat und Durchführung offen |
| Geschicklichkeit, Turmbau, Weihnachtswissen, Musik, Nahaufnahmen, Gerüche, Gedächtnis, Kreativaufgaben | Bisherige Beratung | Vorschläge, nicht beauftragt |

## 2. Entscheidungen

Die Entscheidungen vom 05.11.2026 sind gemäß AEN-004 vom Kunden getroffen. **ENT-008 bleibt offen**; die anderen Entscheidungen sind noch nicht in die Architektur, Implementierung und Tests umgesetzt. Die Gruppengröße wurde gegenüber dem Vorschlag von ENT-003 auf vier bis sechs erweitert; Wortregeln von ENT-009 auf ein bis zwei Buchstaben pro Spieler.

| ID | Entscheidung | Betroffene Anforderungen | Stand |
|---|---|---|---|
| ENT-001 | Bedeutet „max 5 min 4“ tatsächlich vier bis fünf Spieler pro Gruppe? | KAN-007 | **Entschieden:** vier bis fünf; durch ENT-003 auf bis zu sechs erweitert. |
| ENT-002 | Wer startet den Countdown? Wie wird „alle angemeldet“ erkannt: Admin-Abschluss, bekannte Sollzahl oder anderer Mechanismus? Was geschieht bei Zeitablauf ohne vollständige Teilnahme? | KAN-005, KAN-006 | **Entschieden:** Der Admin startet die Anmeldung, kann sie vorzeitig schließen und löst die Gruppeneinteilung aus. |
| ENT-003 | Wie werden Teilnehmerzahlen behandelt, die sich nicht in Vierer-/Fünfergruppen aufteilen lassen, sowie weniger als vier Teilnehmer und keine Teilnehmer? | KAN-006, KAN-007 | **Entschieden:** Gruppen mit vier bis sechs Mitgliedern statt Dreiergruppen. Das löst 6 und 11 Teilnehmer; bei 7 sowie 1 bis 3 Teilnehmern gibt es keine automatische Einteilung, der Admin öffnet die Anmeldung erneut oder entscheidet. Details der Admin-Entscheidung sind noch zu spezifizieren. |
| ENT-004 | Werden Gruppen zufällig oder nach anderen Regeln gebildet? Wie werden Gruppennamen vergeben? | KAN-007, KAN-008 | **Entschieden:** zufällige Einteilung; Gruppennamen aus fester weihnachtlicher Liste ohne Wiederholung. |
| ENT-005 | Wer darf die Gruppenantwort eingeben? Wie werden Groß-/Kleinschreibung, Leerzeichen, Umlaute und falsche Versuche behandelt? Wann beginnt die Wortaufgabe? | KAN-010 bis KAN-013 | **Entschieden:** Jedes Mitglied darf einreichen; Aufgabe beginnt mit der Einteilung; Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; Wörter ohne Umlaute und ß; falsche Versuche zulässig, pro Gruppe höchstens alle 3 Sekunden. |
| ENT-006 | Welche Punkteformel und welche Regel für praktisch gleichzeitige Lösungen gelten? Wird eine Rangliste angezeigt, und wem? | KAN-013, KAN-014 | **Entschieden:** Maßgeblich ist die serverseitige Eingangsreihenfolge. Punkte: Platz 1 bis 8 erhalten 10, 8, 6, 5, 4, 3, 2, 1; alle weiteren Plätze 1 Punkt. Die Rangliste sehen nur Admin/Beamer. |
| ENT-007 | Welche Kategorien gehören zum ersten Release? Wie viele Aufgaben gibt es, in welcher Reihenfolge und mit welchen Regeln? | KAN-015 | **Entschieden:** Erster Release nur Wortaufgabe; weitere Kategorien als eigene Änderungsanträge. |
| ENT-008 | Was bedeutet „anzahl locker“? Welcher Motorwagen beziehungsweise welches Patent ist gemeint? | KAN-015 | **Offen**, aber nicht Teil des ersten Releases (ENT-007). Vor Aufnahme in eine spätere Aufgabe sind Inhalt und Lösung zu klären. |
| ENT-009 | Wie werden Wörter ausgewählt? Ein Buchstabe pro Person legt Wortlänge gleich Gruppengröße nahe; gewünschte Schwierigkeit und Mehrdeutigkeit sind festzulegen. | KAN-011, KAN-012 | **Entschieden:** Jeder Spieler erhält ein bis zwei Buchstaben. Wortlänge liegt zwischen Gruppengröße und doppelter Gruppengröße; überschüssige Buchstaben gehen zufällig an einzelne Spieler. Wörter stammen aus dem Umfeld Automobil und Elektromobilität, ohne Umlaute und ß. Die konkrete Wortliste steht in Abschnitt 2.1 (Freigabe ausstehend). |
| ENT-010 | Sind doppelte Spitznamen erlaubt? Wie erfolgen Wiederzugang, Gerätewechsel und Umgang mit Aussteigern? | KAN-004, KAN-009 | **Entschieden:** Spitznamen mit 2 bis 20 Zeichen, ohne Beachtung der Groß-/Kleinschreibung eindeutig; Wiederzugang nur im selben Browser; Gerätewechsel nicht unterstützt. Aussteiger bleiben in ihrer Gruppe (Annahme aus dem bestätigten Vorschlag). |
| ENT-011 | Ist GitHub Pages plus Supabase die freigegebene Plattform? Wer besitzt Konten und betreibt die Anwendung? | ARC-001 bis ARC-005 | **Entschieden:** GitHub Pages plus Supabase. Die Konten gehören dem Kunden; Copilot bereitet Anwendung und Konfiguration vor. Das Anlegen der Konten und Freigaben erfolgt durch den Kunden. |
| ENT-012 | Wie lange werden Namen und Ergebnisse gespeichert, wer darf sie sehen und wer löscht sie? | SWA-014, ARC-005 | **Entschieden:** Nur Spitznamen und Ergebnisse speichern; Admin sieht alles, Spieler nur die eigene Gruppe; Löschung spätestens 7 Tage nach der Feier. |
| ENT-013 | Welche Browser und Geräte sowie welche Reaktionszeiten müssen unterstützt werden? | SWA-002, SWA-013 | **Entschieden:** Aktuelle Chrome- und Safari-Versionen auf Smartphones. Zielwerte: Zustandswechsel innerhalb von 3 Sekunden, Antwortbestätigung innerhalb von 2 Sekunden. |

### 2.1 Wortliste (vom Kunden angepasst, Freigabe ausstehend)

25 Wörter, ohne Umlaute und ß (ENT-009, AEN-005). Gestrichen: SPURHALTER, AUSPUFF, DIESEL; RECUPERATION zu REKUPERATION korrigiert; INVERTER ergänzt.

- 4–6 Buchstaben: AKKU, MOTOR, RADAR, TURBO, REIFEN, BREMSE, HYBRID, SENSOR, INVERTER (8)
- 7–9: BATTERIE, WALLBOX, GETRIEBE, KUPPLUNG, LENKRAD, FAHRWERK, LADEKABEL
- 10–12: LADESAEULE, KAROSSERIE, REICHWEITE, REKUPERATION, ELEKTROMOTOR, STROMLADER, SCHEINWERFER, WECHSELRICHTER, STEUERGERAET

Hinweis: Die Wortlänge muss zur Gruppengröße passen (Länge von Gruppengröße bis doppelte Gruppengröße). Bei 4er-Gruppen sind 4 bis 8 Buchstaben möglich, bei 6er-Gruppen 6 bis 12. Die Auswahl je Gruppe erfolgt serverseitig.

### 3.1 Historische Entscheidungsvorschläge (nur Entscheidungsvorbereitung)

Diese Vorschläge sind **keine maßgebliche Quelle**. Maßgeblich sind die Entscheidungen in Abschnitt 2. Abweichungen: ENT-003 (vier bis sechs statt Dreiergruppen), ENT-006 (feste Punkte, Rangliste nur Admin/Beamer), ENT-009 (ein bis zwei Buchstaben, Automobil-/Elektromobilitätsthemen) und ENT-011 (Konten liegen beim Kunden).

| ENT | Vorschlag | Begründung / Folge |
|---|---|---|
| ENT-001 | Vier bis fünf Spieler pro Gruppe. | Entspricht der wahrscheinlichsten Lesart von „max 5 min 4“. |
| ENT-002 | Admin startet die fünf Minuten und kann vorzeitig schließen. Nach Ablauf oder Abschluss löst der Admin die Gruppeneinteilung aus. Spieler melden sich nicht mehr an. | Das System kann „alle angemeldet“ nicht selbst erkennen; manuelle Auslösung verhindert versehentliche Einteilung. |
| ENT-003 | Weniger als 3 Teilnehmer: Einteilung nicht möglich, Anmeldung kann vom Admin erneut geöffnet werden. Sonst Vierer-/Fünfergruppen; wenn nicht aufgehend (6, 7, 11 Spieler), werden möglichst wenige Dreiergruppen gebildet. | Nur 6, 7 und 11 Teilnehmer lassen sich bis 100 nicht in Vierer-/Fünfergruppen teilen. Dreiergruppen erhalten ein dreibuchstabiges Wort. |
| ENT-004 | Zufällige Einteilung; Gruppennamen aus fester Liste weihnachtlicher Begriffe ohne Wiederholung. | Einfach, fair und nachvollziehbar. |
| ENT-005 | Jedes Gruppenmitglied darf einreichen. Wortaufgabe beginnt mit der Gruppeneinteilung. Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; Wörter ohne Umlaute und ß. Falsche Versuche sind erlaubt, pro Gruppe jedoch nur alle 3 Sekunden. | Vermeidet Normalisierungsprobleme und blindes Raten. |
| ENT-006 | Platz p erhält max(1, G − p + 1) Punkte (G = Gruppenzahl). Reihenfolge ist der serverseitige Eingang; Gleichstände gibt es nicht. Spieler sehen die eigene Platzierung; Admin/Beamer sehen die Rangliste. | Einfache, anwendbare Formel unabhängig von der Gruppenzahl. |
| ENT-007 | Erster Release enthält nur die Wortaufgabe. Weitere Kategorien folgen als eigene Änderungsanträge. | Die übrigen Ideen sind noch nicht spezifiziert (SWA-016). |
| ENT-008 | Bleibt offen und braucht Kundeninhalt. „anzahl locker“ ist unklar. Für das Patent muss die Nummer vor Verwendung gegen eine verlässliche Quelle geprüft werden. | Keine Aufgabe ohne eindeutige Lösung implementieren. |
| ENT-009 | Weihnachtliche Wörter ohne Umlaute und ß, getrennte Liste für 3, 4 und 5 Buchstaben, zufällige Buchstabenverteilung, ein Wort pro Runde nur einmal. Wortliste wird vom Kunden freigegeben. | Wortlänge entspricht der Gruppengröße; ähnliche Schwierigkeit je Länge. |
| ENT-010 | Spitznamen 2 bis 20 Zeichen und ohne Beachtung der Groß-/Kleinschreibung eindeutig. Wiederzugang nur im selben Browser. Gerätewechsel nicht unterstützt; Aussteiger bleiben in der Gruppe. | Reduziert Verwechslungen ohne Konten. |
| ENT-011 | GitHub Pages plus Supabase. Konten und Betrieb liegen beim Kunden. | Entspricht der bisherigen Empfehlung. |
| ENT-012 | Nur Spitznamen und Spielergebnisse speichern; Admin sieht alles, Spieler nur die eigene Gruppe. Löschung durch den Kunden spätestens 7 Tage nach der Feier. | Datensparsam für eine private Feier. |
| ENT-013 | Aktuelle Chrome- und Safari-Versionen auf Smartphones. Zustandswechsel möglichst innerhalb von 3 Sekunden, Antwortbestätigung typischerweise innerhalb von 2 Sekunden. | Zielwerte, noch nicht gemessen. |
