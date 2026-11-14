import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf, findButton, doc } from './dom-helper.js';

const { renderAdmin, clearDrafts } = await import('../../web/js/views.js');
const { roundPreparation, taskPreparation } = await import('../../web/js/preparation.js');

// TST-U-027 / SWA-041..043: zentrale Vorbereitung im Admin
const NOW = 1_000_000;
const SCHEDULES = {
  leicht: [5, 4, 3, 2, 2, 1, 1, 1, 1],
  mittel: [10, 8, 6, 5, 4, 3, 2, 1, 1],
  schwer: [20, 16, 12, 10, 8, 6, 4, 2, 2],
};
const TASKS = [
  { id: 'alpha', category: 'Denksport', title: 'Alpha', kind: 'exact', body: 'Text A', image_url: 'a.svg', solution: 'AAA', difficulty: 'leicht', available: true },
  { id: 'beta', category: 'Denksport', title: 'Beta', kind: 'exact', body: 'Text B', image_url: null, solution: 'BBB', difficulty: 'mittel', available: true },
];
const overview = (over = {}) => ({
  ok: true, phase: 'vorbereitet', deadline_ms: null, server_now_ms: 0, fetchedAtMs: NOW,
  group_min: 4, group_max: 6, game_minutes: 25, word_difficulty: 'mittel', point_schedules: SCHEDULES,
  words: ['ZEBRA', 'PIXEL', 'QUADER', 'MELON'], automatic_end_ready: false,
  players: [], groups: [], ranking: [], tasks: TASKS, totals: [], ...over,
});
const handlers = () => {
  const calls = [];
  const h = {};
  for (const n of ['onStart', 'onClose', 'onForm', 'onFinish', 'onReset', 'onBeamer', 'onSetTask', 'onSetGroupSize',
    'onSetGameConfig', 'onSetWords', 'onSelectAdminTab', 'onExport']) h[n] = (...a) => calls.push([n, ...a]);
  return { h, calls };
};
const panel = (root, key) => {
  const tab = [...root.querySelectorAll('[role="tab"]')].find((t) => t.getAttribute('data-tab') === key || t.id.endsWith(key));
  return root.querySelector(`[id="${tab.getAttribute('aria-controls')}"]`);
};
const field = (root, name) => root.querySelector(`[name="${name}"]`);

test('Vorbereitung: Gruppengroesse, Spielzeit, Schwierigkeit und 27 Punktefelder mit Werten der Konfiguration', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ game_minutes: 33, word_difficulty: 'schwer' }), handlers().h, NOW);
  const p = panel(root, 'vorbereitung');
  assert.ok(p, 'Vorbereitungs-Panel');
  for (const n of ['gmin', 'gmax', 'game-minutes', 'word-difficulty', 'words', 'seconds']) assert.ok(p.querySelector(`[name="${n}"]`), n);
  assert.equal(field(root, 'gmin').value, '4');
  assert.equal(field(root, 'gmax').value, '6');
  assert.equal(field(root, 'game-minutes').value, '33');
  assert.equal(field(root, 'word-difficulty').tagName, 'SELECT');
  assert.equal(field(root, 'word-difficulty').value, 'schwer');
  assert.deepEqual([...field(root, 'word-difficulty').options].map((o) => o.value), ['leicht', 'mittel', 'schwer']);
  for (const [d, arr] of Object.entries(SCHEDULES)) {
    arr.forEach((v, i) => assert.equal(field(root, `points-${d}-${i + 1}`).value, String(v), `${d} ${i + 1}`));
  }
  assert.equal(p.querySelectorAll('[name^="points-"]').length, 27);
  assert.equal(field(root, 'words').tagName, 'TEXTAREA');
  assert.match(field(root, 'words').value, /ZEBRA/);
  assert.ok(p.querySelector('input[type="file"]'), 'Dateiimport fuer Woerter');
});

test('Vorbereitung: Aufgabenfelder mit Schwierigkeit je Aufgabe, Speichern ueber data-action save-<id>', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview(), h, NOW);
  const p = panel(root, 'vorbereitung');
  for (const id of ['alpha', 'beta']) {
    for (const f of ['title', 'body', 'image', 'solution', 'difficulty']) assert.ok(p.querySelector(`[name="t-${id}-${f}"]`), `${id} ${f}`);
  }
  assert.equal(field(root, 't-alpha-difficulty').tagName, 'SELECT');
  assert.equal(field(root, 't-alpha-difficulty').value, 'leicht');
  assert.equal(field(root, 't-beta-difficulty').value, 'mittel');
  field(root, 't-beta-difficulty').value = 'schwer';
  field(root, 't-beta-title').value = 'Beta neu';
  root.querySelector('[data-action="save-beta"]').click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'onSetTask');
  assert.equal(calls[0][1], 'beta');
  assert.equal(calls[0][2].difficulty, 'schwer');
  assert.equal(calls[0][2].title, 'Beta neu');
});

