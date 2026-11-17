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
    ...(over.solved && over.word_completed === undefined ? { word_completed: true, word_outcome: 'solved' } : {}),
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
  submitOrClick(root, findButton(root, /Wort senden/), textInput(root), 'zebra');
  assert.deepEqual(calls, ['zebra']);
});

test('TST-U-008: gelöste Gruppe zeigt vorläufigen Platz ohne Punkte, kein Eingabefeld', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ solved: { rank: 2 } }), H, NOW);
  const t = textOf(root);
  assert.match(t, /Vorläufig Platz 2/);
  assert.ok(!/Punkte/.test(t));
  assert.equal(textInput(root), null);
  assert.equal(findButton(root, /Wort senden/), undefined);
});

test('TST-U-008: Abschluss ohne Rangliste: zeigt Gesamtplatz und Punkte der eigenen Gruppe', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ phase: 'aufgabe_abgeschlossen', solved: { rank: 3, points: 6 },
    final: { rank: 2, points: 14 },
    ranking: [{ rank: 1, group: 'Fremdgruppe', points: 10 }] }), H, NOW);
  const t = textOf(root);
  assert.match(t, /Platz 2 – 14 Punkte/);
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
  assert.equal(btn(root, /Spiele beenden/).disabled, true);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
});

test('TST-S-027: Admin: Gruppenname öffnet Gruppenseite mit Spiel, Antwort, Zeit; Zurück-Knopf', () => {
  const root = makeRoot();
  const calls = [];
  const h = { ...AH().h, onSelectGroup: (n) => calls.push(['sel', n]), onBackFromGroup: () => calls.push(['back']) };
  const groups = [{ name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, details: [
    { title: 'Gruppenwort', kind: 'word', answer: 'SCHNEE', correct: true, duration_ms: 61000 },
    { title: 'Schach', kind: 'exact', answer: 'X1Y2Z3', correct: false, duration_ms: 125000 },
  ] }];
  renderAdmin(root, overview({ phase: 'wortaufgabe_aktiv', groups }), h, NOW);
  root.querySelector('[data-group="Rentierbande"]').click();
  assert.deepEqual(calls, [['sel', 'Rentierbande']]);
  const r2 = makeRoot();
  renderAdmin(r2, overview({ phase: 'wortaufgabe_aktiv', groups, selectedGroup: 'Rentierbande' }), h, NOW);
  const rows = [...r2.querySelectorAll('tbody tr')].map((tr) => tr.textContent);
  assert.equal(rows.length, 2);
  assert.match(rows[0], /Gruppenwort/);
  assert.match(rows[0], /SCHNEE ✓/);
  assert.match(rows[1], /X1Y2Z3 ✗/);
  assert.match(textOf(r2), /2:05/);
  assert.equal(r2.querySelector('[data-group]'), null, 'nur die Gruppenseite');
  r2.querySelector('[data-action="back"]').click();
  assert.deepEqual(calls[1], ['back']);
});

test('TST-UI: renderAdmin Phase anmeldung offen: Schließen aktiv, Einteilen gesperrt', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'anmeldung', deadline_ms: 300_000 }), AH().h, NOW);
  assert.equal(btn(root, /Anmeldung (starten|erneut)/).disabled, false);
  assert.equal(btn(root, /Anmeldung schließen/).disabled, false);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, true);
  assert.equal(btn(root, /Spiele beenden/).disabled, true);
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
  assert.equal(btn(root, /Spiele beenden/).disabled, false);
  assert.equal(btn(root, /Anmeldung (starten|erneut)/).disabled, true);
  assert.equal(btn(root, /Anmeldung schließen/).disabled, true);
  assert.equal(btn(root, /Gruppen einteilen/).disabled, true);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
});

test('TST-UI: renderAdmin Phase aufgabe_abgeschlossen: nur Reset aktiv', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'aufgabe_abgeschlossen' }), AH().h, NOW);
  assert.equal(btn(root, /zurücksetzen/).disabled, false);
  for (const re of [/Anmeldung schließen/, /Gruppen einteilen/, /Spiele beenden/]) {
    assert.equal(btn(root, re).disabled, true);
  }
});

