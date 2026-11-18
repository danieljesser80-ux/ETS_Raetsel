# Testkonzept und Testspezifikation – Weihnachtsfeierspiel

**Dokument-ID:** DOC-006 | **Version:** 0.29 | **Datum:** 17.11.2026

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
| TST-K-016 | KAN-052 bis KAN-058 | Beamer zeigt Mitglieder und aktuelle Punkte einzeilig; Clusterfortschritt und Schwierigkeitstags sind sichtbar; Rückmeldung dauert eine Sekunde; beliebige Admin-Wörter werden verteilt; Spieler-Beamer ist read-only; Aufgeben-Hinweise unterscheiden Start- und Folgeaufgaben. |
| TST-K-017 | KAN-059, KAN-060 | Smartphone-Spieleransicht im Hochformat und auf schmalem Display prüfen; klassische Beameransicht bei 1920×1080 und abweichendem 16:9-Fenster prüfen; Rang, Mitglieder, Punkte und Spielzeit live vergleichen; read-only und Scrollverhalten prüfen. |

### 1.3 Software-/Systemtests

| ID | Abgedeckte SWA | Szenario / erwartetes Ergebnis |
|---|---|---|
| TST-S-001 | SWA-001, SWA-002 | Gültige/ungültige Rundenadresse sowie vollständiger Spielerablauf auf den festgelegten Smartphonebrowsern. |
| TST-S-002 | SWA-003, SWA-004 | Leerer Name, Wiederholung, Neuladen und parallele Anmeldung am Kapazitätsrand; keine Duplikate, höchstens 100 Spieler. Namenskollisionen nach ENT-010. |
| TST-S-003 | SWA-005, SWA-006 | Anmeldung vor, exakt bei und nach Frist; absichtlich verstellte Geräteuhr, spätes Öffnen und Wiederverbindung; Serverfrist bleibt verbindlich. |
| TST-S-004 | SWA-007, SWA-008 | Einteilung zulässiger Teilnehmerzahlen und freigegebener Ausnahmefälle; wiederholte Einteilung verändert bestehende Zuordnungen nicht. |
| TST-S-005 | SWA-009 bis SWA-012 | Falsches Wort, richtige Antwort, Wiederholung und parallele Antworten derselben/verschiedener Gruppen; serverseitige 3-s-Grenze (2999 ms abgewiesen, 3000 ms erlaubt); keine falschen oder doppelten Plätze/Punkte. |
| TST-S-006 | SWA-013 | 100 aktive Clients mit realen Anmeldungen, Phasenwechseln, Gruppenzuweisungen und Antwortspitzen; Messung gegen ENT-013, einschließlich Fehler- und Wiederverbindungsverhalten. |
| TST-S-007 | SWA-008, SWA-014, SWA-015 | Manipulierte Gruppen-/Punkteangaben, Zugriff auf Lösungen und fremde persönliche Daten sowie Spieleraufruf von Adminaktionen werden abgewiesen; Löschung nach ENT-012. |
| TST-S-008 | SWA-016 | Nach Spezifikation jeder weiteren Kategorie: gültige/ungültige Ergebnisse und Kategorienablauf; konkrete Testfälle anschließend ergänzen. |
| TST-S-043 | SWA-058, SWA-062, SWA-063 | Tokenbasierter Beamer und registrierter Spielerzugriff; anonym ohne Token abweisen; Mitgliedernamen nach Wortlösung sichtbar; beliebig lange und kurze Admin-Wörter vollständig und fair verteilen. |
| TST-S-044 | SWA-065, SWA-066 | Spieler- und Projektorlayout verwenden dieselben Ranglistendaten; Smartphoneansicht bleibt schmal und read-only; Projektoransicht nutzt 16:9 bei 1920×1080 ohne horizontales Scrollen. |

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
| TST-U-005 | UNA-005 | Alle A–Z-Wortlängen und Gruppengrößen; vollständige Buchstabenmultimenge und möglichst gleichmäßige Verteilung, auch wenn einzelne Mitglieder keine oder mehr als zwei Buchstaben erhalten. |
| TST-U-006 | UNA-006 | Berechtigung, falsche/richtige und normalisierte Antworten nach ENT-005, bereits gelöste Gruppe; eindeutige Ergebnisse. Parallelitätsnachweis zusätzlich in TST-A-002. |
| TST-U-007 | UNA-007 | Alle zulässigen Plätze und ungültige Konfigurationen gegen freigegebene Punkteformel; deterministische Ergebnisse ohne stillschweigende Ersatzwerte. |
| TST-U-008 | UNA-008 | Zustandsdarstellung, Updates, Verbindungsfehler und erneuter Abruf; nur berechtigte persönliche Informationen sichtbar. |
| TST-U-009 | UNA-009 | Rollenprüfung und Löschumfang nach ENT-012; keine unberechtigte Mutation und keine Löschung außerhalb der gewählten Runde. |
| TST-U-035 | UNA-042, UNA-043, UNA-045 | Beamerzeile mit Klammern und Live-Punkten; Fortschrittsanzeige `Anzahl/Gesamtzahl` ohne das Wort „erledigt“; farbige Schwierigkeits-Tags; beliebige Wortlängen und gleichmäßige Buchstabenverteilung. |
| TST-U-036 | UNA-044 | Gemeinsame UI-Rückmeldezeit von 3000 ms und differenzierter Aufgeben-Hinweis für Starträtsel/Folgeaufgaben; die serverseitige Antwortdrosselung bleibt unabhängig. |

