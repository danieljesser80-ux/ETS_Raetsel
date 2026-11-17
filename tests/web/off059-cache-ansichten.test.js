import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, findButton } from './dom-helper.js';
import { stateKey, createConfigCache } from '../../web/js/clientcache.js';

const { renderPlayer, renderAdmin } = await import('../../web/js/views.js');
const NOW = 1_000_000;

// TST-U-030 (UNA-035)
test('TST-U-030: stateKey ignoriert Zeitfelder und erkennt fachliche Aenderungen', () => {
  const a = { phase: 'x', server_now_ms: 1, fetchedAtMs: 5, tasks: [{ id: 1, server_now_ms: 3 }] };
  assert.equal(stateKey(a), stateKey({ ...a, server_now_ms: 99, fetchedAtMs: 77, tasks: [{ id: 1, server_now_ms: 4 }] }));
  assert.notEqual(stateKey(a), stateKey({ ...a, phase: 'y' }));
  assert.notEqual(stateKey(a), stateKey({ ...a, tasks: [{ id: 2 }] }));
  assert.notEqual(stateKey(a, 'p'), stateKey(a, 'q'));
});

// TST-U-031 (UNA-036)
test('TST-U-031: Konfigurations-Cache: Revision, config_unchanged, Antwortzaehler, Verwerfen', () => {
  const cache = createConfigCache();
  assert.equal(cache.rev(), null);
  assert.equal(cache.merge({ ok: true, config_rev: 3, config_unchanged: true, task_answers: {} }), null, 'ohne Cache nachladen');
  const full = {
    ok: true, config_rev: 3, config_unchanged: false, words: ['A'], point_schedules: { leicht: [1] },
    tasks: [{ id: 't1', title: 'T' }], task_answers: { t1: 2 }, phase: 'vorbereitet',
  };
  const m1 = cache.merge(full);
  assert.equal(cache.rev(), 3);
  assert.equal(m1.tasks[0].answers, 2);
  assert.ok(!('config_unchanged' in m1) && !('task_answers' in m1));
  const m2 = cache.merge({ ok: true, config_rev: 3, config_unchanged: true, task_answers: { t1: 5 }, phase: 'anmeldung' });
  assert.equal(m2.phase, 'anmeldung');
  assert.deepEqual(m2.words, ['A']);
  assert.equal(m2.tasks[0].answers, 5);
  assert.equal(cache.merge({ ok: true, config_rev: 4, config_unchanged: true, task_answers: {} }), null, 'abweichende Revision');
  assert.equal(cache.rev(), null, 'Cache verworfen');
  cache.merge(full);
  cache.clear();
  assert.equal(cache.rev(), null);
  assert.deepEqual(cache.merge({ ok: false, reason: 'x' }), { ok: false, reason: 'x' });
});

// TST-S-042 / TST-U-034 (SWA-053/057, UNA-040)
const taskState = (tasks) => ({
  ok: true, phase: 'wortaufgabe_aktiv', server_now_ms: 0, fetchedAtMs: NOW, joined: true, name: 'Anna', leader: true,
  group: { name: 'G', members: ['Anna'] }, letters: [], solved: { rank: 1 }, word_completed: true, word_outcome: 'solved', tasks,
});
const T = (id, category, extra = {}) => ({ id, category, title: id, kind: 'exact', available: true, started: false, submitted: false, ...extra });

test('TST-U-034: Kategorien sind eingeklappt, gruppiert nach erstem Auftreten, mit ARIA', () => {
  const root = makeRoot();
  renderPlayer(root, taskState([T('a', 'Eins'), T('b', 'Zwei'), T('c', 'Eins')]), {}, NOW);
  const toggles = [...root.querySelectorAll('button.category-toggle')];
  assert.deepEqual(toggles.map((b) => b.dataset.category), ['Eins', 'Zwei']);
  assert.match(toggles[0].textContent, /Eins \(0\/2\)/);
  for (const b of toggles) {
    assert.equal(b.getAttribute('aria-expanded'), 'false');
    const panel = root.ownerDocument.getElementById(b.getAttribute('aria-controls'));
    assert.ok(panel.hidden);
  }
  assert.equal(root.querySelector('#task-category-0').querySelectorAll('[data-task]').length, 2);
});

