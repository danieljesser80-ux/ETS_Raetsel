# Kundenanforderungen – Weihnachtsfeierspiel

**Dokument-ID:** DOC-002 | **Version:** 0.19 | **Datum:** 14.11.2026

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
| KAN-011 | Die Buchstaben des gemeinsamen Gruppenworts werden möglichst gleichmäßig auf die Gruppenmitglieder verteilt. | Bestätigt; Verteilung präzisiert durch OFF-064 | Alle Zeichen des konfigurierten Wortes werden genau einmal verteilt; die Buchstabenanzahl pro Mitglied unterscheidet sich höchstens um eins. Bei kürzeren Wörtern können Mitglieder keine Buchstaben erhalten. |
| KAN-012 | Die Gruppe trägt ihr Lösungswort in der Weboberfläche ein. | Bestätigt | Eine Gruppe kann eine Antwort zu ihrer eigenen Wortaufgabe abgeben. |
| KAN-013 | Es wird erfasst, welche Gruppe ihr richtiges Wort als erste, zweite und weitere gelöst hat. | Bestätigt | Jede erfolgreich gelöste Gruppe erhält einen nachvollziehbaren Platz in der Lösungsreihenfolge. |
| KAN-014 | Auf Basis der Lösungsreihenfolge werden Punkte vergeben. | Bestätigt; Punkte gemäß ENT-006 | Die Punkte jeder Gruppe entsprechen der in ENT-006 festgelegten Punktetabelle. |
| KAN-015 | Das Spiel soll verschiedene Aufgabenkategorien enthalten. | Bestätigt; erster Release nur Wortaufgabe (ENT-007) | Der erste Release enthält die Wortaufgabe; weitere Kategorien folgen als eigene Änderungsanträge. |
| KAN-052 | Die Beamer-Ansicht zeigt je Gruppe Gruppennamen, alle Mitgliedernamen in Klammern und die aktuelle Punktzahl in einer gemeinsamen Zeile. | Bestätigt (OFF-064) | Keine Meldung „Gruppe komplett“; Punkte werden während des Spiels live aktualisiert. |
| KAN-053 | Aufgabencluster zeigen den erledigten Anteil im Format `erledigt/Gesamtzahl erledigt`. | Bestätigt (OFF-064) | Beispiel `3/8 erledigt`; Zähler aktualisiert sich nach jeder abgeschlossenen Aufgabe. |
| KAN-054 | Schwierigkeitsstufen werden überall als farbige Tags mit Text angezeigt. | Bestätigt (OFF-064) | Leicht = blau, Mittel = rot, Schwer = schwarz; der Tag enthält den jeweiligen Klartext. |
| KAN-055 | Nach dem Absenden einer Antwort wird die Rückmeldung eine Sekunde angezeigt. | Bestätigt (OFF-064) | Gilt für richtige und falsche Antworten bei Startwort und Folgeaufgaben. |
| KAN-056 | Die Wortauswahl im Starträtsel verwendet ausschließlich die vom Spielleiter in der Admin-Konfiguration hinterlegte Wortliste, ohne automatische Längen- oder Schwierigkeitsfilter. | Bestätigt (OFF-064) | Jedes konfigurierte A–Z-Wort ist auswählbar; alle Zeichen werden möglichst gleichmäßig verteilt. |
| KAN-057 | Auch Nicht-Spielleiter können die Beamer-Ansicht auf ihrem Smartphone öffnen. | Bestätigt (OFF-064) | Nicht-Spielleiter sehen ausschließlich die Anzeige und erhalten keine Spielsteuerung. |
| KAN-058 | Beim Aufgeben bleibt der Hinweis auf null Punkte immer sichtbar; der Hinweis auf die Spielleiterrolle erscheint nur beim Starträtsel. | Bestätigt (OFF-064) | Bei Folgeaufgaben wird der Spielleiter-Hinweis nicht angezeigt. |

