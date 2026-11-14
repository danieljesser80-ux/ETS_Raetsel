# Aufgabenformat für den Import

Dokument-ID: DOC-010 (technische Formatbeschreibung zu UNA-037 / ARC-010/011)
Formatkennung: `raetsel-aufgaben/1`

Diese Datei beschreibt das Markdown-Format für den Aufgabenimport in der Admin-Vorbereitung. Sie enthält ausschließlich neutrale Beispieldaten. Aufgabeninhalte und Lösungen werden vom Veranstalter gepflegt und nicht in dieser Spezifikation hinterlegt.

## 1. Grundstruktur

- Eine Datei kann bis zu 60 Aufgaben enthalten.
- Jede Aufgabe beginnt mit einer eigenen Überschrift `## Aufgabe: <id>`.
- IDs bestehen aus Kleinbuchstaben, Ziffern und Bindestrichen, beginnen mit Kleinbuchstabe oder Ziffer und sind 1 bis 40 Zeichen lang.
- Die Formatkennung kann optional als erste Zeile angegeben werden: `Format: raetsel-aufgaben/1`.
- Die Datei darf höchstens 200 KB groß sein.
- Aufgaben werden in der Reihenfolge ihres Auftretens importiert.

## 2. Felder

Jede Aufgabe benötigt Kategorie, Titel, Typ und Text. Schwierigkeit ist optional und wird standardmäßig als `mittel` interpretiert.

| Feld | Pflicht | Regeln |
|---|---|---|
| Kategorie | ja | Höchstens 40 Zeichen |
| Titel | ja | Höchstens 120 Zeichen |
| Typ | ja | `exakt`, `schaetzung` oder `auswahl` |
| Schwierigkeit | nein | `leicht`, `mittel` oder `schwer`; Standard: `mittel` |
| Bild | nein | HTTPS-Adresse oder relativer Pfad ohne `..` und ohne führenden Schrägstrich |
| Lösung | nein | Höchstens 200 Zeichen; bei Schätzung/Auswahl eine ganze Zahl mit 1 bis 9 Ziffern |
| Optionen | nur Auswahl | Genau vier unterschiedliche, durch `|` getrennte Optionen |
| Richtige Option | nein | Muss einer der vier Optionen entsprechen |
| Text | ja | Aufgabenbeschreibung; bis 4.000 Zeichen, mehrzeilig |

Feldnamen sind nicht case-sensitiv. Unterstützte Synonyme für Lösung sind `Lösung` und `Loesung`; für Text kann auch `Text` verwendet werden.

Bei fehlender Lösung oder fehlender richtiger Auswahloption gibt der Parser eine Warnung aus. Eine Warnung ist kein Formatfehler, die Aufgabe ist damit jedoch gegebenenfalls noch nicht spielbar. Bei Typen außer `auswahl` sind Optionen und richtige Option nicht zulässig.

## 3. Aufgabentypen

- **exakt:** Freitextantwort, die mit der hinterlegten Lösung verglichen wird.
- **schaetzung:** Numerische Schätzantwort; die Lösung ist eine ganze Zahl.
- **auswahl:** Vier Optionen; die richtige Option wird über `Richtige Option` festgelegt. Die numerische Lösung kann zusätzlich für die Wertung verwendet werden.

## 4. Beispiel

```
Format: raetsel-aufgaben/1

## Aufgabe: beispiel-text
Kategorie: Allgemeinwissen
Titel: Beispiel für eine Textfrage
Typ: exakt
Schwierigkeit: leicht
Lösung: Musterantwort
Text:
Dies ist eine neutrale Beispielbeschreibung.
Die Beschreibung darf mehrere Zeilen enthalten.

## Aufgabe: beispiel-schaetzung
Kategorie: Schätzen
Titel: Beispiel für eine Schätzfrage
Typ: schaetzung
Schwierigkeit: mittel
Lösung: 42
Text:
Wie viele Einheiten sind in diesem neutralen Beispiel gemeint?

## Aufgabe: beispiel-auswahl
Kategorie: Wissen
Titel: Beispiel für eine Auswahlfrage
Typ: auswahl
Schwierigkeit: schwer
Lösung: 2
Optionen: Option A | Option B | Option C | Option D
Richtige Option: Option B
Text:
Welche der vier neutralen Beispieloptionen ist richtig?
```

## 5. Vorschau und Übernahme

Der Admin-Import prüft die gesamte Datei und zeigt Fehler sowie Warnungen vor der Übernahme an. Eine Datei mit Formatfehlern kann nicht übernommen werden. Die Übernahme ersetzt den gesamten Aufgabensatz und ist nur in den Spielphasen `vorbereitet` und `anmeldung` vorgesehen. Vor der Übernahme muss die Vorschau kontrolliert werden.

## 6. Datenschutz und geheime Inhalte

Keine echten Lösungen, Sperrlisten, Gruppenwörter, Admincodes oder Zugangsdaten in dieser Formatbeschreibung dokumentieren. Vertrauliche Aufgabeninhalte bleiben in der dafür vorgesehenen privaten Ablage.
