import { countdownSeconds, formatClock } from './countdown.js';
import { phaseText } from './texts.js';

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

// Merkt Eingaben/Fokus, damit ein Neuzeichnen das Tippen nicht unterbricht.
function snapshot(root) {
  const values = {};
  let focused = null;
  const inputs = root.querySelectorAll ? root.querySelectorAll('input[name]') : [];
  for (const i of inputs) {
    values[i.getAttribute('name')] = i.value;
    if (root.ownerDocument && root.ownerDocument.activeElement === i) focused = i.getAttribute('name');
  }
  return { values, focused };
}

function restore(root, snap) {
  for (const [name, value] of Object.entries(snap.values)) {
    const i = root.querySelector(`input[name="${name}"]`);
    if (i && value) i.value = value;
    if (i && snap.focused === name && typeof i.focus === 'function') i.focus();
  }
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

function textForm(doc, { name, label, button, maxlength, onSubmit, placeholder }) {
  const form = el(doc, 'form', { cls: 'stack' });
  const id = `f-${name}`;
  const lab = el(doc, 'label', { text: label, attrs: { for: id } });
  const attrs = { id, name, type: name === 'code' ? 'password' : 'text', autocomplete: 'off', autocapitalize: 'characters' };
  if (maxlength) attrs.maxlength = maxlength;
  if (placeholder) attrs.placeholder = placeholder;
  const input = el(doc, 'input', { cls: 'big-input', attrs });
  const btn = el(doc, 'button', { cls: 'btn primary', text: button, attrs: { type: 'submit' } });
  form.addEventListener('submit', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    onSubmit(input.value);
  });
  form.append(lab, input, btn);
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

export function renderPlayer(root, state, handlers = {}, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  const snap = snapshot(root);
  root.textContent = '';
  if (!state || typeof state !== 'object' || state.ok === false || !state.phase) {
    renderMessage(root, 'Verbinde …', 'info');
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
    if (!group) {
      card.append(sectionTitle(doc, 'Bitte warten'), el(doc, 'p', { text: 'Du hast noch keine Gruppe.' }));
    } else {
      card.append(sectionTitle(doc, group.name));
      const list = el(doc, 'ul', { cls: 'members' });
      for (const m of group.members || []) {
        list.appendChild(el(doc, 'li', { text: m, cls: m === state.name ? 'me' : '' }));
      }
      card.append(el(doc, 'p', { text: 'Eure Gruppe:' }), list);
      const letters = el(doc, 'div', { cls: 'letters', attrs: { 'aria-label': 'Deine Buchstaben' } });
      for (const l of state.letters || []) letters.appendChild(el(doc, 'span', { cls: 'letter', text: l }));
      card.append(el(doc, 'p', { text: 'Deine Buchstaben:' }), letters);
      if (state.solved) {
        card.append(
          el(doc, 'p', {
            cls: 'message success',
            text: `Gelöst! Platz ${state.solved.rank} – ${state.solved.points} Punkte`,
          }),
        );
      } else {
        card.append(
          el(doc, 'p', { text: 'Findet eure Gruppenmitglieder und setzt das Wort zusammen' }),
          textForm(doc, {
            name: 'answer',
            label: 'Euer Lösungswort',
            button: 'Wort senden',
            onSubmit: (v) => handlers.onSubmit && handlers.onSubmit(v),
          }),
        );
      }
    }
  } else if (phase === 'aufgabe_abgeschlossen') {
    card.append(sectionTitle(doc, 'Aufgabe abgeschlossen'));
    if (state.solved) {
      card.append(
        el(doc, 'p', {
          cls: 'message success',
          text: `Eure Gruppe: Platz ${state.solved.rank} – ${state.solved.points} Punkte`,
        }),
      );
    } else {
      card.append(el(doc, 'p', { cls: 'message info', text: 'Eure Gruppe hat das Wort nicht gelöst.' }));
    }
  } else {
    card.append(el(doc, 'p', { text: phaseText(phase) }));
  }
  root.appendChild(card);
  restore(root, snap);
}

function remainingOf(overview, nowMs) {
  return countdownSeconds(overview, nowMs);
}

function rankingList(doc, ranking) {
  const ol = el(doc, 'ol', { cls: 'ranking' });
  for (const r of ranking || []) {
    ol.appendChild(
      el(doc, 'li', {}, [
        el(doc, 'span', { cls: 'rank', text: `${r.rank}.` }),
        el(doc, 'span', { cls: 'rname', text: r.group }),
        el(doc, 'span', { cls: 'pts', text: `${r.points} Punkte` }),
      ]),
    );
  }
  if (!(ranking && ranking.length)) ol.appendChild(el(doc, 'li', { text: 'Noch keine Ergebnisse.' }));
  return ol;
}

export function renderAdmin(root, overview, handlers = {}, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  const snap = snapshot(root);
  root.textContent = '';
  if (!overview || typeof overview !== 'object' || overview.ok === false || !overview.phase) {
    renderMessage(root, 'Verbinde …', 'info');
    return;
  }
  const phase = overview.phase;
  const secs = remainingOf(overview, nowMs);
  const closed = overview.closed_early === true || (secs !== null && secs <= 0);
  const call = (name, ...a) => () => handlers[name] && handlers[name](...a);

  const status = el(doc, 'section', { cls: 'card stack' }, [
    sectionTitle(doc, 'Status'),
    el(doc, 'p', { cls: 'phase', text: phaseText(phase) }),
  ]);
  if (secs !== null) status.append(el(doc, 'p', { text: 'Restzeit:' }), countdownBox(doc, secs));
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
    b.addEventListener('click', fn);
    return b;
  };
  controls.append(
    el(doc, 'label', { text: 'Dauer der Anmeldung (Sekunden)', attrs: { for: 'f-seconds' } }),
    secInput,
    mk('start', phase === 'anmeldung' ? 'Anmeldung erneut öffnen' : 'Anmeldung starten', canStart, 'primary', () =>
      handlers.onStart && handlers.onStart(Number(secInput.value) || 300),
    ),
    mk('close', 'Anmeldung schließen', phase === 'anmeldung', 'secondary', call('onClose')),
    mk('form', 'Gruppen einteilen', phase === 'anmeldung' && closed, 'primary', call('onForm')),
    mk('finish', 'Aufgabe beenden', phase === 'wortaufgabe_aktiv', 'secondary', call('onFinish')),
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
    const result = g.solved ? ` – Platz ${g.rank}, ${g.points} Punkte` : ' – offen';
    groupsCard.append(
      el(doc, 'p', { cls: 'gname', text: `${g.name}${result}` }),
      el(doc, 'p', { text: (g.members || []).join(', ') }),
    );
  }
  if (!(overview.groups && overview.groups.length)) groupsCard.append(el(doc, 'p', { text: 'Noch keine Gruppen.' }));

  const rankCard = el(doc, 'section', { cls: 'card stack' }, [
    sectionTitle(doc, 'Rangliste'),
    rankingList(doc, overview.ranking),
  ]);

  root.append(status, controls, playersCard, groupsCard, rankCard);
  restore(root, snap);
}

export function renderBeamer(root, overview, nowMs = Date.now()) {
  const doc = root.ownerDocument || document;
  root.textContent = '';
  if (!overview || typeof overview !== 'object' || overview.ok === false || !overview.phase) {
    renderMessage(root, 'Verbinde …', 'info');
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
    rankingList(doc, overview.ranking),
  );
  root.appendChild(wrap);
}
