# Push Notification Copy Catalog

> Implementation guide for [ADR-0029](adr/0029-push-copy-library-and-priming.md). The single source of every push string K-Journey ever sends. Voice rules: `MICROCOPY.md` §6.3, §7. Trigger policy (when, not what): [ADR-0015](adr/0015-behavior-triggered-push-only.md).

## What this catalog is for

K-Journey sends **3 push types · 7 unique strings · max 14 fires per user lifecycle**, locked by ADR-0015:

1. D-Day milestones — D-30, D-14, D-7 to departure (3 entries)
2. Phase boundary crossings — Phase 1→2, 2→3, 3→4 (3 entries)
3. Panel unlock — once per panel, panels 1–8 (1 templated entry)

This file is the **only** place those strings live in source. `src/lib/notifications/copy.ts` exports them; `src/lib/notifications.ts` reads from that module. No call site composes a push string inline.

## Voice rules (apply to every entry)

* English only. Push payloads do not get the Korean parenthetical (lock-screen real estate is too small).
* No emoji. No urgency-scare. No "Good morning" / "Good evening" — KST 9 AM lands at unpredictable local times for non-Korea users.
* Title ≤ 30 chars (iOS lock-screen truncation point).
* Body ≤ 110 chars (iOS lock-screen truncation point on standard fonts).
* Sentence case for both title and body.
* No `Don't miss out!` / `Last chance!` style — anti-pattern per ADR-0015.
* No bare app name (`K-Journey says…`) — iOS already shows the app name; repeating wastes characters.

## Catalog

### A. D-Day milestones (3 entries)

Anchored to `departureDate`. Fired at KST 09:00 on the matching day, scheduled by `rescheduleAllNotifications` whenever `arrival`/`departure` change. ADR-0022 KST policy.

