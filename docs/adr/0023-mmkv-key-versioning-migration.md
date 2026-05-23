# 0023. MMKV key versioning & migration

* **Status:** proposed
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `storage`, `migration`

## Context and Problem Statement

`src/lib/storage.ts` defines `KEYS` with version suffixes (`profile:cache:v1`, `dev:missions:v1`, `panel:fired:v1`). Today, these are *forever v1* — there is no migration runner. If a key's value shape ever changes, the only options are:

* Bump the suffix to `:v2` and abandon `:v1` data (silent loss).
* Hand-write migration in the consuming hook (drift risk).

Neither is acceptable once the app ships. The third option, *zero-migration ever*, only works if data shapes never evolve — which is unrealistic for a product that will grow.

## Decision Drivers

* Forward compatibility: a shipped app might receive an update that needs to re-shape `panel:fired` from `number[]` to `Record<number, { firedAtIso: string }>`.
* Resilience: a corrupted JSON value should not infinite-loop a crash.
* Observability: migration failures should be captured.

## Considered Options

1. **Versioned migration runner with backup-on-failure** (chosen)
2. **Auto-migrate via key-suffix bumps and abandon old data**
3. **Never migrate; treat MMKV as cache only and force re-fetch from Firestore**

## Decision Outcome

**Chosen:** Add `src/lib/storage/migrations.ts` with a typed `Migration[]` array, run via `runMigrations()` at app boot (before any hook reads MMKV).

```typescript
type Migration = { from: number; to: number; run: () => void };
const SCHEMA_KEY = 'schema:version';
const MIGRATIONS: Migration[] = [
  // example: { from: 1, to: 2, run: () => { /* reshape panel:fired */ } }
];
export function runMigrations() { /* read SCHEMA_KEY, run pending migrations in order */ }
```

Failure policy:
* Each migration is wrapped in try/catch. On failure, the offending key is *backed up* to `${key}.backup.${ts}` and *reset* (better data loss than a forever-crashing app). Crashlytics records the failure.
* The new schema version is written even on partial failure to prevent re-run loops.

### Positive Consequences
* Shippable evolution of stored shapes.
* Corrupted MMKV values trigger a one-time backup + reset rather than a crash loop.
* Migration tests in `src/lib/storage/__tests__/migrations.test.ts` catch regressions.

### Negative Consequences
* Migrations are forward-only (no rollback). Acceptable for a single-device cache layer.
* **Backup key retention policy (Wave 2 — 2026-05-14)**: backup keys (`<original-key>:bak:v<n>`) are retained for **90 days** from the migration timestamp, then pruned by a foreground sweep on app open. The 90-day window allows users who skip multiple versions to still recover via a "rescue" build that replays migrations in sequence. Prune logic: scan all `:bak:` keys at startup, delete any older than `kstNow() - 90 days`. Telemetry: `mmkv_backup_pruned` event with count + total bytes freed.
* **Corruption user surface (Wave 2 boost)**: when the migration runner detects unparseable JSON in a target key (vs the expected schema), the runner moves the corrupted blob to `<key>:corrupted:<isoTimestamp>` (preserves for forensics) and falls through to the empty default. The user sees no error in the normal flow. **However**, if multiple keys corrupt simultaneously (≥ 3 in one launch), surface T2 modal `Some saved data couldn't be read` body `Please contact support@kjourney.app — your account is fine, but a few local items may need to be re-entered.` Modal dismissable; Crashlytics records `mmkv_multi_corruption` with key list (no values, PII safe). This is the only user-facing message from the migration layer.
* Backup keys accumulate over time. **Pre-Wave 2 status was "follow-up"; Wave 2 sets the policy above.**

### Reversibility
The runner itself is reversible by deleting it. Individual migrations once applied are not.

## Pros and Cons of the Options

### Versioned migration runner
* **+** Clean shipping path.
* **+** Failure-resilient.
* **−** New mechanism to maintain.

### Suffix bump + abandon
* **+** No new code.
* **−** Silent user data loss every shape change.

### No migration; refetch from Firestore
* **+** Simple.
* **−** Breaks offline-first; not all MMKV keys have a Firestore origin (e.g. `phase:override`, `firedPanelUnlocks`).

## Links

* **Code (target):** `src/lib/storage/migrations.ts` (new), `src/lib/storage.ts` (KEYS), `app/_layout.tsx` (boot path)
* **Tests:** `src/lib/storage/__tests__/migrations.test.ts`
* **Related ADRs:** [ADR-0002](0002-mmkv-over-hive-for-cache.md) (KV substrate)
