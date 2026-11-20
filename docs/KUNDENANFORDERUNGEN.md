# Kundenanforderungen – Weihnachtsfeierspiel

**Dokument-ID:** DOC-002 | **Version:** 0.30 | **Datum:** 20.11.2026

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
| KAN-053 | Aufgabencluster zeigen erledigte Anzahl und Gesamtzahl. | Bestätigt (OFF-064); Beschriftung geändert durch OFF-070 | Zähler wie `3/8` aktualisieren sich nach jeder abgeschlossenen Aufgabe; das Wort „erledigt“ wird nicht angezeigt. |
| KAN-054 | Schwierigkeitsstufen werden überall als farbige Tags mit Text angezeigt. | Bestätigt (OFF-064) | Leicht = blau, Mittel = rot, Schwer = schwarz; der Tag enthält den jeweiligen Klartext. |
| KAN-055 | Die ursprüngliche Rückmeldezeit von einer Sekunde wurde durch OFF-070 abgelöst. | Abgelöst (OFF-070) | Abschließende Rückmeldung dauert drei Sekunden; ein falscher Versuch mit Restversuchen bleibt bis zur nächsten Aktion sichtbar (KAN-071/072). |
| KAN-056 | Die Wortauswahl im Starträtsel verwendet ausschließlich die vom Spielleiter in der Admin-Konfiguration hinterlegte Wortliste, ohne automatische Längen- oder Schwierigkeitsfilter. | Bestätigt (OFF-064) | Jedes konfigurierte A–Z-Wort ist auswählbar; alle Zeichen werden möglichst gleichmäßig verteilt. |
| KAN-057 | Auch Nicht-Spielleiter können die Beamer-Ansicht auf ihrem Smartphone öffnen. | Bestätigt (OFF-064) | Nicht-Spielleiter sehen ausschließlich die Anzeige und erhalten keine Spielsteuerung. |
| KAN-058 | Beim Aufgeben bleibt der Hinweis auf null Punkte immer sichtbar; der Hinweis auf die Spielleiterrolle erscheint nur beim Starträtsel. | Bestätigt (OFF-064) | Bei Folgeaufgaben wird der Spielleiter-Hinweis nicht angezeigt. |

### 1.1 Ergänzte Kundenanforderungen (rekonstruiert)

