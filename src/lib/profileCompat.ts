import type { MissionAppliesTo } from '../data/missions';
import {
  EMPTY_PROFILE,
  UNKNOWN,
  type HousingType,
  type UserProfile,
} from './firebase';

/** Returns a date only when it is safe to pass to the KST date helpers. */
export function knownProfileDate(
  value: UserProfile['arrivalDate'] | UserProfile['departureDate'] | undefined,
): string | null {
  return value && value !== UNKNOWN ? value : null;
}

/** Canonical university selector with a v1-profile fallback. */
export function selectUniversityId(profile: UserProfile | null | undefined): string | null {
  if (!profile) return null;
  if (profile.universityId && profile.universityId !== UNKNOWN) return profile.universityId;
  return profile.university ?? null;
}

/** Broad cultural-mission housing selector derived from the detailed admin axis. */
export function selectMissionHousing(
  profile: UserProfile | null | undefined,
): MissionAppliesTo | null {
  if (!profile) return null;
  if (profile.housingType === 'dormitory') return 'dormitory';
  if (
    profile.housingType === 'own_lease' ||
    profile.housingType === 'third_party_lease' ||
    profile.housingType === 'registered_business'
  ) {
    return 'off-campus';
  }
  return profile.housing ?? null;
}

export function universityProfilePatch(universityId: string): Partial<UserProfile> {
  return {
    universityId,
    university: universityId === UNKNOWN ? null : universityId,
  };
}

export function housingProfilePatch(housingType: HousingType): Partial<UserProfile> {
  return {
    housingType,
    housing:
      housingType === UNKNOWN
        ? null
        : housingType === 'dormitory'
          ? 'dormitory'
          : 'off-campus',
  };
}

/** Fills v2 condition axes without guessing details absent from a v1 profile. */
export function normalizeUserProfile(profile: Partial<UserProfile>): UserProfile {
  const hasCurrentConditionShape = [
    'universityId',
    'programType',
    'visaTypeOrStatus',
    'housingType',
    'contractHolder',
    'totalStayDays',
    'nationality',
    'homeCountryInsurance',
    'residenceCardStatus',
    'programStartDate',
  ].every((key) => Object.prototype.hasOwnProperty.call(profile, key));
  const universityId =
    profile.universityId && profile.universityId !== UNKNOWN
      ? profile.universityId
      : profile.university ?? UNKNOWN;
  const housingType =
    profile.housingType && profile.housingType !== UNKNOWN
      ? profile.housingType
      : profile.housing === 'dormitory'
        ? 'dormitory'
        : UNKNOWN;

  return {
    ...EMPTY_PROFILE,
    ...profile,
    uid: EMPTY_PROFILE.uid,
    email: null,
    photoUrl: null,
    universityId,
    university: profile.university ?? (universityId === UNKNOWN ? null : universityId),
    housingType,
    housing:
      profile.housing ??
      (housingType === UNKNOWN
        ? null
        : housingType === 'dormitory'
          ? 'dormitory'
          : 'off-campus'),
    onboardingCompletedAt: hasCurrentConditionShape
      ? profile.onboardingCompletedAt ?? null
      : null,
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : null,
  };
}
