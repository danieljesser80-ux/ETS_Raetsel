import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_EXISTS, createDb, rpc, admin, q, uid, openWithPlayers, resetAll, expectedSizes } from './db-helper.js';

const form = async (db, n, min, max) => {
  await openWithPlayers(db, n);
  const s = await admin(db, 'admin_set_group_size', min, max);
  if (!s.ok) return s;
  await admin(db, 'admin_close_registration');
  return admin(db, 'admin_form_groups');
};

describe('DB Gruppengröße einstellbar (OFF-001)', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  it('TST-S-020: Standard ist 4 bis 6', async () => {
    await resetAll(db);
    const o = await admin(db, 'admin_overview');
    assert.equal(o.group_min, 4);
    assert.equal(o.group_max, 6);
  });

  it('TST-S-020: falscher Admincode -> nicht_berechtigt', async () => {
    const r = await rpc(db, uid(1), 'admin_set_group_size', 'falsch', 2, 3);
    assert.deepEqual(r, { ok: false, reason: 'nicht_berechtigt' });
  });

  for (const [min, max] of [[0, 4], [4, 15], [5, 4], [null, 4], [4, null]]) {
    it(`TST-S-020: ungültig ${min}/${max} -> ungueltige_groesse, nichts geändert`, async () => {
      await resetAll(db);
      assert.deepEqual(await admin(db, 'admin_set_group_size', min, max), { ok: false, reason: 'ungueltige_groesse' });
      const o = await admin(db, 'admin_overview');
      assert.equal(o.group_min, 4);
      assert.equal(o.group_max, 6);
    });
  }

  it('TST-S-020: Änderung nur vor der Einteilung (falsche_phase danach)', async () => {
    await openWithPlayers(db, 8);
    assert.equal((await admin(db, 'admin_set_group_size', 2, 4)).ok, true);
    await admin(db, 'admin_close_registration');
    await admin(db, 'admin_form_groups');
    assert.deepEqual(await admin(db, 'admin_set_group_size', 3, 5), { ok: false, reason: 'falsche_phase' });
  });

  it('TST-S-020: Einstellung bleibt nach admin_reset erhalten', async () => {
    await resetAll(db);
    await admin(db, 'admin_set_group_size', 3, 5);
    await resetAll(db);
    const o = await admin(db, 'admin_overview');
    assert.equal(o.group_min, 3);
    assert.equal(o.group_max, 5);
    await admin(db, 'admin_set_group_size', 4, 6);
  });

  const cases = [[10, 2, 3], [7, 3, 4], [9, 3, 3], [25, 5, 5], [34, 8, 9], [13, 1, 9], [100, 1, 9]];
  for (const [n, min, max] of cases) {
    it(`TST-S-020: n=${n}, ${min} bis ${max}: Größen wie Referenz, Wortlänge passend`, async () => {
      const r = await form(db, n, min, max);
      const sizes = expectedSizes(n, min, max);
      assert.deepEqual(r, { ok: true, groups: sizes.length });
      const bySize = await q(db, 'SELECT count(*)::int AS c FROM public.players GROUP BY group_id');
      assert.deepEqual(bySize.map((g) => g.c).sort(), [...sizes].sort());
      const tasks = await q(
        db,
        `SELECT gt.solution, (SELECT count(*)::int FROM public.players p WHERE p.group_id = gt.group_id) AS size,
                (SELECT string_agg(l.letter, '' ORDER BY l.letter) FROM public.letters l
                  JOIN public.players p ON p.id = l.player_id WHERE p.group_id = gt.group_id) AS got
           FROM public.group_tasks gt`,
      );
      for (const t of tasks) {
        assert.ok(t.size >= min && t.size <= max);
        assert.ok(t.solution.length >= t.size && t.solution.length <= 2 * t.size);
        assert.equal(t.got, [...t.solution].sort().join(''));
      }
    });
  }

  it('TST-S-020: Teilnehmerzahl passt nicht -> nicht_teilbar, nichts verändert, erneut öffnen möglich', async () => {
    const r = await form(db, 10, 4, 4);
    assert.deepEqual(r, { ok: false, reason: 'nicht_teilbar' });
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.groups'))[0].c, 0);
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'anmeldung');
    assert.equal((await admin(db, 'admin_start_registration')).ok, true);
  });

  it('TST-S-020: weniger Teilnehmer als Minimum -> zu_wenige', async () => {
    assert.deepEqual(await form(db, 2, 3, 5), { ok: false, reason: 'zu_wenige' });
  });

  it('TST-S-020: Min = Max = 1 (Testmodus): jede Person eine Gruppe mit allen Buchstaben, 40 Spieler -> eindeutige Namen', async () => {
    const r = await form(db, 40, 1, 1);
    assert.deepEqual(r, { ok: true, groups: 40 });
    const c = await q(db, 'SELECT count(DISTINCT name)::int AS c FROM public.groups');
    assert.equal(c[0].c, 40);
    const rows = await q(
      db,
      `SELECT t.solution, string_agg(l.letter, '' ORDER BY l.letter) AS got
         FROM public.group_tasks t JOIN public.players p ON p.group_id = t.group_id
         JOIN public.letters l ON l.player_id = p.id GROUP BY t.group_id, t.solution`,
    );
    assert.equal(rows.length, 40);
    for (const row of rows) assert.equal(row.got, [...row.solution].sort().join(''));
  });

  it('TST-S-020: admin_form_test_groups existiert nicht mehr', async () => {
    await assert.rejects(() => rpc(db, uid(1), 'admin_form_test_groups', 'x'), /does not exist/i);
  });
});
