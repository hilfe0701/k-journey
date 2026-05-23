# Testing

> Test strategy, current coverage, and the manual QA checklists. Authority: [ADR-0020](adr/0020-jest-with-rn-mocks.md). Round-2 expansion of tests is tracked under Plan Part J.

## 1. Test pyramid (current state)

```
                ┌──────────────────┐
                │  Manual sim QA   │   (15 scenarios — §4)
                │   real-device QA │   (V1.1+)
                └──────────────────┘
              ┌────────────────────────┐
              │  Integration / hooks   │   (planned in Part J: useAuth, share)
              └────────────────────────┘
            ┌────────────────────────────┐
            │   Unit (pure functions)    │   (current: 7 files, 52 tests)
            └────────────────────────────┘
```

K-Journey deliberately invests in the bottom of the pyramid (pure-function tests are fast and catch the biggest regressions) and uses **manual sim QA** as the integration tier until V1.1.

## 2. Unit tests

Location: `src/**/__tests__/*.test.ts`. Runner: Jest with custom RN module mocks in `jest.setup.js`.

### 2.1 Current coverage (52 tests across 7 files)

| File | What it covers |
|---|---|
| `src/hooks/__tests__/usePhase.test.ts` | `calcPhase` boundary conditions, override |
| `src/lib/__tests__/notifications.test.ts` | `claimPanelUnlock` duplicate-call protection |
| `src/lib/__tests__/completions.test.ts` | `aggregateCompletions` zero/many/threshold |
| `src/data/__tests__/missions.test.ts` | mission schema invariants |
| `src/data/__tests__/universities.test.ts` | university list integrity |
| `src/components/byeongpung/__tests__/panelReveal.test.ts` | `panelReveal(i, total)` clamp math |
| `src/components/byeongpung/__tests__/motifs.test.ts` | era → image map integrity |

### 2.2 Round-2 expansion (Part J, target 85+ tests)

| New file | What it covers | ADR |
|---|---|---|
| `src/lib/__tests__/dates.test.ts` | KST helpers: midnight, Sydney call, DST locale, edge dates | ADR-0022 |
| `src/lib/__tests__/validation.test.ts` | `validateDates` — 7 error codes + happy path | — |
| `src/lib/storage/__tests__/migrations.test.ts` | v1→v2 sample, corruption backup-and-reset | ADR-0023 |
| `src/lib/__tests__/clockGuard.test.ts` | ±2-day jump detection, normal time flow | ADR-0022 |
| `src/lib/__tests__/telemetry.test.ts` | `trackOnce` dedupe; `track` happy path | ADR-0004 |
| `src/lib/__tests__/permissions.test.ts` | `getPermissionState` transitions | ADR-0015 |
| `src/lib/__tests__/share.test.ts` | viewRef null, captureRef fail, Sharing unavailable | — |
| `src/hooks/__tests__/useAuth.test.ts` | `ensureUserDocument` failure handling (Part E.4) | ADR-0012 |

### 2.3 Strengthening existing tests

| File | Additions |
|---|---|
| `usePhase.test.ts` | 9 new KST boundary scenarios (Part E.1) |
| `notifications.test.ts` | `rescheduleAllNotifications` with mocked clock — D-30/14/7 fire correctly, past dates skipped |
| `completions.test.ts` | housing-aware denominator interaction |
| `missions.test.ts` | `missionsForHousing` filter unit |

## 3. Firestore Rules tests

Authority: [ADR-0021](adr/0021-firestore-rules-acl-model.md). Tooling: `@firebase/rules-unit-testing` + Firebase emulator.

### 3.1 Setup

```bash
npm install --save-dev @firebase/rules-unit-testing firebase-tools
firebase emulators:start --only firestore
```

### 3.2 Scenarios (PR-blocking)