test('Vorbereitung: set-size meldet Groessen, set-game Minuten, Schwierigkeit und Staffeln', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview(), h, NOW);
  field(root, 'gmin').value = '3';
  field(root, 'gmax').value = '5';
  root.querySelector('[data-action="set-size"]').click();
  assert.equal(calls[0][0], 'onSetGroupSize');
  assert.deepEqual(calls[0].slice(1).map(Number), [3, 5]);
  calls.length = 0;
  field(root, 'game-minutes').value = '40';
  field(root, 'word-difficulty').value = 'leicht';
  field(root, 'points-schwer-9').value = '1';
  root.querySelector('[data-action="set-game"]').click();
  assert.equal(calls.length, 1);
  const [name, minutes, difficulty, schedules] = calls[0];
  assert.equal(name, 'onSetGameConfig');
  assert.equal(Number(minutes), 40);
  assert.equal(difficulty, 'leicht');
  assert.deepEqual(Object.keys(schedules).sort(), ['leicht', 'mittel', 'schwer']);
  assert.deepEqual(schedules.leicht, SCHEDULES.leicht);
  assert.deepEqual(schedules.mittel, SCHEDULES.mittel);
  assert.deepEqual(schedules.schwer, [20, 16, 12, 10, 8, 6, 4, 2, 1]);
  assert.ok(schedules.schwer.every((v) => typeof v === 'number'), 'Zahlen, keine Texte');
});

test('Vorbereitung: set-words liefert ein Array aus Zeilen (ein Wort pro Zeile, Leerzeilen und Raender entfallen)', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview(), h, NOW);
  field(root, 'words').value = 'zebra\npixel \r\n\r\n  quader\r\nmelon\r\n';
  root.querySelector('[data-action="set-words"]').click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'onSetWords');
  assert.ok(Array.isArray(calls[0][1]));
  assert.deepEqual(calls[0][1].map((w) => w.toUpperCase()), ['ZEBRA', 'PIXEL', 'QUADER', 'MELON']);
});

test('Aufgaben-Tab ist eine schreibgeschuetzte Kartenansicht ohne Eingabefelder', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'aufgaben' }), handlers().h, NOW);
  const p = panel(root, 'aufgaben');
  assert.equal(p.querySelectorAll('input, textarea, select').length, 0);
  assert.match(textOf(p), /Alpha/);
  assert.match(textOf(p), /Beta/);
  assert.equal(p.querySelector('[data-action^="save-"]'), null);
});

test('Entwuerfe: Select und Felder bleiben bei Neuzeichnung, ohne Entwurf folgt der Wert der Konfiguration', () => {
  const root = makeRoot();
  renderAdmin(root, overview(), handlers().h, NOW);
  const sel = field(root, 'word-difficulty');
  const minutes = field(root, 'game-minutes');
  sel.value = 'schwer';
  sel.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  sel.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true }));
  minutes.value = '12';
  minutes.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  renderAdmin(root, overview({ game_minutes: 30, word_difficulty: 'leicht' }), handlers().h, NOW + 1000);
  assert.equal(field(root, 'word-difficulty'), sel, 'gleiches Element');
  assert.equal(sel.value, 'schwer');
  assert.equal(field(root, 'game-minutes').value, '12');
  const fresh = makeRoot();
  renderAdmin(fresh, overview(), handlers().h, NOW);
  renderAdmin(fresh, overview({ game_minutes: 30, word_difficulty: 'leicht' }), handlers().h, NOW + 1000);
  assert.equal(field(fresh, 'game-minutes').value, '30');
  assert.equal(field(fresh, 'word-difficulty').value, 'leicht');
});

