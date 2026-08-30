import {
  UNKNOWN,
  type HomeCountryInsurance,
  type ProgramType,
  type UnknownValue,
  type UserProfile,
  type VisaTypeOrStatus,
} from './firebase';

export const UNKNOWN_PROFILE_LABEL = 'Unknown / not sure';

export const PROGRAM_TYPE_OPTIONS = [
  { value: 'exchange', label: 'Exchange student' },
  { value: 'visiting', label: 'Visiting student' },
  { value: UNKNOWN, label: UNKNOWN_PROFILE_LABEL },
] satisfies readonly { value: ProgramType; label: string }[];

export const VISA_STATUS_OPTIONS = [
  { value: 'D-2-6', label: 'D-2-6 — Exchange Student' },
  { value: 'D-2-8', label: 'D-2-8 — Visiting Student' },
  { value: 'visa_free', label: 'Visa-free stay' },
  { value: 'other', label: 'Another visa or status' },
  { value: UNKNOWN, label: UNKNOWN_PROFILE_LABEL },
] satisfies readonly { value: VisaTypeOrStatus; label: string }[];

export const HOME_INSURANCE_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: UNKNOWN, label: UNKNOWN_PROFILE_LABEL },
] satisfies readonly { value: HomeCountryInsurance; label: string }[];

export type EditableProfileDateKind = 'programStart' | 'arrival' | 'departure';
export type EditableProfileDate = string | UnknownValue;

export function programTypeLabel(value: ProgramType | null | undefined): string {
  return PROGRAM_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? UNKNOWN_PROFILE_LABEL;
}

export function visaStatusLabel(value: VisaTypeOrStatus | null | undefined): string {
  return VISA_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? UNKNOWN_PROFILE_LABEL;
}

export function homeInsuranceLabel(value: HomeCountryInsurance | null | undefined): string {
  return HOME_INSURANCE_OPTIONS.find((option) => option.value === value)?.label ?? UNKNOWN_PROFILE_LABEL;
}

export function totalStayDaysLabel(value: UserProfile['totalStayDays'] | null | undefined): string {
  return typeof value === 'number' ? `${value} days` : UNKNOWN_PROFILE_LABEL;
}

export function nationalityLabel(value: UserProfile['nationality'] | null | undefined): string {
  return value && value !== UNKNOWN ? value : UNKNOWN_PROFILE_LABEL;
}

export function totalStayDaysPatch(
  input: string,
  markedUnknown: boolean,
): Pick<UserProfile, 'totalStayDays'> | null {
  if (markedUnknown) return { totalStayDays: UNKNOWN };
  if (!/^\d+$/.test(input)) return null;
  const days = Number(input);
  return Number.isSafeInteger(days) ? { totalStayDays: days } : null;
}

export function nationalityPatch(
  input: string,
  markedUnknown: boolean,
): Pick<UserProfile, 'nationality'> | null {
  if (markedUnknown) return { nationality: UNKNOWN };
  const nationality = input.trim();
  return nationality ? { nationality } : null;
}

export function profileDateField(
  kind: EditableProfileDateKind,
): 'programStartDate' | 'arrivalDate' | 'departureDate' {
  if (kind === 'programStart') return 'programStartDate';
  if (kind === 'arrival') return 'arrivalDate';
  return 'departureDate';
}

export function knownEditableProfileDate(
  value: string | UnknownValue | null | undefined,
): string | null {
  return value && value !== UNKNOWN ? value : null;
}

/** Arrival and program-start corrections may be in the past; departure follows arrival. */
export function profileDateMinimum(
  kind: EditableProfileDateKind,
  arrivalDate: UserProfile['arrivalDate'] | undefined,
): string | undefined {
  return kind === 'departure' ? knownEditableProfileDate(arrivalDate) ?? undefined : undefined;
}
