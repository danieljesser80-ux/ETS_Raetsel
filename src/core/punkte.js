export const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
export const DEFAULT_SCHEDULES = Object.freeze({
  leicht: Object.freeze([5, 4, 3, 2, 2, 1, 1, 1, 1]),
  mittel: Object.freeze([...POINTS, 1]),
  schwer: Object.freeze([20, 16, 12, 10, 8, 6, 4, 2, 2]),
});

export function pointsForRank(rank, schedule = DEFAULT_SCHEDULES.mittel) {
  if (typeof rank !== 'number' || !Number.isInteger(rank) || rank < 1) {
    throw new RangeError('Rang muss eine ganze Zahl >= 1 sein');
  }
  if (!Array.isArray(schedule) || schedule.length !== 9
      || schedule.some((value, i) => !Number.isInteger(value) || value < 0 || value > 10000
        || (i > 0 && value > schedule[i - 1]))) {
    throw new RangeError('Ungültige Punktestaffel');
  }
  return schedule[Math.min(rank - 1, 8)];
}
