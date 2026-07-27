import type {
  ConditionAxis,
  ConditionProfile,
  ContractHolder,
  HousingType,
  UnknownValue,
  UserProfile,
} from './firebase';
import { UNKNOWN } from './firebase';

export const CONDITION_AXES: readonly ConditionAxis[] = [
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
];

/** The glossary calls the final three date fields one conceptual axis group. */
export const CONDITION_AXIS_GROUPS = [
  'universityId',
  'programType',
  'visaTypeOrStatus',
  'housingType',
  'contractHolder',
  'totalStayDays',
  'nationality',
  'homeCountryInsurance',
  'residenceCardStatus',
  'dates',
] as const;

export type ConditionExpression =
  | {
      field: ConditionAxis;
      equals: ConditionProfile[ConditionAxis] | readonly ConditionProfile[ConditionAxis][];
    }
  | {
      field: ConditionAxis;
      notEquals: ConditionProfile[ConditionAxis] | readonly ConditionProfile[ConditionAxis][];
    }
  | { all: readonly ConditionExpression[] }
  | { any: readonly ConditionExpression[] }
  | { not: ConditionExpression };

export type AppliesWhen =
  | ConditionExpression
  | ((profile: ConditionProfile) => boolean | AppliesWhenEvaluation);

export type AppliesWhenStatus = 'matches' | 'does_not_match' | 'unknown';

export interface AppliesWhenEvaluation {
  status: AppliesWhenStatus;
  unknownFields: readonly ConditionAxis[];
}

export interface RuleReview {
  status: 'review_required';
  reason: string;
  pendingFields: readonly ConditionAxis[];
  finalAuthority: string;
}

export interface RuleNotApplicable {
  status: 'not_applicable';
  reason: string;
  sourceUrl: string;
  finalAuthority: string;
}

export interface RuleApplicable {
  status: 'applicable';
  dueRule?: DueRule;
}

export interface RulePermanentBlock {
  status: 'locked_permanent';
  reason: string;
  alternativeMeans: string;
  sourceUrl: string;
}

export type RuleVerdict =
  | RuleApplicable
  | RuleNotApplicable
  | RuleReview
  | RulePermanentBlock;

export interface DueRule {
  kind: 'arrival_plus_days';
  days: 90;
}

export interface HousingContractApplicable {
  status: 'applicable';
  requiredDocuments: readonly string[];
  requiresThirdParty: boolean;
}

export interface HousingContractReview {
  status: 'review_required';
  reason: string;
  pendingFields: readonly ('housingType' | 'contractHolder')[];
  finalAuthority: string;
}

export type HousingContractEvaluation = HousingContractApplicable | HousingContractReview;

const RESIDENCE_REGISTRATION_SOURCE =
  'https://www.immigration.go.kr/bbs/moj/93/559234/artclView.do';
const RESIDENCE_PROOF_SOURCE =
  'https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133';
const UNIVERSITY_INTERNATIONAL_OFFICE = 'the university international office';

function uniqueAxes(fields: readonly ConditionAxis[]): ConditionAxis[] {
  return [...new Set(fields)];
}

export function isUnknownConditionValue(value: unknown): value is UnknownValue {
  return value === UNKNOWN || value === null || value === undefined;
}

function evaluateLeaf(
  field: ConditionAxis,
  profile: ConditionProfile,
  operator: 'equals' | 'notEquals',
  expected: ConditionProfile[ConditionAxis] | readonly ConditionProfile[ConditionAxis][],
): AppliesWhenEvaluation {
  const actual = profile[field];
  if (isUnknownConditionValue(actual)) {
    return { status: 'unknown', unknownFields: [field] };
  }

  const expectedValues = Array.isArray(expected) ? expected : [expected];
  const matches = expectedValues.includes(actual);
  const status = operator === 'equals' ? matches : !matches;
  return {
    status: status ? 'matches' : 'does_not_match',
    unknownFields: [],
  };
}

function invertStatus(status: AppliesWhenStatus): AppliesWhenStatus {
  if (status === 'matches') return 'does_not_match';
  if (status === 'does_not_match') return 'matches';
  return 'unknown';
}

/**
 * Evaluates a task's declarative `appliesWhen` expression without importing
 * React or any screen module. The tri-state result preserves unknown inputs so
 * callers can return `review_required` instead of guessing a default.
 */
