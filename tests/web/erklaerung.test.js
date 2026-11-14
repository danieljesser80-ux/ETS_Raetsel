import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { renderPlayer, renderMessage } from '../../web/js/views.js';

const web = new URL('../../web/', import.meta.url);
const load = (name) => new JSDOM(readFileSync(new URL(name, web), 'utf8')).window.document;
const text = (node) => node.textContent.replace(/\s+/g, ' ').trim();

test('TST-U-020: Anleitung ist deutsch, semantisch und für Smartphones eingerichtet', () => {
  const page = load('erklaerung.html');
  assert.equal(page.documentElement.lang, 'de');
  assert.match(page.querySelector('meta[name="viewport"]').content, /width=device-width/);
  assert.equal(page.querySelectorAll('h1').length, 1);
  assert.match(page.title, /Spiel|Weihnachtsrätsel/);
  for (const id of ['idee', 'rollen', 'ablauf', 'wertung', 'regeln']) {
    const section = page.querySelector(`main section#${id}`);
    assert.ok(section, `Abschnitt ${id}`);
    assert.ok(section.querySelector('h2'));
    assert.ok(section.classList.contains('card'));
  }
  assert.equal(page.querySelectorAll('table, pre, img, [style]').length, 0);
});

test('TST-K-011 / TST-S-028: Idee, Rollen und Ablauf entsprechen den Anforderungen', () => {
  const page = load('erklaerung.html');
  assert.match(text(page.querySelector('#idee')), /Weihnachtsfeier/);
  const roles = text(page.querySelector('#rollen'));
  for (const pattern of [/Spieler/, /Spielleiter/, /Admin/, /erste.*richtige Wort/, /nur.*Spielleiter.*Antworten/i]) {
    assert.match(roles, pattern);
  }
  const flow = text(page.querySelector('main'));
  for (const pattern of [
    /QR-Code/, /5 Minuten/, /Countdown/, /Spitznamen/, /zufällig/, /4 bis 6/,
    /einstellen/, /Gruppenname/, /Buchstaben/, /Gruppenwort/, /drei Versuche/, /3 Sekunden/,
    /Spiele beenden/,
  ]) assert.match(flow, pattern);
});

test('TST-S-028: Anleitung erklärt Zeit, Punkte und Sichtbarkeit ohne Regeländerung', () => {
  const page = load('erklaerung.html');
  const score = text(page.querySelector('#wertung'));
  for (const pattern of [
    /Gruppenwort.*Gruppeneinteilung/, /ers[a-z]+ Öffnen/, /kein.*Neustart/,
    /Nähe/, /Gleichstand.*kürzere Zeit/, /[Ff]alsch.*0 Punkte/,
    /vorläufig/, /Rangliste.*Admin.*Beamer/,
    /eigene.*Gesamtplatz/,
  ]) assert.match(score, pattern);
  const rules = text(page.querySelector('#regeln'));
  assert.match(rules, /Gruppenwort.*unbegrenzt/);
  assert.match(rules, /3 Sekunden/);
  assert.match(rules, /gleichen Browser/);
  assert.match(rules, /drei Versuche/);
  assert.match(rules, /Schätz.*(eine Abgabe|ein Versuch)/);
});

