import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { renderBeamer, updateCountdowns } from './views.js';
import { createRefreshLoop } from './refresh.js';
import { stateKey } from './clientcache.js';

const root = document.getElementById('app');
const notice = document.getElementById('notice');
const api = createApi(createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
}));
sessionStorage.removeItem('admincode');
let token = sessionStorage.getItem('display-token');
let state = null;
let lastKey = null;
const sync = createRefreshLoop({
  load: async () => {
    const result = await api.beamerState(token);
    if (!result?.ok) throw new Error('Beamerzugang ungültig – über den Admin erneut öffnen.');
    return result;
  },
  apply(result) {
    result.fetchedAtMs = Date.now();
    const key = stateKey(result);
    const unchanged = state && key === lastKey && !notice.textContent;
    state = result;
    lastKey = key;
    notice.textContent = '';
    if (!unchanged) renderBeamer(root, state, Date.now());
  },
  onError(error) {
    notice.textContent = `Beamer nicht verbunden: ${error.message}`;
    notice.className = 'message error';
    notice.setAttribute('role', 'alert');
  },
});

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.source !== window.opener
      || event.data?.type !== 'raetsel-beamer-token' || typeof event.data.token !== 'string'
      || !/^[0-9a-f]{64}$/.test(event.data.token)) return;
  token = event.data.token;
  sessionStorage.setItem('display-token', token);
  sync.stop();
  sync.start();
});
if (window.opener) window.opener.postMessage({ type: 'raetsel-beamer-ready' }, location.origin);
if (token) sync.start();
else if (!window.opener) {
  notice.textContent = 'Diese Beamerseite über „Beamer-Ansicht“ im Admin öffnen.';
  notice.className = 'message error';
}
setInterval(() => state && updateCountdowns(root, state, Date.now()), 1000);