## 2. Testprotokolle

Ausführungsnachweise werden getrennt von dieser Spezifikation je Testlauf unter `testprotokolle/` abgelegt. Ein Protokoll enthält die Angaben aus Abschnitt 1.1 und verweist auf die ausgeführten TST-IDs sowie den geprüften Dokument-/Softwarestand. Automatisierte Tests liegen unter `tests/` (Befehl `npm test`) und tragen die TST-ID im Titel. Erster Lauf: [Lauf 001](../testprotokolle/lauf-001.md).

## Ergänzende Nachweise und Prüfungen OFF-065–068

| ID | Quelle | Prüfung / Status |
|---|---|---|
| TST-K-061 | KAN-061 | Projektor 1920×1080, 25 Gruppen, Namen/Punkte und rechte Statistik; Einzelprüfung offen. |
| TST-K-062 | KAN-062 | Spielleiter Live-Punkte/Platz/Fortschritt und kein Link; separate Kundenprüfung nicht dokumentiert. |
| TST-K-063 | KAN-063 | Weihnachtsdesign auf Pages; 15.11.2026 ausdrücklich abgenommen trotz Vorschauabweichung. |
| TST-S-067 | SWA-067, UNA-046 | Layout und Live-Daten; gezielte 25-Gruppen-Browserprüfung offen. |
| TST-S-068 | SWA-068, UNA-047 | TST-S-026 prüft Übersicht, kein Spielleitertext, Fortschritt und bestehende Aufgabenfunktionen; CI #60 grün. Live-Gesamtwertung separat prüfen. |
| TST-S-069 | SWA-069, UNA-048 | CSS-Dekoration ohne SQL; CI #65 grün, visuelle Abnahme bestätigt. |

