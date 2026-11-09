import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { reasonText } from './texts.js';
import { renderPlayer, updateCountdowns } from './views.js';
import { createRefreshLoop } from './refresh.js';
import { stateKey } from './clientcache.js';

const root = document.getElementById('app');
const notice = document.getElementById('notice');
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
const api = createApi(client);

let state = null;
let stateKey_ = null;
let busy = false;
const ui = { openTaskId: null, feedback: null };
let feedbackTimer = null;

function setNotice(text, kind) {
  delete notice.dataset.pending;
  delete notice.dataset.conn;
  delete notice.dataset.uncertain;
  notice.textContent = text || '';
  notice.className = text ? `message ${kind || 'info'}` : '';
  notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}

function draw() {
  renderPlayer(root, state && { ...state, openTaskId: ui.openTaskId, feedback: ui.feedback }, handlers, Date.now());
  const guide = document.querySelector('nav[aria-label="Spielanleitung"]');
  if (guide) guide.hidden = !!root.querySelector('[data-open-task]');
  if (busy) for (const button of root.querySelectorAll('button')) button.disabled = true;
}

function pending() {
  setNotice('Übertragung läuft – bitte warten.', 'info');
  notice.dataset.pending = '1';
}

function uncertain() {
  setNotice('Verbindung unterbrochen – Eingang unklar. Nach Wiederverbindung den Aufgabenstatus prüfen; nicht automatisch erneut senden.', 'error');
  notice.dataset.uncertain = '1';
}

function setFeedback(scope, kind, text, { closeTask = false } = {}) {
  clearTimeout(feedbackTimer);
  ui.feedback = { scope, kind, text, accepted: closeTask };
  draw();
  if (scope === 'wort') return;
  feedbackTimer = setTimeout(() => {
    ui.feedback = null;
    if (closeTask) ui.openTaskId = null;
    draw();
  }, 3000);
}

const sync = createRefreshLoop({
  async load() {
    await api.ensureSession();
    const s = await api.getState();
    if (!s || !s.ok) throw new Error(reasonText(s?.reason));
    return s;
  },
  apply(s) {
    s.fetchedAtMs = Date.now();
    const key = stateKey(s);
    const unchanged = state && key === stateKey_ && !notice.dataset.conn;
    state = s;
    stateKey_ = key;
    if (notice.dataset.pending) setNotice('');
    if (notice.dataset.conn) {
      delete notice.dataset.conn;
      setNotice('');
    }
    if (!unchanged) draw();
  },
  onError() {
    if (notice.dataset.uncertain) return;
    setNotice('Verbindung unterbrochen – Status wird erneut abgerufen …', 'error');
    notice.dataset.conn = '1';
  },
});

const refresh = () => busy ? Promise.resolve() : sync.request();

const handlers = {
  async onJoin(name) {
    if (busy) return;
    busy = true;
    sync.invalidate();
    draw();
    pending();
    try {
      const r = await api.joinRound(name);
      setNotice(r && r.ok ? '' : reasonText(r && r.reason), r && r.ok ? 'info' : 'error');
    } catch (e) {
      uncertain();
    } finally {
      await sync.request();
      busy = false;
      draw();
    }
  },
  async onSubmit(answer) {
    if (busy) return;
    busy = true;
    sync.invalidate();
    draw();
    pending();
    const btn = root.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      const r = await api.submitAnswer(answer);
      if (!r || !r.ok) ui.feedback = { scope: 'wort', kind: 'error', text: reasonText(r && r.reason) };
      else if (r.correct) ui.feedback = { scope: 'wort', kind: 'success', text: `Richtig! Vorläufig Platz ${r.rank}` };
      else ui.feedback = { scope: 'wort', kind: 'error', text: 'Leider falsch' };
    } catch (e) {
      uncertain();
    } finally {
      await sync.request();
      busy = false;
      draw();
    }
  },
  async onOpenTask(taskId) {
    if (busy) return;
    busy = true;
    sync.invalidate();
    clearTimeout(feedbackTimer);
    draw();
    pending();
    try {
      const task = state && (state.tasks || []).find((t) => t.id === taskId);
      const r = task && task.started ? { ok: true } : await api.startTask(taskId);
      if (r && r.ok) {
        setNotice('');
        ui.openTaskId = taskId;
        ui.feedback = null;
      } else {
        setNotice(reasonText(r && r.reason), 'error');
      }
    } catch (e) {
      uncertain();
    } finally {
      await sync.request();
      busy = false;
      draw();
    }
  },
  async onSubmitTask(taskId, answer, choice) {
    if (busy) return;
    busy = true;
    sync.invalidate();
    draw();
    pending();
    try {
      const r = await api.submitTask(taskId, answer, choice);
      if (r?.ok) {
        const task = state?.tasks?.find((t) => t.id === taskId);
        if (task) Object.assign(task, r);
      }
      if (!r || !r.ok) {
        setFeedback(taskId, 'error', reasonText(r && r.reason));
      } else if (r.correct === true) {
        setFeedback(taskId, 'success', 'Richtig!', { closeTask: true });
      } else if (r.correct === false) {
        const left = r.attempts_remaining;
        const remaining = r.submitted ? 'Keine weiteren Versuche.' : `Noch ${left} ${left === 1 ? 'Versuch' : 'Versuche'}.`;
        setFeedback(taskId, 'error', `Falsch – ${remaining}`, { closeTask: r.submitted === true });
      } else {
        setFeedback(taskId, 'info', 'Geschätzt – abgegeben', { closeTask: true });
      }
    } catch (e) {
      uncertain();
    } finally {
      await sync.request();
      busy = false;
      draw();
    }
  },
  async onGiveUp(scope) {
    if (busy || !confirm('Wirklich aufgeben? Diese Aufgabe wird endgültig mit 0 Punkten beendet. Beim Gruppenwort wirst du Spielleiter.')) return;
    busy = true;
    sync.invalidate();
    draw();
    pending();
    try {
      const result = await api.giveUp(scope);
      if (!result?.ok) setFeedback(scope, 'error', reasonText(result?.reason));
      else {
        if (scope !== 'wort') ui.openTaskId = null;
        ui.feedback = null;
        setNotice('Aufgegeben – 0 Punkte.', 'info');
      }
    } catch (error) {
      uncertain();
    } finally {
      await sync.request();
      busy = false;
      draw();
    }
  },
};

function start() {
  sync.start();
  draw();
  refresh();
  setInterval(() => state && updateCountdowns(root, state, Date.now()), 1000);
  try {
    client
      .channel('round-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round' }, refresh)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setNotice('Live-Verbindung unterbrochen – regelmäßige Aktualisierung bleibt aktiv.', 'info');
        }
      });
  } catch (e) {
    setNotice('Live-Verbindung nicht verfügbar – regelmäßige Aktualisierung bleibt aktiv.', 'info');
  }
}

draw();
start();
