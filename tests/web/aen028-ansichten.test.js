import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRoot, textOf, findButton, textInput, submitOrClick, doc } from './dom-helper.js';

const { renderPlayer, renderAdmin, renderBeamer, clearDrafts } = await import('../../web/js/views.js');
const { taskPreparation } = await import('../../web/js/preparation.js');

const NOW = 1_000_000;
const noop = () => {};
const H = { onJoin: noop, onSubmit: noop };

const playerState = (over = {}) => ({
  ok: true, phase: 'anmeldung', deadline_ms: 300_000, server_now_ms: 0, fetchedAtMs: NOW,
  joined: false, name: null, group: null, letters: [], solved: null, ...over,
  ...(over.solved && over.word_completed === undefined ? { word_completed: true, word_outcome: 'solved' } : {}),
});
const activeState = (over = {}) => playerState({
  phase: 'wortaufgabe_aktiv', deadline_ms: null, joined: true, name: 'Anna',
  group: { name: 'Rentierbande', members: ['Anna', 'Ben', 'Cleo', 'Dora'] }, letters: ['Q', 'Y'], ...over,
});
const overview = (over = {}) => ({
  ok: true, phase: 'vorbereitet', deadline_ms: null, server_now_ms: 0, fetchedAtMs: NOW, players: [], groups: [], ranking: [], ...over,
});
const AH = () => {
  const calls = [];
  const h = {};
  for (const n of ['onStart', 'onClose', 'onForm', 'onFinish', 'onReset', 'onBeamer', 'onSetTask', 'onSetGroupSize']) h[n] = (...a) => calls.push([n, ...a]);
  return { h, calls };
};
const allElements = (root) => [...root.querySelectorAll('*')];

const TASKS = [
  { id: 'schach', category: 'Denksport', title: 'Schach', kind: 'exact', body: 'Matt in 3', image_url: null, available: true, started: true, submitted: false },
  { id: 'sudoku', category: 'Denksport', title: 'Sudoku', kind: 'exact', body: '', image_url: null, available: false, started: false, submitted: false },
  { id: 'schaetz-locker', category: 'Schätzquiz', title: 'Locker', kind: 'estimate', body: '', image_url: null, available: true, started: true, submitted: false },
  { id: 'schaetz-vorname', category: 'Schätzquiz', title: 'Vorname', kind: 'estimate', needs_choice: true, body: 'Wählt', image_url: null,
    options: ['Anna', 'Ben', 'Cleo', 'Dora'], available: true, started: true, submitted: false },
];
const leaderState = (over = {}) => activeState({ solved: { rank: 1 }, leader: true, tasks: TASKS, ...over });

const ADMIN_TASKS = [
  { id: 'schach', category: 'Denksport', title: 'Schach', kind: 'exact', body: 'Matt', image_url: 'aufgaben/schach.svg', solution: 'E4', available: true },
  { id: 'sudoku', category: 'Denksport', title: 'Sudoku', kind: 'exact', body: '', image_url: 'aufgaben/sudoku.svg', solution: 'S1', available: true },
];

// ---- Eingabeerhalt (SWA-034, UNA-021)
test('TST-U-022: Namensfeld bleibt bei Aktualisierung identisch mit Text, Fokus und Selektion', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), H, NOW);
  const input = textInput(root);
  input.value = 'Rudolf';
  input.focus();
  input.setSelectionRange(1, 3);
  renderPlayer(root, playerState(), H, NOW + 1000);
  assert.equal(textInput(root), input, 'gleiches Element');
  assert.equal(input.value, 'Rudolf');
  assert.equal(doc.activeElement, input);
  assert.equal(input.selectionStart, 1);
  assert.equal(input.selectionEnd, 3);
  assert.match(textOf(root), /4:59/, 'Countdown wird trotzdem aktualisiert');
});

test('TST-U-022: Wortfeld der Gruppe: Entwurf und geleerter Entwurf bleiben bei Zustandsaenderung erhalten', () => {
  const root = makeRoot();
  renderPlayer(root, activeState(), H, NOW);
  const input = textInput(root);
  input.value = 'zebra';
  renderPlayer(root, activeState({ server_now_ms: 5000 }), H, NOW + 5000);
  assert.equal(textInput(root).value, 'zebra');
  input.value = '';
  renderPlayer(root, activeState({ server_now_ms: 6000 }), H, NOW + 6000);
  assert.equal(textInput(root).value, '');
});

