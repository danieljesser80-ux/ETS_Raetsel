# Schnittstellenvertrag Datenbank (Supabase/PostgreSQL)

Ziel: ein einziges, wiederholt ausführbares Skript `supabase/schema.sql` (Supabase SQL-Editor, PostgreSQL 15). Quellen: DOC-003 (SWA), DOC-004 (ARC-002 bis ARC-005), Regeln in `src/core/API.md` (Namen, Gruppenbildung, Buchstaben, Antworten, Punkte; die SQL-Logik muss diese Regeln gleichwertig abbilden).

## Grundsätze
- Eine Runde (Singleton, `round` mit genau einer Zeile id=1). Kein Mehrrunden-Betrieb.
- Spieler authentifizieren sich per Supabase Anonymous Auth; Identität = `auth.uid()`.
- Alle Tabellen mit RLS; `anon` und `authenticated` haben **keine** direkten Tabellenrechte außer `SELECT` auf `round` (nur Spalten `phase`, `registration_deadline`, `closed_early`, `updated_at`). Lösungswörter/Admincode sind für Clients in keiner Weise lesbar.
- Alle Befehle sind `SECURITY DEFINER`-Funktionen (`search_path` fest auf `public`), nur für `authenticated` ausführbar (`REVOKE ... FROM PUBLIC`/`anon`). Rückgabe immer `jsonb`.
- Zeitquelle: Funktion `public.app_now() returns timestamptz` = `coalesce(nullif(current_setting('app.fake_now', true),'')::timestamptz, now())`. Alle Funktionen verwenden ausschließlich `app_now()`. (Testhilfe; Clients können die Session-Einstellung nicht setzen.)
- Admin: Tabelle `admin_config(id int primary key check(id=1), code_hash text)`; Funktion `admin_set_code(p_code text)` (nur durch Tabelleneigentümer/Skriptnutzer ausführbar, **nicht** für anon/authenticated) setzt `crypt(p_code, gen_salt('bf'))` (pgcrypto). Admin-RPCs prüfen `p_code` gegen den Hash; falscher Code → `{ok:false, reason:'nicht_berechtigt'}` ohne Änderung. Kein Admincode im Skript.
- Phasen wie `PHASES` (vorbereitet, anmeldung, gruppen_eingeteilt, wortaufgabe_aktiv, aufgabe_abgeschlossen), erlaubte Übergänge wie `canTransition`. Die Einteilung setzt die Phase direkt auf `wortaufgabe_aktiv` (ENT-005: Aufgabe startet mit der Einteilung).
- Fehler = `{ "ok": false, "reason": "<code>" }`, Erfolg = `{ "ok": true, ... }`.

## Tabellen (Mindestumfang, Namen verbindlich)
`round(id, phase, registration_deadline, closed_early, updated_at)`, `players(id uuid pk = auth.uid(), name, name_key unique (lower(trim(name))), group_id, joined_at)`, `groups(id, name unique)`, `group_tasks(group_id pk, word_id, solution)`, `letters(player_id, position, letter)`, `words(id, word unique)` (mit 25 Wörtern vorbefüllt: AKKU, MOTOR, RADAR, TURBO, REIFEN, BREMSE, HYBRID, SENSOR, INVERTER, BATTERIE, WALLBOX, GETRIEBE, KUPPLUNG, LENKRAD, FAHRWERK, LADEKABEL, LADESAEULE, KAROSSERIE, REICHWEITE, REKUPERATION, ELEKTROMOTOR, STROMLADER, SCHEINWERFER, WECHSELRICHTER, STEUERGERAET), `group_names(name)` (mindestens 30 weihnachtliche Namen), `attempts(id, group_id, player_id, at, correct)`, `results(group_id unique, rank unique, points, player_id, solved_at)`. `players.group_id` und `results` sind per Constraints konsistent (FK).

