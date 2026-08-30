# i18n & Timezone

> Decision authority: [ADR-0018](adr/0018-english-first-korean-parenthetical.md), [ADR-0022](adr/0022-kst-timezone-single-source.md). For UI copy rules see `DESIGN.md` §11 (Voice & Copy).

## 1. Language scope

MVP is **English only**. The Korean parenthetical convention (`Try Tteokbokki (떡볶이)`) is the only Korean text the app contains, applied to *proper nouns*: foods, places, customs.

Non-proper-noun copy (verbs like "Save", "Cancel") is English-only.

System locale is **not** consulted — a user with a Spanish or French device gets the same English strings. RTL is not supported.

## 2. Korean parenthetical rule

Format: `English (한국어)`.

* Proper noun first in English, in sentence case where reasonable (`Gwangjang Market`, not `gwangjang market`).
* Korean follows in parentheses, in natural Korean orthography (no romanisation choice forced).
* Whole phrase wrapped in `accessibilityLabel` so screen readers announce both forms — this helps users pronounce the word in the field.

Examples:
* `Visit Gwangjang Market (광장시장)`
* `Try Tteokbokki (떡볶이)`
* `Take the AREX (공항철도) to Seoul Station (서울역)`

## 3. ALL CAPS exception

Only `<Badge>` micro labels (11–12px) use ALL CAPS. Everything else is sentence case. `CLAUDE.md` MUST #4, NEVER #4.

## 4. Timezone — KST single source of truth

K-Journey is about Korea. **All time semantics anchor to Korea Standard Time (UTC+9).** This applies regardless of where the user's device is.

| Concept | Computed from |
|---|---|
| Current phase | KST midnight comparison with `arrival` / `departure` |
| D-Day countdown | `kstDifferenceInDays(departure, kstNow())` |
| Phase transition fire date | KST midnight |
| D-30 / D-14 / D-7 notification | `scheduleAtKstMidnight(departure, -30)` etc. — fires at **KST 09:00** to avoid waking sleeping users |
| Mission completion time (stored) | Local ISO timestamp in MMKV; informational, not a trusted legal timestamp |
| Mission completion time (displayed) | Convert the stored instant to KST for date labels |

### 4.1 Helpers

`src/lib/dates.ts`:

| Function | Purpose |
|---|---|
| `kstNow()` | Date object representing now-in-KST. |
| `toKstStartOfDay(date)` | Date object representing 00:00 KST of that calendar day. |
| `kstDifferenceInDays(later, earlier)` | Integer calendar-day delta in KST. |
| `scheduleAtKstMidnight(date, daysBefore)` | Returns a Date set to KST 09:00, N-days-before. Used by `notifications.ts`. |

### 4.2 DST

Korea **does not** observe DST. KST is fixed at UTC+9 year-round.

Users in DST-observing locales (Sydney, Berlin, New York…) are unaffected by their own DST — we convert *to* KST before doing any phase math.

### 4.3 Clock manipulation

`src/lib/clockGuard.ts` compares wall-clock elapsed time with monotonic elapsed time
once per minute during a continuous foreground interval. Leaving `active` discards
the baseline because native monotonic clocks may pause during device suspend. A
normal background gap or a gap between launches is therefore never treated as
clock manipulation because that gap alone proves nothing.

On a detected jump it records the optional `clock_skew_detected` diagnostic and
shows a dismissible clock warning. Phase progress still uses KST helpers; local
completion timestamps are informational rather than server-authoritative.

## 5. Migration from local time (Round 2 Part E.1)

Original implementation used device-local `startOfDay()` from `date-fns`. The migration:

1. Add `date-fns-tz` dependency.
2. Add `src/lib/dates.ts` helpers.
3. Replace `startOfDay` and `differenceInCalendarDays` in:
   * `src/hooks/usePhase.ts:23-39`
   * `src/lib/notifications.ts:rescheduleAllNotifications`
   * `src/components/home/DDayBanner.tsx`
4. Add tests `src/lib/__tests__/dates.test.ts` with 9 scenarios (KST midnight, Sydney call, DST locale, edge boundaries).
5. Confirm `npm run check` green.

After migration, **`CLAUDE.md` MUST add**: "All times MUST use KST helpers from `src/lib/dates.ts` (ADR-0022). NEVER use system `Date` for phase or D-Day math."

## 6. V2 multilingual plan (placeholder)

When multilingual lands (V2.0, `PRD §13.2`):

* Use `i18n-js` or `expo-localization` for string lookup.
* Add Korean translations first (target audience is in Korea after all).
* Then per market: English, Korean, simplified Chinese, Japanese.
* The Korean parenthetical rule (§2) **inverts** in the Korean-locale build — English would be the parenthetical, not the primary.
* Timezone stays KST regardless of locale.

## 7. Links

* [ADR-0018](adr/0018-english-first-korean-parenthetical.md)
* [ADR-0022](adr/0022-kst-timezone-single-source.md)
* `DESIGN.md` §11 Voice and copy
* `src/lib/dates.ts` (target)
* `src/lib/clockGuard.ts` (target)
