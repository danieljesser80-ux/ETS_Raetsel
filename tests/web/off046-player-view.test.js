import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf, findButton } from './dom-helper.js';

const { renderPlayer } = await import('../../web/js/views.js');
const NOW = 1_000_000;
const UUID = '2f6d7c9e-1a3b-4c5d-8e7f-0a1b2c3d4e5f';

const base = (over = {}) => ({
  ok: true, joined: true, phase: 'wortaufgabe_aktiv', name: 'Anna', leader: true,
  group: { name: 'Elche', members: ['Anna', 'Ben', 'Cleo', 'Dora'] }, letters: ['Q', 'Y'],
  solved: null, word_completed: false, word_outcome: null, word_started_ms: 0, word_duration_ms: null,
  game_deadline_ms: 1_500_000, finished_at_ms: null, closed_early: false,
  server_now_ms: 0, fetchedAtMs: NOW, tasks: [], ...over,
});
const task = (over = {}) => ({ id: UUID, title: 'Aufgabe 1', detail_title: null, category: 'Geo', kind: 'exact', difficulty: 'mittel',
  available: true, started: false, submitted: false, given_up: false, started_at_ms: null, duration_ms: null, ...over });

test('Wortaufgabe offen: Aufgeben-Knopf meldet onGiveUp("wort") erst nach Klick', () => {
  const calls = [];
  const root = makeRoot();
  renderPlayer(root, base(), { onGiveUp: (s) => calls.push(s), onSubmit() {} }, NOW);
  const b = findButton(root, /Aufgeben/i);
  assert.ok(b);
  b.click();
  assert.deepEqual(calls, ['wort']);
});

test('Wort: jedes Mitglied darf aufgeben; Aufgaben nur der Spielleiter', () => {
  const root = makeRoot();
  renderPlayer(root, base({ leader: false }), { onGiveUp() {}, onSubmit() {} }, NOW);
  assert.ok(findButton(root, /Aufgeben/i), 'Starträtsel: alle Mitglieder');
  const r2 = makeRoot();
  renderPlayer(r2, base({ leader: false, word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, openTaskId: UUID, tasks: [task({ started: true })] }), { onGiveUp() {} }, NOW);
  assert.equal(findButton(r2, /Aufgeben/i), undefined);
});

test('Aufgegebenes Wort schaltet Aufgaben frei, ohne als geloest zu gelten', () => {
  const root = makeRoot();
  renderPlayer(root, base({ word_completed: true, word_outcome: 'given_up', solved: null, tasks: [task()] }), { onGiveUp() {} }, NOW);
  const t = textOf(root);
  assert.match(t, /Aufgabe 1/);
  assert.match(t, /aufgegeben/i);
  assert.doesNotMatch(t, /Richtig|gelöst/i);
  assert.equal(findButton(root, /Gruppenwort.*(absenden|prüfen)/i), undefined, 'kein Eingabefeld mehr');
});

test('Aufgaben zeigen neutralen Titel bis zum Start und danach detail_title', () => {
  const root = makeRoot();
  renderPlayer(root, base({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, tasks: [task()] }), {}, NOW);
  assert.match(textOf(root), /Aufgabe 1/);
  const r2 = makeRoot();
  renderPlayer(r2, base({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 },
    openTaskId: UUID, tasks: [task({ started: true, detail_title: 'Am Brunnen', started_at_ms: 500_000 })] }), {}, NOW);
  assert.match(textOf(r2), /Am Brunnen/);
  assert.ok(!r2.innerHTML.includes('"id"'));
});

test('Eigene Zeiten: Wort und Aufgaben mit data-Zeitmarken, Ende stoppt die Anzeige', () => {
  const root = makeRoot();
  renderPlayer(root, base({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, word_duration_ms: 61_000,
    tasks: [task({ started: true, detail_title: 'X', started_at_ms: 900_000, duration_ms: null }),
      task({ id: 'b', title: 'Aufgabe2', started: true, submitted: true, detail_title: 'Y', started_at_ms: 100_000, duration_ms: 125_000 })] }), {}, NOW);
  assert.match(textOf(root), /1:01/);
  assert.match(textOf(root), /2:05/);
  assert.ok(root.querySelector('[data-task-time]'), 'laufende Aufgabenzeit');
});

test('Bearbeitung: offene Aufgabe traegt Marker data-open-task, Aufgeben je Aufgabe nur fuer Spielleiter', () => {
  const calls = [];
  const root = makeRoot();
  renderPlayer(root, base({ word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, openTaskId: UUID,
    tasks: [task({ started: true, detail_title: 'X', started_at_ms: 1 })] }), { onGiveUp: (s) => calls.push(s) }, NOW);
  assert.ok(root.querySelector('[data-open-task]'));
  findButton(root, /Aufgeben/i).click();
  assert.deepEqual(calls, [UUID]);
});

test('Spiel beendet: Teilnehmer behalten Ergebnis und Zeiten', () => {
  const root = makeRoot();
  renderPlayer(root, base({ phase: 'aufgabe_abgeschlossen', finished_at_ms: 1_200_000, word_completed: true, word_outcome: 'solved',
    solved: { rank: 2 }, word_duration_ms: 90_000, tasks: [] }), {}, NOW);
  assert.match(textOf(root), /1:30/);
});
