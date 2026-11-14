import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import { makeRoot, textOf, findButton, doc } from './dom-helper.js';

const { renderAdmin } = await import('../../web/js/views.js');
const loadQr = () => import('../../web/js/qr.js');
const require = createRequire(import.meta.url);

const NOW = 1_000_000;
const KEYS = ['steuerung', 'vorbereitung', 'teilnehmer', 'gruppen', 'rangliste', 'aufgaben', 'wertung'];
const PAGES = 'https://beispiel.example/ETS_Raetsel/';
const TARGET = 'https://beispiel.example/ETS_Raetsel/index.html';
const OPTIONS = { width: 360, margin: 4, errorCorrectionLevel: 'M' };
const FAKE_PNG = 'data:image/png;base64,iVBORw0KGgo=';

// ---- Desktop-Admin (UNA-024)
const TASKS = [
  { id: 'alpha', category: 'Denksport', title: 'Alpha', kind: 'exact', body: 'Text A', image_url: null, solution: 'AAA', available: true },
  { id: 'beta', category: 'Denksport', title: 'Beta', kind: 'exact', body: 'Text B', image_url: null, solution: 'BBB', available: true },
];
const GROUPS = [{ name: 'Testgruppe', members: ['Anna', 'Ben'], solved: true, details: [
  { title: 'Gruppenwort', kind: 'word', answer: 'WORT', correct: true, duration_ms: 61000 },
] }];
const overview = (over = {}) => ({
  ok: true, phase: 'anmeldung', deadline_ms: 300_000, server_now_ms: 0, fetchedAtMs: NOW,
  group_min: 3, group_max: 5, players: [{ name: 'Anna', group: null }], groups: GROUPS, ranking: [],
  tasks: TASKS, totals: [], ...over,
});
const handlers = () => {
  const calls = [];
  const h = {};
  for (const n of ['onStart', 'onClose', 'onForm', 'onFinish', 'onReset', 'onBeamer', 'onSetTask',
    'onSetGroupSize', 'onSelectGroup', 'onBackFromGroup', 'onSelectAdminTab']) {
    h[n] = (...a) => calls.push([n, ...a]);
  }
  return { h, calls };
};
const tabs = (root) => [...root.querySelectorAll('[role="tab"]')];
const panels = (root) => [...root.querySelectorAll('[role="tabpanel"]')];
const visiblePanels = (root) => panels(root).filter((p) => !p.hidden && !p.hasAttribute('hidden'));
const panelOf = (root, element) => element.closest('[role="tabpanel"]');
const key = (tab, name) => tab.dispatchEvent(new doc.defaultView.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));

test('TST-U-024: sieben Tabs mit ARIA-Verknüpfung, Standard steuerung, alle Panels im DOM', () => {
  const root = makeRoot();
  renderAdmin(root, overview(), handlers().h, NOW);
  const t = tabs(root);
  assert.equal(t.length, 7);
  assert.ok(t.every((b) => b.tagName === 'BUTTON'));
  assert.ok(root.querySelector('[role="tablist"]'));
  assert.equal(panels(root).length, 7);
  assert.deepEqual(t.map((b) => b.getAttribute('aria-selected')), ['true', 'false', 'false', 'false', 'false', 'false', 'false']);
  const ids = new Set();
  t.forEach((b, i) => {
    assert.ok(b.id, 'Tab hat ID');
    ids.add(b.id);
    const panel = root.querySelector(`[id="${b.getAttribute('aria-controls')}"]`);
    assert.ok(panel, `Panel ${KEYS[i]}`);
    assert.equal(panel.getAttribute('role'), 'tabpanel');
    assert.equal(panel.getAttribute('aria-labelledby'), b.id);
    assert.ok(textOf(b).length > 0);
  });
  assert.equal(ids.size, 7);
  assert.equal(visiblePanels(root).length, 1);
  assert.equal(visiblePanels(root)[0].getAttribute('aria-labelledby'), t[0].id);
});

