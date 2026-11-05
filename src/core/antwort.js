export function normalizeAnswer(s) {
  return typeof s === 'string' ? s.trim().toUpperCase() : '';
}

export function checkAnswer(input, solution) {
  const a = normalizeAnswer(input);
  return a !== '' && a === normalizeAnswer(solution);
}

export const ATTEMPT_INTERVAL_MS = 3000;

export function canSubmit({ memberGroupId, groupId, lastAttemptMs, nowMs, alreadySolved }) {
  if (memberGroupId == null || memberGroupId !== groupId) {
    return { ok: false, reason: 'fremde_gruppe' };
  }
  if (alreadySolved) return { ok: false, reason: 'bereits_geloest' };
  if (typeof lastAttemptMs === 'number' && nowMs - lastAttemptMs < ATTEMPT_INTERVAL_MS) {
    return { ok: false, reason: 'zu_schnell' };
  }
  return { ok: true };
}
