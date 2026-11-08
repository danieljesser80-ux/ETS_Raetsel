export function countdownSeconds(state, nowMs) {
  if (!state || state.phase !== 'anmeldung' || state.closed_early === true) return null;
  const serverNow = synchronizedNow(state, nowMs);
  if (!Number.isFinite(state.deadline_ms) || serverNow === null) return null;
  const secs = Math.ceil((state.deadline_ms - serverNow) / 1000);
  return Number.isFinite(secs) ? Math.max(0, secs) : null;
}

function synchronizedNow(state, nowMs) {
  if (!Number.isFinite(nowMs) || !Number.isFinite(state?.server_now_ms)
      || !Number.isFinite(state?.fetchedAtMs)) return null;
  return nowMs + state.server_now_ms - state.fetchedAtMs;
}

export function gameSeconds(state, nowMs) {
  if (state?.phase !== 'wortaufgabe_aktiv' || !Number.isFinite(state.game_deadline_ms)) return null;
  const now = synchronizedNow(state, nowMs);
  return now === null ? null : Math.max(0, Math.ceil((state.game_deadline_ms - now) / 1000));
}

export function elapsedSeconds(startMs, durationMs, state, nowMs) {
  if (durationMs != null) return Number.isFinite(durationMs) && durationMs >= 0 ? Math.floor(durationMs / 1000) : null;
  if (!Number.isFinite(startMs)) return null;
  let now = synchronizedNow(state, nowMs);
  if (now === null) return null;
  if (Number.isFinite(state.finished_at_ms)) now = Math.min(now, state.finished_at_ms);
  if (Number.isFinite(state.game_deadline_ms)) now = Math.min(now, state.game_deadline_ms);
  return Math.max(0, Math.floor((now - startMs) / 1000));
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}
