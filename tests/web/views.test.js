import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf, findButton, buttons, textInput, submitOrClick, doc } from './dom-helper.js';

const { renderPlayer, renderAdmin, renderBeamer, renderMessage } = await import('../../web/js/views.js');

const NOW = 1_000_000;
const noop = () => {};
const H = { onJoin: noop, onSubmit: noop };

function playerState(over = {}) {
  return {
    ok: true, phase: 'anmeldung', deadline_ms: 300_000, server_now_ms: 0, fetchedAtMs: NOW,
    joined: false, name: null, group: null, letters: [], solved: null, ...over,
  };
}

const activeState = (over = {}) => playerState({
  phase: 'wortaufgabe_aktiv', deadline_ms: null, joined: true, name: 'Anna',
  group: { name: 'Rentierbande', members: ['Anna', 'Ben', 'Cleo', 'Dora'] },
  letters: ['Q', 'Y'], ...over,
});

function letterTokens(root) {
  const leaves = [...root.querySelectorAll('*')]
    .filter((e) => e.children.length === 0 && /^[A-ZÄÖÜ]$/.test(e.textContent.trim()))
    .map((e) => e.textContent.trim());
  if (leaves.length) return leaves;
  return textOf(root).split(/\s+/).filter((t) => /^[A-ZÄÖÜ]$/.test(t));
}

// ---- Spieler
test('TST-U-008: renderPlayer Anmeldung offen: Namensfeld maxlength 20, Button, Countdown', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), H, NOW);
  const input = textInput(root);
  assert.ok(input);
  assert.equal(input.getAttribute('maxlength'), '20');
  assert.ok(findButton(root, /Anmelden/));
  assert.match(textOf(root), /5:00/);
});

test('TST-U-008: Countdown läuft mit nowMs weiter', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), H, NOW + 61_000);
  assert.match(textOf(root), /3:59/);
});

test('TST-U-008: Anmelden-Klick ruft onJoin mit Eingabewert', () => {
  const root = makeRoot();
  const calls = [];
  renderPlayer(root, playerState(), { onJoin: (n) => calls.push(n), onSubmit: noop }, NOW);
  submitOrClick(root, findButton(root, /Anmelden/), textInput(root), 'Rudolf');
  assert.deepEqual(calls, ['Rudolf']);
});

test('TST-U-008: Anmeldung abgelaufen/nicht begonnen: kein Namensfeld, Hinweis', () => {
  for (const s of [
    playerState({ deadline_ms: 100_000, server_now_ms: 0, fetchedAtMs: NOW }),
    playerState({ phase: 'vorbereitet', deadline_ms: null }),
    playerState({ phase: 'wortaufgabe_aktiv', deadline_ms: null }),
  ]) {
    const root = makeRoot();
    renderPlayer(root, s, H, NOW + 200_000);
    assert.equal(textInput(root), null);
    assert.equal(findButton(root, /Anmelden/), undefined);
    assert.ok(textOf(root).length > 10);
  }
});

test('TST-U-008: angemeldet in Anmeldephase: Name, Countdown, Bitte warten', () => {
  const root = makeRoot();
  renderPlayer(root, playerState({ joined: true, name: 'Anna' }), H, NOW);
  const t = textOf(root);
  assert.match(t, /Angemeldet als/);
  assert.match(t, /Anna/);
  assert.match(t, /5:00/);
  assert.match(t, /Bitte warten/);
  assert.equal(textInput(root), null);
});

test('TST-U-008: angemeldet in Phase vorbereitet ohne Countdown: Bitte warten', () => {
  const root = makeRoot();
  renderPlayer(root, playerState({ phase: 'vorbereitet', deadline_ms: null, joined: true, name: 'Anna' }), H, NOW);
  assert.match(textOf(root), /Bitte warten/);
});

test('TST-U-008: aktive Aufgabe zeigt Gruppe, Mitglieder, eigene Buchstaben in Reihenfolge, Eingabe', () => {
  const root = makeRoot();
  renderPlayer(root, activeState(), H, NOW);
  const t = textOf(root);
  assert.match(t, /Rentierbande/);
  for (const m of ['Ben', 'Cleo', 'Dora']) assert.ok(t.includes(m));
  assert.match(t, /Findet eure Gruppenmitglieder und setzt das Wort zusammen/);
  assert.deepEqual(letterTokens(root), ['Q', 'Y']);
  assert.ok(textInput(root));
  assert.ok(findButton(root, /Wort senden/));
});