test('TST-U-022: Admin: geleerter Entwurf eines vorbelegten Feldes und geaenderter Entwurf bleiben trotz neuer Serverwerte', () => {
  const root = makeRoot();
  const state = (tasks, players = []) => overview({ phase: 'vorbereitet', tasks, players });
  renderAdmin(root, state(ADMIN_TASKS), AH().h, NOW);
  const schach = root.querySelector('input[name="t-schach-solution"]');
  const sudoku = root.querySelector('input[name="t-sudoku-solution"]');
  assert.equal(schach.value, 'E4');
  schach.value = '';
  sudoku.value = 'EIGENER-ENTWURF';
  const changed = ADMIN_TASKS.map((t) => ({ ...t, solution: `${t.solution}-NEU` }));
  renderAdmin(root, state(changed, [{ name: 'Anna', group: null }]), AH().h, NOW + 2000);
  assert.equal(root.querySelector('input[name="t-schach-solution"]').value, '', 'leerer Entwurf bleibt leer');
  assert.equal(root.querySelector('input[name="t-sudoku-solution"]').value, 'EIGENER-ENTWURF');
  assert.equal(root.querySelector('input[name="t-schach-solution"]'), schach);
});

test('TST-U-022: Admin: Fokus und Cursor im Eingabefeld bleiben bei Aenderung anderer Bereiche', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS }), AH().h, NOW);
  const input = root.querySelector('input[name="t-schach-solution"]');
  input.value = 'E4E5E6';
  input.focus();
  input.setSelectionRange(2, 4);
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS, players: [{ name: 'Anna', group: null }] }), AH().h, NOW + 2000);
  const again = root.querySelector('input[name="t-schach-solution"]');
  assert.equal(again, input);
  assert.equal(doc.activeElement, input);
  assert.equal(input.value, 'E4E5E6');
  assert.deepEqual([input.selectionStart, input.selectionEnd], [2, 4]);
});

test('TST-U-022: unveraenderter Zustand aendert kein Element (Spieler, Admin, Beamer)', () => {
  const player = makeRoot();
  const st = leaderState({ openTaskId: 'schaetz-vorname' });
  renderPlayer(player, st, H, NOW);
  const admin = makeRoot();
  const groups = [{ name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, rank: 1, points: 10, details: [] }];
  const ov = overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS, groups, ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }],
    players: [{ name: 'Anna', group: 'Rentierbande' }] });
  renderAdmin(admin, ov, AH().h, NOW);
  const beamer = makeRoot();
  renderBeamer(beamer, ov, NOW);
  for (const [root, again] of [
    [player, () => renderPlayer(player, st, H, NOW)],
    [admin, () => renderAdmin(admin, ov, AH().h, NOW)],
    [beamer, () => renderBeamer(beamer, ov, NOW)],
  ]) {
    const before = allElements(root);
    assert.ok(before.length > 5);
    again();
    const after = allElements(root);
    assert.equal(after.length, before.length);
    after.forEach((el, i) => assert.equal(el, before[i], `Element ${i} ersetzt`));
  }
});

test('TST-U-022: Aenderung eines Bereichs laesst unveraenderte Bereiche identisch', () => {
  const root = makeRoot();
  const groups = [{ name: 'Rentierbande', members: ['Anna', 'Ben'], solved: false, details: [] }];
  const base = { phase: 'wortaufgabe_aktiv', tasks: ADMIN_TASKS, groups };
  renderAdmin(root, overview(base), AH().h, NOW);
  const input = root.querySelector('input[name="t-sudoku-solution"]');
  const groupLink = root.querySelector('[data-group="Rentierbande"]');
  renderAdmin(root, overview({ ...base, players: [{ name: 'Anna', group: 'Rentierbande' }, { name: 'Ben', group: 'Rentierbande' }] }), AH().h, NOW);
  assert.equal(root.querySelector('input[name="t-sudoku-solution"]'), input);
  assert.equal(root.querySelector('[data-group="Rentierbande"]'), groupLink);
});