test('TST-UI: renderAdmin hat keinen Testmodus-Button mehr; Größe speichern ruft onSetGroupSize', () => {
  const { h, calls } = AH();
  h.onSetGroupSize = (...a) => calls.push(['onSetGroupSize', ...a]);
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'anmeldung', deadline_ms: 300_000, group_min: 3, group_max: 5 }), h, NOW);
  assert.ok(!findButton(root, /Testmodus/));
  assert.equal(root.querySelector('input[name="gmin"]').value, '3');
  assert.equal(root.querySelector('input[name="gmax"]').value, '5');
  btn(root, /Größe speichern/).click();
  assert.deepEqual(calls, [['onSetGroupSize', 3, 5]]);
  const r2 = makeRoot();
  renderAdmin(r2, overview({ phase: 'wortaufgabe_aktiv', group_min: 3, group_max: 5 }), AH().h, NOW);
  assert.equal(btn(r2, /Größe speichern/).disabled, true);
});

test('TST-UI: renderAdmin Rätselverwaltung: Speichern, Auswahlfrage-Felder, Gesamtwertung', () => {
  const { h, calls } = AH();
  h.onSetTask = (...a) => calls.push(['onSetTask', ...a]);
  const root = makeRoot();
  renderAdmin(
    root,
    overview({
      phase: 'vorbereitet',
      tasks: [
        { id: 'schach', category: 'Denksport', title: 'Schach', kind: 'exact', body: 'Matt', image_url: null, solution: 'E4', available: true },
        { id: 'schaetz-vorname', category: 'Schätzquiz', title: 'Vorname', kind: 'estimate', needs_choice: true,
          body: '', image_url: null, solution: '10', options: ['Anna', 'Ben', 'Cleo', 'Dora'], correct_option: 'Ben', available: true, answers: 2 },
      ],
      totals: [{ group: 'Rentierbande', points: 18 }],
    }),
    h,
    NOW,
  );
  assert.equal(root.querySelector('input[name="t-schach-solution"]').value, 'E4');
  assert.equal(root.querySelector('input[name="t-schach-opt1"]'), null);
  assert.equal(root.querySelector('input[name="t-schaetz-vorname-opt3"]').value, 'Cleo');
  assert.equal(root.querySelector('input[name="t-schaetz-vorname-correct"]').value, 'Ben');
  assert.ok(!findButton(root, /auswerten/));
  const saves = [...root.querySelectorAll('button')].filter((b) => /^Speichern$/.test(b.textContent.trim()));
  saves[0].click();
  assert.deepEqual(calls[0], ['onSetTask', 'schach', { title: 'Schach', body: 'Matt', imageUrl: '', solution: 'E4', difficulty: 'mittel' }]);
  saves[1].click();
  assert.deepEqual(calls[1][2].options, ['Anna', 'Ben', 'Cleo', 'Dora']);
  assert.equal(calls[1][2].correctOption, 'Ben');
  assert.match(textOf(root), /Rentierbande/);
  assert.match(textOf(root), /18 Punkte/);
});

const TASKS = [
  { id: 'schach', category: 'Denksport', title: 'Schach', kind: 'exact', body: 'Matt in 3', image_url: null, available: true, started: true, submitted: false },
  { id: 'sudoku', category: 'Denksport', title: 'Sudoku', kind: 'exact', body: '', image_url: null, available: false, started: false, submitted: false },
  { id: 'schaetz-locker', category: 'Schätzquiz', title: 'Locker', kind: 'estimate', body: '', image_url: null, available: true, started: true, submitted: true, placement: { rank: 1 } },
  { id: 'geo-baum', category: 'Geocaching', title: 'Baum', kind: 'exact', body: '', image_url: 'bilder/baum.jpg', available: true, started: false, submitted: false },
  { id: 'schaetz-vorname', category: 'Schätzquiz', title: 'Vorname', kind: 'estimate', needs_choice: true, body: 'Wählt', image_url: null,
    options: ['Anna', 'Ben', 'Cleo', 'Dora'], available: true, started: true, submitted: false },
];

