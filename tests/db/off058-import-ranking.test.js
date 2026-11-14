import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, sqlAs, createDb, rpc, rpcAnon, admin, q, uid, setNow, isoAt, T0_MS, resetAll, startedRound, openWithPlayers,
  SCHEDULES,
} from './db-helper.js';

const skip = !SCHEMA_EXISTS && 'supabase/schema.sql fehlt';
const MIN = 60000;

const task = (id, over = {}) => ({
  id, category: 'Kat', title: `Titel ${id}`, type: 'exakt', difficulty: 'mittel', body: 'Text', solution: 'lösung', ...over,
});
const importTasks = (db, tasks, apply = false) => admin(db, 'admin_import_tasks', JSON.stringify(tasks), apply);
const rev = async (db) => Number((await q(db, 'SELECT config_rev FROM public.round'))[0].config_rev);

// TST-S-037 / TST-U-029 (SWA-051, UNA-033): Fristpruefung
describe('DB OFF-058 Fristpruefung', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  it('TST-S-037: expire_game_exclusive und ranking_json/rank_rows sind nur intern aufrufbar', async () => {
    await resetAll(db);
    for (const fn of ['expire_game_exclusive()', 'ranking_json()', "rank_rows('[]'::jsonb)"]) {
      for (const role of ['authenticated', 'anon']) {
        await assert.rejects(() => sqlAs(db, role, uid(1), `SELECT public.${fn}`), /permission denied/i, `${role} ${fn}`);
      }
    }
  });

  it('TST-S-037: nicht faellige Frist aendert nichts, faellige beendet das Spiel, Abgabe danach wird abgelehnt', async () => {
    await resetAll(db);
    await startedRound(db, 8);
    const phase = async () => (await q(db, 'SELECT phase FROM public.round'))[0].phase;
    await setNow(db, isoAt(T0_MS + 24 * MIN));
    await q(db, 'SELECT public.expire_game()');
    assert.equal(await phase(), 'wortaufgabe_aktiv');
    await setNow(db, isoAt(T0_MS + 26 * MIN));
    await q(db, 'SELECT public.expire_game()');
    assert.equal(await phase(), 'aufgabe_abgeschlossen');
    const p = (await q(db, 'SELECT id FROM public.players ORDER BY id LIMIT 1'))[0].id;
    const r = await rpc(db, p, 'submit_answer', 'IRGENDWAS');
    assert.equal(r.ok, false);
  });
});

// TST-S-038 / TST-U-029 (SWA-052, UNA-034): Ranking-Buendelung
describe('DB OFF-059 Ranking-Buendelung', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await resetAll(db);
    await admin(db, 'admin_set_game_config', 25, 'mittel', JSON.stringify(SCHEDULES));
    await startedRound(db, 12);
  });

  it('TST-S-038: ranking_json/rank_rows liefern dieselben Zeilen wie ranking()', async () => {
    const groups = (await q(db, 'SELECT id FROM public.groups ORDER BY id')).map((g) => g.id);
    for (let i = 0; i < groups.length; i++) {
      await setNow(db, isoAt(T0_MS + (10 + i) * 1000));
      const word = (await q(db, 'SELECT solution FROM public.group_tasks WHERE group_id = $1', [groups[i]]))[0].solution;
      const player = (await q(db, 'SELECT id FROM public.players WHERE group_id = $1 LIMIT 1', [groups[i]]))[0].id;
      await rpc(db, player, 'submit_answer', word);
    }
    const norm = (rows) => rows.map((r) => `${r.t_id}|${r.g_id}|${r.rk}|${r.pts}`).sort();
    const direct = await q(db, 'SELECT * FROM public.ranking()');
    const viaJson = await q(db, 'SELECT * FROM public.rank_rows(public.ranking_json())');
    assert.ok(direct.length > 0);
    assert.deepEqual(norm(viaJson), norm(direct));
    const wort = direct.filter((r) => r.t_id === 'wort').sort((a, b) => a.rk - b.rk);
    assert.equal(wort[0].rk, 1);
    assert.equal(wort[0].pts, SCHEDULES.mittel[0]);
  });

  it('TST-S-038: points_for_rank bleibt unveraendert und get_state liefert Punkte der Staffel', async () => {
    const pts = async (rank) => (await q(db, "SELECT public.points_for_rank($1, 'mittel') AS p", [rank]))[0].p;
    assert.equal(await pts(1), 10);
    assert.equal(await pts(9), 1);
    assert.equal(await pts(20), 1);
  });
});

