import test from 'node:test';
import assert from 'node:assert/strict';
import { formGroups, GROUP_NAMES, assignGroupNames, validateGroupSize } from '../src/core/index.js';
import { lcg, SEEDS } from './helpers.js';

const ids = (n) => Array.from({ length: n }, (_, i) => `p${i}`);

test('TST-U-004: n = 0..3 wird mit zu_wenige abgelehnt', () => {
  for (const seed of SEEDS) {
    for (let n = 0; n <= 3; n++) {
      assert.deepEqual(formGroups(ids(n), lcg(seed)), { ok: false, reason: 'zu_wenige' }, `n=${n}`);
    }
  }
});

test('TST-U-004: n = 7 wird mit nicht_teilbar abgelehnt', () => {
  for (const seed of SEEDS) {
    assert.deepEqual(formGroups(ids(7), lcg(seed)), { ok: false, reason: 'nicht_teilbar' });
  }
});

test('TST-U-004: n = 4..100 (außer 7): vollständig, disjunkt, Größen 4..6, Unterschied höchstens 1', () => {
  for (const seed of SEEDS) {
    for (let n = 4; n <= 100; n++) {
      if (n === 7) continue;
      const input = ids(n);
      const res = formGroups(input, lcg(seed + n));
      assert.equal(res.ok, true, `n=${n} seed=${seed}`);
      const flat = res.groups.flat();
      assert.equal(flat.length, n, `n=${n}`);
      assert.deepEqual([...flat].sort(), [...input].sort(), `n=${n}`);
      assert.equal(new Set(flat).size, n, `n=${n} jeder genau einmal`);
      const sizes = res.groups.map((g) => g.length);
      for (const s of sizes) assert.ok(s >= 4 && s <= 6, `n=${n} Größe ${s}`);
      assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `n=${n} Größen ${sizes}`);
    }
  }
});

test('TST-U-004: konkrete Größen laut Vertrag (n=4,5,6,8,11,12,16)', () => {
  const sizesOf = (n) =>
    formGroups(ids(n), lcg(3)).groups.map((g) => g.length).sort((a, b) => b - a);
  assert.deepEqual(sizesOf(4), [4]);
  assert.deepEqual(sizesOf(5), [5]);
  assert.deepEqual(sizesOf(6), [6]);
  assert.deepEqual(sizesOf(8), [4, 4]);
  assert.deepEqual(sizesOf(11), [6, 5]);
  assert.deepEqual(sizesOf(12), [4, 4, 4]);
  assert.deepEqual(sizesOf(16), [6, 5, 5]);
});

test('TST-U-011: einstellbare Gruppengröße (OFF-001): Größen im Bereich, Mitte bevorzugt', () => {
  const sizesOf = (n, min, max) =>
    formGroups(ids(n), lcg(5), { min, max }).groups.map((g) => g.length).sort((a, b) => b - a);
  assert.deepEqual(sizesOf(10, 2, 3), [3, 3, 2, 2]);
  assert.deepEqual(sizesOf(7, 3, 4), [4, 3]);
  assert.deepEqual(sizesOf(9, 3, 3), [3, 3, 3]);
  assert.deepEqual(sizesOf(14, 7, 7), [7, 7]);
});

test('TST-U-011: Teilnehmerzahl passt nicht -> nicht_teilbar, zu wenige -> zu_wenige', () => {
  assert.deepEqual(formGroups(ids(10), lcg(1), { min: 4, max: 4 }), { ok: false, reason: 'nicht_teilbar' });
  assert.deepEqual(formGroups(ids(7), lcg(1)), { ok: false, reason: 'nicht_teilbar' });
  assert.deepEqual(formGroups(ids(2), lcg(1), { min: 3, max: 5 }), { ok: false, reason: 'zu_wenige' });
});

test('TST-U-011: Min = Max = 1 (Testmodus): jede Person eine Gruppe, auch n = 100', () => {
  for (const n of [1, 2, 3, 100]) {
    const res = formGroups(ids(n), lcg(2), { min: 1, max: 1 });
    assert.equal(res.ok, true);
    assert.equal(res.groups.length, n);
    assert.ok(res.groups.every((g) => g.length === 1));
  }
});

test('TST-U-011: ungültige Größen werden erkannt', () => {
  for (const [min, max] of [[0, 4], [4, 15], [5, 4], [1.5, 4], ['a', 4], [undefined, 4]]) {
    assert.deepEqual(validateGroupSize(min, max), { ok: false, reason: 'ungueltige_groesse' }, `${min}/${max}`);
    assert.throws(() => formGroups(ids(10), lcg(1), { min, max }), RangeError);
  }
  assert.deepEqual(validateGroupSize(1, 14), { ok: true });
  assert.deepEqual(validateGroupSize(4, 4), { ok: true });
});

test('TST-U-004: Eingabe wird nicht verändert', () => {
  for (const seed of SEEDS) {
    const input = ids(23);
    const copy = [...input];
    formGroups(input, lcg(seed));
    assert.deepEqual(input, copy);
  }
});

test('TST-U-004: Ergebnis ist deterministisch bei gleichem Seed', () => {
  const a = formGroups(ids(30), lcg(99));
  const b = formGroups(ids(30), lcg(99));
  assert.deepEqual(a, b);
});

test('TST-U-004: rng beeinflusst die Reihenfolge (verschiedene Seeds ergeben nicht alle dasselbe)', () => {
  const results = new Set(SEEDS.map((s) => JSON.stringify(formGroups(ids(30), lcg(s)).groups)));
  assert.ok(results.size > 1);
});

test('TST-U-004: Nicht-Array und doppelte IDs lösen TypeError aus', () => {
  assert.throws(() => formGroups('abcd', lcg(1)), TypeError);
  assert.throws(() => formGroups(null, lcg(1)), TypeError);
  assert.throws(() => formGroups(undefined, lcg(1)), TypeError);
  assert.throws(() => formGroups({}, lcg(1)), TypeError);
  assert.throws(() => formGroups(['a', 'b', 'c', 'd', 'a'], lcg(1)), TypeError);
});

test('TST-U-004: GROUP_NAMES mindestens 30, nicht leer, eindeutig (case-insensitiv)', () => {
  assert.ok(Array.isArray(GROUP_NAMES));
  assert.ok(GROUP_NAMES.length >= 30);
  for (const n of GROUP_NAMES) {
    assert.equal(typeof n, 'string');
    assert.ok(n.trim().length > 0);
  }
  assert.equal(new Set(GROUP_NAMES.map((n) => n.toLowerCase())).size, GROUP_NAMES.length);
});

test('TST-U-004: assignGroupNames liefert count verschiedene Namen aus GROUP_NAMES', () => {
  for (const seed of SEEDS) {
    for (const count of [0, 1, 2, 5, 20, GROUP_NAMES.length]) {
      const names = assignGroupNames(count, lcg(seed));
      assert.equal(names.length, count);
      assert.equal(new Set(names).size, count);
      for (const n of names) assert.ok(GROUP_NAMES.includes(n));
    }
  }
});

test('TST-U-004: assignGroupNames mit ungültigem count wirft RangeError', () => {
  for (const bad of [GROUP_NAMES.length + 1, -1, 1.5, NaN, undefined, '3']) {
    assert.throws(() => assignGroupNames(bad, lcg(1)), RangeError, String(bad));
  }
});
