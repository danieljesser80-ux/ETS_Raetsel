export function lcg(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const SEEDS = [1, 2, 42, 12345, 987654321];

export function sortedChars(str) {
  return [...str].sort().join('');
}