test('TST-S-028 / TST-U-020: Navigation ist relativ und bleibt trotz Rendering und Netzfehler sichtbar', () => {
  const start = load('index.html');
  const link = start.querySelector('a[href="erklaerung.html"]');
  assert.ok(link);
  assert.equal(link.closest('#app, #notice'), null);
  renderPlayer(start.querySelector('#app'), null, {}, Date.now());
  renderMessage(start.querySelector('#notice'), 'Verbindung unterbrochen', 'error');
  assert.ok(link.isConnected);
  assert.match(text(link), /Spiel|Ablauf|Erklärung/);
  const page = load('erklaerung.html');
  assert.ok(page.querySelector('a[href="index.html"]'));
  assert.ok(page.querySelector('a[href="praesentation.html"]'));
  const presentation = load('praesentation.html');
  assert.ok(presentation.querySelector('a[href="erklaerung.html"]'));
  assert.ok(presentation.querySelector('a[href="index.html"]'));
  for (const [doc, base] of [[start, 'index.html'], [page, 'erklaerung.html'], [presentation, 'praesentation.html']]) {
    for (const anchor of doc.querySelectorAll('a[href]')) {
      const href = anchor.getAttribute('href');
      const resolved = new URL(href, `https://example.invalid/ETS_Raetsel/${base}`);
      assert.ok(resolved.pathname.startsWith('/ETS_Raetsel/'));
      assert.ok(existsSync(fileURLToPath(new URL(href, web))));
    }
  }
});

