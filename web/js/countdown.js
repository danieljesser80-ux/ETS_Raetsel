export function countdownSeconds(state, nowMs) {
  if (!state || state.deadline_ms === null || state.deadline_ms === undefined) return null;
  const serverNow = nowMs + (state.server_now_ms - state.fetchedAtMs);
  const secs = Math.ceil((state.deadline_ms - serverNow) / 1000);
  return Number.isFinite(secs) ? Math.max(0, secs) : null;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}
