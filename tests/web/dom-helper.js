import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.test/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Event = dom.window.Event;

export const doc = dom.window.document;

export function makeRoot() {
  const root = doc.createElement('div');
  doc.body.appendChild(root);
  return root;
}

export function textOf(root) {
  return root.textContent.replace(/\s+/g, ' ').trim();
}

export function buttons(root) {
  return [...root.querySelectorAll('button')];
}

export function findButton(root, re) {
  return buttons(root).find((b) => re.test(b.textContent));
}

export function textInput(root) {
  return root.querySelector('input:not([type=button]):not([type=submit]), textarea');
}

export function submitOrClick(root, button, input, value) {
  if (input) input.value = value;
  button.click();
}
