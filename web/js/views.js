import { countdownSeconds, formatClock } from './countdown.js';
import { phaseText } from './texts.js';
import { taskPreparation } from './preparation.js';

const listeners = new WeakMap();
const viewKeys = new WeakMap();

function listen(node, event, handler) {
  node.addEventListener(event, handler);
  const entries = listeners.get(node) || [];
  entries.push([event, handler]);
  listeners.set(node, entries);
}

function nodeKey(node) {
  if (node.nodeType !== 1) return node.nodeName;
  return `${node.tagName}:${node.id || node.getAttribute('name') || node.getAttribute('data-task')
    || node.getAttribute('data-action') || node.getAttribute('data-section') || ''}`;
}

function reconcile(old, fresh) {
  if (old.nodeType !== fresh.nodeType || nodeKey(old) !== nodeKey(fresh)) {
    old.replaceWith(fresh);
    return;
  }
  if (old.nodeType !== 1) {
    if (old.nodeValue !== fresh.nodeValue) old.nodeValue = fresh.nodeValue;
    return;
  }
  const field = old.matches('input, textarea, select');
  const dirty = field && (old.type === 'radio' || old.type === 'checkbox'
    ? old.checked !== old.defaultChecked : old.value !== old.defaultValue);
  const savedValue = field ? old.value : null;
  const savedChecked = old.checked;
  for (const attr of [...old.attributes]) {
    if (!fresh.hasAttribute(attr.name)) old.removeAttribute(attr.name);
  }
  for (const attr of fresh.attributes) {
    if (old.getAttribute(attr.name) !== attr.value) old.setAttribute(attr.name, attr.value);
  }
  for (const [event, handler] of listeners.get(old) || []) old.removeEventListener(event, handler);
  const nextListeners = listeners.get(fresh) || [];
  for (const [event, handler] of nextListeners) old.addEventListener(event, handler);
  listeners.set(old, nextListeners);
  const previous = [...old.childNodes];
  const used = new Set();
  for (const [index, child] of [...fresh.childNodes].entries()) {
    const candidate = previous.find((node) => !used.has(node) && nodeKey(node) === nodeKey(child));
    if (candidate) {
      used.add(candidate);
      if (old.childNodes[index] !== candidate) old.insertBefore(candidate, old.childNodes[index] || null);
      reconcile(candidate, child);
    } else {
      old.insertBefore(child, old.childNodes[index] || null);
    }
  }
  for (const node of previous) if (!used.has(node) && node.parentNode === old) node.remove();
  if (field) {
    if (old.type === 'radio' || old.type === 'checkbox') old.checked = dirty ? savedChecked : fresh.checked;
    else {
      const value = dirty ? savedValue : fresh.value;
      if (old.value !== value) old.value = value;
    }
  }
}

function commit(root, fresh, key) {
  const focused = root.ownerDocument.activeElement;
  const selection = focused && root.contains(focused) && typeof focused.selectionStart === 'number'
    ? [focused.selectionStart, focused.selectionEnd, focused.selectionDirection] : null;
  if (viewKeys.get(root) !== key) {
    root.replaceChildren(...fresh.childNodes);
  } else {
    reconcile(root, fresh);
    if (focused && root.contains(focused)) {
      if (root.ownerDocument.activeElement !== focused) focused.focus({ preventScroll: true });
      if (selection) focused.setSelectionRange(...selection);
    }
  }
  viewKeys.set(root, key);
}

export function clearDrafts(root, names) {
  const selected = names ? new Set(names) : null;
  for (const field of root.querySelectorAll('input[name], textarea[name], select[name]')) {
    if (selected && !selected.has(field.name)) continue;
    if (field.type === 'radio' || field.type === 'checkbox') field.checked = field.defaultChecked;
    else field.value = field.defaultValue;
  }
  if (!names) viewKeys.delete(root);
}

function el(doc, tag, opts = {}, children = []) {
  const node = doc.createElement(tag);
  if (opts.cls) node.className = opts.cls;
  if (opts.text !== undefined) node.textContent = String(opts.text);
  if (opts.attrs) {
    for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, String(v));
  }
  for (const c of children) if (c) node.appendChild(c);
  return node;
}

function countdownBox(doc, seconds) {
  return el(doc, 'div', {
    cls: 'countdown',
    text: formatClock(seconds),
    attrs: { 'data-countdown': '1', role: 'timer' },
  });
}

