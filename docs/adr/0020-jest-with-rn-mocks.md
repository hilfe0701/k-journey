# 0020. Jest with React Native mocks

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `testing`, `tooling`

## Context and Problem Statement

Testing an RN + Expo + Firebase + MMKV + Reanimated stack is *the* hard problem of the ecosystem. The team's choices were:

* Use a managed test runner like Vitest (no RN preset) or Jest (Expo-supported).
* Try to mount components in a virtual DOM (`@testing-library/react-native`) vs. test pure logic only.
* Mock every native module by hand, or use `jest-expo` preset.

The team's calendar pressure was high. The chosen approach prioritised **fast pure-logic tests** over **deep component integration**, with the goal of catching the highest-value regressions (phase calc, panel-unlock gate, completion aggregation, housing filter) without spending months on a full test pyramid.

## Decision Drivers

* Pure-logic tests catch the most damaging regressions (math + state machines).
* Native module mocks in `jest.setup.js` are a one-time cost.
* Component-mount tests are valuable but expensive at MVP scale.

## Considered Options

1. **Jest + manual mocks in `jest.setup.js`** (chosen)
2. **`jest-expo` preset** — Expo's official preset, more opinionated
3. **Detox for E2E only, no unit tests**
4. **Vitest** — fast but no RN preset

## Decision Outcome

**Chosen:** Jest with a custom `jest.setup.js` mocking the native modules we use (Firebase, MMKV, Notifications, MediaLibrary, etc.). Test pure functions and hooks; defer component-mount and E2E tests to V1.1+.

### Positive Consequences
* `npm test` runs in ~5s for ~52 tests.
* All MUST-do helpers (`calcPhase`, `panelReveal`, `claimPanelUnlock`, `aggregateCompletions`, `missionsForHousing`) have unit tests as the contract spec.
* No external test infrastructure required for CI.

### Negative Consequences
* Integration / component-mount / E2E coverage is light (~7 files total). Phase B QA was *manual sim* — fine for MVP, but every release adds manual QA load.
* Native module mocks can drift from real APIs; integration tests would catch that.
* Detox / Maestro for E2E is on the V1.1 roadmap.

### Reversibility
Reversible — could swap to `jest-expo` preset or add Detox later without throwing away the unit tests.

## Pros and Cons of the Options

### Jest + manual mocks
* **+** Fast, deterministic, customisable.
* **−** Native mocks can lag real API.

### `jest-expo` preset
* **+** Officially supported.
* **−** Less control over mock surface.

### Detox only
* **+** Real device coverage.
* **−** Slow, flaky, big infra lift.

### Vitest
* **+** Speed.
* **−** No RN preset; would need rolling our own.

## Links

* **Project rules:** `CLAUDE.md` MUST #18 (`npm run check`)
* **Code:** `jest.setup.js`, `package.json` (`jest` config), tests in `src/**/__tests__/`
* **Tests written:** 7 files, 52 tests (as of Phase B QA pass 2026-05-06)
* **Related ADRs:** [ADR-0023](0023-mmkv-key-versioning-migration.md) (migrations need tests), planned coverage expansion in Round 2 Part J
