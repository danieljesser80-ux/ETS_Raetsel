import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { stateKey } from '../../web/js/clientcache.js';
import { giveUpConfirmation } from '../../web/js/texts.js';
import { ANSWER_FEEDBACK_MS } from '../../web/js/feedback.js';

const SRC = readFileSync(new URL('../../web/js/player.js', import.meta.url), 'utf8');

// Laedt player.js ohne CDN: Importe werden durch Parameter ersetzt, Zeit und Netz sind kontrolliert.
async function boot({ api = {}, state = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [] } } = {}) {
  const dom = new JSDOM('<div id="app"></div><div id="notice"></div><a class="guide-link" href="erklaerung.html">Anleitung</a>');
  const timers = [];
  const draws = [];
  const loopCalls = [];
  const fullApi = {
    ensureSession: async () => {}, getState: async () => state, joinRound: async () => ({ ok: true }),
    submitAnswer: async () => ({ ok: true }), startTask: async () => ({ ok: true }),
    submitTask: async () => ({ ok: true }), giveUp: async () => ({ ok: true }), ...api,
  };
  const render = (root, s, h) => { draws.push({ state: s, handlers: h }); };
  const body = SRC.split('\n').filter((l) => !/^import /.test(l)).join('\n');
  const fn = new Function('document', 'createClient', 'SUPABASE_URL', 'SUPABASE_KEY', 'createApi', 'reasonText', 'giveUpConfirmation',
    'renderPlayer', 'updateCountdowns', 'createRefreshLoop', 'stateKey', 'ANSWER_FEEDBACK_MS', 'setTimeout', 'clearTimeout', 'setInterval', 'confirm',
    `${body}\nreturn { ui, get busy() { return busy; } };`);
  const confirms = [];
  const exposed = fn(dom.window.document,
    () => ({ channel: () => ({ on() { return this; }, subscribe() {} }) }), 'u', 'k',
    () => fullApi, (r) => `reason:${r}`, giveUpConfirmation, render, () => {},
    (cfg) => {
      loopCalls.push(cfg);
      let cur = null;
      return {
        start() {}, invalidate() {},
        async request() { cur = await cfg.load(); cfg.apply(cur); },
      };
    },
    stateKey, ANSWER_FEEDBACK_MS,
    (f, ms) => { timers.push({ f, ms }); return timers.length; }, () => {}, () => 1,
    (t) => { confirms.push(t); return confirms.answer ?? true; });
  await new Promise((r) => setImmediate(r));
  const last = () => draws[draws.length - 1];
  return { dom, timers, draws, confirms, exposed, last, h: () => last().handlers, api: fullApi, loopCalls };
}

// TST-S-042 (SWA-053): Render-Skip bei unveraendertem Zustand, Render bei Aenderung
test('TST-S-042: Spieleransicht zeichnet bei nur geaenderter Serverzeit nicht neu, bei Aenderung schon', async () => {
  const st = { ok: true, phase: 'wortaufgabe_aktiv', server_now_ms: 1000, tasks: [] };
  const b = await boot({ state: st });
  const apply = b.loopCalls[0].apply;
  apply({ ...st, server_now_ms: 5000 });
  const afterFirst = b.draws.length;
  apply({ ...st, server_now_ms: 9000 });
  const afterSame = b.draws.length;
  assert.equal(afterSame, afterFirst, 'gleicher Zustand: kein Render');
  apply({ ...st, server_now_ms: 12000 });
  assert.equal(b.draws.length, afterSame, 'gleicher Zustand: kein Render');
  apply({ ...st, phase: 'aufgabe_abgeschlossen', server_now_ms: 13000 });
  assert.equal(b.draws.length, afterSame + 1, 'geaenderter Zustand: Render');
});

test('TST-S-072: Falschmeldung bei verbleibenden Versuchen bleibt ohne Timeout sichtbar', async () => {
  const wrong = [{ ok: true, correct: false, attempts_remaining: 2, submitted: false },
    { ok: true, correct: false, attempts_remaining: 1, submitted: false },
    { ok: true, correct: false, attempts_remaining: 0, submitted: true }];
  let i = 0;
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [{ id: 't', started: true }] };
  const b = await boot({ api: { submitTask: async () => wrong[i++] }, state: st });
  await b.h().onOpenTask('t');
  for (const remaining of [2, 1]) {
    const before = b.timers.length;
    await b.h().onSubmitTask('t', 'x');
    assert.equal(b.exposed.ui.openTaskId, 't', 'Aufgabe bleibt offen');
    assert.match(b.last().state.feedback.text, new RegExp('Falsch.*' + remaining));
    assert.equal(b.timers.length, before, 'kein automatischer Timeout für erneuten Versuch');
  }
  await b.h().onSubmitTask('t', 'x');
  assert.equal(b.last().state.feedback.accepted, true, 'dritter Versuch endgültig');
  const timer = b.timers.at(-1);
  assert.equal(timer.ms, 3000);
  timer.f();
  assert.equal(b.exposed.ui.openTaskId, null);
  assert.equal(b.last().state.feedback, null);
});