export function updateCountdowns(root, state, nowMs) {
  const secs = countdownSeconds(state, nowMs);
  if (secs === null) return;
  for (const n of root.querySelectorAll('[data-countdown]')) n.textContent = formatClock(secs);
}

function sectionTitle(doc, text) {
  return el(doc, 'h2', { text });
}

function feedbackNode(doc, fb) {
  if (!fb || !fb.text) return null;
  const kind = fb.kind === 'error' || fb.kind === 'success' ? fb.kind : 'info';
  return el(doc, 'p', {
    cls: `message ${kind}`,
    text: fb.text,
    attrs: { role: kind === 'error' ? 'alert' : 'status', 'data-feedback': '1' },
  });
}

function textForm(doc, { name, label, button, maxlength, onSubmit, placeholder, feedback, disabled }) {
  const form = el(doc, 'form', { cls: 'stack' });
  const id = `f-${name}`;
  const lab = el(doc, 'label', { text: label, attrs: { for: id } });
  const attrs = { id, name, type: name === 'code' ? 'password' : 'text', autocomplete: 'off', autocapitalize: 'characters' };
  if (maxlength) attrs.maxlength = maxlength;
  if (placeholder) attrs.placeholder = placeholder;
  if (disabled) attrs.disabled = 'disabled';
  const input = el(doc, 'input', { cls: 'big-input', attrs });
  const btnAttrs = { type: 'submit' };
  if (disabled) btnAttrs.disabled = 'disabled';
  const btn = el(doc, 'button', { cls: 'btn primary', text: button, attrs: btnAttrs });
  listen(form, 'submit', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e.currentTarget.querySelector('button[type="submit"]').disabled) return;
    onSubmit(e.currentTarget.querySelector('input[name]').value);
  });
  form.append(lab, input);
  const fbNode = feedbackNode(doc, feedback);
  if (fbNode) form.append(fbNode);
  form.append(btn);
  return form;
}

export function renderMessage(root, text, kind = 'info') {
  const doc = root.ownerDocument || document;
  root.textContent = '';
  const k = kind === 'error' || kind === 'success' ? kind : 'info';
  root.appendChild(
    el(doc, 'p', { cls: `message ${k}`, text, attrs: { role: k === 'error' ? 'alert' : 'status' } }),
  );
}

function submittedMark(task) {
  if (task.correct === true) return { text: '✓ Richtig', cls: 'ok' };
  if (task.correct === false) return { text: '✗ Falsch', cls: 'wrong' };
  if (task.kind === 'estimate') return { text: 'Geschätzt', cls: 'guessed' };
  return { text: 'Abgegeben', cls: 'guessed' };
}

function taskStatus(task, finished) {
  if (task.submitted) {
    const mark = submittedMark(task).text;
    const pl = task.placement;
    if (!pl) return mark;
    if (finished && pl.points !== undefined) return `${mark} – Platz ${pl.rank}, ${pl.points} Punkte`;
    return `${mark} – vorläufig Platz ${pl.rank}`;
  }
  if (!task.available) return 'Noch nicht verfügbar';
  if (task.kind === 'exact' && task.attempts_used > 0) {
    return `Noch ${task.attempts_remaining} ${task.attempts_remaining === 1 ? 'Versuch' : 'Versuche'} – die Zeit läuft`;
  }
  return task.started ? 'Geöffnet – die Zeit läuft' : 'Noch nicht geöffnet';
}

