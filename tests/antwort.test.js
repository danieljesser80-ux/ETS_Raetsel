import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, checkAnswer, ATTEMPT_INTERVAL_MS, canSubmit } from '../src/core/index.js';

test('TST-U-006: normalizeAnswer trimmt und macht Großbuchstaben', () => {
  assert.equal(normalizeAnswer('  akku '), 'AKKU');
  assert.equal(normalizeAnswer('Wallbox'), 'WALLBOX');
  assert.equal(normalizeAnswer('AKKU'), 'AKKU');
  assert.equal(normalizeAnswer('\tmotor\n'), 'MOTOR');
});

test('TST-U-006: normalizeAnswer liefert für Nicht-Strings leeren String', () => {
  for (const v of [null, undefined, 5, {}, [], true, NaN]) {
    assert.equal(normalizeAnswer(v), '');
  }
  assert.equal(normalizeAnswer(''), '');
  assert.equal(normalizeAnswer('   '), '');
});

test('TST-U-006: checkAnswer richtig, auch bei Groß-/Kleinschreibung und Leerzeichen', () => {
  assert.equal(checkAnswer('AKKU', 'AKKU'), true);
  assert.equal(checkAnswer('akku', 'AKKU'), true);
  assert.equal(checkAnswer('  Akku  ', 'AKKU'), true);
  assert.equal(checkAnswer('AKKU', 'akku'), true);
});

test('TST-U-006: checkAnswer falsch bei falscher Antwort', () => {
  assert.equal(checkAnswer('MOTOR', 'AKKU'), false);
  assert.equal(checkAnswer('AKK', 'AKKU'), false);
  assert.equal(checkAnswer('AKKUU', 'AKKU'), false);
  assert.equal(checkAnswer('AK KU', 'AKKU'), false);
});

test('TST-U-006: leere Eingabe ist falsch', () => {
  assert.equal(checkAnswer('', 'AKKU'), false);
  assert.equal(checkAnswer('   ', 'AKKU'), false);
  assert.equal(checkAnswer(null, 'AKKU'), false);
  assert.equal(checkAnswer(undefined, 'AKKU'), false);
});

test('TST-U-006: Umlaute werden nicht umgeschrieben', () => {
  assert.equal(checkAnswer('LADESÄULE', 'LADESAEULE'), false);
  assert.equal(checkAnswer('ladesäule', 'LADESAEULE'), false);
  assert.equal(checkAnswer('STEUERGERÄT', 'STEUERGERAET'), false);
  assert.equal(checkAnswer('ladesaeule', 'LADESAEULE'), true);
  assert.equal(checkAnswer('ä', 'AE'), false);
});

test('TST-U-006: ATTEMPT_INTERVAL_MS = 3000', () => {
  assert.equal(ATTEMPT_INTERVAL_MS, 3000);
});

const base = { memberGroupId: 'g1', groupId: 'g1', lastAttemptMs: null, nowMs: 100000, alreadySolved: false };

test('TST-U-006: canSubmit erlaubt ersten Versuch (null/undefined)', () => {
  assert.deepEqual(canSubmit(base), { ok: true });
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: undefined }), { ok: true });
  const { lastAttemptMs, ...ohne } = base;
  assert.deepEqual(canSubmit(ohne), { ok: true });
});

test('TST-U-006: Rate-Limit: 2999 ms zu_schnell, 3000 ms erlaubt', () => {
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: 100000 - 2999 }), { ok: false, reason: 'zu_schnell' });
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: 100000 - 3000 }), { ok: true });
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: 100000 - 3001 }), { ok: true });
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: 100000 }), { ok: false, reason: 'zu_schnell' });
  assert.deepEqual(canSubmit({ ...base, lastAttemptMs: 100000 - 1 }), { ok: false, reason: 'zu_schnell' });
});

test('TST-U-006: fremde Gruppe (abweichend oder fehlend)', () => {
  assert.deepEqual(canSubmit({ ...base, memberGroupId: 'g2' }), { ok: false, reason: 'fremde_gruppe' });
  assert.deepEqual(canSubmit({ ...base, memberGroupId: undefined }), { ok: false, reason: 'fremde_gruppe' });
  assert.deepEqual(canSubmit({ ...base, memberGroupId: null }), { ok: false, reason: 'fremde_gruppe' });
});

test('TST-U-006: bereits gelöst', () => {
  assert.deepEqual(canSubmit({ ...base, alreadySolved: true }), { ok: false, reason: 'bereits_geloest' });
});

test('TST-U-006: Prüfreihenfolge fremde_gruppe vor bereits_geloest vor zu_schnell', () => {
  const schnell = { lastAttemptMs: 99999 };
  assert.equal(canSubmit({ ...base, ...schnell, memberGroupId: 'g2', alreadySolved: true }).reason, 'fremde_gruppe');
  assert.equal(canSubmit({ ...base, ...schnell, alreadySolved: true }).reason, 'bereits_geloest');
  assert.equal(canSubmit({ ...base, ...schnell }).reason, 'zu_schnell');
  assert.equal(canSubmit({ ...base, ...schnell, memberGroupId: undefined }).reason, 'fremde_gruppe');
});
