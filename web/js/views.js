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
  const radios = {};
  let focused = null;
  const inputs = root.querySelectorAll ? root.querySelectorAll('input[name]') : [];
  for (const i of inputs) {
    const name = i.getAttribute('name');
    if (i.getAttribute('type') === 'radio') {
      if (i.checked) radios[name] = i.value;
      continue;
    }
    values[name] = i.value;
    if (root.ownerDocument && root.ownerDocument.activeElement === i) focused = name;
  }
  return { values, radios, focused };
}

function restore(root, snap) {
  for (const [name, value] of Object.entries(snap.values)) {
    const i = root.querySelector(`input[name="${name}"]`);
    if (i && value) i.value = value;
    if (i && snap.focused === name && typeof i.focus === 'function') i.focus();
  }
  for (const [name, value] of Object.entries(snap.radios || {})) {
    for (const i of root.querySelectorAll(`input[name="${name}"]`)) {
      if (i.getAttribute('type') === 'radio' && i.value === value) i.checked = true;
    }
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

function taskStatus(task, finished) {
  if (task.submitted) {
    const pl = task.placement;
    if (!pl) return 'Abgegeben';
    if (finished && pl.points !== undefined) return `Abgegeben – Platz ${pl.rank}, ${pl.points} Punkte`;
    return `Abgegeben – vorläufig Platz ${pl.rank}`;
  }
  if (!task.available) return 'Noch nicht verfügbar';
  return task.started ? 'Geöffnet – die Zeit läuft' : 'Noch nicht geöffnet';
}

function choiceForm(doc, task, handlers) {
  const form = el(doc, 'form', { cls: 'stack' });
  const radioName = `choice-${task.id}`;
  form.append(el(doc, 'p', { text: 'Wählt einen Namen:' }));
  for (const [idx, opt] of (task.options || []).entries()) {
    const id = `f-${radioName}-${idx}`;
    form.append(
      el(doc, 'label', {}, [
        el(doc, 'input', { attrs: { id, type: 'radio', name: radioName, value: opt } }),
        el(doc, 'span', { text: ` ${opt}` }),
      ]),
    );
  }
  const numName = `task-${task.id}`;
  const num = el(doc, 'input', {
    cls: 'big-input',
    attrs: { id: `f-${numName}`, name: numName, type: 'text', inputmode: 'numeric', autocomplete: 'off' },
  });
  form.append(
    el(doc, 'label', { text: 'Wie viele Personen? (Zahl, nur ein Versuch)', attrs: { for: `f-${numName}` } }),
    num,
    el(doc, 'button', { cls: 'btn primary', text: 'Abgeben', attrs: { type: 'submit' } }),
  );
  form.addEventListener('submit', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const chosen = form.querySelector(`input[name="${radioName}"]:checked`);
    handlers.onSubmitTask && handlers.onSubmitTask(task.id, num.value, chosen ? chosen.value : null);
  });
  return form;
}

function taskOverview(doc, state, handlers) {
  const tasks = state.tasks || [];
  const isLeader = state.leader === true;
  const finished = state.phase === 'aufgabe_abgeschlossen';
  const out = [sectionTitle(doc, 'Rätsel')];
  out.push(
    el(doc, 'p', {
      text: isLeader
        ? 'Du bist Spielleiter: Öffne ein Rätsel und gib die Antwort für eure Gruppe ein. Es gibt nur einen Versuch.'
        : `Euer Spielleiter${state.leader_name ? ` (${state.leader_name})` : ''} öffnet die Rätsel und gibt die Antworten ein.`,
    }),
  );
  let lastCategory = null;
  for (const t of tasks) {
    if (t.category !== lastCategory) {
      out.push(el(doc, 'h3', { text: t.category }));
      lastCategory = t.category;
    }
    const box = el(doc, 'div', { cls: 'task stack', attrs: { 'data-task': t.id } }, [
      el(doc, 'p', { cls: 'tname', text: t.title }),
      t.started && !t.submitted && t.body ? el(doc, 'p', { cls: 'tbody', text: t.body }) : null,
      el(doc, 'p', { cls: 'tstatus', text: taskStatus(t, finished) }),
    ]);
    if (t.started && !t.submitted && t.image_url) {
      box.append(el(doc, 'img', { cls: 'timg', attrs: { src: t.image_url, alt: t.title } }));
    }
    if (isLeader && !finished && !t.submitted && t.available) {
      if (!t.started) {
        const b = el(doc, 'button', { cls: 'btn primary', text: 'Rätsel öffnen', attrs: { type: 'button', 'data-open': t.id } });
        b.addEventListener('click', () => handlers.onStartTask && handlers.onStartTask(t.id));
        box.append(b);
      } else if (t.needs_choice) {
        box.append(choiceForm(doc, t, handlers));
      } else {
        box.append(
          textForm(doc, {
            name: `task-${t.id}`,
            label: t.kind === 'estimate' ? 'Eure Schätzung (Zahl, nur ein Versuch)' : 'Eure Antwort (nur ein Versuch)',
            button: t.kind === 'estimate' ? 'Schätzung abgeben' : 'Antwort senden',
            onSubmit: (v) => handlers.onSubmitTask && handlers.onSubmitTask(t.id, v, null),
          }),
        );
      }
    }
    out.push(box);
  }
  if (!tasks.length) out.push(el(doc, 'p', { text: 'Noch keine Rätsel.' }));
  return out;
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
            text: state.solved.points !== undefined
              ? `Wort gelöst! Platz ${state.solved.rank} – ${state.solved.points} Punkte`
              : `Wort gelöst! Vorläufig Platz ${state.solved.rank}`,
          }),
        );
        card.append(...taskOverview(doc, state, handlers));
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
  restore(root, snap);
}

function remainingOf(overview, nowMs) {
  return countdownSeconds(overview, nowMs);
}

function rankingList(doc, ranking, showPoints = true) {
  const ol = el(doc, 'ol', { cls: 'ranking' });
  for (const r of ranking || []) {
    ol.appendChild(
      el(doc, 'li', {}, [
        el(doc, 'span', { cls: 'rank', text: `${r.rank}.` }),
        el(doc, 'span', { cls: 'rname', text: r.group }),
        showPoints ? el(doc, 'span', { cls: 'pts', text: `${r.points} Punkte` }) : null,
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
    groupsCard.append(
      el(doc, 'p', { cls: 'gname', text: `${g.name}${result}${lead}` }),
      el(doc, 'p', { text: (g.members || []).join(', ') }),
    );
  }
  if (!(overview.groups && overview.groups.length)) groupsCard.append(el(doc, 'p', { text: 'Noch keine Gruppen.' }));

  const rankCard = el(doc, 'section', { cls: 'card stack' }, [
    sectionTitle(doc, 'Rangliste'),
    rankingList(doc, overview.ranking),
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
    mk('set-size', 'Größe speichern', canStart, 'primary', () =>
      handlers.onSetGroupSize && handlers.onSetGroupSize(Number(minInput.value), Number(maxInput.value)),
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
      mk(`save-${t.id}`, 'Speichern', true, 'primary', () => {
        if (!handlers.onSetTask) return;
        const f = { title: title.value, body: body.value, imageUrl: image.value, solution: solution.value };
        if (t.needs_choice) {
          const names = optInputs.map((i) => i.value.trim()).filter(Boolean);
          f.options = names;
          f.correctOption = correct.value.trim();
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

  root.append(status, controls, sizeCard, playersCard, groupsCard, rankCard, tasksCard, totalsCard);
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
    rankingList(doc, overview.ranking, overview.finished === true),
  );
  root.appendChild(wrap);
}
