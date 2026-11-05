# Testkonzept und Testspezifikation – Weihnachtsfeierspiel

**Dokument-ID:** DOC-006 | **Version:** 0.4 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Testanforderungen auf allen Ebenen

### 1.1 Teststrategie und Nachweise

Alle Tests stehen initial auf **Geplant; nicht ausgeführt**. Regelabhängige Tests bleiben bis zur Entscheidung blockiert. Insbesondere gibt es vor ENT-013 keine behauptete bestandene Performanceanforderung.

Für jede Ausführung werden Test-ID, Datum, Softwareversion, Umgebung, Eingaben/Voraussetzungen, erwartetes und tatsächliches Ergebnis sowie Status (`bestanden`, `fehlgeschlagen`, `blockiert`) dokumentiert. Fehler verweisen auf die betroffenen Anforderungen. Testdaten verwenden künstliche Namen.

Unit-Tests prüfen Komponentenverträge; Integrationstests prüfen reale Schnittstellen, Rechte und Transaktionen; Systemtests prüfen Softwareverhalten; Kundenabnahme prüft das vollständige Spiel aus Sicht der Beteiligten.

### 1.2 Kundenabnahme

| ID | Abgedeckte KAN | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-K-001 | KAN-001 bis KAN-005 | Gäste öffnen per QR die Runde, geben Spitznamen ein und sehen denselben fünfminütigen Anmeldeschluss; kein installierter Client und kein Unternehmenszugang erforderlich. |
| TST-K-002 | KAN-006 bis KAN-010 | Anmeldung endet nach freigegebener Regel; jeder Teilnehmer erhält genau eine gültige Gruppe und sieht deren Namen sowie die erste Aufgabe. |
| TST-K-003 | KAN-011, KAN-012 | Gruppenmitglieder finden einander anhand der Spielinformationen, setzen persönliche Buchstaben zusammen und geben das Gruppenwort ein. |
| TST-K-004 | KAN-013, KAN-014 | Mehrere Gruppen lösen in festgelegter Reihenfolge; gespeicherte Plätze und Punkte entsprechen den freigegebenen Regeln. |
| TST-K-005 | KAN-002 | Veranstaltungsszenario mit 100 aktiven Spielern plus Steuerung funktioniert; ein zusätzlicher Teilnehmer wird verständlich abgewiesen. |
| TST-K-006 | KAN-015 | Abnahme der weiteren Kategorien nach ENT-007/ENT-008; konkrete Testfälle anschließend ergänzen. |

### 1.3 Software-/Systemtests

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

### 1.4 Architektur-/Integrationstests

| ID | Abgedeckte ARC | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-A-001 | ARC-001, ARC-002, ARC-003 | Bereitgestellte HTTPS-Seite erreicht Auth und Backend mit produktionsnaher Konfiguration; Anmeldung und Sitzungsfortsetzung funktionieren. |
| TST-A-002 | ARC-003, ARC-004 | Gleichzeitige Registrierungen und Lösungen gegen echte Datenbank; Constraints, Serialisierung und Rollback verhindern Überbelegung und halbe Ergebnisse. |
| TST-A-003 | ARC-002, ARC-003, ARC-005 | Direkte API-/Datenbankzugriffe als nicht angemeldeter Nutzer, Spieler und Admin; Rechte sind auch ohne die vorgesehene Oberfläche wirksam. |
| TST-A-004 | ARC-001, ARC-004, ARC-006 | Realtime-Abbruch und Wiederverbindung: UI holt verbindlichen Zustand; Daten bleiben bei Neuladen/Verbindungsabbruch persistent. |
| TST-A-005 | ARC-001 bis ARC-006 | Prüfung der gebauten öffentlichen Dateien auf geheime Lösungen/privilegierte Schlüssel; Lastlauf gegen tatsächliche Dienstlimits inklusive Auth, Realtime und Datenverkehr. |

### 1.5 Unit-/Komponententests

| ID | Abgedeckte UNA | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-U-001 | UNA-001 | Rundenauflösung, fehlende/ungültige Sitzung und gültige bestehende Sitzung; eindeutiger Einstieg ohne zusätzliche Identität. |
| TST-U-002 | UNA-002 | Namensvalidierung, geschlossene Runde, Kapazitätsgrenze und wiederholte Registrierung; korrekter fachlicher Fehler beziehungsweise einmaliger Teilnehmer. |
| TST-U-003 | UNA-003 | Uhr kontrollierbar simulieren: Start, 300-Sekunden-Grenze, abgelaufene Restzeit, Gerätezeitabweichung und ungültiger Phasenübergang. |
| TST-U-004 | UNA-004 | Teilnehmerzahlen von 0 bis 100 gegen freigegebene Regeln; jeder Teilnehmer genau einmal, kein Fremdteilnehmer, zulässige Größen oder expliziter Ablehnungsfall. |
| TST-U-005 | UNA-005 | Wortlängen von Gruppengröße bis doppelter Gruppengröße (4 bis 6 Mitglieder), wiederholte Buchstaben und ungeeignete Wortlänge; vollständige Buchstabenmultimenge, ein bis zwei Buchstaben pro Mitglied. |
| TST-U-006 | UNA-006 | Berechtigung, falsche/richtige und normalisierte Antworten nach ENT-005, bereits gelöste Gruppe; eindeutige Ergebnisse. Parallelitätsnachweis zusätzlich in TST-A-002. |
| TST-U-007 | UNA-007 | Alle zulässigen Plätze und ungültige Konfigurationen gegen freigegebene Punkteformel; deterministische Ergebnisse ohne stillschweigende Ersatzwerte. |
| TST-U-008 | UNA-008 | Zustandsdarstellung, Updates, Verbindungsfehler und erneuter Abruf; nur berechtigte persönliche Informationen sichtbar. |
| TST-U-009 | UNA-009 | Rollenprüfung und Löschumfang nach ENT-012; keine unberechtigte Mutation und keine Löschung außerhalb der gewählten Runde. |

## 2. Testprotokolle

Ausführungsnachweise werden getrennt von dieser Spezifikation je Testlauf unter `testprotokolle/` abgelegt. Ein Protokoll enthält die Angaben aus Abschnitt 1.1 und verweist auf die ausgeführten TST-IDs sowie den geprüften Dokument-/Softwarestand. Automatisierte Tests liegen unter `tests/` (Befehl `npm test`) und tragen die TST-ID im Titel. Erster Lauf: [Lauf 001](../testprotokolle/lauf-001.md).