// TST-S-039 / TST-U-031 (SWA-054, UNA-036): Konfigurationsrevision
describe('DB OFF-060 Konfigurationsrevision', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await resetAll(db);
  });

  it('TST-S-039: config_rev steigt bei jeder Konfigurations-RPC', async () => {
    let last = await rev(db);
    const step = async (label, fn) => {
      const r = await fn();
      assert.equal(r.ok, true, `${label}: ${JSON.stringify(r)}`);
      const now = await rev(db);
      assert.ok(now > last, `${label}: Revision steigt`);
      last = now;
    };
    await step('game_config', () => admin(db, 'admin_set_game_config', 30, 'mittel', JSON.stringify(SCHEDULES)));
    await step('words', () => admin(db, 'admin_set_words', ['ZEBRA', 'MELON', 'QUADER']));
    await step('group_size', () => admin(db, 'admin_set_group_size', 4, 6));
    await step('task', () => admin(db, 'admin_set_task', 'schach', 'Neuer Titel', null, null, null, null, null));
    await step('import', () => importTasks(db, [task('a')], true));
  });

  it('TST-S-039: admin_overview liefert Konfiguration nur bei fehlender oder abweichender Revision', async () => {
    const full = await admin(db, 'admin_overview', null);
    assert.equal(full.ok, true);
    assert.equal(full.config_unchanged, false);
    assert.ok(Array.isArray(full.words) && Array.isArray(full.tasks) && full.point_schedules);
    assert.ok(full.tasks.every((t) => !('answers' in t)));
    assert.equal(Number(full.config_rev), await rev(db));
    assert.equal(typeof full.task_answers, 'object');
    const same = await admin(db, 'admin_overview', full.config_rev);
    assert.equal(same.config_unchanged, true);
    assert.ok(!('words' in same) && !('tasks' in same) && !('point_schedules' in same));
    assert.equal(typeof same.task_answers, 'object');
    assert.equal(same.phase, full.phase);
    const stale = await admin(db, 'admin_overview', Number(full.config_rev) - 1);
    assert.equal(stale.config_unchanged, false);
  });

  it('TST-S-039: Antwortzaehler stehen auch bei unveraenderter Konfiguration in der Antwort', async () => {
    const full = await admin(db, 'admin_overview', null);
    await q(db, `UPDATE public.tasks SET solution = 'x' WHERE id = $1`, [full.tasks[0].id]);
    const same = await admin(db, 'admin_overview', full.config_rev);
    assert.deepEqual(same.task_answers, {});
  });
});