## Spieler-RPCs
- `join_round(p_name text)`: Phase muss `anmeldung` sein, `app_now() < registration_deadline` und nicht `closed_early`, sonst `reason 'anmeldung_geschlossen'`. Namensregeln wie `validateName` (`'leer'`,`'zu_kurz'`,`'zu_lang'`,`'doppelt'`; doppelt = ohne Beachtung der Groß-/Kleinschreibung). Kapazität 100: sonst `'voll'`. Idempotent: ist `auth.uid()` schon angemeldet, kommt `{ok:true, already:true, name}` ohne neue Zeile (auch nach Anmeldeschluss; bestehender Spieler bleibt gültig). Kein `auth.uid()` → `'nicht_angemeldet'`. Rückgabe `{ok:true, name}`.
- `get_state()`: für Spieler `{ ok:true, phase, deadline_ms (epoch ms oder null), server_now_ms, joined:boolean, name, group:{name, members:[Namen]} | null, letters:[...] (nur eigene, in Reihenfolge) , solved:{rank,points} | null }`. Niemals Lösungswort, fremde Buchstaben oder Daten anderer Gruppen. Nicht angemeldeter Spieler: `joined:false`.
- `submit_answer(p_answer text)`: Gruppe des Aufrufers; Gründe: `'nicht_angemeldet'`, `'keine_gruppe'`, `'falsche_phase'` (nur in `wortaufgabe_aktiv`), `'bereits_geloest'`, `'zu_schnell'` (letzter Versuch der Gruppe < 3000 ms her, gemessen mit `app_now()`). Normalisierung wie `normalizeAnswer` (trim + upper). Falsch: `{ok:true, correct:false}` (Versuch wird in `attempts` gespeichert). Richtig: `{ok:true, correct:true, rank, points}`; Rang = bisherige Ergebnisse der Runde + 1, atomar (Serialisierung per `pg_advisory_xact_lock` und Unique-Constraints), Punkte `[10,8,6,5,4,3,2,1]`, ab Rang 9: 1. Pro Gruppe höchstens ein Ergebnis.

## Admin-RPCs (alle mit erstem Parameter `p_code text`)
- `admin_start_registration(p_code, p_seconds int default 300)`: erlaubt aus `vorbereitet` und `anmeldung` (erneutes Öffnen); setzt Phase `anmeldung`, `registration_deadline = app_now() + p_seconds`, `closed_early = false`.
- `admin_close_registration(p_code)`: nur in `anmeldung`; setzt `closed_early = true`.
- `admin_form_groups(p_code)`: nur in `anmeldung` und wenn geschlossen (`closed_early` oder Frist abgelaufen), sonst `'anmeldung_offen'`. Regeln wie `formGroups` (n<4 → `'zu_wenige'`, n=7 → `'nicht_teilbar'`, sonst Größen 4..6 mit Größenunterschied ≤ 1, k = ceil(n/5), bei 4k>n k−1). Bei Ablehnung bleibt die Phase `anmeldung` und nichts wird verändert (Admin kann per `admin_start_registration` erneut öffnen). Erfolg: zufällige Zuteilung, verschiedene Gruppennamen aus `group_names`, je Gruppe ein Wort mit Länge zwischen Gruppengröße und 2×Gruppengröße (möglichst ohne Wiederholung innerhalb der Runde), Buchstabenverteilung wie `assignLetters` (jedes Mitglied 1..2 Buchstaben, Multimenge = Wort, Überschuss an verschiedene zufällige Mitglieder), Phase `wortaufgabe_aktiv`. Wiederholter Aufruf nach Erfolg → `'falsche_phase'`, keine zweite Einteilung. Rückgabe `{ok:true, groups:n}`.
- `admin_overview(p_code)`: `{ ok:true, phase, deadline_ms, server_now_ms, players:[{name,group}], groups:[{name, members:[...], solved, rank, points}], ranking:[{rank,group,points}] }` (Admin sieht alles außer Admincode; Lösungswort darf enthalten sein).
- `admin_finish(p_code)`: nur in `wortaufgabe_aktiv` → `aufgabe_abgeschlossen`.
- `admin_reset(p_code)`: löscht alle Spieler-, Gruppen-, Buchstaben-, Versuchs- und Ergebnisdaten, setzt die Runde auf `vorbereitet` (Wort-/Namenslisten und Admincode bleiben). Zulässig in jeder Phase.
- Ungültiger Phasenübergang → `'falsche_phase'`.

## Realtime
Tabelle `round` ist in der Publikation `supabase_realtime` (falls vorhanden; Skript muss auch ohne diese Publikation laufen). Clients laden nach jeder Änderung `get_state()` neu.
