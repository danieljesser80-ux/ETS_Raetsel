# Schnittstellenvertrag Kernlogik (UNA-002 bis UNA-007)

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
`formGroups(playerIds, rng) -> { ok:true, groups: string[][] } | { ok:false, reason }`
- Nicht-Array oder doppelte IDs: `TypeError`.
- n < 4: `reason 'zu_wenige'`. n = 7: `reason 'nicht_teilbar'`.
- Sonst: Gruppenzahl `k = ceil(n/5)`; wenn `4*k > n`, dann `k = k-1`. Gilt danach `n > 6*k` oder `k < 1`: `'nicht_teilbar'`. Gruppengrößen unterscheiden sich um höchstens 1 und liegen in 4..6 (n=6 → eine 6er-Gruppe, n=11 → 6+5, n=8 → 4+4).
- Jeder Teilnehmer genau einmal, keine Fremd-IDs, Reihenfolge per Fisher-Yates mit `rng` gemischt; Eingabe wird nicht verändert.

`GROUP_NAMES`: Array fester weihnachtlicher Namen, mindestens 30, eindeutig (auch ohne Beachtung der Groß-/Kleinschreibung), nicht leer.
`assignGroupNames(count, rng) -> string[]`: `count` verschiedene Namen aus `GROUP_NAMES`; `count > GROUP_NAMES.length` oder ungültiges `count` → `RangeError`.

## Wörter und Buchstaben (UNA-005; SWA-008, ENT-009)
`WORDS`: genau diese 25 Wörter (Großbuchstaben A–Z):
AKKU, MOTOR, RADAR, TURBO, REIFEN, BREMSE, HYBRID, SENSOR, INVERTER, BATTERIE, WALLBOX, GETRIEBE, KUPPLUNG, LENKRAD, FAHRWERK, LADEKABEL, LADESAEULE, KAROSSERIE, REICHWEITE, REKUPERATION, ELEKTROMOTOR, STROMLADER, SCHEINWERFER, WECHSELRICHTER, STEUERGERAET.
`wordsForGroupSize(n) -> string[]`: alle Wörter mit Länge `n <= L <= 2n`.
`assignLetters(word, memberIds, rng) -> { ok:true, assignment: { [memberId]: string[] } } | { ok:false, reason }`
- reason `'ungueltiges_wort'`: nicht ausschließlich A–Z oder leer. reason `'wortlaenge'`: Länge < Mitgliederzahl oder > 2*Mitgliederzahl.
- Jedes Mitglied erhält 1 bis 2 Buchstaben; die Vereinigung aller Buchstaben ist genau die Buchstabenmultimenge des Wortes. Überschüssige Buchstaben (Länge − Mitglieder) gehen an verschiedene, zufällig gewählte Mitglieder. Zuordnung der Buchstaben zu Mitgliedern mit `rng` gemischt.

## Antworten (UNA-006; SWA-009 bis SWA-011, ENT-005)
- `normalizeAnswer(s) -> string`: trimmen und in Großbuchstaben; Nicht-String → `''`.
- `checkAnswer(input, solution) -> boolean`: normalisierter Vergleich; leere Eingabe ist falsch. Umlaute werden nicht umgeschrieben (`ä` ≠ `AE`).
- `ATTEMPT_INTERVAL_MS = 3000`
- `canSubmit({ memberGroupId, groupId, lastAttemptMs, nowMs, alreadySolved }) -> { ok:true } | { ok:false, reason }`
  - reason in Prüfreihenfolge: `'fremde_gruppe'` (memberGroupId !== groupId oder fehlt), `'bereits_geloest'`, `'zu_schnell'` (`lastAttemptMs` ist Zahl und `nowMs - lastAttemptMs < 3000`).
  - `lastAttemptMs` darf `null`/`undefined` sein (kein früherer Versuch).

## Punkte (UNA-007; SWA-012, ENT-006)
`POINTS = [10, 8, 6, 5, 4, 3, 2, 1]`
`pointsForRank(rank) -> integer`: Rang 1..8 gemäß `POINTS`, Rang > 8 → 1. Rang kein ganzzahliger Wert ≥ 1 (0, negativ, 1.5, NaN, String, undefined) → `RangeError`.