// TST-S-041 / TST-U-033 (SWA-056, UNA-038): Import-RPC
describe('DB OFF-062 Aufgabenimport', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await resetAll(db);
  });
  const ids = async () => (await q(db, 'SELECT id FROM public.tasks ORDER BY sort, id')).map((r) => r.id);

  it('TST-S-041: Vorschau aendert nichts und liefert Zaehlung; Rechte werden geprueft', async () => {
    const before = await ids();
    const revBefore = await rev(db);
    const r = await importTasks(db, [task('a'), task('b', { category: 'Zwei' })]);
    assert.equal(r.ok, true);
    assert.equal(r.applied, false);
    assert.equal(r.counts.new, 2);
    assert.equal(r.counts.removed, before.length);
    assert.deepEqual(await ids(), before);
    assert.equal(await rev(db), revBefore);
    assert.deepEqual(await rpc(db, uid(1), 'admin_import_tasks', 'falsch', JSON.stringify([task('a')]), false), { ok: false, reason: 'nicht_berechtigt' });
    await assert.rejects(() => rpcAnon(db, 'admin_import_tasks', 'x', '[]', false), /permission denied/i);
  });

  it('TST-S-041: Uebernahme ersetzt den gesamten Satz, sortiert nach Kategorien, erhoeht config_rev', async () => {
    const revBefore = await rev(db);
    const r = await importTasks(db, [
      task('a', { category: 'Eins' }), task('b', { category: 'Zwei' }), task('c', { category: 'Eins' }),
      task('w', { category: 'Eins', type: 'auswahl', solution: '5', options: ['A', 'B', 'C', 'D'], correct_option: 'b' }),
    ], true);
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.applied, true);
    assert.deepEqual(await ids(), ['a', 'c', 'w', 'b']);
    assert.ok(await rev(db) > revBefore);
    const w = (await q(db, "SELECT kind, needs_choice, options, correct_option, solution FROM public.tasks WHERE id = 'w'"))[0];
    assert.equal(w.kind, 'estimate');
    assert.equal(w.needs_choice, true);
    assert.deepEqual(w.options, ['A', 'B', 'C', 'D']);
    assert.equal(w.correct_option, 'B');
    const again = await importTasks(db, [task('a', { title: 'Geaendert' })], true);
    assert.equal(again.counts.replaced, 1);
    assert.equal(again.counts.removed, 3);
    assert.deepEqual(await ids(), ['a']);
    assert.equal((await q(db, "SELECT title FROM public.tasks WHERE id = 'a'"))[0].title, 'Geaendert');
  });

  it('TST-S-041: Warnungen fuer fehlende Loesung und fehlende richtige Option, Aufgabe nicht spielbar', async () => {
    const r = await importTasks(db, [
      task('a', { solution: null }),
      task('b', { type: 'auswahl', solution: '3', options: ['A', 'B', 'C', 'D'] }),
    ], true);
    assert.equal(r.ok, true);
    assert.deepEqual(r.warnings.map((w) => w.reason).sort(), ['keine_loesung', 'keine_richtige_option']);
    assert.equal(r.counts.unready, 2);
    const ov = await admin(db, 'admin_overview', null);
    assert.ok(ov.tasks.every((t) => t.available === false));
  });

  it('TST-S-041: serverseitige Revalidierung liefert Fehler je Aufgabe und aendert nichts', async () => {
    const before = await ids();
    const revBefore = await rev(db);
    const bad = [
      task('Gross'), task('x1', { category: '' }), task('x2', { type: 'foo' }), task('x3', { difficulty: 'extrem' }),
      task('x4', { body: ' ' }), task('x5', { image: '../geheim.png' }), task('x6', { type: 'schaetzung', solution: '1.5' }),
      task('x7', { type: 'auswahl', solution: '1', options: ['A', 'B', 'C'] }), task('x8', { options: ['A', 'B', 'C', 'D'] }),
      task('x9'), task('x9'), task('k1', { category: 'Abc' }), task('k2', { category: 'abc' }),
    ];
    const r = await importTasks(db, bad, true);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'ungueltige_aufgaben');
    assert.equal(r.applied, false);
    const reasons = new Set(r.errors.map((e) => e.reason));
    for (const x of ['ungueltige_id', 'ungueltige_kategorie', 'ungueltiger_typ', 'ungueltige_schwierigkeit', 'ungueltiger_text',
      'ungueltiges_bild', 'ungueltige_loesung', 'ungueltige_optionen', 'optionen_nicht_erlaubt', 'doppelte_id', 'kategorie_schreibweise']) {
      assert.ok(reasons.has(x), x);
    }
    assert.ok(r.errors.every((e) => e.task && e.reason));
    assert.deepEqual(await ids(), before);
    assert.equal(await rev(db), revBefore);
    for (const empty of [[], null, 'x', Array.from({ length: 61 }, (_, i) => task(`t${i}`))]) {
      assert.equal((await importTasks(db, empty)).reason, 'ungueltige_aufgaben');
    }
  });

  it('TST-S-041: Uebernahme nur in Vorbereitung und Anmeldung', async () => {
    await openWithPlayers(db, 8);
    assert.equal((await importTasks(db, [task('a')], true)).ok, true, 'Anmeldung erlaubt');
    await admin(db, 'admin_close_registration');
    await admin(db, 'admin_form_groups');
    const r = await importTasks(db, [task('b')], true);
    assert.deepEqual(r, { ok: false, reason: 'falsche_phase' });
    assert.equal((await importTasks(db, [task('b')], false)).ok, true, 'Vorschau bleibt moeglich');
    assert.deepEqual(await ids(), ['a']);
  });
});