test('TST-U-008: aktive Aufgabe zeigt Mitglieder als Liste, eigener Name hervorgehoben', () => {
  const root = makeRoot();
  renderPlayer(root, activeState(), H, NOW);
  const items = [...root.querySelectorAll('li')].map((l) => l.textContent.trim());
  assert.equal(items.length, 4);
  const mine = [...root.querySelectorAll('li')].find((l) => l.textContent.includes('Anna'));
  const other = [...root.querySelectorAll('li')].find((l) => l.textContent.includes('Ben'));
  const mark = (e) => `${e.className} ${e.innerHTML}`;
  assert.notEqual(mark(mine).replace(/Anna/g, ''), mark(other).replace(/Ben/g, ''));
});

test('TST-U-008: gruppen_eingeteilt zeigt ebenfalls Aufgabe', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ phase: 'gruppen_eingeteilt' }), H, NOW);
  assert.ok(findButton(root, /Wort senden/));
});

test('TST-S-005: Wort senden ruft onSubmit mit Eingabewert', () => {
  const root = makeRoot();
  const calls = [];
  renderPlayer(root, activeState(), { onJoin: noop, onSubmit: (a) => calls.push(a) }, NOW);
  submitOrClick(root, findButton(root, /Wort senden/), textInput(root), 'motor');
  assert.deepEqual(calls, ['motor']);
});

test('TST-U-008: gelöste Gruppe zeigt Platz und Punkte, kein Eingabefeld', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ solved: { rank: 2, points: 8 } }), H, NOW);
  const t = textOf(root);
  assert.match(t, /2/);
  assert.match(t, /8/);
  assert.equal(textInput(root), null);
  assert.equal(findButton(root, /Wort senden/), undefined);
});

test('TST-U-008: Abschluss ohne Rangliste: gelöst zeigt Platz/Punkte', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ phase: 'aufgabe_abgeschlossen', solved: { rank: 3, points: 6 },
    ranking: [{ rank: 1, group: 'Fremdgruppe', points: 10 }] }), H, NOW);
  const t = textOf(root);
  assert.match(t, /3/);
  assert.match(t, /6/);
  assert.ok(!t.includes('Fremdgruppe'));
  assert.equal(textInput(root), null);
});

test('TST-U-008: Abschluss ungelöst zeigt „nicht gelöst“', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ phase: 'aufgabe_abgeschlossen', solved: null }), H, NOW);
  assert.match(textOf(root), /nicht gelöst/i);
  assert.equal(textInput(root), null);
});

test('TST-U-008: null-State und unbekannter State zeigen „Verbinde“ ohne Fehler', () => {
  for (const s of [null, undefined, {}]) {
    const root = makeRoot();
    assert.doesNotThrow(() => renderPlayer(root, s, H, NOW));
    assert.match(textOf(root), /Verbinde/);
  }
});

test('TST-S-007: Lösungswort wird nie dargestellt, auch nicht bei state.solution', () => {
  for (const phase of ['wortaufgabe_aktiv', 'aufgabe_abgeschlossen']) {
    const root = makeRoot();
    renderPlayer(root, activeState({ phase, solution: 'WECHSELRICHTER' }), H, NOW);
    assert.ok(!root.innerHTML.includes('WECHSELRICHTER'));
  }
});

test('TST-UI: renderPlayer ersetzt vorherigen Inhalt', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), H, NOW);
  renderPlayer(root, activeState(), H, NOW);
  assert.equal(root.querySelectorAll('input').length, 1);
  assert.equal(findButton(root, /Anmelden/), undefined);
});

// ---- XSS
const EVIL = ['<img src=x onerror=alert(1)>', '<b>x</b>'];

test('TST-S-007: Spieler: Namen und Gruppennamen erscheinen als Text, ohne neue Elemente', () => {
  for (const evil of EVIL) {
    const root = makeRoot();
    renderPlayer(root, activeState({ name: evil,
      group: { name: evil, members: [evil, 'Ben', 'Cleo', 'Dora'] } }), H, NOW);
    assert.ok(textOf(root).includes(evil));
    assert.equal(root.querySelectorAll('img').length, 0);
    assert.equal(root.querySelectorAll('b').length, 0);
    const r2 = makeRoot();
    renderPlayer(r2, playerState({ phase: 'vorbereitet', deadline_ms: null, joined: true, name: evil }), H, NOW);
    assert.ok(textOf(r2).includes(evil));
    assert.equal(r2.querySelectorAll('img, b').length, 0);
  }
});

