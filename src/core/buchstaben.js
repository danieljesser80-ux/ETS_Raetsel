import { shuffle } from './gruppen.js';

export const MAX_WORD_LENGTH = 9;

export const WORDS = [];

export function wordsForGroupSize(n, words = WORDS) {
  if (n === 1) return words.slice();
  return words.filter((w) => w.length >= n && w.length <= Math.min(2 * n, MAX_WORD_LENGTH));
}

export function assignLetters(word, memberIds, rng) {
  if (typeof word !== 'string' || !/^[A-Z]+$/.test(word)) {
    return { ok: false, reason: 'ungueltiges_wort' };
  }
  const m = memberIds.length;
  if (m === 1) {
    return { ok: true, assignment: { [memberIds[0]]: shuffle(word.split(''), rng) } };
  }
  if (word.length < m || word.length > 2 * m) {
    return { ok: false, reason: 'wortlaenge' };
  }
  const letters = shuffle(word.split(''), rng);
  const extra = word.length - m;
  const doubled = new Set(shuffle(memberIds, rng).slice(0, extra));
  const assignment = {};
  let pos = 0;
  for (const id of memberIds) {
    const count = doubled.has(id) ? 2 : 1;
    assignment[id] = letters.slice(pos, pos + count);
    pos += count;
  }
  return { ok: true, assignment };
}
