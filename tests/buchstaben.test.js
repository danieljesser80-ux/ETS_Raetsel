import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, wordsForGroupSize, assignLetters } from '../src/core/index.js';
import { lcg, SEEDS, sortedChars } from './helpers.js';

const SYN = ['AB', 'QUAK', 'ZEBRA', 'QUADER', 'ZITRONE', 'XYLOPHON', 'SCHNURREN', 'ABCDEFGHIJKLMN'];
const members = (n) => Array.from({ length: n }, (_, i) => `m${i}`);

test('TST-U-005: WORDS bleibt leer; keine Standardloesungen im Repository', () => {
  assert.ok(Array.isArray(WORDS));
  assert.equal(WORDS.length, 0);
});

test('TST-U-035: Wortauswahl ist unabhaengig von Gruppengroesse und Wortlaenge', () => {
  for (let n = 1; n <= 14; n++) assert.deepEqual(wordsForGroupSize(n, SYN), SYN);
  assert.deepEqual(wordsForGroupSize(4), []);
});

test('TST-U-035: wordsForGroupSize gibt eine Kopie zurueck', () => {
  const copy = [...SYN];
  const result = wordsForGroupSize(4, SYN);
  assert.deepEqual(result, SYN);
  assert.notEqual(result, SYN);
  assert.deepEqual(SYN, copy);
});

test('TST-U-035: alle Buchstaben werden fuer kurze und lange Woerter verteilt', () => {
  for (const word of SYN) {
    for (let n = 1; n <= 14; n++) {
      for (const seed of SEEDS) {
        const ms = members(n);
        const result = assignLetters(word, ms, lcg(seed));
        assert.equal(result.ok, true, `${word} / ${n}`);
        assert.deepEqual(Object.keys(result.assignment).sort(), [...ms].sort());
        const assigned = Object.values(result.assignment).flat();
        assert.deepEqual(sortedChars(assigned.join('')), sortedChars(word));
        const counts = ms.map((id) => result.assignment[id].length);
        assert.ok(Math.max(...counts) - Math.min(...counts) <= 1, `${word} / ${n}: ${counts}`);
      }
    }
  }
});

test('TST-U-035: faire Verteilung fuer Woerter mit mehr als zwei Buchstaben je Mitglied', () => {
  for (const seed of SEEDS) {
    const result = assignLetters('ABCDEFGHIJKLMN', members(4), lcg(seed));
    assert.equal(result.ok, true);
    const counts = Object.values(result.assignment).map((letters) => letters.length);
    assert.deepEqual(counts.sort((a,b) => a-b), [3,3,4,4]);
  }
});

test('TST-U-035: kuerzeres Wort als die Gruppe ist erlaubt', () => {
  const result = assignLetters('AB', members(4), lcg(1));
  assert.equal(result.ok, true);
  assert.equal(Object.values(result.assignment).flat().length, 2);
  assert.equal(Object.values(result.assignment).filter((letters) => letters.length === 0).length, 2);
});

test('TST-U-035: ungueltige Woerter und leere Gruppen werden abgewiesen', () => {
  for (const word of ['', 'quak', 'QU AK', 'QUÄK', 'QUAK1', 'AB-C', 'KÖRPER']) {
    assert.deepEqual(assignLetters(word, members(4), lcg(1)), { ok: false, reason: 'ungueltiges_wort' });
  }
  assert.deepEqual(assignLetters('AB', [], lcg(1)), { ok: false, reason: 'keine_mitglieder' });
});

test('TST-U-035: deterministisch bei gleichem Seed und Eingabe bleibt unveraendert', () => {
  const ms = members(5);
  const before = [...ms];
  const a = assignLetters('ZITRONE', ms, lcg(11));
  const b = assignLetters('ZITRONE', ms, lcg(11));
  assert.deepEqual(a, b);
  assert.deepEqual(ms, before);
});
