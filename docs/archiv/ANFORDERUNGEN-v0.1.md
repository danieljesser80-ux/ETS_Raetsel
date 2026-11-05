# Anforderungsdokument – Weihnachtsfeierspiel

## 1. Dokumentstand und Vorgehen

| Merkmal | Stand |
|---|---|
| Dokument-ID | DOC-001 |
| Version | 0.1 |
| Datum | 05.11.2026 |
| Status | Initialer Entwurf; noch keine freigegebene Baseline |
| Zweck | Gemeinsame Grundlage für Anforderungen, Änderungen, Architektur, Implementierung und Prüfung |
| Einsatz | Private Weihnachtsfeier, maximal 100 Spieler |

Dieses Dokument ist die maßgebliche Sammlung der bisher besprochenen Anforderungen. Bestehende Dateien im Arbeitsordner sind durch dieses Dokument weder bewertet noch als Umsetzung anerkannt.

**Statusbegriffe:** „Bestätigt“ bezeichnet eine ausdrücklich genannte Kundenvorgabe. „Abgeleitet“ bezeichnet eine technische Anforderung zur Erfüllung dieser Vorgaben; sie ist noch nicht separat freigegeben. „Vorschlag“ bezeichnet eine mögliche Lösung. „Offen“ erfordert eine Entscheidung. „Freigegeben“ wird erst nach ausdrücklicher Zustimmung verwendet.

### 1.1 Kennzeichnung und Rückverfolgbarkeit

| Präfix | Ebene |
|---|---|
| KAN | Kundenanforderung: Was benötigt der Veranstalter beziehungsweise Spieler? |
| SWA | Softwareanforderung: Welches überprüfbare Verhalten muss die Software liefern? |
| ARC | Architekturentscheidung oder Architekturbaustein |
| UNA | Unit-/Komponentenanforderung: Vertrag eines abgegrenzten Softwarebausteins |
| TST-K | Kundenabnahme-/End-to-End-Test |
| TST-S | Software-/Systemtest |
| TST-A | Architektur-/Integrationstest |
| TST-U | Unit-/Komponententest |
| ENT | Offene Entscheidung |
| AEN | Änderungsantrag nach der initialen Sammlung |

„Unit“ meint hier eine Softwarekomponente mit klarer Verantwortung und Schnittstelle, nicht ausschließlich einen einzelnen Funktionsaufruf.

IDs bleiben dauerhaft stabil und werden nicht neu vergeben. Entfallene Anforderungen bleiben als „entfallen“ mit Begründung erhalten. Änderungen nennen die betroffenen IDs. Die Kette lautet: **KAN → SWA → ARC/UNA → TST**. Architektur und Komponenten dürfen mehrere Anforderungen erfüllen.

### 1.2 Entwicklungsablauf

1. Initiale Kundenanforderungen prüfen, offene Entscheidungen klären und Baseline ausdrücklich freigeben.
2. Änderungen als AEN erfassen, Auswirkungen analysieren und vor Umsetzung entscheiden.
3. Softwareanforderungen mit messbaren Akzeptanzkriterien aus Kundenanforderungen ableiten.
4. Architektur und Komponentenverträge festlegen und mit Anforderungen verknüpfen.
5. Implementieren und Tests auf allen Ebenen ausführen.
6. Ergebnisse und verbleibende Abweichungen dokumentieren; Kundenabnahme und Release ausdrücklich freigeben.

Keine Anforderung gilt allein durch ihre Dokumentation als implementiert oder bestanden. Zum Abschluss müssen auch zusätzliche, nicht rückverfolgbare Funktionen auf unbeabsichtigte Erweiterung des Umfangs geprüft werden.

## 2. Initiale Kundenanforderungen

