/**
 * KST timezone helpers — the single source of truth for time in K-Journey.
 *
 * Rationale: K-Journey is about Korea. Phase boundaries, D-Day milestones, and
 * notification schedules anchor to Korea Standard Time (UTC+9, no DST) regardless
 * of where the user's device is. See ADR-0022 (docs/adr/0022-kst-timezone-single-source.md)
 * and PRD v1.1 §11.7.
 *
 * Completion timestamps are local informational records. Phase and D-Day
 * calculations use the current instant plus KST calendar helpers. See
 * `clockGuard.ts` for best-effort clock-skew diagnostics.
 *
 * Migration record: replaces direct `startOfDay()` / `differenceInCalendarDays()`
 * usages that previously read device-local time. See Round 2 plan Part E.1.
 */

import { isValid, parseISO } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const KST = 'Asia/Seoul';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Current instant. Calendar-day consumers must render it through the KST helpers below. */
export function kstNow(): Date {
  return new Date();
}

function assertDateOnly(value: string): [number, number, number] {
  const match = DATE_ONLY.exec(value);
  if (!match) throw new RangeError(`Invalid calendar date: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return [year, month, day];
}

/** KST calendar date (`YYYY-MM-DD`) for an instant or already date-only value. */
export function kstCalendarDate(dateOrIso: string | Date): string {
  if (typeof dateOrIso === 'string' && DATE_ONLY.test(dateOrIso)) {
    assertDateOnly(dateOrIso);
    return dateOrIso;
  }
  const date = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  if (!isValid(date)) throw new RangeError(`Invalid date: ${String(dateOrIso)}`);
  return formatInTimeZone(date, KST, 'yyyy-MM-dd');
}

/** Real instant corresponding to KST 00:00 of the calendar day containing `dateOrIso`. */
export function toKstStartOfDay(dateOrIso: string | Date): Date {
  return fromZonedTime(`${kstCalendarDate(dateOrIso)}T00:00:00`, KST);
}

/** Calendar-day delta in KST. Positive when `later` is after `earlier`. */
export function kstDifferenceInDays(later: Date, earlier: Date): number {
  const ordinal = (value: Date) => {
    const [year, month, day] = assertDateOnly(kstCalendarDate(value));
    return Date.UTC(year, month - 1, day) / 86_400_000;
  };
  return ordinal(later) - ordinal(earlier);
}

/** A KST calendar date rendered for reading, e.g. `Aug 4, 2026`. */
export function formatKstDate(isoDate: string): string {
  return formatInTimeZone(toKstStartOfDay(isoDate), KST, 'MMM d, yyyy');
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
  const [year, month, day] = assertDateOnly(isoDate);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return [
    shifted.getUTCFullYear().toString().padStart(4, '0'),
    (shifted.getUTCMonth() + 1).toString().padStart(2, '0'),
    shifted.getUTCDate().toString().padStart(2, '0'),
  ].join('-');
}

/** Shift a KST calendar date by whole years, clamping leap day to month end. */
export function kstDatePlusYears(isoDate: string, years: number): string {
  const [year, month, day] = assertDateOnly(isoDate);
  const targetYear = year + years;
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  return [
    targetYear.toString().padStart(4, '0'),
    month.toString().padStart(2, '0'),
    Math.min(day, lastDay).toString().padStart(2, '0'),
  ].join('-');
}

/**
 * Returns a UTC Date such that, when delivered to the OS notification scheduler,
 * the notification fires at KST 09:00 on the calendar day that is `daysBefore`
 * days before `target` (also computed in KST). 09:00 avoids waking sleeping users
 * if `daysBefore` is large.
 */
export function scheduleAtKstMorning(target: string | Date, daysBefore: number): Date {
  const targetDate = kstCalendarDate(target);
  const fireDate = kstDatePlusDays(targetDate, -daysBefore);
  return fromZonedTime(`${fireDate}T09:00:00`, KST);
}
