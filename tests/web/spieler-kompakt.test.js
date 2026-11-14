import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf, submitOrClick, findButton } from './dom-helper.js';
import { renderPlayer, renderAdmin } from '../../web/js/views.js';

const state = (overrides = {}) => ({
  ok: true, joined: true, phase: 'wortaufgabe_aktiv', name: 'Gast A',
  group: { name: 'Testgruppe', members: ['Gast A', 'Gast B', 'Gast C', 'Gast D'] },
  letters: ['Q', 'Y'], solved: null, leader: false,
  tasks: [{ id: 'test', title: 'Testaufgabe', category: 'Testkategorie', kind: 'exact',
    available: true, started: true, submitted: false, attempts_used: 1, attempts_remaining: 2, max_attempts: 3 }],
  ...overrides,
  ...(overrides.solved && overrides.word_completed === undefined ? { word_completed: true, word_outcome: 'solved' } : {}),
});

test('TST-U-026: Gruppenübersicht hat große Überschrift und alle beschrifteten Mitglieder', () => {
  const root = makeRoot();
  renderPlayer(root, state());
  assert.equal(root.querySelector('.player-group-name').textContent, 'Testgruppe');
  assert.ok(root.querySelector('.player-overview'));
  const members = root.querySelector('.members');
  assert.equal(members.getAttribute('aria-label'), 'Mitglieder eurer Gruppe');
  assert.deepEqual([...members.children].map(x => x.textContent), state().group.members);
  assert.equal(members.querySelector('.me').textContent, 'Gast A');
});

test('TST-U-026: Ungelöste Wortaufgabe bleibt vollständig und bedienbar', () => {
  const root = makeRoot();
  const calls = [];
  renderPlayer(root, state({ feedback: { scope: 'wort', kind: 'wrong', text: 'Erneut versuchen' } }),
    { onSubmit: value => calls.push(value) });
  assert.deepEqual([...root.querySelectorAll('.letter')].map(x => x.textContent), ['Q', 'Y']);
  assert.match(textOf(root), /Findet eure Gruppenmitglieder/);
  assert.match(textOf(root), /Erneut versuchen/);
  submitOrClick(root, findButton(root, /Wort senden/), root.querySelector('[name=answer]'), 'Testeingabe');
  assert.deepEqual(calls, ['Testeingabe']);
});

for (const leader of [true, false]) {
  test(`TST-U-026: Gelöstes Wort entfernt Aufgabenbereich, Mitglieder/Ergebnis bleiben (Leader ${leader})`, () => {
    const root = makeRoot();
    renderPlayer(root, state({ solved: { rank: 2 }, leader, leader_name: 'Gast A' }));
    assert.equal(root.querySelector('.letters'), null);
    assert.equal(root.querySelector('[name=answer]'), null);
    assert.doesNotMatch(textOf(root), /Deine Buchstaben|Findet eure Gruppenmitglieder|Euer Lösungswort|Wort senden/);
    assert.equal(root.querySelectorAll('.members li').length, 4);
    assert.match(textOf(root), /Wort gelöst! Vorläufig Platz 2/);
    assert.match(textOf(root), /Testaufgabe/);
    assert.match(textOf(root), /Noch 2 Versuche/);
    assert.equal(root.querySelectorAll('[data-open]').length, leader ? 1 : 0);
  });
}

test('TST-U-026: Lösung durch anderes Mitglied entfernt alten Wort-DOM auch mit Buchstaben im State', () => {
  const root = makeRoot();
  renderPlayer(root, state());
  const letters = root.querySelector('.letters');
  const answer = root.querySelector('[name=answer]');
  answer.value = 'Ungesendeter Entwurf';
  renderPlayer(root, state({ solved: { rank: 3 } }));
  assert.equal(letters.isConnected, false);
  assert.equal(answer.isConnected, false);
  assert.equal(root.querySelector('.letters'), null);
  assert.equal(root.querySelector('[name=answer]'), null);
  assert.equal(root.querySelectorAll('.members li').length, 4);
});

test('TST-U-026: Polling erhält Worteingabe, Fokus und Auswahl vor Lösung', () => {
  const root = makeRoot();
  renderPlayer(root, state());
  const input = root.querySelector('[name=answer]');
  input.value = 'Testentwurf';
  input.focus();
  input.setSelectionRange(2, 6);
  renderPlayer(root, state());
  assert.equal(root.querySelector('[name=answer]'), input);
  assert.equal(input.value, 'Testentwurf');
  assert.equal(root.ownerDocument.activeElement, input);
  assert.deepEqual([input.selectionStart, input.selectionEnd], [2, 6]);
});

test('TST-U-026: Aufgabenwahl und Einzelansicht behalten ihre Berechtigungen und Darstellung', () => {
  const root = makeRoot();
  const opened = [];
  const solved = state({ solved: { rank: 1 }, leader: true });
  renderPlayer(root, solved, { onOpenTask: id => opened.push(id) });
  root.querySelector('[data-open=test]').click();
  assert.deepEqual(opened, ['test']);
  renderPlayer(root, { ...solved, openTaskId: 'test' });
  assert.equal(root.querySelector('.player-overview'), null);
  assert.ok(root.querySelector('[name=task-test]'));
  assert.match(textOf(root), /Versuch 2 von 3/);
});

test('TST-U-026: Login und Admin werden nicht als kompakte Spielerübersicht markiert', () => {
  const root = makeRoot();
  renderPlayer(root, { phase: 'vorbereitet', joined: false });
  assert.equal(root.querySelector('.player-overview'), null);
  renderAdmin(root, { phase: 'vorbereitet', players: [], groups: [], tasks: [] }, {});
  assert.equal(root.querySelector('.player-overview'), null);
});
