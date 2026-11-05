export const REGISTRATION_MS = 300000;

export function registrationDeadline(startMs) {
  return startMs + REGISTRATION_MS;
}

export function isRegistrationOpen({ deadlineMs, nowMs, closedEarly }) {
  return nowMs < deadlineMs && !closedEarly;
}

export function remainingSeconds({ deadlineMs, nowMs, offsetMs = 0 }) {
  const s = Math.ceil((deadlineMs - (nowMs + offsetMs)) / 1000);
  return s > 0 ? s : 0;
}

export const PHASES = [
  'vorbereitet',
  'anmeldung',
  'gruppen_eingeteilt',
  'wortaufgabe_aktiv',
  'aufgabe_abgeschlossen',
];

export function canTransition(from, to) {
  const i = PHASES.indexOf(from);
  const j = PHASES.indexOf(to);
  if (i < 0 || j < 0) return false;
  if (from === 'anmeldung' && to === 'anmeldung') return true;
  return j === i + 1;
}
