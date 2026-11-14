import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_EXISTS, createDb, rpc, admin, q, uid, startedRound, solutionOf, setNow, T0_MS, isoAt, taskIn, setTaskPre } from './db-helper.js';

describe('DB Spielleiter und Aufgaben (OFF-002 bis OFF-011)', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
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

  const groupOf = async (n) => (await q(db, 'SELECT group_id FROM public.players WHERE id = $1', [uid(n)]))[0].group_id;
  const solveWord = async (n) => rpc(db, uid(n), 'submit_answer', await solutionOf(db, uid(n)));
  const setTask = (id, patch) => setTaskPre(db, id, patch);
  const leaderOf = async (n) => (await q(db, 'SELECT player_id FROM public.results WHERE group_id = $1', [await groupOf(n)]))[0].player_id;
  const otherPlayer = async () =>
    Number((await q(db, 'SELECT id FROM public.players WHERE group_id <> $1 ORDER BY id LIMIT 1', [await groupOf(1)]))[0].id.slice(-6));
  const placement = async (p, task) => (await taskIn(db, await rpc(db, p, 'get_state'), task)).placement;

  it('TST-S-021: ohne Wortlösung keine Aufgaben und kein Spielleiter in get_state', async () => {
    const s = await rpc(db, uid(1), 'get_state');
    assert.equal(s.leader, false);
    assert.ok(!s.tasks || s.tasks.length === 0);
    assert.deepEqual(await rpc(db, uid(1), 'submit_task_answer', 'schach', 'x'), { ok: false, reason: 'wort_nicht_geloest' });
    assert.deepEqual(await rpc(db, uid(1), 'start_task', 'schach'), { ok: false, reason: 'wort_nicht_geloest' });
  });

  it('TST-S-021: Spielleiter ist wer das Wort zuerst löst; andere Mitglieder dürfen nicht antworten', async () => {
    await setTask('schach', { solution: 'E4 D5 H5' });
    const members = (await q(db, 'SELECT id FROM public.players WHERE group_id = $1 ORDER BY joined_at, id', [await groupOf(1)])).map((r) => r.id);
    const leaderId = members[1];
    const word = await q(db, 'SELECT solution FROM public.group_tasks WHERE group_id = $1', [await groupOf(1)]);
    assert.equal((await rpc(db, leaderId, 'submit_answer', word[0].solution)).correct, true);
    assert.equal((await rpc(db, leaderId, 'get_state')).leader, true);
    const other = members.find((m) => m !== leaderId);
    const sOther = await rpc(db, other, 'get_state');
    assert.equal(sOther.leader, false);
    assert.ok(sOther.tasks.length > 0, 'Übersicht lesbar');
    assert.deepEqual(await rpc(db, other, 'start_task', 'schach'), { ok: false, reason: 'nicht_spielleiter' });
    assert.deepEqual(await rpc(db, other, 'submit_task_answer', 'schach', 'e4 d5 h5'), { ok: false, reason: 'nicht_spielleiter' });
    assert.equal((await rpc(db, leaderId, 'start_task', 'schach')).ok, true);
    await tick();
    assert.equal((await rpc(db, leaderId, 'submit_task_answer', 'schach', 'e4-d5-h5')).correct, true);
  });

  it('TST-S-021: get_state verrät keine Lösung und zeigt Text/Bild erst nach dem Öffnen', async () => {
    await setTask('schach', { solution: 'GEHEIM42', body: 'Textinhalt', image: 'bilder/s.jpg' });
    await solveWord(1);
    const lead = await leaderOf(1);
    let s = await rpc(db, lead, 'get_state');
    assert.ok(!JSON.stringify(s).includes('GEHEIM42'));
    let task = await taskIn(db, s, 'schach');
    assert.equal(task.available, true);
    assert.equal(task.started, false);
    assert.ok(!task.body && !task.image_url);
    await rpc(db, lead, 'start_task', 'schach');
    s = await rpc(db, lead, 'get_state');
    task = await taskIn(db, s, 'schach');
    assert.equal(task.started, true);
    assert.equal(task.body, 'Textinhalt');
    assert.ok(!JSON.stringify(s).includes('GEHEIM42'));
  });

  it('TST-S-021: nicht verfügbar, unbekannt, nicht gestartet, genau ein Versuch', async () => {
    await solveWord(1);
    const lead = await leaderOf(1);
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: false, reason: 'nicht_verfuegbar' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'nix'), { ok: false, reason: 'unbekannte_aufgabe' });
    await setTask('schach', { solution: 'e4 d5 h5' });
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5'), { ok: false, reason: 'nicht_gestartet' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: true });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: true });
    await tick();
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h6'),
      { ok: true, submitted: false, correct: false, attempts_used: 1, attempts_remaining: 2, max_attempts: 3 });
    let task = await taskIn(db, await rpc(db, lead, 'get_state'), 'schach');
    assert.equal(task.submitted, false, 'erster Fehlversuch schliesst nicht ab');
    assert.ok(!task.placement, 'Fehlversuch wird nicht platziert');
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: true });
    await tick();
    const second = await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5');
    assert.equal(second.ok, true);
    assert.equal(second.submitted, true);
    assert.equal(second.correct, true);
    assert.equal(second.attempts_used, 2);
    assert.equal(second.max_attempts, 3);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5'), { ok: false, reason: 'bereits_abgegeben' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: false, reason: 'bereits_abgegeben' });
    task = await taskIn(db, await rpc(db, lead, 'get_state'), 'schach');
    assert.equal(task.submitted, true);
    assert.equal(task.correct, true);
    assert.ok(task.placement, 'richtige Abgabe wird platziert');
  });

  it('TST-S-021: Zeit vom Öffnen bis zur Abgabe entscheidet bei Gleichstand', async () => {
    const otherN = await otherPlayer();
    await setTask('schach', { solution: 'e4' });
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    await rpc(db, a, 'start_task', 'schach');
    await tick(1000);
    await rpc(db, b, 'start_task', 'schach');
    await tick(20000);
    await rpc(db, b, 'submit_task_answer', 'schach', 'e4');
    await tick(20000);
    await rpc(db, a, 'submit_task_answer', 'schach', 'e4');
    const rows = await q(db, 'SELECT group_id, duration_ms FROM public.task_answers WHERE task_id = $1 ORDER BY duration_ms', ['schach']);
    assert.deepEqual(rows.map((r) => Number(r.duration_ms)), [20000, 41000]);
    assert.equal(rows[0].group_id, await groupOf(otherN));
    assert.equal((await placement(b, 'schach')).rank, 1);
    assert.equal((await placement(a, 'schach')).rank, 2);
  });

  it('TST-S-021: Schätzfrage – eine Abgabe, Zahl, Wertung nach Nähe, keine Rückmeldung zur Richtigkeit', async () => {
    const otherN = await otherPlayer();
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    assert.deepEqual(await setTask('schaetz-locker', { solution: 'abc' }), { ok: false, reason: 'ungueltige_loesung' });
    assert.equal((await setTask('schaetz-locker', { solution: '100' })).ok, true);
    await rpc(db, a, 'start_task', 'schaetz-locker');
    await rpc(db, b, 'start_task', 'schaetz-locker');
    assert.deepEqual(await rpc(db, a, 'submit_task_answer', 'schaetz-locker', '1,5'), { ok: false, reason: 'ungueltige_zahl' });
    assert.deepEqual(await rpc(db, a, 'submit_task_answer', 'schaetz-locker', '90'), { ok: true, submitted: true });
    assert.deepEqual(await rpc(db, a, 'submit_task_answer', 'schaetz-locker', '99'), { ok: false, reason: 'bereits_abgegeben' });
    await tick();
    assert.equal((await rpc(db, b, 'submit_task_answer', 'schaetz-locker', '101')).submitted, true);
    assert.deepEqual(await placement(b, 'schaetz-locker'), { rank: 1 });
    assert.deepEqual(await placement(a, 'schaetz-locker'), { rank: 2 });
    const o = await admin(db, 'admin_overview');
    assert.equal(o.finished, false);
    assert.equal(o.totals.reduce((s, x) => s + x.points, 0) > 0, true);
  });

  it('TST-S-021: Plätze sind vorläufig – bei gleicher Nähe zählt die kürzere Zeit', async () => {
    const otherN = await otherPlayer();
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    await setTask('schaetz-locker', { solution: '100' });
    await rpc(db, a, 'start_task', 'schaetz-locker');
    await rpc(db, b, 'start_task', 'schaetz-locker');
    await tick(10000);
    await rpc(db, a, 'submit_task_answer', 'schaetz-locker', '90');
    assert.equal((await placement(a, 'schaetz-locker')).rank, 1);
    await tick(10000);
    await rpc(db, b, 'submit_task_answer', 'schaetz-locker', '100');
    assert.equal((await placement(a, 'schaetz-locker')).rank, 2, 'A wurde verdrängt');
    assert.equal((await placement(b, 'schaetz-locker')).rank, 1);
  });

  it('TST-S-021: Punkte erst nach „Spiele beenden“ sichtbar; danach keine Abgaben mehr', async () => {
    await setTask('schach', { solution: 'e4' });
    await solveWord(1);
    const lead = await leaderOf(1);
    await rpc(db, lead, 'start_task', 'schach');
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'e4');
    let s = await rpc(db, lead, 'get_state');
    assert.equal(s.solved.points, undefined);
    assert.equal((await taskIn(db, s, 'schach')).placement.points, undefined);
    assert.ok(!s.final);
    assert.equal((await admin(db, 'admin_finish')).ok, true);
    s = await rpc(db, lead, 'get_state');
    assert.equal(s.solved.points > 0, true);
    assert.equal((await taskIn(db, s, 'schach')).placement.points > 0, true);
    assert.equal(s.final.points > 0, true);
    assert.equal((await admin(db, 'admin_overview')).finished, true);
    assert.deepEqual(await rpc(db, lead, 'submit_task_answer', 'schach', 'e4'), { ok: false, reason: 'falsche_phase' });
    assert.deepEqual(await rpc(db, lead, 'start_task', 'schach'), { ok: false, reason: 'falsche_phase' });
  });

  it('TST-S-021: Auswahlfrage – Name wählen, Anzahl eingeben, falscher Name = 0 Punkte', async () => {
    const otherN = await otherPlayer();
    await solveWord(1);
    await solveWord(otherN);
    const a = await leaderOf(1);
    const b = await leaderOf(otherN);
    const opts = ['Anna', 'Ben', 'Cleo', 'Dora'];
    assert.deepEqual(await setTask('schaetz-vorname', { solution: '10', options: ['Anna', 'Ben', 'Cleo'], correct: 'Anna' }),
      { ok: false, reason: 'ungueltige_optionen' });
    assert.deepEqual(await setTask('schaetz-vorname', { solution: '10', options: opts, correct: 'Emil' }), { ok: false, reason: 'ungueltige_optionen' });
    assert.equal((await setTask('schaetz-vorname', { solution: '10', options: opts, correct: 'anna' })).ok, true);
    await rpc(db, a, 'start_task', 'schaetz-vorname');
    await rpc(db, b, 'start_task', 'schaetz-vorname');
    const state = await rpc(db, a, 'get_state');
    assert.deepEqual((await taskIn(db, state, 'schaetz-vorname')).options, opts);
    assert.deepEqual(await rpc(db, a, 'submit_task_answer', 'schaetz-vorname', '10', 'Emil'), { ok: false, reason: 'ungueltige_auswahl' });
    assert.deepEqual(await rpc(db, a, 'submit_task_answer', 'schaetz-vorname', '10', 'Ben'), { ok: true, submitted: true });
    assert.deepEqual(await rpc(db, b, 'submit_task_answer', 'schaetz-vorname', '50', 'Anna'), { ok: true, submitted: true });
    assert.ok(!(await placement(a, 'schaetz-vorname')), 'falscher Name wird nicht platziert');
    assert.deepEqual(await placement(b, 'schaetz-vorname'), { rank: 1 });
  });

  it('TST-S-021: admin_set_task prüft Rechte und Bildlink', async () => {
    assert.deepEqual(await rpc(db, uid(1), 'admin_set_task', 'falsch', 'schach', null, null, null, null), { ok: false, reason: 'nicht_berechtigt' });
    assert.deepEqual(await setTask('schach', { image: 'javascript:alert(1)' }), { ok: false, reason: 'ungueltiges_bild' });
    assert.equal((await setTask('geo-saeule', { image: 'bilder/saeule.jpg' })).ok, true);
    assert.equal((await setTask('geo-baum', { image: 'https://example.org/b.jpg' })).ok, true);
    assert.deepEqual(await setTask('nix', {}), { ok: false, reason: 'unbekannte_aufgabe' });
  });

  it('TST-S-021: Aufgaben und Größe überleben admin_reset, Ergebnisse und Starts nicht', async () => {
    await setTask('schach', { solution: 'e4' });
    await solveWord(1);
    const lead = await leaderOf(1);
    await rpc(db, lead, 'start_task', 'schach');
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'e4');
    for (const tb of ['task_answers', 'task_attempts']) {
      assert.ok((await q(db, `SELECT count(*)::int AS c FROM public.${tb}`))[0].c > 0, `${tb} vor Reset gefuellt`);
    }
    await admin(db, 'admin_reset');
    for (const tb of ['task_answers', 'task_attempts', 'task_starts', 'results']) {
      assert.equal((await q(db, `SELECT count(*)::int AS c FROM public.${tb}`))[0].c, 0, tb);
    }
    assert.equal((await q(db, "SELECT solution FROM public.tasks WHERE id = 'schach'"))[0].solution, 'e4');
    await setTask('schach', { solution: '' });
  });
});
