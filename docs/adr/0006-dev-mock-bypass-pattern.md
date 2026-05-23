# 0006. Dev-mock bypass pattern (`isDevMock`)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `dev-experience`, `testing`, `firebase`

## Context and Problem Statement

K-Journey needs realistic full-flow testing on the iOS simulator **without** completing the Firebase prod project, App Store account, or Apple Sign-In capability dance for every contributor. Simulator-side Apple Sign-In is also flaky (`project_open_decisions_2026_05_05.md`).

Solution: a *dev-mock* path that, when toggled, makes every Firestore mutator write to **MMKV instead**, and makes `useAuth` return a fixture user. The toggle is a single MMKV boolean: `dev:mockAuth` (CLAUDE.md `KEYS.devMockAuth`). A `[Dev] Skip auth` button on the sign-in screen flips it.

Gated by `__DEV__` so this branch is *literally compiled out* of release builds.

## Decision Drivers

* Sim QA must be possible without Firebase config wiring.
* Must coexist with the real Firebase path — same component code, branched at the lib layer.
* Must not violate "members-only / no anonymous" (ADR-0014). Dev-mock is *not* anonymous auth in prod — it cannot run in a release build.

## Considered Options

1. **`isDevMock()` branch in every mutator** (chosen)
2. **Separate dev / prod `firebase.ts`** swapped via build flag
3. **MSW-style Firebase mock at SDK level**
4. **Never mock — use Firebase Emulator Suite for dev**

## Decision Outcome

**Chosen:** `isDevMock()` branch inside `src/lib/firebase.ts` plus reactive `useMMKVBoolean(KEYS.devMockAuth)` in `useAuth`. Each mutator (sign-in, profile update, mission complete, bucket CRUD) checks `isDevMock()` and writes to MMKV instead of Firestore.

### Positive Consequences
* Sim QA from a clean `npm install` → tap *[Dev] Skip auth* → full app in 30 seconds. No Firebase, no Xcode signing.
* The same UI code path runs in both modes — UI bugs reproduce under both.
* `__DEV__` gating means **zero** dev-mock surface in release JS bundle.

### Negative Consequences (and the lesson)
* **Every new async mutator MUST add an `isDevMock()` branch** or it silently queues to Firestore (which has no project to talk to in dev-mock) and hangs forever. This caused a real incident — see `feedback_devmock_mutator_required.md` memory. The fix is procedural: code review checklist + this ADR.
* MMKV's dev-mock data persists across simulator reboots until `signOut` clears it. *Feature*, not bug — but worth knowing.

### Reversibility
Reversible per-mutator; the branch is a 3-line `if (isDevMock()) { /* MMKV */ return; }`. Removing the pattern altogether would mean re-architecting QA flow.

## Pros and Cons of the Options

### `isDevMock()` branch in mutators
* **+** UI code identical between modes.
* **+** No build-time configuration.
* **−** Every new mutator must remember the branch (procedural risk).

### Separate dev / prod firebase.ts
* **+** No `isDevMock()` clutter.
* **−** Bundler config + branch coverage harder.

### MSW-style mock at SDK level
* **+** Single intercept point.
* **−** `@react-native-firebase/*` modular API is not as easy to intercept as `fetch`.

### Firebase Emulator only
* **+** Real Firestore semantics.
* **−** Requires Firebase project setup for every dev — defeats the rationale.

## Links

* **Project rules:** `CLAUDE.md` MUST #6 (phase computation references the same pattern), MUST #14 (`claimPanelUnlock` reset on dev-mock signOut)
* **Code:** `src/lib/firebase.ts:50` (`isDevMock`), `src/hooks/useAuth.ts` (`useMMKVBoolean(KEYS.devMockAuth)`), `app/(onboarding)/sign-in.tsx` (Dev button), `src/lib/storage.ts` (KEYS for `devMockAuth`, `devMockMissions`, `devMockBuckets`)
* **Memory:** `feedback_devmock_mutator_required.md` (the spinner incident)
* **Related ADRs:** [ADR-0002](0002-mmkv-over-hive-for-cache.md), [ADR-0012](0012-async-mutator-error-contract.md) (error contract still applies to mock path), [ADR-0014](0014-anonymous-auth-removed.md) (dev-mock ≠ anonymous)
