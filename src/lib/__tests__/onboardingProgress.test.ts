import {
  clearOnboardingProgress,
  getOnboardingProgress,
  onboardingRoutePath,
  setOnboardingProgress,
  storage,
} from '../storage';
import { UNKNOWN, updateUserProfile } from '../firebase';

describe('onboarding progress', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  // REQ-TER-003 · POL-001 · TC-133.
  it('restores the current route after a cold start', () => {
    setOnboardingProgress('housing');

    expect(getOnboardingProgress()).toEqual({ currentRoute: 'housing' });
    expect(onboardingRoutePath(getOnboardingProgress()!.currentRoute)).toBe(
      '/(onboarding)/housing',
    );
  });

  it('rejects a corrupted route and clears completed onboarding progress', () => {
    storage.set('onboarding:progress:v1', JSON.stringify({ currentRoute: 'not-a-route' }));
    expect(getOnboardingProgress()).toBeNull();

    setOnboardingProgress('era');
    clearOnboardingProgress();
    expect(getOnboardingProgress()).toBeNull();
  });
});

describe('onboarding condition persistence', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  // REQ-DAR-001 · REQ-DAR-003 · REQ-DAR-004 · REQ-DAR-005 · POL-003 · TC-061 · TC-073 · TC-079 · TC-085.
  it('stores every condition axis locally, including explicit unknown values', async () => {
    await updateUserProfile({
      universityId: 'yonsei',
      programType: UNKNOWN,
      visaTypeOrStatus: 'D-2-6',
      housingType: 'registered_business',
      contractHolder: UNKNOWN,
      totalStayDays: 120,
      nationality: UNKNOWN,
      homeCountryInsurance: 'no',
      arrivalDate: '2026-08-01',
      departureDate: UNKNOWN,
      programStartDate: '2026-08-03',
    });

    const stored = JSON.parse(storage.getString('profile:cache:v1') ?? '{}');
    expect(stored).toMatchObject({
      universityId: 'yonsei',
      programType: UNKNOWN,
      visaTypeOrStatus: 'D-2-6',
      housingType: 'registered_business',
      contractHolder: UNKNOWN,
      totalStayDays: 120,
      nationality: UNKNOWN,
      homeCountryInsurance: 'no',
      residenceCardStatus: UNKNOWN,
      arrivalDate: '2026-08-01',
      departureDate: UNKNOWN,
      programStartDate: '2026-08-03',
    });
  });
});
