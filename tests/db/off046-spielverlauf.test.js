import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, createDb, rpc, rpcAnon, admin, q, uid, setNow, isoAt, T0_MS, resetAll, openWithPlayers, startedRound,
  setTaskPre, solutionOf, taskIn, publicIdOf, SCHEDULES, ADMIN_CODE,
} from './db-helper.js';

const skip = !SCHEMA_EXISTS && 'supabase/schema.sql fehlt';
const MIN = 60000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Gemeinsame Ausgangslage: Aufgabenloesungen sind kuenstlich, die Runde laeuft mit 8 Spielern in 2 Gruppen.
async function prepare(db, n = 8) {
  await resetAll(db);
  // Konfiguration bleibt ueber Reset erhalten: Ausgangslage ausdruecklich herstellen.
  await admin(db, 'admin_set_game_config', 25, 'mittel', JSON.stringify(SCHEDULES));
  await q(db, 'UPDATE public.tasks SET solution = NULL, image_url = NULL, options = NULL, correct_option = NULL');
  await setTaskPre(db, 'schach', { solution: 'e4 d5 h5' });
  await setTaskPre(db, 'schaetz-locker', { solution: '100' });
  await startedRound(db, n);
}
const members = async (db, gid) => (await q(db, 'SELECT id FROM public.players WHERE group_id = $1 ORDER BY id', [gid])).map((r) => r.id);
const groupIds = async (db) => (await q(db, 'SELECT id FROM public.groups ORDER BY id')).map((r) => r.id);
const wordOf = (db, gid) => q(db, 'SELECT solution FROM public.group_tasks WHERE group_id = $1', [gid]).then((r) => r[0].solution);

