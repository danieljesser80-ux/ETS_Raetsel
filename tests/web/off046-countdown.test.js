import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot } from './dom-helper.js';

const { countdownSeconds, gameSeconds, elapsedSeconds, formatClock } = await import('../../web/js/countdown.js');
const { updateCountdowns, renderPlayer } = await import('../../web/js/views.js');

// TST-U-027: Uhrabgleich, Anmeldezeit, Spielzeit, eigene Zeiten
const S = (over = {}) => ({ phase: 'wortaufgabe_aktiv', deadline_ms: null, server_now_ms: 1_000_000, fetchedAtMs: 50_000, ...over });

test('countdownSeconds: nur in offener Anmeldung, sonst null', () => {
  const base = { deadline_ms: 400_000, server_now_ms: 100_000, fetchedAtMs: 0 };
  assert.equal(countdownSeconds({ ...base, phase: 'anmeldung' }, 0), 300);
  for (const phase of ['vorbereitet', 'gruppen_eingeteilt', 'wortaufgabe_aktiv', 'aufgabe_abgeschlossen']) {
    assert.equal(countdownSeconds({ ...base, phase }, 0), null, phase);
  }
  assert.equal(countdownSeconds({ ...base, phase: 'anmeldung', closed_early: true }, 0), null);
  assert.equal(countdownSeconds(null, 0), null);
  assert.equal(countdownSeconds({ ...base, phase: 'anmeldung', server_now_ms: undefined }, 0), null, 'fehlende Serverzeit wird nie zu 0');
});

test('gameSeconds: nur mit game_deadline_ms, Uhrabgleich per Serverzeit, nie negativ', () => {
  const s = S({ game_deadline_ms: 1_000_000 + 600_000, server_now_ms: 1_000_000, fetchedAtMs: 50_000 });
  assert.equal(gameSeconds(s, 50_000), 600);
  assert.equal(gameSeconds(s, 110_000), 540);
  assert.equal(gameSeconds(s, 50_001), 600, 'aufgerundet');
  assert.equal(gameSeconds(s, 50_000 + 600_000), 0);
  assert.equal(gameSeconds(s, 50_000 + 9_000_000), 0);
  assert.equal(gameSeconds(S({ game_deadline_ms: null }), 0), null);
  assert.equal(gameSeconds(S(), 0), null);
  assert.equal(gameSeconds(null, 0), null);
  assert.equal(gameSeconds(S({ game_deadline_ms: 'x' }), 0), null);
});

test('gameSeconds nach Spielende: stehende Zeit, kein Weiterlaufen', () => {
  const s = S({ phase: 'aufgabe_abgeschlossen', game_deadline_ms: 2_000_000, finished_at_ms: 1_300_000 });
  const v = gameSeconds(s, 9_999_999);
  assert.ok(v === null || v === 0, `Spielende: ${v}`);
});

test('elapsedSeconds: laufende Zeit aus Startzeit und Serverzeit, abgeschlossene Dauer fest', () => {
  const s = S({ game_deadline_ms: 5_000_000 });
  assert.equal(elapsedSeconds(1_000_000 - 20_000, null, s, 50_000), 20);
  assert.equal(elapsedSeconds(1_000_000 - 20_000, null, s, 80_000), 50);
  assert.equal(elapsedSeconds(1_000_000 - 20_000, 7_400, s, 80_000), 7, 'Dauer in ms wird nicht aufgerundet gezeigt: abgerundet auf Sekunden');
  assert.equal(elapsedSeconds(1_000_000, 0, s, 80_000), 0);
});

test('elapsedSeconds: ungueltige Eingaben ergeben null, nicht 0', () => {
  const s = S({ game_deadline_ms: 5_000_000 });
  for (const start of [null, undefined, 'x', NaN, Infinity]) assert.equal(elapsedSeconds(start, null, s, 0), null, String(start));
  assert.equal(elapsedSeconds(1000, -5, s, 0), null);
  assert.equal(elapsedSeconds(1000, 'x', s, 0), null);
  assert.equal(elapsedSeconds(1000, null, { ...s, server_now_ms: undefined }, 0), null);
  assert.equal(elapsedSeconds(1000, null, null, 0), null);
});

test('elapsedSeconds: nach Spielende gedeckelt auf finished_at_ms bzw. Spielfrist', () => {
  const fin = S({ phase: 'aufgabe_abgeschlossen', game_deadline_ms: 2_000_000, finished_at_ms: 1_100_000 });
  assert.equal(elapsedSeconds(1_000_000, null, fin, 50_000 + 3_600_000), 100);
  const expired = S({ phase: 'wortaufgabe_aktiv', game_deadline_ms: 1_060_000 });
  assert.equal(elapsedSeconds(1_000_000, null, expired, 50_000 + 3_600_000), 60, 'nach der Frist stehen geblieben');
});

test('Uhrabgleich: falsche Geraeteuhr (eine Stunde vor) aendert die Anzeige nicht', () => {
  const s = S({ game_deadline_ms: 1_000_000 + 120_000, server_now_ms: 1_000_000, fetchedAtMs: 3_600_000 + 1000 });
  assert.equal(gameSeconds(s, 3_600_000 + 1000), 120);
  assert.equal(gameSeconds(s, 3_600_000 + 31_000), 90);
  assert.equal(elapsedSeconds(1_000_000 - 5000, null, s, 3_600_000 + 11_000), 15);
});

const WITH_TIMERS = (over = {}) => ({
  ok: true, joined: true, name: 'Anna', phase: 'wortaufgabe_aktiv', server_now_ms: 1_000_000, fetchedAtMs: 0,
  game_deadline_ms: 1_000_000 + 400_000, word_started_ms: 1_000_000 - 30_000, word_completed: false, word_outcome: null,
  group: { name: 'Rentierbande', members: ['Anna', 'Ben'] }, letters: ['Q', 'Y'], solved: null, leader: false, tasks: [], ...over,
});

