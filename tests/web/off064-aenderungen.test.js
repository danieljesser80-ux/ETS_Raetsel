import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf } from './dom-helper.js';

const { renderPlayer, renderBeamer } = await import('../../web/js/views.js');
const { ANSWER_FEEDBACK_MS } = await import('../../web/js/feedback.js');
const NOW = 1_000_000;

const tasks = [
  { id: 'a', category: 'Wissen', title: 'Frage A', difficulty: 'leicht', submitted: true, available: true, started: true },
  { id: 'b', category: 'Wissen', title: 'Frage B', difficulty: 'schwer', submitted: false, available: true, started: false },
];
const playerState = (over = {}) => ({
  ok: true, phase: 'wortaufgabe_aktiv', joined: true, name: 'Anna',
  group: { name: 'Team Nord', members: ['Anna', 'Ben'] }, letters: [],
  word_completed: true, word_outcome: 'solved', solved: { rank: 1 }, leader: false,
  tasks, server_now_ms: NOW, game_deadline_ms: null, ...over,
});

test('TST-U-035: Cluster zeigt erledigte Aufgaben im Format erledigt/Gesamtzahl', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), {}, NOW);
  assert.equal(root.querySelector('[data-category="Wissen"]').textContent, 'Wissen (1/2 erledigt)');
});

test('TST-U-035: Schwierigkeits-Tags enthalten Text und passende Farbklasse in der Uebersicht', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), {}, NOW);
  const tags = [...root.querySelectorAll('.difficulty-tag')];
  assert.deepEqual(tags.map((tag) => tag.textContent), ['Leicht', 'Schwer']);
  assert.ok(tags[0].classList.contains('difficulty-leicht'));
  assert.ok(tags[1].classList.contains('difficulty-schwer'));
});

test('TST-U-035: Schwierigkeits-Tag bleibt auch in der Aufgaben-Einzelansicht sichtbar', () => {
  const root = makeRoot();
  renderPlayer(root, playerState({
    leader: true, openTaskId: 'b',
    tasks: tasks.map((task) => task.id === 'b' ? { ...task, started: true } : task),
  }), {}, NOW);
  const tag = root.querySelector('.task-difficulty .difficulty-tag');
  assert.equal(tag.textContent, 'Schwer');
  assert.ok(tag.classList.contains('difficulty-schwer'));
});

test('TST-S-043: Beamer zeigt Namen in Klammern und aktuelle Punkte vor Spielende', () => {
  const root = makeRoot();
  renderBeamer(root, {
    ok: true, phase: 'wortaufgabe_aktiv', finished: false, participants_count: 2,
    groups: [{ name: 'Team Nord', members: ['Anna', 'Ben'], solved: true, word_completed: true }],
    ranking: [{ group: 'Team Nord', rank: 1, points: 14 }],
  }, NOW);
  const row = root.querySelector('.ranking li');
  assert.match(row.querySelector('.rname').textContent, /Team Nord \(Anna, Ben\)/);
  assert.equal(row.querySelector('.pts').textContent, '14 Pkt.');
  assert.doesNotMatch(textOf(root), /Gruppe komplett/);
});

test('TST-U-035: Jeder angemeldete Spieler kann die reine Beamer-Ansicht auf einem neuen Tab oeffnen', () => {
  const root = makeRoot();
  renderPlayer(root, playerState({ word_completed: false, solved: null }), {}, NOW);
  const link = root.querySelector('a[href="beamer.html?mode=player"]');
  assert.ok(link);
  assert.equal(link.getAttribute('target'), '_blank');
  assert.equal(link.getAttribute('rel'), 'noopener');
});

test('TST-U-036: Antwort-Rueckmeldung ist fuer Wort und Folgeaufgaben auf eine Sekunde gesetzt', () => {
  assert.equal(ANSWER_FEEDBACK_MS, 1000);
});