export function evaluateAppliesWhen(
  expression: AppliesWhen | undefined,
  profile: ConditionProfile,
): AppliesWhenEvaluation {
  if (!expression) return { status: 'matches', unknownFields: [] };

  if (typeof expression === 'function') {
    const result = expression(profile);
    if (typeof result === 'boolean') {
      return {
        status: result ? 'matches' : 'does_not_match',
        unknownFields: [],
      };
    }
    return result;
  }

  if ('field' in expression) {
    if ('equals' in expression) {
      return evaluateLeaf(expression.field, profile, 'equals', expression.equals);
    }
    return evaluateLeaf(expression.field, profile, 'notEquals', expression.notEquals);
  }

  if ('not' in expression) {
    const result = evaluateAppliesWhen(expression.not, profile);
    return { status: invertStatus(result.status), unknownFields: result.unknownFields };
  }

  const expressions = 'all' in expression ? expression.all : expression.any;
  const results = expressions.map((item) => evaluateAppliesWhen(item, profile));
  const unknownFields = uniqueAxes(results.flatMap((result) => result.unknownFields));

  if ('all' in expression) {
    if (results.some((result) => result.status === 'does_not_match')) {
      return { status: 'does_not_match', unknownFields };
    }
    if (results.some((result) => result.status === 'unknown')) {
      return { status: 'unknown', unknownFields };
    }
    return { status: 'matches', unknownFields: [] };
  }

  if (results.some((result) => result.status === 'matches')) {
    return { status: 'matches', unknownFields };
  }
  if (results.some((result) => result.status === 'unknown')) {
    return { status: 'unknown', unknownFields };
  }
  return { status: 'does_not_match', unknownFields: [] };
}

export function appliesWhenMatches(
  expression: AppliesWhen | undefined,
  profile: ConditionProfile,
): boolean {
  return evaluateAppliesWhen(expression, profile).status === 'matches';
}

export function conditionProfileFromUserProfile(profile: UserProfile): ConditionProfile {
  return profile;
}

export function changedConditionAxes(
  previous: ConditionProfile,
  next: ConditionProfile,
): ConditionAxis[] {
  return CONDITION_AXES.filter((axis) => previous[axis] !== next[axis]);
}

export interface ConditionValidationResult {
  valid: boolean;
  invalidFields: readonly ConditionAxis[];
}

export function validateConditionProfile(profile: ConditionProfile): ConditionValidationResult {
  const invalidFields: ConditionAxis[] = [];
  if (
    !isUnknownConditionValue(profile.totalStayDays) &&
    (!Number.isInteger(profile.totalStayDays) || profile.totalStayDays < 0)
  ) {
    invalidFields.push('totalStayDays');
  }
  return { valid: invalidFields.length === 0, invalidFields };
}

/** REQ-SFR-001's four housing × five contract-holder matrix. */
export function evaluateHousingContract(
  housingType: HousingType,
  contractHolder: ContractHolder,
): HousingContractEvaluation {
  if (isUnknownConditionValue(housingType) || isUnknownConditionValue(contractHolder)) {
    return {
      status: 'review_required',
      reason: 'Enter the housing type and contract holder to identify the documents.',
      pendingFields: [
        ...(isUnknownConditionValue(housingType) ? (['housingType'] as const) : []),
        ...(isUnknownConditionValue(contractHolder) ? (['contractHolder'] as const) : []),
      ],
      finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
    };
  }

  if (contractHolder === 'undecided') {
    return {
      status: 'review_required',
      reason: 'Enter the contract holder to identify the documents.',
      pendingFields: ['contractHolder'],
      finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
    };
  }

  if (housingType === 'dormitory' && (contractHolder === 'none' || contractHolder === 'n_a')) {
    return {
      status: 'applicable',
      requiredDocuments: ['dormitory admission confirmation'],
      requiresThirdParty: true,
    };
  }

  if (housingType === 'own_lease' && contractHolder === 'self') {
    return {
      status: 'applicable',
      requiredDocuments: ['lease agreement'],
      requiresThirdParty: false,
    };
  }

  if (housingType === 'own_lease' && contractHolder === 'third_party') {
    return {
      status: 'applicable',
      requiredDocuments: [
        'lease agreement',
        'proof of accommodation',
        'contract holder identification copy',
      ],
      requiresThirdParty: true,
    };
  }

  if (housingType === 'third_party_lease' && contractHolder === 'third_party') {
    return {
      status: 'applicable',
      requiredDocuments: ['proof of accommodation', 'contract holder identification copy'],
      requiresThirdParty: true,
    };
  }

  if (
    housingType === 'registered_business' &&
    (contractHolder === 'third_party' || contractHolder === 'n_a')
  ) {
    return {
      status: 'applicable',
      requiredDocuments: [
        'proof of accommodation',
        'business registration certificate',
        'accommodation-use proof',
      ],
      requiresThirdParty: true,
    };
  }

  return {
    status: 'review_required',
    reason: 'This housing and contract-holder combination needs confirmation.',
    pendingFields: ['housingType', 'contractHolder'],
    finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
  };
}