### 1.1 Gesammelte Aufgabenideen, noch keine Umsetzungsvorgaben

| Kategorie/Idee | Herkunft | Einordnung |
|---|---|---|
| Action: maximale Anzahl Liegestütze | Kunde | Aufgabenidee; Regeln und Ergebniserfassung offen |
| Schätzquiz: „anzahl locker“ | Kunde | Bedeutung und Zielgröße unklar; siehe ENT-008 |
| Wissensquiz: Patentnummer Motorwagen | Kunde | Aufgabenidee; konkrete Frage und gültige Antwort offen |
| Foto-Suche/Geocaching: Gegenstand anhand eines Fotos finden, Nummer unter dem Gegenstand | Kunde | Aufgabenidee; Antwortformat und Durchführung offen |
| Geschicklichkeit, Turmbau, Weihnachtswissen, Musik, Nahaufnahmen, Gerüche, Gedächtnis, Kreativaufgaben | Bisherige Beratung | Vorschläge, nicht beauftragt |

## 2. Entscheidungen

Die Entscheidungen vom 05.11.2026 sind gemäß AEN-004 vom Kunden getroffen. **ENT-008 bleibt offen**. Die in OFF-064 bestätigten Präzisierungen zu Wortverteilung und Antwortintervall sind in diesem Branch umgesetzt; die übrigen Entscheidungen werden gemäß ihrem jeweiligen Änderungsantrag verfolgt. Die Gruppengröße wurde gegenüber dem Vorschlag von ENT-003 auf vier bis sechs erweitert; die frühere Wortlängenregel aus ENT-009 wurde durch OFF-064 aufgehoben.

