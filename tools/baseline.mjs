import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Konfigurationselemente gemäß DOC-009 Abschnitt 2.
export const INCLUDED = ['ANFORDERUNGEN.md', 'package.json', 'docs', 'src', 'supabase', 'web', 'tests', 'testprotokolle', 'tools', '.github'];
const SKIPPED_DIRS = new Set(['node_modules']);

function walk(root, rel, out) {
  const abs = join(root, rel);
  if (!existsSync(abs)) return;
  if (statSync(abs).isFile()) {
    out.push(rel.split(sep).join('/'));
    return;
  }
  for (const name of readdirSync(abs).sort()) {
    if (SKIPPED_DIRS.has(name)) continue;
    walk(root, join(rel, name), out);
  }
}

export function buildFiles(root) {
  const list = [];
  for (const item of INCLUDED) walk(root, item, list);
  const files = {};
  for (const f of list.sort()) files[f] = createHash('sha256').update(readFileSync(join(root, f))).digest('hex');
  return files;
}

export function compare(manifestFiles, currentFiles) {
  const changed = [];
  const removed = [];
  const added = [];
  for (const [f, h] of Object.entries(manifestFiles)) {
    if (!(f in currentFiles)) removed.push(f);
    else if (currentFiles[f] !== h) changed.push(f);
  }
  for (const f of Object.keys(currentFiles)) if (!(f in manifestFiles)) added.push(f);
  return { changed, removed, added, identical: !changed.length && !removed.length && !added.length };
}

export function createBaseline(root, id) {
  if (!/^BL-\d{3}$/.test(id)) throw new Error('Baseline-ID muss das Format BL-001 haben');
  const target = join(root, 'baselines', `${id}.json`);
  if (existsSync(target)) throw new Error(`${id} existiert bereits und wird nie überschrieben`);
  mkdirSync(join(root, 'baselines'), { recursive: true });
  const files = buildFiles(root);
  writeFileSync(target, JSON.stringify({ id, created: new Date().toISOString(), files }, null, 2) + '\n');
  return { id, count: Object.keys(files).length };
}

export function checkBaseline(root, id) {
  const manifest = JSON.parse(readFileSync(join(root, 'baselines', `${id}.json`), 'utf8'));
  return compare(manifest.files, buildFiles(root));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, id] = process.argv.slice(2);
  const root = resolve(fileURLToPath(import.meta.url), '..', '..');
  try {
    if (cmd === 'create' && id) {
      const { checkConsistency } = await import('./konsistenz.mjs');
      const c = checkConsistency(root);
      if (!c.ok) throw new Error(`Einfrieren abgelehnt, Konsistenzfehler:\n  ${c.problems.join('\n  ')}`);
      const { checkSecrets, defaultSperrliste } = await import('./geheim.mjs');
      const s = checkSecrets(root, defaultSperrliste(root));
      if (!s.missing && !s.ok) throw new Error(`Einfrieren abgelehnt, geheime Lösungen im Projekt:\n  ${s.hits.map((h) => `${h.file} (Sperrliste Zeile ${h.line})`).join('\n  ')}`);
      const r = createBaseline(root, id);
      console.log(`${r.id} angelegt: ${r.count} Dateien`);
    } else if (cmd === 'check' && id) {
      const r = checkBaseline(root, id);
      console.log(r.identical ? `Arbeitsstand entspricht ${id}.` : `Abweichungen von ${id}:`);
      for (const k of ['changed', 'added', 'removed']) for (const f of r[k]) console.log(`  ${k}: ${f}`);
      process.exitCode = r.identical ? 0 : 1;
    } else {
      console.log('Aufruf: node tools/baseline.mjs create BL-001 | check BL-001');
      process.exitCode = 2;
    }
  } catch (e) {
    console.error(e.message);
    process.exitCode = 2;
  }
}
