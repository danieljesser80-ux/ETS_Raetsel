import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderPlayerQr } from './qr.js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';
import { createApi } from './api.js';
import { reasonText } from './texts.js';
import { renderAdmin, renderMessage, updateCountdowns, clearDrafts } from './views.js';
import { createRefreshLoop } from './refresh.js';
import { resultsCsv } from './export.js';
import { stateKey, createConfigCache } from './clientcache.js';
import { parseAufgaben, tasksForImport } from './aufgabenformat.js';

const root = document.getElementById('app');
const notice = document.getElementById('notice');
const loginBox = document.getElementById('login');
const qrBox = document.getElementById('qr');
const client = createClient(SUPABASE_URL, SUPABASE_KEY);
const api = createApi(client);

let code = sessionStorage.getItem('admincode') || '';
let overview = null;
let overviewKey = null;
const configCache = createConfigCache();
let importPreview = null;
let closedLocally = false;
let timer = null;
let selectedGroup = null;
let adminTab = 'steuerung';
let busy = false;
let connectionLost = false;

function setNotice(text, kind) {
  notice.textContent = text || '';
  notice.className = text ? `message ${kind || 'info'}` : '';
  notice.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}

function draw() {
  if (!overview) return;
  renderAdmin(root, { ...overview, selectedGroup, adminTab, connectionLost, importPreview }, handlers, Date.now());
  if (busy) for (const field of root.querySelectorAll('button, input, textarea, select')) field.disabled = true;
}

const sync = createRefreshLoop({
  async load() {
    await api.ensureSession();
    let o = await api.admin.overview(code, configCache.rev());
    if (!o) throw new Error('Keine Antwort vom Server');
    let merged = configCache.merge(o);
    if (merged === null) {
      configCache.clear();
      o = await api.admin.overview(code, null);
      if (!o) throw new Error('Keine Antwort vom Server');
      merged = configCache.merge(o);
    }
    return merged;
  },
  apply(o) {
    if (!o || !o.ok) {
      connectionLost = true;
      configCache.clear();
      setNotice(reasonText(o && o.reason), 'error');
      if (o && o.reason === 'nicht_berechtigt') logout();
      else draw();
      return;
    }
    const wasLost = connectionLost;
    connectionLost = false;
    if (o.phase !== 'anmeldung') closedLocally = false;
    if (closedLocally && o.closed_early === undefined) o.closed_early = true;
    o.fetchedAtMs = Date.now();
    const key = stateKey(o, `${closedLocally}`);
    const unchanged = overview && key === overviewKey && !wasLost;
    overview = o;
    overviewKey = key;
    if (notice.dataset.conn) {
      delete notice.dataset.conn;
      setNotice('');
    }
    if (!unchanged) draw();
  },
  onError() {
    connectionLost = true;
    configCache.clear();
    notice.dataset.conn = '1';
    setNotice('Verbindung unterbrochen – neuer Versuch …', 'error');
    draw();
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
    setNotice(`Aktion nicht bestätigt: ${e.message || 'Verbindung unterbrochen'}. Status prüfen, bevor du sie wiederholst.`, 'error');
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
  onSetGameConfig: (minutes, difficulty, schedules) => command(() => api.admin.setGameConfig(code, minutes, difficulty, schedules),
    'Spielzeit und Punkte gespeichert.', ['game-minutes', 'word-difficulty',
      ...['leicht', 'mittel', 'schwer'].flatMap((level) => Array.from({ length: 9 }, (_, i) => `points-${level}-${i + 1}`))]),
  onSetWords: (words) => command(() => api.admin.setWords(code, words), 'Wortliste gespeichert.', ['words']),
  onSetTask: (id, fields) => command(() => api.admin.setTask(code, id, fields), 'Rätsel gespeichert.',
    ['title', 'body', 'image', 'solution', 'opt1', 'opt2', 'opt3', 'opt4', 'correct', 'difficulty'].map((suffix) => `t-${id}-${suffix}`)),
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
        configCache.clear();
        importPreview = null;
        adminTab = 'steuerung';
        selectedGroup = null;
      }
      return result;
    }, 'Zurückgesetzt.', null);
  },
  async onBeamer() {
    const child = window.open('beamer.html', 'raetsel-beamer');
    if (!child) {
      setNotice('Beamerfenster blockiert. Pop-ups für diese Website erlauben und erneut öffnen.', 'error');
      return;
    }
    let token = null;
    let ready = false;
    const send = () => {
      if (ready && token) {
        child.postMessage({ type: 'raetsel-beamer-token', token }, location.origin);
        cleanup();
      }
    };
    const receive = (event) => {
      if (event.origin !== location.origin || event.source !== child || event.data?.type !== 'raetsel-beamer-ready') return;
      ready = true;
      send();
    };
    const cleanup = () => {
      window.removeEventListener('message', receive);
      clearTimeout(timeout);
    };
    window.addEventListener('message', receive);
    const timeout = setTimeout(() => {
      cleanup();
      setNotice('Beamerseite konnte nicht verbunden werden. Erneut öffnen.', 'error');
    }, 15000);
    try {
      const result = await api.admin.openBeamer(code);
      if (!result?.ok || !result.token) {
        cleanup();
        setNotice(reasonText(result?.reason), 'error');
        return;
      }
      token = result.token;
      send();
    } catch (error) {
      cleanup();
      setNotice(`Beamerzugang fehlgeschlagen: ${error.message}`, 'error');
    }
  },
  onExport: () => command(async () => {
    const result = await api.admin.exportResults(code);
    if (!result?.ok) return result;
    const url = URL.createObjectURL(new Blob([resultsCsv(result.rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raetsel-ergebnisse.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return result;
  }, 'Ergebnisse als CSV heruntergeladen.'),
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
  async onImportFile(text) {
    const parsed = parseAufgaben(text);
    if (!parsed.ok) {
      importPreview = { errors: parsed.errors, warnings: parsed.warnings, canApply: false };
      draw();
      return;
    }
    if (busy) return;
    busy = true;
    draw();
    try {
      const r = await api.admin.importTasks(code, tasksForImport(parsed.tasks), false);
      importPreview = {
        errors: r?.errors || [], warnings: r?.warnings || parsed.warnings, counts: r?.counts,
        canApply: !!r?.ok, tasks: parsed.tasks, reason: r && !r.ok && !r.errors ? r.reason : null,
      };
    } catch (e) {
      setNotice(`Vorschau nicht möglich: ${e.message || 'Verbindung unterbrochen'}.`, 'error');
    } finally {
      busy = false;
      draw();
    }
  },
  onImportApply: () => {
    const tasks = importPreview && importPreview.canApply ? importPreview.tasks : null;
    if (!tasks) return;
    return command(async () => {
      const r = await api.admin.importTasks(code, tasksForImport(tasks), true);
      if (r && r.ok) importPreview = null;
      return r;
    }, 'Aufgaben importiert.');
  },
  onImportCancel: () => {
    importPreview = null;
    draw();
  },
};

function logout() {
  sync.stop();
  clearDrafts(root);
  code = '';
  sessionStorage.removeItem('admincode');
  overview = null;
  overviewKey = null;
  importPreview = null;
  configCache.clear();
  selectedGroup = null;
  adminTab = 'steuerung';
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

renderPlayerQr(qrBox, location.href);
if (code) enter();