test('TST-U-022: Auswahlfrage: Radioauswahl und Zahl bleiben erhalten, auch geleerte Zahl; Elemente identisch', () => {
  const root = makeRoot();
  const calls = [];
  const h = { ...H, onSubmitTask: (...a) => calls.push(a) };
  renderPlayer(root, leaderState({ openTaskId: 'schaetz-vorname' }), h, NOW);
  const radios = [...root.querySelectorAll('input[name="choice-schaetz-vorname"]')];
  radios[2].checked = true;
  const num = root.querySelector('input[name="task-schaetz-vorname"]');
  num.value = '12';
  const tasks = TASKS.map((t) => (t.id === 'schach' ? { ...t, body: 'Matt in 2' } : t));
  renderPlayer(root, leaderState({ openTaskId: 'schaetz-vorname', tasks }), h, NOW + 2000);
  const radios2 = [...root.querySelectorAll('input[name="choice-schaetz-vorname"]')];
  assert.equal(radios2.length, 4);
  radios2.forEach((r, i) => assert.equal(r, radios[i]));
  assert.equal(radios2[2].checked, true);
  assert.equal(root.querySelector('input[name="task-schaetz-vorname"]'), num);
  assert.equal(num.value, '12');
  num.value = '';
  renderPlayer(root, leaderState({ openTaskId: 'schaetz-vorname', tasks }), h, NOW + 4000);
  assert.equal(root.querySelector('input[name="task-schaetz-vorname"]').value, '');
  assert.equal(root.querySelector('input[name="choice-schaetz-vorname"]:checked')?.value, 'Cleo');
  num.value = '7';
  root.querySelector('form').dispatchEvent(new (root.ownerDocument.defaultView.Event)('submit', { cancelable: true }));
  assert.deepEqual(calls, [['schaetz-vorname', '7', 'Cleo']]);
});

test('TST-U-022: Aufgabeneingabe bleibt bei Aenderung anderer Aufgaben erhalten, Handler lesen aktuelle Felder', () => {
  const root = makeRoot();
  const first = [];
  const second = [];
  renderPlayer(root, leaderState({ openTaskId: 'schach' }), { ...H, onSubmitTask: (...a) => first.push(a) }, NOW);
  const input = root.querySelector('input[name="task-schach"]');
  input.value = 'e4 e5';
  const tasks = TASKS.map((t) => (t.id === 'sudoku' ? { ...t, available: true } : t));
  renderPlayer(root, leaderState({ openTaskId: 'schach', tasks }), { ...H, onSubmitTask: (...a) => second.push(a) }, NOW + 2000);
  assert.equal(root.querySelector('input[name="task-schach"]'), input);
  assert.equal(input.value, 'e4 e5');
  input.value = 'e4 e5 e6';
  submitOrClick(root, findButton(root, /Antwort senden/), null, null);
  assert.deepEqual(first, [], 'alter Handler wird nicht mehr verwendet');
  assert.deepEqual(second, [['schach', 'e4 e5 e6', null]]);
});

test('TST-U-022: Wortfeld-Handler wird bei Aktualisierung ersetzt und liest den aktuellen Wert', () => {
  const root = makeRoot();
  const a = [];
  const b = [];
  renderPlayer(root, activeState(), { onJoin: noop, onSubmit: (x) => a.push(x) }, NOW);
  renderPlayer(root, activeState({ server_now_ms: 1000 }), { onJoin: noop, onSubmit: (x) => b.push(x) }, NOW);
  submitOrClick(root, findButton(root, /Wort senden/), textInput(root), 'pixel');
  assert.deepEqual(a, []);
  assert.deepEqual(b, ['pixel']);
});

// ---- keine Wiederherstellung ueber Ansichts-, Phasen- oder Identitaetswechsel
test('TST-U-022: Ansichtswechsel (Aufgabe zu Uebersicht und zurueck) stellt keinen alten Entwurf wieder her', () => {
  const root = makeRoot();
  const h = { ...H, onSubmitTask: noop };
  renderPlayer(root, leaderState({ openTaskId: 'schach' }), h, NOW);
  root.querySelector('input[name="task-schach"]').value = 'alter Entwurf';
  renderPlayer(root, leaderState(), h, NOW + 1000);
  assert.equal(root.querySelector('input[name="task-schach"]'), null);
  renderPlayer(root, leaderState({ openTaskId: 'schach' }), h, NOW + 2000);
  assert.equal(root.querySelector('input[name="task-schach"]').value, '');
});

