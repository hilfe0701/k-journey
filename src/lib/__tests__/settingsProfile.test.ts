import { UNKNOWN } from '../firebase';
import {
  HOME_INSURANCE_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  VISA_STATUS_OPTIONS,
  homeInsuranceLabel,
  nationalityLabel,
  nationalityPatch,
  profileDateField,
  profileDateMinimum,
  programTypeLabel,
  totalStayDaysLabel,
  totalStayDaysPatch,
  visaStatusLabel,
} from '../settingsProfile';

describe('settings profile options and labels', () => {
  it('keeps the onboarding choices and explicit unknown option', () => {
    expect(PROGRAM_TYPE_OPTIONS.map(({ value }) => value)).toEqual(['exchange', 'visiting', UNKNOWN]);
    expect(VISA_STATUS_OPTIONS.map(({ value }) => value)).toEqual([
      'D-2-6',
      'D-2-8',
      'visa_free',
      'other',
      UNKNOWN,
    ]);
    expect(HOME_INSURANCE_OPTIONS.map(({ value }) => value)).toEqual(['yes', 'no', UNKNOWN]);
  });

  it('formats stored profile values without exposing storage tokens', () => {
    expect(programTypeLabel('exchange')).toBe('Exchange student');
    expect(visaStatusLabel('D-2-8')).toBe('D-2-8 — Visiting Student');
    expect(homeInsuranceLabel(UNKNOWN)).toBe('Unknown / not sure');
    expect(totalStayDaysLabel(120)).toBe('120 days');
    expect(nationalityLabel(UNKNOWN)).toBe('Unknown / not sure');
  });
});

describe('settings profile patches', () => {
  it('accepts whole-number stay lengths and rejects incomplete input', () => {
    expect(totalStayDaysPatch('120', false)).toEqual({ totalStayDays: 120 });
    expect(totalStayDaysPatch('', false)).toBeNull();
    expect(totalStayDaysPatch('12.5', false)).toBeNull();
    expect(totalStayDaysPatch('', true)).toEqual({ totalStayDays: UNKNOWN });
  });

  it('trims nationality and supports clearing it to unknown', () => {
    expect(nationalityPatch('  Canada  ', false)).toEqual({ nationality: 'Canada' });
    expect(nationalityPatch('   ', false)).toBeNull();
    expect(nationalityPatch('', true)).toEqual({ nationality: UNKNOWN });
  });

  it('maps date edits and allows past arrival/program dates', () => {
    expect(profileDateField('programStart')).toBe('programStartDate');
    expect(profileDateField('arrival')).toBe('arrivalDate');
    expect(profileDateField('departure')).toBe('departureDate');
    expect(profileDateMinimum('programStart', '2025-09-01')).toBeUndefined();
    expect(profileDateMinimum('arrival', '2025-09-01')).toBeUndefined();
    expect(profileDateMinimum('departure', '2025-09-01')).toBe('2025-09-01');
    expect(profileDateMinimum('departure', UNKNOWN)).toBeUndefined();
  });
});