| # | Setup | Action | Expected |
|---|---|---|---|
| R1 | Anonymous (no token) | Read `users/anyuid` | DENY |
| R2 | Apple-signed-in (uid=A) | Read `users/A/missions/m1` | ALLOW |
| R3 | Apple-signed-in (uid=A) | Read `users/B/missions/m1` | DENY |
| R4 | Apple-signed-in (uid=A) | Write `universities/Yonsei` | DENY |
| R5 | Apple-signed-in (uid=A) | Read `universities/Yonsei` | ALLOW |
| R6 | Anonymous | Read `emergency/police` | ALLOW |
| R7 | Apple-signed-in (uid=A) | Write a 200 KB blob to `users/A` | DENY (size limit 100 KB) |
| R8 | Custom-token with provider="anonymous" | Read `users/A` | DENY |
| R9 | Apple-signed-in (uid=A) | Read `_admin/deletionLog/{ulid}` | DENY (admin-only per ADR-0033 §C) |
| R10 | Apple-signed-in (uid=A) with `_meta.deletionRequestedAt` set | Read own `users/A/profile` | ALLOW (soft-delete recovery carve-out per ADR-0033) |
| R11 | Apple-signed-in (uid=A) with `_meta.deletionRequestedAt` set | Write `users/A/profile.name = "X"` | DENY (soft-delete blocks writes other than `_meta.deletionRequestedAt` clear) |
| R12 | Apple-signed-in (uid=A) | Write `_admin/exportLog/{ulid}` | DENY (server-only — Cloud Function writes via service-account auth) |

Run via `firebase emulators:exec --only firestore "npm test:rules"` in CI.

## 4. Manual sim QA — 15 scenarios

Original 7 scenarios (Phase B QA pass 2026-05-06) plus 8 new scenarios introduced by Round 2.

| # | Scenario | Pass criteria |
|---|---|---|
| 1 | Fresh sign-in → full onboarding → first mission → panel 1 unlock | Overlay fires, telemetry `panel_unlock` recorded, notification scheduled |
| 2 | Cold start with previously persisted route | Splash plays once (`coldStartHandledRef`), then resumes target route |
| 3 | Dev-mock signOut | MMKV `devMockMissions` + `devMockBuckets` + `firedPanelUnlocks` cleared |
| 4 | Era switch (Joseon → Goryeo) in More tab | Panel artwork swaps, completed count unchanged, telemetry `era_switch` |
| 5 | Bucket create → add 3 items → toggle item complete | Counts update, panel-unlock threshold respected via aggregate |
| 6 | Share byeongpung | Image captures, share sheet opens, telemetry `byeongpung_share` |
| 7 | Save byeongpung to library | Permission prompt resolves; image appears in Photos |
| 8 **(new)** | KST midnight phase transition | Set sim time near KST 23:59 → phase boundary; phase changes at KST 00:00 regardless of system locale |
| 9 **(new)** | Clock manipulation | Set sim time +5 days → complete mission. Server timestamp wins; D-Day in UI reflects intended dates, not fake clock. |
| 10 **(new)** | Arrival == departure | onboarding accepts; phase 2 throughout |
| 11 **(new)** | Arrival > departure | onboarding shows `arrival_after_departure` error and blocks |
| 12 **(new)** | Push permission denied → granted later | Re-foreground app → `usePushPermissionWatcher` reschedules notifications |
| 13 **(new)** | PNG load failure simulation | Rename one byeongpung asset before build → `<PanelImage>` shows ink-color fallback |
| 14 **(new)** | VoiceOver on full happy path | Every interactive control announces; mission complete triggers live-region |
| 15 **(new)** | Reduce Motion on, mission complete | Cross-fade overlay (no 4-stage animation) |

Each scenario logged in PR / Issue with screenshot + status. A scenario failing **blocks** the release per `docs/RELEASE.md`.

## 5. Test commands

```bash
# Quick check (typecheck + lint + jest)
npm run check

# Just jest
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Firestore Rules
firebase emulators:exec --only firestore "npm test:rules"
```

## 6. CI

Currently local-only. Adding GitHub Actions is V1.1 scope.

CI gate (when wired): `npm run check` + rules tests + bundle-size threshold check.

## 7. Bug bash schedule

* Before each external beta release: full 15-scenario sim QA pass.
* Before App Store submission: same on real device (V1.1+).
* Quarterly: visual regression sweep (DESIGN.md tokens, byeongpung panels, dynamic type ±2).

## 8. Known gaps (V1.1 plan)

* No E2E framework (Detox / Maestro) — manual scenarios fill the gap.
* No visual regression (snapshot images) — manual screenshot review only.
* No load testing — Firestore quotas should be tested under simulated 100x MAU before SCALE-tier launch.
* No security pentest — V2.0 if user base / data sensitivity grows.

## 9. Usability checklist (Wave 2 — 2026-05-14)

15 manual scenarios run by a human tester (not automated). Used pre-release and during dogfooding. N=3+ testers per cycle, English-speaking exchange-student demographic preferred.

