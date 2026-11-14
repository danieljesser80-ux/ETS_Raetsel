import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkConsistency } from '../../tools/konsistenz.mjs';

function project({ extra = '', version = '0.1' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'ks-'));
  mkdirSync(join(root, 'docs'));
  writeFileSync(join(root, 'ANFORDERUNGEN.md'), `| DOC-001 | [Übersicht](ANFORDERUNGEN.md) | Inhalt | Zweck | ${version} |\n\n| Dokument-ID | DOC-001 |\n| Version | 0.1 |\n| KAN-001 | Text |\n`);
  writeFileSync(join(root, 'docs', 'a.md'), `| SWA-001 | KAN-001 | Text |\n${extra}\n`);
  return root;
}

test('TST-U-013: saubere Dokumente ohne Fehler', () => {
  const r = checkConsistency(project());
  assert.equal(r.ok, true, r.problems.join('\n'));
});

// AEN-028 / OFF-029: Definitionen nur in Tabellen mit ID-Kopf, Statusabgleich, Historie
function docs({ a = '', b = '', hist = null, version = '0.2' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'ks-'));
  mkdirSync(join(root, 'docs'));
  writeFileSync(join(root, 'ANFORDERUNGEN.md'),
    `# DOC-001\n\n| ID | Dokument | Inhalt | Version |\n|---|---|---|---|\n| DOC-001 | [Übersicht](ANFORDERUNGEN.md) | Inhalt | ${version} |\n| DOC-002 | [Kunden](docs/k.md) | Inhalt | 0.5 |\n`
    + `\n**Dokument-ID:** DOC-001 | **Version:** 0.2\n`);
  writeFileSync(join(root, 'docs', 'k.md'),
    `**Dokument-ID:** DOC-002 | **Version:** 0.5\n\n| ID | Text |\n|---|---|\n| KAN-001 | Text |\n| AEN-001 | Text |\n\n${a}\n`);
  writeFileSync(join(root, 'docs', 'x.md'), `${b}\n`);
  if (hist !== null) {
    writeFileSync(join(root, 'docs', 'AENDERUNGSREGISTER.md'),
      `| Version | Datum | Inhalt | Freigabe |\n|---|---|---|---|\n${hist}\n`);
  }
  return root;
}
const STATUS = (rows) => `| Referenz | Status |\n|---|---|\n${rows}\n`;
const ENT_DEF = (st) => `| ID | Frage | Entscheidung |\n|---|---|---|\n| ENT-001 | Frage | Antwort **${st}:** am 2025 |\n`;
const OFF_DEF = (st) => `| Antrag | Beantragt | Beschreibung | Status | Statusverlauf | AEN | Baseline |\n|---|---|---|---|---|---|---|\n| OFF-001 | 2025 | Text | ${st} | x | AEN-001 | - |\n`;

test('TST-U-020: historischer Vorschlag und Matrix zaehlen nicht als Definition', () => {
  const extra = '| ENT | Vorschlag | Begründung |\n|---|---|---|\n| ENT-001 | Vorschlag | warum |\n\n'
    + '| Kundenanforderungen | Kundenabnahme |\n|---|---|\n| KAN-001 | offen |\n';
  const r = checkConsistency(docs({ a: ENT_DEF('Entschieden'), b: extra }));
  assert.equal(r.ok, true, r.problems.join('\n'));
});

test('TST-U-020: doppelte Definition in einer Datei und dateiuebergreifend wird gemeldet', () => {
  const same = checkConsistency(docs({ a: '| ID | Text |\n|---|---|\n| KAN-001 | nochmal |\n' }));
  assert.ok(same.problems.some((p) => p.includes('KAN-001')), same.problems.join('\n'));
  const cross = checkConsistency(docs({ b: '| ID | Text |\n|---|---|\n| KAN-001 | nochmal |\n' }));
  assert.ok(cross.problems.some((p) => p.includes('KAN-001')), cross.problems.join('\n'));
});

test('TST-U-020: Statusreferenz stimmt mit ENT und OFF ueberein, sonst Problem', () => {
  const ok = checkConsistency(docs({ a: ENT_DEF('Entschieden') + OFF_DEF('verifiziert → in Baseline BL-001'),
    b: STATUS('| ENT-001 | Entschieden |\n| OFF-001 | verifiziert |') }));
  assert.equal(ok.ok, true, ok.problems.join('\n'));
  const entBad = checkConsistency(docs({ a: ENT_DEF('Entschieden'), b: STATUS('| ENT-001 | offen |') }));
  assert.ok(entBad.problems.some((p) => p.includes('ENT-001')), entBad.problems.join('\n'));
  const offBad = checkConsistency(docs({ a: OFF_DEF('geklärt'), b: STATUS('| OFF-001 | verifiziert |') }));
  assert.ok(offBad.problems.some((p) => p.includes('OFF-001')), offBad.problems.join('\n'));
});

test('TST-U-020: letzte Historienzeile muss aktuelle Dokumentversionen nennen', () => {
  const good = checkConsistency(docs({ hist: '| 0.1 | 2025 | DOC-001 v0.1 | ja |\n| 0.2 | 2025 | DOC-001 v0.2, DOC-002 v0.5 | ja |' }));
  assert.equal(good.ok, true, good.problems.join('\n'));
  const wrong = checkConsistency(docs({ hist: '| 0.2 | 2025 | DOC-001 v0.1, DOC-002 v0.5 | ja |' }));
  assert.ok(wrong.problems.some((p) => p.includes('DOC-001')), wrong.problems.join('\n'));
  const missing = checkConsistency(docs({ hist: '| 0.2 | 2025 | DOC-001 v0.2 | ja |' }));
  assert.ok(missing.problems.some((p) => p.includes('DOC-002')), missing.problems.join('\n'));
});

test('TST-U-020: aeltere Historienzeilen werden ignoriert, ohne Historie keine Pruefung', () => {
  const old = checkConsistency(docs({ hist: '| 0.1 | 2025 | DOC-001 v0.0, DOC-002 v0.0 | ja |\n| 0.2 | 2025 | DOC-001 v0.2, DOC-002 v0.5 | ja |' }));
  assert.equal(old.ok, true, old.problems.join('\n'));
  assert.equal(checkConsistency(docs()).ok, true);
});

test('TST-U-013: nicht definierte ID, Link ohne Ziel und falsche Version werden gemeldet', () => {
  assert.ok(checkConsistency(project({ extra: 'siehe SWA-099' })).problems.some((p) => p.includes('SWA-099')));
  assert.ok(checkConsistency(project({ extra: '[x](fehlt.md)' })).problems.some((p) => p.includes('fehlt.md')));
  assert.ok(checkConsistency(project({ version: '0.2' })).problems.some((p) => p.includes('DOC-001')));
});
