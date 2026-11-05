import test from 'node:test';
import assert from 'node:assert/strict';
import { validateName } from '../src/core/index.js';

test('TST-U-002: gültiger Name mit 2 Zeichen wird angenommen', () => {
  assert.deepEqual(validateName('Al', []), { ok: true, name: 'Al' });
});

test('TST-U-002: Name mit 20 Zeichen wird angenommen', () => {
  const n = 'a'.repeat(20);
  assert.deepEqual(validateName(n, []), { ok: true, name: n });
});

test('TST-U-002: Name mit 21 Zeichen ist zu_lang', () => {
  assert.deepEqual(validateName('a'.repeat(21), []), { ok: false, reason: 'zu_lang' });
});

test('TST-U-002: Name mit 1 Zeichen ist zu_kurz', () => {
  assert.deepEqual(validateName('A', []), { ok: false, reason: 'zu_kurz' });
});

test('TST-U-002: leerer Name, nur Leerzeichen und Nicht-Strings sind leer', () => {
  for (const v of ['', '   ', '\t\n', null, undefined, 42, {}, []]) {
    assert.deepEqual(validateName(v, []), { ok: false, reason: 'leer' }, String(v));
  }
});

test('TST-U-002: Rand-Leerzeichen werden entfernt', () => {
  assert.deepEqual(validateName('  Anna  ', []), { ok: true, name: 'Anna' });
});

test('TST-U-002: Länge wird nach dem Trimmen geprüft', () => {
  assert.deepEqual(validateName('  A  ', []), { ok: false, reason: 'zu_kurz' });
  assert.equal(validateName(' ' + 'a'.repeat(20) + ' ', []).ok, true);
  assert.deepEqual(validateName(' ' + 'a'.repeat(21) + ' ', []), { ok: false, reason: 'zu_lang' });
});

test('TST-U-002: Zeichen sind Unicode-Codepoints (Emoji zählt 1)', () => {
  assert.equal(validateName('😀'.repeat(20), []).ok, true);
  assert.deepEqual(validateName('😀'.repeat(21), []), { ok: false, reason: 'zu_lang' });
  assert.deepEqual(validateName('😀', []), { ok: false, reason: 'zu_kurz' });
  assert.equal(validateName('😀😀', []).ok, true);
});

test('TST-U-002: Umlaute und Sonderzeichen werden angenommen', () => {
  assert.deepEqual(validateName('Jörg', []), { ok: true, name: 'Jörg' });
  assert.deepEqual(validateName('Zoë-Ann', []), { ok: true, name: 'Zoë-Ann' });
});

test('TST-U-002: doppelter Name ohne Beachtung der Groß-/Kleinschreibung', () => {
  assert.deepEqual(validateName('anna', ['Anna']), { ok: false, reason: 'doppelt' });
  assert.deepEqual(validateName('ANNA', ['anna']), { ok: false, reason: 'doppelt' });
  assert.deepEqual(validateName('Anna', ['Anna']), { ok: false, reason: 'doppelt' });
});

test('TST-U-002: doppelter Name wird getrimmt verglichen (beide Seiten)', () => {
  assert.deepEqual(validateName('  Anna ', ['Anna']), { ok: false, reason: 'doppelt' });
  assert.deepEqual(validateName('Anna', ['  anna  ']), { ok: false, reason: 'doppelt' });
});

test('TST-U-002: anderer Name unter vorhandenen ist gültig', () => {
  assert.deepEqual(validateName('Berta', ['Anna', 'Carl']), { ok: true, name: 'Berta' });
});

test('TST-U-002: Prüfreihenfolge leer vor zu_kurz vor zu_lang vor doppelt', () => {
  assert.equal(validateName('', ['']).reason, 'leer');
  assert.equal(validateName('A', ['A']).reason, 'zu_kurz');
  const lang = 'a'.repeat(21);
  assert.equal(validateName(lang, [lang]).reason, 'zu_lang');
});
