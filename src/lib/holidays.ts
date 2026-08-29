/**
 * Korean government-office closure dates used by administrative due-date
 * guidance. The table is intentionally versioned by year: public holidays can
 * be designated or amended, so an unlisted year is `unknown`, not silently a
 * working calendar.
 *
 * The rows are transcribed from the official annual calendar standards and
 * the Public Holidays Regulation. Sundays and Saturdays are handled separately
 * as weekends; rows that fall on a weekend remain in the table so callers can
 * explain the holiday by name.
 */

import { formatInTimeZone } from 'date-fns-tz';
import { kstDatePlusDays, KST } from './dates';

export const KOREAN_HOLIDAY_SOURCES = {
  2026: {
    sourceUrl: 'https://astro.kasi.re.kr/life/post/almanac?year=2026',
    sourceTitle: '2026년 월력요항 (2026 Korean calendar standards)',
    publisher: 'Korea Astronomy and Space Science Institute (한국천문연구원)',
    amendmentUrl:
      'https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20260501&lsiSeq=285779&urlMode=lsInfoP',
    amendmentNote: '2026-05-01 public-holiday amendment adding Labor Day and Constitution Day',
  },
  2027: {
    sourceUrl: 'https://www.kasa.go.kr/bbs/BBSMSTR_000000000018/B000000003234Li6nD2.do?mno=sub01_03_03',
    sourceTitle: '우주항공청 공고 제2026-0078호: 2027년도 월력요항',
    publisher: 'Korea AeroSpace Administration (우주항공청)',
  },
  checkedAt: '2026-08-30',
  finalAuthority: 'the office you are visiting and the latest government notice',
} as const;

export interface KoreanPublicHoliday {
  date: string;
  nameEn: string;
  nameKo: string;
  /** True when this row is a substitute public holiday. */
  substitute?: boolean;
}

/** Official 2026 public-holiday dates (weekends are not duplicated here). */
export const KOREAN_PUBLIC_HOLIDAYS_2026: readonly KoreanPublicHoliday[] = [
  { date: '2026-01-01', nameEn: "New Year's Day", nameKo: '1월 1일' },
  { date: '2026-02-16', nameEn: 'Lunar New Year holiday', nameKo: '설날 연휴' },
  { date: '2026-02-17', nameEn: 'Lunar New Year', nameKo: '설날' },
  { date: '2026-02-18', nameEn: 'Lunar New Year holiday', nameKo: '설날 연휴' },
  { date: '2026-03-01', nameEn: 'March 1st Movement Day', nameKo: '3·1절' },
  {
    date: '2026-03-02',
    nameEn: 'Substitute holiday for March 1st Movement Day',
    nameKo: '3·1절 대체공휴일',
    substitute: true,
  },
  { date: '2026-05-01', nameEn: 'Labor Day', nameKo: '노동절' },
  { date: '2026-05-05', nameEn: "Children's Day", nameKo: '어린이날' },
  { date: '2026-05-24', nameEn: "Buddha's Birthday", nameKo: '부처님오신날' },
  {
    date: '2026-05-25',
    nameEn: "Substitute holiday for Buddha's Birthday",
    nameKo: '부처님오신날 대체공휴일',
    substitute: true,
  },
  { date: '2026-06-03', nameEn: 'National local election day', nameKo: '전국동시지방선거일' },
  { date: '2026-06-06', nameEn: 'Memorial Day', nameKo: '현충일' },
  { date: '2026-07-17', nameEn: 'Constitution Day', nameKo: '제헌절' },
  { date: '2026-08-15', nameEn: 'Liberation Day', nameKo: '광복절' },
  {
    date: '2026-08-17',
    nameEn: 'Substitute holiday for Liberation Day',
    nameKo: '광복절 대체공휴일',
    substitute: true,
  },
  { date: '2026-09-24', nameEn: 'Chuseok holiday', nameKo: '추석 연휴' },
  { date: '2026-09-25', nameEn: 'Chuseok', nameKo: '추석' },
  { date: '2026-09-26', nameEn: 'Chuseok holiday', nameKo: '추석 연휴' },
  { date: '2026-10-03', nameEn: 'National Foundation Day', nameKo: '개천절' },
  {
    date: '2026-10-05',
    nameEn: 'Substitute holiday for National Foundation Day',
    nameKo: '개천절 대체공휴일',
    substitute: true,
  },
  { date: '2026-10-09', nameEn: 'Hangul Day', nameKo: '한글날' },
  { date: '2026-12-25', nameEn: 'Christmas Day', nameKo: '기독탄신일' },
] as const;

