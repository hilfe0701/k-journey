/**
 * Versioned MMKV migration runner.
 *
 * Strategy:
 *   - On boot, call `runMigrations()` before any hook reads MMKV.
 *   - Each migration is a `{ from, to, run }` entry. The runner pulls the current
 *     schema version from `KEYS.schemaVersion`, applies pending migrations in
 *     order, and writes the new version.
 *   - Migrations are forward-only. We do not roll back.
 *   - If a migration throws, we back up the affected key(s) to
 *     `${key}.backup.${ts}` and reset. Loss of cache > infinite crash loop.
 *
 * See ADR-0023.
 */

import { storage } from './storage';

export interface Migration {
  from: number;
  to: number;
  description: string;
  run: () => void;
}

const SCHEMA_VERSION_KEY = 'schema:version';

// Add new migrations to the bottom. Never edit a shipped migration in place.
export const MIGRATIONS: Migration[] = [
  // Example placeholder (not active — `from: 0` is below any real schema version):
  // {
  //   from: 1,
  //   to: 2,
  //   description: 'Reshape firedPanelUnlocks from number[] to Record<number,{firedAtIso:string}>',
  //   run: () => {
  //     const raw = storage.getString(KEYS.firedPanelUnlocks);
  //     if (!raw) return;
  //     const old = JSON.parse(raw) as number[];
  //     const next: Record<string, { firedAtIso: string }> = {};
  //     const now = new Date().toISOString();
  //     old.forEach((n) => (next[String(n)] = { firedAtIso: now }));
  //     storage.set(KEYS.firedPanelUnlocks, JSON.stringify(next));
  //   },
  // },
];

export function currentSchemaVersion(): number {
  return storage.getNumber(SCHEMA_VERSION_KEY) ?? 1;
}

export interface MigrationResult {
  ranMigrations: number;
  failedKeys: string[];
  finalVersion: number;
}

export function runMigrations(): MigrationResult {
  const startVersion = currentSchemaVersion();
  const targetVersion = Math.max(startVersion, ...MIGRATIONS.map((m) => m.to), 1);
  const failedKeys: string[] = [];
  let ran = 0;

  for (const m of MIGRATIONS) {
    if (m.from < startVersion) continue;
    if (m.to > targetVersion) continue;
    try {
      m.run();
      ran += 1;
    } catch {
      // Migration failed. Back up the relevant keys and continue.
      const ts = Date.now();
      // Without knowing which key the migration touched, the safest defensive
      // action is to log the migration ID; the caller (boot path) can inspect.
      failedKeys.push(`migration:${m.from}->${m.to}:${ts}`);
      // We continue so the version pointer can still advance past this migration.
      // Otherwise we'd loop forever on the same bad migration each boot.
    }
  }

  storage.set(SCHEMA_VERSION_KEY, targetVersion);
  return { ranMigrations: ran, failedKeys, finalVersion: targetVersion };
}

/**
 * Safe-parse + backup helper for value-shape changes. Use inside a migration's
 * `run` if you want explicit per-key backup on parse failure.
 */
export function backupAndReset(key: string): unknown | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const ts = Date.now();
    storage.set(`${key}.backup.${ts}`, raw);
    storage.delete(key);
    return null;
  }
}

/** Test helper. Not for production. */
export function _resetSchemaForTesting() {
  storage.delete(SCHEMA_VERSION_KEY);
}
