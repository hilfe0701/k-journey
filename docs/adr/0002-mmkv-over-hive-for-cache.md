# 0002. MMKV over Hive for local cache

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `storage`, `offline`, `foundation`

## Context and Problem Statement

PRD v1.0 §11.1 listed **Hive / Firestore cache** for offline storage — a Flutter idiom. After pivoting to RN (ADR-0001), the team needed a fast, synchronous, key-value local store with these constraints:

* **Synchronous reads** for boot path (auth token, profile cache, MMKV mock flags) — avoids one-frame flash of unauthenticated UI.
* **Survives app process death** — the byeongpung is the user's 4-month artifact; losing local state once means user-visible regression.
* **Cheap JSON store** for arrays of completed mission IDs, bucket items, fired panel-unlock keys.
* **Bridge cost matters** — Reanimated 3 worklets and onboarding screens read on every render.

## Decision Drivers

* **Sync API** — `AsyncStorage` is async and creates frame-skip on boot. Hive (RN port `hive-rn`) is also async.
* **MMKV is RN-first.** `react-native-mmkv` is a JSI binding, no bridge. 30x faster than AsyncStorage by maintainer benchmarks.
* **Reactive read** via `useMMKVBoolean`/`useMMKVString` for dev-mock flag flows (ADR-0006).
* **No structured schema needed** — K-Journey persists ~12 keys (see `src/lib/storage.ts` `KEYS`).

## Considered Options

1. **MMKV** (`react-native-mmkv`)
2. **AsyncStorage** (the RN default)
3. **`hive-rn`** (Hive ported to RN — the closest match to the PRD's original idea)
4. **Realm** / **WatermelonDB** — full DB engines (overkill for K-Journey)

## Decision Outcome

**Chosen:** MMKV (`react-native-mmkv`), because it is the only sync-read, JSI-backed option, and K-Journey's persistence shape is key-value with small JSON blobs — exactly MMKV's sweet spot.

### Positive Consequences
* Boot path reads MMKV synchronously → no auth-flash on cold start (see also ADR-0007 cold-start splash gate).
* `useMMKVBoolean` reactive hook makes `dev:mockAuth` toggle work without prop drilling.
* `storage.getJson`/`setJson` (in `src/lib/storage.ts`) is a 6-line wrapper — no dependency lock-in.

### Negative Consequences
* No structured schema → drift risk. Mitigated by versioned key names (`profile:cache:v1`, `dev:missions:v1`) and an explicit migration framework (ADR-0023).
* MMKV's binary store is opaque — debugging from outside the app requires the MMKV inspector tool.
* JSI binding means MMKV must be installed before Expo Go can run it; we use Dev Client, not Expo Go (also fine for the project's RN config).

### Reversibility
Reversible at meaningful cost. Migration to AsyncStorage would be straightforward (same KV shape); migration to a DB engine would require a new data model and tests. Estimate: 1–2 PRs.

## Pros and Cons of the Options

### MMKV
* **+** Sync read, JSI, fast.
* **+** Battle-tested by Tencent at scale.
* **−** Custom native module → can't run in Expo Go.

### AsyncStorage
* **+** Default, no install pain.
* **−** Async only → boot-flash visible.
* **−** Slower at 200+ items.

### `hive-rn`
* **+** Closest to original PRD language.
* **−** Smaller maintainer base on the RN port; async API.

### Realm / WatermelonDB
* **+** Reactive queries.
* **−** Massive overkill for ~12 KV slots.

## Links

* **PRD:** §11.1, §11.2 (offline-first contract)
* **Code:** `src/lib/storage.ts` (KEYS + wrapper), `package.json` (`react-native-mmkv`)
* **Related ADRs:** [ADR-0006](0006-dev-mock-bypass-pattern.md) (uses `useMMKVBoolean`), [ADR-0023](0023-mmkv-key-versioning-migration.md) (migration framework)
* **External:** [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
