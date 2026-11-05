import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const SCHEMA_PATH = fileURLToPath(new URL('../../supabase/schema.sql', import.meta.url));
export const SCHEMA_EXISTS = existsSync(SCHEMA_PATH);
export const ADMIN_CODE = 'test-admin-code-4711';
export const T0 = '2030-12-01T10:00:00.000Z';
export const T0_MS = Date.parse(T0);

const STUB_SQL = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
-- Supabase-Standard: neue Objekte in public sind fuer anon/authenticated offen; das Schema muss sie selbst einschraenken.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
`;

export async function loadPgcrypto() {
  try {
    const mod = await import('@electric-sql/pglite/contrib/pgcrypto');
    return mod.pgcrypto;
  } catch {
    return null;
  }
}

// Liefert { db, pgcrypto }; fuehrt schema.sql zweimal aus (Wiederholbarkeit).
export async function createDb() {
  const pgcrypto = await loadPgcrypto();
  const db = new PGlite(pgcrypto ? { extensions: { pgcrypto } } : {});
  await db.waitReady;
  if (pgcrypto) await db.exec('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await db.exec(STUB_SQL);
  const sql = await readFile(SCHEMA_PATH, 'utf8');
  await db.exec(sql);
  await db.exec(sql);
  await db.query('SELECT public.admin_set_code($1)', [ADMIN_CODE]);
  return { db, pgcrypto: !!pgcrypto };
}

export function uid(n) {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

export async function setNow(db, iso) {
  await db.query(`SELECT set_config('app.fake_now', $1, false)`, [iso]);
}

export const isoAt = (ms) => new Date(ms).toISOString();

async function asRole(db, role, sub, fn) {
  await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false)`, [sub ?? '']);
  await db.exec(`SET ROLE ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec('RESET ROLE');
  }
}

// RPC als authenticated mit gegebener UUID (null = kein auth.uid()).
export function rpc(db, sub, fn, ...args) {
  const ph = args.map((_, i) => `$${i + 1}`).join(', ');
  return asRole(db, 'authenticated', sub, async () => {
    const r = await db.query(`SELECT public.${fn}(${ph}) AS r`, args);
    return r.rows[0].r;
  });
}

export function rpcAnon(db, fn, ...args) {
  const ph = args.map((_, i) => `$${i + 1}`).join(', ');
  return asRole(db, 'anon', null, () => db.query(`SELECT public.${fn}(${ph}) AS r`, args));
}

// Beliebiges SQL unter Rolle (fuer Rechtepruefungen).
export function sqlAs(db, role, sub, text) {
  return asRole(db, role, sub, () => db.query(text));
}

export const admin = (db, fn, ...args) => rpc(db, uid(999999), fn, ADMIN_CODE, ...args);

// Superuser-Abfrage (Testhilfe, ohne SET ROLE).
export async function q(db, text, params = []) {
  return (await db.query(text, params)).rows;
}

export async function solutionOf(db, playerId) {
  const rows = await q(
    db,
    `SELECT gt.solution FROM public.group_tasks gt JOIN public.players p ON p.group_id = gt.group_id WHERE p.id = $1`,
    [playerId],
  );
  return rows[0]?.solution;
}

export async function resetAll(db) {
  await setNow(db, T0);
  const r = await admin(db, 'admin_reset');
  if (!r.ok) throw new Error('admin_reset fehlgeschlagen: ' + JSON.stringify(r));
}

// Runde im Zustand "anmeldung" bei T0 (Frist T0+300 s) mit n Spielern (uid(1..n)).
export async function openWithPlayers(db, n, { seconds } = {}) {
  await resetAll(db);
  const r = seconds === undefined ? await admin(db, 'admin_start_registration') : await admin(db, 'admin_start_registration', seconds);
  if (!r.ok) throw new Error('start fehlgeschlagen: ' + JSON.stringify(r));
  for (let i = 1; i <= n; i++) {
    const j = await rpc(db, uid(i), 'join_round', `Spieler ${i}`);
    if (!j.ok) throw new Error('join fehlgeschlagen: ' + JSON.stringify(j));
  }
}

// Wie openWithPlayers, dann Anmeldung schliessen und Gruppen bilden.
export async function startedRound(db, n) {
  await openWithPlayers(db, n);
  await admin(db, 'admin_close_registration');
  const r = await admin(db, 'admin_form_groups');
  if (!r.ok) throw new Error('form_groups fehlgeschlagen: ' + JSON.stringify(r));
  return r;
}

export function expectedSizes(n) {
  if (n < 4 || n === 7) return null;
  let k = Math.ceil(n / 5);
  if (4 * k > n) k -= 1;
  if (k < 1 || n > 6 * k) return null;
  const base = Math.floor(n / k);
  const extra = n % k;
  return Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
}

export const POINTS = [10, 8, 6, 5, 4, 3, 2, 1];
export const pointsForRank = (r) => (r <= 8 ? POINTS[r - 1] : 1);