test('TST-U-022: Phasenwechsel stellt keinen alten Entwurf wieder her', () => {
  const root = makeRoot();
  renderPlayer(root, playerState(), H, NOW);
  textInput(root).value = 'Rudolf';
  renderPlayer(root, playerState({ phase: 'vorbereitet', deadline_ms: null }), H, NOW + 1000);
  assert.equal(textInput(root), null);
  renderPlayer(root, playerState(), H, NOW + 2000);
  assert.equal(textInput(root).value, '');
});

test('TST-U-022: andere Spieler- oder Gruppenidentitaet uebernimmt keinen Entwurf', () => {
  const root = makeRoot();
  renderPlayer(root, activeState(), H, NOW);
  textInput(root).value = 'pixel';
  renderPlayer(root, activeState({ name: 'Ben', group: { name: 'Lichterkette', members: ['Ben', 'Cleo', 'Dora', 'Emil'] } }), H, NOW);
  assert.equal(textInput(root).value, '');
});

test('TST-U-022: Wortfeld verschwindet nach Loesung und kommt ohne alten Entwurf zurueck', () => {
  const root = makeRoot();
  renderPlayer(root, activeState(), H, NOW);
  textInput(root).value = 'alt';
  renderPlayer(root, activeState({ solved: { rank: 1 } }), H, NOW);
  assert.equal(textInput(root), null);
  renderPlayer(root, activeState(), H, NOW);
  assert.equal(textInput(root).value, '');
});

// ---- gezieltes Verwerfen
test('TST-U-022: clearDrafts mit Namen verwirft nur diese Entwuerfe, Serverwerte werden uebernommen', () => {
  const root = makeRoot();
  const state = (tasks) => overview({ phase: 'vorbereitet', tasks });
  renderAdmin(root, state(ADMIN_TASKS), AH().h, NOW);
  root.querySelector('input[name="t-schach-solution"]').value = 'GESPEICHERT';
  root.querySelector('input[name="t-sudoku-solution"]').value = 'NOCH-OFFEN';
  clearDrafts(root, ['t-schach-solution']);
  const saved = ADMIN_TASKS.map((t) => (t.id === 'schach' ? { ...t, solution: 'VOM-SERVER' } : t));
  renderAdmin(root, state(saved), AH().h, NOW + 2000);
  assert.equal(root.querySelector('input[name="t-schach-solution"]').value, 'VOM-SERVER');
  assert.equal(root.querySelector('input[name="t-sudoku-solution"]').value, 'NOCH-OFFEN');
});

test('TST-U-022: clearDrafts ohne Namen verwirft alle Entwuerfe (Reset/Abmeldung)', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS }), AH().h, NOW);
  root.querySelector('input[name="t-schach-solution"]').value = 'A';
  root.querySelector('input[name="t-sudoku-solution"]').value = '';
  clearDrafts(root);
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS }), AH().h, NOW + 1000);
  assert.equal(root.querySelector('input[name="t-schach-solution"]').value, 'E4');
  assert.equal(root.querySelector('input[name="t-sudoku-solution"]').value, 'S1');
});

test('TST-U-022: Speichern uebergibt aktuelle Feldwerte nach Neuzeichnung', () => {
  const root = makeRoot();
  const { h, calls } = AH();
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS }), h, NOW);
  root.querySelector('input[name="t-schach-solution"]').value = 'D4';
  const h2 = AH();
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks: ADMIN_TASKS, players: [{ name: 'Anna', group: null }] }), h2.h, NOW + 1000);
  [...root.querySelectorAll('button')].filter((b) => /^Speichern$/.test(b.textContent.trim()))[0].click();
  assert.deepEqual(calls, []);
  assert.equal(h2.calls[0][0], 'onSetTask');
  assert.equal(h2.calls[0][1], 'schach');
  assert.equal(h2.calls[0][2].solution, 'D4');
});

// ---- Versuchszaehler (KAN-031, SWA-036)
const exactTask = (over) => ({ ...TASKS[0], max_attempts: 3, ...over });
const open = (task) => {
  const root = makeRoot();
  renderPlayer(root, leaderState({ tasks: [task], openTaskId: task.id }), { ...H, onSubmitTask: noop }, NOW);
  return root;
};