test('TST-U-024: adminTab wählt genau ein sichtbares Panel; Status bleibt für jeden Tab sichtbar', () => {
  KEYS.forEach((name, i) => {
    const root = makeRoot();
    renderAdmin(root, overview({ adminTab: name }), handlers().h, NOW);
    const t = tabs(root);
    assert.deepEqual(t.map((b) => b.getAttribute('aria-selected')), KEYS.map((_, j) => String(i === j)));
    assert.equal(panels(root).length, 7);
    const visible = visiblePanels(root);
    assert.equal(visible.length, 1);
    assert.equal(visible[0].getAttribute('aria-labelledby'), t[i].id);
    const rest = root.cloneNode(true);
    rest.querySelectorAll('[role="tabpanel"], [hidden]').forEach((n) => n.remove());
    assert.match(textOf(rest), /5:00/, `Status außerhalb der Panels bei ${name}`);
  });
});

test('TST-U-024: Klick und Tastatur melden den Schlüssel an onSelectAdminTab', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'rangliste' }), h, NOW);
  const t = tabs(root);
  t.forEach((b) => b.click());
  assert.deepEqual(calls.map((c) => c[0]), Array(7).fill('onSelectAdminTab'));
  assert.deepEqual(calls.map((c) => c[1]), KEYS);
  calls.length = 0;
  key(t[3], 'ArrowRight');
  key(t[3], 'ArrowLeft');
  key(t[3], 'Home');
  key(t[3], 'End');
  key(t[6], 'ArrowRight');
  key(t[0], 'ArrowLeft');
  assert.deepEqual(calls, [
    ['onSelectAdminTab', 'rangliste'], ['onSelectAdminTab', 'teilnehmer'], ['onSelectAdminTab', 'steuerung'],
    ['onSelectAdminTab', 'wertung'], ['onSelectAdminTab', 'steuerung'], ['onSelectAdminTab', 'wertung'],
  ]);
});

test('TST-U-024: Tab gehört nicht zum Ansichtsschlüssel; Eingaben, Panels und Selektion bleiben', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'aufgaben' }), handlers().h, NOW);
  const title = root.querySelector('input[name="t-alpha-title"]');
  const solution = root.querySelector('input[name="t-beta-solution"]');
  const panel = panelOf(root, title);
  assert.ok(panel);
  panel.marker = 'stabil';
  title.value = 'Entwurf';
  title.setSelectionRange(1, 3);
  solution.value = '';
  const seconds = root.querySelector('input[name="seconds"]');
  const gmin = root.querySelector('input[name="gmin"]');
  gmin.value = '4';
  for (const [i, name] of ['wertung', 'steuerung', 'aufgaben'].entries()) {
    renderAdmin(root, overview({ adminTab: name, players: [{ name: `P${i}`, group: null }] }), handlers().h, NOW + 1000 * (i + 1));
    assert.equal(root.querySelector('input[name="t-alpha-title"]'), title, 'gleiches Element');
    assert.equal(root.querySelector('input[name="t-beta-solution"]'), solution);
    assert.equal(root.querySelector('input[name="seconds"]'), seconds);
    assert.equal(root.querySelector('input[name="gmin"]'), gmin);
    assert.equal(panelOf(root, title), panel);
    assert.equal(panel.marker, 'stabil');
    assert.equal(title.value, 'Entwurf');
    assert.equal(title.selectionStart, 1);
    assert.equal(title.selectionEnd, 3);
    assert.equal(solution.value, '', 'geleerter Entwurf bleibt leer');
    assert.equal(gmin.value, '4');
    assert.equal(panels(root).length, 7);
    assert.equal(visiblePanels(root).length, 1);
  }
});

test('TST-U-024: Alle bisherigen Felder und Aktionen bleiben vorhanden', () => {
  const root = makeRoot();
  renderAdmin(root, overview({
    tasks: [{ id: 'wahl', category: 'Schätzquiz', title: 'Wahl', kind: 'estimate', needs_choice: true, body: '',
      image_url: null, solution: '10', options: ['A', 'B', 'C', 'D'], correct_option: 'B', available: true }, ...TASKS],
  }), handlers().h, NOW);
  for (const name of ['seconds', 'gmin', 'gmax', 't-alpha-title', 't-alpha-body', 't-alpha-image', 't-alpha-solution', 't-alpha-difficulty',
    't-wahl-opt1', 't-wahl-opt2', 't-wahl-opt3', 't-wahl-opt4', 't-wahl-correct']) {
    assert.ok(root.querySelector(`[name="${name}"]`), name);
  }
  assert.ok(root.querySelectorAll('[data-action]').length > 0);
  for (const re of [/Anmeldung (starten|erneut)/, /Anmeldung schließen/, /Gruppen einteilen/, /Spiele beenden/,
    /zurücksetzen/, /Größe speichern/]) {
    assert.ok(findButton(root, re), String(re));
  }
});