test('clearDrafts verwirft gezielt nur die genannten Felder', () => {
  const root = makeRoot();
  renderAdmin(root, overview(), handlers().h, NOW);
  for (const [n, v] of [['game-minutes', '12'], ['gmin', '5']]) {
    const f = field(root, n);
    f.value = v;
    f.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  }
  clearDrafts(root, ['game-minutes']);
  renderAdmin(root, overview({ game_minutes: 31, group_min: 4 }), handlers().h, NOW + 1000);
  assert.equal(field(root, 'game-minutes').value, '31', 'verworfen -> Konfigurationswert');
  assert.equal(field(root, 'gmin').value, '5', 'anderer Entwurf bleibt');
});

test('Steuerung: Beamer-Schalter bleibt, Export erst nach dem Spielende, Aktionen unveraendert', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'steuerung' }), h, NOW);
  findButton(root, /Beamer/i).click();
  assert.deepEqual(calls.map((c) => c[0]), ['onBeamer']);
  assert.equal(findButton(root, /Export|CSV/i), undefined, 'vor Spielende kein Export');
  const done = makeRoot();
  renderAdmin(done, overview({ phase: 'aufgabe_abgeschlossen', finished: true }), h, NOW);
  const exp = findButton(done, /Export|CSV/i);
  assert.ok(exp, 'Export nach Spielende');
  calls.length = 0;
  exp.click();
  assert.equal(calls[0][0], 'onExport');
});

// ---- roundPreparation (UNA-027)
const joined = (r) => r.join(' | ');

test('roundPreparation: Liste von Texten, vollstaendige Vorbereitung ohne Hinweis auf fehlende Woerter', () => {
  const r = roundPreparation(overview({ automatic_end_ready: true }));
  assert.ok(Array.isArray(r));
  assert.ok(r.every((s) => typeof s === 'string' && s.trim().length > 0));
  assert.ok(!/gesperrt|Startsperre|nicht starten/i.test(joined(r)), 'keine pauschale Startsperre');
});

test('roundPreparation: leere oder zu kurze Wortliste wird gemeldet', () => {
  const ok = roundPreparation(overview());
  const none = roundPreparation(overview({ words: [] }));
  assert.ok(none.length > ok.length || joined(none) !== joined(ok));
  assert.match(joined(none), /Wör?t|Wort/);
  const tiny = roundPreparation(overview({ words: ['AB'], group_min: 4, group_max: 6 }));
  assert.match(joined(tiny), /Wör?t|Wort/);
});

test('roundPreparation: automatisches Ende nicht bereit wird ausdruecklich genannt, bereit nicht', () => {
  const off = roundPreparation(overview({ automatic_end_ready: false }));
  const on = roundPreparation(overview({ automatic_end_ready: true }));
  assert.match(joined(off), /automatisch/i);
  assert.ok(!/automatisch/i.test(joined(on)));
});

test('roundPreparation: unfertige Aufgaben und ungueltige Groesse werden gemeldet', () => {
  const base = roundPreparation(overview({ automatic_end_ready: true }));
  const broken = roundPreparation(overview({
    automatic_end_ready: true,
    tasks: [{ ...TASKS[0], solution: '' }, TASKS[1]],
  }));
  assert.ok(broken.length > base.length, 'fehlende Loesung wird gemeldet');
  const size = roundPreparation(overview({ automatic_end_ready: true, group_min: 6, group_max: 4 }));
  assert.ok(size.length > base.length, 'ungueltige Gruppengroesse wird gemeldet');
  assert.equal(typeof taskPreparation, 'function', 'taskPreparation bleibt');
});

test('roundPreparation: Hinweise erscheinen im Vorbereitungs-Panel', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ words: [], automatic_end_ready: false }), handlers().h, NOW);
  const t = textOf(panel(root, 'vorbereitung'));
  assert.match(t, /automatisch/i);
});

test('Verbindungsausfall: Vorbereitung behauptet weder Bereitschaft noch Erfolg, Entwuerfe bleiben', () => {
  const root = makeRoot();
  const { h } = handlers();
  renderAdmin(root, overview(), h, NOW);
  field(root, 'words').value = 'ENTWURF';
  renderAdmin(root, overview({ connectionLost: true }), h, NOW + 1000);
  const t = textOf(root);
  assert.doesNotMatch(t, /Bereit zum Start/);
  assert.ok(!root.querySelector('.message.success'), 'keine Erfolgsmeldung');
  assert.match(t, /Verbindung/i);
  assert.equal(field(root, 'words').value, 'ENTWURF');
  renderAdmin(root, overview(), h, NOW + 2000);
  assert.equal(field(root, 'words').value, 'ENTWURF', 'Entwurf bleibt nach Wiederverbindung');
});