test('TST-U-022: exakte Aufgabe zeigt vor der ersten Abgabe Versuch 1 von 3', () => {
  const root = open(exactTask({ attempts_used: 0, attempts_remaining: 3 }));
  assert.match(textOf(root), /Versuch 1 von 3/);
  assert.equal(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
});

test('TST-U-022: nach Fehlversuchen verbleibende Versuche, Eingabe bleibt moeglich', () => {
  let root = open(exactTask({ attempts_used: 1, attempts_remaining: 2, correct: false }));
  assert.match(textOf(root), /Noch 2 Versuche/);
  assert.equal(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
  assert.ok(findButton(root, /Antwort senden/));
  root = open(exactTask({ attempts_used: 2, attempts_remaining: 1, correct: false }));
  assert.match(textOf(root), /Noch 1 Versuch/);
  assert.equal(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
});

test('TST-U-022: abgeschlossene Aufgabe zeigt richtig/falsch und sperrt die Eingabe', () => {
  let root = open(exactTask({ submitted: true, correct: true, attempts_used: 2, attempts_remaining: 1 }));
  assert.match(textOf(root), /richtig/i);
  assert.notEqual(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
  root = open(exactTask({ submitted: true, correct: false, attempts_used: 3, attempts_remaining: 0 }));
  assert.match(textOf(root), /falsch/i);
  assert.notEqual(root.querySelector('input[name="task-schach"]').getAttribute('disabled'), null);
});

test('TST-U-022: Schaetzfragen zeigen keinen Versuchszaehler', () => {
  const root = open({ ...TASKS[2], attempts_used: 0 });
  assert.ok(!/Versuch/.test(textOf(root)));
});

test('TST-U-022: Uebersicht: Aufgabe nach Fehlversuch bleibt oeffenbar und ist nicht als falsch abgeschlossen markiert', () => {
  const root = makeRoot();
  const opened = [];
  const tasks = [exactTask({ started: true, submitted: false, correct: false, attempts_used: 1, attempts_remaining: 2 })];
  renderPlayer(root, leaderState({ tasks }), { ...H, onOpenTask: (id) => opened.push(id) }, NOW);
  assert.equal(root.querySelector('[data-task="schach"].wrong'), null);
  root.querySelector('[data-open="schach"]').click();
  assert.deepEqual(opened, ['schach']);
});

// ---- Gruppenfindung (KAN-028, SWA-033)
const GROUPS = [
  { name: 'Rentierbande', members: ['Anna', 'Ben'], solved: true, rank: 1, points: null, details: [] },
  { name: 'Lichterkette', members: ['Cleo', 'Dora'], solved: false, rank: null, points: null, details: [] },
];
const RANKING = [{ rank: 1, group: 'Rentierbande', points: 10 }];
const idx = (text, s) => text.indexOf(s);

test('TST-S-030: Beamer zeigt vor Loesungen alle Gruppen mit Teilnehmern, auch ohne Ranglistenplatz', () => {
  const root = makeRoot();
  const groups = GROUPS.map((g) => ({ ...g, solved: false, rank: null }));
  renderBeamer(root, overview({ phase: 'gruppen_eingeteilt', groups, ranking: [] }), NOW);
  const t = textOf(root);
  for (const s of ['Rentierbande', 'Lichterkette', 'Anna', 'Ben', 'Cleo', 'Dora']) assert.ok(t.includes(s), s);
  assert.ok(!/Gruppe komplett/.test(t));
});

test('TST-S-043: Beamer zeigt Mitglieder geloester Gruppen in einer Zeile und Punkte live', () => {
  const root = makeRoot();
  renderBeamer(root, overview({ phase: 'wortaufgabe_aktiv', groups: GROUPS, ranking: RANKING }), NOW);
  const t = textOf(root);
  assert.ok(t.includes('Rentierbande'));
  for (const s of ['Lichterkette', 'Anna', 'Ben', 'Cleo', 'Dora']) assert.ok(t.includes(s), s);
  assert.equal(t.split('Gruppe komplett').length - 1, 0);
  assert.ok(root.querySelector('.ranking .pts')?.textContent.includes('Pkt.'), 'Punkte werden auch vor Spielende gezeigt');
  assert.ok(idx(t, 'Rentierbande') < idx(t, 'Lichterkette'), 'Gesamtrangfolge zuerst');
});

test('TST-S-043: Beamer behaelt alle Teilnehmernamen auch nach allen Wortloesungen', () => {
  const root = makeRoot();
  const groups = GROUPS.map((g, i) => ({ ...g, solved: true, rank: i + 1 }));
  renderBeamer(root, overview({ phase: 'wortaufgabe_aktiv', groups, ranking: [{ rank: 1, group: 'Rentierbande', points: 10 }, { rank: 2, group: 'Lichterkette', points: 8 }] }), NOW);
  const t = textOf(root);
  assert.equal(t.split('Gruppe komplett').length - 1, 0);
  for (const s of ['Anna', 'Ben', 'Cleo', 'Dora']) assert.ok(t.includes(s), s);
});

test('TST-S-030: Admin-Rangliste zeigt Teilnehmer ungeloester Gruppen und Gruppe komplett fuer geloeste', () => {
  const root = makeRoot();
  renderAdmin(root, overview({ phase: 'wortaufgabe_aktiv', groups: GROUPS, ranking: RANKING,
    players: [{ name: 'Anna', group: 'Rentierbande' }, { name: 'Cleo', group: 'Lichterkette' }] }), AH().h, NOW);
  const t = textOf(root);
  assert.match(t, /Gruppe komplett/);
  for (const s of ['Lichterkette', 'Cleo', 'Dora', 'Rentierbande']) assert.ok(t.includes(s), s);
});

test('TST-S-030: Beamer zeigt nie Loesungen, Einzelantworten, Aufgabenpflege oder Vorbereitungskontrolle', () => {
  const root = makeRoot();
  const groups = GROUPS.map((g) => ({ ...g, solution: 'GEHEIMWORT-G', details: [{ title: 'Schach', kind: 'exact', answer: 'GEHEIMANTWORT', correct: false, attempt_no: 1, duration_ms: 5000 }] }));
  renderBeamer(root, overview({ phase: 'wortaufgabe_aktiv', groups, ranking: RANKING, solution: 'GEHEIMWORT-X',
    tasks: [{ ...ADMIN_TASKS[0], solution: 'GEHEIMLOESUNG', image_url: null }] }), NOW);
  const html = root.innerHTML;
  for (const s of ['GEHEIMWORT-G', 'GEHEIMWORT-X', 'GEHEIMANTWORT', 'GEHEIMLOESUNG']) assert.ok(!html.includes(s), s);
  assert.ok(!/Vorbereitung/.test(textOf(root)));
  assert.equal(root.querySelectorAll('input, textarea').length, 0);
});

test('TST-S-030: Namen in der Gruppenliste werden als Text dargestellt', () => {
  for (const evil of ['<img src=x onerror=alert(1)>', '<b>x</b>']) {
    const root = makeRoot();
    renderBeamer(root, overview({ phase: 'wortaufgabe_aktiv', groups: [{ name: 'G', members: [evil], solved: false, rank: null, details: [] }], ranking: [] }), NOW);
    assert.ok(textOf(root).includes(evil));
    assert.equal(root.querySelectorAll('img, b').length, 0);
  }
});

// ---- Vorbereitungskontrolle (KAN-032, SWA-037)
test('TST-S-030: Admin zeigt je Aufgabe fehlende Bestandteile, keine Startsperre', () => {
  const root = makeRoot();
  const { h } = AH();
  const tasks = [
    { ...ADMIN_TASKS[0], solution: '', image_url: null },
    { ...ADMIN_TASKS[1] },
    { id: 'schaetz-vorname', category: 'Schätzquiz', title: 'Vorname', kind: 'estimate', needs_choice: true, body: '', image_url: null,
      solution: '10', options: ['Anna', 'Ben', 'Cleo'], correct_option: null, available: true },
  ];
  renderAdmin(root, overview({ phase: 'vorbereitet', tasks }), h, NOW);
  const t = textOf(root);
  assert.match(t, /Vorbereitung/);
  const missing = [...taskPreparation(tasks[0]), ...taskPreparation(tasks[2])];
  assert.ok(missing.length >= 3);
  for (const m of missing) assert.ok(t.includes(m), m);
  assert.equal(findButton(root, /Anmeldung (starten|erneut)/).disabled, false);
  assert.ok(!t.includes('S1'), 'Loesungswert nicht in der Kontrolle');
});