test('TST-S-026: Übersicht: Rätsel öffnen per Titel, keine Formulare, Markierung gelöst/falsch', () => {
  const root = makeRoot();
  const opened = [];
  const h = { ...H, onOpenTask: (id) => opened.push(id) };
  const tasks = [...TASKS, { ...TASKS[0], id: 'x-falsch', title: 'Falsch', submitted: true, correct: false },
    { ...TASKS[0], id: 'x-richtig', title: 'Richtig', submitted: true, correct: true }];
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: true, tasks }), h, NOW);
  assert.doesNotMatch(textOf(root), /Spielleiter/);
  assert.ok(root.querySelector('.mission-leader'));
  assert.equal(root.querySelector('.beamer-link'), null);
  assert.match(root.querySelector('.mission-progress').textContent, /3\/7/);
  assert.doesNotMatch(root.querySelector('.mission-progress').textContent, /erledigt/i);
  for (const toggle of root.querySelectorAll('.category-toggle')) assert.doesNotMatch(toggle.textContent, /erledigt/i);
  assert.match(textOf(root), /Noch nicht verfügbar/);
  assert.match(textOf(root), /Geschätzt – vorläufig Platz 1/);
  assert.match(textOf(root), /✓ Richtig/);
  assert.match(textOf(root), /✗ Falsch/);
  assert.ok(root.querySelector('[data-task="x-richtig"].ok'));
  assert.ok(root.querySelector('[data-task="x-falsch"].wrong'));
  assert.ok(root.querySelector('[data-task="schaetz-locker"].guessed'));
  assert.equal(root.querySelector('input[name^="task-"]'), null);
  assert.ok(!findButton(root, /Rätsel öffnen/));
  assert.equal(root.querySelector('[data-open="sudoku"]'), null);
  root.querySelector('[data-open="geo-baum"]').click();
  assert.deepEqual(opened, ['geo-baum']);
});

test('TST-S-026: Einzelansicht zeigt nur die Aufgabe; Rückmeldung direkt beim Eingabefeld', () => {
  const root = makeRoot();
  const calls = [];
  const h = { ...H, onSubmitTask: (...a) => calls.push(a) };
  const st = activeState({ solved: { rank: 1 }, leader: true, tasks: TASKS, openTaskId: 'schach',
    feedback: { scope: 'schach', kind: 'success', text: 'Richtig!' } });
  renderPlayer(root, st, h, NOW);
  assert.match(textOf(root), /Matt in 3/);
  assert.equal(root.querySelector('[data-open]'), null);
  assert.ok(!/Sudoku/.test(textOf(root)));
  const form = root.querySelector('form');
  const fb = form.querySelector('[data-feedback]');
  assert.ok(fb, 'Rückmeldung im Formular');
  assert.match(fb.textContent, /Richtig!/);
  const input = root.querySelector('input[name="task-schach"]');
  assert.equal(input.getAttribute('disabled') !== null, false, 'noch nicht abgegeben: aktiv');
  submitOrClick(root, findButton(root, /Antwort senden/), input, 'e4 d5 h5');
  assert.deepEqual(calls, [['schach', 'e4 d5 h5', null]]);
});

test('TST-S-026: Einzelansicht nach Abgabe: Formular gesperrt', () => {
  const root = makeRoot();
  const tasks = [{ ...TASKS[0], submitted: true, correct: false }];
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: true, tasks, openTaskId: 'schach',
    feedback: { scope: 'schach', kind: 'error', text: 'Falsch' } }), H, NOW);
  assert.ok(root.querySelector('input[name="task-schach"]').getAttribute('disabled') !== null);
  assert.match(root.querySelector('[data-feedback]').textContent, /Falsch/);
});

test('TST-UI: Auswahlfrage zeigt 4 Namen als Auswahl und sendet Name und Zahl', () => {
  const root = makeRoot();
  const calls = [];
  const h = { ...H, onSubmitTask: (...a) => calls.push(a) };
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: true, tasks: TASKS, openTaskId: 'schaetz-vorname' }), h, NOW);
  const radios = root.querySelectorAll('input[name="choice-schaetz-vorname"]');
  assert.equal(radios.length, 4);
  radios[1].checked = true;
  const num = root.querySelector('input[name="task-schaetz-vorname"]');
  num.value = '12';
  const form = num.closest ? num.closest('form') : num.parentNode;
  form.dispatchEvent(new (root.ownerDocument.defaultView.Event)('submit', { cancelable: true }));
  assert.deepEqual(calls, [['schaetz-vorname', '12', 'Ben']]);
});

