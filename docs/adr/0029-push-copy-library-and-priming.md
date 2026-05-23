# 0029. Push notification copy library & permission priming

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `notifications`, `ux`, `microcopy`, `permissions`

## Context and Problem Statement

[ADR-0015](0015-behavior-triggered-push-only.md) locks **when** K-Journey sends push notifications: D-30 / D-14 / D-7 to departure, phase boundary crossings (1→2, 2→3, 3→4), and byeongpung panel unlocks. That's it. No daily, no weekly, no marketing.

But ADR-0015 says nothing about **what those notifications say**. Today the copy lives inline at the call site of `Notifications.scheduleNotificationAsync(...)` in `src/lib/notifications.ts`. As of 2026-05-14, the copies are placeholder strings written ad-hoc during implementation. They have not been:

* Reviewed against the brand voice (DESIGN.md §1 — `warm authority`, no urgency-scare).
* Validated for the English-first + Korean-parenthetical rule (ADR-0018) — push payload is not a natural place to inline 한국어 (떡볶이) but proper-noun rule still applies.
* Standardized in title vs body length (iOS truncates titles ~30 chars, body ~110 chars on lock-screen).
* Tested for VoiceOver pronunciation when announced from notification center.
* Considered against the **global user problem**: a user in Sydney receives "KST 9 AM" notifications at 11 AM (fine); a user visiting family in San Francisco receives them at 4 PM the previous day (also fine); a user in New York receives them at 7 PM (fine). But in a future state where users may travel further off the KST anchor, copy that says "Good morning" would be wrong.

A second, separate problem: **iOS push permission is requested cold** at the end of the dates onboarding screen. There is no priming UI explaining why the app wants this permission. Industry baseline grant rate for cold prompts is ~40%; primed prompts hit 60–70%. The PRD §1.2 KPI for `push_permission_state` grant rate is **60%**. Without a priming UI, hitting that KPI is unlikely.

## Decision Drivers

* PRD §1.2 KPI: push permission grant rate ≥ 60%.
* Brand voice from DESIGN.md §1 — push copy is a brand surface, not a transactional one.
* Single source of copy → reviewable, lintable, A/B-testable later.
* Copy must work for any KST-9-AM-anchored user regardless of their physical timezone (i.e. avoid "Good morning"-style time-of-day greetings).
* WCAG 2.1 AA — notification content must be readable when announced; no decorative emoji that interrupts speech.

## Considered Options

1. **Single copy library + permission priming UI** (chosen)
2. **Single copy library, cold permission prompt** — copy fixed, permission UX unchanged.
3. **Inline copy at call sites + priming UI** — permission UX fixed, copy ad-hoc.
4. **Status quo** — both ad-hoc.

## Decision Outcome

**Chosen:** Both halves of the problem are fixed in one ADR because they share an owner file and review cadence.

### Part A — Single push copy library

A new module: `src/lib/notifications/copy.ts` exports a typed object:

```ts
export const PUSH_COPY = {
  dDay30: { title: "30 days to your K-Journey", body: "Phase 1 missions are ready. Open to begin." },
  dDay14: { title: "Two weeks to departure", body: "Time to wrap up Phase 3. Open the journey." },
  dDay7:  { title: "One week left", body: "Phase 4 awaits. Save what you don't want to forget." },
  phase2Start: { title: "You've arrived", body: "Phase 2 is unlocked. Your first week starts here." },
  phase3Start: { title: "Settling in", body: "Phase 3 missions are now in your home." },
  phase4Start: { title: "Final stretch", body: "Phase 4 — gather what you want to remember." },
  panelUnlock: (n: number) => ({
    title: `Panel ${n} of 8 unlocked`,
    body: "Open the byeongpung to see your scroll grow.",
  }),
} as const;
```

`src/lib/notifications.ts` is the **only** caller of this module. Tests assert the structure and per-string length (≤ 30 chars title, ≤ 110 chars body) at compile-time-via-test. Copy review is a single PR diff.

