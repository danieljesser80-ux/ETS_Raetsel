# Schnittstellenvertrag Kernlogik (UNA-002 bis UNA-007, UNA-011)

Reine Funktionen, ES-Module (`"type": "module"`), keine Abhängigkeiten, Node 20. Zeit immer in Millisekunden (`nowMs`), Zufall immer als injizierbare Funktion `rng()` mit Ergebnis in [0,1). Eintritt: `src/core/index.js` re-exportiert alles. Fehler sind Rückgabewerte `{ ok:false, reason }`, außer bei Programmierfehlern (dann `RangeError`/`TypeError`).

## Namen (UNA-002; SWA-003, ENT-010)
`validateName(name, existingNames) -> { ok:true, name } | { ok:false, reason }`
- Rand-Leerzeichen werden entfernt; `name` ist der bereinigte Name.
- reason: `'leer'` (nach Trimmen leer oder kein String), `'zu_kurz'` (< 2 Zeichen), `'zu_lang'` (> 20 Zeichen; Zeichen = Unicode-Codepoints), `'doppelt'` (ohne Beachtung der Groß-/Kleinschreibung bereits in `existingNames`, ebenfalls getrimmt verglichen).
- Prüfreihenfolge: leer, zu_kurz, zu_lang, doppelt.

## Zeit und Phasen (UNA-003; SWA-005, SWA-006)
- `REGISTRATION_MS = 300000`
- `registrationDeadline(startMs) -> startMs + 300000`
- `isRegistrationOpen({ deadlineMs, nowMs, closedEarly }) -> boolean`: wahr genau wenn `nowMs < deadlineMs` und nicht `closedEarly`. Ab dem Schlusszeitpunkt (`nowMs >= deadlineMs`) falsch.
- `remainingSeconds({ deadlineMs, nowMs, offsetMs = 0 }) -> integer >= 0`: `ceil((deadlineMs - (nowMs + offsetMs)) / 1000)`, nie negativ. `offsetMs` = Serverzeit minus Gerätezeit.
- `PHASES = ['vorbereitet','anmeldung','gruppen_eingeteilt','wortaufgabe_aktiv','aufgabe_abgeschlossen']`
- `canTransition(from, to) -> boolean`: erlaubt sind nur die vier Schritte in Reihenfolge (vorbereitet→anmeldung→gruppen_eingeteilt→wortaufgabe_aktiv→aufgabe_abgeschlossen) und zusätzlich `anmeldung→anmeldung` (erneut öffnen). Alles andere, auch unbekannte Phasen, ist falsch.

## Gruppenbildung (UNA-004; SWA-007, ENT-001/003/004)
`formGroups(playerIds, rng, { min = 4, max = 6 } = {}) -> { ok:true, groups: string[][] } | { ok:false, reason }`
- Nicht-Array oder doppelte IDs: `TypeError`. Ungültige Größe (`validateGroupSize`): `RangeError`.
- `DEFAULT_GROUP_SIZE = { min: 4, max: 6 }`, `GROUP_SIZE_LIMITS = { min: 1, max: 14 }`; `validateGroupSize(min, max) -> boolean` (ganze Zahlen, 1 ≤ min ≤ max ≤ 14); `chooseGroupCount(n, min, max) -> k | null`.
- n < min: `reason 'zu_wenige'`.
- Sonst: erlaubt ist k mit `ceil(n/max) ≤ k ≤ floor(n/min)`; gewählt wird das k, dessen Durchschnittsgröße n/k am nächsten an (min+max)/2 liegt (Gleichstand, Toleranz 1e-12: größeres k). Kein k: `'nicht_teilbar'` (z. B. n = 7 bei 4 bis 6). Gruppengrößen unterscheiden sich um höchstens 1 (n=6 → eine 6er-Gruppe, n=11 → 6+5, n=12 → 4+4+4, n=16 → 6+5+5). Min = Max = 1: jede Person eine Gruppe.
- Jeder Teilnehmer genau einmal, keine Fremd-IDs, Reihenfolge per Fisher-Yates mit `rng` gemischt; Eingabe wird nicht verändert.

