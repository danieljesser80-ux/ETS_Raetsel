const HEADERS = ['Gruppe', 'Gesamtplatz', 'Gesamtpunkte', 'Aufgabe', 'Aufgabenplatz', 'Aufgabenpunkte', 'Status', 'Zeit (ms)'];

export function resultsCsv(rows) {
  if (!Array.isArray(rows)) throw new TypeError('Ergebniszeilen fehlen');
  const quote = (value) => {
    let text = value == null ? '' : String(value);
    if (typeof value === 'string' && /^(?:\s*[\u0000-\u001f]|[\s\u0000-\u001f]*[=+\-@])/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return '\uFEFF' + [HEADERS, ...rows.map((row) =>
    [row.group, row.rank, row.points, row.task, row.task_rank, row.task_points, row.status, row.duration_ms])]
    .map((cells) => cells.map(quote).join(',')).join('\r\n') + '\r\n';
}