function choiceForm(doc, task, handlers, { feedback, disabled } = {}) {
  const form = el(doc, 'form', { cls: 'stack' });
  const radioName = `choice-${task.id}`;
  form.append(el(doc, 'p', { text: 'Wählt einen Namen:' }));
  for (const [idx, opt] of (task.options || []).entries()) {
    const id = `f-${radioName}-${idx}`;
    const radioAttrs = { id, type: 'radio', name: radioName, value: opt };
    if (disabled) radioAttrs.disabled = 'disabled';
    form.append(
      el(doc, 'label', {}, [
        el(doc, 'input', { attrs: radioAttrs }),
        el(doc, 'span', { text: ` ${opt}` }),
      ]),
    );
  }
  const numName = `task-${task.id}`;
  const numAttrs = { id: `f-${numName}`, name: numName, type: 'text', inputmode: 'numeric', autocomplete: 'off' };
  if (disabled) numAttrs.disabled = 'disabled';
  const num = el(doc, 'input', { cls: 'big-input', attrs: numAttrs });
  const btnAttrs = { type: 'submit' };
  if (disabled) btnAttrs.disabled = 'disabled';
  form.append(
    el(doc, 'label', { text: 'Wie viele Personen? (Zahl, eine Abgabe)', attrs: { for: `f-${numName}` } }),
    num,
  );
  const fbNode = feedbackNode(doc, feedback);
  if (fbNode) form.append(fbNode);
  form.append(el(doc, 'button', { cls: 'btn primary', text: 'Abgeben', attrs: btnAttrs }));
  listen(form, 'submit', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const live = e.currentTarget;
    if (live.querySelector('button[type="submit"]').disabled) return;
    const chosen = live.querySelector(`input[name="${radioName}"]:checked`);
    handlers.onSubmitTask && handlers.onSubmitTask(task.id, live.querySelector(`input[name="${numName}"]`).value, chosen ? chosen.value : null);
  });
  return form;
}

function taskForm(doc, t, handlers, feedback) {
  const disabled = t.submitted === true || feedback?.accepted === true;
  if (t.needs_choice) return choiceForm(doc, t, handlers, { feedback, disabled });
  return textForm(doc, {
    name: `task-${t.id}`,
    label: t.kind === 'estimate' ? 'Eure Schätzung (Zahl, eine Abgabe)'
      : `Eure Antwort – Versuch ${Math.min((t.attempts_used || 0) + 1, 3)} von 3`,
    button: t.kind === 'estimate' ? 'Schätzung abgeben' : 'Antwort senden',
    onSubmit: (v) => handlers.onSubmitTask && handlers.onSubmitTask(t.id, v, null),
    feedback,
    disabled,
  });
}

function taskView(doc, state, task, handlers) {
  const fb = state.feedback && state.feedback.scope === task.id ? state.feedback : null;
  const out = [sectionTitle(doc, task.title)];
  if (task.submitted) out.push(el(doc, 'p', { cls: 'tstatus', text: submittedMark(task).text }));
  if (task.body) out.push(el(doc, 'p', { cls: 'tbody', text: task.body }));
  if (task.image_url) out.push(el(doc, 'img', { cls: 'timg', attrs: { src: task.image_url, alt: task.title } }));
  if (task.kind === 'exact' && task.attempts_used > 0 && !task.submitted) {
    out.push(el(doc, 'p', { text: `Noch ${task.attempts_remaining} ${task.attempts_remaining === 1 ? 'Versuch' : 'Versuche'}` }));
  }
  out.push(taskForm(doc, task, handlers, fb));
  return out;
}

function taskOverview(doc, state, handlers) {
  const tasks = state.tasks || [];
  const isLeader = state.leader === true;
  const finished = state.phase === 'aufgabe_abgeschlossen';
  const out = [sectionTitle(doc, 'Rätsel')];
  out.push(
    el(doc, 'p', {
      text: isLeader
        ? 'Du bist Spielleiter: Tippe auf ein Rätsel, um es zu öffnen. Exakte Aufgaben erlauben bis zu drei Versuche, Schätzfragen eine Abgabe. Die Zeit läuft ab dem ersten Öffnen.'
        : `Euer Spielleiter${state.leader_name ? ` (${state.leader_name})` : ''} öffnet die Rätsel und gibt die Antworten ein.`,
    }),
  );
  let lastCategory = null;
  for (const t of tasks) {
    if (t.category !== lastCategory) {
      out.push(el(doc, 'h3', { text: t.category }));
      lastCategory = t.category;
    }
    const mark = t.submitted ? submittedMark(t) : null;
    const box = el(doc, 'div', { cls: `task stack${mark ? ` ${mark.cls}` : ''}`, attrs: { 'data-task': t.id } });
    if (isLeader && !finished && !t.submitted && t.available) {
      const b = el(doc, 'button', { cls: 'btn primary', text: t.title, attrs: { type: 'button', 'data-open': t.id } });
      listen(b, 'click', () => handlers.onOpenTask && handlers.onOpenTask(t.id));
      box.append(b);
    } else {
      box.append(el(doc, 'p', { cls: 'tname', text: t.title }));
    }
    box.append(el(doc, 'p', { cls: 'tstatus', text: taskStatus(t, finished) }));
    out.push(box);
  }
  if (!tasks.length) out.push(el(doc, 'p', { text: 'Noch keine Rätsel.' }));
  return out;
}

