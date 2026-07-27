import {
  CONDITION_AXES,
  CONDITION_AXIS_GROUPS,
  appliesWhenMatches,
  evaluateAppliesWhen,
  evaluateGroupRegistration,
  evaluateHousingContract,
  getHousingProofDocuments,
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
  // REQ-TER-001 · TC-156 · TC-157 · TC-158 · TC-159: condition-axis combinations.
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

  // REQ-SFR-001 · POL-003 · POL-006 · TC-001 · TC-003 · TC-005 · TC-101.
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

  // REQ-SFR-001 · POL-006 · TC-002.
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

  it('removes the third-party lease copy when the provider address matches', () => {
    const matching = getHousingProofDocuments('own_lease', 'third_party', true);
    const differing = getHousingProofDocuments('own_lease', 'third_party', false);
    const unanswered = getHousingProofDocuments('own_lease', 'third_party', null);

    expect(matching).toMatchObject({ status: 'applicable' });
    expect(differing).toMatchObject({ status: 'applicable' });
    expect(unanswered).toMatchObject({ status: 'applicable' });

    if (matching.status === 'applicable') {
      expect(matching.documents.find((document) => document.id === 'contract-holder-lease')?.required).toBe(false);
    }
    if (differing.status === 'applicable') {
      expect(differing.documents.find((document) => document.id === 'contract-holder-lease')?.required).toBe(true);
    }
    if (unanswered.status === 'applicable') {
      expect(unanswered.documents.find((document) => document.id === 'contract-holder-lease')?.required).toBeNull();
    }
  });

  it('returns the three requested-provider documents for registered business accommodation', () => {
    const result = getHousingProofDocuments('registered_business', 'third_party');

    expect(result).toMatchObject({ status: 'applicable', requiresThirdParty: true });
    if (result.status === 'applicable') {
      expect(result.documents).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'business-accommodation-proof', requestedFrom: 'Accommodation provider' }),
          expect.objectContaining({ id: 'business-registration', requestedFrom: 'Accommodation provider' }),
          expect.objectContaining({ id: 'current-rent-receipt', requestedFrom: 'Accommodation provider or payment service' }),
        ]),
      );
      expect(result.documents).toHaveLength(3);
    }
  });

  it('does not add provider documents to a self-held lease', () => {
    const result = getHousingProofDocuments('own_lease', 'self');

    expect(result).toMatchObject({ status: 'applicable', requiresThirdParty: false });
    if (result.status === 'applicable') {
      expect(result.documents).toEqual([
        expect.objectContaining({ id: 'lease-agreement', requestedFrom: 'You' }),
      ]);
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

  // REQ-SFR-011 · POL-006 · TC-051 · TC-052.
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