The full enumerated catalog (with rationale, length, fire-conditions, KST policy, V2 mitigations) lives in `docs/PUSH_COPY.md`.

### Part B — Permission priming UI

A new screen-card component `<NotificationPriming />` shown **once**, between dates onboarding and the cold OS prompt:

* **Trigger**: After the user submits valid arrival + departure dates and `Notifications.getPermissionsAsync()` returns `undetermined`.
* **Content**:
  * Title: "Get reminders about milestones"
  * Body: "We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever."
  * CTA primary: "Allow notifications" (calls `Notifications.requestPermissionsAsync()`).
  * CTA secondary: "Not now" (sets MMKV `priming:dismissed:notifications` = true; user can re-enable from a future Settings screen).
* **Dismiss tracking**: PostHog `notification_priming_shown` and `notification_priming_response` events (`granted` | `dismissed`).
* **Re-priming**: If the user dismisses, do not show again until V1.1 Settings screen is shipped. Don't nag.

The OS-level prompt is only triggered from this screen. No other screen calls `requestPermissionsAsync` cold.

### Positive Consequences
* Copy review becomes a single-file PR diff — bikeshedding compressed.
* Length asserts catch lock-screen truncation in CI, not in customer reports.
* Priming UI raises grant rate toward the PRD KPI.
* `PUSH_COPY.panelUnlock(n)` is the only place a panel-unlock string is templated — no risk of "Panel 3" / "Panel #3" / "Panel three" drift.

### Negative Consequences
* Adding a localization layer later requires changing the export shape (string → keyed message). Tracked in Notes; acceptable for MVP English-only commitment (ADR-0018).
* Priming UI adds one screen to onboarding (~3 seconds added). Mitigated by skipping if user has already dismissed once.
* Copy is now a deployment artifact — A/B testing would require a code release. Acceptable for MVP; future work could move to a remote config.

### Reversibility
Reversible per part. Removing Part A means inlining the strings back at call sites — trivial. Removing Part B means re-routing the permission prompt to fire cold from the dates screen — one line in `app/(onboarding)/dates.tsx`.

## Pros and Cons of the Options

### Single copy library + priming
* **+** Fixes both halves with one review cycle.
* **+** Maximizes KPI alignment.
* **−** Adds a screen.

### Library only, cold prompt
* **+** Cheaper.
* **−** Misses the PRD §1.2 grant-rate KPI risk.

### Inline copy + priming
* **+** Cheap on the copy side.
* **−** Copy will drift; no review surface.

### Status quo
* **+** Zero work.
* **−** Misses KPI; copy continues to be ad-hoc.

## Migration plan

This ADR is **forward-looking** — `src/lib/notifications.ts` (lines 49–92 as of 2026-05-14) currently composes push strings inline with helpers like `getMilestoneCopy(days)` returning ad-hoc strings (e.g. `D-${days} until departure`, `Welcome to Korea — your first week begins.`, `Phase 2: First week`, `A new panel emerges`). These strings **do not match** the catalog in `docs/PUSH_COPY.md` (which says `30 days to your K-Journey`, `You've arrived`, `Settling in`, `Final stretch`, `Panel N of 8 unlocked`).

### Drift to acknowledge

* **Catalog ≠ live code today.** A user installing the current build receives the inline strings, not the documented strings. The catalog is the **target**, not the reflection of the current state.
* **Priming UI does not exist yet.** OS push permission is currently requested cold from the dates onboarding screen. The `<NotificationPriming />` component must ship before this ADR's KPI promise (60% grant rate) can be measured.
* **Without priming, copy improvements alone do not move the grant-rate KPI.** Both halves must ship for ADR-0029 to be considered implemented.

### Migration PRs (sequenced)

