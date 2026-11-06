export function playerUrl(pageUrl) {
  let page;
  try {
    page = new URL(pageUrl);
  } catch {
    throw new Error('Die Spieladresse ist ungültig.');
  }
  if (!['http:', 'https:'].includes(page.protocol)) {
    throw new Error('Für den QR-Code bitte diese Seite über HTTP oder HTTPS öffnen, nicht als lokale Datei.');
  }
  if (page.hostname === 'localhost' || page.hostname.endsWith('.localhost') ||
      /^127\./.test(page.hostname) || page.hostname === '[::1]') {
    throw new Error('Lokale Vorschau: Der QR-Code erscheint auf der veröffentlichten Website oder einer erreichbaren LAN-Adresse.');
  }
  return new URL('index.html', page).href;
}

async function encodeQr(address, options) {
  const { default: QRCode } = await import('https://esm.sh/qrcode@1.5.4');
  return QRCode.toDataURL(address, options);
}

export async function renderPlayerQr(root, pageUrl, encode = encodeQr) {
  const doc = root.ownerDocument;
  const status = doc.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'QR-Code wird geladen …';
  root.replaceChildren(status);
  let address;
  try {
    address = playerUrl(pageUrl);
  } catch (error) {
    status.setAttribute('role', 'alert');
    status.textContent = error.message;
    return false;
  }
  const link = doc.createElement('a');
  link.href = address;
  link.textContent = address;
  link.className = 'qr-address';
  root.append(link);
  try {
    const src = await encode(address, { width: 360, margin: 4, errorCorrectionLevel: 'M' });
    const img = doc.createElement('img');
    img.alt = 'QR-Code zur Anmeldung';
    img.width = 360;
    img.height = 360;
    img.src = src;
    root.replaceChildren(img, link);
    return true;
  } catch {
    status.setAttribute('role', 'alert');
    status.textContent = 'QR-Code konnte nicht erstellt werden. Bitte die Spieladresse öffnen und erneut laden.';
    return false;
  }
}
