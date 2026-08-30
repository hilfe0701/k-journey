import { UNKNOWN, type UserProfile } from '../firebase';
import {
  housingProfilePatch,
  knownProfileDate,
  normalizeUserProfile,
  selectMissionHousing,
  selectUniversityId,
  universityProfilePatch,
} from '../profileCompat';

describe('profile compatibility', () => {
  it('normalizes legacy university and dormitory fields', () => {
    const profile = normalizeUserProfile({
      university: 'snu',
      housing: 'dormitory',
    });

    expect(profile.universityId).toBe('snu');
    expect(profile.housingType).toBe('dormitory');
    expect(selectUniversityId(profile)).toBe('snu');
    expect(selectMissionHousing(profile)).toBe('dormitory');
    expect(profile.onboardingCompletedAt).toBeNull();
  });

  it('does not invent a detailed housing type for legacy off-campus data', () => {
    const profile = normalizeUserProfile({ housing: 'off-campus' });
    expect(profile.housingType).toBe(UNKNOWN);
    expect(selectMissionHousing(profile)).toBe('off-campus');
  });

  it('preserves a registered district without treating it as a global condition axis', () => {
    const profile = normalizeUserProfile({ residenceDistrict: 'Mapo-gu' });
    expect(profile.residenceDistrict).toBe('Mapo-gu');
  });

  it('mirrors canonical edits into cultural compatibility fields', () => {
    expect(universityProfilePatch('yonsei')).toEqual({
      universityId: 'yonsei',
      university: 'yonsei',
    });
    expect(housingProfilePatch('third_party_lease')).toEqual({
      housingType: 'third_party_lease',
      housing: 'off-campus',
    });
  });

  it('guards unknown dates before phase calculations', () => {
    expect(knownProfileDate(UNKNOWN)).toBeNull();
    expect(knownProfileDate(null)).toBeNull();
    expect(knownProfileDate('2026-08-02')).toBe('2026-08-02');
  });

  it('prefers canonical condition fields when both shapes exist', () => {
    const profile = normalizeUserProfile({
      university: 'snu',
      universityId: 'yonsei',
      housing: 'dormitory',
      housingType: 'own_lease',
    }) as UserProfile;
    expect(selectUniversityId(profile)).toBe('yonsei');
    expect(selectMissionHousing(profile)).toBe('off-campus');
  });
});