export function renderPlayer(root, state, handlers = {}, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  const liveRoot = root;
  root = liveRoot.cloneNode(false);
  if (!state || typeof state !== 'object' || state.ok === false || !state.phase) {
    renderMessage(root, 'Verbinde …', 'info');
    commit(liveRoot, root, 'player:connecting');
    return;
  }
  const secs = countdownSeconds(state, nowMs);
  const phase = state.phase;
  const card = el(doc, 'section', { cls: 'card stack' });

  if (!state.joined) {
    if (phase === 'anmeldung' && secs !== null && secs > 0) {
      card.append(
        sectionTitle(doc, 'Anmeldung'),
        el(doc, 'p', { text: 'Die Anmeldung schließt in:' }),
        countdownBox(doc, secs),
        textForm(doc, {
          name: 'playerName',
          label: 'Dein Spitzname',
          button: 'Anmelden',
          maxlength: 20,
          onSubmit: (v) => handlers.onJoin && handlers.onJoin(v),
        }),
      );
    } else if (phase === 'vorbereitet') {
      card.append(
        sectionTitle(doc, 'Bitte warten'),
        el(doc, 'p', { text: 'Die Anmeldung hat noch nicht begonnen.' }),
      );
    } else {
      card.append(
        sectionTitle(doc, 'Anmeldung geschlossen'),
        el(doc, 'p', { text: 'Die Anmeldung ist nicht mehr möglich.' }),
      );
    }
  } else if (phase === 'vorbereitet' || phase === 'anmeldung') {
    card.append(el(doc, 'p', { cls: 'hello', text: `Angemeldet als ${state.name}` }));
    if (secs !== null) card.append(countdownBox(doc, secs));
    card.append(el(doc, 'p', { cls: 'wait', text: 'Bitte warten' }));
  } else if (phase === 'wortaufgabe_aktiv' || phase === 'gruppen_eingeteilt') {
    const group = state.group;
    const openTask = state.solved && state.leader === true && phase === 'wortaufgabe_aktiv' && state.openTaskId
      ? (state.tasks || []).find((t) => t.id === state.openTaskId && t.started && t.available)
      : null;
    if (!group) {
      card.append(sectionTitle(doc, 'Bitte warten'), el(doc, 'p', { text: 'Du hast noch keine Gruppe.' }));
    } else if (openTask) {
      card.append(...taskView(doc, state, openTask, handlers));
    } else {
      card.classList.add('player-overview');
      card.append(el(doc, 'h2', { cls: 'player-group-name', text: group.name }));
      const list = el(doc, 'ul', { cls: 'members', attrs: { 'aria-label': 'Mitglieder eurer Gruppe' } });
      for (const m of group.members || []) {
        list.appendChild(el(doc, 'li', { text: m, cls: m === state.name ? 'me' : '' }));
      }
      card.append(list);
      if (state.solved) {
        card.append(
          el(doc, 'p', {
            cls: 'message success',
            text: state.solved.points !== undefined
              ? `Wort gelöst! Platz ${state.solved.rank} – ${state.solved.points} Punkte`
              : `Wort gelöst! Vorläufig Platz ${state.solved.rank}`,
          }),
        );
        card.append(...taskOverview(doc, state, handlers));
      } else {
        const letters = el(doc, 'div', { cls: 'letters', attrs: { 'aria-label': 'Deine Buchstaben' } });
        for (const l of state.letters || []) letters.appendChild(el(doc, 'span', { cls: 'letter', text: l }));
        card.append(el(doc, 'p', { text: 'Deine Buchstaben:' }), letters);
        card.append(
          el(doc, 'p', { text: 'Findet eure Gruppenmitglieder und setzt das Wort zusammen' }),
          textForm(doc, {
            name: 'answer',
            label: 'Euer Lösungswort',
            button: 'Wort senden',
            onSubmit: (v) => handlers.onSubmit && handlers.onSubmit(v),
            feedback: state.feedback && state.feedback.scope === 'wort' ? state.feedback : null,
          }),
        );
      }
    }
  } else if (phase === 'aufgabe_abgeschlossen') {
    if (state.solved) card.classList.add('player-overview');
    card.append(sectionTitle(doc, 'Spiele beendet'));
    if (state.final) {
      card.append(
        el(doc, 'p', {
          cls: 'message success',
          text: `Eure Gruppe: Platz ${state.final.rank} – ${state.final.points} Punkte`,
        }),
      );
    } else {
      card.append(el(doc, 'p', { cls: 'message info', text: 'Die Spiele sind beendet.' }));
    }
    if (state.solved) card.append(...taskOverview(doc, state, handlers));
    else card.append(el(doc, 'p', { cls: 'message info', text: 'Eure Gruppe hat das Wort nicht gelöst.' }));
  } else {
    card.append(el(doc, 'p', { text: phaseText(phase) }));
  }
  root.appendChild(card);
  commit(liveRoot, root, JSON.stringify(['player', state.phase, state.joined, state.name,
    state.group?.name, !!state.solved, state.openTaskId || null]));
}