| ID | Anforderung | Status | Abnahmekriterium |
|---|---|---|---|
| KAN-001 | Das Spiel dient einer privaten Weihnachtsfeier. | Bestätigt | Das Nutzungsszenario wird ohne Unternehmenssysteme umgesetzt. |
| KAN-002 | Maximal 100 Spieler können an einer Spielrunde teilnehmen. | Bestätigt | 100 Teilnehmer können registriert und im Spiel geführt werden; der 101. Teilnehmer wird verständlich abgewiesen. |
| KAN-003 | Potenzielle Spieler erhalten einen QR-Code, der auf die Spielwebsite führt. | Bestätigt | Ein Scan mit einem Smartphone öffnet die Einstiegsseite der vorgesehenen Runde. |
| KAN-004 | Spieler tragen ihren Namen oder Spitznamen auf der Website ein. | Bestätigt | Eine erfolgreiche Anmeldung führt zu einem Teilnehmer mit dem eingegebenen Anzeigenamen. |
| KAN-005 | Die Anmeldezeit beträgt fünf Minuten und wird als globaler Countdown angezeigt. | Bestätigt | Alle Geräte beziehen sich auf denselben Anmeldeschluss; nach fünf Minuten ist die Anmeldung geschlossen. |
| KAN-006 | Wenn alle angemeldet sind, werden die Gruppen eingeteilt. | Bestätigt; Auslösung offen | Die Einteilung erfolgt nach abgeschlossener Anmeldung; das Erkennen von „alle“ wird in ENT-002 festgelegt. |
| KAN-007 | Die Gruppen sollen mindestens vier und höchstens fünf Mitglieder haben. | Offen: Interpretation von „max 5 min 4“ | Nach ENT-001/ENT-003 erfüllen alle Gruppen die freigegebene Größen- und Ausnahmeregel. |
| KAN-008 | Jede Gruppe bekommt einen Namen. | Bestätigt | Jede gebildete Gruppe besitzt einen angezeigten Gruppennamen. |
| KAN-009 | Jeder Spieler erfährt, welcher Gruppe er angehört. | Bestätigt | Nach Einteilung sieht jeder angemeldete Spieler seine eigene Gruppenzuordnung. |
| KAN-010 | Die erste Aufgabe lautet: Finde deine Gruppenmitglieder. | Bestätigt | Die erste Aufgabe wird den Teilnehmern nach Gruppeneinteilung angezeigt. |
| KAN-011 | Jedes Mitglied erhält einen Buchstaben eines gemeinsamen Lösungswortes. | Bestätigt | Jedes Mitglied sieht seinen persönlichen Buchstaben; zusammen bilden die Buchstaben das Gruppenwort. |
| KAN-012 | Die Gruppe trägt ihr Lösungswort in der Weboberfläche ein. | Bestätigt | Eine Gruppe kann eine Antwort zu ihrer eigenen Wortaufgabe abgeben. |
| KAN-013 | Es wird erfasst, welche Gruppe ihr richtiges Wort als erste, zweite und weitere gelöst hat. | Bestätigt | Jede erfolgreich gelöste Gruppe erhält einen nachvollziehbaren Platz in der Lösungsreihenfolge. |
| KAN-014 | Auf Basis der Lösungsreihenfolge werden Punkte vergeben. | Bestätigt; Formel offen | Die Punkte jeder Gruppe entsprechen der in ENT-006 freigegebenen Formel. |
| KAN-015 | Das Spiel soll verschiedene Aufgabenkategorien enthalten. | Bestätigt; Umfang offen | Der Aufgabenbestand enthält die in ENT-007 festgelegten Kategorien. |

### 2.1 Gesammelte Aufgabenideen, noch keine Umsetzungsvorgaben

| Kategorie/Idee | Herkunft | Einordnung |
|---|---|---|
| Action: maximale Anzahl Liegestütze | Kunde | Aufgabenidee; Regeln und Ergebniserfassung offen |
| Schätzquiz: „anzahl locker“ | Kunde | Bedeutung und Zielgröße unklar; siehe ENT-008 |
| Wissensquiz: Patentnummer Motorwagen | Kunde | Aufgabenidee; konkrete Frage und gültige Antwort offen |
| Foto-Suche/Geocaching: Gegenstand anhand eines Fotos finden, Nummer unter dem Gegenstand | Kunde | Aufgabenidee; Antwortformat und Durchführung offen |
| Geschicklichkeit, Turmbau, Weihnachtswissen, Musik, Nahaufnahmen, Gerüche, Gedächtnis, Kreativaufgaben | Bisherige Beratung | Vorschläge, nicht beauftragt |

## 3. Offene Entscheidungen

