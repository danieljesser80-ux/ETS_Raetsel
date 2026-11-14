import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBaseline, checkBaseline, buildFiles } from '../../tools/baseline.mjs';

function project() {
  const root = mkdtempSync(join(tmpdir(), 'bl-'));
  mkdirSync(join(root, 'docs'));
  mkdirSync(join(root, 'node_modules'));
  writeFileSync(join(root, 'ANFORDERUNGEN.md'), 'a');
  writeFileSync(join(root, 'docs', 'x.md'), 'x');
  writeFileSync(join(root, 'node_modules', 'ignoriert.js'), 'n');
  writeFileSync(join(root, 'altdatei.html'), 'alt');
  return root;
}

test('TST-U-010: Manifest enthält nur Konfigurationselemente, nicht node_modules oder Altdateien', () => {
  const files = buildFiles(project());
  assert.deepEqual(Object.keys(files), ['ANFORDERUNGEN.md', 'docs/x.md']);
});

test('TST-U-010: Baseline wird angelegt und nie überschrieben', () => {
  const root = project();
  assert.equal(createBaseline(root, 'BL-001').count, 2);
  assert.ok(existsSync(join(root, 'baselines', 'BL-001.json')));
  assert.throws(() => createBaseline(root, 'BL-001'), /existiert bereits/);
  assert.throws(() => createBaseline(root, 'x1'), /Format/);
});

test('TST-U-010: Prüfung meldet geänderte, neue und entfernte Dateien', () => {
  const root = project();
  createBaseline(root, 'BL-001');
  assert.equal(checkBaseline(root, 'BL-001').identical, true);
  writeFileSync(join(root, 'docs', 'x.md'), 'geaendert');
  writeFileSync(join(root, 'docs', 'neu.md'), 'neu');
  const r = checkBaseline(root, 'BL-001');
  assert.deepEqual(r.changed, ['docs/x.md']);
  assert.deepEqual(r.added, ['docs/neu.md']);
  assert.deepEqual(r.removed, []);
  assert.equal(r.identical, false);
});
