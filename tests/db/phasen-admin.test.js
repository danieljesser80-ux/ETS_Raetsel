import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, createDb, rpc, rpcAnon, admin, q, uid, setNow, isoAt, T0_MS, openWithPlayers, resetAll,
  startedRound, expectedSizes, ADMIN_CODE,
} from './db-helper.js';

const phase = async (db) => (await q(db, 'SELECT phase FROM public.round'))[0].phase;
const snapshot = async (db) => JSON.stringify({
  round: await q(db, 'SELECT phase, registration_deadline, closed_early FROM public.round'),
  players: await q(db, 'SELECT id, name, group_id FROM public.players ORDER BY id'),
  groups: await q(db, 'SELECT count(*)::int AS c FROM public.groups'),
  letters: await q(db, 'SELECT count(*)::int AS c FROM public.letters'),
});

describe('DB Phasen und Admin', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  it('TST-S-007: falscher oder fehlender Admincode -> nicht_berechtigt, nichts aendert sich', async () => {
    await openWithPlayers(db, 5);
    const before = await snapshot(db);
    const calls = [
      ['admin_start_registration', 60],
      ['admin_close_registration'],
      ['admin_form_groups'],
      ['admin_overview'],
      ['admin_finish'],
      ['admin_reset'],
    ];
    for (const bad of ['falsch', '', null]) {
      for (const [fn, ...rest] of calls) {
        const r = await rpc(db, uid(1), fn, bad, ...rest);
        assert.deepEqual(r, { ok: false, reason: 'nicht_berechtigt' }, `${fn} mit ${bad}`);
      }
    }
    assert.equal(await snapshot(db), before);
  });

  it('TST-A-003: Admin-RPCs mit richtigem Code funktionieren auch fuer beliebige authenticated-Identitaet', async () => {
    await resetAll(db);
    assert.equal((await admin(db, 'admin_overview')).ok, true);
  });

  it('TST-S-003: vorbereitet -> anmeldung (admin_start_registration), Frist = jetzt + 300 s', async () => {
    await resetAll(db);
    assert.equal(await phase(db), 'vorbereitet');
    assert.equal((await admin(db, 'admin_start_registration')).ok, true);
    assert.equal(await phase(db), 'anmeldung');
    const r = await q(db, 'SELECT (extract(epoch from registration_deadline) * 1000)::bigint AS ms, closed_early FROM public.round');
    assert.equal(Number(r[0].ms), T0_MS + 300000);
    assert.equal(r[0].closed_early, false);
  });

  it('TST-S-003: anmeldung -> anmeldung (erneut oeffnen) erlaubt, setzt Frist neu', async () => {
    await setNow(db, isoAt(T0_MS + 100000));
    assert.equal((await admin(db, 'admin_start_registration', 60)).ok, true);
    assert.equal(await phase(db), 'anmeldung');
    const r = await q(db, 'SELECT (extract(epoch from registration_deadline) * 1000)::bigint AS ms FROM public.round');
    assert.equal(Number(r[0].ms), T0_MS + 160000);
  });

  it('TST-S-004: falsche Phasen: close/finish/form_groups in vorbereitet -> falsche_phase', async () => {
    await resetAll(db);
    for (const fn of ['admin_close_registration', 'admin_finish', 'admin_form_groups']) {
      assert.deepEqual(await admin(db, fn), { ok: false, reason: 'falsche_phase' }, fn);
    }
    assert.equal(await phase(db), 'vorbereitet');
  });

  it('TST-S-004: finish in anmeldung -> falsche_phase', async () => {
    await openWithPlayers(db, 4);
    assert.deepEqual(await admin(db, 'admin_finish'), { ok: false, reason: 'falsche_phase' });
    assert.equal(await phase(db), 'anmeldung');
  });

  it('TST-S-004: form_groups bei offener Anmeldung -> anmeldung_offen, keine Aenderung', async () => {
    await openWithPlayers(db, 8);
    const before = await snapshot(db);
    assert.deepEqual(await admin(db, 'admin_form_groups'), { ok: false, reason: 'anmeldung_offen' });
    assert.equal(await snapshot(db), before);
  });

  it('TST-S-004: Frist abgelaufen genuegt zum Einteilen (ohne closed_early)', async () => {
    await openWithPlayers(db, 8);
    await setNow(db, isoAt(T0_MS + 300000));
    const r = await admin(db, 'admin_form_groups');
    assert.deepEqual(r, { ok: true, groups: 2 });
    assert.equal(await phase(db), 'wortaufgabe_aktiv');
  });

  it('TST-S-004: Zustandsfolge bis aufgabe_abgeschlossen; danach start/close/form/finish -> falsche_phase', async () => {
    await startedRound(db, 8);
    assert.equal(await phase(db), 'wortaufgabe_aktiv');
    assert.deepEqual(await admin(db, 'admin_close_registration'), { ok: false, reason: 'falsche_phase' });
    assert.deepEqual(await admin(db, 'admin_start_registration'), { ok: false, reason: 'falsche_phase' });
    assert.deepEqual(await admin(db, 'admin_form_groups'), { ok: false, reason: 'falsche_phase' });
    assert.equal((await admin(db, 'admin_finish')).ok, true);
    assert.equal(await phase(db), 'aufgabe_abgeschlossen');
    for (const fn of ['admin_close_registration', 'admin_form_groups', 'admin_finish']) {
      assert.deepEqual(await admin(db, fn), { ok: false, reason: 'falsche_phase' }, fn);
    }
    assert.deepEqual(await admin(db, 'admin_start_registration'), { ok: false, reason: 'falsche_phase' });
    assert.equal(await phase(db), 'aufgabe_abgeschlossen');
  });

  it('TST-S-003: join_round in wortaufgabe_aktiv/aufgabe_abgeschlossen -> anmeldung_geschlossen', async () => {
    await startedRound(db, 8);
    assert.equal((await rpc(db, uid(500), 'join_round', 'Neuling')).reason, 'anmeldung_geschlossen');
    await admin(db, 'admin_finish');
    assert.equal((await rpc(db, uid(500), 'join_round', 'Neuling')).reason, 'anmeldung_geschlossen');
  });

  it('TST-S-004: admin_overview liefert Phase, Spieler, Gruppen, Ranking', async () => {
    await startedRound(db, 8);
    const o = await admin(db, 'admin_overview');
    assert.equal(o.ok, true);
    assert.equal(o.phase, 'wortaufgabe_aktiv');
    assert.equal(o.players.length, 8);
    assert.equal(o.groups.length, 2);
    assert.ok(Array.isArray(o.ranking));
    assert.equal(o.ranking.length, 0);
    assert.equal(typeof o.server_now_ms, 'number');
    assert.ok(!JSON.stringify(o).includes(ADMIN_CODE));
  });

  it('TST-A-003: anon darf keine RPC ausfuehren (alle Funktionen)', async () => {
    await resetAll(db);
    const calls = [
      ['join_round', 'Anon'], ['get_state'], ['submit_answer', 'x'],
      ['admin_start_registration', ADMIN_CODE], ['admin_close_registration', ADMIN_CODE],
      ['admin_form_groups', ADMIN_CODE], ['admin_overview', ADMIN_CODE], ['admin_finish', ADMIN_CODE],
      ['admin_reset', ADMIN_CODE], ['admin_set_code', 'neu'],
    ];
    for (const [fn, ...a] of calls) {
      await assert.rejects(() => rpcAnon(db, fn, ...a), /permission denied/i, fn);
    }
  });

  it('TST-A-003: authenticated darf admin_set_code nicht ausfuehren', async () => {
    await assert.rejects(() => rpc(db, uid(1), 'admin_set_code', 'uebernommen'), /permission denied/i);
    assert.equal((await admin(db, 'admin_overview')).ok, true);
  });
});

