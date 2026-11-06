import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderPlayerQr } from './qr.js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { reasonText } from './texts.js';
import { renderAdmin, renderBeamer, renderMessage, updateCountdowns, clearDrafts } from './views.js';
import { createRefreshLoop } from './refresh.js';

const root = document.getElementById('app');
const notice = document.getElementById('notice');
const loginBox = document.getElementById('login');
const qrBox = document.getElementById('qr');
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
const api = createApi(client);

let code = sessionStorage.getItem('admincode') || '';
let overview = null;
let beamer = false;
let closedLocally = false;
let timer = null;
let selectedGroup = null;
let adminTab = 'steuerung';
let busy = false;

function setNotice(text, kind) {
  notice.textContent = text || '';
  notice.className = text ? `message ${kind || 'info'}` : '';
  notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}

function draw() {
  document.body.classList.toggle('beamer-mode', beamer);
  if (!overview) return;
  if (beamer) {
    renderBeamer(root, overview, Date.now());
    return;
  }
  renderAdmin(root, { ...overview, selectedGroup, adminTab }, handlers, Date.now());
  if (busy) for (const field of root.querySelectorAll('button, input')) field.disabled = true;
}

const sync = createRefreshLoop({
  async load() {
    await api.ensureSession();
    const o = await api.admin.overview(code);
    if (!o) throw new Error('Keine Antwort vom Server');
    return o;
  },
  apply(o) {
    if (!o || !o.ok) {
      setNotice(reasonText(o && o.reason), 'error');
      if (o && o.reason === 'nicht_berechtigt') logout();
      return;
    }
    if (o.phase !== 'anmeldung') closedLocally = false;
    if (closedLocally && o.closed_early === undefined) o.closed_early = true;
    o.fetchedAtMs = Date.now();
    overview = o;
    if (notice.dataset.conn) {
      delete notice.dataset.conn;
      setNotice('');
    }
    draw();
  },
  onError() {
    notice.dataset.conn = '1';
    setNotice('Verbindung unterbrochen – neuer Versuch …', 'error');
  },
});

const refresh = () => code ? sync.request() : Promise.resolve();

async function command(fn, okText, drafts) {
  if (busy) return;
  busy = true;
  sync.invalidate();
  draw();
  try {
    const r = await fn();
    if (!r || !r.ok) setNotice(reasonText(r?.reason), 'error');
    else {
      if (drafts !== undefined) clearDrafts(root, drafts);
      setNotice(okText || '', 'success');
    }
  } catch (e) {
    setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
  } finally {
    await refresh();
    busy = false;
    draw();
  }
}

const handlers = {
  onStart: (seconds) => {
    closedLocally = false;
    return command(() => api.admin.startRegistration(code, seconds), 'Anmeldung geöffnet.');
  },
  onClose: () =>
    command(async () => {
      const r = await api.admin.closeRegistration(code);
      if (r && r.ok) closedLocally = true;
      return r;
    }, 'Anmeldung geschlossen.'),
  onForm: () => command(() => api.admin.formGroups(code), 'Gruppen eingeteilt.'),
  onSetGroupSize: (min, max) => command(() => api.admin.setGroupSize(code, min, max), 'Gruppengröße gespeichert.', ['gmin', 'gmax']),
  onSetTask: (id, fields) => command(() => api.admin.setTask(code, id, fields), 'Rätsel gespeichert.',
    ['title', 'body', 'image', 'solution', 'opt1', 'opt2', 'opt3', 'opt4', 'correct'].map((suffix) => `t-${id}-${suffix}`)),
  onFinish: () => {
    if (!confirm('Spiele wirklich beenden? Danach sind keine Abgaben mehr möglich und die Punkte werden final.')) return;
    return command(() => api.admin.finish(code), 'Spiele beendet.');
  },
  onReset: () => {
    if (!confirm('Wirklich alles zurücksetzen? Alle Teilnehmer und Ergebnisse werden gelöscht.')) return;
    closedLocally = false;
    return command(async () => {
      const result = await api.admin.reset(code);
      if (result && result.ok) {
        adminTab = 'steuerung';
        selectedGroup = null;
      }
      return result;
    }, 'Zurückgesetzt.', null);
  },
  onBeamer: () => {
    beamer = true;
    document.getElementById('beamer-exit').hidden = false;
    draw();
  },
  onSelectGroup: (name) => {
    selectedGroup = name;
    draw();
  },
  onBackFromGroup: () => {
    selectedGroup = null;
    draw();
  },
  onSelectAdminTab: (tab) => {
    adminTab = tab;
    draw();
  },
};

function logout() {
  sync.stop();
  clearDrafts(root);
  code = '';
  sessionStorage.removeItem('admincode');
  overview = null;
  selectedGroup = null;
  adminTab = 'steuerung';
  beamer = false;
  document.body.classList.remove('beamer-mode');
  document.getElementById('beamer-exit').hidden = true;
  loginBox.hidden = false;
  root.textContent = '';
}

async function enter() {
  sync.stop();
  clearDrafts(root);
  adminTab = 'steuerung';
  loginBox.hidden = true;
  renderMessage(root, 'Verbinde …', 'info');
  sync.start();
  await refresh();
  if (!timer) {
    timer = setInterval(() => overview && updateCountdowns(root, overview, Date.now()), 1000);
  }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = document.getElementById('f-code').value;
  if (!v) return;
  code = v;
  sessionStorage.setItem('admincode', v);
  enter();
});

document.getElementById('beamer-exit').addEventListener('click', () => {
  beamer = false;
  document.getElementById('beamer-exit').hidden = true;
  draw();
});

renderPlayerQr(qrBox, location.href);
if (code) enter();
