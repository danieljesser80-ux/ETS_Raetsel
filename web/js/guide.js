import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';

const root = document.getElementById('point-schedules');
const api = createApi(createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}));
try {
  const config = await api.gameConfig();
  const levels = ['leicht', 'mittel', 'schwer'];
  if (!config?.ok || levels.some((level) => !Array.isArray(config.point_schedules?.[level])
      || config.point_schedules[level].length !== 9)) throw new Error('Punktekonfiguration fehlt');
  const table = document.createElement('table');
  table.className = 'points-table';
  const caption = document.createElement('caption');
  caption.textContent = `Aktuelle Punkte – Spielzeit ${config.game_minutes} Minuten`;
  table.append(caption);
  const head = document.createElement('thead');
  const heading = document.createElement('tr');
  for (const text of ['Stufe / Platz', ...Array.from({ length: 9 }, (_, i) => i === 8 ? '9+' : i + 1)]) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = text;
    heading.append(cell);
  }
  head.append(heading);
  table.append(head);
  const body = document.createElement('tbody');
  for (const level of levels) {
    const row = document.createElement('tr');
    for (const [i, text] of [level, ...config.point_schedules[level]].entries()) {
      const cell = document.createElement(i === 0 ? 'th' : 'td');
      if (i === 0) cell.scope = 'row';
      cell.textContent = text;
      row.append(cell);
    }
    body.append(row);
  }
  table.append(body);
  root.replaceChildren(table);
} catch (error) {
  const message = document.createElement('p');
  message.className = 'message error';
  message.setAttribute('role', 'alert');
  message.textContent = `Aktuelle Punktestaffeln nicht verfügbar: ${error.message}. Die Moderation nennt die gültigen Werte.`;
  root.replaceChildren(message);
}
