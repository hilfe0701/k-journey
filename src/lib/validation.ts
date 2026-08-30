/**
 * Onboarding-boundary date validation.
 *
 * Catches user input that would break downstream phase/D-Day math:
 *   - arrival > departure (a real user mistake we want to surface, not silently sort)
 *   - arrival more than a year in the past (likely typo)
 *   - departure more than two years in the future (1-year visa range covers most legitimate cases)
 *
 * Used at the onboarding boundary only — once stored in Firestore, dates are trusted.
 * See PRD v1.1 §4.2.1 and §5.6.
 */

import { kstCalendarDate, kstDatePlusYears, kstNow, toKstStartOfDay } from './dates';

export type DateValidationError =
  | 'arrival_required'
  | 'departure_required'
  | 'arrival_invalid'
  | 'departure_invalid'
  | 'arrival_after_departure'
  | 'arrival_too_far_past'
  | 'departure_too_far_future';

export function validateDates(
  arrivalIso: string | null | undefined,
  departureIso: string | null | undefined,
): DateValidationError | null {
  if (!arrivalIso) return 'arrival_required';
  if (!departureIso) return 'departure_required';

  try {
    toKstStartOfDay(arrivalIso);
  } catch {
    return 'arrival_invalid';
  }
  try {
    toKstStartOfDay(departureIso);
  } catch {
    return 'departure_invalid';
  }

  if (arrivalIso > departureIso) return 'arrival_after_departure';

  const today = kstCalendarDate(kstNow());
  if (arrivalIso < kstDatePlusYears(today, -1)) return 'arrival_too_far_past';

  if (departureIso > kstDatePlusYears(today, 2)) return 'departure_too_far_future';

  return null;
}

export type NameValidationError = 'name_empty';

/** Profile name validation (SETTINGS.md §3.1) — non-empty after trim. */
export function validateName(name: string | null | undefined): NameValidationError | null {
  return name && name.trim().length > 0 ? null : 'name_empty';
}

export const DATE_ERROR_MESSAGES: Record<DateValidationError, string> = {
  arrival_required: 'Please select your arrival date.',
  departure_required: 'Please select your departure date.',
  arrival_invalid: 'Arrival date is invalid.',
  departure_invalid: 'Departure date is invalid.',
  arrival_after_departure: 'Arrival must be before departure.',
  arrival_too_far_past: 'Arrival date is more than a year ago.',
  departure_too_far_future: 'Departure date is more than two years away.',
};
