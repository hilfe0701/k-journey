import {
  KOREAN_PUBLIC_HOLIDAYS_2026,
  addGovernmentBusinessDays,
  adjustDueDateToPreviousGovernmentBusinessDay,
  governmentDayStatus,
  isGovernmentWorkingDay,
  koreanPublicHolidayFor,
  nextGovernmentBusinessDay,
  previousGovernmentBusinessDay,
  resolveArrivalPlusDaysDueDate,
} from '../holidays';

describe('Korean government holiday calendar', () => {
  it('contains the official 2026 substitute holidays and election day', () => {
    expect(KOREAN_PUBLIC_HOLIDAYS_2026).toHaveLength(20);
    expect(koreanPublicHolidayFor('2026-03-02')?.substitute).toBe(true);
    expect(koreanPublicHolidayFor('2026-06-03')?.nameKo).toContain('선거');
  });

  it('distinguishes public holidays, weekends, and open weekdays', () => {
    expect(governmentDayStatus('2026-05-25')).toBe('public_holiday');
    expect(governmentDayStatus('2026-05-30')).toBe('weekend');
    expect(governmentDayStatus('2026-05-26')).toBe('working_day');
    expect(isGovernmentWorkingDay('2026-05-26')).toBe(true);
    expect(isGovernmentWorkingDay('2026-05-25')).toBe(false);
  });

  it('returns unknown for an unlisted future year instead of calling it open', () => {
    expect(governmentDayStatus('2027-01-04')).toBe('unknown');
    expect(isGovernmentWorkingDay('2027-01-04')).toBe(false);
    expect(nextGovernmentBusinessDay('2027-01-04').status).toBe('needs_review');
  });

  it('moves a holiday deadline to the previous open government day', () => {
    const result = adjustDueDateToPreviousGovernmentBusinessDay('2026-05-25');
    expect(result.status).toBe('resolved');
    expect(result.date).toBe('2026-05-22');
    expect(result.skippedDates).toEqual(['2026-05-25', '2026-05-24', '2026-05-23']);
  });

  it('finds the next open day after a weekend and holiday', () => {
    const result = nextGovernmentBusinessDay('2026-08-15');
    expect(result.status).toBe('resolved');
    expect(result.date).toBe('2026-08-18');
    expect(previousGovernmentBusinessDay('2026-08-17').date).toBe('2026-08-14');
  });

  it('counts only open days for a due-rule offset', () => {
    expect(addGovernmentBusinessDays('2026-05-22', 1).date).toBe('2026-05-26');
    expect(addGovernmentBusinessDays('2026-05-26', -1).date).toBe('2026-05-22');
    expect(addGovernmentBusinessDays('2026-05-22', 0).date).toBe('2026-05-22');
  });

  it('resolves an arrival-plus-days due rule through the closure calendar', () => {
    expect(resolveArrivalPlusDaysDueDate('2026-02-17', 97).date).toBe('2026-05-22');
    expect(resolveArrivalPlusDaysDueDate('2027-02-17', 90).status).toBe('needs_review');
  });
});
