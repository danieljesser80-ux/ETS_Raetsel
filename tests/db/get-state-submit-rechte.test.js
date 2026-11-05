import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, createDb, rpc, rpcAnon, sqlAs, admin, q, uid, setNow, isoAt, T0, T0_MS, openWithPlayers,
  resetAll, startedRound, solutionOf, pointsForRank, ADMIN_CODE,
} from './db-helper.js';

const skip = !SCHEMA_EXISTS && 'supabase/schema.sql fehlt';

describe('DB get_state', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  it('TST-S-001: nicht angemeldeter Spieler -> joined:false', async () => {
    await openWithPlayers(db, 0);
    const s = await rpc(db, uid(1), 'get_state');
    assert.equal(s.ok, true);
    assert.equal(s.joined, false);
    assert.equal(s.phase, 'anmeldung');
    assert.equal(s.deadline_ms, T0_MS + 300000);
    assert.equal(s.server_now_ms, T0_MS);
  });

  it('TST-S-002: angemeldeter Spieler vor Einteilung: Name, keine Gruppe, keine Buchstaben', async () => {
    await openWithPlayers(db, 3);
    const s = await rpc(db, uid(2), 'get_state');
    assert.equal(s.joined, true);
    assert.equal(s.name, 'Spieler 2');
    assert.equal(s.group, null);
    assert.deepEqual(s.letters ?? [], []);
    assert.equal(s.solved ?? null, null);
  });

  it('TST-S-007: get_state enthaelt keine Loesung, nur eigene Buchstaben, nur eigene Gruppe', async () => {
    await startedRound(db, 12);
    const groups = await q(db, 'SELECT id, name FROM public.groups');
    for (let i = 1; i <= 12; i++) {
      const s = await rpc(db, uid(i), 'get_state');
      const me = (await q(db, 'SELECT group_id FROM public.players WHERE id = $1', [uid(i)]))[0];
      const own = await q(db, 'SELECT letter FROM public.letters WHERE player_id = $1 ORDER BY position', [uid(i)]);
      assert.deepEqual(s.letters, own.map((l) => l.letter));
      const mates = await q(db, 'SELECT name FROM public.players WHERE group_id = $1', [me.group_id]);
      const gname = groups.find((g) => g.id === me.group_id).name;
      assert.equal(s.group.name, gname);
      assert.deepEqual([...s.group.members].sort(), mates.map((m) => m.name).sort());
      const others = await q(db, 'SELECT name FROM public.players WHERE group_id <> $1', [me.group_id]);
      const json = JSON.stringify(s);
      for (const o of others) assert.ok(!json.includes(`"${o.name}"`), 'fremder Name sichtbar');
      for (const g of groups.filter((g) => g.id !== me.group_id)) assert.ok(!json.includes(g.name));
      const sol = await solutionOf(db, uid(i));
      if (sol.length > 3) assert.ok(!json.toUpperCase().includes(sol), 'Loesung sichtbar');
      assert.ok(!/solution|loesung/i.test(json));
    }
  });

  it('TST-S-005: solved erscheint nach richtiger Antwort', async () => {
    await startedRound(db, 8);
    const sol = await solutionOf(db, uid(1));
    const r = await rpc(db, uid(1), 'submit_answer', sol);
    const s = await rpc(db, uid(1), 'get_state');
    assert.deepEqual(s.solved, { rank: r.rank, points: r.points });
  });
});

