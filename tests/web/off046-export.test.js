import test from 'node:test';
import assert from 'node:assert/strict';
import './dom-helper.js';

const { resultsCsv } = await import('../../web/js/export.js');
const ROW = { group: 'Elche', rank: 1, points: 12, task: 'Alpha', task_rank: 2, task_points: 8, status: 'solved', duration_ms: 61234 };

// Minimaler RFC-4180-Parser: gueltig sind gequotete Zellen, BOM und CRLF (deutsches Excel).
function parse(csv) {
  const text = csv.replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',' || ch === ';') { row.push(cell); cell = ''; } else if (ch === '\r' && text[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

test('resultsCsv: Kopfzeile, CRLF und Werte in Spaltenreihenfolge', () => {
  const csv = resultsCsv([ROW]);
  const rows = parse(csv);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 8, 'acht Spalten in der Kopfzeile');
  assert.deepEqual(rows[1], ['Elche', '1', '12', 'Alpha', '2', '8', 'solved', '61234']);
  assert.ok(!/[^\r]\n(?=[^"]*("[^"]*"[^"]*)*$)/.test(csv.replace(/"[^"]*"/g, '""')), 'Zeilenende nur CRLF');
});

test('resultsCsv: Komma, Anfuehrungszeichen und Zeilenumbruch werden gequotet', () => {
  const rows = parse(resultsCsv([{ ...ROW, group: 'A, "B"\nC' }]));
  assert.equal(rows.length, 2);
  assert.equal(rows[1][0], 'A, "B"\nC');
});

test('resultsCsv: Formelpraefixe in Textzellen sind entschaerft, Zahlen bleiben', () => {
  for (const bad of ['=1+1', '+SUM(A1)', '-2', '@x', '\tx']) {
    const row = parse(resultsCsv([{ ...ROW, group: bad, task: bad }]))[1];
    for (const idx of [0, 3]) {
      assert.ok(!/^[=+\-@\t\r]/.test(row[idx]), `Zelle ${JSON.stringify(bad)} entschaerft: ${JSON.stringify(row[idx])}`);
      assert.ok(row[idx].includes(bad), 'Inhalt bleibt lesbar');
    }
    assert.deepEqual(row.slice(1, 3), ['1', '12']);
  }
  assert.equal(parse(resultsCsv([{ ...ROW, rank: -1 }]))[1][1], '-1', 'negative Zahl bleibt Zahl');
});

test('resultsCsv: unbekannte Zeit null ergibt leere Zelle, leere Liste nur Kopfzeile', () => {
  const row = parse(resultsCsv([{ ...ROW, duration_ms: null }]))[1];
  assert.equal(row.length, 8);
  assert.equal(row[7], '');
  assert.equal(parse(resultsCsv([])).length, 1);
});