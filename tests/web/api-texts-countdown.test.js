import test from 'node:test';
import assert from 'node:assert/strict';
import './dom-helper.js';

const { createApi } = await import('../../web/js/api.js');
const { reasonText, phaseText } = await import('../../web/js/texts.js');
const { countdownSeconds, formatClock } = await import('../../web/js/countdown.js');

function fakeClient({ data = { ok: true }, error = null, session = { user: 1 }, authError = null } = {}) {
  const calls = { rpc: [], signIn: 0, getSession: 0 };
  return {
    calls,
    rpc: async (name, args) => { calls.rpc.push([name, args]); return { data, error }; },
    auth: {
      getSession: async () => { calls.getSession++; return { data: { session }, error: authError }; },
      signInAnonymously: async () => { calls.signIn++; return { data: {}, error: authError }; },
    },
  };
}

test('TST-U-001: ensureSession meldet bei vorhandener Sitzung nicht neu an', async () => {
  const c = fakeClient();
  await createApi(c).ensureSession();
  assert.equal(c.calls.getSession, 1);
  assert.equal(c.calls.signIn, 0);
});

test('TST-U-001: ensureSession meldet ohne Sitzung anonym an', async () => {
  const c = fakeClient({ session: null });
  await createApi(c).ensureSession();
  assert.equal(c.calls.signIn, 1);
});

test('TST-U-001: ensureSession wirft bei Anmeldefehler', async () => {
  const c = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInAnonymously: async () => ({ data: null, error: { message: 'kaputt' } }),
    },
  };
  await assert.rejects(() => createApi(c).ensureSession());
});

test('TST-U-008: Spieler-Methoden rufen die richtigen RPCs auf und liefern data', async () => {
  const payload = { ok: true, phase: 'anmeldung' };
  const c = fakeClient({ data: payload });
  const api = createApi(c);
  assert.deepEqual(await api.joinRound('Anna'), payload);
  assert.deepEqual(await api.getState(), payload);
  assert.deepEqual(await api.submitAnswer('MOTOR'), payload);
  assert.deepEqual(c.calls.rpc[0], ['join_round', { p_name: 'Anna' }]);
  assert.equal(c.calls.rpc[1][0], 'get_state');
  assert.deepEqual(c.calls.rpc[2], ['submit_answer', { p_answer: 'MOTOR' }]);
});

test('TST-U-009: Admin-Methoden rufen die richtigen RPCs mit p_code auf', async () => {
  const c = fakeClient();
  const api = createApi(c);
  await api.admin.startRegistration('geheim', 300);
  await api.admin.closeRegistration('geheim');
  await api.admin.formGroups('geheim');
  await api.admin.overview('geheim');
  await api.admin.finish('geheim');
  await api.admin.reset('geheim');
  assert.deepEqual(c.calls.rpc, [
    ['admin_start_registration', { p_code: 'geheim', p_seconds: 300 }],
    ['admin_close_registration', { p_code: 'geheim' }],
    ['admin_form_groups', { p_code: 'geheim' }],
    ['admin_overview', { p_code: 'geheim' }],
    ['admin_finish', { p_code: 'geheim' }],
    ['admin_reset', { p_code: 'geheim' }],
  ]);
});

test('TST-U-008: fachlicher Fehler kommt als data zurück, Transportfehler wirft Error', async () => {
  const fach = { ok: false, reason: 'doppelt' };
  assert.deepEqual(await createApi(fakeClient({ data: fach })).joinRound('x'), fach);
  const c = fakeClient({ data: null, error: { message: 'Netzwerk weg' } });
  const api = createApi(c);
  await assert.rejects(() => api.getState(), (e) => e instanceof Error && e.message.length > 0);
  await assert.rejects(() => api.admin.overview('x'), Error);
});