describe('DB submit_answer', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  const groupOf = async (p) => (await q(db, 'SELECT group_id FROM public.players WHERE id = $1', [uid(p)]))[0].group_id;
  const memberOf = async (gid, notIn = []) =>
    (await q(db, 'SELECT id FROM public.players WHERE group_id = $1 ORDER BY id', [gid])).map((r) => r.id).filter((i) => !notIn.includes(i));

  it('TST-S-005: nicht angemeldet / ohne uid / nicht Teil einer Gruppe', async () => {
    await startedRound(db, 8);
    assert.deepEqual(await rpc(db, uid(777), 'submit_answer', 'X'), { ok: false, reason: 'nicht_angemeldet' });
    assert.deepEqual(await rpc(db, null, 'submit_answer', 'X'), { ok: false, reason: 'nicht_angemeldet' });
    await resetAll(db);
    await openWithPlayers(db, 3);
    assert.deepEqual(await rpc(db, uid(1), 'submit_answer', 'X'), { ok: false, reason: 'keine_gruppe' });
  });

  it('TST-S-005: falsche Phase (anmeldung, aufgabe_abgeschlossen)', async () => {
    await openWithPlayers(db, 8);
    // Spieler ohne Gruppe: Pruefreihenfolge des Vertrags nennt keine_gruppe vor falsche_phase
    assert.equal((await rpc(db, uid(1), 'submit_answer', 'X')).reason, 'keine_gruppe');
    await admin(db, 'admin_close_registration');
    await admin(db, 'admin_form_groups');
    const sol = await solutionOf(db, uid(1));
    await admin(db, 'admin_finish');
    assert.deepEqual(await rpc(db, uid(1), 'submit_answer', sol), { ok: false, reason: 'falsche_phase' });
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 0);
  });

  it('TST-S-005: falsche Antwort -> correct:false, Versuch gespeichert, kein Ergebnis', async () => {
    await startedRound(db, 8);
    assert.deepEqual(await rpc(db, uid(1), 'submit_answer', 'ZZZZZZZ'), { ok: true, correct: false });
    const a = await q(db, 'SELECT correct FROM public.attempts');
    assert.equal(a.length, 1);
    assert.equal(a[0].correct, false);
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 0);
  });

  it('TST-S-005: leere Antwort ist falsch', async () => {
    await startedRound(db, 8);
    const r = await rpc(db, uid(1), 'submit_answer', '   ');
    assert.equal(r.ok, true);
    assert.equal(r.correct, false);
  });

  it('TST-U-006: richtige Antwort unabhaengig von Gross-/Kleinschreibung und Randleerzeichen', async () => {
    for (const mod of [(s) => s, (s) => s.toLowerCase(), (s) => `  ${s}  `, (s) => `\t${s.toLowerCase()}\n`]) {
      await startedRound(db, 8);
      const sol = await solutionOf(db, uid(1));
      const r = await rpc(db, uid(1), 'submit_answer', mod(sol));
      assert.deepEqual(r, { ok: true, correct: true, rank: 1, points: 10 });
    }
  });

  it('TST-S-005: bereits_geloest fuer alle Mitglieder; kein Doppelergebnis', async () => {
    await startedRound(db, 8);
    const gid = await groupOf(1);
    const members = await memberOf(gid);
    const sol = await solutionOf(db, uid(1));
    const first = await rpc(db, members[0], 'submit_answer', sol);
    assert.equal(first.correct, true);
    for (const m of members) {
      assert.deepEqual(await rpc(db, m, 'submit_answer', sol), { ok: false, reason: 'bereits_geloest' });
    }
    assert.deepEqual(await rpc(db, members[0], 'submit_answer', 'falsch'), { ok: false, reason: 'bereits_geloest' });
    const res = await q(db, 'SELECT * FROM public.results WHERE group_id = $1', [gid]);
    assert.equal(res.length, 1);
    assert.equal(res[0].player_id, members[0]);
  });

  it('TST-S-005: 3-s-Grenze: 2999 ms -> zu_schnell', async () => {
    await startedRound(db, 8);
    await rpc(db, uid(1), 'submit_answer', 'FALSCH1');
    await setNow(db, isoAt(T0_MS + 2999));
    assert.deepEqual(await rpc(db, uid(1), 'submit_answer', 'FALSCH2'), { ok: false, reason: 'zu_schnell' });
  });

  it('TST-S-005: 3-s-Grenze: 3000 ms -> erlaubt; Intervall gilt je Gruppe, nicht je Spieler', async () => {
    await startedRound(db, 8);
    const gid = await groupOf(1);
    const [a, b] = await memberOf(gid);
    await rpc(db, a, 'submit_answer', 'FALSCH1');
    await setNow(db, isoAt(T0_MS + 1000));
    assert.equal((await rpc(db, b, 'submit_answer', 'FALSCH2')).reason, 'zu_schnell');
    await setNow(db, isoAt(T0_MS + 3000));
    assert.deepEqual(await rpc(db, b, 'submit_answer', 'FALSCH3'), { ok: true, correct: false });
  });

  it('TST-S-005: richtige Antwort innerhalb 3 s nach falschem Versuch -> zu_schnell', async () => {
    await startedRound(db, 8);
    await rpc(db, uid(1), 'submit_answer', 'FALSCH1');
    await setNow(db, isoAt(T0_MS + 500));
    const sol = await solutionOf(db, uid(1));
    assert.equal((await rpc(db, uid(1), 'submit_answer', sol)).reason, 'zu_schnell');
    await setNow(db, isoAt(T0_MS + 3000));
    assert.equal((await rpc(db, uid(1), 'submit_answer', sol)).correct, true);
  });

  it('TST-S-005: andere Gruppe wird vom Intervall einer Gruppe nicht gebremst', async () => {
    await startedRound(db, 8);
    const g1 = await groupOf(1);
    const other = (await q(db, 'SELECT id FROM public.players WHERE group_id <> $1 LIMIT 1', [g1]))[0].id;
    await rpc(db, uid(1), 'submit_answer', 'FALSCH1');
    assert.deepEqual(await rpc(db, other, 'submit_answer', 'FALSCH1'), { ok: true, correct: false });
  });

  it('TST-S-005: Antwort mit Loesung einer fremden Gruppe ist falsch (Loesung gilt nur fuer eigene Gruppe)', async () => {
    await startedRound(db, 8);
    const g1 = await groupOf(1);
    const sols = await q(db, 'SELECT solution, group_id FROM public.group_tasks');
    const foreign = sols.find((s) => s.group_id !== g1);
    const own = sols.find((s) => s.group_id === g1);
    if (foreign.solution === own.solution) return; // identisches Wort in beiden Gruppen: Fall nicht pruefbar
    const r = await rpc(db, uid(1), 'submit_answer', foreign.solution);
    assert.deepEqual(r, { ok: true, correct: false });
    assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 0);
  });

  it('TST-S-005: Rang 1..10 mit Punkten 10,8,6,5,4,3,2,1,1,1; Raenge eindeutig, je Gruppe ein Ergebnis', async () => {
    await startedRound(db, 50);
    const groups = await q(db, 'SELECT id FROM public.groups ORDER BY id');
    assert.equal(groups.length, 10);
    const got = [];
    for (let i = 0; i < groups.length; i++) {
      const m = (await memberOf(groups[i].id))[0];
      const sol = (await q(db, 'SELECT solution FROM public.group_tasks WHERE group_id = $1', [groups[i].id]))[0].solution;
      await setNow(db, isoAt(T0_MS + 10000 * (i + 1)));
      const r = await rpc(db, m, 'submit_answer', sol);
      assert.equal(r.ok, true);
      assert.equal(r.correct, true);
      got.push(r);
    }
    assert.deepEqual(got.map((r) => r.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.deepEqual(got.map((r) => r.points), [10, 8, 6, 5, 4, 3, 2, 1, 1, 1]);
    got.forEach((r, i) => assert.equal(r.points, pointsForRank(i + 1)));
    const res = await q(db, 'SELECT group_id, rank, points FROM public.results ORDER BY rank');
    assert.equal(res.length, 10);
    assert.equal(new Set(res.map((r) => r.rank)).size, 10);
    assert.equal(new Set(res.map((r) => r.group_id)).size, 10);
    const ov = await admin(db, 'admin_overview');
    assert.equal(ov.ranking.length, 10);
    assert.deepEqual(ov.ranking.map((r) => r.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('TST-A-002: viele richtige Antworten hintereinander ergeben lueckenlose, eindeutige Raenge', async () => {
    await startedRound(db, 20);
    const groups = await q(db, 'SELECT id FROM public.groups');
    const subs = [];
    for (const g of groups) {
      const m = (await memberOf(g.id))[0];
      const sol = (await q(db, 'SELECT solution FROM public.group_tasks WHERE group_id = $1', [g.id]))[0].solution;
      subs.push([m, sol]);
    }
    for (const [m, sol] of subs) await rpc(db, m, 'submit_answer', sol);
    const res = await q(db, 'SELECT rank FROM public.results ORDER BY rank');
    assert.deepEqual(res.map((r) => r.rank), groups.map((_, i) => i + 1));
  });
});

describe('DB Rechte und Reset', { skip }, () => {
  let db;
  before(async () => {
    ({ db } = await createDb());
  });

  const tables = ['players', 'groups', 'group_tasks', 'letters', 'words', 'group_names', 'attempts', 'results', 'admin_config'];

  for (const t of tables) {
    it(`TST-A-003: authenticated kann Tabelle ${t} weder lesen noch schreiben`, async () => {
      await openWithPlayers(db, 1);
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `SELECT * FROM public.${t}`), /permission denied/i);
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `INSERT INTO public.${t} DEFAULT VALUES`), /permission denied/i);
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `DELETE FROM public.${t}`), /permission denied/i);
      await assert.rejects(() => sqlAs(db, 'anon', null, `SELECT * FROM public.${t}`), /permission denied/i);
    });
  }

  it('TST-S-007: Loesungswort nicht lesbar (group_tasks.solution, words.word, admin_config.code_hash)', async () => {
    await startedRound(db, 8);
    for (const s of ['SELECT solution FROM public.group_tasks', 'SELECT word FROM public.words', 'SELECT code_hash FROM public.admin_config']) {
      await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), s), /permission denied/i, s);
    }
  });

  it('TST-A-003: round nur per SELECT auf phase, registration_deadline, closed_early, updated_at lesbar', async () => {
    await openWithPlayers(db, 0);
    const r = await sqlAs(db, 'authenticated', uid(1), 'SELECT phase, registration_deadline, closed_early, updated_at FROM public.round');
    assert.equal(r.rows.length, 1);
    assert.equal(r.rows[0].phase, 'anmeldung');
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'SELECT * FROM public.round'), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'SELECT id FROM public.round'), /permission denied/i);
  });

  it('TST-A-003: round nicht schreibbar durch authenticated', async () => {
    await openWithPlayers(db, 0);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `UPDATE public.round SET phase = 'aufgabe_abgeschlossen'`), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), 'DELETE FROM public.round'), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `INSERT INTO public.round (id) VALUES (2)`), /permission denied/i);
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'anmeldung');
  });

  it('TST-A-003: alle Tabellen haben RLS aktiviert', async () => {
    const rows = await q(db, `SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity`);
    assert.deepEqual(rows, []);
  });

  it('TST-A-003: anon darf RPCs nicht ausfuehren', async () => {
    await assert.rejects(() => rpcAnon(db, 'join_round', 'Anon'), /permission denied/i);
    await assert.rejects(() => rpcAnon(db, 'get_state'), /permission denied/i);
  });

  it('TST-S-007: Spieler kann fremde Gruppenzuordnung/Punkte nicht manipulieren', async () => {
    await startedRound(db, 8);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `UPDATE public.players SET group_id = NULL`), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `UPDATE public.results SET points = 99`), /permission denied/i);
    await assert.rejects(() => sqlAs(db, 'authenticated', uid(1), `INSERT INTO public.results (group_id, rank, points) VALUES (1, 1, 99)`), /permission denied/i);
  });

  it('TST-S-007: admin_reset loescht Spieler-, Gruppen-, Buchstaben-, Versuchs- und Ergebnisdaten; Listen und Code bleiben', async () => {
    await startedRound(db, 8);
    const sol = await solutionOf(db, uid(1));
    await rpc(db, uid(1), 'submit_answer', 'FALSCH1');
    await setNow(db, isoAt(T0_MS + 3000));
    await rpc(db, uid(1), 'submit_answer', sol);
    const cnt = async (t) => (await q(db, `SELECT count(*)::int AS c FROM public.${t}`))[0].c;
    assert.ok((await cnt('results')) > 0 && (await cnt('attempts')) > 0);
    assert.deepEqual(await admin(db, 'admin_reset'), { ok: true });
    for (const t of ['players', 'groups', 'group_tasks', 'letters', 'attempts', 'results']) assert.equal(await cnt(t), 0, t);
    assert.equal(await cnt('words'), 25);
    assert.ok((await cnt('group_names')) >= 30);
    assert.equal(await cnt('admin_config'), 1);
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'vorbereitet');
    assert.equal((await admin(db, 'admin_overview')).ok, true);
  });

  it('TST-S-007: admin_reset ist in jeder Phase zulaessig', async () => {
    await resetAll(db);
    assert.equal((await admin(db, 'admin_reset')).ok, true);
    await openWithPlayers(db, 3);
    assert.equal((await admin(db, 'admin_reset')).ok, true);
    await startedRound(db, 8);
    assert.equal((await admin(db, 'admin_reset')).ok, true);
    await startedRound(db, 8);
    await admin(db, 'admin_finish');
    assert.equal((await admin(db, 'admin_reset')).ok, true);
    assert.equal((await q(db, 'SELECT phase FROM public.round'))[0].phase, 'vorbereitet');
  });

  it('TST-S-007: nach Reset sind Anmeldung und vollstaendige Runde wiederholbar (gleiche Namen/IDs)', async () => {
    for (let run = 0; run < 2; run++) {
      await startedRound(db, 10);
      const sol = await solutionOf(db, uid(1));
      const r = await rpc(db, uid(1), 'submit_answer', sol);
      assert.deepEqual(r, { ok: true, correct: true, rank: 1, points: 10 });
      assert.equal((await q(db, 'SELECT count(*)::int AS c FROM public.results'))[0].c, 1);
      await admin(db, 'admin_finish');
      await admin(db, 'admin_reset');
    }
  });
});