// ---- Admin
function overview(over = {}) {
  return {
    ok: true, phase: 'vorbereitet', deadline_ms: null, server_now_ms: 0, fetchedAtMs: NOW,
    players: [], groups: [], ranking: [], ...over,
  };
}
const AH = () => {
  const calls = [];
  const h = {};
  for (const n of ['onStart', 'onClose', 'onForm', 'onFinish', 'onReset', 'onBeamer']) h[n] = (...a) => calls.push([n, ...a]);
  return { h, calls };
};
const btn = (root, re) => findButton(root, re);

test('TST-UI: renderAdmin Phase vorbereitet: nur Start und Reset aktiv', () => {
  const root = makeRoot();
  renderAdmin(root, overview(), AH().h, NOW);
  assert.equal(btn(root, /Anmeldung (starten|erneut)/).disabled, false);
  assert.equal(btn(root, /Anmeldung schließen/).disabled, true);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, true);
  assert.equal(btn(root, /Aufgabe beenden/).disabled, true);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
});

test('TST-UI: renderAdmin Phase anmeldung offen: Schließen aktiv, Einteilen gesperrt', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'anmeldung', deadline_ms: 300_000 }), AH().h, NOW);
  assert.equal(btn(root, /Anmeldung (starten|erneut)/).disabled, false);
  assert.equal(btn(root, /Anmeldung schließen/).disabled, false);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, true);
  assert.equal(btn(root, /Aufgabe beenden/).disabled, true);
  assert.match(textOf(root), /5:00/);
});

test('TST-UI: renderAdmin anmeldung mit abgelaufener Frist: Einteilen aktiv', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'anmeldung', deadline_ms: 1000 }), AH().h, NOW + 10_000);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, false);
});

test('TST-UI: renderAdmin Phase wortaufgabe_aktiv: nur Beenden und Reset aktiv', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'wortaufgabe_aktiv' }), AH().h, NOW);
  assert.equal(btn(root, /Aufgabe beenden/).disabled, false);
  assert.equal(btn(root, /Anmeldung (starten|erneut)/).disabled, true);
  assert.equal(btn(root, /Anmeldung schließen/).disabled, true);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, true);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
});

test('TST-UI: renderAdmin Phase aufgabe_abgeschlossen: nur Reset aktiv', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'aufgabe_abgeschlossen' }), AH().h, NOW);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
  for (const re of [/Anmeldung schließen/, /Gruppen einteilen/, /Aufgabe beenden/]) {
    assert.equal(btn(root, re).disabled, true);
  }
});

test('TST-UI: renderAdmin Handleraufrufe', () => {
  const { h, calls } = AH();
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'anmeldung', deadline_ms: 1000 }), h, NOW + 10_000);
  btn(root, /Anmeldung schließen/).click();
  btn(root, /Gruppen einteilen/).click();
  btn(root, /zurücksetzen/).click();
  btn(root, /Anmeldung (starten|erneut)/).click();
  assert.deepEqual(calls.slice(0, 3).map((c) => c[0]), ['onClose', 'onForm', 'onReset']);
  assert.equal(calls[3][0], 'onStart');
  assert.equal(typeof calls[3][1], 'number');
  assert.ok(calls[3][1] > 0);

  const r2 = makeRoot();
  const c2 = AH();
  renderAdmin(r2, overview({ phase: 'wortaufgabe_aktiv' }), c2.h, NOW);
  btn(r2, /Aufgabe beenden/).click();
  assert.deepEqual(c2.calls.map((c) => c[0]), ['onFinish']);
});

test('TST-UI: renderAdmin Beamer-Schalter ruft onBeamer', () => {
  const { h, calls } = AH();
  const root = makeRoot();
  renderAdmin(root, overview(), h, NOW);
  const b = btn(root, /Beamer/i);
  assert.ok(b);
  b.click();
  assert.deepEqual(calls.map((c) => c[0]), ['onBeamer']);
});

