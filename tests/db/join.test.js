import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, createDb, rpc, admin, q, uid, setNow, isoAt, T0, T0_MS, openWithPlayers, resetAll,
} from './db-helper.js';

describe('DB join_round', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  it('TST-DB: schema.sql ist zweimal ausfuehrbar, Woerter (25) und Gruppennamen (>=30) vorhanden', async () => {
    const w = await q(db, 'SELECT count(*)::int AS c, count(DISTINCT word)::int AS d FROM public.words');
    assert.deepEqual(w[0], { c: 25, d: 25 });
    const g = await q(db, 'SELECT count(DISTINCT lower(name))::int AS d FROM public.group_names');
    assert.ok(g[0].d >= 30);
    const r = await q(db, 'SELECT count(*)::int AS c FROM public.round');
    assert.equal(r[0].c, 1);
  });

  describe('Namen', () => {
    before(() => openWithPlayers(db, 0));

    it('TST-S-002: leerer Name (leer, nur Leerzeichen, null) -> leer', async () => {
      for (const n of ['', '   ', null]) {
        assert.deepEqual(await rpc(db, uid(1), 'join_round', n), { ok: false, reason: 'leer' });
      }
    });

    it('TST-S-002: 1 Zeichen -> zu_kurz, 2 Zeichen ok', async () => {
      assert.deepEqual(await rpc(db, uid(1), 'join_round', 'a'), { ok: false, reason: 'zu_kurz' });
      assert.deepEqual(await rpc(db, uid(1), 'join_round', ' a '), { ok: false, reason: 'zu_kurz' });
      assert.deepEqual(await rpc(db, uid(1), 'join_round', 'Ab'), { ok: true, name: 'Ab' });
    });

    it('TST-S-002: 20 Zeichen ok, 21 -> zu_lang (Codepoints)', async () => {
      assert.equal((await rpc(db, uid(2), 'join_round', 'x'.repeat(20))).ok, true);
      assert.deepEqual(await rpc(db, uid(3), 'join_round', 'x'.repeat(21)), { ok: false, reason: 'zu_lang' });
      assert.equal((await rpc(db, uid(4), 'join_round', '😀'.repeat(20))).ok, true);
      assert.deepEqual(await rpc(db, uid(5), 'join_round', '😀'.repeat(21)), { ok: false, reason: 'zu_lang' });
    });

    it('TST-S-002: Rand-Leerzeichen werden entfernt', async () => {
      assert.deepEqual(await rpc(db, uid(6), 'join_round', '  Anna  '), { ok: true, name: 'Anna' });
      const r = await q(db, 'SELECT name FROM public.players WHERE id = $1', [uid(6)]);
      assert.equal(r[0].name, 'Anna');
    });

    it('TST-S-002: doppelter Name ohne Beachtung der Gross-/Kleinschreibung und Randleerzeichen', async () => {
      for (const n of ['anna', 'ANNA', ' aNNa ']) {
        assert.deepEqual(await rpc(db, uid(7), 'join_round', n), { ok: false, reason: 'doppelt' });
      }
      const c = await q(db, 'SELECT count(*)::int AS c FROM public.players WHERE id = $1', [uid(7)]);
      assert.equal(c[0].c, 0);
    });

    it('TST-S-002: ohne auth.uid() -> nicht_angemeldet', async () => {
      assert.deepEqual(await rpc(db, null, 'join_round', 'Gast'), { ok: false, reason: 'nicht_angemeldet' });
    });

    it('TST-S-002: Idempotenz - erneuter Aufruf liefert already:true, keine neue Zeile, Name bleibt', async () => {
      const before = (await q(db, 'SELECT count(*)::int AS c FROM public.players'))[0].c;
      assert.deepEqual(await rpc(db, uid(6), 'join_round', 'Anna'), { ok: true, already: true, name: 'Anna' });
      const r = await rpc(db, uid(6), 'join_round', 'Anderer Name');
      assert.equal(r.ok, true);
      assert.equal(r.already, true);
      assert.equal(r.name, 'Anna');
      assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.players'))[0].c, before);
    });
  });

  describe('Kapazitaet', () => {
    it('TST-S-002: 100 Spieler ok, 101. -> voll, Bestandsspieler idempotent', async () => {
      await openWithPlayers(db, 100);
      assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.players'))[0].c, 100);
      assert.deepEqual(await rpc(db, uid(101), 'join_round', 'Spieler 101'), { ok: false, reason: 'voll' });
      assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.players'))[0].c, 100);
      const again = await rpc(db, uid(100), 'join_round', 'Spieler 100');
      assert.deepEqual(again, { ok: true, already: true, name: 'Spieler 100' });
    });
  });

  describe('Frist', () => {
    it('TST-S-003: Anmeldung 1 ms vor Frist ok, exakt bei 300 s geschlossen', async () => {
      await openWithPlayers(db, 0);
      await setNow(db, isoAt(T0_MS + 299999));
      assert.equal((await rpc(db, uid(1), 'join_round', 'Frueh')).ok, true);
      await setNow(db, isoAt(T0_MS + 300000));
      assert.deepEqual(await rpc(db, uid(2), 'join_round', 'Spaet'), { ok: false, reason: 'anmeldung_geschlossen' });
      await setNow(db, isoAt(T0_MS + 400000));
      assert.deepEqual(await rpc(db, uid(2), 'join_round', 'Spaet'), { ok: false, reason: 'anmeldung_geschlossen' });
    });

    it('TST-S-003: bestehender Spieler bleibt nach Anmeldeschluss gueltig (already:true)', async () => {
      await setNow(db, isoAt(T0_MS + 500000));
      assert.deepEqual(await rpc(db, uid(1), 'join_round', 'Frueh'), { ok: true, already: true, name: 'Frueh' });
    });

    it('TST-S-003: Frist = Start + 300 s (get_state.deadline_ms)', async () => {
      await openWithPlayers(db, 1);
      const s = await rpc(db, uid(1), 'get_state');
      assert.equal(s.deadline_ms, T0_MS + 300000);
    });

    it('TST-S-003: admin_start_registration mit eigener Dauer', async () => {
      await openWithPlayers(db, 0, { seconds: 10 });
      await setNow(db, isoAt(T0_MS + 9999));
      assert.equal((await rpc(db, uid(1), 'join_round', 'Kurz')).ok, true);
      await setNow(db, isoAt(T0_MS + 10000));
      assert.equal((await rpc(db, uid(2), 'join_round', 'Zuspaet')).reason, 'anmeldung_geschlossen');
    });

    it('TST-S-003: closed_early schliesst vor der Frist; erneutes Oeffnen hebt es auf', async () => {
      await openWithPlayers(db, 1);
      assert.equal((await admin(db, 'admin_close_registration')).ok, true);
      assert.equal((await rpc(db, uid(2), 'join_round', 'Nach Close')).reason, 'anmeldung_geschlossen');
      assert.equal((await rpc(db, uid(1), 'join_round', 'Spieler 1')).already, true);
      assert.equal((await admin(db, 'admin_start_registration')).ok, true);
      assert.equal((await rpc(db, uid(2), 'join_round', 'Nach Close')).ok, true);
      const r = await q(db, 'SELECT closed_early, phase FROM public.round');
      assert.deepEqual(r[0], { closed_early: false, phase: 'anmeldung' });
    });

    it('TST-S-003: join_round in anderen Phasen (vorbereitet) -> anmeldung_geschlossen', async () => {
      await resetAll(db);
      assert.deepEqual(await rpc(db, uid(1), 'join_round', 'Zu frueh'), { ok: false, reason: 'anmeldung_geschlossen' });
    });
  });
});
