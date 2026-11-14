import test from 'node:test';
import assert from 'node:assert/strict';
import { POINTS, pointsForRank, DEFAULT_SCHEDULES } from '../src/core/index.js';

test('TST-U-027: DEFAULT_SCHEDULES enthält die drei Stufen mit je neun Einträgen', () => {
  assert.deepEqual(DEFAULT_SCHEDULES, {
    leicht: [5, 4, 3, 2, 2, 1, 1, 1, 1],
    mittel: [10, 8, 6, 5, 4, 3, 2, 1, 1],
    schwer: [20, 16, 12, 10, 8, 6, 4, 2, 2],
  });
});

test('TST-U-027: pointsForRank ohne Staffel nutzt mittel (Rang 9+ = neunter Eintrag)', () => {
  const m = DEFAULT_SCHEDULES.mittel;
  for (let r = 1; r <= 9; r++) assert.equal(pointsForRank(r), m[r - 1], `Rang ${r}`);
  for (const r of [10, 50, 1000000]) assert.equal(pointsForRank(r), 1);
});

test('TST-U-027: pointsForRank mit expliziter Staffel', () => {
  const s = DEFAULT_SCHEDULES.schwer;
  for (let r = 1; r <= 9; r++) assert.equal(pointsForRank(r, s), s[r - 1]);
  assert.equal(pointsForRank(9, s), 2);
  assert.equal(pointsForRank(40, s), 2);
  assert.equal(pointsForRank(3, [0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert.equal(pointsForRank(1, DEFAULT_SCHEDULES.leicht), 5);
});

test('TST-U-027: ungültige Staffeln lösen RangeError aus', () => {
  const bad = [
    [], [1, 2, 3], [10, 8, 6, 5, 4, 3, 2, 1], [10, 8, 6, 5, 4, 3, 2, 1, 1, 1],
    [1, 2, 3, 4, 5, 6, 7, 8, 9], [10, 8, 6, 5, 4, 3, 2, 1, -1], [10, 8, 6, 5, 4, 3, 2, 1, 1.5],
    [10001, 8, 6, 5, 4, 3, 2, 1, 1], [10, 8, 6, 5, 4, 3, 2, 1, '1'], [10, 8, 6, 5, 4, 3, 2, 1, NaN],
    'x', {}, 5,
  ];
  for (const s of bad) assert.throws(() => pointsForRank(1, s), RangeError, JSON.stringify(s));
  assert.equal(pointsForRank(1, [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000]), 10000);
});

test('TST-U-027: DEFAULT_SCHEDULES ist nicht durch pointsForRank veränderbar', () => {
  const copy = JSON.stringify(DEFAULT_SCHEDULES);
  pointsForRank(1);
  pointsForRank(2, DEFAULT_SCHEDULES.leicht);
  assert.equal(JSON.stringify(DEFAULT_SCHEDULES), copy);
});

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