/** Official 2027 nationwide public-holiday dates. */
export const KOREAN_PUBLIC_HOLIDAYS_2027: readonly KoreanPublicHoliday[] = [
  { date: '2027-01-01', nameEn: "New Year's Day", nameKo: '1월 1일' },
  { date: '2027-02-06', nameEn: 'Lunar New Year holiday', nameKo: '설날 전날' },
  { date: '2027-02-07', nameEn: 'Lunar New Year', nameKo: '설날' },
  { date: '2027-02-08', nameEn: 'Lunar New Year holiday', nameKo: '설날 다음 날' },
  {
    date: '2027-02-09',
    nameEn: 'Substitute holiday for Lunar New Year',
    nameKo: '설날 대체공휴일',
    substitute: true,
  },
  { date: '2027-03-01', nameEn: 'March 1st Movement Day', nameKo: '3·1절' },
  { date: '2027-05-01', nameEn: 'Labor Day', nameKo: '노동절' },
  {
    date: '2027-05-03',
    nameEn: 'Substitute holiday for Labor Day',
    nameKo: '노동절 대체공휴일',
    substitute: true,
  },
  { date: '2027-05-05', nameEn: "Children's Day", nameKo: '어린이날' },
  { date: '2027-05-13', nameEn: "Buddha's Birthday", nameKo: '부처님오신날' },
  { date: '2027-06-06', nameEn: 'Memorial Day', nameKo: '현충일' },
  { date: '2027-07-17', nameEn: 'Constitution Day', nameKo: '제헌절' },
  {
    date: '2027-07-19',
    nameEn: 'Substitute holiday for Constitution Day',
    nameKo: '제헌절 대체공휴일',
    substitute: true,
  },
  { date: '2027-08-15', nameEn: 'Liberation Day', nameKo: '광복절' },
  {
    date: '2027-08-16',
    nameEn: 'Substitute holiday for Liberation Day',
    nameKo: '광복절 대체공휴일',
    substitute: true,
  },
  { date: '2027-09-14', nameEn: 'Chuseok holiday', nameKo: '추석 전날' },
  { date: '2027-09-15', nameEn: 'Chuseok', nameKo: '추석' },
  { date: '2027-09-16', nameEn: 'Chuseok holiday', nameKo: '추석 다음 날' },
  { date: '2027-10-03', nameEn: 'National Foundation Day', nameKo: '개천절' },
  {
    date: '2027-10-04',
    nameEn: 'Substitute holiday for National Foundation Day',
    nameKo: '개천절 대체공휴일',
    substitute: true,
  },
  { date: '2027-10-09', nameEn: 'Hangul Day', nameKo: '한글날' },
  {
    date: '2027-10-11',
    nameEn: 'Substitute holiday for Hangul Day',
    nameKo: '한글날 대체공휴일',
    substitute: true,
  },
  { date: '2027-12-25', nameEn: 'Christmas Day', nameKo: '기독탄신일' },
  {
    date: '2027-12-27',
    nameEn: 'Substitute holiday for Christmas Day',
    nameKo: '기독탄신일 대체공휴일',
    substitute: true,
  },
] as const;

const HOLIDAYS_BY_YEAR: Readonly<Record<number, readonly KoreanPublicHoliday[]>> = {
  2026: KOREAN_PUBLIC_HOLIDAYS_2026,
  2027: KOREAN_PUBLIC_HOLIDAYS_2027,
};

export type GovernmentDayStatus = 'working_day' | 'public_holiday' | 'weekend' | 'unknown';

function isoDateFor(dateOrIso: string | Date): string {
  return typeof dateOrIso === 'string'
    ? dateOrIso.slice(0, 10)
    : formatInTimeZone(dateOrIso, KST, 'yyyy-MM-dd');
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    formatInTimeZone(parsed, 'UTC', 'yyyy-MM-dd') === value;
}

function yearFor(date: string): number {
  return Number(date.slice(0, 4));
}

