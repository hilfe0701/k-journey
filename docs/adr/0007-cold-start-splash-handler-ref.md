# 0007. Cold-start splash handler ref

* **Status:** accepted (retroactive)
* **Date:** 2026-05-06 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `boot`, `routing`, `ux`

## Context and Problem Statement

Expo Router persists the last route across cold starts (its navigation state restoration is on by default). For K-Journey this caused a UX regression: a user who quit the app while on `/(tabs)/byeongpung` would, on next launch, jump directly to byeongpung **without** the splash → era-aware loading flicker that establishes the era's identity.

The splash isn't decoration — it's the first ~700ms where the era theme initialises and the byeongpung's *current opacity per panel* is computed. Skipping it produced a cold-start where the byeongpung's reveals "popped" on next frame.

## Decision Drivers

* Need exactly one splash trip per *process boot*, regardless of which route restoration lands on.
* Cannot use a module-level boolean (would persist across Fast Refresh in dev).
* Must not disable Expo Router's state restoration (it's the right default for deep links).

## Considered Options

1. **`coldStartHandledRef` in `AuthGate`** (chosen)
2. **Disable Expo Router restoration entirely**
3. **Persist last-route → splash-required logic in MMKV**

## Decision Outcome

**Chosen:** A React ref (`coldStartHandledRef`) in `AuthGate` (or root `_layout`). On first mount it sets itself true and forces a one-time redirect through `/splash`, after which the restored route resumes.

### Positive Consequences
* Splash + era theme load runs exactly once per process boot.
* Expo Router restoration stays on → deep-link recovery still works.
* Ref is process-scoped → Fast Refresh doesn't trip it; only a real cold start does.

### Negative Consequences
* Adds an extra route hop on every cold start (sub-100ms; invisible).
* If anyone removes this ref thinking it's "unused state", the regression returns silently. Hence this ADR + comment in code.

### Reversibility
Trivially reversible by removing the ref. The cost is the UX regression returns.

## Pros and Cons of the Options

### `coldStartHandledRef`
* **+** Surgical, ~5 lines, no architecture change.
* **−** Easy to mistake as "unused" — needs ADR/code comment.

### Disable restoration
* **+** No ref bookkeeping.
* **−** Deep-link recovery breaks.

### MMKV-persisted flag
* **+** Survives JS state.
* **−** Persists across cold starts → would need explicit reset on app launch — circular.

## Links

* **Memory:** `project_expo_router_nav_persistence.md`
* **Code:** `app/_layout.tsx` (the AuthGate / `coldStartHandledRef`)
* **CLAUDE.md** does not currently lock this — *recommended follow-up*: add it to NEVER list ("NEVER remove `coldStartHandledRef` without re-evaluating cold-start UX").
* **External:** [Expo Router navigation state](https://docs.expo.dev/router/reference/state-management/)