Die folgenden Anforderungen sind aus AEN-/OFF-Nachweisen und den erhaltenen Architektur- und Testverträgen rekonstruiert. Unbekannter Originalwortlaut wird nicht behauptet. Als abgelöst gekennzeichnete Regeln bleiben nur zur Rückverfolgbarkeit erhalten.

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-016 | Automatisierte Tests können als schneller und vollständiger Lauf ausgeführt werden. | Bestätigt (AEN-020) | Der schnelle Lauf lässt Datenbanktests aus; der vollständige Lauf umfasst alle Tests. |
| KAN-017 | Aufgabenlösungen und Sperrliste bleiben außerhalb der öffentlichen Projektdateien. | Bestätigt (AEN-020) | Die Geheimnisprüfung meldet Treffer, ohne den geheimen Inhalt auszugeben. |
| KAN-018 | Eine Schätzfrage kann vier Antwortoptionen mit einer zusätzlichen Zahleneingabe verbinden. | Bestätigt (AEN-021) | Spieler wählen eine Option und geben die Schätzung ab; die bestehende Schätzwertung bleibt maßgeblich. |
| KAN-019 | Die ursprüngliche Regel sah genau einen Versuch je Rätsel vor. | Abgelöst durch KAN-028 (AEN-028) | Historische Ein-Versuch-Regel; für exakte Folgeaufgaben gilt stattdessen die Drei-Versuche-Regel. |
| KAN-020 | Aufgaben werden nach Antwortergebnis beziehungsweise Schätzungsnähe und Dauer gewertet; die finale Wertung wird nach Spielende angezeigt. | Bestätigt (AEN-021) | Exakte Antworten und Schätzungen folgen ihren jeweiligen Rangfolgen; vor Spielende wird keine finale Gesamtwertung behauptet. |
| KAN-021 | Aufgabeninhalte können für die festgelegten Kategorien gepflegt und bereitgestellt werden. | Bestätigt (AEN-023) | Aufgabenbeschreibung, Antwortart und erforderliche Inhalte werden vor der Spielrunde erfasst. |
| KAN-022 | Die ursprüngliche Wortauswahl war auf höchstens neun Buchstaben begrenzt. | Abgelöst durch KAN-056 (OFF-064) | Historische Grenze; gültige Admin-Wörter werden nun ohne automatische Längenfilterung verwendet. |
| KAN-023 | Rückmeldungen zu Aufgabenantworten erscheinen im jeweiligen Eingabeformular. | Bestätigt (AEN-023) | Die Antwortmeldung ist der Aufgabe zugeordnet und verständlich sichtbar. |
| KAN-024 | Aufgaben können mit einem Bild ergänzt werden. | Bestätigt (AEN-023) | Ein konfigurierter Bildpfad wird nach dem Öffnen der Aufgabe angezeigt. |
| KAN-025 | Abgegebene Aufgaben zeigen ihren Ergebnisstatus. | Bestätigt (AEN-023) | Die Übersicht unterscheidet richtige, falsche und geschätzte Abgaben. |
| KAN-026 | Der Admin kann die Aufgaben- und Antwortdetails einer Gruppe einsehen. | Bestätigt (AEN-023) | Die Adminansicht zeigt die Aufgabenzeilen der ausgewählten Gruppe samt Antwort und Dauer. |
| KAN-027 | Spieler erhalten eine öffentliche Erklärung des Spielablaufs. | Bestätigt (AEN-024) | Die Erklärseite beschreibt Ablauf und Regeln ohne geheime Aufgabenlösungen. |
| KAN-028 | Exakte Folgeaufgaben erlauben bis zu drei Versuche je Gruppe. | Bestätigt (AEN-028) | Die ersten beiden falschen Antworten lassen die Aufgabe offen; eine richtige Antwort oder der dritte Versuch schließt sie ab. |
| KAN-029 | Lokale Eingaben bleiben bei Zustandsaktualisierungen erhalten. | Bestätigt (AEN-028) | Unveränderte Servervorgaben überschreiben keine bearbeiteten Werte oder Leerwerte. |
| KAN-030 | Wiederholte Zustandsabrufe werden je Client koordiniert. | Bestätigt (AEN-028) | Es läuft höchstens ein Abruf gleichzeitig; Änderungen lösen höchstens einen zusammengefassten Folgeabruf aus. |
| KAN-031 | Die Aufgabenübersicht zeigt den Versuchszustand der Gruppe. | Bestätigt (AEN-028) | Versuche und Abschlussstatus werden aus dem verbindlichen Spielzustand angezeigt. |
| KAN-032 | Spieler können die Gruppenaufgabe und verfügbare Folgeaufgaben nachvollziehbar finden. | Bestätigt (AEN-028) | Übersicht und Einzelaufgabe zeigen nur für die Gruppe verfügbare Informationen. |
| KAN-033 | Die Vorbereitung zeigt fehlende oder unvollständige Aufgabenangaben. | Bestätigt (AEN-028) | Unvollständige gespeicherte Aufgaben werden konkret gemeldet, ohne Lösungen offenzulegen. |
| KAN-034 | Admin und Präsentation sind für die vorgesehene Desktop-/Monitoransicht bedienbar; der Präsentations-QR führt zur Spielseite derselben Website. | Bestätigt (AEN-036) | Admin bleibt auf 1920×1200 nutzbar; der QR-Code verweist auf die relative Spieleradresse. |
| KAN-035 | Die mobile Spielerübersicht ist kompakt, und nach Wortlösung werden keine Wort- oder Buchstabenreste angezeigt. | Bestätigt (AEN-038) | Gruppenname und Teilnehmer bleiben sichtbar; gelöste Wortinhalte werden nicht weiter angezeigt. |
| KAN-036 | Falsche Aufgabenantworten bleiben bei Restversuchen bearbeitbar; Anleitung und Aufgeben-Hinweise entsprechen der aktuellen Aufgabe. | Bestätigt (AEN-053) | Nicht abschließende Fehlversuche bleiben sichtbar; Starträtsel- und Folgeaufgabenhinweise sind getrennt. |
| KAN-037 | Die Anleitung erklärt die Punkte- und Rangfolgeregeln. | Bestätigt (AEN-053) | Punktestaffeln und Unterschiede zwischen Aufgaben- und Gruppenwertung sind verständlich beschrieben. |
| KAN-038 | Geocaching-Aufgaben zeigen den tatsächlichen Ort erst nach dem Öffnen. | Bestätigt (AEN-053) | Die Übersicht verwendet eine neutrale Aufgabenbezeichnung; Ortsdetails werden erst nach dem Start sichtbar. |
| KAN-039 | Aufgaben können einer Schwierigkeit zugeordnet werden. | Bestätigt (AEN-053) | Die konfigurierte Schwierigkeit ist in den vorgesehenen Spieler- und Adminansichten erkennbar. |
| KAN-040 | Aufgeben der Gruppenwortaufgabe schließt sie mit null Punkten ab und bestimmt den Spielleiter. | Bestätigt (AEN-053) | Die bestätigende Person übernimmt die Spielleiterrolle; das Wort bleibt endgültig ungelöst. |
| KAN-041 | Gruppenwörter, Aufgaben und Lösungen sind vor dem Spiel konfigurierbar. | Bestätigt (AEN-053) | Nur berechtigte Admins können Inhalte vor Einteilung speichern; Lösungen bleiben geheim. |
| KAN-042 | Wortauswahl und Punktestaffeln können vor dem Spiel konfiguriert werden. | Bestätigt (AEN-053) | Die gespeicherte Konfiguration gilt für die Runde und wird nach Einteilung nicht stillschweigend geändert. |
| KAN-043 | Vor-Spiel-Einstellungen sind zentral in der Vorbereitung gebündelt. | Bestätigt (AEN-053) | Gruppengröße, Wörter, Aufgaben, Schwierigkeiten und Punktestaffeln sind dort erreichbar; Steuerung bleibt für den Spielbetrieb. |
| KAN-044 | Die Spielzeit ist konfigurierbar und endet serverseitig automatisch. | Bestätigt (AEN-053) | Der Countdown beginnt mit der Gruppeneinteilung; nach Fristablauf werden keine Spielaktionen angenommen. |
| KAN-045 | Spieler sehen die Dauer ihrer Gruppenaufgaben. | Bestätigt (AEN-053) | Laufende und abgeschlossene Dauer wird je Aufgabe angezeigt; nicht gestartete Aufgaben werden nicht als Nullzeit dargestellt. |
| KAN-046 | Die Beameransicht läuft auf einer eigenen Seite weiter, während der Admin geöffnet bleibt. | Bestätigt (AEN-053) | Beameraktualisierung ist unabhängig vom Admin-Tab; Schließen der Seite beendet nicht das Spiel. |
| KAN-047 | Vorbereitung, Verbindungszustand, Restzeitwarnungen, Export und Generalprobe unterstützen den Spielbetrieb. | Bestätigt (AEN-053) | Bereitschaft beruht auf gespeicherten Daten; Übertragungsstatus und finale Ergebnisse werden korrekt angezeigt beziehungsweise exportiert. |
| KAN-048 | Häufige Statusabrufe sollen Spielaktionen nicht durch unnötige Sperren blockieren. | Bestätigt (AEN-061) | Nicht fällige Statusabrufe vermeiden exklusive Spiel-/Rundensperren; Frist- und Aktionsregeln bleiben atomar. |
| KAN-049 | Ranglistenberechnungen werden innerhalb eines Statusabrufs gebündelt. | Bestätigt (AEN-061) | Benötigte Ränge und Punkte werden wiederverwendet; Rangfolge und Rechte bleiben unverändert. |
| KAN-050 | Unveränderte Daten sollen nicht unnötig vollständig neu gerendert oder übertragen werden. | Bestätigt (AEN-061) | Geänderte Serverzeit wird übernommen; tatsächliche Daten- und Ansichtsänderungen bleiben sichtbar. |
| KAN-051 | Aufgabenimport und Admin-Konfiguration unterstützen wiederverwendbare, gespeicherte Zustände. | Bestätigt (AEN-061) | Import wird vor Übernahme validiert; unveränderte Konfiguration kann über Revisionen wiederverwendet werden. |

