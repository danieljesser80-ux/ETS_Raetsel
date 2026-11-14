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

export const DEFAULT_GROUP_SIZE = { min: 4, max: 6 };
export const GROUP_SIZE_LIMITS = { min: 1, max: 14 };

export function validateGroupSize(min, max) {
  const okInt = (v) => Number.isInteger(v) && v >= GROUP_SIZE_LIMITS.min && v <= GROUP_SIZE_LIMITS.max;
  if (!okInt(min) || !okInt(max) || min > max) return { ok: false, reason: 'ungueltige_groesse' };
  return { ok: true };
}

// Anzahl Gruppen k mit Größen in [min, max]; Durchschnitt möglichst nah an der Mitte, bei Gleichstand größeres k.
export function chooseGroupCount(n, min, max) {
  let best = null;
  const mid = (min + max) / 2;
  for (let k = Math.ceil(n / max); k <= Math.floor(n / min); k++) {
    if (k < 1) continue;
    const d = Math.abs(n / k - mid);
    if (best === null || d <= best.d + 1e-12) best = { k, d };
  }
  return best ? best.k : null;
}

export function formGroups(playerIds, rng, size = DEFAULT_GROUP_SIZE) {
  if (!Array.isArray(playerIds)) throw new TypeError('playerIds muss ein Array sein');
  if (new Set(playerIds).size !== playerIds.length) {
    throw new TypeError('doppelte IDs');
  }
  const { min, max } = size;
  if (!validateGroupSize(min, max).ok) throw new RangeError('ungültige Gruppengröße');
  const n = playerIds.length;
  if (n < min) return { ok: false, reason: 'zu_wenige' };
  const k = chooseGroupCount(n, min, max);
  if (k === null) return { ok: false, reason: 'nicht_teilbar' };
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
