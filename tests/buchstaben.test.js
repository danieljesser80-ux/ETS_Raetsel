import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, wordsForGroupSize, assignLetters } from '../src/core/index.js';
import { lcg, SEEDS, sortedChars } from './helpers.js';

// AEN-053/SWA-045: keine öffentlichen Standardwörter; Tests verwenden künstliche Wörter.
const SYN = ['QUAK', 'ZEBRA', 'QUADER', 'ZITRONE', 'XYLOPHON', 'SCHNURREN', 'PIXEL', 'MELONEN'];

const members = (n) => Array.from({ length: n }, (_, i) => `m${i}`);

test('TST-U-005: WORDS ist leer (keine veröffentlichten Standardlösungen)', () => {
  assert.ok(Array.isArray(WORDS));
  assert.equal(WORDS.length, 0);
});

test('TST-U-005: wordsForGroupSize ohne Liste nutzt das leere WORDS und liefert nichts', () => {
  for (let n = 1; n <= 14; n++) assert.deepEqual(wordsForGroupSize(n), []);
});

test('TST-U-005: wordsForGroupSize(n, liste) liefert exakt Wörter mit n <= Länge <= 2n (höchstens 9)', () => {
  for (let n = 2; n <= 14; n++) {
    const got = wordsForGroupSize(n, SYN);
    const want = SYN.filter((w) => w.length >= n && w.length <= Math.min(2 * n, 9));
    assert.deepEqual([...got].sort(), [...want].sort(), `n=${n}`);
  }
});

test('TST-U-005: wordsForGroupSize verändert die übergebene Liste nicht', () => {
  const copy = [...SYN];
  wordsForGroupSize(4, SYN);
  assert.deepEqual(SYN, copy);
});

test('TST-U-011: Gruppengröße 1 erlaubt jedes Wort der Liste, Größen 2..9 haben Wörter', () => {
  assert.deepEqual([...wordsForGroupSize(1, SYN)].sort(), [...SYN].sort());
  assert.notEqual(wordsForGroupSize(1, SYN), SYN);
  for (let n = 2; n <= 9; n++) assert.ok(wordsForGroupSize(n, SYN).length > 0, `n=${n}`);
});

test('TST-U-011: ein Mitglied erhält alle Buchstaben des Worts', () => {
  for (const seed of SEEDS) {
    for (const word of SYN) {
      const res = assignLetters(word, ['solo'], lcg(seed));
      assert.equal(res.ok, true);
      assert.deepEqual(sortedChars(res.assignment.solo.join('')), sortedChars(word));
    }
  }
  assert.deepEqual(assignLetters('ab', ['solo'], lcg(1)), { ok: false, reason: 'ungueltiges_wort' });
});

test('TST-U-005: für Gruppengrößen 4..6 gibt es mindestens ein Wort der Liste', () => {
  for (const n of [4, 5, 6]) assert.ok(wordsForGroupSize(n, SYN).length > 0, `n=${n}`);
});

test('TST-U-005: alle Wörter × alle gültigen Mitgliederzahlen × Seeds: Multimenge und 1..2 pro Mitglied', () => {
  for (const word of SYN) {
    for (let n = Math.ceil(word.length / 2); n <= word.length; n++) {
      for (const seed of SEEDS) {
        const ms = members(n);
        const res = assignLetters(word, ms, lcg(seed));
        assert.equal(res.ok, true, `${word} n=${n}`);
        assert.deepEqual(Object.keys(res.assignment).sort(), [...ms].sort());
        const all = [];
        for (const m of ms) {
          const letters = res.assignment[m];
          assert.ok(Array.isArray(letters));
          assert.ok(letters.length >= 1 && letters.length <= 2, `${word} n=${n} ${m}`);
          all.push(...letters);
        }
        assert.equal(sortedChars(all.join('')), sortedChars(word), `${word} n=${n}`);
      }
    }
  }
});

test('TST-U-005: Gruppengrößen 4..6 mit passenden Wörtern (wordsForGroupSize)', () => {
  for (const n of [4, 5, 6]) {
    for (const word of wordsForGroupSize(n, SYN)) {
      const res = assignLetters(word, members(n), lcg(7));
      assert.equal(res.ok, true, `${word} n=${n}`);
    }
  }
});

test('TST-U-005: wiederholte Buchstaben bleiben als Multimenge erhalten', () => {
  const res = assignLetters('QUAK', members(4), lcg(5));
  assert.equal(res.ok, true);
  assert.deepEqual(Object.values(res.assignment).flat().sort(), ['A', 'K', 'Q', 'U']);
  const res2 = assignLetters('MELONEN', members(4), lcg(5));
  assert.deepEqual(Object.values(res2.assignment).flat().sort(), [...'MELONEN'].sort());
});

test('TST-U-005: Wortlänge = Mitgliederzahl ergibt genau einen Buchstaben je Mitglied', () => {
  for (const seed of SEEDS) {
    const res = assignLetters('QUAK', members(4), lcg(seed));
    for (const m of members(4)) assert.equal(res.assignment[m].length, 1);
  }
});

test('TST-U-005: Wortlänge = 2 × Mitglieder ergibt genau zwei Buchstaben je Mitglied', () => {
  for (const seed of SEEDS) {
    assert.equal(assignLetters('SCHNURREN', members(5), lcg(seed)).ok, true); // 9 Buchstaben, 5 Mitglieder
    assert.equal(assignLetters('ZEBRA', members(3), lcg(seed)).ok, true);
    const res3 = assignLetters('QUADER', members(3), lcg(seed)); // 6 = 2*3
    for (const m of members(3)) assert.equal(res3.assignment[m].length, 2);
  }
});

test('TST-U-005: Überschuss geht an verschiedene Mitglieder (1..2 je Mitglied)', () => {
  for (const seed of SEEDS) {
    const res = assignLetters('XYLOPHON', members(6), lcg(seed)); // 8 Buchstaben, 2 Überschuss
    const twos = Object.values(res.assignment).filter((l) => l.length === 2).length;
    assert.equal(twos, 2);
  }
});

test('TST-U-005: ungültige Wörter → ungueltiges_wort', () => {
  for (const w of ['', 'quak', 'QU AK', 'QUÄK', 'QUAK1', 'AB-C', 'KÖRPER']) {
    assert.deepEqual(assignLetters(w, members(4), lcg(1)), { ok: false, reason: 'ungueltiges_wort' }, w);
  }
});

test('TST-U-005: ungeeignete Wortlänge → wortlaenge', () => {
  assert.deepEqual(assignLetters('QUAK', members(5), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('QUAK', members(6), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('ABCDEFGHIJKLMN', members(6), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('ABCDEFGHIJ', members(4), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('ZEBRA', members(2), lcg(1)), { ok: false, reason: 'wortlaenge' });
});

test('TST-U-005: Grenzen der Wortlänge: Länge = n und Länge = 2n sind gültig', () => {
  assert.equal(assignLetters('QUAK', members(4), lcg(1)).ok, true);
  assert.equal(assignLetters('QUAK', members(2), lcg(1)).ok, true);
  assert.equal(assignLetters('QUAK', members(3), lcg(1)).ok, true);
});

test('TST-U-005: deterministisch bei gleichem Seed', () => {
  const a = assignLetters('ZITRONE', members(6), lcg(11));
  const b = assignLetters('ZITRONE', members(6), lcg(11));
  assert.deepEqual(a, b);
});

test('TST-U-005: Eingabe memberIds wird nicht verändert', () => {
  const ms = members(5);
  const copy = [...ms];
  assignLetters('SCHNURREN', ms, lcg(2));
  assert.deepEqual(ms, copy);
});