| ID | Entscheidung | Betroffene Anforderungen | Stand |
|---|---|---|---|
| ENT-001 | Bedeutet „max 5 min 4“ tatsächlich vier bis fünf Spieler pro Gruppe? | KAN-007 | Offen |
| ENT-002 | Wer startet den Countdown? Wie wird „alle angemeldet“ erkannt: Admin-Abschluss, bekannte Sollzahl oder anderer Mechanismus? Was geschieht bei Zeitablauf ohne vollständige Teilnahme? | KAN-005, KAN-006 | Offen; Admin-Steuerung vorgeschlagen |
| ENT-003 | Wie werden Teilnehmerzahlen behandelt, die sich nicht in Vierer-/Fünfergruppen aufteilen lassen, sowie weniger als vier Teilnehmer und keine Teilnehmer? | KAN-006, KAN-007 | Offen |
| ENT-004 | Werden Gruppen zufällig oder nach anderen Regeln gebildet? Wie werden Gruppennamen vergeben? | KAN-007, KAN-008 | Offen |
| ENT-005 | Wer darf die Gruppenantwort eingeben? Wie werden Groß-/Kleinschreibung, Leerzeichen, Umlaute und falsche Versuche behandelt? Wann beginnt die Wortaufgabe? | KAN-010 bis KAN-013 | Offen |
| ENT-006 | Welche Punkteformel und welche Regel für praktisch gleichzeitige Lösungen gelten? Wird eine Rangliste angezeigt, und wem? | KAN-013, KAN-014 | Offen; serverseitige Eingangsreihenfolge vorgeschlagen |
| ENT-007 | Welche Kategorien gehören zum ersten Release? Wie viele Aufgaben gibt es, in welcher Reihenfolge und mit welchen Regeln? | KAN-015 | Offen |
| ENT-008 | Was bedeutet „anzahl locker“? Welcher Motorwagen beziehungsweise welches Patent ist gemeint? | KAN-015 | Offen |
| ENT-009 | Wie werden Wörter ausgewählt? Ein Buchstabe pro Person legt Wortlänge gleich Gruppengröße nahe; gewünschte Schwierigkeit und Mehrdeutigkeit sind festzulegen. | KAN-011, KAN-012 | Offen |
| ENT-010 | Sind doppelte Spitznamen erlaubt? Wie erfolgen Wiederzugang, Gerätewechsel und Umgang mit Aussteigern? | KAN-004, KAN-009 | Offen |
| ENT-011 | Ist GitHub Pages plus Supabase die freigegebene Plattform? Wer besitzt Konten und betreibt die Anwendung? | ARC-001 bis ARC-005 | Offen; bisher empfohlene Lösung |
| ENT-012 | Wie lange werden Namen und Ergebnisse gespeichert, wer darf sie sehen und wer löscht sie? | SWA-014, ARC-005 | Offen |
| ENT-013 | Welche Browser und Geräte sowie welche Reaktionszeiten müssen unterstützt werden? | SWA-002, SWA-013 | Offen; aktuelles Android Chrome/iOS Safari vorgeschlagen |

## 4. Abgeleitete Softwareanforderungen

Alle folgenden Anforderungen haben zunächst den Status **Abgeleitet, nicht freigegeben**. Abhängige offene Regeln werden nicht stillschweigend durch Standardwerte ersetzt.