function remainingOf(overview, nowMs) {
  return countdownSeconds(overview, nowMs);
}

function rankingList(doc, ranking, showPoints = true, groups = []) {
  const ol = el(doc, 'ol', { cls: 'ranking' });
  const entries = [...(ranking || [])];
  for (const group of groups || []) {
    if (!entries.some((entry) => entry.group === group.name)) entries.push({ group: group.name });
  }
  for (const r of entries) {
    const group = groups.find((g) => g.name === r.group);
    const name = el(doc, 'span', { cls: 'rname', text: r.group });
    if (group) name.append(el(doc, 'span', {
      cls: 'group-status', text: group.solved ? 'Gruppe komplett' : (group.members || []).join(', '),
    }));
    ol.appendChild(
      el(doc, 'li', {}, [
        el(doc, 'span', { cls: 'rank', text: r.rank == null ? '–' : `${r.rank}.` }),
        name,
        showPoints && r.points != null ? el(doc, 'span', { cls: 'pts', text: `${r.points} Punkte` }) : null,
      ]),
    );
  }
  if (!entries.length) ol.appendChild(el(doc, 'li', { text: 'Noch keine Ergebnisse.' }));
  return ol;
}

export function renderAdmin(root, overview, handlers = {}, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  const liveRoot = root;
  root = liveRoot.cloneNode(false);
  if (!overview || typeof overview !== 'object' || overview.ok === false || !overview.phase) {
    renderMessage(root, 'Verbinde …', 'info');
    commit(liveRoot, root, 'admin:connecting');
    return;
  }
  const phase = overview.phase;
  const selected = overview.selectedGroup
    ? (overview.groups || []).find((g) => g.name === overview.selectedGroup)
    : null;
  if (selected) {
    const card = el(doc, 'section', { cls: 'card stack admin-detail', attrs: { 'data-group-detail': selected.name } }, [
      sectionTitle(doc, selected.name),
      el(doc, 'p', { text: (selected.members || []).join(', ') }),
    ]);
    const table = el(doc, 'table', { cls: 'detail' });
    table.append(
      el(doc, 'thead', {}, [
        el(doc, 'tr', {}, [
          el(doc, 'th', { text: 'Spiel' }),
          el(doc, 'th', { text: 'Antwort' }),
          el(doc, 'th', { text: 'Zeit' }),
        ]),
      ]),
    );
    const body = el(doc, 'tbody');
    for (const d of selected.details || []) {
      const mark = d.correct === true ? ' ✓' : d.correct === false ? ' ✗' : '';
      body.append(
        el(doc, 'tr', {}, [
          el(doc, 'td', { text: d.attempt_no ? `${d.title} – Versuch ${d.attempt_no}` : d.title }),
          el(doc, 'td', { text: `${d.answer}${mark}` }),
          el(doc, 'td', { text: formatClock(Math.max(0, Math.round((d.duration_ms || 0) / 1000))) }),
        ]),
      );
    }
    table.append(body);
    card.append(el(doc, 'div', { cls: 'admin-detail-scroll' }, [table]));
    if (!(selected.details && selected.details.length)) card.append(el(doc, 'p', { text: 'Noch keine Antworten.' }));
    const back = el(doc, 'button', { cls: 'btn secondary', text: 'Zurück zur Übersicht', attrs: { type: 'button', 'data-action': 'back' } });
    listen(back, 'click', () => handlers.onBackFromGroup && handlers.onBackFromGroup());
    card.append(back);
    root.appendChild(card);
    commit(liveRoot, root, JSON.stringify(['admin', phase, selected.name]));
    return;
  }
  const secs = remainingOf(overview, nowMs);  const closed = overview.closed_early === true || (secs !== null && secs <= 0);
  const call = (name, ...a) => () => handlers[name] && handlers[name](...a);

  const status = el(doc, 'section', { cls: 'card stack' }, [
    sectionTitle(doc, 'Status'),
    el(doc, 'p', { cls: 'phase', text: phaseText(phase) }),
  ]);
  if (secs !== null) status.append(el(doc, 'p', { text: 'Restzeit:' }), countdownBox(doc, secs));
  if (phase === 'wortaufgabe_aktiv' && overview.finished !== true) {
    status.append(el(doc, 'p', { cls: 'note', text: 'Wertung vorläufig – Punkte werden erst mit „Spiele beenden“ final.' }));
  }
  const players = overview.players || [];
  status.append(el(doc, 'p', { cls: 'count', text: `Teilnehmer: ${players.length}` }));

  const controls = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Steuerung')]);
  const secInput = el(doc, 'input', {
    cls: 'big-input',
    attrs: { id: 'f-seconds', name: 'seconds', type: 'number', min: 10, max: 3600, value: 300 },
  });
  const canStart = phase === 'vorbereitet' || phase === 'anmeldung';
  const mk = (id, text, enabled, cls, fn) => {
    const b = el(doc, 'button', { cls: `btn ${cls}`, text, attrs: { type: 'button', 'data-action': id } });
    if (!enabled) b.setAttribute('disabled', 'disabled');
    listen(b, 'click', (event) => {
      if (!event.currentTarget.disabled) fn(event);
    });
    return b;
  };
  controls.append(
    el(doc, 'label', { text: 'Dauer der Anmeldung (Sekunden)', attrs: { for: 'f-seconds' } }),
    secInput,
    mk('start', phase === 'anmeldung' ? 'Anmeldung erneut öffnen' : 'Anmeldung starten', canStart, 'primary', (event) =>
      handlers.onStart && handlers.onStart(Number(event.currentTarget.parentElement.querySelector('[name="seconds"]').value)),
    ),
    mk('close', 'Anmeldung schließen', phase === 'anmeldung', 'secondary', call('onClose')),
    mk('form', 'Gruppen einteilen', phase === 'anmeldung' && closed, 'primary', call('onForm')),
    mk('finish', 'Spiele beenden', phase === 'wortaufgabe_aktiv', 'secondary', call('onFinish')),
    mk('reset', 'Alles zurücksetzen', true, 'danger', call('onReset')),
    mk('beamer', 'Beamer-Ansicht', true, 'secondary', call('onBeamer')),
  );

  const pl = el(doc, 'ul', { cls: 'members' });
  for (const p of players) {
    pl.appendChild(el(doc, 'li', { text: p.group ? `${p.name} (${p.group})` : p.name }));
  }
  const playersCard = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Teilnehmer'), pl]);

  const groupsCard = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Gruppen')]);
  for (const g of overview.groups || []) {
    const result = g.solved ? ` – Platz ${g.rank}${overview.finished === true ? `, ${g.points} Punkte` : ' (vorläufig)'}` : ' – offen';
    const lead = g.leader ? ` (Spielleiter: ${g.leader})` : '';
    const nameBtn = el(doc, 'button', { cls: 'gname linklike', text: g.name, attrs: { type: 'button', 'data-group': g.name } });
    listen(nameBtn, 'click', () => handlers.onSelectGroup && handlers.onSelectGroup(g.name));
    groupsCard.append(
      el(doc, 'p', { cls: 'gname' }, [nameBtn, doc.createTextNode(`${result}${lead}`)]),
      el(doc, 'p', { text: (g.members || []).join(', ') }),
    );
  }
  if (!(overview.groups && overview.groups.length)) groupsCard.append(el(doc, 'p', { text: 'Noch keine Gruppen.' }));

  const rankCard = el(doc, 'section', { cls: 'card stack' }, [
    sectionTitle(doc, 'Rangliste'),
    rankingList(doc, overview.ranking, true, overview.groups),
  ]);

  const sizeCard = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Gruppengröße')]);
  const numInput = (name, label, value) => [
    el(doc, 'label', { text: label, attrs: { for: `f-${name}` } }),
    el(doc, 'input', { cls: 'big-input', attrs: { id: `f-${name}`, name, type: 'number', min: 1, max: 14, value } }),
  ];
  const [minLabel, minInput] = numInput('gmin', 'Mindestgröße (Spieler je Gruppe)', overview.group_min ?? 4);
  const [maxLabel, maxInput] = numInput('gmax', 'Maximalgröße (Spieler je Gruppe)', overview.group_max ?? 6);
  sizeCard.append(
    minLabel,
    minInput,
    maxLabel,
    maxInput,
    el(doc, 'p', { text: 'Min = Max = 1 ist der Testmodus (jede Person eine Gruppe).' }),
    mk('set-size', 'Größe speichern', canStart, 'primary', (event) =>
      handlers.onSetGroupSize && handlers.onSetGroupSize(
        Number(event.currentTarget.parentElement.querySelector('[name="gmin"]').value),
        Number(event.currentTarget.parentElement.querySelector('[name="gmax"]').value)),
    ),
  );

  const tasksCard = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Rätsel verwalten')]);
  for (const t of overview.tasks || []) {
    const field = (suffix, label, value) => {
      const name = `t-${t.id}-${suffix}`;
      return [
        el(doc, 'label', { text: label, attrs: { for: `f-${name}` } }),
        el(doc, 'input', { cls: 'big-input', attrs: { id: `f-${name}`, name, type: 'text', value: value ?? '' } }),
      ];
    };
    const [l1, title] = field('title', 'Titel', t.title);
    const [l2, body] = field('body', 'Text', t.body);
    const [l3, image] = field('image', 'Bild (https-Link oder Pfad)', t.image_url);
    const [l4, solution] = field('solution', t.kind === 'estimate' ? 'Richtige Zahl' : 'Lösung', t.solution);
    const box = el(doc, 'div', { cls: 'task stack', attrs: { 'data-task': t.id } }, [
      el(doc, 'p', { cls: 'tname', text: `${t.category}: ${t.title}` }),
      el(doc, 'p', { text: t.available ? 'Freigegeben' : 'Nicht verfügbar (keine Lösung)' }),
    ]);
    box.append(l1, title, l2, body, l3, image, l4, solution);
    const optInputs = [];
    let correct = null;
    if (t.needs_choice) {
      for (let k = 0; k < 4; k++) {
        const [lo, io] = field(`opt${k + 1}`, `Name ${k + 1}`, (t.options || [])[k]);
        box.append(lo, io);
        optInputs.push(io);
      }
      const [lc, ic] = field('correct', 'Richtiger Name (einer der vier)', t.correct_option);
      box.append(lc, ic);
      correct = ic;
    }
    box.append(
      mk(`save-${t.id}`, 'Speichern', true, 'primary', (event) => {
        if (!handlers.onSetTask) return;
        const box = event.currentTarget.parentElement;
        const value = (suffix) => box.querySelector(`[name="t-${t.id}-${suffix}"]`).value;
        const f = { title: value('title'), body: value('body'), imageUrl: value('image'), solution: value('solution') };
        if (t.needs_choice) {
          const names = [1, 2, 3, 4].map((n) => value(`opt${n}`).trim()).filter(Boolean);
          f.options = names;
          f.correctOption = value('correct').trim();
        }
        handlers.onSetTask(t.id, f);
      }),
      el(doc, 'p', { text: `Abgaben: ${t.answers ?? 0}` }),
    );
    tasksCard.append(box);
  }

  const totalsCard = el(doc, 'section', { cls: 'card stack' }, [sectionTitle(doc, 'Gesamtwertung')]);
  const tl = el(doc, 'ol', { cls: 'ranking' });
  for (const x of overview.totals || []) {
    tl.appendChild(
      el(doc, 'li', {}, [el(doc, 'span', { cls: 'rname', text: x.group }), el(doc, 'span', { cls: 'pts', text: `${x.points} Punkte` })]),
    );
  }
  if (!(overview.totals && overview.totals.length)) tl.appendChild(el(doc, 'li', { text: 'Noch keine Ergebnisse.' }));
  totalsCard.append(tl);

  const preparation = el(doc, 'section', { cls: 'card stack', attrs: { 'data-section': 'preparation' } }, [
    sectionTitle(doc, 'Vorbereitung'),
    el(doc, 'p', { text: 'Prüfung der gespeicherten Inhalte. Bildadressen werden nur auf Hinterlegung geprüft; keine Startsperre.' }),
  ]);
  for (const task of overview.tasks || []) {
    const missing = taskPreparation(task);
    preparation.append(el(doc, 'p', { text: `${task.title}: ${missing.length ? missing.join('; ') : 'Bereit'}` }));
  }
  const sections = [status, controls, sizeCard, playersCard, groupsCard, rankCard, tasksCard, totalsCard];
  sections.forEach((section, index) => section.setAttribute('data-section', `admin-${index}`));
  const tabs = [
    ['steuerung', 'Steuerung', [controls, sizeCard]],
    ['teilnehmer', 'Teilnehmer', [playersCard]],
    ['gruppen', 'Gruppen', [groupsCard]],
    ['rangliste', 'Rangliste', [rankCard]],
    ['aufgaben', 'Aufgaben', [preparation, tasksCard]],
    ['wertung', 'Gesamtwertung', [totalsCard]],
  ];
  const selectedTab = overview.adminTab || 'steuerung';
  const nav = el(doc, 'div', { cls: 'admin-tabs', attrs: { role: 'tablist', 'aria-label': 'Adminbereiche' } });
  const panels = el(doc, 'div', { cls: 'admin-panels' });
  for (const [key, title, cards] of tabs) {
    const tabId = `admin-tab-${key}`;
    const panelId = `admin-panel-${key}`;
    const active = key === selectedTab;
    const button = el(doc, 'button', {
      cls: 'btn secondary',
      text: title,
      attrs: { type: 'button', id: tabId, role: 'tab', 'aria-selected': String(active),
        'aria-controls': panelId, tabindex: active ? 0 : -1 },
    });
    listen(button, 'click', call('onSelectAdminTab', key));
    listen(button, 'keydown', (event) => {
      const keys = tabs.map(([name]) => name);
      let index = keys.indexOf(key);
      if (event.key === 'ArrowRight') index = (index + 1) % keys.length;
      else if (event.key === 'ArrowLeft') index = (index + keys.length - 1) % keys.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = keys.length - 1;
      else return;
      event.preventDefault();
      if (handlers.onSelectAdminTab) handlers.onSelectAdminTab(keys[index]);
      liveRoot.querySelector(`#admin-tab-${keys[index]}`).focus();
    });
    nav.append(button);
    const panel = el(doc, 'section', {
      cls: 'admin-panel',
      attrs: { id: panelId, role: 'tabpanel', 'aria-labelledby': tabId, tabindex: 0 },
    }, cards);
    panel.hidden = !active;
    panels.append(panel);
  }
  root.append(el(doc, 'div', { cls: 'admin-workspace' }, [status, nav, panels]));
  commit(liveRoot, root, JSON.stringify(['admin', phase, overview.selectedGroup || null]));
}

export function renderBeamer(root, overview, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  const liveRoot = root;
  root = liveRoot.cloneNode(false);
  if (!overview || typeof overview !== 'object' || overview.ok === false || !overview.phase) {
    renderMessage(root, 'Verbinde …', 'info');
    commit(liveRoot, root, 'beamer:connecting');
    return;
  }
  const wrap = el(doc, 'section', { cls: 'beamer stack' });
  wrap.append(el(doc, 'h1', { text: phaseText(overview.phase) }));
  if (overview.phase === 'anmeldung') {
    const secs = remainingOf(overview, nowMs);
    if (secs !== null) wrap.append(countdownBox(doc, secs));
  }
  wrap.append(
    el(doc, 'p', { cls: 'count', text: `Teilnehmer: ${(overview.players || []).length}` }),
    sectionTitle(doc, 'Rangliste'),
    rankingList(doc, overview.ranking, overview.finished === true, overview.groups),
  );
  root.appendChild(wrap);
  commit(liveRoot, root, `beamer:${overview.phase}`);
}
