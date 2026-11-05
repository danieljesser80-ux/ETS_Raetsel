export const GROUP_NAMES = [
  'Rentiere', 'Schneeflocken', 'Lebkuchen', 'Nikolaus', 'Christkind', 'Sternschnuppen',
  'Weihnachtsengel', 'Zimtsterne', 'Eiskristalle', 'Tannenzapfen', 'Glühweinfreunde', 'Wichtel',
  'Plätzchenbäcker', 'Schlittenfahrer', 'Mistelzweige', 'Bratäpfel', 'Kerzenschein', 'Adventskranz',
  'Nussknacker', 'Pfefferkuchen', 'Schneemänner', 'Glockenklang', 'Weihnachtsbäume', 'Stollenbäcker',
  'Winterzauber', 'Eisbären', 'Polarlichter', 'Christbaumkugeln', 'Knecht Ruprecht', 'Spekulatius',
  'Weihnachtsmänner', 'Zuckerstangen', 'Lichterglanz', 'Marzipanengel',
];

export function shuffle(array, rng) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formGroups(playerIds, rng) {
  if (!Array.isArray(playerIds)) throw new TypeError('playerIds muss ein Array sein');
  if (new Set(playerIds).size !== playerIds.length) {
    throw new TypeError('doppelte IDs');
  }
  const n = playerIds.length;
  if (n < 4) return { ok: false, reason: 'zu_wenige' };
  if (n === 7) return { ok: false, reason: 'nicht_teilbar' };
  let k = Math.ceil(n / 5);
  if (4 * k > n) k -= 1;
  if (k < 1 || n > 6 * k) return { ok: false, reason: 'nicht_teilbar' };
  const shuffled = shuffle(playerIds, rng);
  const base = Math.floor(n / k);
  const extra = n % k;
  const groups = [];
  let pos = 0;
  for (let g = 0; g < k; g++) {
    const size = base + (g < extra ? 1 : 0);
    groups.push(shuffled.slice(pos, pos + size));
    pos += size;
  }
  return { ok: true, groups };
}

export function assignGroupNames(count, rng) {
  if (!Number.isInteger(count) || count < 0 || count > GROUP_NAMES.length) {
    throw new RangeError('ungültige Anzahl');
  }
  return shuffle(GROUP_NAMES, rng).slice(0, count);
}