function weekdayForKst(isoDate: string): number {
  // Parse the calendar date at UTC midnight so the weekday is not shifted to
  // the previous UTC day by KST's +09:00 offset.
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

export function koreanPublicHolidaysForYear(year: number): readonly KoreanPublicHoliday[] {
  return HOLIDAYS_BY_YEAR[year] ?? [];
}

export function koreanPublicHolidayFor(
  dateOrIso: string | Date,
): KoreanPublicHoliday | undefined {
  const iso = isoDateFor(dateOrIso);
  if (!isIsoDate(iso)) return undefined;
  return koreanPublicHolidaysForYear(yearFor(iso)).find((holiday) => holiday.date === iso);
}

export function isKoreanPublicHoliday(dateOrIso: string | Date): boolean {
  return koreanPublicHolidayFor(dateOrIso) !== undefined;
}

/**
 * Returns `unknown` for a weekday in a year that has not been loaded. This
 * conservative state prevents a future year's unannounced one-off holiday
 * from being treated as an open counter or immigration office.
 */
export function governmentDayStatus(dateOrIso: string | Date): GovernmentDayStatus {
  const iso = isoDateFor(dateOrIso);
  if (!isIsoDate(iso)) return 'unknown';
  if (koreanPublicHolidayFor(iso)) return 'public_holiday';
  const weekday = weekdayForKst(iso);
  if (weekday === 0 || weekday === 6) return 'weekend';
  if (!Object.prototype.hasOwnProperty.call(HOLIDAYS_BY_YEAR, yearFor(iso))) return 'unknown';
  return 'working_day';
}

/** Unknown years are treated as closed by this boolean convenience helper. */
export function isGovernmentWorkingDay(dateOrIso: string | Date): boolean {
  return governmentDayStatus(dateOrIso) === 'working_day';
}

export interface BusinessDayAdjustment {
  status: 'resolved' | 'needs_review';
  date: string | null;
  skippedDates: readonly string[];
  reason: string;
}

function adjustBusinessDay(
  dateOrIso: string | Date,
  direction: 1 | -1,
): BusinessDayAdjustment {
  const start = isoDateFor(dateOrIso);
  if (!isIsoDate(start)) {
    return {
      status: 'needs_review',
      date: null,
      skippedDates: [],
      reason: 'The date is not a valid YYYY-MM-DD value.',
    };
  }

  const skippedDates: string[] = [];
  let candidate = start;
  for (let attempts = 0; attempts < 370; attempts += 1) {
    const status = governmentDayStatus(candidate);
    if (status === 'working_day') {
      return {
        status: 'resolved',
        date: candidate,
        skippedDates,
        reason:
          skippedDates.length === 0
            ? 'The date is an open government-business day in the loaded calendar.'
            : 'The date was moved to the nearest open government-business day.',
      };
    }
    if (status === 'unknown') {
      return {
        status: 'needs_review',
        date: null,
        skippedDates,
        reason:
          'The calendar for this year is not loaded. Check the latest government notice before relying on an administrative due date.',
      };
    }
    skippedDates.push(candidate);
    candidate = kstDatePlusDays(candidate, direction);
  }

  return {
    status: 'needs_review',
    date: null,
    skippedDates,
    reason: 'No open government-business day was found in the search window.',
  };
}

export function nextGovernmentBusinessDay(dateOrIso: string | Date): BusinessDayAdjustment {
  return adjustBusinessDay(dateOrIso, 1);
}

export function previousGovernmentBusinessDay(dateOrIso: string | Date): BusinessDayAdjustment {
  return adjustBusinessDay(dateOrIso, -1);
}

/** Alias used by due-date call sites: deadlines on closures move backward. */
export function adjustDueDateToPreviousGovernmentBusinessDay(
  dateOrIso: string | Date,
): BusinessDayAdjustment {
  return previousGovernmentBusinessDay(dateOrIso);
}

/**
 * Apply the holiday policy to an arrival-plus-days `DueRule`. The raw legal or
 * product offset is calculated first, then a closure date is moved backward to
 * the nearest open office day. An unlisted year remains `needs_review`.
 */
export function resolveArrivalPlusDaysDueDate(
  arrivalDate: string,
  days: number,
): BusinessDayAdjustment {
  if (!isIsoDate(arrivalDate) || !Number.isInteger(days)) {
    return {
      status: 'needs_review',
      date: null,
      skippedDates: [],
      reason: 'Use a valid YYYY-MM-DD arrival date and an integer day offset.',
    };
  }
  return adjustDueDateToPreviousGovernmentBusinessDay(kstDatePlusDays(arrivalDate, days));
}

export interface GovernmentBusinessDayCount {
  status: 'resolved' | 'needs_review';
  date: string | null;
  skippedDates: readonly string[];
  reason: string;
}

/** Add/subtract open government-business days without crossing an unknown year. */
export function addGovernmentBusinessDays(
  dateOrIso: string | Date,
  businessDays: number,
): GovernmentBusinessDayCount {
  const start = isoDateFor(dateOrIso);
  if (!isIsoDate(start) || !Number.isInteger(businessDays)) {
    return {
      status: 'needs_review',
      date: null,
      skippedDates: [],
      reason: 'Use a valid YYYY-MM-DD date and an integer business-day count.',
    };
  }
  if (businessDays === 0) {
    const status = governmentDayStatus(start);
    return status === 'working_day'
      ? { status: 'resolved', date: start, skippedDates: [], reason: 'No business-day shift requested.' }
      : {
          status: status === 'unknown' ? 'needs_review' : 'resolved',
          date: status === 'unknown' ? null : start,
          skippedDates: status === 'unknown' ? [] : [start],
          reason:
            status === 'unknown'
              ? 'The calendar for this year is not loaded.'
              : 'The requested date is not an open government-business day.',
        };
  }

  const direction: 1 | -1 = businessDays > 0 ? 1 : -1;
  const remainingTarget = Math.abs(businessDays);
  const skippedDates: string[] = [];
  let candidate = start;
  let remaining = remainingTarget;
  while (remaining > 0) {
    candidate = kstDatePlusDays(candidate, direction);
    const status = governmentDayStatus(candidate);
    if (status === 'unknown') {
      return {
        status: 'needs_review',
        date: null,
        skippedDates,
        reason: 'The calendar for this year is not loaded. Check the latest government notice.',
      };
    }
    if (status !== 'working_day') {
      skippedDates.push(candidate);
      continue;
    }
    remaining -= 1;
  }

  return {
    status: 'resolved',
    date: candidate,
    skippedDates,
    reason: 'Business-day count resolved from the loaded Korean government calendar.',
  };
}
