import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const web = new URL('../../web/', import.meta.url);
const read = (n) => readFileSync(new URL(n, web), 'utf8');
const text = (d) => d.body.textContent.replace(/\s+/g, ' ').trim();

test('Beamer: eigene Seite beamer.html mit beamer.js, ohne Admin-Code oder Supabase-Schluessel im Markup', () => {
  assert.ok(existsSync(new URL('beamer.html', web)), 'beamer.html');
  assert.ok(existsSync(new URL('js/beamer.js', web)), 'js/beamer.js');
  const doc = new JSDOM(read('beamer.html')).window.document;
  assert.equal(doc.documentElement.lang, 'de');
  const s = [...doc.querySelectorAll('script')];
  assert.ok(s.some((x) => /js\/beamer\.js$/.test(x.getAttribute('src') || '')));
  assert.equal(doc.querySelectorAll('input, form').length, 0);
});

test('Beamer-Skript: sessionStorage-Token, strenge Herkunfts- und Quellpruefung, eigenes Polling, kein admincode in URL', () => {
  const src = read('js/beamer.js');
  assert.match(src, /postMessage|message/);
  assert.match(src, /event\.origin|e\.origin|ev\.origin/, 'Origin wird geprueft');
  assert.match(src, /event\.source|e\.source|ev\.source|opener/, 'Quelle wird geprueft');
  assert.match(src, /sessionStorage/);
  assert.match(src, /beamer_state|beamerState/);
  assert.match(src, /setInterval|setTimeout/, 'eigenes Polling');
  assert.match(src, /admincode/, 'erkennt/entfernt geerbten admincode');
  assert.doesNotMatch(src, /targetOrigin\s*[:=]\s*['"]\*['"]|postMessage\([^)]*,\s*['"]\*['"]\)/);
  assert.doesNotMatch(src, /admin_overview|admin_open_beamer/);
  for (const line of src.split(/\r?\n/).filter((l) => /admincode/i.test(l))) assert.match(line, /removeItem|delete\(/, 'admincode nur zum Entfernen');
  assert.doesNotMatch(src, /localStorage/);
});

test('Admin: kein beamer-exit mehr, Beamer oeffnet benanntes neues Fenster, Admin bleibt', () => {
  assert.doesNotMatch(read('admin.html'), /beamer-exit/);
  const src = read('js/admin.js');
  assert.doesNotMatch(src, /beamer-exit/);
  assert.match(src, /window\.open\([^)]*beamer\.html[^)]*,\s*['"][\w-]+['"]/);
  assert.match(src, /openBeamer/);
  assert.match(src, /postMessage\([^)]*location\.origin|postMessage\([^)]*origin/);
  assert.doesNotMatch(src, /beamer\.html\?[^'"]*(token|code)/i, 'keine Zugangsdaten in der URL');
});

test('Anleitung: Skript guide.js ohne Anmeldung, nur game_config, Tabelle oder sichtbarer Hinweis', () => {
  const src = read('js/guide.js');
  assert.match(src, /game_config|gameConfig/);
  assert.doesNotMatch(src, /signInAnonymously|ensureSession|admin_|get_state|auth\./);
  assert.match(src, /alert/i, 'Fehlerhinweis sichtbar');
  assert.match(src, /table|<table|createElement\('table'\)/);
  const doc = new JSDOM(read('erklaerung.html')).window.document;
  assert.ok(doc.querySelector('[role="alert"], .guide-schedules, #point-schedules, #punktetabelle, [data-schedules]'), 'Platz fuer Staffeltabelle/Hinweis');
});

test('Anleitung: Wortgrenzen, keine einzelnen Aufgaben oder Orte, keine veralteten 45 Minuten', () => {
  const doc = new JSDOM(read('erklaerung.html')).window.document;
  const t = text(doc);
  assert.doesNotMatch(t, /45 Minuten/);
  assert.match(t, /Aufgegeben|aufgeben/i);
});

test('Praesentation: QR bleibt, kein Backend, Standardwert 25 Minuten als Standard gekennzeichnet', () => {
  const doc = new JSDOM(read('praesentation.html')).window.document;
  assert.match(text(doc), /Standard.*25 Minuten|25 Minuten.*Standard/);
  assert.doesNotMatch(text(doc), /45 Minuten/);
  assert.ok(doc.querySelector('canvas, img, svg, #qr, [data-qr]'), 'QR-Platz');
  const js = read('js/presentation.js');
  assert.doesNotMatch(js, /supabase|rpc|fetch\(|game_config/i);
});