| ID | Entscheidung | Betroffene Anforderungen | Stand |
|---|---|---|---|
| ENT-001 | Bedeutet „max 5 min 4“ tatsächlich vier bis fünf Spieler pro Gruppe? | KAN-007 | **Entschieden:** vier bis fünf; durch ENT-003 auf bis zu sechs erweitert. |
| ENT-002 | Wer startet den Countdown? Wie wird „alle angemeldet“ erkannt: Admin-Abschluss, bekannte Sollzahl oder anderer Mechanismus? Was geschieht bei Zeitablauf ohne vollständige Teilnahme? | KAN-005, KAN-006 | **Entschieden:** Der Admin startet die Anmeldung, kann sie vorzeitig schließen und löst die Gruppeneinteilung aus. |
| ENT-003 | Wie werden Teilnehmerzahlen behandelt, die sich nicht in Vierer-/Fünfergruppen aufteilen lassen, sowie weniger als vier Teilnehmer und keine Teilnehmer? | KAN-006, KAN-007 | **Entschieden:** Gruppen mit vier bis sechs Mitgliedern statt Dreiergruppen. Das löst 6 und 11 Teilnehmer; bei 7 sowie 1 bis 3 Teilnehmern gibt es keine automatische Einteilung, der Admin öffnet die Anmeldung erneut oder entscheidet. Details der Admin-Entscheidung sind noch zu spezifizieren. |
| ENT-004 | Werden Gruppen zufällig oder nach anderen Regeln gebildet? Wie werden Gruppennamen vergeben? | KAN-007, KAN-008 | **Entschieden:** zufällige Einteilung; Gruppennamen aus fester weihnachtlicher Liste ohne Wiederholung. |
| ENT-005 | Wer darf die Gruppenantwort eingeben? Wie werden Groß-/Kleinschreibung, Leerzeichen, Umlaute und falsche Versuche behandelt? Wann beginnt die Wortaufgabe? | KAN-010 bis KAN-013, KAN-055 / OFF-064 | **Entschieden:** Jedes Mitglied darf einreichen; Aufgabe beginnt mit der Einteilung; Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; Wörter ohne Umlaute und ß; falsche Versuche zulässig, pro Gruppe höchstens alle 1 Sekunde. Antwort-Rückmeldungen bei Wort- und Folgeaufgaben dauern 1 Sekunde. |
| ENT-006 | Welche Punkteformel und welche Regel für praktisch gleichzeitige Lösungen gelten? Wird eine Rangliste angezeigt, und wem? | KAN-013, KAN-014 | **Entschieden:** Maßgeblich ist die serverseitige Eingangsreihenfolge. Punkte: Platz 1 bis 8 erhalten 10, 8, 6, 5, 4, 3, 2, 1; alle weiteren Plätze 1 Punkt. Die Rangliste sehen nur Admin/Beamer. |
| ENT-007 | Welche Kategorien gehören zum ersten Release? Wie viele Aufgaben gibt es, in welcher Reihenfolge und mit welchen Regeln? | KAN-015 | **Entschieden:** Erster Release nur Wortaufgabe; weitere Kategorien als eigene Änderungsanträge. |
| ENT-008 | Was bedeutet „anzahl locker“? Welcher Motorwagen beziehungsweise welches Patent ist gemeint? | KAN-015 | **Offen**, aber nicht Teil des ersten Releases (ENT-007). Vor Aufnahme in eine spätere Aufgabe sind Inhalt und Lösung zu klären. |
| ENT-009 | Wie werden Wörter ausgewählt? Ein Buchstabe pro Person legt Wortlänge gleich Gruppengröße nahe; gewünschte Schwierigkeit und Mehrdeutigkeit sind festzulegen. | KAN-011, KAN-012, KAN-056 | **Geändert durch OFF-064:** Der Spielleiter pflegt die Wortliste selbst in der Admin-Konfiguration. Jedes eindeutige A–Z-Wort ist unabhängig von Gruppenstärke, Länge und Schwierigkeit auswählbar; es gibt keinen automatischen Längen-/Schwierigkeitsfilter. Alle Zeichen werden möglichst gleichmäßig verteilt. Bei kürzeren Wörtern können Mitglieder leer ausgehen, bei längeren mehr als zwei Buchstaben erhalten. |
| ENT-010 | Sind doppelte Spitznamen erlaubt? Wie erfolgen Wiederzugang, Gerätewechsel und Umgang mit Aussteigern? | KAN-004, KAN-009 | **Entschieden:** Spitznamen mit 2 bis 20 Zeichen, ohne Beachtung der Groß-/Kleinschreibung eindeutig; Wiederzugang nur im selben Browser; Gerätewechsel nicht unterstützt. Aussteiger bleiben in ihrer Gruppe (Annahme aus dem bestätigten Vorschlag). |
| ENT-011 | Ist GitHub Pages plus Supabase die freigegebene Plattform? Wer besitzt Konten und betreibt die Anwendung? | ARC-001 bis ARC-005 | **Entschieden:** GitHub Pages plus Supabase. Die Konten gehören dem Kunden; Copilot bereitet Anwendung und Konfiguration vor. Das Anlegen der Konten und Freigaben erfolgt durch den Kunden. |
| ENT-012 | Wie lange werden Namen und Ergebnisse gespeichert, wer darf sie sehen und wer löscht sie? | SWA-014, ARC-005 | **Entschieden:** Nur Spitznamen und Ergebnisse speichern; Admin sieht alles, Spieler nur die eigene Gruppe; Löschung spätestens 7 Tage nach der Feier. |
| ENT-013 | Welche Browser und Geräte sowie welche Reaktionszeiten müssen unterstützt werden? | SWA-002, SWA-013 | **Entschieden:** Aktuelle Chrome- und Safari-Versionen auf Smartphones. Zielwerte: Zustandswechsel innerhalb von 3 Sekunden, Antwortbestätigung innerhalb von 2 Sekunden. |

### 2.1 Wortliste (vom Kunden angepasst, Freigabe ausstehend)

