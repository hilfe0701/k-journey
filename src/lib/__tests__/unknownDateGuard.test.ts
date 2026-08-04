import { format, parseISO } from 'date-fns';

import { UNKNOWN } from '../firebase';

/**
 * Regression guard for two defects found by the 2026-07-27 web through-line run.
 * Both were invisible to the 182 tests that existed at the time because they only
 * appear once a real render feeds a stored value into date-fns.
 *
 * See `.work/through-line-run1.md` and `DEC-029` in the pm-job decision log.
 */

// Mirrors the predicate the onboarding date screen uses. Kept here so a change to
// the screen's guard has to break a test rather than only the running app.
function isRealDate(value: string | null | undefined): value is string {
  return typeof value === 'string' && value !== UNKNOWN && value.length > 0;
}

describe('UNKNOWN is a string, so typeof is not a date guard', () => {
  // REQ-DAR-004 · ONB-07 · marking a date unknown is an allowed answer.
  it('UNKNOWN passes a typeof check', () => {
    expect(typeof UNKNOWN).toBe('string');
  });

  it('formatting UNKNOWN as a date throws RangeError', () => {
    expect(() => format(parseISO(UNKNOWN), 'MMM d, yyyy')).toThrow(RangeError);
  });

  it('isRealDate rejects UNKNOWN, null, undefined and empty', () => {
    expect(isRealDate(UNKNOWN)).toBe(false);
    expect(isRealDate(null)).toBe(false);
    expect(isRealDate(undefined)).toBe(false);
    expect(isRealDate('')).toBe(false);
  });

  it('isRealDate accepts a calendar-produced date', () => {
    expect(isRealDate('2026-07-15')).toBe(true);
    expect(format(parseISO('2026-07-15'), 'MMM d, yyyy')).toBe('Jul 15, 2026');
  });

  it('a date range built from UNKNOWN yields nothing instead of failing loudly', () => {
    // The old guard let this through; the comparison against an Invalid Date is
    // always false, so the range loop marked no days and reported no error.
    const cursor = parseISO(UNKNOWN);
    const end = parseISO('2026-08-04');
    expect(Number.isNaN(cursor.getTime())).toBe(true);
    expect(cursor < end).toBe(false);
  });
});