### 1.2 Gesammelte Aufgabenideen, noch keine Umsetzungsvorgaben

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
| ENT-005 | Wer darf die Gruppenantwort eingeben? Wie werden Groß-/Kleinschreibung, Leerzeichen, Umlaute und falsche Versuche behandelt? Wann beginnt die Wortaufgabe? | KAN-010 bis KAN-013, KAN-055 / OFF-064 | **Entschieden:** Jedes Mitglied darf einreichen; Aufgabe beginnt mit der Einteilung; Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; Wörter ohne Umlaute und ß; falsche Versuche zulässig, pro Gruppe höchstens alle 3 Sekunden (serverseitige Schutzgrenze). Das UI-Feedback folgt den Abschlussregeln von OFF-070. |
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
| SWA-059 | Aufgabencluster zählen abgeschlossene Aufgaben und Gesamtaufgaben. | KAN-053 | Anzeige `n/m` ohne das Wort „erledigt“; der Zähler basiert auf dem serverseitigen Abgabestatus. |
| SWA-060 | Schwierigkeit wird als Tag mit Text und Farbklasse dargestellt. | KAN-054 | Alle Aufgabenansichten verwenden Leicht/blau, Mittel/rot, Schwer/schwarz. |
| SWA-061 | Die Rückmeldung folgt dem Abschlusszustand der Antwort; das serverseitige Wiederholungsintervall bleibt unabhängig davon. | KAN-055, KAN-071, KAN-072 | Nicht abschließende Fehlversuche bleiben sichtbar; abschließende Rückmeldungen dauern 3000 ms. Die serverseitige Startwort-Drosselung bleibt bei 3000 ms. |
| SWA-062 | Admin-Wörter werden ohne automatische Längen-/Schwierigkeitsfilter ausgewählt; Buchstabenverteilung ist unabhängig von Wortlänge. | KAN-056 | Jedes gültige A–Z-Wort wird akzeptiert; jedes Zeichen genau einmal, Anzahl je Mitglied unterscheidet sich höchstens um eins. |
| SWA-063 | Beamerzugriff ist zusätzlich mit einer registrierten Supabase-Spielersitzung möglich und bleibt read-only. | KAN-057 | Nur registrierte Spieler erhalten die Anzeige; anonyme Nichtspieler ohne Token werden abgewiesen; keine Steuerungselemente. |
| SWA-064 | Aufgeben-Hinweise unterscheiden Starträtsel und Folgeaufgaben. | KAN-058 | Null-Punkte-Hinweis immer; Spielleiter-Hinweis ausschließlich beim Gruppenwort. |
| SWA-065 | Spieler-Beamer erhält ein eigenes kompaktes Smartphone-Layout. | KAN-059 | Vertikale Rangliste mit kompaktem Countdown, Rang, Gruppe, Punkten und darunterstehenden Mitgliedernamen; read-only und live. |
| SWA-066 | Klassischer Beamer erhält ein eigenes 16:9-Layout für 1920×1080. | KAN-060 | Breite, gut lesbare Rangliste; Gruppen und Punkte bleiben sichtbar, ohne horizontales Scrollen. |

## 5. Ergänzende Kundenanforderungen (OFF-065)

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-059 | Spieler erhalten eine eigenständige, kompakte Bestenlistenansicht für Smartphones. | Bestätigt (OFF-065) | Rang, Gruppenname und Punkte sind klar erkennbar; Spielernamen stehen kleiner darunter; Spielzeit bleibt kompakt; Anzeige ist read-only und aktualisiert live. |
| KAN-060 | Die klassische Beameransicht ist als breite 16:9-Bestenliste für 1920×1080 optimiert. | Bestätigt (OFF-065) | Gruppen, Mitglieder und Punkte sind aus Entfernung gut lesbar; möglichst alle Gruppen sind ohne unnötiges Scrollen sichtbar; Daten entsprechen der Live-Rangliste. |

## 6. Ergänzungen OFF-066–068

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-061 | Projektor eine Zeile je Team, Statistik rechts; Titel Bestenliste. | Bestätigt | Mitglieder in Klammern, Punkte rechts, Spielzeit/Teilnehmer/Gruppen rechts; kein Spiel läuft. |
| KAN-062 | Spielleiter kompakte Live-Übersicht ohne Bestenlistenlink. | Bestätigt | Punkte, Platz, Aufgabenfortschritt; Hinweis Spielleiter nur Startaufgabe. |
| KAN-063 | Weihnachtsdekoration im bestehenden Geheimakten-Stil. | Bestätigt, visuell abgenommen | Realistische Tannen/Lichter, Special Elite/Courier Prime, lesbare Rangliste. |

