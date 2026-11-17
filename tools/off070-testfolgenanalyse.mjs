// OFF-070: reproduzierbare Bestandsaufnahme aller Testdateien (keine Anwendungscode-Änderung).
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && /(?:^|\/)tests?\//.test(relative(root, path).replaceAll('\\', '/')) && /\.(?:js|mjs|cjs|ts)$/.test(entry.name)) files.push(path);
  }
}
walk(root);
files.sort();
const patterns = [
  ['statuswort', /erledigt/i],
  ['rueckmeldung', /feedback|rückmeldung|falsch|wrong|success|ANSWER_FEEDBACK_MS/i],
  ['zeitwert', /\b(?:1000|3000|1_000|3_000)\b|setTimeout|advanceTimersByTime/i],
  ['fortschritt', /progress|fortschritt|category-toggle|mission-progress/i],
];
let flagged = 0, total = 0;
for (const path of files) {
  const name = relative(root, path).replaceAll('\\', '/');
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const tags = patterns.filter(([, re]) => re.test(lines[i])).map(([tag]) => tag);
    if (tags.length) hits.push(`${i + 1}:${tags.join(',')}`);
  }
  total += hits.length;
  if (hits.length) flagged++;
  console.log(`OFF070_AUDIT ${name} | Treffer: ${hits.length} | ${hits.join(' ')}`);
}
console.log(`OFF070_AUDIT_SUMMARY Dateien=${files.length} Dateien_mit_Treffern=${flagged} Trefferzeilen=${total}`);
if (!files.length) process.exitCode = 1;
