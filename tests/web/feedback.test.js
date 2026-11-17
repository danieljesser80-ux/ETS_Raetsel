import test from 'node:test';
import assert from 'node:assert/strict';
import { ANSWER_FEEDBACK_MS } from '../../web/js/feedback.js';

test('TST-S-071: Antwortfeedback dauert wieder 3 Sekunden', () => {
  assert.equal(ANSWER_FEEDBACK_MS, 3000);
});
