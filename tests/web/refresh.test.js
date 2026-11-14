import test from 'node:test';
import assert from 'node:assert/strict';

const { createRefreshLoop } = await import('../../web/js/refresh.js');

const flush = () => new Promise((r) => setImmediate(r));

function harness() {
  const h = { loads: [], applied: [], errors: [], timers: [] };
  h.load = () => new Promise((resolve, reject) => h.loads.push({ resolve, reject }));
  h.apply = (value) => h.applied.push(value);
  h.onError = (e) => h.errors.push(e);
  h.setTimer = (fn, ms) => {
    const t = { fn, ms, active: true };
    h.timers.push(t);
    return t;
  };
  h.clearTimer = (t) => {
    if (t) t.active = false;
  };
  h.active = () => h.timers.filter((t) => t.active);
  h.fire = async () => {
    const [t] = h.active();
    assert.ok(t, 'aktiver Timer erwartet');
    t.active = false;
    t.fn();
    await flush();
    return t;
  };
  h.loop = createRefreshLoop({ load: h.load, apply: h.apply, onError: h.onError, setTimer: h.setTimer, clearTimer: h.clearTimer });
  return h;
}

test('TST-U-023: start plant genau einen Abruf nach 2 s, mehrfacher Start verdoppelt nichts', async () => {
  const h = harness();
  h.loop.start();
  h.loop.start();
  assert.equal(h.loads.length, 0);
  assert.deepEqual(h.active().map((t) => t.ms), [2000]);
  await h.fire();
  assert.equal(h.loads.length, 1);
  h.loads[0].resolve({ n: 1 });
  await flush();
  assert.deepEqual(h.applied, [{ n: 1 }]);
  assert.deepEqual(h.active().map((t) => t.ms), [2000], 'naechster Abruf nach 2 s');
  assert.deepEqual(h.errors, []);
});

test('TST-U-023: request liefert ein Promise, das nach der Anwendung des Ergebnisses erfuellt wird', async () => {
  const h = harness();
  const p = h.loop.request();
  assert.ok(p instanceof Promise);
  assert.equal(h.loads.length, 1);
  let done = false;
  p.then(() => { done = true; });
  await flush();
  assert.equal(done, false);
  h.loads[0].resolve('A');
  await p;
  assert.deepEqual(h.applied, ['A']);
});

test('TST-U-023: hoechstens ein laufender Abruf; weitere Anforderungen und Timer werden zu einem Folgeabruf gebuendelt', async () => {
  const h = harness();
  h.loop.start();
  const first = h.loop.request();
  const second = h.loop.request();
  const third = h.loop.request();
  await flush();
  assert.equal(h.loads.length, 1);
  if (h.active().length) await h.fire();
  assert.equal(h.loads.length, 1, 'Timer startet keinen parallelen Abruf');
  h.loads[0].resolve('eins');
  await flush();
  assert.equal(h.loads.length, 2, 'genau ein gebuendelter Folgeabruf');
  assert.deepEqual(h.applied, ['eins']);
  h.loads[1].resolve('zwei');
  await Promise.all([first, second, third]);
  assert.deepEqual(h.applied, ['eins', 'zwei']);
  await flush();
  assert.equal(h.loads.length, 2, 'danach kein weiterer Sofortabruf');
  assert.equal(h.active().length, 1);
});

test('TST-U-023: invalidate verwirft laufende Antwort und haelt Abrufe bis request nach der Aktion zurueck', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  assert.equal(h.loads.length, 1);
  h.loop.invalidate();
  h.loads[0].resolve('veraltet');
  await flush();
  assert.deepEqual(h.applied, [], 'veraltete Antwort nicht angewendet');
  assert.equal(h.loads.length, 1, 'kein Folgeabruf waehrend der Aktion');
  for (const t of h.active()) {
    t.active = false;
    t.fn();
  }
  await flush();
  assert.equal(h.loads.length, 1, 'auch Timer laden waehrend der Aktion nicht');
  const after = h.loop.request();
  assert.equal(h.loads.length, 2, 'genau ein frischer Abruf nach der Aktion');
  h.loads[1].resolve('frisch');
  await after;
  assert.deepEqual(h.applied, ['frisch']);
});

test('TST-U-023: invalidate waehrend laufendem Abruf – request wartet auf Ende, danach ein frischer Abruf, nie zwei parallel', async () => {
  const h = harness();
  const old = h.loop.request();
  void old;
  assert.equal(h.loads.length, 1);
  h.loop.invalidate();
  const fresh = h.loop.request();
  await flush();
  assert.equal(h.loads.length, 1, 'hoechstens ein laufender Abruf');
  h.loads[0].resolve('veraltet');
  await flush();
  assert.deepEqual(h.applied, []);
  assert.equal(h.loads.length, 2);
  h.loads[1].resolve('frisch');
  await fresh;
  assert.deepEqual(h.applied, ['frisch']);
});

test('TST-U-023: veralteter Fehler nach invalidate wird weder gemeldet noch fuehrt er zu Backoff', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  h.loop.invalidate();
  h.loads[0].reject(new Error('alt'));
  await flush();
  assert.deepEqual(h.errors, []);
  const p = h.loop.request();
  h.loads[1].resolve('ok');
  await p;
  assert.deepEqual(h.applied, ['ok']);
  assert.deepEqual(h.active().map((t) => t.ms), [2000]);
});

