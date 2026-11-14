import { readdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MODI = ['schnell', 'voll'];

function collect(root, rel, out) {
  for (const name of readdirSync(join(root, rel))) {
    const next = join(rel, name);
    if (statSync(join(root, next)).isDirectory()) collect(root, next, out);
    else if (name.endsWith('.test.js')) out.push(next.split(sep).join('/'));
  }
}

// UNA-013: Dateiauswahl für den schnellen (ohne Datenbanktests) und vollen Lauf.
export function selectTestFiles(root, modus) {
  if (!MODI.includes(modus)) throw new Error(`Unbekannter Modus "${modus}" (schnell | voll)`);
  const files = [];
  collect(root, 'tests', files);
  return files.filter((f) => modus === 'voll' || !f.startsWith('tests/db/')).sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(import.meta.url), '..', '..');
  try {
    const files = selectTestFiles(root, process.argv[2]);
    const r = spawnSync(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' });
    process.exitCode = r.status ?? 1;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 2;
  }
}