test('updateCountdowns aktualisiert Spielzeit, Wortzeit und Warnstufen ueber eigene Datenattribute', () => {
  const root = makeRoot();
  renderPlayer(root, WITH_TIMERS(), {}, 0);
  const game = root.querySelector('[data-game-countdown]');
  assert.ok(game, 'Spielzeit-Timer im Spielerbild');
  assert.equal(game.textContent.trim(), formatClock(400));
  assert.ok(root.querySelector('[data-task-time]'), 'eigene Wortzeit');
  const state = WITH_TIMERS();
  updateCountdowns(root, state, 100_000);
  assert.equal(root.querySelector('[data-game-countdown]').textContent.trim(), formatClock(300));
  assert.equal(root.querySelector('[data-task-time]').textContent.trim(), formatClock(130));
  updateCountdowns(root, state, 345_000);
  assert.equal(root.querySelector('[data-game-countdown]').textContent.trim(), formatClock(55));
  const warn = root.querySelector('[data-time-warning]');
  assert.ok(warn && !warn.hidden && warn.textContent.trim() !== '', 'ab 60 s sichtbare Warnung');
  assert.ok(warn.classList.contains('urgent'), 'letzte Minute dringlich');
  assert.equal(root.querySelector('[data-countdown]'), null, 'Anmeldezeit-Timer nicht im Spielbild');
});

test('Warnung nur bei <=300 s und <=60 s, Stufen unterscheiden sich', () => {
  const root = makeRoot();
  const state = WITH_TIMERS();
  renderPlayer(root, state, {}, 0);
  const node = () => root.querySelector('[data-time-warning]');
  const mark = () => `${node().hidden}|${node().classList.contains('urgent')}|${node().textContent}`;
  updateCountdowns(root, state, 0);
  const calm = mark();
  updateCountdowns(root, state, 150_000);
  const five = mark();
  updateCountdowns(root, state, 350_000);
  const one = mark();
  assert.notEqual(calm, five);
  assert.notEqual(five, one);
});

test('Wortzeit steht bei geloestem oder aufgegebenem Wort still und zeigt die Dauer', () => {
  for (const [outcome, solved] of [['solved', { rank: 1 }], ['given_up', null]]) {
    const root = makeRoot();
    const st = WITH_TIMERS({ word_completed: true, word_outcome: outcome, solved, word_duration_ms: 95_000, leader: true });
    renderPlayer(root, st, {}, 0);
    updateCountdowns(root, st, 900_000);
    const t = root.querySelector('[data-task-time]');
    if (t) assert.equal(t.textContent.trim(), formatClock(95), outcome);
    assert.match(root.textContent, /1:35/, outcome);
  }
});

test('Aufgegebenes Wort wird nicht als geloest dargestellt', () => {
  const root = makeRoot();
  renderPlayer(root, WITH_TIMERS({ word_completed: true, word_outcome: 'given_up', solved: null, word_duration_ms: 10_000, leader: true }), {}, 0);
  assert.match(root.textContent, /[Aa]ufgegeben/);
  assert.ok(!/Platz\s*\d|Rang\s*\d|gelöst!/i.test(root.textContent), root.textContent);
  assert.equal(root.querySelector('input[type="text"], input:not([type])'), null, 'kein Wortfeld mehr');
});

test('Eigene Aufgabenzeiten laufen ab Start, stehen nach Abschluss und bei Aufgeben still', () => {
  const root = makeRoot();
  const tasks = [
    { id: '11111111-1111-4111-8111-111111111111', title: 'Aufgabe1', kind: 'exact', available: true, started: true, submitted: false, started_at_ms: 1_000_000 - 40_000, duration_ms: null, given_up: false, difficulty: 'mittel', detail_title: 'Echt', body: 'Text' },
    { id: '22222222-2222-4222-8222-222222222222', title: 'Aufgabe2', kind: 'exact', available: true, started: true, submitted: true, started_at_ms: 1_000_000 - 90_000, duration_ms: 61_000, given_up: true, difficulty: 'schwer', detail_title: null },
  ];
  const st = WITH_TIMERS({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, leader: true, tasks });
  renderPlayer(root, st, {}, 0);
  updateCountdowns(root, st, 20_000);
  const times = [...root.querySelectorAll('[data-task-time]')].map((n) => n.textContent.trim());
  assert.ok(times.includes(formatClock(60)), `laufend: ${times}`);
  assert.ok(times.includes(formatClock(61)), `stehend: ${times}`);
  updateCountdowns(root, st, 80_000);
  const later = [...root.querySelectorAll('[data-task-time]')].map((n) => n.textContent.trim());
  assert.ok(later.includes(formatClock(120)), 'laufende Aufgabe zaehlt weiter');
  assert.ok(later.includes(formatClock(61)), 'aufgegebene bleibt');
});

test('Geoeffnete Aufgabe traegt das Marker-Attribut data-open-task', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  const tasks = [{ id, title: 'Aufgabe1', kind: 'exact', available: true, started: true, submitted: false, started_at_ms: 1, duration_ms: null, given_up: false, difficulty: 'mittel', detail_title: 'Echt', body: 'Text' }];
  const withTask = makeRoot();
  renderPlayer(withTask, WITH_TIMERS({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, leader: true, tasks, openTaskId: id }), {}, 0);
  assert.ok(withTask.querySelector('[data-open-task]'));
  const without = makeRoot();
  renderPlayer(without, WITH_TIMERS({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, leader: true, tasks }), {}, 0);
  assert.equal(without.querySelector('[data-open-task]'), null);
});
