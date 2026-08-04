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

import { KEYS, setJson, storage } from './storage';
import type { Bucket, DevMockCompletedDoc, UserProfile } from './firebase';
import { normalizeUserProfile } from './profileCompat';

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
  {
    from: 1,
    to: 2,
    description: 'Normalize the unified profile and preserve legacy culture progress',
    run: () => {
      const profile = backupAndReset(KEYS.profileCache);
      if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
        setJson(KEYS.profileCache, normalizeUserProfile(profile as Partial<UserProfile>));
      }

      mergeLegacyMissionProgress();
      mergeLegacyBuckets();
    },
  },
];

const LEGACY_MISSIONS_KEY = 'dev:missions:v1';
const LEGACY_BUCKETS_KEY = 'dev:buckets:v1';

function mergeLegacyMissionProgress(): void {
  const current = asArray<DevMockCompletedDoc>(backupAndReset(KEYS.completedMissionsCache));
  const legacy = asArray<DevMockCompletedDoc>(backupAndReset(LEGACY_MISSIONS_KEY));
  if (legacy.length === 0) return;

  const merged = new Map<string, DevMockCompletedDoc>();
  for (const item of [...current, ...legacy]) {
    if (!item || typeof item.missionId !== 'string' || !item.missionId) continue;
    if (merged.has(item.missionId)) continue;
    merged.set(item.missionId, {
      missionId: item.missionId,
      completedAtIso:
        typeof item.completedAtIso === 'string'
          ? item.completedAtIso
          : new Date(0).toISOString(),
    });
  }
  setJson(KEYS.completedMissionsCache, [...merged.values()]);
}

function mergeLegacyBuckets(): void {
  const current = asArray<Bucket>(backupAndReset(KEYS.bucketsCache));
  const legacy = asArray<Bucket>(backupAndReset(LEGACY_BUCKETS_KEY));
  if (legacy.length === 0) return;

  const merged = new Map<string, Bucket>();
  for (const bucket of [...current, ...legacy]) {
    if (!bucket || typeof bucket.id !== 'string' || !bucket.id) continue;
    if (!merged.has(bucket.id)) merged.set(bucket.id, bucket);
  }
  setJson(KEYS.bucketsCache, [...merged.values()]);
}

function asArray<T>(value: unknown | null): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

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
