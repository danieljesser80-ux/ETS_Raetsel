import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SCHEMA_EXISTS, SCHEMA_PATH, createDb, rpc, rpcAnon, sqlAs, admin, q, uid, startedRound, solutionOf, setNow, T0_MS, isoAt, taskIn, setTaskPre,
} from './db-helper.js';

// TST-S-029 / TST-U-021: bis zu drei Versuche bei exakten Aufgaben (OFF-024, OFF-027), ausschliesslich kuenstliche Loesungen.
describe('DB AEN-028 Mehrfachversuche exakter Aufgaben', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  let t = 0;
  const tick = async (ms = 5000) => {
    t += ms;
    await setNow(db, isoAt(T0_MS + t));
  };
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    t = 0;
    await q(db, 'UPDATE public.tasks SET solution = NULL, image_url = NULL, options = NULL, correct_option = NULL');
    await startedRound(db, 8);
    await tick();
  });

  const MAX = 3;
  const groupOf = async (n) => (await q(db, 'SELECT group_id FROM public.players WHERE id = $1', [uid(n)]))[0].group_id;
  const otherPlayer = async () =>
    Number((await q(db, 'SELECT id FROM public.players WHERE group_id <> $1 ORDER BY id LIMIT 1', [await groupOf(1)]))[0].id.slice(-6));
  const solveWord = async (n) => rpc(db, uid(n), 'submit_answer', await solutionOf(db, uid(n)));
  const leaderOf = async (n) => (await q(db, 'SELECT player_id FROM public.results WHERE group_id = $1', [await groupOf(n)]))[0].player_id;
  const setTask = (id, patch) => setTaskPre(db, id, patch);
  const stateTask = async (p, id) => taskIn(db, await rpc(db, p, 'get_state'), id);
  const count = async (tb) => (await q(db, `SELECT count(*)::int AS c FROM public.${tb}`))[0].c;
  const attemptsOf = (task, n) =>
    q(db, 'SELECT attempt_no, correct, duration_ms FROM public.task_attempts WHERE task_id = $1 AND group_id = $2 ORDER BY attempt_no', [task, n]);
  const wrongReply = (used) => ({ ok: true, submitted: false, correct: false, attempts_used: used, attempts_remaining: MAX - used, max_attempts: MAX });

  async function leaderWithTask(id, solution, n = 1) {
    await setTask(id, { solution });
    await solveWord(n);
    const lead = await leaderOf(n);
    assert.deepEqual(await rpc(db, lead, 'start_task', id), { ok: true });
    return lead;
  }

  it('TST-S-029: Zaehler vor der ersten Abgabe 0 von 3, sonst ohne Abschluss', async () => {
    const lead = await leaderWithTask('schach', 'e4 d5 h5');
    const task = await stateTask(lead, 'schach');
    assert.equal(task.attempts_used, 0);
    assert.equal(task.attempts_remaining, 3);
    assert.equal(task.max_attempts, 3);
    assert.equal(task.submitted, false);
    assert.equal(task.correct ?? null, null);
  });

  it('TST-S-029: falsch, falsch, richtig – Zaehler, Antworten, Abschluss, Rang und Dauer ab erstem Oeffnen', async () => {
    const lead = await leaderWithTask('schach', 'e4 d5 h5'); // geoeffnet bei t = 5000
    const openedAt = t;
    await tick(10000);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'a1 a2 a3'), wrongReply(1));
    let task = await stateTask(lead, 'schach');
    assert.equal(task.submitted, false);
    assert.equal(task.correct, false);
    assert.equal(task.attempts_used, 1);
    assert.equal(task.attempts_remaining, 2);
    assert.ok(!task.placement, 'Fehlversuch ohne Rang');
    assert.equal(await count('task_answers'), 0, 'kein abgeschlossenes Ergebnis');
    await tick(10000);
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: true }, 'erneutes Oeffnen erlaubt');
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'b1 b2 b3'), wrongReply(2));
    task = await stateTask(lead, 'schach');
    assert.equal(task.submitted, false);
    assert.equal(task.attempts_used, 2);
    assert.equal(task.attempts_remaining, 1);
    assert.equal(await count('task_answers'), 0);
    await tick(10000);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', ' E4 D5 H5 '),
      { ok: true, submitted: true, correct: true, attempts_used: 3, attempts_remaining: 0, max_attempts: 3 });
    task = await stateTask(lead, 'schach');
    assert.equal(task.submitted, true);
    assert.equal(task.correct, true);
    assert.equal(task.attempts_used, 3);
    assert.equal(task.attempts_remaining, 0);
    assert.deepEqual(task.placement, { rank: 1 });
    const rows = await q(db, 'SELECT duration_ms FROM public.task_answers WHERE task_id = $1', ['schach']);
    assert.equal(rows.length, 1);
    assert.equal(Number(rows[0].duration_ms), t - openedAt, 'Dauer ab erstem Oeffnen, kein Zeitneustart');
    assert.deepEqual((await attemptsOf('schach', await groupOf(1))).map((r) => [r.attempt_no, r.correct]), [[1, false], [2, false], [3, true]]);
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5'), { ok: false, reason: 'bereits_abgegeben' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: false, reason: 'bereits_abgegeben' });
    assert.equal(await count('task_attempts'), 3);
  });

  it('TST-S-029: richtige Antwort im ersten Versuch schliesst sofort ab', async () => {
    const lead = await leaderWithTask('schach', 'e4');
    await tick();
    const r = await rpc(db, lead, 'submit_task_answer', 'schach', 'e4');
    assert.equal(r.ok, true);
    assert.equal(r.submitted, true);
    assert.equal(r.correct, true);
    assert.equal(r.attempts_used, 1);
    assert.equal(r.max_attempts, 3);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4'), { ok: false, reason: 'bereits_abgegeben' });
    assert.equal(await count('task_answers'), 1);
  });

  it('TST-S-029: drei Fehlversuche schliessen falsch ab, vierte Abgabe und Oeffnen abgewiesen, kein Rang', async () => {
    const lead = await leaderWithTask('sudoku', '123456');
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'sudoku', '1'), wrongReply(1));
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'sudoku', '2'), wrongReply(2));
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'sudoku', '3'),
      { ok: true, submitted: true, correct: false, attempts_used: 3, attempts_remaining: 0, max_attempts: 3 });
    const task = await stateTask(lead, 'sudoku');
    assert.equal(task.submitted, true);
    assert.equal(task.correct, false);
    assert.equal(task.attempts_used, 3);
    assert.equal(task.attempts_remaining, 0);
    assert.ok(!task.placement);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'sudoku', '123456'), { ok: false, reason: 'bereits_abgegeben' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'sudoku'), { ok: false, reason: 'bereits_abgegeben' });
    const answers = await q(db, 'SELECT group_id FROM public.task_answers WHERE task_id = $1', ['sudoku']);
    assert.equal(answers.length, 1, 'genau ein abgeschlossenes Ergebnis');
    assert.equal(await count('task_attempts'), 3, 'vierte Abgabe verbraucht nichts');
    assert.ok(!(await stateTask(lead, 'sudoku')).placement);
  });

  it('TST-S-029: alle exakten Aufgaben (Schach, Sudoku, Wissensquiz, Geocaching) erlauben drei Versuche', async () => {
    await solveWord(1);
    const lead = await leaderOf(1);
    const exact = (await q(db, "SELECT id FROM public.tasks WHERE kind = 'exact' ORDER BY id")).map((r) => r.id);
    assert.ok(exact.length >= 4, 'mindestens vier exakte Aufgaben');
    for (const id of exact) {
      await setTask(id, { solution: 'richtig' });
      assert.deepEqual(await rpc(db, lead, 'start_task', id), { ok: true }, id);
      await tick();
      assert.deepEqual(await rpc(db, lead, 'submit_task_answer', id, 'x'), wrongReply(1), id);
      await tick();
      assert.deepEqual(await rpc(db, lead, 'submit_task_answer', id, 'y'), wrongReply(2), id);
      await tick();
      assert.equal((await rpc(db, lead, 'submit_task_answer', id, 'richtig')).submitted, true, id);
    }
  });

  it('TST-S-029: andere Gruppe ist unabhaengig, auch nach Abschluss der ersten', async () => {
    const otherN = await otherPlayer();
    await setTask('schach', { solution: 'e4' });
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    await rpc(db, a, 'start_task', 'schach');
    await rpc(db, b, 'start_task', 'schach');
    await tick();
    for (const x of ['1', '2', '3']) await rpc(db, a, 'submit_task_answer', 'schach', x);
    assert.equal((await stateTask(a, 'schach')).submitted, true);
    const other = await stateTask(b, 'schach');
    assert.equal(other.attempts_used, 0);
    assert.equal(other.attempts_remaining, 3);
    assert.equal(other.submitted, false);
    assert.deepEqual(await rpc(db, b, 'submit_task_answer', 'schach', 'falsch'), wrongReply(1));
    assert.equal((await rpc(db, b, 'submit_task_answer', 'schach', 'e4')).correct, true);
  });

  it('TST-S-029: Spielleiter-, Phasen-, Start- und Verfuegbarkeitsfehler verbrauchen keinen Versuch', async () => {
    await setTask('schach', { solution: 'e4' });
    await solveWord(1);
    const lead = await leaderOf(1);
    const members = (await q(db, 'SELECT id FROM public.players WHERE group_id = $1', [await groupOf(1)])).map((r) => r.id);
    const other = members.find((m) => m !== lead);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'x'), { ok: false, reason: 'nicht_gestartet' });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'nix', 'x'), { ok: false, reason: 'unbekannte_aufgabe' });
    await rpc(db, lead, 'start_task', 'schach');
    assert.deepEqual(await rpc(db, other, 'submit_task_answer', 'schach', 'x'), { ok: false, reason: 'nicht_spielleiter' });
    assert.equal(await count('task_attempts'), 0);
    await admin(db, 'admin_finish');
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'x'), { ok: false, reason: 'falsche_phase' });
    assert.equal(await count('task_attempts'), 0);
    assert.equal(await count('task_answers'), 0);
  });

  it('TST-S-029: Schaetzfragen und Vornamenfrage behalten eine Abgabe, Antwort unveraendert', async () => {
    const opts = ['Anna', 'Ben', 'Cleo', 'Dora'];
    await setTask('schaetz-locker', { solution: '100' });
    await setTask('schaetz-vorname', { solution: '10', options: opts, correct: 'Anna' });
    await solveWord(1);
    const lead = await leaderOf(1);
    await rpc(db, lead, 'start_task', 'schaetz-locker');
    await rpc(db, lead, 'start_task', 'schaetz-vorname');
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-locker', '1,5'), { ok: false, reason: 'ungueltige_zahl' });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-vorname', '10', 'Emil'), { ok: false, reason: 'ungueltige_auswahl' });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-locker', '90'), { ok: true, submitted: true });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-locker', '99'), { ok: false, reason: 'bereits_abgegeben' });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-vorname', '10', 'Ben'), { ok: true, submitted: true });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schaetz-vorname', '10', 'Anna'), { ok: false, reason: 'bereits_abgegeben' });
    const task = await stateTask(lead, 'schaetz-locker');
    assert.equal(task.submitted, true);
    assert.equal(task.correct ?? null, null);
  });

  it('TST-S-029: Admin sieht je Versuch eine Zeile mit attempt_no, Antwort, Ergebnis und Dauer', async () => {
    const lead = await leaderWithTask('schach', 'e4 d5 h5');
    await tick(10000);
    await rpc(db, lead, 'submit_task_answer', 'schach', 'a1 a2 a3');
    await tick(10000);
    await rpc(db, lead, 'submit_task_answer', 'schach', 'b1 b2 b3');
    await tick(10000);
    await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5');
    const ov = await admin(db, 'admin_overview');
    const g = ov.groups.find((x) => x.details.some((d) => d.title !== 'Gruppenwort'));
    const rows = g.details.filter((d) => d.title !== 'Gruppenwort');
    assert.equal(rows.length, 3);
    assert.deepEqual(rows.map((r) => r.attempt_no), [1, 2, 3]);
    assert.deepEqual(rows.map((r) => r.answer), ['A1A2A3', 'B1B2B3', 'E4D5H5']);
    assert.deepEqual(rows.map((r) => r.correct), [false, false, true]);
    assert.deepEqual(rows.map((r) => r.duration_ms), [10000, 20000, 30000]);
    assert.ok(g.details.some((d) => d.title === 'Gruppenwort'));
  });

  it('TST-S-029: Migration uebernimmt vorhandene exakte Ergebnisse idempotent als erste Versuche, auch falsche terminal', async () => {
    const otherN = await otherPlayer();
    await setTask('schach', { solution: 'e4' });
    await setTask('sudoku', { solution: '9' });
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    const ga = await groupOf(1);
    const gb = await groupOf(otherN);
    await rpc(db, a, 'start_task', 'schach');
    await rpc(db, b, 'start_task', 'schach');
    await tick(7000);
    await rpc(db, a, 'submit_task_answer', 'schach', 'e4');
    for (const x of ['1', '2', '3']) {
      await rpc(db, b, 'submit_task_answer', 'schach', x);
      await tick();
    }
    // Altbestand: nur task_answers, keine Einzelversuche
    await q(db, 'DELETE FROM public.task_attempts');
    const before = await q(db, "SELECT to_jsonb(t) AS j FROM public.task_answers t WHERE task_id = 'schach' ORDER BY group_id");
    assert.equal(before.length, 2);
    const sql = await readFile(SCHEMA_PATH, 'utf8');
    for (let i = 0; i < 2; i++) {
      await db.exec(sql);
      const after = await q(db, "SELECT to_jsonb(t) AS j FROM public.task_answers t WHERE task_id = 'schach' ORDER BY group_id");
      assert.deepEqual(after, before, 'task_answers unveraendert');
      const att = await q(db, "SELECT group_id, attempt_no, correct FROM public.task_attempts WHERE task_id = 'schach' ORDER BY group_id");
      assert.equal(att.length, 2, `Lauf ${i + 1}: je ein erster Versuch`);
      assert.ok(att.every((r) => r.attempt_no === 1));
      assert.equal(att.find((r) => r.group_id === ga).correct, true);
      assert.equal(att.find((r) => r.group_id === gb).correct, false);
    }
    assert.equal((await stateTask(a, 'schach')).submitted, true);
    const wrong = await stateTask(b, 'schach');
    assert.equal(wrong.submitted, true, 'falsches Altergebnis bleibt abgeschlossen');
    assert.equal(wrong.correct, false);
    assert.deepEqual(await rpc(db, b, 'submit_task_answer', 'schach', 'e4'), { ok: false, reason: 'bereits_abgegeben' });
    assert.deepEqual(await rpc(db, b, 'start_task', 'schach'), { ok: false, reason: 'bereits_abgegeben' });
  });

  it('TST-S-029: task_attempts und task_answers fuer Clients gesperrt, RLS aktiv', async () => {
    const lead = await leaderWithTask('schach', 'e4');
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'x');
    for (const tb of ['task_attempts', 'task_answers']) {
      await assert.rejects(() => sqlAs(db, 'authenticated', lead, `SELECT * FROM public.${tb}`), /permission denied/i, tb);
      await assert.rejects(() => sqlAs(db, 'authenticated', lead, `INSERT INTO public.${tb} DEFAULT VALUES`), /permission denied/i, tb);
      await assert.rejects(() => sqlAs(db, 'authenticated', lead, `UPDATE public.${tb} SET task_id = 'schach'`), /permission denied/i, tb);
      await assert.rejects(() => sqlAs(db, 'authenticated', lead, `DELETE FROM public.${tb}`), /permission denied/i, tb);
      await assert.rejects(() => sqlAs(db, 'anon', null, `SELECT * FROM public.${tb}`), /permission denied/i, tb);
    }
    const rls = await q(db, "SELECT relrowsecurity FROM pg_class WHERE relname = 'task_attempts' AND relkind = 'r'");
    assert.deepEqual(rls, [{ relrowsecurity: true }]);
    await assert.rejects(() => rpcAnon(db, 'submit_task_answer', 'schach', 'x'), /permission denied/i);
    assert.equal(await count('task_attempts'), 1);
  });

  it('TST-S-029: Fremde Spieler und nicht angemeldete Nutzer erzeugen keine Versuche', async () => {
    await leaderWithTask('schach', 'e4');
    assert.equal((await rpc(db, uid(777), 'submit_task_answer', 'schach', 'x')).ok, false);
    assert.equal((await rpc(db, null, 'submit_task_answer', 'schach', 'x')).ok, false);
    assert.equal(await count('task_attempts'), 0);
  });

  it('TST-S-029: admin_reset loescht Einzelversuche und Ergebnisse, Aufgaben bleiben', async () => {
    const lead = await leaderWithTask('schach', 'e4');
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'x');
    await rpc(db, lead, 'submit_task_answer', 'schach', 'e4').catch(() => {});
    assert.ok((await count('task_attempts')) >= 1);
    assert.equal((await admin(db, 'admin_reset')).ok, true);
    assert.equal(await count('task_attempts'), 0);
    assert.equal(await count('task_answers'), 0);
    assert.equal((await q(db, "SELECT solution FROM public.tasks WHERE id = 'schach'"))[0].solution, 'e4');
    await setTask('schach', { solution: '' });
  });

  it('TST-S-029: get_state enthaelt weder Loesung noch Fehlversuchsantworten', async () => {
    const lead = await leaderWithTask('schach', 'GEHEIMLOESUNG');
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'FEHLERANTWORT');
    const json = JSON.stringify(await rpc(db, lead, 'get_state')).toUpperCase();
    assert.ok(!json.includes('GEHEIMLOESUNG'));
    assert.ok(!json.includes('FEHLERANTWORT'));
  });
});
