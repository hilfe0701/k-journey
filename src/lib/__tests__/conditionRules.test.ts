import {
  CONDITION_AXES,
  CONDITION_AXIS_GROUPS,
  appliesWhenMatches,
  evaluateAppliesWhen,
  evaluateGroupRegistration,
  evaluateHousingContract,
  evaluateResidenceRegistration,
  validateConditionProfile,
} from '../conditionRules';
import { UNKNOWN, type ConditionProfile } from '../firebase';

const profile: ConditionProfile = {
  universityId: 'yonsei',
  programType: 'exchange',
  visaTypeOrStatus: 'D-2-6',
  housingType: 'own_lease',
  contractHolder: 'self',
  totalStayDays: 120,
  nationality: 'CA',
  homeCountryInsurance: 'yes',
  residenceCardStatus: 'not_started',
  arrivalDate: '2026-08-01',
  departureDate: '2026-11-29',
  programStartDate: '2026-08-03',
};

describe('condition axes', () => {
  it('declares the ten glossary groups, including the three date fields', () => {
    expect(CONDITION_AXIS_GROUPS).toHaveLength(10);
    expect(CONDITION_AXES).toEqual([
      'universityId',
      'programType',
      'visaTypeOrStatus',
      'housingType',
      'contractHolder',
      'totalStayDays',
      'nationality',
      'homeCountryInsurance',
      'residenceCardStatus',
      'arrivalDate',
      'departureDate',
      'programStartDate',
    ]);
  });

  it('keeps unknown explicit across every condition field', () => {
    const unknownProfile: ConditionProfile = {
      universityId: UNKNOWN,
      programType: UNKNOWN,
      visaTypeOrStatus: UNKNOWN,
      housingType: UNKNOWN,
      contractHolder: UNKNOWN,
      totalStayDays: UNKNOWN,
      nationality: UNKNOWN,
      homeCountryInsurance: UNKNOWN,
      residenceCardStatus: UNKNOWN,
      arrivalDate: UNKNOWN,
      departureDate: UNKNOWN,
      programStartDate: UNKNOWN,
    };

    expect(Object.values(unknownProfile).every((value) => value === UNKNOWN)).toBe(true);
    expect(validateConditionProfile(unknownProfile)).toEqual({ valid: true, invalidFields: [] });
  });
});

describe('evaluateAppliesWhen', () => {
  it('evaluates a matching expression without UI dependencies', () => {
    const result = evaluateAppliesWhen(
      {
        all: [
          { field: 'programType', equals: 'exchange' },
          { field: 'housingType', equals: ['own_lease', 'third_party_lease'] },
        ],
      },
      profile,
    );

    expect(result).toEqual({ status: 'matches', unknownFields: [] });
    expect(
      appliesWhenMatches({ field: 'visaTypeOrStatus', notEquals: 'visa_free' }, profile),
    ).toBe(true);
  });

  it('keeps unknown separate from false', () => {
    expect(
      evaluateAppliesWhen({ field: 'visaTypeOrStatus', equals: 'D-2-8' }, profile),
    ).toEqual({ status: 'does_not_match', unknownFields: [] });

    const unknownVisa = { ...profile, visaTypeOrStatus: UNKNOWN };
    expect(
      evaluateAppliesWhen({ field: 'visaTypeOrStatus', equals: 'D-2-8' }, unknownVisa),
    ).toEqual({ status: 'unknown', unknownFields: ['visaTypeOrStatus'] });
  });
});

describe('housing × contract-holder rules', () => {
  const housingTypes = [
    'dormitory',
    'own_lease',
    'third_party_lease',
    'registered_business',
  ] as const;
  const contractHolders = ['self', 'third_party', 'none', 'undecided', 'n_a'] as const;

  it('evaluates all 4 × 5 explicit combinations without a default value', () => {
    for (const housingType of housingTypes) {
      for (const contractHolder of contractHolders) {
        const result = evaluateHousingContract(housingType, contractHolder);
        expect(['applicable', 'review_required']).toContain(result.status);
      }
    }
  });

  it('returns the six defined document combinations', () => {
    expect(evaluateHousingContract('dormitory', 'n_a').status).toBe('applicable');
    expect(evaluateHousingContract('own_lease', 'self').status).toBe('applicable');
    expect(evaluateHousingContract('own_lease', 'third_party').status).toBe('applicable');
    expect(evaluateHousingContract('third_party_lease', 'third_party').status).toBe('applicable');
    expect(evaluateHousingContract('registered_business', 'third_party').status).toBe('applicable');
    expect(evaluateHousingContract('registered_business', 'n_a').status).toBe('applicable');
  });

  it('returns a reason and final authority for unknown or undecided combinations', () => {
    const unknown = evaluateHousingContract(UNKNOWN, UNKNOWN);
    const undecided = evaluateHousingContract('own_lease', 'undecided');

    expect(unknown).toMatchObject({ status: 'review_required', pendingFields: ['housingType', 'contractHolder'] });
    expect(undecided).toMatchObject({
      status: 'review_required',
      pendingFields: ['contractHolder'],
    });
    if (undecided.status === 'review_required') {
      expect(undecided.reason).toBeTruthy();
      expect(undecided.finalAuthority).toBeTruthy();
    }
  });
});

describe('visa and stay-day boundaries', () => {
  it.each(['D-2-6', 'D-2-8', 'visa_free', UNKNOWN] as const)(
    'accepts visa value %s without changing the axis type',
    (visaTypeOrStatus) => {
      const result = evaluateResidenceRegistration({ ...profile, visaTypeOrStatus });
      expect(result.status).toBeDefined();
    },
  );

  it('uses the confirmed 28-day boundary for Yonsei group registration', () => {
    expect(evaluateGroupRegistration({ ...profile, totalStayDays: 27 }).status).toBe(
      'locked_permanent',
    );
    expect(evaluateGroupRegistration({ ...profile, totalStayDays: 28 }).status).toBe(
      'review_required',
    );
    expect(evaluateGroupRegistration({ ...profile, totalStayDays: 29 }).status).toBe(
      'review_required',
    );
  });

  it('uses the 90-day residence-registration rule', () => {
    expect(evaluateResidenceRegistration({ ...profile, totalStayDays: 90 }).status).toBe(
      'not_applicable',
    );
    expect(evaluateResidenceRegistration({ ...profile, totalStayDays: 91 }).status).toBe(
      'applicable',
    );
  });

  it('returns a reason and official source for not_applicable', () => {
    const result = evaluateResidenceRegistration({
      ...profile,
      totalStayDays: 60,
      visaTypeOrStatus: 'D-2-6',
    });

    expect(result).toMatchObject({ status: 'not_applicable' });
    if (result.status === 'not_applicable') {
      expect(result.reason).toBeTruthy();
      expect(result.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
