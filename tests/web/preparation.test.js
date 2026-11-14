import test from 'node:test';
import assert from 'node:assert/strict';
import './dom-helper.js';

const { taskPreparation } = await import('../../web/js/preparation.js');

const OPTS = ['Anna', 'Ben', 'Cleo', 'Dora'];
const full = (over = {}) => ({ id: 'schaetz-locker', kind: 'estimate', title: 'Locker', solution: 'KUENSTLICH-17', image_url: null, ...over });
const joined = (list) => list.join(' | ');

test('TST-U-022: vollstaendige Aufgabe ohne Bildpflicht hat keine fehlenden Bestandteile', () => {
  assert.deepEqual(taskPreparation(full()), []);
  assert.deepEqual(taskPreparation({ id: 'wissen-1', kind: 'exact', solution: 'x', image_url: null }), []);
});

test('TST-U-022: fehlende Loesung (null, leer, nur Leerzeichen) wird als deutscher Text gemeldet', () => {
  for (const solution of [null, undefined, '', '   ']) {
    const r = taskPreparation(full({ solution }));
    assert.ok(Array.isArray(r));
    assert.equal(r.length, 1, JSON.stringify(solution));
    assert.equal(typeof r[0], 'string');
    assert.match(r[0], /Lösung/);
  }
});

test('TST-U-022: Liste enthaelt nur Texte und niemals den Loesungswert', () => {
  const r = taskPreparation(full({ id: 'schach', kind: 'exact', solution: 'GEHEIM-ABC-42', image_url: '' }));
  assert.ok(r.length >= 1);
  for (const x of r) assert.equal(typeof x, 'string');
  assert.ok(!joined(r).includes('GEHEIM-ABC-42'));
});

const vorname = (over = {}) => full({ id: 'schaetz-vorname', needs_choice: true, options: OPTS, correct_option: 'Ben', ...over });

test('TST-U-022: Vornamenfrage vollstaendig hat keine fehlenden Bestandteile', () => {
  assert.deepEqual(taskPreparation(vorname()), []);
});

test('TST-U-022: Vornamenoptionen fehlen, sind zu wenige oder nicht verschieden', () => {
  for (const options of [null, [], ['Anna', 'Ben', 'Cleo'], ['Anna', 'Ben', 'Cleo', 'Cleo'], ['Anna', 'Ben', 'Cleo', ' '],
    ['Anna', 'Ben', 'Cleo', ' ']]) {
    const r = taskPreparation(vorname({ options, correct_option: 'Ben' }));
    assert.match(joined(r), /Vorname/, JSON.stringify(options));
  }
});

test('TST-U-022: richtiger Name fehlt oder gehoert nicht zu den Optionen', () => {
  for (const correct_option of [null, '', '  ', 'Emil']) {
    const r = taskPreparation(vorname({ correct_option }));
    assert.match(joined(r), /richtige[rn]? Name/, JSON.stringify(correct_option));
  }
  assert.deepEqual(taskPreparation(vorname({ correct_option: 'ben' })).filter((x) => /richtige[rn]? Name/.test(x)), [],
    'Gross-/Kleinschreibung wie in der Pflege akzeptiert');
});

test('TST-U-022: Optionen und Name werden nur fuer die Vornamenfrage verlangt', () => {
  assert.deepEqual(taskPreparation(full({ options: null, correct_option: null })), []);
  assert.deepEqual(taskPreparation({ id: 'schach', kind: 'exact', solution: 'x', image_url: 'aufgaben/schach.svg' }), []);
});

test('TST-U-022: benoetigte Bilder fuer Schach, Sudoku, beide Geocaching-Orte', () => {
  for (const id of ['schach', 'sudoku', 'geo-saeule', 'geo-baum']) {
    for (const image_url of [null, undefined, '', '   ']) {
      const r = taskPreparation({ id, kind: 'exact', solution: 'x', image_url });
      assert.equal(r.length, 1, `${id} ${JSON.stringify(image_url)}`);
      assert.match(r[0], /Bild/);
    }
    assert.deepEqual(taskPreparation({ id, kind: 'exact', solution: 'x', image_url: 'bilder/x.jpg' }), [], id);
  }
});

test('TST-U-022: andere Aufgaben brauchen kein Bild; Pruefung betrifft nur Hinterlegung', () => {
  for (const id of ['schaetz-locker', 'schaetz-kosten', 'wissen-1']) {
    assert.deepEqual(taskPreparation({ id, kind: 'estimate', solution: '10', image_url: null }), [], id);
  }
  assert.deepEqual(taskPreparation({ id: 'schach', kind: 'exact', solution: 'x', image_url: 'https://nicht-erreichbar.invalid/x.png' }), []);
});

test('TST-U-022: mehrere Maengel werden einzeln und deutsch gemeldet', () => {
  const r = taskPreparation({ id: 'geo-baum', kind: 'exact', solution: '', image_url: '' });
  assert.equal(r.length, 2);
  assert.match(joined(r), /Lösung/);
  assert.match(joined(r), /Bild/);
  const v = taskPreparation(vorname({ solution: '', options: null, correct_option: null }));
  assert.ok(v.length >= 3);
  assert.equal(new Set(v).size, v.length);
});
