import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Konsistenzprüfung gemäß DOC-001 Abschnitt 5 und DOC-009 Abschnitt 3.
// Prüft: definierte IDs, Querverweise, lokale Links, Versionen gegen das Dokumentverzeichnis.
export function checkConsistency(root) {
  const files = ['ANFORDERUNGEN.md', ...readdirSync(join(root, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`)];
  const txt = Object.fromEntries(files.map((f) => [f, readFileSync(join(root, f), 'utf8')]));
  const definitions = new Map();
  const statuses = [];
  const problems = [];
  const idPattern = /^(?:KAN|SWA|ARC|UNA|ENT|OFF|AEN|TST-[KSAU])-\d{3}$/;
  const normalizeStatus = (value) => {
    const cleaned = value.replace(/[*`]/g, '').trim().toLowerCase();
    return cleaned.match(/\b(in baseline bl-\d{3}|verifiziert|umgesetzt|geklärt|beantragt|verworfen|entschieden|offen|freigegeben|abgelöst|eingefroren|entwurf)\b/)?.[1] || cleaned;
  };
  for (const [file, content] of Object.entries(txt)) {
    let header = null;
    let historicalLevel = null;
    for (const line of content.split(/\r?\n/)) {
      const heading = line.match(/^(#{1,6})\s+(.*)/);
      if (heading) {
        if (historicalLevel !== null && heading[1].length <= historicalLevel) historicalLevel = null;
        if (/historisch|archiv|entscheidungsvorschläge/i.test(heading[2])) historicalLevel = heading[1].length;
        header = null;
      }
      if (!line.startsWith('|')) { header = null; continue; }
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
      if (historicalLevel !== null) continue;
      if (!idPattern.test(cells[0])) {
        header = cells[0] === 'Version' ? null : cells;
        continue;
      }
      if (header && header[0] === 'Referenz') {
        statuses.push({ file, id: cells[0], status: normalizeStatus(cells[1]) });
        continue;
      }
      if (header && !['ID', 'Antrag', 'Dokument-ID'].includes(header[0])) continue;
      const id = cells[0];
      if (definitions.has(id)) problems.push(`${file}: doppelte Definition ${id} (auch ${definitions.get(id).file})`);
      const statusIndex = header?.indexOf('Status') ?? -1;
      const status = id.startsWith('ENT-') ? normalizeStatus(cells.at(-1))
        : statusIndex >= 0 ? normalizeStatus(cells[statusIndex]) : null;
      definitions.set(id, { file, status });
    }
  }
  const defs = new Set(definitions.keys());
  for (const { file, id, status } of statuses) {
    const actual = definitions.get(id);
    if (!actual || actual.status !== status) {
      problems.push(`${file}: Status ${id}: Referenz ${status}, Definition ${actual?.status || 'unbekannt'}`);
    }
  }
  for (const [f, t] of Object.entries(txt)) {
    for (const m of t.matchAll(/\b(?:KAN|SWA|ARC|UNA|ENT|OFF|AEN|TST-[KSAU])-\d{3}\b/g)) {
      if (!defs.has(m[0])) problems.push(`${f}: nicht definierte ID ${m[0]}`);
    }
    for (const m of t.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z]+:/i.test(m[1])) continue;
      if (!existsSync(resolve(root, dirname(f), m[1]))) problems.push(`${f}: Link ohne Ziel ${m[1]}`);
    }
  }
  const directory = [...txt['ANFORDERUNGEN.md'].matchAll(/^\| (DOC-\d{3}) \|([^\n]+)\|$/gm)]
    .map((match) => ({ id: match[1], version: match[2].split('|').at(-1).trim() }))
    .filter((entry) => /^\d+(?:\.\d+)*$/.test(entry.version));
  for (const { id, version } of directory) {
    const hit = Object.values(txt).find((t) => t.includes(`**Dokument-ID:** ${id} `) || t.includes(`| Dokument-ID | ${id} |`));
    const v = hit && (hit.match(/\*\*Version:\*\* ([\d.]+)/) || hit.match(/\| Version \| ([\d.]+) \|/));
    if (!v || v[1] !== version) problems.push(`Version ${id}: Verzeichnis ${version}, Datei ${v ? v[1] : 'unbekannt'}`);
  }
  for (const content of Object.values(txt)) {
    const history = content.match(/(?:^|\n)#{1,6}\s+[^\n]*Dokumenthistorie[^\n]*\n([\s\S]*?)(?=\n#{1,6}\s|$)/i);
    const isRegister = content === txt['docs/AENDERUNGSREGISTER.md'];
    if (!history && !isRegister) continue;
    const rows = [...(history ? history[1] : content).matchAll(/^\| [\d.]+ \|.*$/gm)];
    const latest = rows.at(-1)?.[0];
    if (!latest) { problems.push('Dokumenthistorie: keine Versionszeile'); continue; }
    for (const { id, version } of directory) {
      const entry = latest.match(new RegExp(`${id}\\s+v?(\\d+(?:\\.\\d+)*)`));
      if (!entry || entry[1] !== version) problems.push(`Version ${id} in Historie: erwartet ${version}, gefunden ${entry?.[1] || 'fehlend'}`);
    }
  }
  return { ok: problems.length === 0, problems, ids: defs.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(import.meta.url), '..', '..');
  const r = checkConsistency(root);
  console.log(r.ok ? `Konsistenz sauber (${r.ids} IDs).` : `Konsistenzfehler:\n  ${r.problems.join('\n  ')}`);
  process.exitCode = r.ok ? 0 : 1;
}
