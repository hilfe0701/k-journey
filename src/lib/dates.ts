/**
 * KST timezone helpers — the single source of truth for time in K-Journey.
 *
 * Rationale: K-Journey is about Korea. Phase boundaries, D-Day milestones, and
 * notification schedules anchor to Korea Standard Time (UTC+9, no DST) regardless
 * of where the user's device is. See ADR-0022 (docs/adr/0022-kst-timezone-single-source.md)
 * and PRD v1.1 §11.7.
 *
 * Server-side write timestamps use Firestore `serverTimestamp()` so clock
 * manipulation on the device cannot game D-Day or completion times. See `clockGuard.ts`
 * for clock-skew diagnostic recording.
 *
 * Migration record: replaces direct `startOfDay()` / `differenceInCalendarDays()`
 * usages that previously read device-local time. See Round 2 plan Part E.1.
 */

import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const KST = 'Asia/Seoul';

/** Current time, expressed as a Date in KST. */
export function kstNow(): Date {
  return toZonedTime(new Date(), KST);
}

/** KST 00:00 of the calendar day containing `dateOrIso`. */
export function toKstStartOfDay(dateOrIso: string | Date): Date {
  const d = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  const kst = toZonedTime(d, KST);
  kst.setHours(0, 0, 0, 0);
  return kst;
}

/** Calendar-day delta in KST. Positive when `later` is after `earlier`. */
export function kstDifferenceInDays(later: Date, earlier: Date): number {
  return differenceInCalendarDays(toZonedTime(later, KST), toZonedTime(earlier, KST));
}

/** A KST calendar date rendered for reading, e.g. `Aug 4, 2026`. */
export function formatKstDate(isoDate: string): string {
  return formatInTimeZone(parseISO(`${isoDate}T00:00:00+09:00`), KST, 'MMM d, yyyy');
}

/**
 * The KST calendar date `days` after `isoDate`, as `YYYY-MM-DD`.
 *
 * `isoDate` is anchored at KST midnight as a real instant rather than being run
 * through `toKstStartOfDay`. That helper mutates local-time fields, so on a
 * device far enough east the round-trip lands a day early — harmless for
 * display, wrong for a review deadline that gates whether guidance is shown as
 * stale.
 */
export function kstDatePlusDays(isoDate: string, days: number): string {
  return formatInTimeZone(addDays(parseISO(`${isoDate}T00:00:00+09:00`), days), KST, 'yyyy-MM-dd');
}

/**
 * Returns a UTC Date such that, when delivered to the OS notification scheduler,
 * the notification fires at KST 09:00 on the calendar day that is `daysBefore`
 * days before `target` (also computed in KST). 09:00 avoids waking sleeping users
 * if `daysBefore` is large.
 */
export function scheduleAtKstMorning(target: string | Date, daysBefore: number): Date {
  const targetMidnight = toKstStartOfDay(target);
  targetMidnight.setHours(9, 0, 0, 0);
  return fromZonedTime(addDays(targetMidnight, -daysBefore), KST);
}