test('TST-U-024: Speichern liest aktuelle DOM-Felder auch im inaktiven Panel nach Neuzeichnung', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'aufgaben' }), handlers().h, NOW);
  root.querySelector('input[name="t-beta-title"]').value = 'Beta neu';
  root.querySelector('input[name="t-beta-solution"]').value = 'ZZZ';
  const next = handlers();
  renderAdmin(root, overview({ adminTab: 'steuerung', players: [] }), next.h, NOW + 1000);
  const saves = [...root.querySelectorAll('button')].filter((b) => /^Speichern$/.test(b.textContent.trim()));
  saves[1].click();
  assert.equal(next.calls.length, 1);
  assert.equal(next.calls[0][0], 'onSetTask');
  assert.equal(next.calls[0][1], 'beta');
  assert.equal(next.calls[0][2].title, 'Beta neu');
  assert.equal(next.calls[0][2].solution, 'ZZZ');
});

test('TST-U-024: Gruppendetail mit Tabelle, internem Wrapper und Zurück bleibt erhalten', () => {
  const { h, calls } = handlers();
  const root = makeRoot();
  renderAdmin(root, overview({ adminTab: 'gruppen', phase: 'wortaufgabe_aktiv', selectedGroup: 'Testgruppe' }), h, NOW);
  const detail = root.querySelector('[data-group-detail]');
  assert.ok(detail);
  const table = detail.querySelector('table');
  assert.ok(table);
  assert.notEqual(table.parentElement, detail, 'Tabelle liegt in eigenem Wrapper');
  assert.ok(detail.contains(table.parentElement));
  assert.match(textOf(detail), /WORT/);
  detail.querySelector('[data-action="back"]').click();
  assert.deepEqual(calls, [['onBackFromGroup']]);
});

test('TST-U-024: Seitenrahmen für Admin, Anleitung und Präsentation', () => {
  const load = (name) => new JSDOM(readFileSync(new URL(`../../web/${name}`, import.meta.url), 'utf8')).window.document;
  const admin = load('admin.html');
  assert.ok(admin.body.classList.contains('admin-page'));
  assert.ok(admin.querySelector('main.admin-main'));
  assert.ok(load('erklaerung.html').body.classList.contains('guide-page'));
  assert.ok(load('praesentation.html').body.classList.contains('presentation'));
});

// ---- QR (UNA-025)
test('TST-U-025: playerUrl liefert index.html im Pages-Unterpfad ohne Query und Hash', async () => {
  const { playerUrl } = await loadQr();
  assert.equal(playerUrl('https://beispiel.example/ETS_Raetsel/admin.html?x=1#h'), TARGET);
  assert.equal(playerUrl('https://beispiel.example/ETS_Raetsel/praesentation.html'), TARGET);
  assert.equal(playerUrl('https://beispiel.example/ETS_Raetsel/'), TARGET);
  assert.equal(playerUrl('http://192.168.1.20:8080/admin.html?a=b'), 'http://192.168.1.20:8080/index.html');
  assert.equal(playerUrl('https://beispiel.example/a/b/praesentation.html#x'), 'https://beispiel.example/a/b/index.html');
});

test('TST-U-025: playerUrl wirft für file und ungültige Adressen verständlich ohne Pfad', async () => {
  const { playerUrl } = await loadQr();
  for (const bad of ['file:///C:/Geheim/Ordner/admin.html', 'nicht gültig', '', 'ftp://beispiel.example/x.html']) {
    assert.throws(() => playerUrl(bad), (error) => {
      assert.ok(error instanceof Error);
      assert.ok(error.message.length > 5);
      assert.doesNotMatch(error.message, /Geheim|Ordner|C:|file:|\\/);
      return true;
    });
  }
});