test('TST-UI: renderAdmin zeigt Teilnehmer, Gruppen, Platz/Punkte und Rangliste', () => {
  const root = makeRoot();
  renderAdmin(root, overview({
    phase: 'wortaufgabe_aktiv',
    players: [{ name: 'Anna', group: 'Rentierbande' }, { name: 'Ben', group: 'Rentierbande' },
      { name: 'Cleo', group: 'Lichterkette' }, { name: 'Dora', group: 'Lichterkette' }],
    groups: [
      { name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, rank: 1, points: 10 },
      { name: 'Lichterkette', members: ['Cleo', 'Dora'], solved: false, rank: null, points: null },
    ],
    ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }],
  }), AH().h, NOW);
  const t = textOf(root);
  for (const s of ['Anna', 'Ben', 'Cleo', 'Dora', 'Rentierbande', 'Lichterkette', '10']) assert.ok(t.includes(s), s);
  assert.match(t, /Teilnehmer:\s*4/);
});

test('TST-S-007: Admin: Namen als Text, kein HTML aus Namen', () => {
  for (const evil of EVIL) {
    const root = makeRoot();
    renderAdmin(root, overview({
      players: [{ name: evil, group: evil }],
      groups: [{ name: evil, members: [evil], solved: false, rank: null, points: null }],
      ranking: [{ rank: 1, group: evil, points: 10 }],
    }), AH().h, NOW);
    assert.ok(textOf(root).includes(evil));
    assert.equal(root.querySelectorAll('img, b').length, 0);
  }
});

// ---- Beamer
test('TST-UI: renderBeamer zeigt Countdown nur in Phase anmeldung', () => {
  const r1 = makeRoot();
  renderBeamer(r1, overview({ phase: 'anmeldung', deadline_ms: 120_000 }), NOW);
  assert.match(textOf(r1), /2:00/);
  const r2 = makeRoot();
  renderBeamer(r2, overview({ phase: 'wortaufgabe_aktiv', deadline_ms: 120_000 }), NOW);
  assert.ok(!/2:00/.test(textOf(r2)));
});

test('TST-UI: renderBeamer zeigt Teilnehmerzahl, Phase und Rangliste, keine Namen/Lösungen', () => {
  const root = makeRoot();
  renderBeamer(root, overview({
    phase: 'aufgabe_abgeschlossen',
    players: [{ name: 'Anna', group: 'Rentierbande' }, { name: 'Ben', group: 'Rentierbande' },
      { name: 'Cleo', group: 'Lichterkette' }],
    groups: [
      { name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, rank: 1, points: 10, solution: 'AKKU' },
      { name: 'Lichterkette', members: ['Cleo'], solved: true, rank: 2, points: 8, solution: 'RADAR' },
    ],
    ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }, { rank: 2, group: 'Lichterkette', points: 8 }],
    solution: 'TURBO',
  }), NOW);
  const t = textOf(root);
  assert.match(t, /Teilnehmer:\s*3/);
  for (const s of ['Rentierbande', 'Lichterkette', '10', '8']) assert.ok(t.includes(s), s);
  for (const s of ['Anna', 'Ben', 'Cleo', 'AKKU', 'RADAR', 'TURBO']) assert.ok(!t.includes(s), s);
  assert.ok(t.length > 0);
});

test('TST-S-007: Beamer: Gruppennamen als Text, keine Elemente daraus', () => {
  for (const evil of EVIL) {
    const root = makeRoot();
    renderBeamer(root, overview({ ranking: [{ rank: 1, group: evil, points: 10 }] }), NOW);
    assert.ok(textOf(root).includes(evil));
    assert.equal(root.querySelectorAll('img, b').length, 0);
  }
});

// ---- Meldung
test('TST-UI: renderMessage zeigt Text mit passender Rolle', () => {
  const root = makeRoot();
  renderMessage(root, 'Verbindung unterbrochen', 'error');
  assert.match(textOf(root), /Verbindung unterbrochen/);
  assert.ok(root.querySelector('[role="alert"]'));
  renderMessage(root, 'Richtig!', 'success');
  assert.ok(root.querySelector('[role="status"], [role="alert"]'));
  assert.equal(textOf(root), 'Richtig!');
  renderMessage(root, 'Info', 'info');
  assert.ok(root.querySelector('[role="status"]'));
});

test('TST-S-007: renderMessage schreibt Text, kein HTML', () => {
  const root = makeRoot();
  renderMessage(root, '<img src=x onerror=alert(1)>', 'info');
  assert.equal(root.querySelectorAll('img').length, 0);
  assert.ok(textOf(root).includes('<img'));
});

void doc; void buttons;