CI-Nachweise: [#60](https://github.com/danieljesser80-ux/ETS_Raetsel/actions/runs/43736274332), [#65](https://github.com/danieljesser80-ux/ETS_Raetsel/actions/runs/43741697546). Keine Aussage über nicht ausgeführte Einzelprüfungen.

## OFF-070 – Aufgabenübersicht und Rückmeldung (17.11.2026)

| Test-ID | Ebene | Prüfschritte / Soll-Ergebnis | Nachweis |
|---|---|---|---|
| TST-S-070 | UI / Regression | Kategorie-Zähler und Fortschrittskachel zeigen nur `x/y` ohne „erledigt“. Nach falscher exakter Antwort bei weiteren Versuchen bleibt „Falsch“ sichtbar und das Formular editierbar. Nächste Antwort ersetzt die Rückmeldung. | `tests/web/views.test.js` prüft Anzeige und editierbare Eingabe; Zeitpersistenz manuell und durch Codeprüfung. |
| TST-S-071 | UI / Timing | Erfolgreiche oder endgültig falsche Abgabe bleibt 3000 ms sichtbar, dann Rückkehr zur Übersicht. Fehlantwort mit verbleibenden Versuchen bleibt länger als 3000 ms sichtbar, bis nächste Aktion erfolgt. | `tests/web/feedback.test.js` prüft die Zeitkonstante; Interaktionsablauf im Browser noch offen. |

**Abgrenzung:** Automatisierte DOM-Tests bestätigen nicht den gesamten zeitgesteuerten Ablauf im Browser. Keine Supabase-Änderung. CI-Nachweis nach Abschluss ergänzen.

**OFF-070 – ergänzende Grenz-/Fehlerfälle:** TST-S-072 prüft, dass wiederholte falsche Antworten mit Restversuchen den Fehler nicht automatisch entfernen und die Eingabe offen lassen; ein weiterer Versuch ersetzt die Meldung. TST-S-073 prüft abschließende richtige/falsche Antworten und das Gruppenwort auf 3000 ms Anzeige und danach Rückkehr/Schließen. TST-U-034/035 und TST-U-036 müssen an die neuen Sollwerte angepasst werden. Reale Browser-Zeitabläufe sind zusätzlich manuell zu verifizieren.

## OFF-070 – Testfolgenanalyse und Abschlussprüfung (17.11.2026)

**Anlass:** Vorzeitige Implementierung und zunächst unvollständige Testfolgenanalyse. Diese nachgeholte Prüfung dokumentiert die konkret identifizierten bestehenden Tests; eine lückenlose Einzelprüfung sämtlicher 561 Tests ist damit **nicht** nachgewiesen.

| Vorhandener Test | Alte Erwartung | Neue Erwartung | Ergebnis |
|---|---|---|---|
| `tests/web/off059-cache-ansichten.test.js`, TST-U-034 | Kategorie `Eins (0/2 erledigt)` | `Eins (0/2)` | angepasst |
| `tests/web/off064-aenderungen.test.js`, TST-U-035 | `Wissen (1/2 erledigt)` | `Wissen (1/2)` | angepasst |
| `tests/web/off064-aenderungen.test.js`, TST-U-036 | 1000 ms | 3000 ms | angepasst |
| `tests/web/off046-player-controller.test.js` | 1000-ms-Timeout auch bei wiederholbarer Fehlantwort | kein Timeout bei Restversuchen; 3000 ms bei Abschluss | TST-S-072/073 angepasst |
| `tests/web/views.test.js` | Text der Kategorie und Fortschritt | ohne `erledigt` | ergänzt |
| `tests/web/feedback.test.js` | Feedbackdauer | 3000 ms | angepasst |

**Grenz-/Fehlerfälle:** Restversuche 2 und 1, endgültiger Fehlversuch 0, richtige Antwort, Nullfortschritt, Teilfortschritt, Aufgabenabschluss. **Noch nicht separat belegt:** Zeitablauf Gruppenwort als vollständiger Controller-Test, visuelle Browserprüfung, Abbruch/Ansichtswechsel während Timer und vollständige Querschnittsprüfung aller Tests auf widersprüchliche Hartkodierungen.

**CI-Nachweis:** GitHub Actions #138, Commit `5092edeec2d3916059457bbd965e4a72c37b7b56`, erfolgreich. Dieser Nachweis gilt ausschließlich für diesen Commit; jede Dokumentationsänderung erfordert einen erneuten Lauf vor Merge.

**Freigabesperre:** Merge erst nach vollständiger Testfolgenanalyse, konsistenter Dokumentation und grüner CI auf dem finalen Commit. Die offene manuelle Browser-/Geräteabnahme ist als Abweichung nach Deployment zu dokumentieren.

**OFF-070 – weitere automatisierte Abdeckung:** TST-S-074 prüft die 3000-ms-Rückmeldung nach richtiger Gruppenwortlösung; TST-S-075 prüft, dass persistentes Feedback beim Öffnen einer anderen Aufgabe entfernt wird (`tests/web/off046-player-controller.test.js`). Nicht automatisiert geprüft: tatsächliche Browserdarstellung auf Mobilgeräten; visuelle Abnahme nach Deployment offen. Der frühere Zwischenstand mit nur 6 untersuchten Dateien wurde durch die vollständige Dateiinventur und Fundstellenbewertung im Abschnitt unten abgelöst. Vor Merge sind der finale grüne CI-Lauf und die Dokumentationskontrolle verpflichtend.

**Nachprüfung 17.11.2026:** Die konkret geänderten Testdateien `off046-player-controller.test.js`, `off059-cache-ansichten.test.js`, `off064-aenderungen.test.js`, `views.test.js` und `feedback.test.js` wurden auf die Suchmuster `erledigt`, `1000`, `3000`, `feedback`, `Falsch` und `setTimeout` geprüft. In `off046-player-controller.test.js` wurde eine weitere hartcodierte Timeout-Schwelle (`t.ms >= 1000`) durch `ANSWER_FEEDBACK_MS` ersetzt. Die verbleibenden Zeitwerte `1000` und `13000` in diesem Test dienen ausschließlich der simulierten Serverzeit, nicht der Feedbackdauer. Die Dateinamenliste des gesamten Testbestands konnte über den verfügbaren Repository-Zugriff nicht vollständig abgerufen werden; die verpflichtende Einzelprüfung sämtlicher weiterer Tests bleibt offen. Ein grüner CI-Lauf ersetzt diese Prüfung nicht.

## OFF-070 – Testfolgenanalyse des vollständigen Dateibestands (17.11.2026)

**Inventur:** GitHub Actions #154 prüfte 45 Dateien unter tests/ (einschließlich Hilfsdateien). Davon wiesen 24 Dateien 186 Fundzeilen zu Statuswort, Rückmeldung, Fortschritt oder Zeitwerten auf. 563/563 automatisierte Tests bestanden. Die 21 übrigen Dateien zeigten keine Treffer der Suchmuster. Die 24 auffälligen Dateien wurden anhand der konkreten Fundstellen überprüft.

| Testdateien | Prüfung und Ergebnis |
|---|---|
| antwort.test.js; db/get-state-submit-rechte.test.js | 3000-ms-Drosselung für Gruppenwortantworten, keine UI-Rückmeldezeit; gültig |
| aufgaben.test.js; db/aen028-versuche.test.js; db/aufgaben.test.js | Antwortvalidierung, Versuche und serverseitige Wertung; durch OFF-070 nicht geändert |
| db/gruppengroesse.test.js; db/off037-konfiguration.test.js; db/phasen-admin.test.js; db/off058-import-ranking.test.js | „falsch“ bezeichnet Admincode, Fehlergrund oder Phase; keine Statuswort-Anzeige |
| db/off046-spielverlauf.test.js | Deadline, Exportstatus wrong und Serverzeit; unabhängig vom UI-Feedback |
| tools/konsistenz.test.js | Negativfälle zur Dokumentenkonsistenz, unabhängig von OFF-070 |
| web/aen028-ansichten.test.js | Fehlversuch bleibt offen; bestehende Erwartung mit OFF-070 vereinbar |
| web/api-texts-countdown.test.js; web/off046-countdown.test.js; zeit.test.js | Countdown und Zeitabgleich; 1000/3000 keine Feedback-Timer |
| web/desktop-qr.test.js; web/off037-admin.test.js | Adminansichten, simulierte Uhr und allgemeine Erfolgsmeldung |
| web/off046-seiten.test.js | Polling-Existenz; keine Feedback-Zeitdauer |
| web/spieler-kompakt.test.js | Gruppenwort-Fehleranzeige; keine widersprüchliche Zeitdauer |
| web/off059-cache-ansichten.test.js; web/views.test.js; web/off064-aenderungen.test.js | Aufgabenfortschritt und Kategorien; OFF-070-Erwartungen angepasst |
| web/feedback.test.js; web/off046-player-controller.test.js | 3000-ms-Abschlussfeedback, persistente Fehlversuche, Ansichtswechsel; OFF-070-Erwartungen angepasst |

**Befund:** In den untersuchten Fundstellen keine weiteren widersprüchlichen Erwartungen festgestellt. Der veraltete Testtitel zum Wort „erledigt“ in web/off064-aenderungen.test.js wurde inzwischen korrigiert. Die automatisierte Suche ist eine heuristische Inventur und keine Garantie für semantische Vollständigkeit. Vor Merge: erneuter grüner Testlauf auf dem endgültigen Commit sowie Dokumentations-/Rückverfolgbarkeitsprüfung.


## OFF-071 – Testfolgenanalyse, Zwischenstand (18.11.2026)

**Status: unvollständig; Sperre vor Test- und Codeänderungen.** Der Kunde hat die vollständige Umsetzung ausdrücklich freigegeben. Die verpflichtende Prüfung sämtlicher vorhandener Tests auf widersprüchliche Erwartungen, hartcodierte Werte und überholte Anforderungen ist noch nicht nachgewiesen. Ein Repository-Checkout war in der ausführenden Umgebung wegen fehlender DNS-Auflösung für github.com nicht möglich. Einzelne Dateien wurden direkt aus dem Branch `off-071-mobile-spieleransicht` gelesen. Die frühere OFF-070-Inventur (45 Testdateien) ist kein Ersatz für eine neue OFF-071-Inventur.

| Vorhandene Datei / Fundstelle | Bisherige Erwartung / Befund | OFF-071-Soll / Prüfbedarf | Bewertung |
|---|---|---|---|
| `tests/web/views.test.js`, TST-U-008 | `Vorläufig Platz 2` nach Gruppenwortlösung | Keine Gruppenwortzeit und keine Platzinformation im Erfolgsbereich; Punkte und Fortschritt bleiben erhalten | Konflikt, Testanpassung nach vollständiger Analyse nötig |
| `tests/web/spieler-kompakt.test.js` | `Wort gelöst! Vorläufig Platz 2` | Erfolgsanzeige ohne Platzangabe | Konflikt |
| `tests/web/spieler-kompakt.test.js` | `.player-group-name` entspricht exakt `Testgruppe` | In Gruppenwortphase eindeutige Beschriftung `DEINE GRUPPE: <dynamischer Name>` direkt unter Spielrestzeit; lange Namen umbrechen | Konflikt; DOM-/Barrierefreiheitsprüfung nötig |
| `tests/web/views.test.js` | Finale `Platz 2 – 14 Punkte` sowie Aufgaben- und Adminplatzierungen | Finale Wertung und andere Ansichten nicht pauschal entfernen; Anzeigeumfang phasenspezifisch abgrenzen | Nicht ohne weitere Prüfung ändern |
| `tests/web/aen028-ansichten.test.js` | Gruppen-, Rollen- und Phasenabläufe; Beamer-Rangdaten | Gruppenanzeige und Sichtbarkeit ohne Beamer-/Adminregression | Prüfung offen |
| `tests/web/off059-cache-ansichten.test.js` | Zustand mit gelöstem Wort und Aufgaben | Fortschritt ohne Platz, keine Zustands-/Cache-Regression | Prüfung offen |
| `tests/web/off064-aenderungen.test.js` | Bestenlisten- und Fortschrittsdarstellung | Bestehende Bestenliste erhalten; nur Link während Anmeldung ausblenden | Prüfung offen |
| `tests/web/off046-seiten.test.js` | Statische Seiten-/QR-Prüfungen | Beschriftung des Links `Regeln` und Ziel `erklaerung.html` prüfen | Prüfung offen |

**Bestätigte Code-Fundstellen (nur Analyse, keine Implementierung):** `web/index.html` enthält `.guide-link` mit dem bisherigen Text `Spielidee, Ablauf und Regeln`; `web/js/views.js` erzeugt die Rätselüberschrift und Einleitung (ca. Zeilen 339–344), Gruppenname (454), Gruppenwortzeit (460 und 506), Erfolgs-/Platzangaben (467–478), den Bestenlistenlink für angemeldete Nicht-Spielleiter unabhängig von der Phase (ca. 524–529). Die abschließende Rangangabe in der Phase `aufgabe_abgeschlossen` ist gesondert gegen die fachliche Abgrenzung zu prüfen.

**Noch verpflichtend vor jeder Testanpassung:** vollständige Dateiliste aller Tests erfassen; jede Testdatei einschließlich negativer Treffer auf relevante Texte, DOM-Selektoren, Phasen, Zeitwerte und Layoutannahmen bewerten; Konflikte und gültige Altanforderungen je Datei dokumentieren; Fehler-/Grenzfälle spezifizieren (Anmeldung vor/nach Phasenwechsel, Spieler/Spielleiter, Gruppenwort offen/gelöst/aufgegeben, Aufgabenübersicht, Spielende, lange Gruppennamen, 320-px-Ansicht, Tastatur/Screenreader, Linkziel); anschließend Dokumentenkette KAN → SWA → ARC/UNA → TST konsistent aktualisieren. Bis dahin keine Tests oder Anwendungscode ändern, keinen Merge durchführen.
