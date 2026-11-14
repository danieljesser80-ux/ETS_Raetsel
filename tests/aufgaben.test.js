import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTaskAnswer, checkTaskAnswer, parseGuess, rankSubmissions } from '../src/core/index.js';

test('TST-U-012: normalizeTaskAnswer entfernt Trenner und macht Großbuchstaben', () => {
  assert.equal(normalizeTaskAnswer(' e4, d5 - h5 '), 'E4D5H5');
  assert.equal(normalizeTaskAnswer('4;7.2'), '472');
  assert.equal(normalizeTaskAnswer('ab-12'), 'AB12');
  assert.equal(normalizeTaskAnswer(undefined), '');
  assert.equal(normalizeTaskAnswer(42), '');
});

test('TST-U-012: checkTaskAnswer vergleicht normalisiert, leer ist falsch', () => {
  assert.equal(checkTaskAnswer('e4 d5 h5', 'E4-D5-H5'), true);
  assert.equal(checkTaskAnswer('e4 d5 h6', 'e4 d5 h5'), false);
  assert.equal(checkTaskAnswer('', ''), false);
  assert.equal(checkTaskAnswer(' ', 'abc'), false);
});

test('TST-U-012: parseGuess akzeptiert nur 1 bis 9 Ziffern', () => {
  assert.equal(parseGuess(' 42 '), 42);
  assert.equal(parseGuess('0'), 0);
  assert.equal(parseGuess('123456789'), 123456789);
  for (const bad of ['', '1234567890', '-1', '1.5', '1,5', 'abc', '4 2', null, undefined, 7]) {
    assert.equal(parseGuess(bad), null, String(bad));
  }
});

test('TST-U-012: rankSubmissions Schätzung nach Abstand, dann Dauer, Eingang, Gruppen-ID', () => {
  const guesses = [
    { groupId: 1, guess: 100, correct: true, durationMs: 30, atMs: 30 },
    { groupId: 2, guess: 90, correct: true, durationMs: 5, atMs: 20 },
    { groupId: 3, guess: 110, correct: true, durationMs: 4, atMs: 10 },
    { groupId: 4, guess: 101, correct: true, durationMs: 9, atMs: 40 },
    { groupId: 5, guess: 99, correct: true, durationMs: 8, atMs: 50 },
    { groupId: 6, guess: 100, correct: false, durationMs: 1, atMs: 1 },
  ];
  assert.deepEqual(rankSubmissions(guesses, 100), [
    { groupId: 1, rank: 1 },
    { groupId: 5, rank: 2 },
    { groupId: 4, rank: 3 },
    { groupId: 3, rank: 4 },
    { groupId: 2, rank: 5 },
  ]);
  const copy = JSON.stringify(guesses);
  rankSubmissions(guesses, 100);
  assert.equal(JSON.stringify(guesses), copy);
  assert.deepEqual(rankSubmissions([], 5), []);
});

test('TST-U-012: rankSubmissions exakt nur richtige nach Dauer, dann Eingang, Gruppe', () => {
  const subs = [
    { groupId: 3, correct: true, durationMs: 50, atMs: 9 },
    { groupId: 1, correct: false, durationMs: 1, atMs: 1 },
    { groupId: 2, correct: true, durationMs: 20, atMs: 8 },
    { groupId: 5, correct: true, durationMs: 50, atMs: 7 },
    { groupId: 4, correct: true, durationMs: 50, atMs: 7 },
  ];
  assert.deepEqual(rankSubmissions(subs), [
    { groupId: 2, rank: 1 },
    { groupId: 4, rank: 2 },
    { groupId: 5, rank: 3 },
    { groupId: 3, rank: 4 },
  ]);
});

