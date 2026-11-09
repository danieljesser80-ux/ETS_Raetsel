// UNA-037: Parser für das Schema-Markdown "raetsel-aufgaben/1" (docs/AUFGABENFORMAT.md).
export const FORMAT_ID = 'raetsel-aufgaben/1';
export const MAX_TASKS = 60;
export const MAX_BYTES = 200 * 1024;

const ID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const IMAGE_RE = /^(https:\/\/[^\s"<>]+|[A-Za-z0-9_./-]+)$/;
const NUMBER_RE = /^[0-9]{1,9}$/;
const TYPES = ['exakt', 'schaetzung', 'auswahl'];
const LEVELS = ['leicht', 'mittel', 'schwer'];
const FIELDS = {
  kategorie: 'category', titel: 'title', typ: 'type', schwierigkeit: 'difficulty', bild: 'image',
  'lösung': 'solution', loesung: 'solution', optionen: 'options', 'richtige option': 'correct_option', text: 'body',
};

function validate(block, errors, warnings) {
  const { fields } = block;
  const line = block.line;
  const fail = (message) => errors.push({ line, task: block.id, message });
  const warn = (message) => warnings.push({ line, task: block.id, message });
  const task = { id: block.id, line };
  for (const key of ['category', 'title', 'type', 'body']) {
    if (fields[key] === undefined || fields[key] === '') fail(`Pflichtfeld fehlt: ${key === 'body' ? 'Text' : key}`);
  }
  task.category = fields.category || '';
  task.title = fields.title || '';
  task.type = (fields.type || '').toLowerCase();
  task.difficulty = (fields.difficulty || 'mittel').toLowerCase();
  task.body = fields.body || '';
  task.image = fields.image || '';
  task.solution = fields.solution || '';
  task.options = [];
  task.correct_option = '';

  if (task.category.length > 40) fail('Kategorie länger als 40 Zeichen');
  if (task.title.length > 120) fail('Titel länger als 120 Zeichen');
  if (task.type && !TYPES.includes(task.type)) fail('Typ muss exakt, schaetzung oder auswahl sein');
  if (!LEVELS.includes(task.difficulty)) fail('Schwierigkeit muss leicht, mittel oder schwer sein');
  if (task.body.length > 4000) fail('Text länger als 4000 Zeichen');
  if (task.image && (!IMAGE_RE.test(task.image) || task.image.includes('..') || task.image.startsWith('/'))) {
    fail('Bild: ungültiger Pfad oder Adresse');
  }
  if (task.solution) {
    if (task.solution.length > 200) fail('Lösung länger als 200 Zeichen');
    else if ((task.type === 'schaetzung' || task.type === 'auswahl') && !NUMBER_RE.test(task.solution)) {
      fail('Lösung muss bei Schätzfragen eine ganze Zahl mit 1–9 Ziffern sein');
    }
  } else {
    warn('Keine Lösung – Aufgabe ist nicht spielbar');
  }

  const rawOptions = fields.options === undefined ? null : fields.options.split('|').map((o) => o.trim());
  if (task.type === 'auswahl') {
    if (!rawOptions || rawOptions.length !== 4 || rawOptions.some((o) => !o)
        || new Set(rawOptions.map((o) => o.toLowerCase())).size !== 4) {
      fail('Optionen: genau 4 verschiedene Namen, getrennt durch |');
    } else {
      task.options = rawOptions;
      if (fields.correct_option) {
        const hit = rawOptions.find((o) => o.toLowerCase() === fields.correct_option.toLowerCase());
        if (hit) task.correct_option = hit;
        else fail('Richtige Option ist keine der Optionen');
      } else if (task.solution) {
        warn('Keine richtige Option – Aufgabe ist nicht spielbar');
      }
    }
  } else if (rawOptions || fields.correct_option) {
    fail('Optionen/Richtige Option nur beim Typ auswahl erlaubt');
  }
  return task;
}

export function parseAufgaben(input) {
  const errors = [];
  const warnings = [];
  const text = String(input ?? '').replace(/^\uFEFF/, '');
  if (new TextEncoder().encode(text).length > MAX_BYTES) {
    return { ok: false, tasks: [], errors: [{ line: 0, task: null, message: 'Datei größer als 200 KB' }], warnings };
  }
  const lines = text.split(/\r\n|\r|\n/);
  const blocks = [];
  let current = null;
  let inBody = false;

  lines.forEach((raw, index) => {
    const lineNo = index + 1;
    const header = /^##\s*Aufgabe\s*:\s*(.*?)\s*$/i.exec(raw);
    if (header) {
      current = { id: header[1], line: lineNo, fields: {}, bodyLines: [] };
      blocks.push(current);
      inBody = false;
      return;
    }
    if (!current) {
      const fmt = /^\s*Format\s*:\s*(.*?)\s*$/i.exec(raw);
      if (fmt && fmt[1] !== FORMAT_ID) errors.push({ line: lineNo, task: null, message: `Unbekanntes Format „${fmt[1]}“` });
      return;
    }
    if (inBody) {
      current.bodyLines.push(raw);
      return;
    }
    if (!raw.trim()) return;
    const field = /^([^:]+?)\s*:\s*(.*)$/.exec(raw);
    const key = field && FIELDS[field[1].trim().toLowerCase()];
    if (!key) {
      errors.push({ line: lineNo, task: current.id, message: `Unbekannte oder ungültige Zeile: ${raw.trim().slice(0, 40)}` });
      return;
    }
    if (key === 'body') {
      inBody = true;
      if (field[2].trim()) current.bodyLines.push(field[2]);
      return;
    }
    if (current.fields[key] !== undefined) {
      errors.push({ line: lineNo, task: current.id, message: `Feld doppelt: ${field[1].trim()}` });
      return;
    }
    current.fields[key] = field[2].trim();
  });

  if (blocks.length === 0) errors.push({ line: 0, task: null, message: 'Keine Aufgabe gefunden (## Aufgabe: <id>)' });
  if (blocks.length > MAX_TASKS) errors.push({ line: 0, task: null, message: `Mehr als ${MAX_TASKS} Aufgaben` });

  const tasks = [];
  const ids = new Set();
  const categories = new Map();
  for (const block of blocks) {
    if (!ID_RE.test(block.id)) {
      errors.push({ line: block.line, task: block.id, message: 'Ungültige ID (a–z, 0–9, Bindestrich, 1–40 Zeichen)' });
      continue;
    }
    if (ids.has(block.id)) {
      errors.push({ line: block.line, task: block.id, message: 'ID doppelt' });
      continue;
    }
    ids.add(block.id);
    block.fields.body = block.bodyLines.join('\n').trim();
    const task = validate(block, errors, warnings);
    const key = task.category.toLowerCase();
    if (task.category) {
      const known = categories.get(key);
      if (known === undefined) categories.set(key, task.category);
      else if (known !== task.category) {
        errors.push({ line: block.line, task: block.id, message: `Kategorie „${task.category}“ unterscheidet sich nur in Groß-/Kleinschreibung von „${known}“` });
      }
    }
    tasks.push(task);
  }
  return { ok: errors.length === 0, tasks, errors, warnings };
}

export function tasksForImport(tasks) {
  return tasks.map(({ line, ...rest }) => rest);
}