| ID | Softwareanforderung | Quelle | Kriterium |
|---|---|---|---|
| SWA-067 | Projektor einspaltige Rangliste mit separater Statistikspalte. | KAN-061 | Reihenfolge, Namen, Punkte bleiben sichtbar; 25 Gruppen gesondert prüfen. |
| SWA-068 | Spieleransicht zeigt Live-Gesamtwertung für Spielleiter, ohne Bestenlistenlink. | KAN-062 | Read-only-RPC, Aufgabenfortschritt, bestehende Spielregeln unverändert. |
| SWA-069 | Dekoration lokal eingebettet, responsive, bestehende Fonts. | KAN-063 | Keine SQL- oder Spielregeländerung; visuelle Abnahme. |

## OFF-070 – Bestätigte Kundenanforderungen (17.11.2026)

**KAN-070 (bestätigt):** In der Aufgabenübersicht werden Fortschrittszahlen und Kategorien ohne das Wort „erledigt“ angezeigt; die Zahlen selbst bleiben erhalten.

**KAN-071 (bestätigt):** Nach einer falschen Antwort mit verbleibenden Versuchen bleibt die Fehlerrückmeldung dauerhaft sichtbar, bis sie durch die nächste Aktion/Rückmeldung ersetzt wird. Die Aufgabe bleibt bearbeitbar.

**KAN-072 (bestätigt):** Nach richtiger oder endgültig falscher Antwort wird die Rückmeldung drei Sekunden lang angezeigt, bevor die Aufgabenübersicht erscheint. Dies gilt für den vorhandenen Abschlussablauf; keine Änderung der Versuchs-/Punktevergabe.

**Freigabe:** Der Kunde hat am 17.11.2026 ausdrücklich das gesamte OFF-070-Paket zur Umsetzung nach vollständiger Dokumentation und Tests freigegeben. Keine Supabase-Änderung.

## OFF-072 – Auswahlaufgabe ohne Schätzung (19.11.2026)

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-073 | Zusätzlich zur Schätzfrage mit Auswahl gibt es eine eigenständige Auswahlaufgabe ohne Zahleneingabe. | Bestätigt (OFF-072) | Die Gruppe wählt eine von vier Optionen und darf genau einmal abgeben. Richtig wird nach Dauer wie eine exakte Antwort gewertet; falsch bleibt abgeschlossen und erhält keine Punkte. Die Schätzfrage mit zusätzlicher Auswahl behält ihre bisherige Zahlen- und Auswahlwertung. |

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-073 | Die Spielsoftware unterstützt eigenständige Auswahlaufgaben mit vier Optionen und ohne Zahleneingabe. | KAN-073 | Eine Auswahlaufgabe ist ohne numerische Lösung spielbar, akzeptiert genau eine gültige Auswahl und wertet richtige Antworten nach Dauer wie `exakt`; falsche Antworten bleiben abgeschlossen und unplatziert. `auswahl` mit numerischer Lösung behält die bisherige Schätzwertung. |

## OFF-073 – Zeilenumbrüche im Aufgabentext

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-080 | Die Spieleransicht soll die im Aufgabentext vorgegebenen Zeilenumbrüche und Leerzeilen anzeigen. | Bestätigt (OFF-073) | Absätze und nummerierte Zeilen bleiben bei der Darstellung erkennbar. Zusätzliche Markdown- oder HTML-Formatierung ist nicht beauftragt; Spielverhalten und Aufgabeninhalt bleiben unverändert. |

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-080 | Die Spieleransicht stellt Zeilenumbrüche und Leerzeilen im Aufgabentext dar. | KAN-080 | Der aus dem Spielzustand gelieferte Text erscheint als Klartext mit seinen internen Zeilenumbrüchen und Leerzeilen; lange Zeilen umbrechen weiterhin entsprechend der verfügbaren Breite. Keine Auswertung von HTML oder Markdown; andere Ansichten und Spielverhalten bleiben unverändert. |

## OFF-074 – Vorbelegung der Punktestaffeln

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-081 | Neue Runden erhalten die Punktestaffeln aus der Kundenvorlage als Vorbelegung. Eine bereits gespeicherte Staffel wird beim ersten SQL-Update gemäß OFF-075 einmalig ersetzt. | Bestätigt (OFF-074, geändert durch OFF-075) | Leicht: Plätze 1–9 `15, 13, 11, 9, 7, 6, 5, 4, 3`, ab Platz 10 `2`; mittel: Plätze 1–10 `30, 26, 22, 19, 16, 13, 11, 9, 7, 6`, ab Platz 11 `5`; schwer: Plätze 1–10 `45, 39, 34, 29, 24, 20, 17, 14, 11, 9`, ab Platz 11 `8`. Die bestehenden Werte werden einmalig durch diese Werte ersetzt, sofern die Runde noch nicht eingeteilt ist; spätere Änderungen bleiben bei erneuter Schemaausführung erhalten. Nach Gruppeneinteilung wird die noch nicht durchgeführte Übernahme ausdrücklich abgelehnt, damit laufende oder abgeschlossene Ergebnisse nicht nachträglich verändert werden. |

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-081 | Punktestaffeln unterstützen die Vorbelegung, einmalige Übernahme und Ranggrenzen aus KAN-081. | KAN-081 | Neue Runden erhalten die Werte der Kundenvorlage. Beim ersten Schema-Update werden gespeicherte Staffeln in den Phasen `vorbereitet` und `anmeldung` einmalig vollständig ersetzt; die Konfigurationsrevision steigt bei geänderten Werten. Nach Gruppeneinteilung wird eine noch ausstehende Übernahme mit einem Fehler abgelehnt. Nach erfolgreicher Übernahme und bei Neuinstallation bleiben spätere Änderungen bei Schemawiederholungen und `admin_reset` erhalten. Eine neunwertige Staffel behält Plätze 1–8 und ihren Restwert ab Platz 9; elf Werte bilden Plätze 1–10 und einen Restwert ab Platz 11 ab. Rangpunkte werden serverseitig anhand des letzten verfügbaren Eintrags gedeckelt. |