**Format**: each scenario captures (a) elapsed time from "open app" to scenario completion, (b) any moment of confusion (note as "↯"), (c) screenshots if visual regression suspected. Log in `docs/TESTING_LOG.md` (per-cycle, gitignored or low-frequency commits).

| # | Scenario | Pass criteria |
|---|---|---|
| **U1** | **Cold-start to first mission tap** — fresh install → sign in → onboarding → home → tap any mission | ≤ 3 minutes elapsed; no ↯ during sign-in or onboarding |
| **U2** | **Aha moment comprehension** — observe the first-launch tour (PRD §4.6) | Tester can articulate "what this app is" in 1 sentence after dismissing the modal |
| **U3** | **Empty state on home** — sign in fresh, do not complete any mission, scroll home | First missions visible without scroll; tester knows where to start in ≤ 5 s |
| **U4** | **Mission complete + celebration** — complete one mission | 4-stage choreography plays; haptic fires (Light); copy reads `Panel N unlocked` if threshold crossed |
| **U5** | **Network offline mission complete** — airplane mode → tap mission complete | Toast `No connection. Your work is saved on this device.` + header dot. Mission marks complete optimistically. |
| **U6** | **Network reconnect with pending writes** — disable airplane mode after U5 | Toast `Synced.` (only this one positive toast); dot disappears. |
| **U7** | **Photo upload success** — tap "Add photo" on a mission, pick from library | Permission priming card if first time → process → upload progress visible → photo renders. Total ≤ 10 s on Wi-Fi. |
| **U8** | **Photo upload failure recovery** — start upload, kill Wi-Fi mid-upload | T2 modal `Couldn't upload photo` with `Try again` / `Skip photo`. Skip → mission stays complete, no photo. |
| **U9** | **Permission denied recovery** — deny push during priming → later attempt to enable | Settings → Notifications → toggles disabled with hint → tap "Open Settings" → flip toggle → return to app → toggles enabled, no app restart needed |
| **U10** | **Date change** — Settings → Profile → change departure date 2 weeks earlier | Confirm dialog → after confirm: phase recompute correct, push reschedule confirmed (verify in iOS Settings → K-Journey → Notifications timeline) |
| **U11** | **Era change preserves progress** — Settings → Era → change to a different era | Byeongpung swaps to new era PNG within ~200 ms; completion count unchanged |
| **U12** | **Account deletion two-stage** — Settings → Account → Delete account → both confirms | Land on sign-in screen; email arrives within 5 min with recovery link |
| **U13** | **Account recovery** — within 30-day window, sign in with same Apple ID | Welcome-back modal with "Cancel deletion" → tap → toast `Account restored.` |
| **U14** | **Data export** — Settings → Account → Export my data | ZIP arrives via email within 10 min; contents match expected schema (profile.json + missions.json + buckets.json + photos/ + byeongpung_current.png) |
| **U15** | **VoiceOver core flows** — enable VoiceOver → navigate Home → MissionCard → Mark complete → ByeongpungStrip | All key elements announced per PRD §11.6.2; mission complete announces `Panel N unlocked` after stage 4 |

### 9.1 Acceptance criteria for the cycle

* ≥ 14 of 15 scenarios pass without ↯
* No critical regressions (any ↯ = code review before next cycle)
* Average U1 time ≤ 3 min across all testers
* Tester verbal feedback captured in `docs/TESTING_LOG.md`

### 9.2 Assistive tech check (every cycle)

* iOS VoiceOver — U15 specifically; spot-check U3 + U4 + U10
* iOS Dynamic Type +1 → +2 → no broken layouts on home / settings / mission detail
* iOS Reduce Motion ON → mission complete cross-fade (250 ms) instead of 4-stage; haptic still fires (Light per ADR-0030)
* Android TalkBack — same as VoiceOver, check announcement order matches

### 9.3 When to run

* Before every release tagged ≥ minor (X.Y.0+)
* After any change to: onboarding flow, mission complete choreography, settings, account flows, photo pipeline, error tier router

## 10. Links

* [ADR-0020](adr/0020-jest-with-rn-mocks.md)
* [ADR-0021](adr/0021-firestore-rules-acl-model.md)
* `package.json` (`scripts.check`)
* `jest.setup.js`
* `docs/RELEASE.md` (release checklist references this doc)