| ID | Quelle | Softwareanforderung und Prüfkriterium |
|---|---|---|
| SWA-001 | KAN-003 | Eine Rundenadresse öffnet den Einstieg in genau diese Runde. Ungültige Rundenadressen zeigen eine verständliche Fehlermeldung. |
| SWA-002 | KAN-003, KAN-004, KAN-009, KAN-012 | Die Spieleroberfläche ist auf Smartphones ohne Installation bedienbar. Anmeldung, Buchstabenanzeige und Antwortabgabe funktionieren auf den nach ENT-013 festgelegten Zielgeräten. |
| SWA-003 | KAN-002, KAN-004 | Der Server validiert Anmeldung und Rundenstatus. Die Kapazität von 100 wird auch bei parallelen Anfragen nicht überschritten. Leere Namen werden abgewiesen; weitere Namensregeln folgen ENT-010. |
| SWA-004 | KAN-004, KAN-009 | Jeder Teilnehmer erhält eine stabile Identität, unabhängig vom Anzeigenamen. Neuladen auf demselben Browser erhält die Zuordnung und erzeugt keinen zusätzlichen Teilnehmer. Gerätewechsel folgt ENT-010. |
| SWA-005 | KAN-005, KAN-006 | Der Server verwaltet den verbindlichen Anmeldeschluss und die Spielphase. Der Anmeldeschluss liegt exakt 300 Sekunden nach dem freigegebenen Start. Anmeldungen ab dem Schlusszeitpunkt werden abgewiesen. Vorzeitiger Abschluss folgt ENT-002. |
| SWA-006 | KAN-005 | Der Client berechnet den Countdown aus dem serverseitigen Endzeitpunkt mit Korrektur für die Gerätezeit. Wiederverbinden synchronisiert die Anzeige. Ein sekündlicher Backend-Aufruf allein für den Countdown ist nicht erforderlich. |
| SWA-007 | KAN-006 bis KAN-009 | Die Gruppeneinteilung ordnet jeden zugelassenen Teilnehmer genau einer Gruppe zu. Größe, Ausnahmen und Verteilung folgen ENT-001/ENT-003/ENT-004. Wiederholte Auslösung erzeugt keine zweite Einteilung. |
| SWA-008 | KAN-008 bis KAN-011 | Teilnehmer erhalten ihre Gruppeninformation, Aufgabenbeschreibung und genau ihren eigenen Buchstaben. Das vollständige geheime Lösungswort wird nicht an den Client ausgeliefert. |
| SWA-009 | KAN-012 | Eine Antwort wird serverseitig der Gruppe des authentifizierten Teilnehmers zugeordnet. Eine vom Client behauptete fremde Gruppenzugehörigkeit wird nicht akzeptiert. Abgabeberechtigung folgt ENT-005. |
| SWA-010 | KAN-011 bis KAN-013 | Antworten werden serverseitig gegen das eigene Gruppenwort geprüft. Vergleichsregeln und falsche Versuche folgen ENT-005. Eine falsche Antwort erzeugt keinen Lösungsplatz. |
| SWA-011 | KAN-013 | Pro Gruppe und Aufgabe zählt ausschließlich die erste korrekte Abgabe. Plätze werden atomar und eindeutig vergeben; erneute oder parallele Abgaben erzeugen keinen zusätzlichen Platz. Ordnungsregel folgt ENT-006. |
| SWA-012 | KAN-014 | Punkte werden serverseitig gemäß freigegebener Formel genau einmal je Gruppenlösung berechnet und mit dem Ergebnis gespeichert. Der Client kann Punkte nicht frei setzen. |
| SWA-013 | KAN-002, KAN-005, KAN-009, KAN-013 | Die Anwendung unterstützt 100 gleichzeitig aktive Spieler plus Admin/optionale Anzeige. Gruppen- und Phasenänderungen werden synchronisiert. Reaktionszeitgrenzen folgen ENT-013; Verbindungsausfälle werden angezeigt und Wiederverbindungen holen den aktuellen Zustand. |
| SWA-014 | KAN-001, KAN-004 | Nur für das Spiel notwendige Teilnehmerdaten werden gespeichert. Lesezugriffe, Adminberechtigungen und Löschung folgen ENT-012. |
| SWA-015 | KAN-005, KAN-006, KAN-014 | Steueraktionen und Konfiguration der Runde sind gegen unberechtigte Spielerzugriffe geschützt. Die konkreten Adminaktionen folgen den freigegebenen Spielregeln. |
| SWA-016 | KAN-015 | Aufgaben weiterer Kategorien werden erst nach Festlegung ihrer Regeln in eigene SWA, UNA und TST zerlegt. Die genannten Ideen allein sind keine implementierbare Spezifikation. |

## 5. Architekturentwurf

**Status: Vorschlag.** GitHub Pages plus Supabase ist die bisher empfohlene, noch nicht freigegebene Zielplattform. Kein eigener lokaler Server ist vorgesehen. Ein Internetzugang am Veranstaltungsort ist erforderlich.

| ID | Baustein/Entscheidung | Verantwortung | Zugeordnete SWA |
|---|---|---|---|
| ARC-001 | Statischer Webclient auf GitHub Pages über HTTPS | Einstieg, QR-Zieladresse, mobile Spieleransicht, vorgeschlagene Adminansicht | SWA-001, SWA-002, SWA-006, SWA-008, SWA-013, SWA-015 |
| ARC-002 | Supabase Auth mit anonymen Spielersitzungen; geschützter Adminzugang | Stabile Identität ohne sichtbare Kontoanmeldung, Rollenprüfung; Wiederzugang zu entscheiden | SWA-004, SWA-009, SWA-014, SWA-015 |
| ARC-003 | Serverseitige Befehle über geschützte Datenbankfunktionen; Edge Functions nur bei Bedarf | Anmeldung, Phasenwechsel, Einteilung, Antwortprüfung und atomare Platz-/Punktevergabe | SWA-003, SWA-005, SWA-007, SWA-009 bis SWA-012, SWA-015 |
| ARC-004 | PostgreSQL in Supabase | Persistente Runden-, Teilnehmer-, Gruppen-, Aufgaben- und Ergebnisdaten; Constraints und Transaktionen | SWA-003 bis SWA-005, SWA-007 bis SWA-012, SWA-014 |
| ARC-005 | Zugriffsschutz und getrennte geheime Daten | Row Level Security, eingeschränkte Funktionsrechte, geheime Lösungen außerhalb des Client-Lesezugriffs; keine privilegierten Schlüssel im Frontend/Repository | SWA-008 bis SWA-010, SWA-012, SWA-014, SWA-015 |
| ARC-006 | Supabase Realtime, ergänzender Zustandsabruf bei Einstieg/Wiederverbindung | Eine Verbindung je geöffnetem Spielerclient, Updates bei Änderungen, Countdown lokal | SWA-006, SWA-008, SWA-013 |