## OFF-076 – Klarere Spieleransicht

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-082 | Die Smartphone-Spieleransicht soll gemäß freigegebener Designvorschau übersichtlicher sein, ohne das bestehende Spiel zu verändern. | Bestätigt (OFF-076) | Der aktuelle nächste Schritt wird nach Gruppenwort-Erfolg als hervorgehobener Hinweis dargestellt; Rollenhinweis, Punkte, Fortschritt und verfügbare Rätsel bleiben verständlich. Rätsel haben einheitliche sichtbare Zustände wie „Noch offen“, „Zeit läuft“ und „Richtig/Falsch/Aufgegeben“. Die Hauptaktion bleibt dominant; „Aufgeben“ bleibt vorhanden, wird aber sekundär dargestellt. Weihnachtsfarben, Papier-/Aktenstil, bestehende Schriften und Barrierefreiheit bleiben erhalten; API, Daten, Regeln, Phasen und andere Ansichten ändern sich nicht. |

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-082 | Die Spieleransicht strukturiert vorhandene Zustände und Aktionen gemäß KAN-082 visuell neu. | KAN-082 | Nach Gruppenwort-Abschluss zeigt der Renderer vor den Aufgaben einen rollenabhängigen nächsten Schritt. Punkte/Abschlussfortschritt verwenden einen kompakten, beschrifteten Statusblock. Jede Aufgabenkarte enthält genau einen textlich eindeutigen Status; die vorhandene Titelaktion öffnet Aufgaben unverändert. Sekundäre Aufgeben-Aktionen werden als zurückhaltende Textaktionen statt als gleichgewichtige Primärbuttons dargestellt. Desktop-, Beamer- und Adminansicht sowie Datenzugriff bleiben unverändert; mobile Ausgabe bleibt bis 40 rem gekapselt. |

## OFF-071 – Behutsame Optimierung der Smartphone-Spieleransicht

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-074 | Die Smartphone-Spieleransicht soll kompakter und leichter erfassbar werden, ohne das bestehende Design oder Spielverhalten neu zu gestalten. | Bestätigt (OFF-071) | Bestehende Weihnachtsgrafik, Farben, Schriften und Akten-/Papierstil bleiben erhalten. Kopf- und Spielinformationen, Abstände, Fortschritt, Kategorien und Text-Hierarchie werden auf Smartphones behutsam verbessert; Regeln, Rollen, Aktionen, Daten und Zustandswechsel bleiben gleich. |
| KAN-075 | Zusätzliche Gruppenwortzeit und vorläufige Platzhinweise sollen in der Smartphone-Spieleransicht nicht erscheinen. | Bestätigt (OFF-071) | Gruppenwortzeit samt Zeitwert wird dort in allen Phasen ausgeblendet; der Hinweis auf den vorläufigen Platz im Erfolg „Wort gelöst!“ und die Platzangabe in der Punkte-/Statusübersicht entfallen. Spielrestzeit, Punkte und Rätsel-Fortschritt bleiben sichtbar; endgültiger Platz nach Spielende und zugrunde liegende Daten bleiben erhalten. Andere Ansichten ändern sich nicht. |
| KAN-076 | Der Link zur Erklärungs-/Regelseite wird in der Spieleransicht mit „Regeln“ beschriftet. | Bestätigt (OFF-071) | Nur der Linktext ändert sich; Ziel `erklaerung.html`, Inhalt, Funktion und Zugriffsverhalten bleiben gleich. |
| KAN-077 | Die mobile Rätselübersicht soll ohne allgemeine Abschnittseinleitung auskommen. | Bestätigt (OFF-071) | Auf Smartphones entfallen die Überschrift „RÄTSEL“ und beim Spielleiter der Text „Öffnen startet die Zeit. Drei exakte Versuche, eine Schätzung.“. Kategorien, Aufgaben und Aufgabenstellungen bleiben erhalten; andere rollenbezogene Hinweise bleiben sichtbar. |
| KAN-078 | Während der Anmeldephase wird in der Spieleransicht kein Bestenlistenlink angezeigt. | Bestätigt (OFF-071) | In Phase `anmeldung` ist der Link verborgen; außerhalb dieser Phase bleiben bisherige Anzeige und Zugriffslogik unverändert. Bestenliste und andere Ansichten ändern sich nicht. |
| KAN-079 | In der Gruppenwortphase soll die eigene Gruppenzugehörigkeit auf dem Smartphone unmittelbar erkennbar sein. | Bestätigt (OFF-071) | Direkt unter der Spielrestzeit steht dynamisch „DEINE GRUPPE: <Gruppenname>“. Buchstaben, Anweisung und Eingabefeld bleiben darunter. Gestaltung bleibt kompakt; lange Gruppennamen sind lesbar und umbrechen. Gruppenzuordnung und Spielablauf bleiben unverändert. |

