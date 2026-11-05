import { shuffle } from './gruppen.js';

export const WORDS = [
  'AKKU', 'MOTOR', 'RADAR', 'TURBO', 'REIFEN', 'BREMSE', 'HYBRID', 'SENSOR',
  'INVERTER', 'BATTERIE', 'WALLBOX', 'GETRIEBE', 'KUPPLUNG', 'LENKRAD', 'FAHRWERK',
  'LADEKABEL', 'LADESAEULE', 'KAROSSERIE', 'REICHWEITE', 'REKUPERATION', 'ELEKTROMOTOR',
  'STROMLADER', 'SCHEINWERFER', 'WECHSELRICHTER', 'STEUERGERAET',
];

export function wordsForGroupSize(n) {
  return WORDS.filter((w) => w.length >= n && w.length <= 2 * n);
}

export function assignLetters(word, memberIds, rng) {
  if (typeof word !== 'string' || !/^[A-Z]+$/.test(word)) {
    return { ok: false, reason: 'ungueltiges_wort' };
  }
  const m = memberIds.length;
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
