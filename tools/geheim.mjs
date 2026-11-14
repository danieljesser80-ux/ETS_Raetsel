import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|zip)$/i;

export function defaultSperrliste(root) {
  const dir = process.env.GEHEIM_DIR || resolve(root, '..', 'Raetsel-geheim');
  return join(dir, 'sperrliste.txt');
}

function walk(root, rel, out) {
  for (const name of readdirSync(join(root, rel))) {
    if (name === 'node_modules') continue;
    const next = join(rel, name);
    if (statSync(join(root, next)).isDirectory()) walk(root, next, out);
    else if (!BINARY.test(name)) out.push(next);
  }
}

// UNA-014: findet Sperrlistenwerte im Projekt; meldet nie den Inhalt, nur Datei und Zeilennummer.
export function checkSecrets(root, sperrliste) {
  if (!existsSync(sperrliste)) return { ok: false, missing: true, hits: [] };
  const tokens = readFileSync(sperrliste, 'utf8')
    .split(/\r?\n/)
    .map((text, i) => ({ text: text.trim().toLowerCase(), line: i + 1 }))
    .filter((t) => t.text && !t.text.startsWith('#'));
  const files = [];
  walk(root, '.', files);
  const hits = [];
  for (const f of files.sort()) {
    const content = readFileSync(join(root, f), 'utf8').toLowerCase();
    for (const t of tokens) {
      if (content.includes(t.text)) hits.push({ file: f.split(sep).join('/'), line: t.line });
    }
  }
  return { ok: hits.length === 0, missing: false, hits };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(import.meta.url), '..', '..');
  const liste = defaultSperrliste(root);
  const r = checkSecrets(root, liste);
  if (r.missing) {
    console.error(`Sperrliste nicht gefunden: ${liste}`);
    process.exitCode = 2;
  } else if (r.ok) {
    console.log('Keine geheimen Lösungen im Projekt gefunden.');
  } else {
    for (const h of r.hits) console.error(`Treffer: ${h.file} (Sperrliste Zeile ${h.line})`);
    process.exitCode = 1;
  }
}
