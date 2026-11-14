import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SCHEMA_EXISTS, SCHEMA_PATH, createDb, rpc, rpcAnon, sqlAs, admin, q, uid, resetAll, startedRound, openWithPlayers,
  setTaskPre, seedSyntheticWords, SYNTHETIC_WORDS, SCHEDULES, pointsForRank, publicIdOf, solutionOf,
} from './db-helper.js';

const skip = !SCHEMA_EXISTS && 'supabase/schema.sql fehlt';

// TST-S-034: Spielkonfiguration, Wortliste, Schwierigkeit, Punktetabellen (SWA-041..043, UNA-027)
describe('DB OFF-037..045 Konfiguration', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });
  beforeEach(async () => {
    await resetAll(db);
    await seedSyntheticWords(db);
    // Konfiguration und Aufgabenwerte bleiben ueber admin_reset hinweg erhalten: Ausgangslage hier ausdruecklich herstellen.
    await db.exec("UPDATE public.tasks SET difficulty = 'mittel'");
    await setCfg(25, 'mittel', SCHEDULES);
  });

  const setCfg = (minutes, diff, sched) => admin(db, 'admin_set_game_config', minutes, diff, JSON.stringify(sched));
  const cfg = () => rpc(db, uid(1), 'game_config');

  it('Schema enthaelt keine oeffentlichen Standardwoerter; Test-Fixture setzt synthetische Woerter danach', async () => {
    const fresh = await createDb();
    // createDb seeded bereits; das Schema selbst darf nichts mitbringen: Schema nochmals laden aendert die Fixture nicht
    await fresh.db.exec(await readFile(SCHEMA_PATH, 'utf8'));
    const w = (await q(fresh.db, 'SELECT word FROM public.words ORDER BY word')).map((r) => r.word);
    assert.deepEqual(w, [...SYNTHETIC_WORDS].sort());
    const empty = await createDbWithoutSeed();
    assert.equal((await q(empty, 'SELECT count(*)::int AS c FROM public.words'))[0].c, 0);
  });

  it('Standardwerte: 25 Minuten, mittel, drei Staffeln mit neun Werten', async () => {
    const c = await cfg();
    assert.deepEqual(c, { ok: true, game_minutes: 25, word_difficulty: 'mittel', point_schedules: SCHEDULES });
    const t = await q(db, 'SELECT DISTINCT difficulty, count(*)::int AS c FROM public.tasks GROUP BY difficulty');
    assert.deepEqual(t.map((r) => r.difficulty), ['mittel']);
    const ids = await q(db, 'SELECT count(DISTINCT public_id)::int AS c FROM public.tasks WHERE public_id IS NOT NULL');
    assert.equal(ids[0].c, (await q(db, 'SELECT count(*)::int AS c FROM public.tasks'))[0].c);
  });

  it('game_config ist fuer anon und authenticated lesbar und enthaelt keine Loesungen', async () => {
    const a = (await rpcAnon(db, 'game_config')).rows[0].r;
    assert.deepEqual(a, await cfg());
    assert.deepEqual(Object.keys(a).sort(), ['game_minutes', 'ok', 'point_schedules', 'word_difficulty']);
    assert.ok(!/solution|loesung|word"/i.test(JSON.stringify(a)));
  });

  it('admin_set_game_config speichert und game_config liefert es', async () => {
    const custom = { leicht: [3, 3, 2, 2, 1, 1, 0, 0, 0], mittel: [9, 8, 7, 6, 5, 4, 3, 2, 1], schwer: [30, 20, 15, 10, 8, 6, 4, 2, 0] };
    assert.deepEqual(await setCfg(40, 'schwer', custom), { ok: true });
    assert.deepEqual(await cfg(), { ok: true, game_minutes: 40, word_difficulty: 'schwer', point_schedules: custom });
  });

  it('admin_set_game_config: Rechte, Minuten und Schwierigkeit', async () => {
    assert.equal((await rpc(db, uid(1), 'admin_set_game_config', 'falsch', 20, 'leicht', JSON.stringify(SCHEDULES))).reason, 'nicht_berechtigt');
    for (const m of [0, -1, 35791395, null]) {
      const r = await setCfg(m, 'mittel', SCHEDULES);
      assert.equal(r.ok, false, `Minuten ${m}`);
      assert.ok(r.reason, `Grund fuer ${m}`);
    }
    await assert.rejects(() => setCfg(1.5, 'mittel', SCHEDULES), /integer/i, 'Nicht-Ganzzahl wird schon vom RPC-Cast abgelehnt');
    assert.equal((await setCfg(1, 'mittel', SCHEDULES)).ok, true);
    assert.equal((await setCfg(35791394, 'mittel', SCHEDULES)).ok, true);
    for (const d of ['sehr schwer', '', null, 'MITTEL']) assert.equal((await setCfg(20, d, SCHEDULES)).ok, false, `Schwierigkeit ${d}`);
    assert.equal((await cfg()).game_minutes, 35791394);
  });

  it('admin_set_game_config: Staffeln muessen neun ganze Zahlen 0..10000 absteigend (Gleichstand erlaubt) sein', async () => {
    const bad = [
      { ...SCHEDULES, leicht: [5, 4, 3, 2, 2, 1, 1, 1] },
      { ...SCHEDULES, leicht: [5, 4, 3, 2, 2, 1, 1, 1, 1, 1] },
      { ...SCHEDULES, mittel: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { ...SCHEDULES, mittel: [10, 8, 6, 5, 4, 3, 2, 1, -1] },
      { ...SCHEDULES, mittel: [10001, 8, 6, 5, 4, 3, 2, 1, 1] },
      { ...SCHEDULES, mittel: [10, 8, 6, 5, 4, 3, 2, 1, 0.5] },
      { ...SCHEDULES, mittel: [10, 8, 6, 5, 4, 3, 2, 1, '1x'] },
      { ...SCHEDULES, mittel: [10, 8, 6, 5, 4, 3, 2, 1, null] },
      { leicht: SCHEDULES.leicht, mittel: SCHEDULES.mittel },
      { ...SCHEDULES, extra: SCHEDULES.mittel },
    ];
    for (const s of bad) {
      const r = await setCfg(25, 'mittel', s);
      assert.equal(r.ok, false, JSON.stringify(s));
    }
    assert.equal((await rpc(db, uid(1), 'game_config')).point_schedules.mittel.join(), SCHEDULES.mittel.join());
    assert.equal((await setCfg(25, 'mittel', { leicht: Array(9).fill(0), mittel: Array(9).fill(10000), schwer: Array(9).fill(7) })).ok, true);
    await assert.rejects(() => admin(db, 'admin_set_game_config', 25, 'mittel', 'kein json'), /json/i);
  });

  it('admin_set_words: gueltige Liste ersetzt die Woerter, normalisiert A-Z', async () => {
    assert.deepEqual(await admin(db, 'admin_set_words', ['pixel', 'Zebra ', 'QUARTETTE']), { ok: true });
    const w = (await q(db, 'SELECT word FROM public.words ORDER BY word')).map((r) => r.word);
    assert.deepEqual(w, ['PIXEL', 'QUARTETTE', 'ZEBRA']);
  });

  it('admin_set_words: ungueltige Listen lassen die gespeicherten Woerter unveraendert', async () => {
    const before = (await q(db, 'SELECT word FROM public.words ORDER BY word')).map((r) => r.word);
    const bad = [[], ['ZEBRA', 'zebra'], ['ZEBRA', 'ZEBRA'], ['ZEBRA1'], ['ZEBRAKUHXX'], [''], ['  '], [null], ['OK', null]];
    for (const l of bad) {
      const r = await admin(db, 'admin_set_words', l);
      assert.equal(r.ok, false, JSON.stringify(l));
    }
    assert.equal((await rpc(db, uid(1), 'admin_set_words', 'falsch', ['ZEBRA'])).reason, 'nicht_berechtigt');
    assert.deepEqual((await q(db, 'SELECT word FROM public.words ORDER BY word')).map((r) => r.word), before);
  });

  it('admin_set_words: Wort mit neun Buchstaben ok, mit zehn nicht', async () => {
    assert.equal((await admin(db, 'admin_set_words', ['ABCDEFGHI'])).ok, true);
    assert.equal((await admin(db, 'admin_set_words', ['ABCDEFGHIJ'])).ok, false);
  });

  it('admin_set_task: neue Signatur mit difficulty, null laesst den Wert unveraendert', async () => {
    assert.equal((await admin(db, 'admin_set_task', 'schach', null, null, null, null, null, null, 'schwer')).ok, true);
    assert.equal((await q(db, "SELECT difficulty FROM public.tasks WHERE id = 'schach'"))[0].difficulty, 'schwer');
    assert.equal((await admin(db, 'admin_set_task', 'schach', 'Neu', null, null, null, null, null, null)).ok, true);
    assert.equal((await q(db, "SELECT difficulty FROM public.tasks WHERE id = 'schach'"))[0].difficulty, 'schwer');
    assert.equal((await admin(db, 'admin_set_task', 'schach', null, null, null, null, null, null, 'unmoeglich')).ok, false);
    assert.equal((await q(db, "SELECT difficulty FROM public.tasks WHERE id = 'schach'"))[0].difficulty, 'schwer');
  });

  it('admin_set_task: die alte Signatur mit genau acht Argumenten existiert nicht mehr', async () => {
    const rows = await q(db, `SELECT pronargs::int AS n FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace
      WHERE s.nspname = 'public' AND proname = 'admin_set_task'`);
    assert.deepEqual(rows.map((r) => r.n), [9]);
  });

  it('Konfiguration, Woerter, Aufgaben sind nach der Gruppenbildung gesperrt (falsche_phase)', async () => {
    await startedRound(db, 8);
    assert.equal((await setCfg(30, 'leicht', SCHEDULES)).reason, 'falsche_phase');
    assert.equal((await admin(db, 'admin_set_words', ['ZEBRA'])).reason, 'falsche_phase');
    assert.equal((await admin(db, 'admin_set_task', 'schach', 'X', null, null, null)).reason, 'falsche_phase');
    assert.equal((await admin(db, 'admin_set_group_size', 4, 6)).reason, 'falsche_phase');
    assert.equal((await cfg()).game_minutes, 25);
  });

  it('Konfiguration, Woerter, Aufgaben sind in vorbereitet und anmeldung erlaubt', async () => {
    assert.equal((await setCfg(30, 'leicht', SCHEDULES)).ok, true);
    await openWithPlayers(db, 2);
    assert.equal((await setCfg(31, 'leicht', SCHEDULES)).ok, true);
    assert.equal((await admin(db, 'admin_set_words', ['ZEBRA', 'PIXEL'])).ok, true);
    assert.equal((await admin(db, 'admin_set_task', 'schach', 'T', null, null, null)).ok, true);
  });

  it('admin_reset und erneutes Einspielen des Schemas erhalten Konfiguration, Woerter und Aufgabenaenderungen', async () => {
    const custom = { leicht: [3, 3, 2, 2, 1, 1, 0, 0, 0], mittel: [9, 8, 7, 6, 5, 4, 3, 2, 1], schwer: [30, 20, 15, 10, 8, 6, 4, 2, 0] };
    await setCfg(33, 'leicht', custom);
    await admin(db, 'admin_set_words', ['ZEBRA', 'PIXEL', 'QUADER']);
    await admin(db, 'admin_set_task', 'schach', 'Eigener Titel', 'Eigener Text', null, 'e4', null, null, 'leicht');
    await startedRound(db, 8);
    await admin(db, 'admin_reset');
    await db.exec(await readFile(SCHEMA_PATH, 'utf8'));
    assert.deepEqual(await cfg(), { ok: true, game_minutes: 33, word_difficulty: 'leicht', point_schedules: custom });
    assert.deepEqual((await q(db, 'SELECT word FROM public.words ORDER BY word')).map((r) => r.word), ['PIXEL', 'QUADER', 'ZEBRA']);
    const t = (await q(db, "SELECT title, body, solution, difficulty FROM public.tasks WHERE id = 'schach'"))[0];
    assert.deepEqual(t, { title: 'Eigener Titel', body: 'Eigener Text', solution: 'e4', difficulty: 'leicht' });
    await setTaskPre(db, 'schach', { solution: '' });
  });

  it('public_id bleibt nach Reset und Schema-Neuinstallation stabil', async () => {
    const before = await publicIdOf(db, 'schach');
    assert.match(before, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    await admin(db, 'admin_reset');
    await db.exec(await readFile(SCHEMA_PATH, 'utf8'));
    assert.equal(await publicIdOf(db, 'schach'), before);
  });

  it('points_for_rank liest die DB-Konfiguration je Schwierigkeit', async () => {
    const pfr = async (rank, d) => (await q(db, d === undefined ? 'SELECT public.points_for_rank($1::int) AS p' : 'SELECT public.points_for_rank($1::int, $2::text) AS p', d === undefined ? [rank] : [rank, d]))[0].p;
    for (const d of ['leicht', 'mittel', 'schwer']) {
      for (let r = 1; r <= 12; r++) assert.equal(await pfr(r, d), pointsForRank(r, d), `${d} ${r}`);
    }
    assert.equal(await pfr(1), 10);
    const custom = { ...SCHEDULES, mittel: [50, 40, 30, 20, 10, 9, 8, 7, 6] };
    await setCfg(25, 'mittel', custom);
    assert.equal(await pfr(1), 50);
    assert.equal(await pfr(9), 6);
    assert.equal(await pfr(30), 6);
  });

  it('points_for_rank: ungueltiger Rang oder ungueltige Schwierigkeit wirft statt Ersatzwert', async () => {
    for (const [r, d] of [[0, 'mittel'], [-3, 'mittel'], [1, 'extrem'], [null, 'mittel']]) {
      await assert.rejects(() => q(db, 'SELECT public.points_for_rank($1::int, $2::text)', [r, d]), `${r}/${d}`);
    }
    await q(db, "UPDATE public.round SET point_schedules = '{\"mittel\":[1,2]}'::jsonb");
    await assert.rejects(() => q(db, 'SELECT public.points_for_rank(1)'));
  });

  it('Spielende vergibt Punkte nach der konfigurierten Staffel der Aufgabe/des Wortes', async () => {
    await setCfg(25, 'schwer', SCHEDULES);
    await startedRound(db, 8);
    const first = (await q(db, 'SELECT id FROM public.players ORDER BY id LIMIT 1'))[0].id;
    const r = await rpc(db, first, 'submit_answer', await solutionOf(db, first));
    assert.equal(r.correct, true);
    await admin(db, 'admin_finish');
    const s = await rpc(db, first, 'get_state');
    assert.equal(s.solved.points, SCHEDULES.schwer[0]);
  });

  it('Konfigurationstabellen und Funktionen sind fuer anon/authenticated gesperrt, auch bei Default-Privilegien', async () => {
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'SELECT game_minutes FROM public.round'), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'SELECT point_schedules FROM public.round'), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'SELECT game_deadline FROM public.round'), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'UPDATE public.round SET game_minutes = 1'), /permission denied/i);
    for (const t of ['tasks', 'display_tokens', 'words']) {
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `SELECT * FROM public.${t}`), /permission denied/i, t);
      await assert.rejects(() => sqlAs(db, 'anon', null, `SELECT * FROM public.${t}`), /permission denied/i, t);
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `DELETE FROM public.${t}`), /permission denied/i, t);
    }
    const ex = await q(db, `SELECT has_function_privilege('anon', 'public.expire_game()', 'EXECUTE') AS a,
      has_function_privilege('authenticated', 'public.expire_game()', 'EXECUTE') AS u`);
    assert.deepEqual(ex[0], { a: false, u: false });
    for (const fn of ['admin_set_game_config', 'admin_set_words', 'admin_open_beamer', 'admin_export', 'admin_set_task']) {
      const r = await q(db, `SELECT bool_or(has_function_privilege('anon', p.oid, 'EXECUTE')) AS a FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = $1`, [fn]);
      assert.equal(r[0].a, false, fn);
    }
    const open = await q(db, `SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND has_function_privilege('anon', p.oid, 'EXECUTE')
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e') ORDER BY 1`);
    assert.deepEqual(open.map((r) => r.proname).filter((n) => !['game_config', 'beamer_state'].includes(n)), []);
  });
});

async function createDbWithoutSeed() {
  const { PGlite } = await import('@electric-sql/pglite');
  const mod = await import('@electric-sql/pglite/contrib/pgcrypto');
  const db = new PGlite({ extensions: { pgcrypto: mod.pgcrypto } });
  await db.waitReady;
  await db.exec('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await db.exec(`DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  END $$; CREATE SCHEMA IF NOT EXISTS auth;
  CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT null::uuid $$;`);
  const sql = await readFile(SCHEMA_PATH, 'utf8');
  await db.exec(sql);
  await db.exec(sql);
  return db;
}
