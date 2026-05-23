# 0011. Single-source completion aggregation (`aggregateCompletions`)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-05 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `missions`, `bucket`, `data-flow`

## Context and Problem Statement

K-Journey has two completion sources that *both* roll up into the byeongpung panel-unlock threshold:

* Have-To missions (`useCompletedMissions`)
* Want-To bucket items (`useBuckets` → completed items inside each bucket)

Originally each callsite (`Home.tsx`, `byeongpung.tsx`, `gallery.tsx`) computed its own total. Inevitably, they drifted: one screen counted bucket items, another didn't; the panel-unlock threshold and the byeongpung reveal calculation used different numbers; the gallery showed a third.

## Decision Drivers

* The byeongpung reveal % is the brand's hero — drift makes the user feel the app is lying to them.
* Threshold math is in one place (panel-unlock); reveal math should live in the same place.
* Pure-function-testable.

## Considered Options

1. **`aggregateCompletions(missions, buckets)` pure helper + `useTotalCompletions` hook** (chosen)
2. **Compute totals in each consumer** (status quo, rejected)
3. **Reactive selector library (Reselect / Zustand)** — adds a dependency

## Decision Outcome

**Chosen:** `aggregateCompletions` pure function in `src/lib/completions.ts`. Returns `{ missionCount, bucketItemCount, total }`. The hook wrapper `useTotalCompletions` composes `useCompletedMissions` + `useBuckets` and calls the helper.

### Positive Consequences
* Panel-unlock threshold, byeongpung reveal %, and gallery summary all read the same numbers.
* Pure-function tests in `src/lib/__tests__/completions.test.ts` cover edge cases (0/0, 0/many, threshold boundary).
* New consumers just call the hook.

### Negative Consequences
* If a future feature needs a *different* aggregation (e.g. "missions per category"), they must add a new helper rather than reusing this one.

### Reversibility
Helper is pure, ~10 LOC. Trivial to refactor or replace.

## Pros and Cons of the Options

### `aggregateCompletions` + hook
* **+** One source, easy testing.
* **−** Hook composition order matters (must wait for both snapshots).

### Per-consumer compute
* **+** No abstraction.
* **−** Drift inevitable.

### Reselect/Zustand
* **+** Memoized selectors.
* **−** Library lock-in for a 10-LOC problem.

## Links

* **PRD:** §6.2 (panel unlock threshold), §6.4, §10.1 (gallery summary)
* **Project rules:** `CLAUDE.md` MUST #16
* **Code:** `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, `app/(tabs)/byeongpung.tsx`, `app/(tabs)/index.tsx`, `app/gallery.tsx`
* **Tests:** `src/lib/__tests__/completions.test.ts`
* **Related ADRs:** [ADR-0009](0009-single-fire-panel-unlock.md), [ADR-0010](0010-housing-applies-to-tagging.md)