| Code | Title (≤ 30 chars) | Body (≤ 110 chars) | Fire condition |
|---|---|---|---|
| `dDay30` | `30 days to your K-Journey` | `Phase 1 missions are ready. Open to begin.` | `today + 30 days === departure` AND `today < arrival` (i.e. user hasn't arrived yet) |
| `dDay14` | `Two weeks to departure` | `Time to wrap up Phase 3. Open the journey.` | `today + 14 days === departure` AND `today >= arrival` |
| `dDay7` | `One week left` | `Phase 4 awaits. Save what you don't want to forget.` | `today + 7 days === departure` AND `today >= arrival` |

**Notes:**
* `dDay30` is the **first** push most users receive, often weeks after install. It's the brand re-anchor — the body explicitly invites action ("Open to begin").
* `dDay14` and `dDay7` body lines are slightly bittersweet — by design, they reflect the user's actual emotional state at those moments.
* `dDay30` is reused for users who install **after** D-30 but **before** D-7 — in that case, only the D-7 future-fire is scheduled; D-30 in the past is skipped.

### B. Phase boundary crossings (3 entries)

Fired when `usePhase` returns a phase that is greater than the previously-fired phase. Tracking key: MMKV `firedPhaseTransitions` (boolean array length 4 — index = source phase). Fire at KST 09:00 on the day of crossing.

| Code | Title (≤ 30 chars) | Body (≤ 110 chars) | Fire condition |
|---|---|---|---|
| `phase2Start` | `You've arrived` | `Phase 2 is unlocked. Your first week starts here.` | `phase` becomes 2 (i.e. `today === arrival`) |
| `phase3Start` | `Settling in` | `Phase 3 missions are now in your home.` | `phase` becomes 3 (i.e. `today === arrival + 8 days`) |
| `phase4Start` | `Final stretch` | `Phase 4 — gather what you want to remember.` | `phase` becomes 4 (i.e. `today === departure - 20 days`) |

**Notes:**
* Past-tense "You've arrived" is intentional — by the time the user reads the push, they have arrived. Present-tense would feel premature.
* `phase4Start` is the most emotionally weighted of the three — body intentionally evokes nostalgia ("gather what you want to remember") to align with the gallery moment downstream.
* If the user installs **after** a phase boundary, that phase's push is **not** fired retroactively. It is marked as fired in MMKV at install time. The user lands directly in the correct phase without a phantom "you've arrived" 3 weeks later.

### C. Panel unlock (1 templated entry × 8)

Fired exactly once per panel by `firePanelUnlock(n)`, gated through `claimPanelUnlock(n)` (ADR-0009). Fires immediately upon crossing the threshold (not at KST 09:00 — this is event-driven, not date-driven).

| Code | Title (≤ 30 chars) | Body (≤ 110 chars) | Fire condition |
|---|---|---|---|
| `panelUnlock(n)` | `Panel ${n} of 8 unlocked` | `Open the byeongpung to see your scroll grow.` | `claimPanelUnlock(n)` returns true (single-fire, ADR-0009) |

**Per-panel substitution:**
* `n` is rendered as a numeric literal (`Panel 3 of 8 unlocked`), not a word (`Panel three of 8 unlocked`). Matches the in-app overlay copy in MICROCOPY.md §6.3.
* Body string is identical for all 8 panels — by design. The variation is in the **title** (the panel number); the **body** is consistent so the user's mental model stays simple.

**Edge case — multiple panels claim simultaneously**: If a single mission completion crosses two panel thresholds (e.g. user completes 12 missions in one tap-spree while offline; sync fires panels 2 and 3 together), schedule each push independently with a 60-second stagger to avoid notification collision on the lock screen. Implementation in `firePanelUnlock` queue logic.

## Total catalog footprint

7 unique strings (3 D-Day + 3 phase + 1 templated panel-unlock = 7), templated to 14 fired notifications maximum per user lifecycle (3 D-Day + 3 phase + 8 panel-unlock = 14, minus any past-installs that skip).

## KST timing policy (recap from ADR-0022)

All time-anchored pushes (A and B above) fire at **KST 09:00**. They translate to local time wherever the user happens to be:

| User location | KST 09:00 lands at |
|---|---|
| Seoul (UTC+9) | 09:00 |
| Tokyo (UTC+9) | 09:00 |
| Sydney (UTC+11) | 11:00 |
| London (UTC+0) | 00:00 (midnight — see warning below) |
| New York (UTC-5) | 19:00 (previous day) |
| San Francisco (UTC-8) | 16:00 (previous day) |

### Global-user night-time warning

KST 09:00 lands at **night** for users in Europe (00:00 London, 01:00 Berlin) and **late evening / early morning** for users in the Americas (19:00 New York, 04:00 Honolulu). For the MVP we accept this — the user's PRD §2.1 archetype is a Korea-resident exchange student, so most installs are in KST or near-KST timezones.

**Mitigation**: If a future user lands in those regions and complains, the recourse is to **disable notifications** in OS settings. We do not introduce per-user time preferences in MVP.

**V2 plan**: Add a one-tap user preference: `notificationTime` ∈ {`KST 09:00` (default), `local 09:00`}. The latter would re-translate fire times to the user's tz at scheduling time. Documented in PRD §13.2 backlog.

**Anti-pattern reminder**: Do **not** add `Good morning` / `Good evening` to push body. KST 09:00 is morning in Korea but evening in the Americas; greeting copy would misfire for ~30% of installs.

## Permission priming UI

Per ADR-0029 Part B, the OS push prompt is **only** triggered after the priming card. The priming card itself contains:

| Slot | Value |
|---|---|
| Title | `Get reminders about milestones` |
| Body | `We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever.` |
| Primary CTA | `Allow notifications` |
| Secondary CTA | `Not now` |

The body explicitly enumerates the 5 milestone slots (D-30, D-14, D-7, phase changes, panel unlocks) — transparency builds trust, and ADR-0015 commits us to never adding daily/weekly. The "ever" at the end is the brand promise.

## Test plan

* Unit (`__tests__/pushCopy.test.ts`):
  * Every entry in the catalog has `title.length <= 30`.
  * Every entry has `body.length <= 110`.
  * No emoji (regex: `/[\u{1F300}-\u{1FAFF}]/u`).
  * No Korean characters in body (regex: `/[\u{AC00}-\u{D7AF}]/u`).
  * `panelUnlock(1).title === 'Panel 1 of 8 unlocked'` (template integrity).
* Unit (`__tests__/notifications.test.ts`):
  * `firePanelUnlock(3)` calls `scheduleNotificationAsync` with `PUSH_COPY.panelUnlock(3)` (no inline strings).
  * `rescheduleAllNotifications(profile)` reads `dDay30`/`dDay14`/`dDay7` from `PUSH_COPY` (no inline strings).
* Manual QA (`docs/TESTING.md`):
  * Set arrival = today + 31, departure = today + 121 → confirm dDay30 schedules for tomorrow.
  * Cross phase 1→2 in dev → confirm `phase2Start` push delivers at KST 09:00 same day (or next-day if past).
  * Complete 6 missions in dev → confirm `panelUnlock(1)` push delivers immediately, with title `Panel 1 of 8 unlocked`.
  * Lock-screen visual check on iPhone with smallest font size — title and body fit without truncation.

## Adding a new push category

This requires **first** an ADR amendment (ADR-0015 limits push categories). The MVP is locked to the 3 push types · 7 unique strings above. If a future product moment requires a 6th (e.g. "weekly digest"), the ADR-0015 amendment is the gate; this catalog is the implementation.

When adding:
1. Amend ADR-0015 (or write a superseding ADR).
2. Add the entry to the catalog above with all 4 columns.
3. Add the entry to `src/lib/notifications/copy.ts`.
4. Add fire logic to `src/lib/notifications.ts`.
5. Add Jest assertions per the test plan.
6. Voice review per MICROCOPY.md §8.

## Links

* **Authority ADRs:** [ADR-0029](adr/0029-push-copy-library-and-priming.md), [ADR-0015](adr/0015-behavior-triggered-push-only.md), [ADR-0022](adr/0022-kst-timezone-single-source.md), [ADR-0009](adr/0009-single-fire-panel-unlock.md)
* **Voice rules:** `MICROCOPY.md`
* **Project rules:** `CLAUDE.md` MUST #10, NEVER #15
* **PRD:** `reference/K-Journey_PRD_v1_1_KR.md` §7.4–§7.7 (triggers), §7.8 (new — copy templates summary), §1.2 (KPI: `push_permission_state` ≥ 60%)
* **Code (target):** `src/lib/notifications/copy.ts` (new), `src/lib/notifications.ts` (refactored caller), `src/components/onboarding/NotificationPriming.tsx` (priming UI)
