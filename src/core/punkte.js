export const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];

export function pointsForRank(rank) {
  if (typeof rank !== 'number' || !Number.isInteger(rank) || rank < 1) {
    throw new RangeError('Rang muss eine ganze Zahl >= 1 sein');
  }
  return rank > POINTS.length ? 1 : POINTS[rank - 1];
}