describe('DB admin_form_groups', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  const ns = [...Array.from({ length: 31 }, (_, i) => i), 100];
  for (const n of ns) {
    it(`TST-S-004: Einteilung n=${n}`, async () => {
      await openWithPlayers(db, n);
      await admin(db, 'admin_close_registration');
      const sizes = expectedSizes(n);
      const r = await admin(db, 'admin_form_groups');
      if (!sizes) {
        const reason = n === 7 ? 'nicht_teilbar' : 'zu_wenige';
        assert.deepEqual(r, { ok: false, reason });
        assert.equal(await phase(db), 'anmeldung');
        assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.groups'))[0].c, 0);
        assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.letters'))[0].c, 0);
        assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.players WHERE group_id IS NOT NULL'))[0].c, 0);
        // Nach Ablehnung kann der Admin erneut oeffnen
        assert.equal((await admin(db, 'admin_start_registration')).ok, true);
        return;
      }
      assert.deepEqual(r, { ok: true, groups: sizes.length });
      assert.equal(await phase(db), 'wortaufgabe_aktiv');

      const players = await q(db, 'SELECT id, group_id FROM public.players');
      assert.equal(players.length, n);
      assert.ok(players.every((p) => p.group_id !== null), 'jeder Spieler genau einer Gruppe');
      const bySize = await q(db, 'SELECT group_id, count(*)::int AS c FROM public.players GROUP BY group_id');
      assert.deepEqual(bySize.map((g) => g.c).sort(), [...sizes].sort());
      for (const g of bySize) assert.ok(g.c >= 4 && g.c <= 6);

      const names = await q(db, 'SELECT name FROM public.groups');
      assert.equal(names.length, sizes.length);
      assert.equal(new Set(names.map((x) => x.name.toLowerCase())).size, names.length);
      const valid = await q(db, 'SELECT count(*)::int AS c FROM public.groups g JOIN public.group_names gn ON gn.name = g.name');
      assert.equal(valid[0].c, names.length);

      const tasks = await q(db, `
        SELECT gt.group_id, gt.solution, w.word, (SELECT count(*)::int FROM public.players p WHERE p.group_id = gt.group_id) AS size
        FROM public.group_tasks gt JOIN public.words w ON w.id = gt.word_id`);
      assert.equal(tasks.length, sizes.length);
      for (const t of tasks) {
        assert.equal(t.solution, t.word);
        assert.ok(t.word.length >= t.size && t.word.length <= 2 * t.size, `Wortlaenge ${t.word} fuer Groesse ${t.size}`);
        const letters = await q(db, `
          SELECT l.player_id, l.position, l.letter FROM public.letters l
          JOIN public.players p ON p.id = l.player_id WHERE p.group_id = $1`, [t.group_id]);
        assert.equal([...letters.map((l) => l.letter)].sort().join(''), [...t.word].sort().join(''));
        const per = new Map();
        for (const l of letters) per.set(l.player_id, (per.get(l.player_id) ?? 0) + 1);
        assert.equal(per.size, t.size, 'jedes Mitglied hat Buchstaben');
        for (const c of per.values()) assert.ok(c >= 1 && c <= 2);
        const positions = new Set(letters.map((l) => `${l.player_id}:${l.position}`));
        assert.equal(positions.size, letters.length, 'Positionen je Spieler eindeutig');
      }
    });
  }

  it('TST-S-004: zweiter Aufruf nach Erfolg -> falsche_phase, Zuordnung unveraendert', async () => {
    await startedRound(db, 12);
    const before = JSON.stringify(await q(db, 'SELECT id, group_id FROM public.players ORDER BY id'));
    const sol = JSON.stringify(await q(db, 'SELECT group_id, word_id FROM public.group_tasks ORDER BY group_id'));
    assert.deepEqual(await admin(db, 'admin_form_groups'), { ok: false, reason: 'falsche_phase' });
    assert.equal(JSON.stringify(await q(db, 'SELECT id, group_id FROM public.players ORDER BY id')), before);
    assert.equal(JSON.stringify(await q(db, 'SELECT group_id, word_id FROM public.group_tasks ORDER BY group_id')), sol);
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.groups'))[0].    c, 3);
  });
});
