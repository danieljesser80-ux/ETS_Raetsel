import test from 'node:test';
import assert from 'node:assert/strict';
import { WORDS, wordsForGroupSize, assignLetters } from '../src/core/index.js';
import { lcg, SEEDS, sortedChars } from './helpers.js';

const EXPECTED = [
  'AKKU', 'MOTOR', 'RADAR', 'TURBO', 'REIFEN', 'BREMSE', 'HYBRID', 'SENSOR', 'INVERTER',
  'BATTERIE', 'WALLBOX', 'GETRIEBE', 'KUPPLUNG', 'LENKRAD', 'FAHRWERK', 'LADEKABEL',
  'LADESAEULE', 'KAROSSERIE', 'REICHWEITE', 'REKUPERATION', 'ELEKTROMOTOR', 'STROMLADER',
  'SCHEINWERFER', 'WECHSELRICHTER', 'STEUERGERAET',
];

const members = (n) => Array.from({ length: n }, (_, i) => `m${i}`);

test('TST-U-005: WORDS enthält die Wörter des Vertrags, nur A–Z, ohne Duplikate', () => {
  for (const w of EXPECTED) assert.ok(WORDS.includes(w), w);
  assert.equal(new Set(WORDS).size, WORDS.length);
  for (const w of WORDS) assert.match(w, /^[A-Z]+$/);
});

test('TST-U-005: WORDS hat 25 Einträge', () => {
  assert.equal(WORDS.length, 25);
});

test('TST-U-005: wordsForGroupSize liefert exakt Wörter mit n <= Länge <= 2n', () => {
  for (let n = 1; n <= 8; n++) {
    const got = wordsForGroupSize(n);
    const want = WORDS.filter((w) => w.length >= n && w.length <= 2 * n);
    assert.deepEqual([...got].sort(), [...want].sort(), `n=${n}`);
  }
});

test('TST-U-005: für Gruppengrößen 4..6 gibt es mindestens ein Wort', () => {
  for (const n of [4, 5, 6]) assert.ok(wordsForGroupSize(n).length > 0, `n=${n}`);
});

test('TST-U-005: alle Wörter × alle gültigen Mitgliederzahlen × Seeds: Multimenge und 1..2 pro Mitglied', () => {
  for (const word of WORDS) {
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
    for (const word of wordsForGroupSize(n)) {
      const res = assignLetters(word, members(n), lcg(7));
      assert.equal(res.ok, true, `${word} n=${n}`);
    }
  }
});

test('TST-U-005: wiederholte Buchstaben bleiben als Multimenge erhalten', () => {
  const res = assignLetters('AKKU', members(4), lcg(5));
  assert.equal(res.ok, true);
  const all = Object.values(res.assignment).flat().sort();
  assert.deepEqual(all, ['A', 'K', 'K', 'U']);
  const res2 = assignLetters('KAROSSERIE', members(5), lcg(5));
  assert.deepEqual(Object.values(res2.assignment).flat().sort(), [...'KAROSSERIE'].sort());
});

test('TST-U-005: Wortlänge = Mitgliederzahl ergibt genau einen Buchstaben je Mitglied', () => {
  for (const seed of SEEDS) {
    const res = assignLetters('AKKU', members(4), lcg(seed));
    for (const m of members(4)) assert.equal(res.assignment[m].length, 1);
  }
});

test('TST-U-005: Wortlänge = 2 × Mitglieder ergibt genau zwei Buchstaben je Mitglied', () => {
  for (const seed of SEEDS) {
    const res = assignLetters('LADEKABEL', members(5).slice(0, 5), lcg(seed)); // 9 Buchstaben, 5 Mitglieder
    assert.equal(res.ok, true);
    const res2 = assignLetters('MOTOR', members(3), lcg(seed)); // 5 Buchstaben, 3 Mitglieder
    assert.equal(res2.ok, true);
    const res3 = assignLetters('REIFEN', members(3), lcg(seed)); // 6 = 2*3
    for (const m of members(3)) assert.equal(res3.assignment[m].length, 2);
  }
});

test('TST-U-005: Überschuss geht an verschiedene Mitglieder (1..2 je Mitglied)', () => {
  for (const seed of SEEDS) {
    const res = assignLetters('ELEKTROMOTOR', members(8), lcg(seed)); // 12 Buchstaben, 4 Überschuss
    const twos = Object.values(res.assignment).filter((l) => l.length === 2).length;
    assert.equal(twos, 4);
  }
});

test('TST-U-005: ungültige Wörter → ungueltiges_wort', () => {
  for (const w of ['', 'akku', 'AKK U', 'MÖTOR', 'MOTOR1', 'AB-C', 'LADESÄULE']) {
    assert.deepEqual(assignLetters(w, members(4), lcg(1)), { ok: false, reason: 'ungueltiges_wort' }, w);
  }
});

test('TST-U-005: ungeeignete Wortlänge → wortlaenge', () => {
  assert.deepEqual(assignLetters('AKKU', members(5), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('AKKU', members(6), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('WECHSELRICHTER', members(6), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('REICHWEITE', members(4), lcg(1)), { ok: false, reason: 'wortlaenge' });
  assert.deepEqual(assignLetters('RADAR', members(2), lcg(1)), { ok: false, reason: 'wortlaenge' });
});

test('TST-U-005: Grenzen der Wortlänge: Länge = n und Länge = 2n sind gültig', () => {
  assert.equal(assignLetters('AKKU', members(4), lcg(1)).ok, true);
  assert.equal(assignLetters('AKKU', members(2), lcg(1)).ok, true);
  assert.equal(assignLetters('AKKU', members(3), lcg(1)).ok, true);
});

test('TST-U-005: deterministisch bei gleichem Seed', () => {
  const a = assignLetters('REICHWEITE', members(6), lcg(11));
  const b = assignLetters('REICHWEITE', members(6), lcg(11));
  assert.deepEqual(a, b);
});

test('TST-U-005: Eingabe memberIds wird nicht verändert', () => {
  const ms = members(5);
  const copy = [...ms];
  assignLetters('BATTERIE', ms, lcg(2));
  assert.deepEqual(ms, copy);
});