const REASONS = ['leer', 'zu_kurz', 'zu_lang', 'doppelt', 'anmeldung_geschlossen', 'voll', 'nicht_angemeldet',
  'keine_gruppe', 'falsche_phase', 'bereits_geloest', 'zu_schnell', 'nicht_berechtigt', 'anmeldung_offen',
  'zu_wenige', 'nicht_teilbar', 'ungueltige_dauer', 'zu_wenige_namen'];

for (const r of REASONS) {
  test(`TST-UI: reasonText('${r}') ist eine deutsche Meldung`, () => {
    const t = reasonText(r);
    assert.equal(typeof t, 'string');
    assert.ok(t.trim().length > 3);
    assert.notEqual(t.trim(), r);
    assert.ok(!t.includes('undefined'));
  });
}

test('TST-UI: reasonText liefert verschiedene Meldungen für verschiedene Gründe', () => {
  const set = new Set(REASONS.map(reasonText));
  assert.ok(set.size >= REASONS.length - 3);
});

test('TST-UI: reasonText bei unbekanntem Grund ist allgemein, nie undefined oder Rohcode allein', () => {
  for (const r of ['gibt_es_nicht', undefined, null, '']) {
    const t = reasonText(r);
    assert.equal(typeof t, 'string');
    assert.ok(t.trim().length > 3);
    assert.notEqual(t.trim(), r);
    assert.ok(!t.includes('undefined'));
  }
});

test('TST-UI: phaseText für alle fünf Phasen nicht leer und verschieden', () => {
  const phases = ['vorbereitet', 'anmeldung', 'gruppen_eingeteilt', 'wortaufgabe_aktiv', 'aufgabe_abgeschlossen'];
  const texts = phases.map(phaseText);
  for (const [i, t] of texts.entries()) {
    assert.equal(typeof t, 'string');
    assert.ok(t.trim().length > 0);
    assert.notEqual(t, phases[i]);
  }
  assert.equal(new Set(texts).size, 5);
});

test('TST-U-003: countdownSeconds ohne Frist ist null', () => {
  assert.equal(countdownSeconds({ deadline_ms: null, server_now_ms: 0, fetchedAtMs: 0 }, 0), null);
});

test('TST-U-003: countdownSeconds ohne Geräteabweichung', () => {
  const s = { deadline_ms: 300000, server_now_ms: 0, fetchedAtMs: 1000 };
  assert.equal(countdownSeconds(s, 1000), 300);
  assert.equal(countdownSeconds(s, 61000), 240);
});

test('TST-U-003: countdownSeconds nutzt Offset Server/Gerät (falsche Geräteuhr)', () => {
  // Gerät geht 1 Stunde vor; Serverzeit 10_000, Frist 70_000, lokal abgerufen bei 3_610_000
  const s = { deadline_ms: 70000, server_now_ms: 10000, fetchedAtMs: 3610000 };
  assert.equal(countdownSeconds(s, 3610000), 60);
  assert.equal(countdownSeconds(s, 3640000), 30);
});

test('TST-U-003: countdownSeconds rundet auf (ceil)', () => {
  const s = { deadline_ms: 10001, server_now_ms: 0, fetchedAtMs: 0 };
  assert.equal(countdownSeconds(s, 0), 11);
  assert.equal(countdownSeconds(s, 1), 10);
  assert.equal(countdownSeconds({ deadline_ms: 1000, server_now_ms: 0, fetchedAtMs: 0 }, 1), 1);
});

test('TST-U-003: countdownSeconds nie negativ, bei Ablauf 0', () => {
  const s = { deadline_ms: 5000, server_now_ms: 0, fetchedAtMs: 0 };
  assert.equal(countdownSeconds(s, 5000), 0);
  assert.equal(countdownSeconds(s, 99999), 0);
  assert.ok(Number.isInteger(countdownSeconds(s, 1234)));
});

test('TST-UI: formatClock formatiert M:SS', () => {
  assert.equal(formatClock(300), '5:00');
  assert.equal(formatClock(65), '1:05');
  assert.equal(formatClock(9), '0:09');
  assert.equal(formatClock(0), '0:00');
  assert.equal(formatClock(3599), '59:59');
});