/** REQ-SFR-005 and the DEC-021 28-day boundary, kept as separate rules. */
export function evaluateResidenceRegistration(profile: ConditionProfile): RuleVerdict {
  const totalStayDays = profile.totalStayDays;
  const visa = profile.visaTypeOrStatus;
  const pendingFields: ConditionAxis[] = [];

  if (isUnknownConditionValue(totalStayDays)) pendingFields.push('totalStayDays');
  if (isUnknownConditionValue(visa)) pendingFields.push('visaTypeOrStatus');
  if (pendingFields.length > 0) {
    return {
      status: 'review_required',
      reason: 'Enter the stay length and visa status to assess residence registration.',
      pendingFields,
      finalAuthority: 'the Ministry of Justice and HiKorea',
    };
  }

  if (typeof totalStayDays !== 'number' || !Number.isInteger(totalStayDays) || totalStayDays < 0) {
    return {
      status: 'review_required',
      reason: 'Enter a whole number of stay days to assess residence registration.',
      pendingFields: ['totalStayDays'],
      finalAuthority: 'the university international office',
    };
  }

  if (totalStayDays <= 90 || visa === 'visa_free') {
    return {
      status: 'not_applicable',
      reason:
        totalStayDays <= 90
          ? 'Short stays of 90 days or fewer do not require residence registration.'
          : 'Visa-free status does not require residence registration under this rule.',
      sourceUrl: RESIDENCE_REGISTRATION_SOURCE,
      finalAuthority: 'the Ministry of Justice and HiKorea',
    };
  }

  return {
    status: 'applicable',
    dueRule: { kind: 'arrival_plus_days', days: 90 },
  };
}

export function evaluateGroupRegistration(profile: ConditionProfile): RuleVerdict {
  const totalStayDays = profile.totalStayDays;
  if (isUnknownConditionValue(totalStayDays)) {
    return {
      status: 'review_required',
      reason: 'Enter the total stay length to assess group registration eligibility.',
      pendingFields: ['totalStayDays'],
      finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
    };
  }

  if (typeof totalStayDays !== 'number' || !Number.isInteger(totalStayDays) || totalStayDays < 0) {
    return {
      status: 'review_required',
      reason: 'Enter a whole number of stay days to assess group registration eligibility.',
      pendingFields: ['totalStayDays'],
      finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
    };
  }

  if (totalStayDays < 28) {
    if (isUnknownConditionValue(profile.universityId)) {
      return {
        status: 'review_required',
        reason: 'Confirm the university before assessing group registration eligibility.',
        pendingFields: ['universityId'],
        finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
      };
    }

    if (profile.universityId === 'yonsei') {
      return {
        status: 'locked_permanent',
        reason: 'Yonsei University guidance excludes stays shorter than one month from group registration.',
        alternativeMeans: 'Make an individual appointment through HiKorea.',
        sourceUrl: RESIDENCE_PROOF_SOURCE,
      };
    }

    return {
      status: 'review_required',
      reason: 'Confirm group registration eligibility with the university international office.',
      pendingFields: ['universityId'],
      finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
    };
  }

  return {
    status: 'review_required',
    reason: 'The app does not collect the accommodation duration needed for this decision.',
    pendingFields: [],
    finalAuthority: UNIVERSITY_INTERNATIONAL_OFFICE,
  };
}
