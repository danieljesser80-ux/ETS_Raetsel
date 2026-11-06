import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { reasonText } from './texts.js';
import { renderPlayer, updateCountdowns } from './views.js';

const root = document.getElementById('app');
const notice = document.getElementById('notice');
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
const api = createApi(client);

let state = null;
let busy = false;

function setNotice(text, kind) {
  notice.textContent = text || '';
  notice.className = text ? `message ${kind || 'info'}` : '';
  notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}

function draw() {
  renderPlayer(root, state, handlers, Date.now());
}

async function refresh() {
  try {
    const s = await api.getState();
    s.fetchedAtMs = Date.now();
    state = s;
    if (notice.dataset.conn) {
      delete notice.dataset.conn;
      setNotice('');
    }
    draw();
  } catch (e) {
    notice.dataset.conn = '1';
    setNotice('Verbindung unterbrochen – neuer Versuch …', 'error');
  }
}

const handlers = {
  async onJoin(name) {
    if (busy) return;
    busy = true;
    try {
      const r = await api.joinRound(name);
      setNotice(r && r.ok ? '' : reasonText(r && r.reason), r && r.ok ? 'info' : 'error');
      await refresh();
    } catch (e) {
      setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
    } finally {
      busy = false;
    }
  },
  async onSubmit(answer) {
    if (busy) return;
    busy = true;
    const btn = root.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const r = await api.submitAnswer(answer);
      if (!r || !r.ok) setNotice(reasonText(r && r.reason), 'error');
      else if (r.correct) setNotice(`Richtig! Vorläufig Platz ${r.rank}`, 'success');
      else setNotice('Leider falsch', 'error');
      await refresh();
    } catch (e) {
      setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
    } finally {
      busy = false;
      const b = root.querySelector('button[type="submit"]');
      if (b) b.disabled = false;
    }
  },
  async onStartTask(taskId) {
    if (busy) return;
    busy = true;
    try {
      const r = await api.startTask(taskId);
      setNotice(r && r.ok ? '' : reasonText(r && r.reason), r && r.ok ? 'info' : 'error');
      await refresh();
    } catch (e) {
      setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
    } finally {
      busy = false;
    }
  },
  async onSubmitTask(taskId, answer, choice) {
    if (busy) return;
    busy = true;
    try {
      const r = await api.submitTask(taskId, answer, choice);
      if (!r || !r.ok) setNotice(reasonText(r && r.reason), 'error');
      else setNotice('Abgegeben. Das Rätsel ist jetzt gesperrt.', 'success');
      await refresh();
    } catch (e) {
      setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
    } finally {
      busy = false;
    }
  },
};

async function start() {
  try {
    await api.ensureSession();
  } catch (e) {
    setNotice('Verbindung unterbrochen – neuer Versuch …', 'error');
    setTimeout(start, 2000);
    return;
  }
  draw();
  await refresh();
  setInterval(refresh, 2000);
  setInterval(() => state && updateCountdowns(root, state, Date.now()), 1000);
  try {
    client
      .channel('round-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round' }, refresh)
      .subscribe();
  } catch (e) {
    // Polling genügt als Fallback.
  }
}

draw();
start();
