import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderPlayerQr } from './qr.js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { createPointsTable } from './points-table.js';

renderPlayerQr(document.getElementById('qr'), location.href);

const pointsRoot = document.getElementById('presentation-points');
const api = createApi(createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}));
try {
  const config = await api.gameConfig();
  pointsRoot.replaceChildren(createPointsTable(document, config, 'Punkte je richtiger Antwort'));
} catch (error) {
  const message = document.createElement('p');
  message.className = 'message error';
  message.setAttribute('role', 'alert');
  message.textContent = `Punktestaffel nicht verfügbar: ${error.message}.`;
  pointsRoot.replaceChildren(message);
}