### 5.1 Vorgeschlagener Daten- und Zustandsentwurf

- **Runde:** Identität, Phase, Anmeldeschluss, freigegebene Spielkonfiguration.
- **Teilnehmer:** Identität, Runde, Anzeigename, Gruppenzuordnung.
- **Gruppe:** Identität, Runde, Name.
- **Aufgabe/Zuweisung:** Aufgabenidentität, Gruppe, persönliche Buchstaben; geheime Lösung separat geschützt.
- **Gruppenergebnis:** Aufgabe, Gruppe, erste korrekte Annahme, Platz, Punkte; eindeutige Kombination aus Aufgabe und Gruppe sowie Aufgabe und Platz.

Vorgeschlagene Zustandsfolge: `vorbereitet → anmeldung → gruppen_eingeteilt → wortaufgabe_aktiv → aufgabe_abgeschlossen`. Spätere Aufgaben und Rundenabschluss folgen ENT-007. Erlaubte Übergänge, Auslöser und Fehlerreaktionen werden vor Implementierung spezifiziert.

Der Client darf Anzeigezustand berechnen, aber keine verbindlichen Anmeldefristen, Gruppen, richtigen Antworten, Plätze oder Punkte bestimmen. Für gemeinsame Rangfolgen ist eine transaktionale Serialisierung pro Aufgabe nötig; ein Clientzeitstempel oder Zeitstempel allein reicht nicht.

### 5.2 Infrastrukturrahmen

Die am 05.11.2026 recherchierten Free-Limits sind **externe Randbedingungen, keine Verfügbarkeitszusagen**: GitHub Pages 100 GB monatlicher Datenverkehr als weiches Limit; Supabase 200 gleichzeitige Realtime-Verbindungen, 100 Realtime-Nachrichten pro Sekunde, 500 MB Datenbank und 5 GB ausgehender Datenverkehr.

Updates an viele Empfänger verbrauchen mehrfach Nachrichtenbudget. Ein lokaler Countdown und gezielte statt pauschaler Datenübertragung vermeiden unnötige Last. Mehrere Tabs sowie Admin/Beamer benötigen Reserve. Kostenlose Supabase-Projekte können nach einer Woche Inaktivität pausiert werden.

Vor Release werden aktuelle Limits, Auth-Anmelderaten und Nutzungsbedingungen geprüft. Ein Lasttest muss den tatsächlichen Anmelde- und Nachrichtenpfad prüfen, nicht nur die Teilnehmerzahl in der Datenbank.