test('TST-U-034: Klick klappt auf/zu, Zustand bleibt nach erneutem Zeichnen erhalten', () => {
  const root = makeRoot();
  for (const stale of [...root.ownerDocument.body.children]) if (stale !== root) stale.remove();
  const s = taskState([T('a', 'Offen'), T('b', 'Zu')]);
  renderPlayer(root, s, {}, NOW);
  const toggle = root.querySelector('button[data-category="Offen"]');
  toggle.click();
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(!root.querySelector('#task-category-0').hidden);
  assert.ok(root.querySelector('#task-category-1').hidden);
  renderPlayer(root, { ...s, server_now_ms: 5000 }, {}, NOW + 5000);
  const again = root.querySelector('button[data-category="Offen"]');
  assert.equal(again.getAttribute('aria-expanded'), 'true');
  assert.ok(!root.querySelector('#task-category-0').hidden);
  again.click();
  assert.equal(again.getAttribute('aria-expanded'), 'false');
  assert.ok(root.querySelector('#task-category-0').hidden);
});

test('TST-U-034: Kategorie-Schalter ist ein echter Button (Tastatur) und liegt in einer Ueberschrift', () => {
  const root = makeRoot();
  renderPlayer(root, taskState([T('a', 'Tastatur')]), {}, NOW);
  const b = root.querySelector('button[data-category="Tastatur"]');
  assert.equal(b.type, 'button');
  assert.equal(b.parentElement.tagName, 'H3');
  assert.equal(b.getAttribute('aria-controls'), root.querySelector('.category-panel').id);
});

// TST-U-033 (UNA-039): Import-UI
const adminOv = (over = {}) => ({
  ok: true, phase: 'vorbereitet', deadline_ms: null, server_now_ms: 0, fetchedAtMs: NOW, players: [], groups: [], ranking: [], tasks: [], ...over,
});

test('TST-U-033: Import-UI zeigt Fehler, Warnungen, Zaehlung und Buttons je nach Vorschau', () => {
  const root = makeRoot();
  const calls = [];
  const h = { onImportApply: () => calls.push('apply'), onImportCancel: () => calls.push('cancel') };
  renderAdmin(root, adminOv(), h, NOW);
  assert.ok(root.querySelector('input[type=file]'));
  assert.ok(!findButton(root, /übernehmen/));
  renderAdmin(root, adminOv({ importPreview: {
    errors: [{ line: 4, message: 'kaputt' }], warnings: [{ task: 'x', message: 'Keine Lösung' }],
    counts: { new: 1, replaced: 2, removed: 3, unready: 4 }, canApply: false,
  } }), h, NOW);
  assert.match(root.textContent, /Zeile 4: kaputt/);
  assert.match(root.textContent, /x: Keine Lösung/);
  assert.match(root.querySelector('[data-import-counts]').textContent, /1 neu, 2 ersetzt, 3 entfernt, 4 nicht spielbar/);
  assert.ok(findButton(root, /übernehmen/).disabled, 'mit Fehlern nicht uebernehmbar');
  renderAdmin(root, adminOv({ importPreview: { errors: [], warnings: [], counts: { new: 1, replaced: 0, removed: 0, unready: 0 }, canApply: true } }), h, NOW);
  findButton(root, /übernehmen/).click();
  findButton(root, /verwerfen/).click();
  assert.deepEqual(calls, ['apply', 'cancel']);
});

test('TST-U-033: Import ist ausserhalb von Vorbereitung/Anmeldung gesperrt', () => {
  const root = makeRoot();
  renderAdmin(root, adminOv({ phase: 'wortaufgabe_aktiv', importPreview: { errors: [], warnings: [], counts: { new: 0, replaced: 0, removed: 0, unready: 0 }, canApply: true } }), {}, NOW);
  assert.ok(root.querySelector('input[type=file]').disabled);
  assert.ok(findButton(root, /übernehmen/).disabled);
});