test('TST-UI: Nach dem Beenden zeigt die Übersicht Punkte je Rätsel', () => {
  const root = makeRoot();
  const tasks = [{ ...TASKS[2], placement: { rank: 1, points: 10 } }];
  renderPlayer(root, activeState({ phase: 'aufgabe_abgeschlossen', solved: { rank: 1, points: 10 },
    final: { rank: 1, points: 20 }, leader: true, tasks }), H, NOW);
  assert.match(textOf(root), /Platz 1, 10 Punkte/);
  assert.equal(root.querySelector('input[name^="task-"]'), null);
});

test('TST-UI: Mitglied ohne Spielleiterrolle sieht Rätsel nur lesend', () => {
  const root = makeRoot();
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: false, leader_name: 'Ben', tasks: TASKS }), H, NOW);
  assert.match(textOf(root), /Ben/);
  assert.match(textOf(root), /Schach/);
  assert.equal(root.querySelector('input[name^="task-"]'), null);
  assert.equal(root.querySelector('[data-open]'), null);
});

test('TST-UI: Rätseltext wird als Text und nicht als HTML dargestellt', () => {
  const root = makeRoot();
  const evil = [{ ...TASKS[0], body: '<b>fett</b>', title: '<i>x</i>' }];
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: true, tasks: evil, openTaskId: 'schach' }), H, NOW);
  assert.match(textOf(root), /<b>fett<\/b>/);
  assert.equal(root.querySelector('b'), null);
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
  btn(r2, /Spiele beenden/).click();
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

test('TST-UI: renderBeamer zeigt Teilnehmerzahl, Phase, Gruppenmitglieder und Rangliste, keine Lösungen', () => {
  const root = makeRoot();
  renderBeamer(root, overview({
    phase: 'aufgabe_abgeschlossen',
    finished: true,
    players: [{ name: 'Anna', group: 'Rentierbande' }, { name: 'Ben', group: 'Rentierbande' },
      { name: 'Cleo', group: 'Lichterkette' }],
    groups: [
      { name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, rank: 1, points: 10, solution: 'ZEBRA' },
      { name: 'Lichterkette', members: ['Cleo'], solved: true, rank: 2, points: 8, solution: 'RADAR' },
    ],
    ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }, { rank: 2, group: 'Lichterkette', points: 8 }],
    solution: 'TURBO',
  }), NOW);
  const t = textOf(root);
  assert.match(t, /Teilnehmer:\s*3/);
  for (const s of ['Rentierbande', 'Lichterkette', '10', '8']) assert.ok(t.includes(s), s);
  for (const s of ['Anna', 'Ben', 'Cleo']) assert.ok(t.includes(s), s);
  for (const s of ['ZEBRA', 'RADAR', 'TURBO']) assert.ok(!t.includes(s), s);
  assert.ok(t.length > 0);
});

test('TST-UI: Beamer zeigt vor dem Beenden nur Plätze, keine Punkte', () => {
  const root = makeRoot();
  renderBeamer(root, overview({ phase: 'wortaufgabe_aktiv', finished: false,
    ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }] }), NOW);
  assert.match(textOf(root), /Rentierbande/);
  assert.ok(!/Punkte/.test(textOf(root)));
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

// OFF-070: Anzeige bei wiederholter Falschantwort bleibt sichtbar und Eingabe offen.
test('TST-S-070: Wiederholbarer Fehlversuch zeigt Falsch neben aktiver Eingabe', () => {
  const root = makeRoot();
  const tasks = [{ ...TASKS[0], kind: 'exact', attempts_used: 1, attempts_remaining: 2, submitted: false, started: true, available: true }];
  renderPlayer(root, activeState({ solved: { rank: 1 }, leader: true, tasks, openTaskId: 'schach',
    feedback: { scope: 'schach', kind: 'error', text: 'Falsch – Noch 2 Versuche.' } }), H, NOW);
  assert.match(root.querySelector('[data-feedback]').textContent, /Falsch.*Noch 2 Versuche/);
  assert.equal(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
});