Quellen: [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits), [Supabase Preise](https://supabase.com/pricing), [Realtime Limits](https://supabase.com/docs/guides/realtime/limits).

## 6. Abgeleitete Unit-/Komponentenanforderungen

**Status: Entwurf, nicht freigegeben.** Ein- und Ausgaben benennen fachliche Verträge; genaue API- und Datentypen werden mit der Architektur festgelegt.

| ID | Komponente / Architektur | Quelle | Vertrag |
|---|---|---|---|
| UNA-001 | Rundenzugang / ARC-001, ARC-002 | SWA-001, SWA-002, SWA-004 | Rundenadresse und lokale Sitzung einlesen; gültigen Einstieg oder expliziten Fehler liefern; vorhandene Identität weiterverwenden. |
| UNA-002 | Teilnehmerregistrierung / ARC-003, ARC-004 | SWA-003, SWA-004, SWA-005 | Identität, Runde und Name annehmen; Phase, Frist, Namensregeln und Kapazität atomar prüfen; Teilnehmer oder fachlichen Ablehnungsgrund liefern. Wiederholung darf nicht duplizieren. |
| UNA-003 | Phasensteuerung und Zeit / ARC-001, ARC-003, ARC-004 | SWA-005, SWA-006, SWA-015 | Autorisierte Übergänge verarbeiten, verbindlichen Endzeitpunkt speichern; Client liefert nichtnegative Restzeit aus synchronisierter Zeitbasis. |
| UNA-004 | Gruppenbildung / ARC-003, ARC-004 | SWA-007 | Geschlossene Teilnehmermenge und freigegebene Einteilungsregeln verarbeiten; vollständige, disjunkte Gruppenzuordnung erzeugen und einmalig persistieren. |
| UNA-005 | Wort-/Buchstabenzuweisung / ARC-003, ARC-004, ARC-005 | SWA-008, SWA-010 | Passendes Wort und Mitgliedermenge verarbeiten; genau einen Buchstaben je Mitglied zuweisen; Multimenge der Buchstaben entspricht dem Wort; Lösung bleibt geheim. |
| UNA-006 | Antwortannahme und Rang / ARC-003, ARC-004, ARC-005 | SWA-009 bis SWA-011 | Identität, Aufgabe und Antwort verarbeiten; Berechtigung und Lösung prüfen; einmaliges Gruppenergebnis mit eindeutigem Platz atomar erzeugen. |
| UNA-007 | Punkteberechnung / ARC-003, ARC-004 | SWA-012 | Platz und freigegebene Punktekonfiguration verarbeiten; deterministische Punkte liefern und zusammen mit dem ersten Ergebnis persistieren. |
| UNA-008 | Spielerzustand und Synchronisierung / ARC-001, ARC-005, ARC-006 | SWA-002, SWA-008, SWA-013, SWA-014 | Berechtigten Zustand anzeigen; Änderungen und Wiederverbindung verarbeiten; keine fremden persönlichen Buchstaben/geheimen Lösungen offenlegen; Verbindungsfehler sichtbar machen. |
| UNA-009 | Adminrechte und Datenlebenszyklus / ARC-002 bis ARC-005 | SWA-014, SWA-015 | Adminidentität für Steuer-/Löschaktionen prüfen; unberechtigte Aktionen ohne Zustandsänderung abweisen; freigegebene Löschregel umsetzen. |

## 7. Testanforderungen auf allen Ebenen

### 7.1 Teststrategie und Nachweise

Alle Tests stehen initial auf **Geplant; nicht ausgeführt**. Regelabhängige Tests bleiben bis zur Entscheidung blockiert. Insbesondere gibt es vor ENT-013 keine behauptete bestandene Performanceanforderung.

Für jede Ausführung werden Test-ID, Datum, Softwareversion, Umgebung, Eingaben/Voraussetzungen, erwartetes und tatsächliches Ergebnis sowie Status (`bestanden`, `fehlgeschlagen`, `blockiert`) dokumentiert. Fehler verweisen auf die betroffenen Anforderungen. Testdaten verwenden künstliche Namen.

Unit-Tests prüfen Komponentenverträge; Integrationstests prüfen reale Schnittstellen, Rechte und Transaktionen; Systemtests prüfen Softwareverhalten; Kundenabnahme prüft das vollständige Spiel aus Sicht der Beteiligten.

### 7.2 Kundenabnahme

| ID | Abgedeckte KAN | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-K-001 | KAN-001 bis KAN-005 | Gäste öffnen per QR die Runde, geben Spitznamen ein und sehen denselben fünfminütigen Anmeldeschluss; kein installierter Client und kein Unternehmenszugang erforderlich. |
| TST-K-002 | KAN-006 bis KAN-010 | Anmeldung endet nach freigegebener Regel; jeder Teilnehmer erhält genau eine gültige Gruppe und sieht deren Namen sowie die erste Aufgabe. |
| TST-K-003 | KAN-011, KAN-012 | Gruppenmitglieder finden einander anhand der Spielinformationen, setzen persönliche Buchstaben zusammen und geben das Gruppenwort ein. |
| TST-K-004 | KAN-013, KAN-014 | Mehrere Gruppen lösen in festgelegter Reihenfolge; gespeicherte Plätze und Punkte entsprechen den freigegebenen Regeln. |
| TST-K-005 | KAN-002 | Veranstaltungsszenario mit 100 aktiven Spielern plus Steuerung funktioniert; ein zusätzlicher Teilnehmer wird verständlich abgewiesen. |
| TST-K-006 | KAN-015 | Abnahme der weiteren Kategorien nach ENT-007/ENT-008; konkrete Testfälle anschließend ergänzen. |

### 7.3 Software-/Systemtests

| ID | Abgedeckte SWA | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-S-001 | SWA-001, SWA-002 | Gültige/ungültige Rundenadresse sowie vollständiger Spielerablauf auf den festgelegten Smartphonebrowsern. |
| TST-S-002 | SWA-003, SWA-004 | Leerer Name, Wiederholung, Neuladen und parallele Anmeldung am Kapazitätsrand; keine Duplikate, höchstens 100 Spieler. Namenskollisionen nach ENT-010. |
| TST-S-003 | SWA-005, SWA-006 | Anmeldung vor, exakt bei und nach Frist; absichtlich verstellte Geräteuhr, spätes Öffnen und Wiederverbindung; Serverfrist bleibt verbindlich. |
| TST-S-004 | SWA-007, SWA-008 | Einteilung zulässiger Teilnehmerzahlen und freigegebener Ausnahmefälle; wiederholte Einteilung verändert bestehende Zuordnungen nicht. |
| TST-S-005 | SWA-009 bis SWA-012 | Falsches Wort, richtige Antwort, Wiederholung und parallele Antworten derselben/verschiedener Gruppen; keine falschen oder doppelten Plätze/Punkte. |
| TST-S-006 | SWA-013 | 100 aktive Clients mit realen Anmeldungen, Phasenwechseln, Gruppenzuweisungen und Antwortspitzen; Messung gegen ENT-013, einschließlich Fehler- und Wiederverbindungsverhalten. |
| TST-S-007 | SWA-008, SWA-014, SWA-015 | Manipulierte Gruppen-/Punkteangaben, Zugriff auf Lösungen und fremde persönliche Daten sowie Spieleraufruf von Adminaktionen werden abgewiesen; Löschung nach ENT-012. |
| TST-S-008 | SWA-016 | Nach Spezifikation jeder weiteren Kategorie: gültige/ungültige Ergebnisse und Kategorienablauf; konkrete Testfälle anschließend ergänzen. |

### 7.4 Architektur-/Integrationstests

| ID | Abgedeckte ARC | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-A-001 | ARC-001, ARC-002, ARC-003 | Bereitgestellte HTTPS-Seite erreicht Auth und Backend mit produktionsnaher Konfiguration; Anmeldung und Sitzungsfortsetzung funktionieren. |
| TST-A-002 | ARC-003, ARC-004 | Gleichzeitige Registrierungen und Lösungen gegen echte Datenbank; Constraints, Serialisierung und Rollback verhindern Überbelegung und halbe Ergebnisse. |
| TST-A-003 | ARC-002, ARC-003, ARC-005 | Direkte API-/Datenbankzugriffe als nicht angemeldeter Nutzer, Spieler und Admin; Rechte sind auch ohne die vorgesehene Oberfläche wirksam. |
| TST-A-004 | ARC-001, ARC-004, ARC-006 | Realtime-Abbruch und Wiederverbindung: UI holt verbindlichen Zustand; Daten bleiben bei Neuladen/Verbindungsabbruch persistent. |
| TST-A-005 | ARC-001 bis ARC-006 | Prüfung der gebauten öffentlichen Dateien auf geheime Lösungen/privilegierte Schlüssel; Lastlauf gegen tatsächliche Dienstlimits inklusive Auth, Realtime und Datenverkehr. |

### 7.5 Unit-/Komponententests

| ID | Abgedeckte UNA | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-U-001 | UNA-001 | Rundenauflösung, fehlende/ungültige Sitzung und gültige bestehende Sitzung; eindeutiger Einstieg ohne zusätzliche Identität. |
| TST-U-002 | UNA-002 | Namensvalidierung, geschlossene Runde, Kapazitätsgrenze und wiederholte Registrierung; korrekter fachlicher Fehler beziehungsweise einmaliger Teilnehmer. |
| TST-U-003 | UNA-003 | Uhr kontrollierbar simulieren: Start, 300-Sekunden-Grenze, abgelaufene Restzeit, Gerätezeitabweichung und ungültiger Phasenübergang. |
| TST-U-004 | UNA-004 | Teilnehmerzahlen von 0 bis 100 gegen freigegebene Regeln; jeder Teilnehmer genau einmal, kein Fremdteilnehmer, zulässige Größen oder expliziter Ablehnungsfall. |
| TST-U-005 | UNA-005 | Vier-/Fünfbuchstabenwörter, wiederholte Buchstaben und ungeeignete Wortlänge; vollständige Buchstabenmultimenge, genau eine Zuweisung pro Mitglied. |
| TST-U-006 | UNA-006 | Berechtigung, falsche/richtige und normalisierte Antworten nach ENT-005, bereits gelöste Gruppe; eindeutige Ergebnisse. Parallelitätsnachweis zusätzlich in TST-A-002. |
| TST-U-007 | UNA-007 | Alle zulässigen Plätze und ungültige Konfigurationen gegen freigegebene Punkteformel; deterministische Ergebnisse ohne stillschweigende Ersatzwerte. |
| TST-U-008 | UNA-008 | Zustandsdarstellung, Updates, Verbindungsfehler und erneuter Abruf; nur berechtigte persönliche Informationen sichtbar. |
| TST-U-009 | UNA-009 | Rollenprüfung und Löschumfang nach ENT-012; keine unberechtigte Mutation und keine Löschung außerhalb der gewählten Runde. |

## 8. Rückverfolgbarkeitsmatrix

Diese Matrix fasst die Ableitung zusammen; Detailbeziehungen stehen in den Tabellen oben. Sie wird bei jeder akzeptierten Änderung aktualisiert.

| Kundenanforderungen | Softwareanforderungen | Architektur | Komponenten | Kundenabnahme |
|---|---|---|---|---|
| KAN-001 | SWA-014 | ARC-001, ARC-005 | UNA-009 | TST-K-001 |
| KAN-002 | SWA-003, SWA-013 | ARC-003, ARC-004, ARC-006 | UNA-002, UNA-008 | TST-K-005 |
| KAN-003, KAN-004 | SWA-001 bis SWA-004, SWA-014 | ARC-001 bis ARC-005 | UNA-001, UNA-002, UNA-008, UNA-009 | TST-K-001 |
| KAN-005 | SWA-005, SWA-006, SWA-013, SWA-015 | ARC-001, ARC-003, ARC-004, ARC-006 | UNA-003, UNA-008, UNA-009 | TST-K-001 |
| KAN-006, KAN-007 | SWA-005, SWA-007, SWA-015 | ARC-003, ARC-004 | UNA-003, UNA-004, UNA-009 | TST-K-002 |
| KAN-008, KAN-009, KAN-010 | SWA-002, SWA-004, SWA-007, SWA-008, SWA-013 | ARC-001 bis ARC-006 | UNA-001, UNA-004, UNA-005, UNA-008 | TST-K-002 |
| KAN-011, KAN-012 | SWA-002, SWA-008 bis SWA-010 | ARC-001, ARC-003 bis ARC-005 | UNA-005, UNA-006, UNA-008 | TST-K-003 |
| KAN-013, KAN-014 | SWA-010 bis SWA-013, SWA-015 | ARC-003 bis ARC-006 | UNA-006 bis UNA-009 | TST-K-004 |
| KAN-015 | SWA-016 | Noch abzuleiten | Noch abzuleiten | TST-K-006 |

## 9. Änderungssammlung

### 9.1 Regeln für Änderungen

Ab Dokumentversion 0.1 wird jede neue oder geänderte Vorgabe als AEN erfasst. Die initiale Sammlung ist kein nachträglicher Änderungsantrag.

Ein Änderungsantrag enthält mindestens: ID, Datum, Urheber, Beschreibung/Begründung, betroffene KAN, Auswirkungen auf SWA/ARC/UNA/TST, Entscheidung, Umsetzungsstand und Nachweis. Zulässige Zustände: `gesammelt`, `in Analyse`, `zur Entscheidung`, `angenommen`, `abgelehnt`, `umgesetzt`, `verifiziert`.

Eine Annahme ist keine automatische Umsetzung oder Freigabe eines Releases. Angenommene Änderungen aktualisieren das Dokument und die Testabdeckung; ihre frühere Formulierung bleibt über den Änderungsvermerk nachvollziehbar.

### 9.2 Änderungsregister

Aktuell keine Änderungsanträge nach der initialen Sammlung.

| ID | Datum | Beschreibung / Begründung | Betroffene IDs / Auswirkungen | Entscheidung | Stand / Nachweis |
|---|---|---|---|---|---|

### 9.3 Dokumenthistorie

| Version | Datum | Inhalt | Freigabe |
|---|---|---|---|
| 0.1 | 05.11.2026 | Initiale Kundenanforderungen, offene Entscheidungen, technische Ableitung, Architekturentwurf, Komponentenverträge, Testanforderungen und Änderungssystem | Ausstehend |

## 10. Freigabe- und Entwicklungsstand

| Ebene | Stand |
|---|---|
| Kundenanforderungen | Gesammelt; offene Punkte in ENT-001 bis ENT-013 |
| Softwareanforderungen | Abgeleiteter Entwurf |
| Architektur | Vorschlag GitHub Pages + Supabase |
| Komponentenanforderungen | Abgeleiteter Entwurf |
| Implementierung | Im Rahmen dieser Anforderungssammlung nicht begonnen |
| Tests | Definiert, nicht ausgeführt |
| Baseline / Kundenabnahme / Release | Nicht freigegeben |

Nächster Freigabeschritt ist die Klärung der offenen Spielregeln. Insbesondere Gruppengröße/Ausnahmen, Start und Ende der Anmeldung, Antwort-/Punkteregeln und Umfang des ersten Releases bestimmen die weitere Entwicklung.
