import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { SCHEMA_EXISTS, SCHEMA_PATH, createDb, rpc, admin, q, uid, startedRound, solutionOf, setNow, T0_MS, isoAt, taskIn, setTaskPre } from './db-helper.js';

describe('DB OFF-016, OFF-018, OFF-019, OFF-020', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
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
    await q(db, 'UPDATE public.tasks SET solution = NULL, options = NULL, correct_option = NULL');
    await startedRound(db, 8);
    await tick();
  });

  const setTask = (id, patch) => setTaskPre(db, id, patch);
  const leaderOf = async () => (await q(db, 'SELECT player_id FROM public.results LIMIT 1'))[0]?.player_id;

  it('OFF-064: Wortliste mit langen Wörtern bleibt nach Schema-Update erhalten', async () => {
    await q(db, "INSERT INTO public.words (word) VALUES ('ELEKTROTECHNIK')");
    const sql = await readFile(SCHEMA_PATH, 'utf8');
    await db.exec(sql);
    const w = await q(db, 'SELECT count(*)::int AS c, max(char_length(word))::int AS m FROM public.words');
    assert.deepEqual(w[0], { c: 17, m: 14 });
  });

  it('OFF-064: eingeteilte Gruppen erhalten das vollständige konfigurierte Wort', async () => {
    const rows = await q(db, 'SELECT char_length(solution)::int AS n FROM public.group_tasks');
    assert.ok(rows.length > 0);
    for (const r of rows) assert.ok(r.n >= 1);
  });

  it('TST-S-024: Bildadressen von Schach und Sudoku vorausgefüllt, gespeicherte Adresse bleibt', async () => {
    await q(db, "UPDATE public.tasks SET image_url = NULL WHERE id IN ('schach', 'sudoku')");
    await q(db, "UPDATE public.tasks SET image_url = 'eigenes/bild.png' WHERE id = 'sudoku'");
    await db.exec(await readFile(SCHEMA_PATH, 'utf8'));
    const rows = await q(db, "SELECT id, image_url FROM public.tasks WHERE id IN ('schach', 'sudoku') ORDER BY id");
    assert.deepEqual(rows, [
      { id: 'schach', image_url: 'aufgaben/schach.svg' },
      { id: 'sudoku', image_url: 'eigenes/bild.png' },
    ]);
  });

  it('TST-S-025: get_state liefert correct für exakte Aufgaben, bei Schätzung null', async () => {
    await setTask('schach', { solution: 'E4 D5 H5' });
    await setTask('schaetz-locker', { solution: '100' });
    await rpc(db, uid(1), 'submit_answer', await solutionOf(db, uid(1)));
    const lead = await leaderOf();
    await rpc(db, lead, 'start_task', 'schach');
    await rpc(db, lead, 'start_task', 'schaetz-locker');
    let s = await rpc(db, lead, 'get_state');
    assert.equal((await taskIn(db, s, 'schach')).correct ?? null, null);
    await tick();
    await rpc(db, lead, 'submit_task_answer', 'schach', 'a1 a2 a3');
    await rpc(db, lead, 'submit_task_answer', 'schaetz-locker', '90');
    s = await rpc(db, lead, 'get_state');
    const sch = await taskIn(db, s, 'schach');
    const loc = await taskIn(db, s, 'schaetz-locker');
    assert.equal(sch.correct, false, 'correct = letzter Versuch');
    assert.equal(sch.submitted, false, 'submitted nur bei Abschluss');
    assert.equal(sch.attempts_used, 1);
    assert.equal(loc.correct ?? null, null);
    assert.equal(loc.submitted, true);
  });

  it('TST-S-025: admin_overview liefert je Gruppe Zeilen mit Titel, Antwort und Dauer', async () => {
    await setTask('schach', { solution: 'E4 D5 H5' });
    await rpc(db, uid(1), 'submit_answer', await solutionOf(db, uid(1)));
    const lead = await leaderOf();
    await rpc(db, lead, 'start_task', 'schach');
    await tick(7000);
    await rpc(db, lead, 'submit_task_answer', 'schach', 'e4 d5 h5');
    const ov = await admin(db, 'admin_overview');
    const g = ov.groups.find((x) => x.details.length > 0);
    assert.ok(g);
    assert.equal(g.details[0].title, 'Gruppenwort');
    assert.equal(g.details[0].correct, true);
    const row = g.details.find((x) => x.title !== 'Gruppenwort');
    assert.equal(row.answer, 'E4D5H5');
    assert.equal(row.correct, true);
    assert.equal(row.duration_ms, 7000);
    assert.equal(row.attempt_no, 1);
    const leer = ov.groups.find((x) => x.details.length === 0);
    assert.ok(leer);
  });
});
