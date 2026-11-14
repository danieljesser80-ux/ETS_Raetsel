import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAufgaben, tasksForImport, MAX_TASKS } from '../../web/js/aufgabenformat.js';

const block = (id, extra = '', head = 'Kategorie: K\nTitel: T\nTyp: exakt\nLösung: abc') =>
  `## Aufgabe: ${id}\n${head}\n${extra}Text:\nBeschreibung\n`;

// TST-A-007 (ARC-010/011): Formatdokument ohne Sperrlistenwerte, Beispiel parsebar
test('TST-A-007: AUFGABENFORMAT.md enthaelt keine Sperrlistenwerte, Beispiel wird fehlerfrei gelesen', () => {
  const doc = readFileSync(new URL('../../docs/AUFGABENFORMAT.md', import.meta.url), 'utf8');
  let blocked = [];
  try {
    const raw = readFileSync('C:/Raetsel-geheim/sperrliste.txt', 'utf8');
    blocked = raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length >= 4 && !s.startsWith('#'));
  } catch { /* Sperrliste liegt nur auf dem Entwicklungsrechner; tools/geheim.mjs prueft zusaetzlich */ }
  for (const w of blocked) assert.ok(!doc.toLowerCase().includes(w.toLowerCase()), 'Sperrlistenwert im Formatdokument');
  const example = /## 4\. Beispiel[^\r\n]*(?:\r?\n)+```\r?\n([\s\S]*?)```/.exec(doc);
  assert.ok(example, 'Beispiel gefunden');
  const r = parseAufgaben(example[1]);
  assert.deepEqual(r.errors, []);
  assert.equal(r.ok, true);
  assert.equal(r.tasks.length, 3);
  assert.deepEqual(r.warnings, []);
});

// TST-S-040 / TST-U-032 (SWA-055, UNA-037)
test('TST-U-032: gueltige Aufgaben mit allen Typen, Standardschwierigkeit und Mehrzeilentext', () => {
  const r = parseAufgaben(`Format: raetsel-aufgaben/1\n\n${block('a-1')}\n${block('b-2', 'Optionen: A | B | C | D\nRichtige Option: c\n', 'Kategorie: K\nTitel: T\nTyp: auswahl\nLösung: 7')}`);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.tasks[0].difficulty, 'mittel');
  assert.equal(r.tasks[0].body, 'Beschreibung');
  assert.deepEqual(r.tasks[1].options, ['A', 'B', 'C', 'D']);
  assert.equal(r.tasks[1].correct_option, 'C');
  const out = tasksForImport(r.tasks);
  assert.ok(out.every((t) => !('line' in t)));
});

test('TST-S-040: Text darf mehrzeilig sein und Leerzeilen sowie Doppelpunkte enthalten', () => {
  const r = parseAufgaben('## Aufgabe: x\nKategorie: K\nTitel: T\nTyp: exakt\nLösung: l\nText: Zeile 1\n\nZeile 3: mit Doppelpunkt\n');
  assert.equal(r.ok, true);
  assert.equal(r.tasks[0].body, 'Zeile 1\n\nZeile 3: mit Doppelpunkt');
});

test('TST-S-040: Kategorienreihenfolge und Fehlerzeilen', () => {
  const r = parseAufgaben(`${block('a')}\n## Aufgabe: b\nKategorie: K\nTitel: T\nTyp: foo\nUnsinn\nText:\nx\n`);
  assert.equal(r.ok, false);
  const msgs = r.errors.map((e) => `${e.line}:${e.task}`);
  assert.ok(msgs.some((m) => m.endsWith(':b')));
  assert.ok(r.errors.every((e) => Number.isInteger(e.line)));
  assert.ok(r.errors.some((e) => /Typ muss/.test(e.message)));
  assert.ok(r.errors.some((e) => /Unbekannte/.test(e.message)));
});

test('TST-S-040: Warnung bei fehlender Loesung und fehlender richtiger Option, kein Fehler', () => {
  const r = parseAufgaben(block('a', '', 'Kategorie: K\nTitel: T\nTyp: exakt'));
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 1);
  const s = parseAufgaben(block('s', 'Optionen: A | B | C | D\n', 'Kategorie: K\nTitel: T\nTyp: auswahl\nLösung: 5'));
  assert.equal(s.ok, true);
  assert.match(s.warnings[0].message, /richtige Option/);
});

test('TST-S-040: doppelte ID, ungueltige ID, Kategorie nur anders geschrieben', () => {
  assert.ok(parseAufgaben(block('a') + block('a')).errors.some((e) => /doppelt/.test(e.message)));
  assert.ok(parseAufgaben(block('Gross')).errors.some((e) => /Ungültige ID/.test(e.message)));
  const r = parseAufgaben(block('a') + block('b', '', 'Kategorie: k\nTitel: T\nTyp: exakt\nLösung: x'));
  assert.ok(r.errors.some((e) => /Groß-\/Kleinschreibung/.test(e.message)));
});

test('TST-S-040: Grenzen (Laengen, Anzahl, Bildpfad, Schaetzloesung, Optionen)', () => {
  const bad = (head, extra = '') => parseAufgaben(block('a', extra, head)).errors;
  assert.ok(bad(`Kategorie: ${'k'.repeat(41)}\nTitel: T\nTyp: exakt\nLösung: x`).length);
  assert.ok(bad(`Kategorie: K\nTitel: ${'t'.repeat(121)}\nTyp: exakt\nLösung: x`).length);
  assert.ok(bad(`Kategorie: K\nTitel: T\nTyp: exakt\nLösung: ${'x'.repeat(201)}`).length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: exakt\nLösung: x\nBild: aufgaben/../x.png').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: exakt\nLösung: x\nBild: /etc/x.png').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: schaetzung\nLösung: 1.5').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: schaetzung\nLösung: 1234567890').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: auswahl\nLösung: 1', 'Optionen: A | B | C\n').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: auswahl\nLösung: 1', 'Optionen: A | B | C | a\n').length);
  assert.ok(bad('Kategorie: K\nTitel: T\nTyp: exakt\nLösung: x', 'Optionen: A | B | C | D\n').length);
  assert.ok(parseAufgaben(block('a', '', 'Kategorie: K\nTitel: T\nTyp: exakt\nLösung: x\nBild: aufgaben/ok.svg')).ok);
  const many = Array.from({ length: MAX_TASKS + 1 }, (_, i) => block(`a${i}`)).join('\n');
  assert.ok(parseAufgaben(many).errors.some((e) => /Mehr als/.test(e.message)));
  assert.ok(parseAufgaben('x'.repeat(200 * 1024 + 1)).errors.length);
  assert.equal(parseAufgaben('').ok, false);
});

test('TST-S-040: Geocaching-Kategorie und Format-Zeile', () => {
  assert.equal(parseAufgaben(block('g', '', 'Kategorie: Geocaching\nTitel: T\nTyp: exakt\nLösung: x')).tasks[0].category, 'Geocaching');
  assert.ok(parseAufgaben(`Format: raetsel-aufgaben/9\n${block('a')}`).errors.some((e) => /Format/.test(e.message)));
});