// TST-S-035: Spielzeit, Aufgeben, Zeitfelder, Auslaufen (SWA-044..046, UNA-028)
describe('DB OFF-046..050 Spielverlauf, Aufgeben, Zeiten', { skip }, () => {
  let db;
  let g1;
  let g2;
  let m1;
  let m2;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await prepare(db);
    [g1, g2] = await groupIds(db);
    m1 = await members(db, g1);
    m2 = await members(db, g2);
  });

  const state = (p) => rpc(db, p, 'get_state');
  const solveWord = async (p, gid) => rpc(db, p, 'submit_answer', await wordOf(db, gid));
  const finishedAt = async () => Number((await q(db, 'SELECT (extract(epoch from finished_at) * 1000)::bigint AS ms FROM public.round'))[0].ms);

  it('Gruppenbildung speichert Wortstart, Spielende (25 min) und loescht die Anmeldefrist', async () => {
    const r = (await q(db, `SELECT (extract(epoch from words_started_at) * 1000)::bigint AS s, (extract(epoch from game_deadline) * 1000)::bigint AS d,
      registration_deadline FROM public.round`))[0];
    assert.equal(Number(r.s), T0_MS);
    assert.equal(Number(r.d), T0_MS + 25 * MIN);
    assert.equal(r.registration_deadline, null);
    const s = await state(m1[0]);
    assert.equal(s.word_started_ms, T0_MS);
    assert.equal(s.game_deadline_ms, T0_MS + 25 * MIN);
    assert.equal(s.deadline_ms ?? null, null);
  });

  it('Aufgaben frei: vorher tasks leer; nach Wort-Aufgeben nur konfigurierte Aufgaben verfuegbar, Unvollstaendige nicht', async () => {
    const before = await state(m1[1]);
    assert.deepEqual(before.tasks ?? [], []);
    assert.equal((await rpc(db, m1[1], 'give_up')).ok, true);
    const s = await state(m1[1]);
    assert.equal(s.leader, true);
    assert.equal(s.tasks.find((t) => t.id === 'schach').available, true);
    assert.equal(s.tasks.find((t) => t.id === 'schach').started, false);
    assert.equal(s.tasks.find((t) => t.id === 'sudoku')?.available ?? false, false, 'ohne Loesung nicht verfuegbar');
  });

  it('Spielzeit folgt der Konfiguration beim Gruppenbilden', async () => {
    await resetAll(db);
    await admin(db, 'admin_set_game_config', 7, 'mittel', JSON.stringify(SCHEDULES));
    await startedRound(db, 8);
    assert.equal((await state(uid(1))).game_deadline_ms, T0_MS + 7 * MIN);
  });

  it('get_state: Anfangswerte vor jeder Abgabe', async () => {
    const s = await state(m1[0]);
    assert.equal(s.solved ?? null, null);
    assert.equal(s.word_completed, false);
    assert.equal(s.word_outcome, null);
    assert.equal(s.word_duration_ms ?? null, null);
    assert.equal(s.finished_at_ms ?? null, null);
    assert.equal(typeof s.closed_early, 'boolean');
    assert.equal(s.phase, 'wortaufgabe_aktiv');
  });

  it('get_state: richtiges Wort -> solved, word_completed, word_outcome solved, Dauer in ms', async () => {
    await setNow(db, isoAt(T0_MS + 20123));
    const r = await solveWord(m1[1], g1);
    assert.equal(r.correct, true);
    const s = await state(m1[0]);
    assert.deepEqual(s.solved, { rank: 1 });
    assert.equal(s.word_completed, true);
    assert.equal(s.word_outcome, 'solved');
    assert.equal(s.word_duration_ms, 20123);
    const other = await state(m2[0]);
    assert.equal(other.word_completed, false);
  });

  it('give_up(wort): jedes Mitglied darf, wird Spielleiter, kein solved, Folgeaufgaben frei', async () => {
    const caller = m1[2];
    await setNow(db, isoAt(T0_MS + 9000));
    assert.equal((await rpc(db, caller, 'give_up')).ok, true);
    const s = await state(caller);
    assert.equal(s.solved ?? null, null);
    assert.equal(s.word_completed, true);
    assert.equal(s.word_outcome, 'given_up');
    assert.equal(s.word_duration_ms, 9000);
    assert.equal(s.leader, true);
    assert.equal(s.tasks.find((t) => t.id === 'schach').available, true);
    const mate = await state(m1[0]);
    assert.equal(mate.leader, false);
    assert.equal(mate.word_outcome, 'given_up');
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results WHERE group_id = $1', [g1]))[0].c <= 1, true);
  });

  it('give_up(wort) mit explizitem Argument und nur einmal; danach keine Wortabgabe mehr', async () => {
    assert.equal((await rpc(db, m1[0], 'give_up', 'wort')).ok, true);
    const again = await rpc(db, m1[1], 'give_up', 'wort');
    assert.equal(again.ok, false);
    assert.equal((await state(m1[1])).leader, false, 'Spielleiter wird nur einmal vergeben');
    assert.equal((await state(m1[0])).leader, true);
    const sub = await solveWord(m1[1], g1);
    assert.equal(sub.ok, false);
    assert.equal((await state(m1[0])).word_outcome, 'given_up');
  });

  it('give_up(wort) nach geloestem Wort nicht moeglich; Wort bleibt geloest', async () => {
    await solveWord(m1[1], g1);
    assert.equal((await rpc(db, m1[0], 'give_up')).ok, false);
    assert.equal((await state(m1[0])).word_outcome, 'solved');
  });

  it('give_up: Rechte, Phase und unbekannte Aufgabe', async () => {
    assert.equal((await rpc(db, uid(777), 'give_up')).ok, false);
    assert.equal((await rpc(db, null, 'give_up')).ok, false);
    await rpc(db, m1[0], 'give_up');
    assert.equal((await rpc(db, m1[0], 'give_up', 'nix')).reason, 'unbekannte_aufgabe');
    await openWithPlayers(db, 3);
    assert.equal((await rpc(db, uid(1), 'give_up')).ok, false);
  });

  it('give_up bei Aufgabe: nur Spielleiter, nur nach dem Oeffnen, danach given_up, keine Platzierung, 0 Punkte', async () => {
    await rpc(db, m1[0], 'give_up');
    const lead = m1[0];
    const other = m1[1];
    assert.equal((await rpc(db, lead, 'give_up', 'schach')).reason, 'nicht_gestartet');
    await rpc(db, lead, 'start_task', 'schach');
    assert.equal((await rpc(db, other, 'give_up', 'schach')).reason, 'nicht_spielleiter');
    await setNow(db, isoAt(T0_MS + 40000));
    assert.equal((await rpc(db, lead, 'give_up', 'schach')).ok, true);
    const t = await taskIn(db, await state(lead), 'schach');
    assert.equal(t.given_up, true);
    assert.equal(t.submitted, true);
    assert.notEqual(t.correct, true);
    assert.ok(!t.placement);
    assert.equal(typeof t.duration_ms, 'number');
    assert.equal((await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5')).ok, false);
    assert.equal((await rpc(db, lead, 'start_task', 'schach')).ok, false);
    assert.equal((await rpc(db, lead, 'give_up', 'schach')).ok, false);
    await admin(db, 'admin_finish');
    const fin = await taskIn(db, await state(lead), 'schach');
    assert.ok(!fin.placement || fin.placement.points === 0 || fin.placement.points === undefined);
    assert.ok(!fin.placement || fin.placement.rank === undefined);
  });

  it('give_up akzeptiert auch die oeffentliche Aufgaben-ID; Schaetzaufgabe: correct false, kein Rang', async () => {
    await rpc(db, m1[0], 'give_up');
    await q(db, "UPDATE public.tasks SET solution = 'synthetisch' WHERE id LIKE 'geo-%' AND solution IS NULL");
    await rpc(db, m1[0], 'start_task', 'schaetz-locker');
    await rpc(db, m1[0], 'start_task', 'geo-saeule');
    const pid = await publicIdOf(db, 'geo-saeule');
    assert.equal((await rpc(db, m1[0], 'give_up', pid)).ok, true);
    assert.equal((await taskIn(db, await state(m1[0]), 'geo-saeule')).given_up, true);
    assert.equal((await rpc(db, m1[0], 'give_up', 'schaetz-locker')).ok, true);
    const t = await taskIn(db, await state(m1[0]), 'schaetz-locker');
    assert.equal(t.given_up, true);
    assert.notEqual(t.correct, true);
    assert.ok(!t.placement);
    const ov = await admin(db, 'admin_overview');
    const row = (ov.task_results ?? []).find((x) => JSON.stringify(x).includes(pid) || x.task_id === 'schaetz-locker') ?? null;
    if (row) assert.ok(!JSON.stringify(row).includes('"rank":1'));
  });

  it('Aufgegebene Aufgabe gewinnt gegenueber richtiger Abgabe der anderen Gruppe keinen Rang', async () => {
    await solveWord(m1[0], g1);
    await rpc(db, m2[0], 'give_up');
    await rpc(db, m1[0], 'start_task', 'schach');
    await rpc(db, m2[0], 'start_task', 'schach');
    await setNow(db, isoAt(T0_MS + 30000));
    await rpc(db, m2[0], 'give_up', 'schach');
    await setNow(db, isoAt(T0_MS + 60000));
    assert.equal((await rpc(db, m1[0], 'submit_task_answer', 'schach', 'e4 d5 h5')).correct, true);
    assert.equal((await taskIn(db, await state(m1[0]), 'schach')).placement.rank, 1);
    assert.ok(!(await taskIn(db, await state(m2[0]), 'schach')).placement);
  });

  it('get_state: Aufgaben-IDs sind oeffentliche UUIDs, Geo-Aufgaben neutral Aufgabe1/Aufgabe2 mit detail_title erst nach dem Start', async () => {
    await q(db, "UPDATE public.tasks SET solution = 'synthetisch' WHERE id LIKE 'geo-%' AND solution IS NULL");
    await solveWord(m1[0], g1);
    const geoIds = [await publicIdOf(db, 'geo-saeule'), await publicIdOf(db, 'geo-baum')];
    const real = await q(db, "SELECT id, title FROM public.tasks WHERE id LIKE 'geo-%'");
    let s = await state(m1[0]);
    assert.ok(geoIds.every((id) => UUID.test(id)), 'Geo-IDs sind UUIDs');
    assert.ok(s.tasks.filter((t) => !geoIds.includes(t.id)).every((t) => !UUID.test(t.id)), 'andere Aufgaben behalten ihre ID');
    const geo = geoIds.map((id) => s.tasks.find((t) => t.id === id));
    assert.deepEqual(geo.map((t) => t.title), ['Aufgabe 1', 'Aufgabe 2']);
    assert.ok(geo.every((t) => t.detail_title === null || t.detail_title === undefined));
    for (const r of real) assert.ok(!JSON.stringify(s).includes(`"${r.id}"`), `interne ID ${r.id} sichtbar`);
    for (const r of real.filter((x) => x.id.startsWith('geo-'))) assert.ok(!JSON.stringify(s).includes(r.title), 'Geo-Titel sichtbar');
    assert.ok(s.tasks.every((t) => ['leicht', 'mittel', 'schwer'].includes(t.difficulty)));
    await rpc(db, m1[0], 'start_task', 'geo-saeule');
    s = await state(m1[0]);
    const started = s.tasks.find((t) => t.id === geoIds[0]);
    assert.equal(started.title, 'Aufgabe 1', 'neutraler Titel bleibt dauerhaft');
    assert.equal(started.detail_title, real.find((x) => x.id === 'geo-saeule').title);
    assert.equal(s.tasks.find((t) => t.id === geoIds[1]).detail_title ?? null, null);
    assert.equal(geoIds.join(), [await publicIdOf(db, 'geo-saeule'), await publicIdOf(db, 'geo-baum')].join(), 'stabil');
  });

  it('get_state: start_task/submit_task_answer mit oeffentlicher ID, Zeitfelder started_at_ms und duration_ms', async () => {
    await solveWord(m1[0], g1);
    const pid = await publicIdOf(db, 'schach');
    await setNow(db, isoAt(T0_MS + 100000));
    assert.equal((await rpc(db, m1[0], 'start_task', pid)).ok, true);
    let t = await taskIn(db, await state(m1[0]), 'schach');
    assert.equal(t.started_at_ms, T0_MS + 100000);
    assert.equal(t.duration_ms ?? null, null);
    assert.equal(t.given_up, false);
    await setNow(db, isoAt(T0_MS + 107500));
    await rpc(db, m1[0], 'submit_task_answer', pid, 'e4 d5 h5');
    t = await taskIn(db, await state(m1[0]), 'schach');
    assert.equal(t.duration_ms, 7500);
  });

  it('Spielende zur Frist: get_state beendet die Runde, finished_at ist die Frist, nichts mehr annehmbar', async () => {
    const deadline = T0_MS + 25 * MIN;
    await setNow(db, isoAt(deadline + 5 * MIN));
    const s = await state(m1[0]);
    assert.equal(s.phase, 'aufgabe_abgeschlossen');
    assert.equal(s.finished_at_ms, deadline);
    assert.equal(await finishedAt(), deadline);
    assert.equal((await rpc(db, m1[0], 'submit_answer', await wordOf(db, g1))).reason, 'falsche_phase');
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 0);
  });

  it('Kein Eingang genau zur Frist; eine Millisekunde davor ist noch erlaubt', async () => {
    const deadline = T0_MS + 25 * MIN;
    await setNow(db, isoAt(deadline - 1));
    assert.equal((await solveWord(m1[0], g1)).correct, true);
    await setNow(db, isoAt(deadline));
    const r = await rpc(db, m2[0], 'submit_answer', await wordOf(db, g2));
    assert.deepEqual(r, { ok: false, reason: 'falsche_phase' });
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 1);
  });

  it('Jede Aktion nach der Frist loest das Auslaufen aus: start_task, submit_task_answer, give_up, admin_overview', async () => {
    await solveWord(m1[0], g1);
    await rpc(db, m1[0], 'start_task', 'schach');
    const deadline = T0_MS + 25 * MIN;
    await setNow(db, isoAt(deadline + 1000));
    assert.equal((await rpc(db, m1[0], 'submit_task_answer', 'schach', 'e4 d5 h5')).reason, 'falsche_phase');
    assert.equal(await finishedAt(), deadline);
    await prepare(db);
    await setNow(db, isoAt(deadline + 1000));
    assert.equal((await rpc(db, uid(1), 'give_up')).reason, 'falsche_phase');
    await prepare(db);
    await setNow(db, isoAt(deadline + 1000));
    const ov = await admin(db, 'admin_overview');
    assert.equal(ov.finished, true);
    await prepare(db);
    await setNow(db, isoAt(deadline + 1000));
    assert.equal((await rpc(db, uid(1), 'start_task', 'schach')).ok, false);
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'aufgabe_abgeschlossen');
  });

  it('expire_game ist idempotent, wirkt nicht vor der Frist und ist nur intern aufrufbar', async () => {
    await q(db, 'SELECT public.expire_game()');
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'wortaufgabe_aktiv');
    await setNow(db, isoAt(T0_MS + 26 * MIN));
    await q(db, 'SELECT public.expire_game()');
    const first = await finishedAt();
    await setNow(db, isoAt(T0_MS + 90 * MIN));
    await q(db, 'SELECT public.expire_game()');
    assert.equal(await finishedAt(), first);
    assert.equal(first, T0_MS + 25 * MIN);
    await assert.rejects(() => rpc(db, uid(1), 'expire_game'), /permission denied/i);
    await assert.rejects(() => rpcAnon(db, 'expire_game'), /permission denied/i);
  });

  it('expire_game ohne fake_now nutzt die echte Uhr und laesst eine Zukunftsfrist unberuehrt', async () => {
    await q(db, "SELECT set_config('app.fake_now', '', false)");
    await q(db, "UPDATE public.round SET game_deadline = clock_timestamp() + interval '1 hour'");
    await q(db, 'SELECT public.expire_game()');
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'wortaufgabe_aktiv');
    await q(db, "UPDATE public.round SET game_deadline = clock_timestamp() - interval '1 second'");
    await q(db, 'SELECT public.expire_game()');
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'aufgabe_abgeschlossen');
  });

  it('Manuelles Beenden: speichert finished_at, ist idempotent, spaetere Aufrufe aendern nichts', async () => {
    await setNow(db, isoAt(T0_MS + 10 * MIN));
    assert.equal((await admin(db, 'admin_finish')).ok, true);
    assert.equal(await finishedAt(), T0_MS + 10 * MIN);
    await setNow(db, isoAt(T0_MS + 12 * MIN));
    assert.equal((await admin(db, 'admin_finish')).ok, true);
    assert.equal(await finishedAt(), T0_MS + 10 * MIN);
    const s = await state(m1[0]);
    assert.equal(s.finished_at_ms, T0_MS + 10 * MIN);
    assert.equal(s.phase, 'aufgabe_abgeschlossen');
  });

  it('automatic_end_ready ist ohne pg_cron ausdruecklich false', async () => {
    const ov = await admin(db, 'admin_overview');
    assert.strictEqual(ov.automatic_end_ready, false);
  });

  it('closed_early wird in get_state gespiegelt', async () => {
    await resetAll(db);
    await admin(db, 'admin_start_registration');
    await rpc(db, uid(1), 'join_round', 'Spieler 1');
    await admin(db, 'admin_close_registration');
    assert.equal((await state(uid(1))).closed_early, true);
  });

  it('Beenden behaelt geloeste und aufgegebene Woerter unveraendert, aufgegeben ist kein solved', async () => {
    await solveWord(m1[0], g1);
    await rpc(db, m2[0], 'give_up');
    await admin(db, 'admin_finish');
    assert.deepEqual([(await state(m1[0])).word_outcome, (await state(m2[0])).word_outcome], ['solved', 'given_up']);
    const f = await state(m2[0]);
    assert.equal(f.solved ?? null, null);
    assert.equal(f.final.points, 0);
  });

  it('Alle Abgaben, Aufgeben und Beenden verwenden dieselbe Sperre (Funktionen holen raetsel_answer)', async () => {
    const src = (await q(db, `SELECT proname, prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND proname IN ('submit_answer','start_task','submit_task_answer','give_up','admin_finish','admin_reset','expire_game')`));
    const names = src.map((r) => r.proname);
    for (const n of ['give_up', 'submit_answer', 'admin_finish', 'expire_game']) assert.ok(names.includes(n), n);
    for (const r of src.filter((x) => ['give_up', 'submit_answer', 'admin_finish', 'submit_task_answer'].includes(x.proname))) {
      assert.match(r.prosrc, /raetsel_answer/, `${r.proname} serialisiert ueber raetsel_answer`);
    }
    const excl = (await q(db, `SELECT prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND proname = 'expire_game_exclusive'`))[0].prosrc;
    assert.match(excl, /for update/i);
    assert.match(excl, /raetsel_answer/);
    assert.doesNotMatch(src.find((r) => r.proname === 'expire_game').prosrc, /for update/i);
  });
});