1. **PR-A — Copy module:** create `src/lib/notifications/copy.ts` exporting the typed `PUSH_COPY` constant from this ADR's Decision Outcome. Add `__tests__/pushCopy.test.ts` enforcing length budgets (≤ 30 char title / ≤ 110 char body) + no-emoji + no-Korean assertions.
2. **PR-B — Caller refactor:** replace inline strings in `src/lib/notifications.ts:49–92` with `PUSH_COPY` reads. Delete `getMilestoneCopy(days)` ad-hoc helper. Add `__tests__/notifications.test.ts` asserting every fire path (`firePanelUnlock`, `rescheduleAllNotifications`) sources from `PUSH_COPY`.
3. **PR-C — Priming UI:** ship `src/components/onboarding/NotificationPriming.tsx`. Re-route `app/(onboarding)/dates.tsx:onSubmit` so OS prompt only triggers from the priming card. Add MMKV `priming:dismissed:notifications` key. Add PostHog events `notification_priming_shown` / `notification_priming_response`.
4. **PR-D — KPI dashboard:** add PostHog funnel `permission_request → granted` and dashboard tile in `docs/MONITORING.md`. Set alert at < 50% grant rate over 7-day rolling window.

### Risk

* Without PR-B, the priming card promises copy that doesn't ship — user dissonance. **Order matters: PR-A and PR-B must land before PR-C.**
* If PR-B partially ships (some strings still inline), `__tests__/notifications.test.ts` fails CI — by design.
* `panelUnlock(n).body` is identical for all 8 panels — if a translator wants to vary copy per panel later, the catalog shape must change to `panelUnlock(n).body[n]`. Locked at single-string for MVP.

## Test plan

* Unit: `__tests__/pushCopy.test.ts` — every entry has title ≤ 30 chars, body ≤ 110 chars, no emoji (regex), no Korean characters in body (proper-noun-only rule does not apply to push payloads).
* Unit: `__tests__/notifications.test.ts` — every fire path (`firePanelUnlock`, `rescheduleAllNotifications`) reads from `PUSH_COPY` (no inline strings).
* Integration: priming screen shown when permission is `undetermined`; not shown when `granted` or `denied`.
* Manual QA (`docs/TESTING.md`): on a fresh install, complete onboarding → priming card appears → tap "Allow" → OS prompt → tap Allow → PostHog logs `granted`.
* Manual QA: dismiss priming → confirm OS prompt does not fire → confirm priming does not re-appear on next app open.
* a11y: priming screen `accessibilityLabel` reads title + body; CTA buttons have `accessibilityRole="button"` per ADR-0025.

## Links

* **PRD:** §7.4–§7.7 (push triggers — existing), §7.8 (new — copy templates), §1.2 (KPI: `push_permission_state` grant rate ≥ 60%)
* **Docs:** `docs/PUSH_COPY.md` (full copy catalog), `docs/MICROCOPY.md` (voice rules)
* **Project rules:** CLAUDE.md MUST #10, NEVER #15 (behavior-triggered only — ADR-0015)
* **Related ADRs:** [ADR-0015](0015-behavior-triggered-push-only.md) (this is the copy + priming layer on top), [ADR-0018](0018-english-first-korean-parenthetical.md), [ADR-0022](0022-kst-timezone-single-source.md) (KST 9 AM anchor)
* **Code (target):** `src/lib/notifications/copy.ts` (new), `src/components/onboarding/NotificationPriming.tsx` (new), `src/lib/notifications.ts` (refactored to read from copy module)

## Notes

If localization (Korean as primary UI) is ever pursued (PRD §13.2), `PUSH_COPY` becomes a key→message function that reads from a locale bundle. The current shape (object literal) is a deliberate MVP shortcut.

The phrase "K-Journey" appearing in `dDay30` is intentional — for many users, this push lands when the app has been silent for weeks (between install and D-30). Naming the brand re-anchors the user's memory.

The "Good morning" pattern is explicitly avoided in copy because notifications fire at KST 9 AM regardless of recipient time zone. A future location-aware reschedule (V2) could re-introduce time-of-day greetings; for now, copy is time-of-day-neutral.
