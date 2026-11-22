import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { createPointsTable } from './points-table.js';

const root = document.getElementById('point-schedules');
const api = createApi(createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}));
try {
  const config = await api.gameConfig();
  const table = createPointsTable(document, config, `Aktuelle Punkte – Spielzeit ${config.game_minutes} Minuten`);
  root.replaceChildren(table);
} catch (error) {
  const message = document.createElement('p');
  message.className = 'message error';
  message.setAttribute('role', 'alert');
  message.textContent = `Aktuelle Punktestaffeln nicht verfügbar: ${error.message}. Die Moderation nennt die gültigen Werte.`;
  root.replaceChildren(message);
}
