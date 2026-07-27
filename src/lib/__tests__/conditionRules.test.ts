import {
  CONDITION_AXES,
  CONDITION_AXIS_GROUPS,
  appliesWhenMatches,
  evaluateAppliesWhen,
  evaluateGroupRegistration,
  evaluateHousingContract,
  getHousingProofDocuments,
  evaluateResidenceRegistration,
  isUnknownConditionValue,
  validateConditionProfile,
  type RuleVerdict,
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

// ---------------------------------------------------------------------------
// 속성 기반 불변식 INV-1 ~ INV-4
//
// 명세: k-journey/42-k-journey-nonfunctional-acceptance-2026-07-26.md §4
// 이 블록이 생긴 이유:
//   TC-156~159 네 ID가 이 파일 30행의 주석 한 줄에만 있었고, 그 밑 테스트는
//   축 이름 assertion이라 조합을 돌지 않았다. "ID가 있다"가 "검증이 있다"로
//   읽히고 있었다 — 47-k-journey-role-review-unscored-dec-round2-2026-07-27.md §2.2 ★12.
//   판단 기록은 31-k-journey-decision-log-2026-07-25.md DEC-034.
// ---------------------------------------------------------------------------

const HOUSING_TYPES = [
  'dormitory',
  'own_lease',
  'third_party_lease',
  'registered_business',
  UNKNOWN,
] as const;

const CONTRACT_HOLDERS = ['self', 'third_party', 'none', 'undecided', 'n_a', UNKNOWN] as const;

const VISA_STATUSES = ['D-2-6', 'D-2-8', 'visa_free', 'other', UNKNOWN] as const;

// 경계를 고른 이유: DEC-021이 정한 28일 경계(< 28 확정 차단 / >= 28 판정 보류)와
// REQ-DAR-003의 90일 경계 양쪽을 건드린다. 임의의 값을 늘리는 것보다 경계가 잡는다.
const STAY_DAYS = [0, 27, 28, 29, 90, 91, 120, UNKNOWN] as const;

// universityId 순회 축 — 2026-07-27 ★20 으로 추가했다.
//
// DEC-034 반례 ② 는 "순회 밖으로 고정한 축들은 판정에 쓰이지 않는다고 가정했고 확인하지 않았다"
// 고 적었다. 확인해 보니 그 가정은 틀렸다:
//   evaluateGroupRegistration 은 totalStayDays < 28 분기에서 universityId 로 3갈래를 낸다
//   (conditionRules.ts:482-505) — UNKNOWN -> review_required / 'yonsei' -> locked_permanent /
//   그 외 -> review_required.
//   'yonsei' 는 이 순회에서 locked_permanent 를 내는 유일한 값이다. 고정값을 'cau' 로 바꾸면
//   INV-3 의 seenPermanentBlock > 0 이 무너져 TC-158 이 실패한다 — 실제로 재현했다.
//   즉 INV-3 의 "생존 확인"이 순회 밖 고정값에 의존하고 있었다.
// 세 값의 뜻: UNKNOWN(미확인) · 'yonsei'(확인된 규칙이 있는 대학) · 'cau'(그 외 — 확인된 규칙이 없다).
// REQ-SFR-011 이 등급 A 로 "연세대 확인분 한정"이라 적은 그 경계를 그대로 순회한다.
const UNIVERSITY_IDS = [UNKNOWN, 'yonsei', 'cau'] as const;

// 값은 conditionRules.ts 의 RuleVerdict 유니온에서 그대로 가져온다.
// 처음에 'permanent_block' 으로 적었다가 이 순회가 틀렸다고 알려 주었다 — 실제 리터럴은 'locked_permanent' 다.
const RULE_STATUSES = ['applicable', 'not_applicable', 'review_required', 'locked_permanent'];

/** 조합 순회 — 3 × 5 × 6 × 5 × 8 = 3600개 프로파일. (2026-07-27 ★20: 1200 -> 3600) */
const COMBINATION_COUNT =
  UNIVERSITY_IDS.length *
  HOUSING_TYPES.length *
  CONTRACT_HOLDERS.length *
  VISA_STATUSES.length *
  STAY_DAYS.length;

function* everyCombination(): Generator<ConditionProfile> {
  for (const universityId of UNIVERSITY_IDS) {
    for (const housingType of HOUSING_TYPES) {
      for (const contractHolder of CONTRACT_HOLDERS) {
        for (const visaTypeOrStatus of VISA_STATUSES) {
          for (const totalStayDays of STAY_DAYS) {
            yield { ...profile, universityId, housingType, contractHolder, visaTypeOrStatus, totalStayDays };
          }
        }
      }
    }
  }
}

const EVALUATORS: ReadonlyArray<[string, (p: ConditionProfile) => RuleVerdict]> = [
  ['evaluateResidenceRegistration', evaluateResidenceRegistration],
  ['evaluateGroupRegistration', evaluateGroupRegistration],
];

describe('INV-1 ~ INV-4: property-based invariants over condition combinations', () => {
  it('TC-156 / INV-1: every combination yields exactly one known verdict', () => {
    const offenders: string[] = [];
    let checked = 0;

    for (const candidate of everyCombination()) {
      for (const [name, evaluate] of EVALUATORS) {
        const verdict = evaluate(candidate);
        checked += 1;
        if (!verdict || !RULE_STATUSES.includes(verdict.status)) {
          offenders.push(`${name}: ${JSON.stringify(candidate)} -> ${JSON.stringify(verdict)}`);
        }
      }
    }

    // 미판정 0건 · 5종 외 결과 0건 (42 §4 TC-156 기대)
    expect(offenders).toEqual([]);
    // 2026-07-27 ★20: 1200 -> 3600. 숫자를 손으로 적지 않고 축 길이의 곱으로 잰다.
    expect(COMBINATION_COUNT).toBe(3600);
    expect(checked).toBe(COMBINATION_COUNT * EVALUATORS.length);
  });

  it('TC-157 / INV-2: an unknown axis never yields an applicable verdict for rules that depend on it', () => {
    const offenders: string[] = [];

    for (const candidate of everyCombination()) {
      for (const [name, evaluate] of EVALUATORS) {
        const verdict = evaluate(candidate);
        if (verdict.status !== 'applicable') continue;
        // applicable 로 판정했다면, 그 판정이 읽은 축 중 미확인이 있으면 안 된다.
        if (isUnknownConditionValue(candidate.totalStayDays)) {
          offenders.push(`${name}: applicable with unknown totalStayDays`);
        }
        if (name === 'evaluateResidenceRegistration' && isUnknownConditionValue(candidate.visaTypeOrStatus)) {
          offenders.push(`${name}: applicable with unknown visaTypeOrStatus`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('TC-158 / INV-3: not_applicable and permanent_block always carry a reason and a source or final authority', () => {
    const offenders: string[] = [];
    let seenNotApplicable = 0;
    let seenPermanentBlock = 0;
    // 2026-07-27 ★20: locked_permanent 를 어느 universityId 가 냈는지 기록한다.
    // 이전에는 이 축이 순회 밖에 'yonsei' 로 고정돼 있어서, 생존 확인이 고정값에 의존한다는 것을
    // 테스트가 스스로 말할 수 없었다. 이제 순회 안에 있으므로 출처를 셀 수 있다.
    const permanentBlockBy = new Set<string>();

    for (const candidate of everyCombination()) {
      for (const [name, evaluate] of EVALUATORS) {
        const verdict = evaluate(candidate);
        if (verdict.status !== 'not_applicable' && verdict.status !== 'locked_permanent') continue;

        if (verdict.status === 'not_applicable') seenNotApplicable += 1;
        else {
          seenPermanentBlock += 1;
          permanentBlockBy.add(String(candidate.universityId));
        }

        const grounded =
          Boolean((verdict as { sourceUrl?: string }).sourceUrl) ||
          Boolean((verdict as { finalAuthority?: string }).finalAuthority);
        if (!verdict.reason || !grounded) {
          offenders.push(`${name}: ${verdict.status} without reason/source — ${JSON.stringify(candidate)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
    // 순회가 실제로 두 상태를 만들었는지 확인한다. 0건이면 이 테스트는 아무것도 보지 않은 것이다.
    expect(seenNotApplicable).toBeGreaterThan(0);
    expect(seenPermanentBlock).toBeGreaterThan(0);
    // 2026-07-27 ★20: locked_permanent 는 'yonsei' 에서만 나온다 — REQ-SFR-011 이 등급 A 로
    // "연세대 확인분 한정"이라 적은 그대로다. 다른 대학에서도 나오면 근거 없는 일반화이고,
    // 아무 데서도 안 나오면 확인된 규칙이 사라진 것이다. 양쪽 다 실패로 잡는다.
    expect([...permanentBlockBy].sort()).toEqual(['yonsei']);
  });

  it('TC-159 / INV-4: the same input yields the same verdict across 10 runs', () => {
    const offenders: string[] = [];

    for (const candidate of everyCombination()) {
      for (const [name, evaluate] of EVALUATORS) {
        const first = JSON.stringify(evaluate(candidate));
        for (let run = 2; run <= 10; run += 1) {
          if (JSON.stringify(evaluate(candidate)) !== first) {
            offenders.push(`${name}: run ${run} differed — ${JSON.stringify(candidate)}`);
            break;
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
