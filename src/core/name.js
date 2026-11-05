export function validateName(name, existingNames) {
  if (typeof name !== 'string') return { ok: false, reason: 'leer' };
  const trimmed = name.trim();
  if (trimmed === '') return { ok: false, reason: 'leer' };
  const length = [...trimmed].length;
  if (length < 2) return { ok: false, reason: 'zu_kurz' };
  if (length > 20) return { ok: false, reason: 'zu_lang' };
  const key = trimmed.toLowerCase();
  const existing = Array.isArray(existingNames) ? existingNames : [];
  for (const other of existing) {
    if (typeof other === 'string' && other.trim().toLowerCase() === key) {
      return { ok: false, reason: 'doppelt' };
    }
  }
  return { ok: true, name: trimmed };
}