| ID | Softwareanforderung | Quelle | Abnahmekriterium |
|---|---|---|---|
| SWA-074 | Die Spielerübersicht wird bei Smartphone-Breite kompakter dargestellt, ohne andere Ansichten oder das bestehende Design zu verändern. | KAN-074 | Bei einer CSS-Viewportbreite bis 40 rem werden Kopf-/Spielinformationen, Abstände, Fortschritt, Kategorien und Text-Hierarchie behutsam angepasst. Farben, Schriften, Weihnachtsgrafik, Aktenstil, Bedienbarkeit und Rollenhinweise bleiben erhalten. |
| SWA-075 | Zusätzliche Gruppenwortzeit und vorläufige Platzanzeigen werden nur in der Smartphone-Spielerübersicht ausgeblendet. | KAN-075 | Bei höchstens 40 rem erscheinen weder Gruppenwort-Zeit samt Wert noch vorläufiger Platzhinweis oder Platz in der Punkte-/Statusübersicht. Spielrestzeit, Punkte, Aufgabenfortschritt und endgültiger Platz nach Spielende bleiben sichtbar. Zustand und gespeicherte Daten sowie Admin-, Bestenlisten- und Beameransichten bleiben unverändert. |
| SWA-076 | Der Regellink der Spieler-Einstiegsseite trägt die Beschriftung „Regeln“. | KAN-076 | Linktext exakt „Regeln“; `href="erklaerung.html"` und Navigation bleiben unverändert. |
| SWA-077 | Die mobile Rätselübersicht entfernt ihre allgemeine Überschrift und die Spielleiter-Einleitung. | KAN-077 | Bei höchstens 40 rem wird „RÄTSEL“ und ausschließlich der Spielleitertext „Öffnen startet die Zeit. Drei exakte Versuche, eine Schätzung.“ nicht angezeigt. Kategorien, Aufgaben, Aufgabenstellungen und rollenspezifische Hinweise für Nicht-Spielleiter bleiben erhalten. |
| SWA-078 | Der Bestenlistenlink wird während der Anmeldephase unterdrückt. | KAN-078 | Bei `phase === 'anmeldung'` wird der Link nicht gerendert; in allen anderen Phasen gilt die vorhandene Sichtbarkeits- und Zugriffslogik. |
| SWA-079 | Die Gruppenübersicht kennzeichnet die Gruppenzugehörigkeit auf Smartphones direkt unter der Spielrestzeit. | KAN-079 | Bei höchstens 40 rem steht „DEINE GRUPPE: “ mit dem dynamischen Gruppennamen vor Buchstaben, Anweisung und Eingabe; lange Namen umbrechen ohne horizontales Überlaufen. |

## 7. Wiederhergestellte Softwareanforderungen

Die folgenden SWA-Definitionen wurden aus DOC-003, den AEN-/OFF-Nachweisen und den erhaltenen Architektur- und Komponentenverträgen in DOC-002 überführt. Der ursprüngliche Wortlaut ist nur dort übernommen, wo er erhalten ist. Abgelöste Einzelregeln bleiben für die Historie bezeichnet und dürfen nicht als aktuelle Umsetzungsvorgabe gelesen werden.