25 Wörter, ohne Umlaute und ß (ENT-009, AEN-005). Gestrichen: SPURHALTER, AUSPUFF, DIESEL; RECUPERATION zu REKUPERATION korrigiert; INVERTER ergänzt.

- 4–6 Buchstaben: AKKU, MOTOR, RADAR, TURBO, REIFEN, BREMSE, HYBRID, SENSOR, INVERTER (8)
- 7–9: BATTERIE, WALLBOX, GETRIEBE, KUPPLUNG, LENKRAD, FAHRWERK, LADEKABEL
- 10–12: LADESAEULE, KAROSSERIE, REICHWEITE, REKUPERATION, ELEKTROMOTOR, STROMLADER, SCHEINWERFER, WECHSELRICHTER, STEUERGERAET

Hinweis: Diese historische Wortliste ist nur ein Beispiel. Die aktive Wortliste wird vom Spielleiter in der Admin-Konfiguration gepflegt. OFF-064 hebt die automatische Längen- und Schwierigkeitsfilterung auf; die Auswahl erfolgt serverseitig aus allen konfigurierten Wörtern.

### 3.1 Historische Entscheidungsvorschläge (nur Entscheidungsvorbereitung)

Diese Vorschläge sind **keine maßgebliche Quelle**. Maßgeblich sind die Entscheidungen in Abschnitt 2. Abweichungen: ENT-003 (vier bis sechs statt Dreiergruppen), ENT-006 (feste Punkte, Rangliste nur Admin/Beamer), ENT-009 (Wortauswahl durch Admin ohne Längen-/Schwierigkeitsfilter gemäß OFF-064) und ENT-011 (Konten liegen beim Kunden).

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

## 4. Ergänzende Softwareanforderungen (AEN-062 / OFF-064)

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-058 | Beamer-Ranglistenzeile zeigt Gruppenname, Mitgliedernamen in Klammern und Punkte in einer Zeile; Namen bleiben nach Wortlösung sichtbar. | KAN-052 | Beamer zeigt alle Gruppenmitglieder und laufende Punkte, ohne „Gruppe komplett“. |
| SWA-059 | Aufgabencluster zählen abgeschlossene Aufgaben und Gesamtaufgaben. | KAN-053 | Anzeige `n/m erledigt`, Zähler basiert auf dem serverseitigen Abgabestatus. |
| SWA-060 | Schwierigkeit wird als Tag mit Text und Farbklasse dargestellt. | KAN-054 | Alle Aufgabenansichten verwenden Leicht/blau, Mittel/rot, Schwer/schwarz. |
| SWA-061 | Antwort-Rückmeldung wird nach 1000 ms ausgeblendet; das serverseitige Wiederholungsintervall des Starträtsels beträgt ebenfalls 1000 ms. | KAN-055 | Richtige und falsche Antworten in Wort- und Folgeaufgaben verwenden denselben Wert; 999 ms werden abgewiesen, ab 1000 ms ist ein neuer Versuch möglich. |
| SWA-062 | Admin-Wörter werden ohne automatische Längen-/Schwierigkeitsfilter ausgewählt; Buchstabenverteilung ist unabhängig von Wortlänge. | KAN-056 | Jedes gültige A–Z-Wort wird akzeptiert; jedes Zeichen genau einmal, Anzahl je Mitglied unterscheidet sich höchstens um eins. |
| SWA-063 | Beamerzugriff ist zusätzlich mit einer registrierten Supabase-Spielersitzung möglich und bleibt read-only. | KAN-057 | Nur registrierte Spieler erhalten die Anzeige; anonyme Nichtspieler ohne Token werden abgewiesen; keine Steuerungselemente. |
| SWA-064 | Aufgeben-Hinweise unterscheiden Starträtsel und Folgeaufgaben. | KAN-058 | Null-Punkte-Hinweis immer; Spielleiter-Hinweis ausschließlich beim Gruppenwort. |
