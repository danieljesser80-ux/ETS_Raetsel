import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { selectTestFiles } from '../../tools/tests.mjs';
import { checkSecrets } from '../../tools/geheim.mjs';

function tree(files) {
  const root = mkdtempSync(join(tmpdir(), 'tg-'));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(root, rel, '..'), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

test('TST-U-014: schnell schließt tests/db aus, voll enthält alles, sortiert', () => {
  const root = tree({
    'tests/b.test.js': '', 'tests/a.test.js': '', 'tests/helpers.js': '',
    'tests/db/x.test.js': '', 'tests/web/y.test.js': '',
  });
  assert.deepEqual(selectTestFiles(root, 'schnell'), ['tests/a.test.js', 'tests/b.test.js', 'tests/web/y.test.js']);
  assert.deepEqual(selectTestFiles(root, 'voll'), ['tests/a.test.js', 'tests/b.test.js', 'tests/db/x.test.js', 'tests/web/y.test.js']);
  assert.throws(() => selectTestFiles(root, 'egal'));
});

test('TST-U-015: Treffer ohne Inhalt, Groß-/Kleinschreibung, Ausnahmen', () => {
  const root = tree({
    'docs/a.md': 'Lösung ist GEHEIMWORT hier',
    'node_modules/m/i.js': 'geheimwort',
    'docs/ok.md': 'nichts',
  });
  const liste = join(root, 'sperrliste.txt');
  writeFileSync(liste, '# Kommentar\n\ngeheimwort\n');
  const r = checkSecrets(join(root, 'docs', '..'), liste);
  assert.equal(r.ok, false);
  assert.deepEqual(r.hits.map((h) => [h.file, h.line]), [['docs/a.md', 3], ['sperrliste.txt', 3]]);
  assert.ok(!JSON.stringify(r).toLowerCase().includes('lösung'));
});

test('TST-U-015: sauberes Projekt ohne Treffer, fehlende Sperrliste ist Fehler', () => {
  const root = tree({ 'docs/ok.md': 'nichts' });
  const liste = join(mkdtempSync(join(tmpdir(), 'sl-')), 'sperrliste.txt');
  assert.equal(checkSecrets(root, liste).missing, true);
  writeFileSync(liste, 'geheimwort\n');
  const r = checkSecrets(root, liste);
  assert.equal(r.ok, true);
  assert.equal(r.missing, false);
});