`GROUP_NAMES`: Array fester weihnachtlicher Namen, mindestens 30, eindeutig (auch ohne Beachtung der Groß-/Kleinschreibung), nicht leer.
`assignGroupNames(count, rng) -> string[]`: `count` verschiedene Namen aus `GROUP_NAMES`; `count > GROUP_NAMES.length` oder ungültiges `count` → `RangeError`.

## Wörter und Buchstaben (UNA-005; SWA-008, ENT-009, OFF-064)
`WORDS`: leere Liste; geheime Defaultwörter liegen außerhalb des Repositories und werden nur im Admin importiert. Die Admin-Wortliste enthält ausschließlich eindeutige A–Z-Wörter, ohne maximale Länge.
`wordsForGroupSize(n, words = WORDS) -> string[]`: gibt eine unveränderte Kopie der gesamten ausdrücklich übergebenen Wortliste zurück; die Gruppengröße filtert die Auswahl nicht.
`assignLetters(word, memberIds, rng) -> { ok:true, assignment: Record<memberId,string[]> } | { ok:false, reason }`
- reason `'ungueltiges_wort'`: nicht ausschließlich A–Z oder leer. Leere Mitgliederliste → `'keine_mitglieder'`.
- Jedes Zeichen wird genau einmal verteilt. Die Reihenfolge der Mitglieder und Buchstaben wird mit `rng` gemischt; die Buchstabenanzahl pro Mitglied unterscheidet sich höchstens um eins. Ist das Wort kürzer als die Gruppe, erhalten einzelne Mitglieder keine Buchstaben; bei langen Wörtern können Mitglieder mehr als zwei Buchstaben erhalten.

## Antworten (UNA-006; SWA-009 bis SWA-011, ENT-005)
- `normalizeAnswer(s) -> string`: trimmen und in Großbuchstaben; Nicht-String → `''`.
- `checkAnswer(input, solution) -> boolean`: normalisierter Vergleich; leere Eingabe ist falsch. Umlaute werden nicht umgeschrieben (`ä` ≠ `AE`).
- `ATTEMPT_INTERVAL_MS = 3000`
- `canSubmit({ memberGroupId, groupId, lastAttemptMs, nowMs, alreadySolved }) -> { ok:true } | { ok:false, reason }`
  - reason in Prüfreihenfolge: `'fremde_gruppe'` (memberGroupId !== groupId oder fehlt), `'bereits_geloest'`, `'zu_schnell'` (`lastAttemptMs` ist Zahl und `nowMs - lastAttemptMs < 3000`).
  - `lastAttemptMs` darf `null`/`undefined` sein (kein früherer Versuch).

## Punkte (UNA-007; SWA-012, ENT-006)
`POINTS = [10, 8, 6, 5, 4, 3, 2, 1]`
`DEFAULT_SCHEDULES`: vollständige neun Einträge je Schwierigkeit (SWA-044).
`pointsForRank(rank, schedule = DEFAULT_SCHEDULES.mittel) -> integer`: Rang 1..8 gemäß Staffel, ab9 letzter Eintrag. Rang kein ganzzahliger Wert ≥1 oder Staffel ungültig (nicht neun nichtnegative ganze Werte ≤10000 in absteigender Reihenfolge) → `RangeError`. Eingabe nicht verändern.

## Aufgaben (UNA-011; SWA-018, SWA-019)
Modul `aufgaben.js`:
- `TASK_KINDS = ['exact', 'estimate']`.
- `normalizeTaskAnswer(s) -> string`: Großbuchstaben, entfernt Leerzeichen und `,;.-`; Nicht-String → `''`.
- `checkTaskAnswer(input, solution) -> boolean`: normalisierter Vergleich; leere Eingabe ist falsch.
- `parseGuess(s) -> number | null`: nur 1 bis 9 Ziffern (nach Trimmen), sonst `null`.
- `rankSubmissions([{ groupId, correct, durationMs, atMs, guess? }], truth?) -> [{ groupId, rank }]` (AEN-021, ersetzt `rankEstimates`): Abgaben mit `correct === false` werden nicht platziert. Sortierung: bei numerischem `truth` nach Abstand `|guess − truth|`, dann kürzerer `durationMs`, dann kleinerem `atMs`, dann `groupId`; Eingabe unverändert.