test('TST-S-028 / TST-A-006: Anleitung hat keine aktiven oder externen Abhängigkeiten', () => {
  const guide = load('erklaerung.html');
  assert.ok(guide.body.classList.contains('guide-page'));
  assert.equal(guide.querySelectorAll('img, form, input, iframe, object, embed').length, 0);
  const gs = [...guide.querySelectorAll('script')];
  assert.equal(gs.length, 1, 'nur das lokale Skript guide.js');
  assert.equal(gs[0].getAttribute('type'), 'module');
  assert.equal(gs[0].getAttribute('src'), 'js/guide.js');
  const presentation = load('praesentation.html');
  assert.ok(presentation.body.classList.contains('presentation'));
  assert.equal(presentation.querySelectorAll('form, input, iframe, object, embed').length, 0);
  const scripts = [...presentation.querySelectorAll('script')];
  assert.equal(scripts.length, 1, 'genau der lokale QR-Modulaufruf');
  assert.equal(scripts[0].getAttribute('type'), 'module');
  assert.equal(scripts[0].getAttribute('src'), 'js/presentation.js');
  for (const name of ['erklaerung.html', 'praesentation.html']) {
      const page = load(name);
      assert.equal(page.querySelectorAll('meta[http-equiv]').length, 0);
      assert.equal(page.querySelectorAll('link[rel="stylesheet"]').length, 1);
      assert.equal(page.querySelector('link[rel="stylesheet"]').getAttribute('href'), 'style.css');
      for (const node of page.querySelectorAll('*')) {
        for (const attr of node.attributes) {
          assert.ok(!attr.name.startsWith('on'));
          if (['src', 'href'].includes(attr.name)) {
            assert.doesNotMatch(attr.value, /^(?:[a-z]+:|\/)/i);
            assert.ok(existsSync(fileURLToPath(new URL(attr.value, web))));
          }
        }
      }
  }
  const workflow = readFileSync(new URL('../../.github/workflows/pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /upload-pages-artifact@/);
  assert.match(workflow, /path: web/);
});

test('TST-K-011 / TST-U-020: Ablaufgrafik zeigt Schrittfolge und wiederholbare Rätselschleife', () => {
  const page = load('erklaerung.html');
  const section = page.querySelector('main section#ablaufgrafik.card');
  assert.ok(section, 'Grafik ergänzt die bestehende Anleitung');
  const diagram = section.querySelector('figure.guide-diagram');
  assert.ok(diagram);
  for (const attr of ['aria-labelledby', 'aria-describedby']) {
    assert.ok(page.getElementById(diagram.getAttribute(attr)), `Beschriftung ${attr}`);
  }
  const steps = [...diagram.querySelectorAll('.guide-flow > li')];
  assert.deepEqual(steps.map((node) => node.dataset.flowStep),
    ['login', 'gruppenwort', 'spielleiter', 'raetselphase', 'ende']);
  assert.match(text(steps[0]), /Login.*Anmeldung/);
  assert.match(text(steps[1]), /gemeinsame.*Gruppenwort/i);
  assert.match(text(steps[2]), /erste.*richtige.*Wort.*Spielleiter/i);
  const cycle = steps[3].querySelector('.guide-cycle');
  assert.ok(cycle);
  assert.deepEqual([...cycle.children].map((node) => node.dataset.flowStep),
    ['uebersicht', 'auswahl', 'antwort']);
  assert.match(text(cycle), /Rätselübersicht.*frei.*auswählen.*[Gg]emeinsam.*Spielleiter.*Antwort/);
  assert.match(text(steps[3].querySelector('.guide-flow-return')), /Zurück zur Übersicht.*nächste.*Rätsel/);
  assert.ok(page.querySelector('#ablauf .guide-steps'), 'Ausführliche Anleitung bleibt erhalten');
});

test('TST-S-028: Grafik trennt begleitende Rangliste vom Spielende (Standard 25 Minuten, Admin kann manuell beenden)', () => {
  const diagram = load('erklaerung.html').querySelector('figure.guide-diagram');
  assert.ok(diagram);
  const end = diagram.querySelector('[data-flow-step="ende"]');
  assert.ok(end);
  assert.match(text(end), /25 Minuten/);
  assert.doesNotMatch(text(end), /45 Minuten/);
  assert.match(text(end), /Admin.*Spiele beenden/);
  const monitor = diagram.querySelector('.guide-monitor');
  assert.ok(monitor);
  assert.equal(monitor.closest('.guide-flow'), null, 'Rangliste ist kein Spielschritt');
  assert.match(text(monitor), /[Aa]ktuelle Rangliste.*Monitor/);
  assert.match(text(monitor), /[Ww]ährend des Spiels/);
  assert.match(text(monitor), /vorläufig/);
});

test('TST-U-020: Anleitung und Präsentation halten die festgelegten Wortgrenzen ein', () => {
  for (const [name, maximum] of [['erklaerung.html', 450], ['praesentation.html', 100]]) {
    const page = load(name);
    assert.equal(page.documentElement.lang, 'de');
    assert.match(page.querySelector('meta[name="viewport"]').content, /width=device-width/);
    assert.equal(page.querySelectorAll('h1').length, 1);
    const count = text(page.querySelector('main')).split(/\s+/).length;
    assert.ok(count <= maximum, `${name}: ${count} Wörter, höchstens ${maximum}`);
  }
});

test('TST-S-028: Beide Erläuterungen bleiben allgemein ohne einzelne Rätsel und Spezialanweisungen', () => {
  for (const name of ['erklaerung.html', 'praesentation.html']) {
    const page = load(name);
    assert.doesNotMatch(text(page.querySelector('main')),
      /Schach|Sudoku|Geocaching|Wissensquiz|Schätzquiz|Vorname|Zielfelder|Schlüsselfelder|Patentnummer|Locker/i);
  }
});

test('TST-K-011 / TST-U-020: Monitor-Präsentation zeigt nur fünf Grundprinzipien und den Ranglistenhinweis', () => {
  const page = load('praesentation.html');
  assert.ok(page.body.classList.contains('presentation'));
  const steps = [...page.querySelectorAll('main .presentation-flow > li')];
  assert.deepEqual(steps.map(node => node.dataset.flowStep),
    ['login', 'gruppenwort', 'spielleiter', 'raetselphase', 'ende']);
  const content = text(page.querySelector('main'));
  for (const pattern of [/anmelden/i, /Gruppenwort/, /erste.*richtige Wort/i,
    /Spielleiter/, /frei/i, /[Zz]urück zur Übersicht/, /25 Minuten/,
    /Rangliste.*Monitor/]) assert.match(content, pattern);
  assert.doesNotMatch(content, /drei Versuche|eine Abgabe|3 Sekunden|10, 8|Schätz/i);
  assert.ok(steps[3].querySelector('.presentation-return'), 'Sichtbare Rückkehrschleife');
  assert.equal(page.querySelector('.presentation-ranking').closest('.presentation-flow'), null);
});
