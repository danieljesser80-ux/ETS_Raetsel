# Softwareanforderungen – Weihnachtsfeierspiel

**Dokument-ID:** DOC-003 | **Version:** 0.3 | **Datum:** 05.11.2026

**Status:** Entwurf; fachliche und technische Freigaben unverändert ausstehend.

[Übersicht, Statusbegriffe und Rückverfolgbarkeit](../ANFORDERUNGEN.md)

Maßgeblich für die hier definierten IDs. Anforderungen anderer Ebenen werden nur über ihre IDs referenziert. Die Abschnittsnummerierung ist dokumentlokal.

## 1. Abgeleitete Softwareanforderungen

Alle folgenden Anforderungen haben zunächst den Status **Abgeleitet, nicht freigegeben**. Abhängige offene Regeln werden nicht stillschweigend durch Standardwerte ersetzt.

| ID | Quelle | Softwareanforderung und Prüfkriterium |
|---|---|---|
| SWA-001 | KAN-003 | Eine Rundenadresse öffnet den Einstieg in genau diese Runde. Ungültige Rundenadressen zeigen eine verständliche Fehlermeldung. |
| SWA-002 | KAN-003, KAN-004, KAN-009, KAN-012 | Die Spieleroberfläche ist auf Smartphones ohne Installation bedienbar. Anmeldung, Buchstabenanzeige und Antwortabgabe funktionieren auf aktuellen Chrome- und Safari-Smartphonebrowsern (ENT-013). |
| SWA-003 | KAN-002, KAN-004 | Der Server validiert Anmeldung und Rundenstatus. Die Kapazität von 100 wird auch bei parallelen Anfragen nicht überschritten. Leere Namen werden abgewiesen; Namen haben 2 bis 20 Zeichen und sind ohne Beachtung der Groß-/Kleinschreibung eindeutig (ENT-010). |
| SWA-004 | KAN-004, KAN-009 | Jeder Teilnehmer erhält eine stabile Identität, unabhängig vom Anzeigenamen. Neuladen auf demselben Browser erhält die Zuordnung und erzeugt keinen zusätzlichen Teilnehmer. Wiederzugang erfolgt nur im selben Browser; Gerätewechsel wird nicht unterstützt (ENT-010). |
| SWA-005 | KAN-005, KAN-006 | Der Server verwaltet den verbindlichen Anmeldeschluss und die Spielphase. Der Anmeldeschluss liegt exakt 300 Sekunden nach dem freigegebenen Start. Anmeldungen ab dem Schlusszeitpunkt werden abgewiesen. Der Admin startet die Anmeldung und kann sie vorzeitig schließen (ENT-002). Nach Ablauf oder Schließen werden keine Anmeldungen mehr angenommen. |
| SWA-006 | KAN-005 | Der Client berechnet den Countdown aus dem serverseitigen Endzeitpunkt mit Korrektur für die Gerätezeit. Wiederverbinden synchronisiert die Anzeige. Ein sekündlicher Backend-Aufruf allein für den Countdown ist nicht erforderlich. |
| SWA-007 | KAN-006 bis KAN-009 | Die Gruppeneinteilung ordnet jeden zugelassenen Teilnehmer genau einer Gruppe zu. Der Admin löst die Einteilung aus; die Gruppen werden zufällig gebildet. Jede Gruppe hat 4 bis 6 Mitglieder, Gruppennamen stammen aus einer festen Liste ohne Wiederholung (ENT-003, ENT-004). Bei 1 bis 3 und bei 7 Teilnehmern erfolgt keine automatische Einteilung; der Admin öffnet die Anmeldung erneut; Dreiergruppen sind ausgeschlossen (AEN-005). Wiederholte Auslösung erzeugt keine zweite Einteilung. |
| SWA-008 | KAN-008 bis KAN-011 | Teilnehmer erhalten ihre Gruppeninformation, Aufgabenbeschreibung und genau ihre eigenen ein bis zwei Buchstaben. Das vollständige geheime Lösungswort wird nicht an den Client ausgeliefert. |
| SWA-009 | KAN-012 | Eine Antwort wird serverseitig der Gruppe des authentifizierten Teilnehmers zugeordnet. Eine vom Client behauptete fremde Gruppenzugehörigkeit wird nicht akzeptiert. Jedes Gruppenmitglied darf einreichen (ENT-005). |
| SWA-010 | KAN-011 bis KAN-013 | Antworten werden serverseitig gegen das eigene Gruppenwort geprüft. Groß-/Kleinschreibung und Leerzeichen am Rand werden ignoriert; falsche Versuche sind zulässig, pro Gruppe jedoch höchstens alle 3 Sekunden (ENT-005). Eine falsche Antwort erzeugt keinen Lösungsplatz. |
| SWA-011 | KAN-013 | Pro Gruppe und Aufgabe zählt ausschließlich die erste korrekte Abgabe. Plätze werden atomar und eindeutig vergeben; erneute oder parallele Abgaben erzeugen keinen zusätzlichen Platz. Maßgeblich ist die serverseitige Eingangsreihenfolge (ENT-006). |
| SWA-012 | KAN-014 | Punkte werden serverseitig gemäß ENT-006 (Plätze 1 bis 8: 10, 8, 6, 5, 4, 3, 2, 1; weitere Plätze 1 Punkt) genau einmal je Gruppenlösung berechnet und mit dem Ergebnis gespeichert. Der Client kann Punkte nicht frei setzen. |
| SWA-013 | KAN-002, KAN-005, KAN-009, KAN-013 | Die Anwendung unterstützt 100 gleichzeitig aktive Spieler plus Admin/optionale Anzeige. Gruppen- und Phasenänderungen werden synchronisiert. Zielwerte: Zustandswechsel innerhalb von 3 Sekunden und Antwortbestätigung innerhalb von 2 Sekunden (ENT-013); Verbindungsausfälle werden angezeigt und Wiederverbindungen holen den aktuellen Zustand. |
| SWA-014 | KAN-001, KAN-004 | Nur für das Spiel notwendige Teilnehmerdaten werden gespeichert. Der Admin sieht alle Spieldaten, Spieler nur die eigene Gruppe; die Rangliste ist nur für Admin/Beamer sichtbar (ENT-006). Der Kunde löscht die Daten spätestens 7 Tage nach der Feier (ENT-012). |
| SWA-015 | KAN-005, KAN-006, KAN-014 | Steueraktionen und Konfiguration der Runde sind gegen unberechtigte Spielerzugriffe geschützt. Die konkreten Adminaktionen folgen den freigegebenen Spielregeln. |
| SWA-016 | KAN-015 | Aufgaben weiterer Kategorien werden erst nach Festlegung ihrer Regeln in eigene SWA, UNA und TST zerlegt. Die genannten Ideen allein sind keine implementierbare Spezifikation. |
