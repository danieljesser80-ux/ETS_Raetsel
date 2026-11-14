import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { playerUrl, renderPlayerQr } from '../../web/js/qr.js';

test('TST-U-025: Lokale HTTP-Vorschau erzeugt keinen irreführenden Smartphone-QR', async () => {
  for (const address of [
    'http://localhost:8080/praesentation.html',
    'http://browser-preview-local.localhost/vorschau/praesentation.html',
    'http://127.0.0.1:8080/admin.html',
    'http://[::1]:8080/admin.html',
  ]) {
    const doc = new JSDOM('<div id="qr"></div>').window.document;
    const root = doc.getElementById('qr');
    assert.throws(() => playerUrl(address), /veröffentlicht|Vorschau/i);
    let calls = 0;
    assert.equal(await renderPlayerQr(root, address, async () => { calls++; }), false);
    assert.equal(calls, 0);
    assert.ok(root.querySelector('[role=alert]'));
    assert.equal(root.querySelector('img'), null);
  }
});

test('TST-U-025: Reale Website- und LAN-Adressen bleiben als QR-Ziel zulässig', () => {
  assert.equal(playerUrl('https://beispiel.example/spiel/praesentation.html'), 'https://beispiel.example/spiel/index.html');
  assert.equal(playerUrl('http://192.168.1.20:8080/admin.html'), 'http://192.168.1.20:8080/index.html');
});
