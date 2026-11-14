import test from 'node:test';
import assert from 'node:assert/strict';
import './dom-helper.js';

const { createApi } = await import('../../web/js/api.js');

function fake(data = { ok: true }) {
  const calls = [];
  return { calls, rpc: async (n, a) => { calls.push([n, a]); return { data, error: null }; }, auth: {} };
}

test('API: giveUp ohne Argument meldet wort, sonst die Aufgabe', async () => {
  const c = fake();
  const api = createApi(c);
  await api.giveUp();
  await api.giveUp('t1');
  assert.deepEqual(c.calls, [['give_up', { p_task_id: 'wort' }], ['give_up', { p_task_id: 't1' }]]);
});

test('API: gameConfig ruft game_config ohne Code', async () => {
  const c = fake();
  await createApi(c).gameConfig();
  assert.equal(c.calls[0][0], 'game_config');
  assert.ok(!c.calls[0][1] || !('p_code' in c.calls[0][1]));
});

test('API: Admin-Konfiguration, Woerter, Beamer und Export', async () => {
  const c = fake();
  const api = createApi(c);
  const sch = { leicht: [1], mittel: [2], schwer: [3] };
  await api.admin.setGameConfig('C', 30, 'leicht', sch);
  await api.admin.setWords('C', ['ZEBRA']);
  await api.admin.openBeamer('C');
  await api.admin.exportResults('C');
  assert.deepEqual(c.calls, [
    ['admin_set_game_config', { p_code: 'C', p_minutes: 30, p_word_difficulty: 'leicht', p_schedules: sch }],
    ['admin_set_words', { p_code: 'C', p_words: ['ZEBRA'] }],
    ['admin_open_beamer', { p_code: 'C' }],
    ['admin_export', { p_code: 'C' }],
  ]);
});

test('API: beamerState sendet nur das Token, setTask den Schwierigkeitsgrad', async () => {
  const c = fake();
  const api = createApi(c);
  await api.beamerState('tok');
  await api.admin.setTask('C', 'x', { title: 'T', difficulty: 'schwer' });
  await api.admin.setTask('C', 'x', { title: 'T' });
  assert.deepEqual(c.calls[0], ['beamer_state', { p_token: 'tok' }]);
  assert.equal(c.calls[1][1].p_difficulty, 'schwer');
  assert.equal(c.calls[2][1].p_difficulty, null, 'null bewahrt den Wert');
});
