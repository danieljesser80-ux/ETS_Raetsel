import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_EXISTS, createDb, openWithPlayers, admin, rpc, rpcAnon, q, uid, solutionOf, startedRound,
} from './db-helper.js';

describe('DB OFF-064 Wortauswahl und Beamerzugriff', { skip: !SCHEMA_EXISTS && 'supabase/schema.sql fehlt' }, () => {
  let db;
  before(async () => { ({ db } = await createDb()); });

  it('TST-S-043: Admin-Wortliste akzeptiert beliebige A-Z-Wortlaengen und verteilt alle Buchstaben fair', async () => {
    await openWithPlayers(db, 4);
    assert.equal((await admin(db, 'admin_set_words', ['ABCDEFGHIJKLMNOP'])).ok, true);
    await admin(db, 'admin_close_registration');
    assert.equal((await admin(db, 'admin_form_groups')).ok, true);
    const group = (await q(db, 'SELECT id FROM public.groups'))[0];
    const word = (await q(db, 'SELECT solution FROM public.group_tasks WHERE group_id=$1', [group.id]))[0].solution;
    assert.equal(word, 'ABCDEFGHIJKLMNOP');
    const rows = await q(db, 'SELECT player_id, position, letter FROM public.letters WHERE player_id IN (SELECT id FROM public.players WHERE group_id=$1)', [group.id]);
    assert.equal(rows.map((row) => row.letter).sort().join(''), word.split('').sort().join(''));
    const counts = (await q(db, 'SELECT p.id, count(l.player_id)::int AS n FROM public.players p LEFT JOIN public.letters l ON l.player_id=p.id WHERE p.group_id=$1 GROUP BY p.id', [group.id])).map((row) => row.n);
    assert.deepEqual(counts.sort((a,b) => a-b), [4,4,4,4]);
  });

  it('TST-S-043: Auch ein kuerzeres Wort als die Gruppe wird ohne Auswahlfilter vergeben', async () => {
    await openWithPlayers(db, 4);
    assert.equal((await admin(db, 'admin_set_words', ['AB'])).ok, true);
    await admin(db, 'admin_close_registration');
    assert.equal((await admin(db, 'admin_form_groups')).ok, true);
    assert.equal((await q(db, 'SELECT count(*)::int AS n FROM public.letters'))[0].n, 2);
  });

  it('TST-S-043: Angemeldete Spieler erhalten die Beamer-Anzeige ohne Admin-Token; Anonyme nicht', async () => {
    await startedRound(db, 8);
    const player = uid(1);
    const solution = await solutionOf(db, player);
    assert.equal((await rpc(db, player, 'submit_answer', solution)).correct, true);
    const state = await rpc(db, player, 'beamer_state', null);
    assert.equal(state.ok, true);
    const ownGroup = (await q(db, 'SELECT group_id FROM public.players WHERE id=$1', [player]))[0].group_id;
    const ownName = (await q(db, 'SELECT name FROM public.groups WHERE id=$1', [ownGroup]))[0].name;
    const visibleGroup = state.groups.find((group) => group.name === ownName);
    const memberNames = (await q(db, 'SELECT name FROM public.players WHERE group_id=$1 ORDER BY joined_at,name', [ownGroup])).map((row) => row.name);
    assert.deepEqual(visibleGroup.members, memberNames);
    const anonymous = await rpcAnon(db, 'beamer_state', null);
    assert.equal(anonymous.rows[0].r.ok, false);
  });
});
