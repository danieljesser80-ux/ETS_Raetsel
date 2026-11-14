import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('TST-U-028 / AEN-054: alle Schema-Loeschungen verwenden WHERE fuer Supabases Loeschschutz', () => {
  const schema = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
  const deletes = schema.match(/^\s*delete\s+from\b[^;]*;/gim) || [];
  assert.ok(deletes.length >= 10, 'Schema-Loeschungen einschliesslich Reset gefunden');
  assert.equal(deletes.filter((sql) => /public\.display_tokens\b/i.test(sql)).length, 2,
    'Token-Loeschungen bei Reset und Codewechsel erfasst');
  for (const sql of deletes) assert.match(sql, /\bwhere\b/i, sql.trim());
});
