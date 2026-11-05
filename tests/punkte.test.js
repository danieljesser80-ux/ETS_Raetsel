import test from 'node:test';
import assert from 'node:assert/strict';
import { POINTS, pointsForRank } from '../src/core/index.js';

test('TST-U-007: POINTS ist [10,8,6,5,4,3,2,1]', () => {
  assert.deepEqual([...POINTS], [10, 8, 6, 5, 4, 3, 2, 1]);
});

test('TST-U-007: Rang 1..8 liefert die Punkte der Tabelle', () => {
  const expected = [10, 8, 6, 5, 4, 3, 2, 1];
  expected.forEach((p, i) => assert.equal(pointsForRank(i + 1), p, `Rang ${i + 1}`));
});

test('TST-U-007: Rang 9, 10, 100 und sehr große Ränge liefern 1', () => {
  for (const r of [9, 10, 100, 1000000]) assert.equal(pointsForRank(r), 1, `Rang ${r}`);
});

test('TST-U-007: Punkte sind ganzzahlig und nicht steigend', () => {
  let prev = Infinity;
  for (let r = 1; r <= 100; r++) {
    const p = pointsForRank(r);
    assert.ok(Number.isInteger(p));
    assert.ok(p <= prev);
    prev = p;
  }
});

test('TST-U-007: ungültige Ränge lösen RangeError aus', () => {
  for (const bad of [0, -1, -100, 1.5, 0.5, NaN, Infinity, '1', 'a', undefined, null, {}]) {
    assert.throws(() => pointsForRank(bad), RangeError, String(bad));
  }
});

test('TST-U-007: deterministisch bei wiederholtem Aufruf', () => {
  for (let r = 1; r <= 12; r++) assert.equal(pointsForRank(r), pointsForRank(r));
});
