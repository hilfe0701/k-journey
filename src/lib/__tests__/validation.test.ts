import { validateDates, DATE_ERROR_MESSAGES, type DateValidationError } from '../validation';

describe('validateDates', () => {
  it('returns arrival_required when arrival missing', () => {
    expect(validateDates(null, '2026-08-01')).toBe('arrival_required');
    expect(validateDates(undefined, '2026-08-01')).toBe('arrival_required');
    expect(validateDates('', '2026-08-01')).toBe('arrival_required');
  });

  it('returns departure_required when departure missing', () => {
    expect(validateDates('2026-04-01', null)).toBe('departure_required');
    expect(validateDates('2026-04-01', '')).toBe('departure_required');
  });

  it('rejects invalid arrival format', () => {
    expect(validateDates('not-a-date', '2026-08-01')).toBe('arrival_invalid');
  });

  it('rejects invalid departure format', () => {
    expect(validateDates('2026-04-01', 'nope')).toBe('departure_invalid');
  });

  it('rejects a date-only value that rolls into another month', () => {
    expect(validateDates('2026-02-30', '2026-08-01')).toBe('arrival_invalid');
  });

  it('rejects arrival after departure', () => {
    expect(validateDates('2026-08-01', '2026-04-01')).toBe('arrival_after_departure');
  });

  it('accepts arrival == departure (same-day trip)', () => {
    // Edge case from PRD §5.6 — same-day trip is allowed, phase 2 first-week
    // covers it.
    expect(validateDates('2026-05-01', '2026-05-01')).toBeNull();
  });

  it('rejects arrival more than a year in the past', () => {
    const old = new Date();
    old.setFullYear(old.getFullYear() - 2);
    const oldIso = old.toISOString().split('T')[0];
    expect(validateDates(oldIso, '2026-08-01')).toBe('arrival_too_far_past');
  });

  it('rejects departure more than two years in the future', () => {
    const far = new Date();
    far.setFullYear(far.getFullYear() + 3);
    const farIso = far.toISOString().split('T')[0];
    expect(validateDates('2026-04-01', farIso)).toBe('departure_too_far_future');
  });

  it('returns null for a normal exchange-semester window', () => {
    expect(validateDates('2026-04-01', '2026-08-01')).toBeNull();
  });

  it('every DateValidationError code has a UI message', () => {
    const codes: DateValidationError[] = [
      'arrival_required',
      'departure_required',
      'arrival_invalid',
      'departure_invalid',
      'arrival_after_departure',
      'arrival_too_far_past',
      'departure_too_far_future',
    ];
    for (const code of codes) {
      expect(DATE_ERROR_MESSAGES[code]).toBeDefined();
      expect(DATE_ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    }
  });
});