| ID | Quelle | Softwareanforderung und Prüfkriterium | Status |
|---|---|---|---|
| SWA-001 | KAN-003 | Eine Rundenadresse öffnet den Einstieg in genau diese Runde. Ungültige Rundenadressen zeigen eine verständliche Fehlermeldung. | Abgeleitet |
| SWA-002 | KAN-003, KAN-004, KAN-009, KAN-012 | Die Spieleroberfläche ist auf Smartphones ohne Installation bedienbar. Anmeldung, Buchstabenanzeige und Antwortabgabe funktionieren auf aktuellen Chrome- und Safari-Smartphonebrowsern (ENT-013). | Abgeleitet |
| SWA-003 | KAN-002, KAN-004 | Der Server validiert Anmeldung und Rundenstatus; auch bei parallelen Anfragen werden höchstens 100 Teilnehmer registriert. Leere Namen werden abgewiesen; Namen haben 2 bis 20 Zeichen und sind ohne Beachtung der Groß-/Kleinschreibung eindeutig (ENT-010). | Abgeleitet |
| SWA-004 | KAN-004, KAN-009 | Jeder Teilnehmer erhält eine stabile Identität unabhängig vom Anzeigenamen. Neuladen im selben Browser erhält die Zuordnung und erzeugt keinen weiteren Teilnehmer; Gerätewechsel wird nicht unterstützt (ENT-010). | Abgeleitet |
| SWA-005 | KAN-005, KAN-006 | Der Server verwaltet verbindlichen Anmeldeschluss und Spielphase. Der Anmeldeschluss liegt 300 Sekunden nach freigegebenem Start; Anmeldungen ab diesem Zeitpunkt werden abgewiesen. Der Admin kann die Anmeldung starten und vorzeitig schließen (ENT-002). | Abgeleitet |
| SWA-006 | KAN-005 | Der Client berechnet den Countdown aus dem serverseitigen Endzeitpunkt mit Korrektur der Gerätezeit. Wiederverbinden synchronisiert die Anzeige; ein sekündlicher Backend-Aufruf nur für den Countdown ist nicht erforderlich. | Abgeleitet |
| SWA-007 | KAN-006, KAN-007 | Die Gruppeneinteilung ordnet jeden zugelassenen Teilnehmer genau einer Gruppe zu. Gruppengröße folgt der gespeicherten Min-/Max-Konfiguration; unzulässige oder nicht aufteilbare Teilnehmerzahlen werden ohne Teilzuordnung abgewiesen. | Abgeleitet; durch AEN-015 präzisiert |
| SWA-008 | KAN-008, KAN-011 | Teilnehmer erhalten Gruppeninformation, Aufgabenbeschreibung und die für sie bestimmten Buchstaben. Das vollständige geheime Lösungswort wird nicht an den Spielerclient ausgeliefert. | Abgeleitet; Verteilung durch OFF-064 präzisiert |
| SWA-009 | KAN-012 | Eine Antwort wird serverseitig der Gruppe des authentifizierten Teilnehmers zugeordnet. Eine vom Client behauptete fremde Gruppenzugehörigkeit wird nicht akzeptiert. | Abgeleitet |
| SWA-010 | KAN-011, KAN-013 | Antworten werden serverseitig gegen das eigene Gruppenwort geprüft. Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; falsche Startwortversuche sind zulässig, pro Gruppe jedoch höchstens alle drei Sekunden. Eine falsche Antwort erzeugt keinen Lösungsplatz. | Abgeleitet |
| SWA-011 | KAN-013, KAN-020 | Pro Gruppe und Aufgabe zählt höchstens ein abgeschlossenes Ergebnis. Plätze sind atomar und eindeutig; maßgeblich sind die serverseitigen Rangregeln. | Abgeleitet; Rangbildung durch AEN-021 präzisiert |
| SWA-012 | KAN-014 | Punkte werden serverseitig gemäß der geltenden Punktekonfiguration berechnet und dem Ergebnis zugeordnet. Der Client kann Punkte nicht frei setzen. | Abgeleitet |
| SWA-013 | KAN-002, KAN-005, KAN-009, KAN-013 | Die Anwendung unterstützt 100 gleichzeitig aktive Spieler plus Admin/optionale Anzeige. Gruppen- und Phasenänderungen werden synchronisiert; Zielwerte und Wiederverbindung folgen ENT-013. | Abgeleitet |
| SWA-014 | KAN-001, KAN-004, KAN-057, KAN-059, KAN-060 | Es werden nur notwendige Teilnehmerdaten gespeichert. Admins sehen alle Spieldaten; Spieler sehen ihre Gruppe und freigegebene read-only Ranglisten. Löschung erfolgt spätestens sieben Tage nach der Feier (ENT-012). | Abgeleitet; Sichtbarkeit durch OFF-064/065 ergänzt |
| SWA-015 | KAN-005, KAN-006, KAN-014 | Steueraktionen und Rundenkonfiguration sind gegen unberechtigte Spielerzugriffe geschützt. | Abgeleitet |
| SWA-016 | KAN-015 | Aufgaben weiterer Kategorien werden erst nach Festlegung ihrer Regeln in eigene SWA, UNA und TST zerlegt. Aufgabenideen allein sind keine implementierbare Spezifikation. | Abgeleitet |
| SWA-017 | KAN-007, KAN-011 | Gruppengröße und Buchstabenverteilung werden serverseitig aus der gültigen Gruppenkonfiguration und dem gewählten Wort abgeleitet; jedes Wortzeichen wird genau einmal verteilt. | Abgeleitet; Buchstabenverteilung durch OFF-064 präzisiert |
| SWA-018 | KAN-018, KAN-020 | Exakte Antworten werden serverseitig geprüft; richtige Ergebnisse werden nach Aufgabenzeit und den dokumentierten Tie-Break-Regeln gewertet. | Abgeleitet |
| SWA-019 | KAN-018, KAN-020 | Schätzantworten werden als numerische Eingabe angenommen und nach Abstand zur Lösung, danach Dauer und festgelegten Tie-Break-Regeln gewertet. | Abgeleitet |
| SWA-020 | KAN-007 | Der Admin kann vor der Einteilung Mindest- und Maximalgröße der Gruppen konfigurieren. Die zulässigen Werte werden serverseitig geprüft; die Einteilung erzeugt vollständige, disjunkte Gruppen. | Abgeleitet (AEN-015) |
| SWA-021 | KAN-016 | Der Testläufer bietet einen schnellen Modus ohne Datenbanktests und einen vollständigen Modus mit allen Tests; unbekannte Modi schlagen ausdrücklich fehl. | Abgeleitet (AEN-020) |
| SWA-022 | KAN-017 | Geheime Aufgabenlösungen und Sperrliste bleiben außerhalb der öffentlichen Projektdateien. Die Geheimnisprüfung meldet Fundstellen, ohne geheime Werte auszugeben. | Abgeleitet (AEN-020) |
| SWA-023 | KAN-020 | Aufgabenstart, Abgabe und Rangbildung berücksichtigen Aufgabenart, Berechtigung und Spielphase; Zeiten und Ergebnisse werden serverseitig ermittelt. | Abgeleitet (AEN-016/AEN-021) |
| SWA-024 | KAN-028 | Exakte Folgeaufgaben erlauben bis zu drei Versuche je Gruppe. Die ersten beiden falschen Antworten schließen die Aufgabe nicht ab; richtige Antwort oder dritter Versuch erzeugt das einmalige Ergebnis. | Abgeleitet (AEN-028) |
| SWA-026 | KAN-022 | Aufgabenwörter waren auf höchstens neun Buchstaben begrenzt. | Abgelöst durch SWA-062 (OFF-064) |
| SWA-027 | KAN-023 | Ein Eingabeformular zeigt eine übergebene Rückmeldung unter dem Eingabefeld; ohne Rückmeldung bleibt der Bereich leer. | Abgeleitet |
| SWA-028 | KAN-024 | Aufgaben können Bildadressen enthalten; vorhandene gespeicherte Bildadressen werden durch Initialdaten nicht überschrieben. | Abgeleitet |
| SWA-029 | KAN-025 | Der Spielerzustand kennzeichnet abgegebene exakte Aufgaben als richtig oder falsch und unterscheidet nicht abgegebene Aufgaben. | Abgeleitet |
| SWA-030 | KAN-026 | Die Adminübersicht liefert für jede Gruppe Aufgabenzeilen mit Titel, Antwort, Ergebnis und Dauer, einschließlich des Gruppenworts. | Abgeleitet |
| SWA-031 | KAN-026 | Spieler können eine einzelne verfügbare Aufgabe öffnen; der Admin kann zur Gruppenübersicht zurückkehren. Die frühere einsekündige Rückmeldezeit ist durch SWA-072 abgelöst. | Abgeleitet; Timing abgelöst durch OFF-070 |
| SWA-032 | KAN-027, KAN-034 | Öffentliche Anleitung und Präsentation zeigen den Spielablauf auf den vorgesehenen Monitorlayouts; relative Links und QR-Ziel bleiben auf derselben Website. | Abgeleitet |
| SWA-033 | KAN-032 | Admin-Ranglisten- und Beameransichten zeigen die vorgesehenen Gruppeninformationen; Spieler erhalten nur ihre berechtigte Gruppenansicht. | Abgeleitet |
| SWA-034 | KAN-029 | Bei Zustandsaktualisierungen bleiben unveränderte DOM-Bereiche sowie lokale Eingaben, Leerwerte, Fokus und Selektion erhalten; erfolgreiche Aktionen dürfen gezielt Entwürfe verwerfen. | Abgeleitet (AEN-028) |
| SWA-035 | KAN-030 | Pro Client läuft höchstens ein Statusabruf gleichzeitig; zusätzliche Anforderungen werden zusammengefasst. Veraltete Ergebnisse früherer Generationen werden ignoriert; Fehler werden mit Backoff erneut versucht. | Abgeleitet (AEN-028) |
| SWA-036 | KAN-028 | Versuche werden für jede Aufgabe und Gruppe eindeutig nummeriert und geschützt gespeichert; nur richtige Antwort oder erschöpfte Versuche schließen das Ergebnis ab. | Abgeleitet (AEN-028) |
| SWA-037 | KAN-033 | Aufgabenbereitschaft prüft gespeicherte Aufgabenangaben und liefert konkrete Mängel ohne geheime Lösungswerte. | Abgeleitet (AEN-028) |
| SWA-038 | KAN-016, KAN-017 | Die Konsistenzprüfung meldet doppelte/fehlende IDs, ungültige lokale Links und Versionsabweichungen einzeln; Fehler verhindern die Baseline-Erstellung. | Abgeleitet (AEN-028) |
| SWA-039 | KAN-034 | Die Desktop-Adminansicht behält ihre Tabs, Feldwerte und Bedienbarkeit bei Aktualisierungen; die Präsentation verwendet einen gemeinsamen QR-Renderer mit sichtbarer Fehlerbehandlung. | Abgeleitet (AEN-036) |
| SWA-040 | KAN-035 | Die mobile Spielerübersicht ist kompakt, hält Gruppennamen und Teilnehmer lesbar und entfernt Wort- sowie Buchstabeninhalte nach Lösung aus dem DOM. | Abgeleitet (AEN-038) |
| SWA-041 | KAN-036, KAN-045 | Spielerzustand enthält die für Gruppe und Aufgabe berechtigten Abschluss- und Zeitinformationen; nicht gestartete Aufgaben werden nicht als Nullzeit dargestellt. | Abgeleitet (AEN-053) |
| SWA-042 | KAN-040 | Aufgeben schließt das Gruppenwort mit null Punkten ab und bestimmt den Spielleiter; Folgeaufgaben können nur vom Spielleiter aufgegeben werden. | Abgeleitet (AEN-053) |
| SWA-044 | KAN-041, KAN-042, KAN-043 | Admins konfigurieren vor Gruppeneinteilung Gruppengröße, Aufgaben, Schwierigkeiten und Punktestaffeln; gespeicherte Werte werden serverseitig validiert. | Abgeleitet (AEN-053) |
| SWA-048 | KAN-044, KAN-045 | Die Spielzeit beginnt mit Gruppeneinteilung, wird anhand serverseitiger Zeit berechnet und beendet das Spiel nach der konfigurierten Frist automatisch. | Abgeleitet (AEN-053) |
| SWA-049 | KAN-046 | Die separate Beamerseite nutzt einen geschützten Anzeigekanal und zeigt keine Adminsteuerung oder geheimen Daten; Öffnen und Schließen verändern den Spielzustand nicht. | Abgeleitet (AEN-053) |
| SWA-050 | KAN-037, KAN-047 | Der Admin kann nach Spielende finale Gruppen- und Aufgabenresultate als CSV exportieren; Export enthält keine Antworten oder Lösungen und schützt Tabellenkalkulations-Formelpräfixe. | Abgeleitet (AEN-053) |
| SWA-051 | KAN-048 | Nicht fällige Statusabrufe vermeiden exklusive Spiel-/Rundensperren; fällige Enden und Spielaktionen prüfen die Frist weiterhin atomar. | Abgeleitet (AEN-061) |
| SWA-052 | KAN-049 | Rang- und Punkteberechnung werden innerhalb eines Status-RPC gebündelt und für alle betroffenen Zeilen wiederverwendet. | Abgeleitet (AEN-061) |
| SWA-053 | KAN-050 | Unveränderter fachlicher Zustand löst keine vollständige DOM-Neuerzeugung aus; Serverzeit wird trotzdem aktualisiert. | Abgeleitet (AEN-061) |
| SWA-054 | KAN-051 | Unveränderte Admin-Konfiguration kann anhand einer Revision wiederverwendet werden; Reset, Login, Fehler und erfolgreiche Speicherung invalidieren den Cache. | Abgeleitet (AEN-061) |
| SWA-055 | KAN-051 | Der Aufgabenparser liefert Aufgaben, Fehler, Warnungen und Kategorien in Dateireihenfolge; Fehler enthalten Zeilennummern. | Abgeleitet (AEN-061) |
| SWA-056 | KAN-051 | Der Import-RPC validiert Aufgaben serverseitig und übernimmt sie erst nach expliziter Bestätigung, sofern keine Fehler vorliegen. | Abgeleitet (AEN-061) |
| SWA-057 | KAN-051 | Aufgabenkategorien lassen sich mit Tastatur und ARIA-Bedienzustand auf- und zuklappen; die Reihenfolge aus der Importdatei bleibt erhalten. | Abgeleitet (AEN-061) |
| SWA-070 | KAN-070 | Kategorien und Fortschrittsanzeige rendern Zähler im Format `x/y` ohne angehängtes Wort „erledigt“, auch bei 0 und vollständigem Fortschritt. | Abgeleitet (OFF-070) |
| SWA-071 | KAN-071 | Bei nicht abschließender falscher Antwort bleibt die Rückmeldung ohne Ablauftimer sichtbar; die Eingabe bleibt aktiv und eine neue Aktion ersetzt die Meldung. | Abgeleitet (OFF-070) |
| SWA-072 | KAN-072 | Nach abschließender Antwort und richtiger Gruppenwortlösung bleibt die Rückmeldung 3000 ms sichtbar; danach wird die Einzelansicht geschlossen. | Abgeleitet (OFF-070) |