test('TST-U-025: renderPlayerQr zeigt Ladestatus, Link und PNG und liefert true', async () => {
  const { renderPlayerQr } = await loadQr();
  const root = makeRoot();
  const calls = [];
  let release;
  const encode = (address, options) => { calls.push([address, options]); return new Promise((resolve) => { release = () => resolve(FAKE_PNG); }); };
  const pending = renderPlayerQr(root, `${PAGES}praesentation.html?x=1#y`, encode);
  assert.ok(pending instanceof Promise);
  const status = root.querySelector('[role="status"]');
  assert.ok(status && textOf(status).length > 0, 'Ladestatus sichtbar');
  assert.equal(root.querySelector('img[src^="data:"]'), null);
  assert.equal(root.querySelector('[role="alert"]'), null);
  await new Promise((resolve) => setImmediate(resolve));
  release();
  assert.equal(await pending, true);
  assert.deepEqual(calls, [[TARGET, OPTIONS]]);
  assert.equal(root.querySelector('img').getAttribute('src'), FAKE_PNG);
  assert.ok(root.querySelector('img').getAttribute('alt'));
  assert.equal(root.querySelector(`a[href="${TARGET}"]`).href, TARGET);
  assert.equal(root.querySelector('[role="alert"]'), null);
});

test('TST-U-025: Encoderfehler gibt false mit Alert und weiter nutzbarem Link, ohne QR', async () => {
  const { renderPlayerQr } = await loadQr();
  for (const encode of [async () => { throw new Error('Bibliothek fehlt'); }, () => { throw new Error('sofort'); }]) {
    const root = makeRoot();
    assert.equal(await renderPlayerQr(root, `${PAGES}admin.html`, encode), false);
    const alert = root.querySelector('[role="alert"]');
    assert.ok(alert && textOf(alert).length > 0);
    assert.ok(!alert.hidden);
    assert.equal(root.querySelector(`a[href="${TARGET}"]`).href, TARGET);
    assert.equal(root.querySelector('img[src^="data:"]'), null);
  }
});

test('TST-U-025: file- und ungültige Adressen rufen den Encoder nicht auf und zeigen nur Fehler', async () => {
  const { renderPlayerQr } = await loadQr();
  for (const bad of ['file:///C:/Geheim/Ordner/admin.html', 'nicht gültig']) {
    const root = makeRoot();
    let called = 0;
    assert.equal(await renderPlayerQr(root, bad, async () => { called += 1; return FAKE_PNG; }), false);
    assert.equal(called, 0);
    assert.ok(textOf(root.querySelector('[role="alert"]')).length > 0);
    assert.equal(root.querySelector('img'), null);
    assert.equal(root.querySelector('a[href^="file:"]'), null);
    assert.doesNotMatch(textOf(root), /Geheim|Ordner|C:/);
  }
});

test('TST-U-025: echter qrcode-PNG wird unabhängig decodiert (Adresse, 360 px, Ruhebereich)', async () => {
  const { renderPlayerQr, playerUrl } = await loadQr();
  const qrcode = require('qrcode');
  const { PNG } = require('pngjs');
  const jsQR = require('jsqr');
  const page = 'https://beispiel.example/ETS_Raetsel/admin.html?token=1#abschnitt';
  const address = playerUrl(page);
  assert.equal(address, TARGET);
  const root = makeRoot();
  assert.equal(await renderPlayerQr(root, page, (a, o) => qrcode.toDataURL(a, o)), true);
  const src = root.querySelector('img').getAttribute('src');
  assert.match(src, /^data:image\/png;base64,/);
  const png = PNG.sync.read(Buffer.from(src.split(',')[1], 'base64'));
  assert.equal(png.width, 360);
  assert.equal(png.height, 360);
  const white = (x, y) => { const i = (y * png.width + x) * 4; return png.data[i] > 250 && png.data[i + 1] > 250 && png.data[i + 2] > 250; };
  for (let d = 0; d < 28; d += 1) {
    for (let p = 0; p < 360; p += 1) {
      assert.ok(white(p, d) && white(p, 359 - d) && white(d, p) && white(359 - d, p), `Rand ${d}/${p}`);
    }
  }
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.ok(decoded, 'QR decodierbar');
  assert.equal(decoded.data, TARGET);
});
