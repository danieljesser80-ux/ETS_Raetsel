import { shuffle } from './gruppen.js';

export const WORDS = [];

export function wordsForGroupSize(n, words = WORDS) {
  return Array.isArray(words) ? words.slice() : [];
}

export function assignLetters(word, memberIds, rng) {
  if (typeof word !== 'string' || !/^[A-Z]+$/.test(word)) {
    return { ok: false, reason: 'ungueltiges_wort' };
  }
  const m = memberIds.length;
  if (m === 0) return { ok: false, reason: 'keine_mitglieder' };
  const order = shuffle(memberIds, rng);
  const letters = shuffle(word.split(''), rng);
  const assignment = Object.fromEntries(memberIds.map((id) => [id, []]));
  letters.forEach((letter, index) => assignment[order[index % m]].push(letter));
  return { ok: true, assignment };
}
