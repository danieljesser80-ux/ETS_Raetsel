const LEVELS = ['leicht', 'mittel', 'schwer'];

export function createPointsTable(doc, config, caption = '') {
  if (!config?.ok || LEVELS.some((level) => !Array.isArray(config.point_schedules?.[level])
      || ![9, 11].includes(config.point_schedules[level].length))) {
    throw new Error('Punktekonfiguration fehlt');
  }
  const table = doc.createElement('table');
  table.className = 'points-table';
  if (caption) {
    const cap = doc.createElement('caption');
    cap.textContent = caption;
    table.append(cap);
  }
  const head = doc.createElement('thead');
  const heading = doc.createElement('tr');
  for (const text of ['Schwierigkeit', ...Array.from({ length: 11 }, (_, i) => i === 10 ? '11+' : String(i + 1))]) {
    const cell = doc.createElement('th');
    cell.scope = 'col';
    cell.textContent = text;
    heading.append(cell);
  }
  head.append(heading);
  table.append(head);
  const body = doc.createElement('tbody');
  for (const level of LEVELS) {
    const schedule = config.point_schedules[level];
    const row = doc.createElement('tr');
    row.className = `points-${level}`;
    const label = doc.createElement('th');
    label.scope = 'row';
    label.textContent = level;
    row.append(label);
    for (let i = 0; i < 11; i++) {
      const cell = doc.createElement('td');
      cell.textContent = schedule[Math.min(i, schedule.length - 1)];
      row.append(cell);
    }
    body.append(row);
  }
  table.append(body);
  return table;
}