// TST-S-036: Ergebnisexport und Beamer-Anzeige (SWA-047..048, UNA-029..030)
describe('DB OFF-051..056 Export und Beamer', { skip }, () => {
  let db;
  let g1;
  let g2;
  let m1;
  let m2;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await prepare(db);
    [g1, g2] = await groupIds(db);
    m1 = await members(db, g1);
    m2 = await members(db, g2);
  });

  const rowsOf = (res) => res.rows;
  const GROUP_NAME = async (gid) => (await q(db, 'SELECT name FROM public.groups WHERE id = $1', [gid]))[0].name;
  const titleOf = async (id) => (await q(db, 'SELECT title FROM public.tasks WHERE id = $1', [id]))[0].title;

  it('admin_export vor dem Ende: nicht erlaubt; falscher Code und anon abgelehnt', async () => {
    assert.equal((await admin(db, 'admin_export')).reason, 'falsche_phase');
    await admin(db, 'admin_finish');
    assert.equal((await rpc(db, uid(1), 'admin_export', 'falsch')).reason, 'nicht_berechtigt');
    await assert.rejects(() => rpcAnon(db, 'admin_export', ADMIN_CODE), /permission denied/i);
  });

  it('admin_export: Zeilen fuer alle Gruppen x (Wort + Aufgaben) mit genau den vertraglichen Feldern', async () => {
    await admin(db, 'admin_finish');
    const r = await admin(db, 'admin_export');
    assert.equal(r.ok, true);
    const tasks = (await q(db, 'SELECT count(*)::int AS c FROM public.tasks'))[0].c;
    assert.equal(r.rows.length, 2 * (tasks + 1));
    for (const row of r.rows) {
      assert.deepEqual(Object.keys(row).sort(), ['duration_ms', 'group', 'points', 'rank', 'status', 'task', 'task_points', 'task_rank']);
      assert.ok(['solved', 'given_up', 'wrong', 'estimated', 'not_started', 'open'].includes(row.status), row.status);
    }
    assert.equal(new Set(r.rows.map((x) => x.group)).size, 2);
    assert.ok(r.rows.every((x) => x.status === 'not_started' || x.status === 'open'));
    assert.ok(r.rows.filter((x) => x.status === 'not_started').every((x) => x.duration_ms === null));
  });

  it('admin_export: Status solved, given_up, wrong, estimated, open mit Zeiten und Punkten', async () => {
    const n1 = await GROUP_NAME(g1);
    const n2 = await GROUP_NAME(g2);
    await setNow(db, isoAt(T0_MS + 20000));
    await rpc(db, m1[0], 'submit_answer', await wordOf(db, g1));
    await setNow(db, isoAt(T0_MS + 25000));
    await rpc(db, m2[0], 'give_up');
    await rpc(db, m1[0], 'start_task', 'schach');
    await rpc(db, m1[0], 'start_task', 'schaetz-locker');
    await rpc(db, m2[0], 'start_task', 'schach');
    for (const [i, a] of ['x1', 'x2', 'x3'].entries()) {
      await setNow(db, isoAt(T0_MS + 30000 + i * 4000));
      await rpc(db, m1[0], 'submit_task_answer', 'schach', a);
    }
    await setNow(db, isoAt(T0_MS + 50000));
    await rpc(db, m1[0], 'submit_task_answer', 'schaetz-locker', '90');
    await admin(db, 'admin_finish');
    const r = await admin(db, 'admin_export');
    const find = (g, t) => r.rows.find((x) => x.group === g && x.task === t);
    const word = r.rows.filter((x) => x.group === n1 && x.status === 'solved' && x.duration_ms === 20000);
    assert.equal(word.length, 1);
    assert.equal(word[0].task_rank, 1);
    assert.equal(word[0].task_points, 10);
    assert.equal(find(n1, await titleOf('schach')).status, 'wrong');
    assert.equal(find(n1, await titleOf('schaetz-locker')).status, 'estimated');
    assert.equal(find(n2, await titleOf('schach')).status, 'open');
    const openDur = find(n2, await titleOf('schach')).duration_ms;
    assert.ok(openDur === null || typeof openDur === 'number');
    const given = r.rows.filter((x) => x.group === n2 && x.status === 'given_up');
    assert.equal(given.length, 1);
    assert.equal(given[0].task_points, 0);
    assert.equal(given[0].task_rank, null);
    assert.equal(find(n1, await titleOf('sudoku')).status, 'not_started');
    for (const g of [n1, n2]) {
      const own = r.rows.filter((x) => x.group === g);
      assert.equal(new Set(own.map((x) => x.rank)).size, 1, 'Gesamtrang je Gruppe gleich');
      assert.equal(new Set(own.map((x) => x.points)).size, 1);
    }
  });

  it('admin_export enthaelt weder Antworten noch Loesungen noch Spielernamen', async () => {
    await rpc(db, m1[0], 'submit_answer', 'FALSCHANTWORT');
    await solveWord(m1[1]);
    await admin(db, 'admin_finish');
    const json = JSON.stringify(await admin(db, 'admin_export'));
    for (const g of [g1, g2]) assert.ok(!json.includes(await wordOf(db, g)), 'Loesungswort');
    for (const s of ['FALSCHANTWORT', 'e4 d5 h5', 'e4d5h5']) assert.ok(!json.toLowerCase().includes(s.toLowerCase()), s);
    assert.ok(!/Spieler \d/.test(json));
    assert.ok(!/solution|answer|antwort|letter/i.test(json));
  });

  async function solveWord(p) {
    const gid = (await q(db, 'SELECT group_id FROM public.players WHERE id = $1', [p]))[0].group_id;
    return rpc(db, p, 'submit_answer', await wordOf(db, gid));
  }

  it('admin_open_beamer: Token, nur Hash gespeichert, nur mit Admincode', async () => {
    const r = await admin(db, 'admin_open_beamer');
    assert.equal(r.ok, true);
    assert.equal(typeof r.token, 'string');
    assert.ok(r.token.length >= 20);
    const stored = JSON.stringify(await q(db, 'SELECT to_jsonb(t) AS j FROM public.display_tokens t'));
    assert.ok(!stored.includes(r.token), 'Token im Klartext gespeichert');
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.display_tokens'))[0].c >= 1, true);
    assert.equal((await rpc(db, uid(1), 'admin_open_beamer', 'falsch')).reason, 'nicht_berechtigt');
    await assert.rejects(() => rpcAnon(db, 'admin_open_beamer', ADMIN_CODE), /permission denied/i);
  });

  it('beamer_state: anon liest bereinigte Anzeige ohne Loesungen, Buchstaben und Spielernamen', async () => {
    const t = (await admin(db, 'admin_open_beamer')).token;
    await solveWord(m1[0]);
    const res = await rpcAnon(db, 'beamer_state', t);
    const s = rowsOf(res)[0].r;
    assert.equal(s.ok, true);
    assert.equal(s.phase, 'wortaufgabe_aktiv');
    assert.equal(s.participants_count, 8);
    assert.equal(s.finished, false);
    assert.equal(typeof s.deadline_ms === 'number' || s.deadline_ms === null || s.game_deadline_ms !== undefined, true);
    assert.ok(Array.isArray(s.groups));
    assert.ok(Array.isArray(s.ranking));
    const json = JSON.stringify(s);
    for (const g of [g1, g2]) assert.ok(!json.includes(await wordOf(db, g)));
    const doneNames = (await q(db, 'SELECT name FROM public.players WHERE group_id = $1', [g1])).map((x) => x.name);
    for (const n of doneNames) assert.ok(!json.includes(n), 'Teilnehmer geloester Gruppe ersetzt durch Gruppe komplett');
    assert.ok(!/solution|loesung|letters|code_hash/i.test(json));
    const letters = (await q(db, 'SELECT letter FROM public.letters LIMIT 1'))[0].letter;
    assert.ok(!json.includes(`"${letters}"`) || letters.length === 0);
  });

  it('beamer_state: ungueltiges Token wird abgelehnt', async () => {
    for (const bad of ['', 'nix', 'x'.repeat(40), null]) {
      const r = rowsOf(await rpcAnon(db, 'beamer_state', bad))[0].r;
      assert.equal(r.ok, false, String(bad));
      assert.ok(!('groups' in r) && !('ranking' in r));
    }
  });

  it('beamer_state zeigt nach dem Ende finished und Rangliste mit Punkten', async () => {
    const t = (await admin(db, 'admin_open_beamer')).token;
    await solveWord(m1[0]);
    await admin(db, 'admin_finish');
    const s = rowsOf(await rpcAnon(db, 'beamer_state', t))[0].r;
    assert.equal(s.finished, true);
    assert.ok(s.ranking.length >= 1);
    assert.equal(typeof s.ranking[0].points, 'number');
  });

  it('beamer_state laeuft zur Frist aus, auch ohne Spieleraktion', async () => {
    const t = (await admin(db, 'admin_open_beamer')).token;
    await setNow(db, isoAt(T0_MS + 26 * MIN));
    const s = rowsOf(await rpcAnon(db, 'beamer_state', t))[0].r;
    assert.equal(s.finished, true);
  });

  it('Token werden durch admin_reset und admin_set_code ungueltig', async () => {
    const t1 = (await admin(db, 'admin_open_beamer')).token;
    assert.equal(rowsOf(await rpcAnon(db, 'beamer_state', t1))[0].r.ok, true);
    await admin(db, 'admin_reset');
    assert.equal(rowsOf(await rpcAnon(db, 'beamer_state', t1))[0].r.ok, false);
    const t2 = (await admin(db, 'admin_open_beamer')).token;
    assert.equal(rowsOf(await rpcAnon(db, 'beamer_state', t2))[0].r.ok, true);
    await q(db, 'SELECT public.admin_set_code($1)', ['neuer-test-code-1']);
    assert.equal(rowsOf(await rpcAnon(db, 'beamer_state', t2))[0].r.ok, false);
    await q(db, 'SELECT public.admin_set_code($1)', [ADMIN_CODE]);
    assert.equal(rowsOf(await rpcAnon(db, 'beamer_state', t2))[0].r.ok, false, 'bleibt ungueltig');
  });
});
