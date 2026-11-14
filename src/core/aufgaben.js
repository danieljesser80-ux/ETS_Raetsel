// Aufgaben nach dem Gruppenwort (OFF-003 bis OFF-006).

export const TASK_KINDS = ['exact', 'estimate'];

// Großbuchstaben; Leerzeichen, Komma, Semikolon, Punkt und Bindestrich werden ignoriert.
export function normalizeTaskAnswer(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/[\s,;.\-]+/g, '').toUpperCase();
}

export function checkTaskAnswer(input, solution) {
  const a = normalizeTaskAnswer(input);
  return a !== '' && a === normalizeTaskAnswer(solution);
}

// Schätzung: nur Ziffern, 1 bis 9 Stellen. Ungültig -> null.
export function parseGuess(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim();
  return /^[0-9]{1,9}$/.test(t) ? Number(t) : null;
}

// subs: [{ groupId, correct, durationMs, atMs, guess? }]. Ohne truth (exakt): nur richtige Abgaben, nach Dauer.
// Mit truth (Schätzung): nach Abstand, dann Dauer. Danach früherer Eingang, dann groupId. Falsche Abgaben (correct === false) erhalten keinen Rang.
export function rankSubmissions(subs, truth) {
  const gap = (s) => (typeof truth === 'number' ? Math.abs(s.guess - truth) : 0);
  return subs
    .filter((s) => s.correct !== false)
    .sort((a, b) => gap(a) - gap(b) || a.durationMs - b.durationMs || a.atMs - b.atMs || a.groupId - b.groupId)
    .map((s, i) => ({ groupId: s.groupId, rank: i + 1 }));
}
