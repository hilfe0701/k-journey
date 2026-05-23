# 0022. KST timezone as single source of truth

* **Status:** proposed
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `time`, `phase`, `notifications`, `correctness`

## Context and Problem Statement

K-Journey's entire product hinges on dates: phase boundaries (arrival → +7 days → -20 days → departure), D-Day milestones (D-30/14/7), notification scheduling. All of these are currently computed with the **device's local time** via `date-fns`' `startOfDay()` and `differenceInCalendarDays()`.

This is broken in three ways:

1. **A user travelling.** Phase calc uses local midnight. If the user is in Sydney (UTC+11), local midnight is 3 hours *ahead* of Seoul midnight → phase transitions appear to fire a day early.
2. **Notifications fire at local midnight by default.** A push at 00:00 KST is "around dinner" in Seoul (acceptable), but at 00:00 local-in-Sydney would be 21:00 KST the day before — confusing.
3. **Clock manipulation.** A user can set their system clock forward and "skip" phase 3, getting Phase 4 missions early. Without a server-time anchor, this is undetectable.

K-Journey is **about Korea**. Time should be Korean time, period. The user's physical location is incidental.

## Decision Drivers

* Phase boundaries are part of the product contract; they must match the calendar the user shares with locals.
* Notifications fire at predictable Korean hours regardless of where the user is.
* Reduce surface area for clock-manipulation gaming.
* No DST in Korea → KST is a single fixed offset (UTC+9) year-round.

## Considered Options

1. **KST single source of truth** (chosen)
2. **Local time, with user disclosure**
3. **Server-time anchor for everything (round-trip cost on every phase calc)**

## Decision Outcome

**Chosen:** Add `src/lib/dates.ts` exporting:
* `kstNow()` — Date object representing now-in-KST.
* `toKstStartOfDay(iso)` — Date object representing KST midnight.
* `kstDifferenceInDays(later, earlier)` — calendar-day delta in KST.
* `scheduleAtKstMidnight(date, daysBefore)` — fires KST 09:00 N-days-before (avoiding midnight pings).

Migrate `usePhase.ts`, `notifications.ts`, `DDayBanner.tsx` to these helpers. Use Firestore `serverTimestamp()` on the **write side** for mission completion times → server-truth that can't be clock-faked.

### Positive Consequences
* Phase transitions match the Korean calendar everywhere.
* Notifications fire at KST 09:00 — civilised hour for KR + reasonable for travel cases.
* Clock-manipulation gives no advantage on phase progression (next phase still requires real elapsed time on the device for the *next* boot's calc).
* DST in user's locale doesn't affect K-Journey behaviour.

### Negative Consequences
* `date-fns-tz` adds ~25 KB to the bundle.
* All existing date helpers must migrate (well-bounded — 3 files).
* A user genuinely living in a non-KST timezone may briefly find the "D-Day" counter "wrong" by their local reckoning. Trade-off accepted: this is a Korea app.

### Reversibility
Reversible — swap `dates.ts` helpers back to plain `date-fns` and migrate call sites. Cost: ~1 PR.

## Pros and Cons of the Options

### KST single source of truth
* **+** Matches product semantics.
* **+** Simpler to reason about.
* **−** Dependency on `date-fns-tz` (~25 KB).

### Local time
* **+** No new dependency.
* **−** Travel breaks the product.

### Server-time anchor everywhere
* **+** Truly authoritative.
* **−** Round-trip on every phase calc; offline-first behaviour breaks.

## Migration plan (Part E.1 of Round 2)

1. `npm install date-fns-tz`.
2. Add `src/lib/dates.ts`.
3. Update `src/hooks/usePhase.ts:23-39`.
4. Update `src/lib/notifications.ts:49-86`.
5. Update `src/components/home/DDayBanner.tsx`.
6. Update `src/lib/firebase.ts` mission/bucket writes to use `serverTimestamp()`.
7. Add `src/lib/__tests__/dates.test.ts` (9 cases — KST midnight, Sydney call, DST locale, edge boundaries).
8. Add `src/lib/clockGuard.ts` to record (not block) clock-skew incidents via Crashlytics + telemetry.

## Links

* **PRD:** §5.7 (new), §7.7 (new), §11.7 (new)
* **Docs:** `docs/I18N_TIMEZONE.md`
* **Code (target):** `src/lib/dates.ts` (new), `src/lib/clockGuard.ts` (new)
* **Project rules (follow-up):** CLAUDE.md MUST #21 (planned): "All times MUST use KST helpers from `src/lib/dates.ts`."
* **External:** [date-fns-tz](https://github.com/marnusw/date-fns-tz)