test('TST-U-023: invalidate ohne laufenden Abruf, request startet sofort genau einen Abruf', async () => {
  const h = harness();
  h.loop.invalidate();
  h.loop.request();
  assert.equal(h.loads.length, 1);
});

test('TST-U-023: Fehler melden onError und verlaengern den Abstand 4, 8, 16, 30, 30 s ohne sofortige Wiederholung', async () => {
  const h = harness();
  h.loop.start();
  const expected = [4000, 8000, 16000, 30000, 30000];
  for (const [i, ms] of expected.entries()) {
    await h.fire();
    assert.equal(h.loads.length, i + 1);
    const err = new Error(`netz ${i}`);
    h.loads[i].reject(err);
    await flush();
    assert.equal(h.errors.length, i + 1);
    assert.equal(h.errors[i], err);
    assert.equal(h.loads.length, i + 1, 'keine automatische Sofortwiederholung');
    assert.deepEqual(h.active().map((t) => t.ms), [ms]);
  }
  assert.deepEqual(h.applied, []);
});

test('TST-U-023: Erfolg nach Fehlern setzt den Abstand auf 2 s zurueck, ein neuer Fehler beginnt wieder bei 4 s', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  h.loads[0].reject(new Error('a'));
  await flush();
  await h.fire();
  h.loads[1].reject(new Error('b'));
  await flush();
  assert.deepEqual(h.active().map((t) => t.ms), [8000]);
  await h.fire();
  h.loads[2].resolve('wieder da');
  await flush();
  assert.deepEqual(h.applied, ['wieder da']);
  assert.deepEqual(h.active().map((t) => t.ms), [2000]);
  await h.fire();
  h.loads[3].reject(new Error('c'));
  await flush();
  assert.deepEqual(h.active().map((t) => t.ms), [4000]);
});

test('TST-U-023: manuelle Anforderung (z. B. Realtime) wird im aktiven Backoff nicht ausgefuehrt', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  h.loads[0].reject(new Error('netz'));
  await flush();
  h.loop.request();
  h.loop.request();
  await flush();
  assert.equal(h.loads.length, 1, 'Backoff blockiert manuelle Abrufe');
  assert.deepEqual(h.active().map((t) => t.ms), [4000], 'Backoff-Timer unveraendert');
  await h.fire();
  assert.equal(h.loads.length, 2, 'geplanter Abruf laeuft');
});

test('TST-U-023: manuelle Anforderung im Normalbetrieb laedt sofort und plant danach genau einen Timer', async () => {
  const h = harness();
  h.loop.start();
  const p = h.loop.request();
  assert.equal(h.loads.length, 1);
  h.loads[0].resolve('x');
  await p;
  await flush();
  assert.equal(h.active().length, 1);
  assert.equal(h.active()[0].ms, 2000);
});

test('TST-U-023: stop ignoriert laufende Antworten und Fehler, loescht Timer und startet nichts mehr', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  const staleTimer = h.timers[h.timers.length - 1];
  h.loop.stop();
  h.loads[0].resolve('spaet');
  await flush();
  assert.deepEqual(h.applied, []);
  assert.deepEqual(h.errors, []);
  assert.equal(h.active().length, 0, 'keine aktiven Timer');
  staleTimer.fn();
  await flush();
  assert.equal(h.loads.length, 1, 'alter Timer startet nichts');

  const h2 = harness();
  h2.loop.start();
  await h2.fire();
  h2.loop.stop();
  h2.loads[0].reject(new Error('spaet'));
  await flush();
  assert.deepEqual(h2.errors, []);
  assert.equal(h2.active().length, 0);
});

test('TST-U-023: stop loescht den ausstehenden Timer ueber clearTimer', () => {
  const h = harness();
  h.loop.start();
  const [t] = h.active();
  h.loop.stop();
  assert.equal(t.active, false);
});

test('TST-U-023: nach stop und start (Neuanmeldung) gilt wieder 2 s statt Backoff, alte Antwort bleibt ungueltig', async () => {
  const h = harness();
  h.loop.start();
  await h.fire();
  h.loads[0].reject(new Error('netz'));
  await flush();
  assert.deepEqual(h.active().map((t) => t.ms), [4000]);
  h.loop.stop();
  assert.equal(h.active().length, 0);
  h.loop.start();
  assert.deepEqual(h.active().map((t) => t.ms), [2000]);
  await h.fire();
  assert.equal(h.loads.length, 2);
  h.loop.stop();
  h.loop.start();
  h.loads[1].resolve('alter Benutzer');
  await flush();
  assert.deepEqual(h.applied, [], 'Antwort vor Abmeldung wird nicht uebernommen');
});

test('TST-U-023: request nach stop startet keinen veralteten Zustand, bis start/request neu erfolgt', async () => {
  const h = harness();
  h.loop.start();
  h.loop.stop();
  assert.equal(h.active().length, 0);
  assert.equal(h.loads.length, 0);
});
