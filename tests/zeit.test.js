import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REGISTRATION_MS,
  registrationDeadline,
  isRegistrationOpen,
  remainingSeconds,
  PHASES,
  canTransition,
} from '../src/core/index.js';

test('TST-U-003: Konstanten', () => {
  assert.equal(REGISTRATION_MS, 300000);
  assert.deepEqual(PHASES, [
    'vorbereitet',
    'anmeldung',
    'gruppen_eingeteilt',
    'wortaufgabe_aktiv',
    'aufgabe_abgeschlossen',
  ]);
});

test('TST-U-003: registrationDeadline = Start + 300000', () => {
  assert.equal(registrationDeadline(0), 300000);
  assert.equal(registrationDeadline(1700000000000), 1700000000000 + 300000);
});

test('TST-U-003: Anmeldung offen bei 299999 ms, geschlossen bei 300000 ms', () => {
  const start = 1000;
  const deadlineMs = registrationDeadline(start);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: start, closedEarly: false }), true);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: start + 299999, closedEarly: false }), true);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: start + 300000, closedEarly: false }), false);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: start + 300001, closedEarly: false }), false);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: start + 10 * 300000, closedEarly: false }), false);
});

test('TST-U-003: vorzeitig geschlossen ist nie offen', () => {
  const deadlineMs = 300000;
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: 0, closedEarly: true }), false);
  assert.equal(isRegistrationOpen({ deadlineMs, nowMs: 299999, closedEarly: true }), false);
});

test('TST-U-003: closedEarly fehlend gilt als nicht geschlossen', () => {
  assert.equal(isRegistrationOpen({ deadlineMs: 300000, nowMs: 5 }), true);
});

test('TST-U-003: remainingSeconds rundet auf', () => {
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 0 }), 300);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 1 }), 300);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 999 }), 300);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 1000 }), 299);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 299000 }), 1);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 299999 }), 1);
});

test('TST-U-003: remainingSeconds ist 0 ab Ablauf und nie negativ', () => {
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 300000 }), 0);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 300001 }), 0);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 9999999 }), 0);
});

test('TST-U-003: Gerätezeitabweichung (offsetMs) wird berücksichtigt', () => {
  // Gerät geht 10 s nach: Serverzeit - Gerätezeit = +10000
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 0, offsetMs: 10000 }), 290);
  // Gerät geht 10 s vor
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 0, offsetMs: -10000 }), 310);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 295000, offsetMs: 5000 }), 0);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 295000, offsetMs: 9000 }), 0);
  assert.equal(remainingSeconds({ deadlineMs: 300000, nowMs: 0, offsetMs: 0 }), 300);
});

test('TST-U-003: Rückgabe von remainingSeconds ist ganzzahlig', () => {
  for (const now of [0, 1, 333, 12345, 299999, 400000]) {
    assert.ok(Number.isInteger(remainingSeconds({ deadlineMs: 300000, nowMs: now })));
  }
});

test('TST-U-003: erlaubte Phasenübergänge', () => {
  assert.equal(canTransition('vorbereitet', 'anmeldung'), true);
  assert.equal(canTransition('anmeldung', 'gruppen_eingeteilt'), true);
  assert.equal(canTransition('gruppen_eingeteilt', 'wortaufgabe_aktiv'), true);
  assert.equal(canTransition('wortaufgabe_aktiv', 'aufgabe_abgeschlossen'), true);
  assert.equal(canTransition('anmeldung', 'anmeldung'), true);
});

test('TST-U-003: alle übrigen Phasenübergänge sind ungültig', () => {
  const allowed = new Set([
    'vorbereitet>anmeldung',
    'anmeldung>gruppen_eingeteilt',
    'gruppen_eingeteilt>wortaufgabe_aktiv',
    'wortaufgabe_aktiv>aufgabe_abgeschlossen',
    'anmeldung>anmeldung',
  ]);
  for (const from of PHASES) {
    for (const to of PHASES) {
      assert.equal(canTransition(from, to), allowed.has(`${from}>${to}`), `${from} -> ${to}`);
    }
  }
});

test('TST-U-003: unbekannte Phasen sind ungültig', () => {
  assert.equal(canTransition('unbekannt', 'anmeldung'), false);
  assert.equal(canTransition('vorbereitet', 'unbekannt'), false);
  assert.equal(canTransition(undefined, undefined), false);
  assert.equal(canTransition(null, 'anmeldung'), false);
  assert.equal(canTransition('', ''), false);
});