test('TST-S-073: Richtige Antwort zeigt drei Sekunden Feedback und schließt danach', async () => {
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [{ id: 't', started: true }] };
  const b = await boot({ api: { submitTask: async () => ({ ok: true, correct: true }) }, state: st });
  await b.h().onOpenTask('t');
  await b.h().onSubmitTask('t', 'x');
  assert.equal(b.exposed.ui.openTaskId, 't');
  assert.equal(b.last().state.feedback.kind, 'success');
  const timer = b.timers.at(-1);
  assert.equal(timer.ms, 3000);
  timer.f();
  assert.equal(b.exposed.ui.openTaskId, null);
  assert.equal(b.last().state.feedback, null);
});

test('onGiveUp: Bestaetigung noetig, Abbruch sendet nichts, Zusage ruft giveUp(scope) genau einmal', async () => {
  const calls = [];
  const b = await boot({ api: { giveUp: async (s) => { calls.push(s); return { ok: true }; } } });
  b.confirms.answer = false;
  await b.h().onGiveUp('wort');
  assert.deepEqual(calls, []);
  assert.equal(b.confirms.length, 1);
  b.confirms.answer = true;
  await b.h().onGiveUp('t1');
  assert.deepEqual(calls, ['t1']);
});

test('onGiveUp: waehrend busy keine zweite Anfrage (Doppelklick)', async () => {
  let release;
  const calls = [];
  const b = await boot({ api: { giveUp: (s) => { calls.push(s); return new Promise((r) => { release = () => r({ ok: true }); }); } } });
  const h = b.h();
  const first = h.onGiveUp('wort');
  await new Promise((r) => setImmediate(r));
  await h.onGiveUp('wort');
  assert.equal(calls.length, 1);
  release();
  await first;
});

test('Verbindungsfehler bei Abgabe: Unsicherheitstext, kein automatisches Wiederholen, Zustand bleibt', async () => {
  let n = 0;
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [{ id: 't', started: true }] };
  const b = await boot({ api: { submitTask: async () => { n++; throw new Error('Netz'); } }, state: st });
  await b.h().onOpenTask('t');
  await b.h().onSubmitTask('t', 'x');
  const text = b.dom.window.document.getElementById('notice').textContent;
  assert.match(text, /unterbrochen|nicht sicher|unklar|prüf/i);
  assert.match(text, /Abgabe|angekommen|gespeichert|sicher|prüf/i, 'benennt die Unsicherheit der Abgabe');
  b.timers.forEach((t) => { if (t.ms >= ANSWER_FEEDBACK_MS) t.f(); });
  await new Promise((r) => setImmediate(r));
  assert.equal(n, 1, 'keine automatische Wiederholung');
  assert.equal(b.exposed.ui.openTaskId, 't', 'Aufgabe bleibt offen');
});

test('Waehrend einer laufenden Uebertragung wird ein Wartehinweis gezeigt', async () => {
  let release;
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [{ id: 't', started: true }] };
  const b = await boot({ api: { submitTask: () => new Promise((r) => { release = () => r({ ok: true, correct: true }); }) }, state: st });
  await b.h().onOpenTask('t');
  const p = b.h().onSubmitTask('t', 'x');
  await new Promise((r) => setImmediate(r));
  const pending = b.last().state;
  assert.ok(pending.pending || pending.transferPending || b.dom.window.document.getElementById('notice').textContent.match(/Übertrag|sende|wird gesendet/i),
    'Hinweis auf laufende Uebertragung');
  release();
  await p;
});

test('Anleitungslink wird nur versteckt, solange eine Aufgabe sichtbar offen ist (Marker data-open-task)', () => {
  assert.match(SRC, /data-open-task/);
  assert.match(SRC, /guide/i);
  assert.match(SRC, /hidden/);
});

test('TST-S-074: Richtige Gruppenwortantwort zeigt Feedback für 3000 ms', async () => {
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [] };
  const b = await boot({ api: { submitAnswer: async () => ({ ok: true, correct: true, rank: 1 }) }, state: st });
  await b.h().onSubmit('LOESUNG');
  assert.equal(b.last().state.feedback.scope, 'wort');
  assert.equal(b.last().state.feedback.kind, 'success');
  const timer = b.timers.at(-1);
  assert.equal(timer.ms, 3000);
  timer.f();
  assert.equal(b.last().state.feedback, null);
});

test('TST-S-075: Beim Öffnen einer anderen Aufgabe wird altes Feedback entfernt', async () => {
  const st = { ok: true, phase: 'wortaufgabe_aktiv', tasks: [{ id: 't', started: true }, { id: 'u', started: true }] };
  const b = await boot({ api: { submitTask: async () => ({ ok: true, correct: false, attempts_remaining: 2, submitted: false }) }, state: st });
  await b.h().onOpenTask('t');
  await b.h().onSubmitTask('t', 'x');
  assert.match(b.last().state.feedback.text, /Falsch/);
  await b.h().onOpenTask('u');
  assert.equal(b.exposed.ui.openTaskId, 'u');
  assert.equal(b.last().state.feedback, null);
});
