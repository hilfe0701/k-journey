# 0009. Single-fire panel unlock gate (`claimPanelUnlock`)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-05 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `byeongpung`, `notifications`, `state`

## Context and Problem Statement

When the user completes a mission that crosses a panel-unlock threshold (every 6 completions), three things fire:

1. Full-screen `MissionCompleteOverlay` celebration animation.
2. `panel_unlock` PostHog event.
3. Local push notification: *"A new panel emerges"*.

**Bug surface:** without a gate, a user who toggles a mission off and back on would re-fire the entire celebration, double-count `panel_unlock` events, and get duplicate notifications. Equally bad: if the same mission is completed across two devices, both would fire.

## Decision Drivers

* Panel unlock is meant to feel like a *milestone* — re-firing cheapens it.
* Analytics correctness: `panel_unlock` count must equal the number of unique panels actually unlocked, not the number of times the threshold was crossed in either direction.
* No reliance on server state — must work offline (the mission completion path queues to Firestore but the celebration is local).

## Considered Options

1. **MMKV-persisted `firedPanelUnlocks` array** with `claimPanelUnlock(n)` returning `true` only first time (chosen)
2. **Firestore counter document** — server-authoritative
3. **Detect "first time" by comparing previous total to new total**
4. **Don't gate — accept double-fire as a UX quirk**

## Decision Outcome

**Chosen:** `claimPanelUnlock(panelNumber: number): boolean` in `src/lib/notifications.ts`. It reads `KEYS.firedPanelUnlocks` from MMKV, returns `false` if the panel is already in the array, otherwise appends and returns `true`. Callers fire the overlay + telemetry + notification only on `true`.

### Positive Consequences
* The first crossing of panel N feels like a milestone; subsequent toggles do not.
* Analytics matches the user's mental model — N panel unlocks events per user lifetime, max 8.
* Works fully offline; no Firestore round-trip.
* Cleared on dev-mock signOut (along with `dev:mockAuth`) so QA flows reset cleanly.

### Negative Consequences
* If a user signs out + back in on the **same** device (prod) they'd hit the same array — but `claimPanelUnlock` is keyed per device, not per user. **Trade-off accepted**: panel unlocks are a per-device sensory experience; cross-device unique-firing would require server state which we've explicitly chosen to avoid for now.
* Re-installing the app resets the array → user would see celebration again on first re-completion. **Considered fair** since fresh install ≈ fresh device-side experience.

### Reversibility
Reversible. The gate is one helper function; removing it returns to "fire every time".

## Pros and Cons of the Options

### MMKV array + `claimPanelUnlock`
* **+** Offline, simple, fast.
* **−** Per-device, not per-user across devices.

### Firestore counter
* **+** Cross-device unique fire.
* **−** Requires online; transaction complexity; adds Firestore reads to a hot path.

### Compute from totals
* **+** No new state.
* **−** Doesn't survive an MMKV cache wipe; ambiguous when totals jump by >1.

### No gate
* **+** Zero state.
* **−** UX regression on the brand's hero moment.

## Links

* **PRD:** §6 (gamification), §6.5 (single-fire spec), §7.4 (notification)
* **Code:** `src/lib/notifications.ts:106-131` (`claimPanelUnlock`, `firePanelUnlock`), `src/lib/storage.ts` (`KEYS.firedPanelUnlocks`)
* **Project rules:** `CLAUDE.md` MUST #14
* **Tests:** `src/lib/__tests__/notifications.test.ts` (duplicate-call returns `false`)
* **Related ADRs:** [ADR-0011](0011-single-source-completion-aggregation.md) (the threshold check itself uses aggregateCompletions), [ADR-0006](0006-dev-mock-bypass-pattern.md) (cleared on signOut)
