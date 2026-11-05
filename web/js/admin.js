import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import QRCode from 'https://esm.sh/qrcode@1.5.4';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { reasonText } from './texts.js';
import { renderAdmin, renderBeamer, renderMessage, updateCountdowns } from './views.js';

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
  renderAdmin(root, overview, handlers, Date.now());
}

async function refresh() {
  if (!code) return;
  try {
    const o = await api.admin.overview(code);
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
  } catch (e) {
    notice.dataset.conn = '1';
    setNotice('Verbindung unterbrochen – neuer Versuch …', 'error');
  }
}

async function command(fn, okText) {
  try {
    const r = await fn();
    if (r && r.ok === false) setNotice(reasonText(r.reason), 'error');
    else setNotice(okText || '', 'success');
  } catch (e) {
    setNotice('Verbindung unterbrochen – bitte erneut versuchen.', 'error');
  }
  await refresh();
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
  onFinish: () => command(() => api.admin.finish(code), 'Aufgabe beendet.'),
  onReset: () => {
    if (!confirm('Wirklich alles zurücksetzen? Alle Teilnehmer und Ergebnisse werden gelöscht.')) return;
    closedLocally = false;
    return command(() => api.admin.reset(code), 'Zurückgesetzt.');
  },
  onBeamer: () => {
    beamer = true;
    document.getElementById('beamer-exit').hidden = false;
    draw();
  },
};

function logout() {
  code = '';
  sessionStorage.removeItem('admincode');
  overview = null;
  loginBox.hidden = false;
  root.textContent = '';
}

async function enter() {
  loginBox.hidden = true;
  renderMessage(root, 'Verbinde …', 'info');
  try {
    await api.ensureSession();
  } catch (e) {
    setNotice('Verbindung fehlgeschlagen.', 'error');
  }
  await refresh();
  if (!timer) {
    timer = setInterval(refresh, 2000);
    setInterval(() => overview && updateCountdowns(root, overview, Date.now()), 1000);
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

async function showQr() {
  const url = new URL('index.html', location.href).href;
  try {
    const img = document.createElement('img');
    img.alt = 'QR-Code zur Anmeldung';
    img.src = await QRCode.toDataURL(url, { width: 240, margin: 2 });
    qrBox.append(img);
  } catch (e) {
    // QR optional; Adresse bleibt sichtbar.
  }
  const p = document.createElement('p');
  p.textContent = url;
  qrBox.append(p);
}

showQr();
if (code) enter();
