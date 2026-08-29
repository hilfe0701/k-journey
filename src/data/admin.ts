/**
 * Administrative guidance that is shared by Essentials and the emergency
 * guide.
 *
 * This module deliberately keeps the distinction between a known authority
 * and a user's actual address. A university campus is a useful dormitory
 * proxy, but an off-campus neighbourhood cannot be inferred from the school.
 * When the address is missing we return `review_required` instead of sending
 * a student to the wrong immigration office or 주민센터.
 */

import type { ContentEvidence } from '../lib/contentEvidence';
import type {
  ConditionProfile,
  HousingType,
  UnknownValue,
  VisaTypeOrStatus,
} from '../lib/firebase';
import { UNKNOWN } from '../lib/firebase';
import type { TaskMetadata, TaskSourceMetadata } from '../lib/taskState';

export const ADMIN_CONTENT_CHECKED_AT = '2026-08-29';
export const ADMIN_REVIEW_AFTER = '2026-09-28';

const IMMIGRATION_JURISDICTION_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.immigration.go.kr/immigration/2057/subview.do',
  sourceLabel: 'Korea Immigration Service — Seoul jurisdiction directory',
  checkedAt: ADMIN_CONTENT_CHECKED_AT,
  reviewAfter: ADMIN_REVIEW_AFTER,
  finalAuthority: 'Korea Immigration Service 1345 and the office listed below',
  conflictNote:
    'Jurisdiction follows the actual registered place of residence, not the university name. A dormitory result is a campus-address proxy and must be checked if the dorm is elsewhere.',
  volatility: 'medium',
  owner: 'Not confirmed (미확인)',
  conflictValues: [],
};

export const IMMIGRATION_CONFIRMATION_HREF = 'tel:1345';

export const IMMIGRATION_JURISDICTION_METADATA: TaskMetadata = {
  taskId: 'immigration-jurisdiction',
  title: 'Find your responsible immigration office',
  summary: 'Use your registered residence, not just your university, to choose the office.',
  source: IMMIGRATION_JURISDICTION_SOURCE,
};

const CIVIL_SERVICE_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.gov.kr/portal/orgInfo',
  sourceLabel: 'Government24 organisation search (정부24 기관찾기)',
  checkedAt: ADMIN_CONTENT_CHECKED_AT,
  reviewAfter: ADMIN_REVIEW_AFTER,
  finalAuthority: 'the community service center (주민센터) for the full registered address',
  conflictNote:
    'A district alone does not identify the exact dong community service center. Search the full address in Government24 or ask 120 before visiting.',
  volatility: 'medium',
  owner: 'Not confirmed (미확인)',
  conflictValues: [],
};

export type SupportedUniversityId =
  | 'cau'
  | 'yonsei'
  | 'korea'
  | 'snu'
  | 'skku'
  | 'hanyang'
  | 'ewha'
  | 'sogang'
  | 'hufs';

export type SeoulDistrict =
  | 'Gwanak-gu'
  | 'Gwangjin-gu'
  | 'Gangnam-gu'
  | 'Gangdong-gu'
  | 'Dongjak-gu'
  | 'Songpa-gu'
  | 'Seongdong-gu'
  | 'Seocho-gu'
  | 'Yongsan-gu'
  | 'Jongno-gu'
  | 'Jung-gu'
  | 'Eunpyeong-gu'
  | 'Dongdaemun-gu'
  | 'Jungnang-gu'
  | 'Dobong-gu'
  | 'Seongbuk-gu'
  | 'Gangbuk-gu'
  | 'Nowon-gu'
  | 'Seodaemun-gu'
  | 'Mapo-gu'
  | 'Gangseo-gu'
  | 'Yangcheon-gu'
  | 'Yeongdeungpo-gu'
  | 'Guro-gu'
  | 'Geumcheon-gu';

export interface ImmigrationOffice {
  id: 'seoul' | 'sejongno' | 'seoul-south';
  nameEn: string;
  nameKo: string;
  address: string;
  phone: string;
  href: string;
  jurisdictionDistricts: readonly SeoulDistrict[];
  evidence: TaskSourceMetadata;
}

const SEOUL_IMMIGRATION_HREF = 'https://www.immigration.go.kr/immigration/2057/subview.do';

const SEOUL_DISTRICTS: readonly SeoulDistrict[] = [
  'Gwanak-gu',
  'Gwangjin-gu',
  'Gangnam-gu',
  'Gangdong-gu',
  'Dongjak-gu',
  'Songpa-gu',
  'Seongdong-gu',
  'Seocho-gu',
  'Yongsan-gu',
];

const SEJONGNO_DISTRICTS: readonly SeoulDistrict[] = [
  'Jongno-gu',
  'Jung-gu',
  'Eunpyeong-gu',
  'Dongdaemun-gu',
  'Jungnang-gu',
  'Dobong-gu',
  'Seongbuk-gu',
  'Gangbuk-gu',
  'Nowon-gu',
];

const SEOUL_SOUTH_DISTRICTS: readonly SeoulDistrict[] = [
  'Seodaemun-gu',
  'Mapo-gu',
  'Gangseo-gu',
  'Yangcheon-gu',
  'Yeongdeungpo-gu',
  'Guro-gu',
  'Geumcheon-gu',
];

export const IMMIGRATION_OFFICES: readonly ImmigrationOffice[] = [
  {
    id: 'seoul',
    nameEn: 'Seoul Immigration Office',
    nameKo: '서울출입국·외국인청',
    address: '151 Mokdongdong-ro, Yangcheon-gu, Seoul (서울 양천구 목동동로 151)',
    phone: '02-2650-6214',
    href: SEOUL_IMMIGRATION_HREF,
    jurisdictionDistricts: SEOUL_DISTRICTS,
    evidence: IMMIGRATION_JURISDICTION_SOURCE,
  },
  {
    id: 'sejongno',
    nameEn: 'Seoul Immigration Office Sejongno Branch',
    nameKo: '서울출입국·외국인청 세종로출장소',
    address: '38 Jong-ro, Jongno-gu, Seoul (서울 종로구 종로 38)',
    phone: '02-731-1799',
    href: SEOUL_IMMIGRATION_HREF,
    jurisdictionDistricts: SEJONGNO_DISTRICTS,
    evidence: IMMIGRATION_JURISDICTION_SOURCE,
  },
  {
    id: 'seoul-south',
    nameEn: 'Seoul Southern Immigration Office',
    nameKo: '서울남부 출입국·외국인사무소',
    address: '48 Magokseo-1ro, Gangseo-gu, Seoul (서울 강서구 마곡서1로 48)',
    phone: '02-6980-4812',
    href: SEOUL_IMMIGRATION_HREF,
    jurisdictionDistricts: SEOUL_SOUTH_DISTRICTS,
    evidence: IMMIGRATION_JURISDICTION_SOURCE,
  },
] as const;

/** Campus districts are used only as the dormitory branch's address proxy. */
export const UNIVERSITY_CAMPUS_DISTRICTS: Readonly<
  Record<SupportedUniversityId, SeoulDistrict>
> = {
  cau: 'Dongjak-gu',
  yonsei: 'Seodaemun-gu',
  korea: 'Seongbuk-gu',
  snu: 'Gwanak-gu',
  skku: 'Jongno-gu',
  hanyang: 'Seongdong-gu',
  ewha: 'Seodaemun-gu',
  sogang: 'Mapo-gu',
  hufs: 'Dongdaemun-gu',
};

export interface CivilServiceAuthority {
  district: SeoulDistrict;
  label: string;
  href: string;
  evidence: TaskSourceMetadata;
  finalAuthority: string;
}

export function immigrationOfficeForDistrict(
  district: string | null | undefined,
): ImmigrationOffice | undefined {
  const canonical = canonicalSeoulDistrict(district);
  if (!canonical) return undefined;
  return IMMIGRATION_OFFICES.find((office) => office.jurisdictionDistricts.includes(canonical));
}

export function civilServiceForDistrict(
  district: string | null | undefined,
): CivilServiceAuthority | undefined {
  const canonical = canonicalSeoulDistrict(district);
  if (!canonical) return undefined;
  return {
    district: canonical,
    label: `${canonical} community service center (주민센터) — exact dong office depends on the full address`,
    href: CIVIL_SERVICE_SOURCE.sourceUrl,
    evidence: CIVIL_SERVICE_SOURCE,
    finalAuthority: CIVIL_SERVICE_SOURCE.finalAuthority,
  };
}

const DISTRICT_ALIASES: Readonly<Record<SeoulDistrict, readonly string[]>> = {
  'Gwanak-gu': ['gwanak', '관악구'],
  'Gwangjin-gu': ['gwangjin', '광진구'],
  'Gangnam-gu': ['gangnam', '강남구'],
  'Gangdong-gu': ['gangdong', '강동구'],
  'Dongjak-gu': ['dongjak', '동작구'],
  'Songpa-gu': ['songpa', '송파구'],
  'Seongdong-gu': ['seongdong', '성동구'],
  'Seocho-gu': ['seocho', '서초구'],
  'Yongsan-gu': ['yongsan', '용산구'],
  'Jongno-gu': ['jongno', '종로구'],
  'Jung-gu': ['jung', '중구'],
  'Eunpyeong-gu': ['eunpyeong', '은평구'],
  'Dongdaemun-gu': ['dongdaemun', '동대문구'],
  'Jungnang-gu': ['jungnang', '중랑구'],
  'Dobong-gu': ['dobong', '도봉구'],
  'Seongbuk-gu': ['seongbuk', '성북구'],
  'Gangbuk-gu': ['gangbuk', '강북구'],
  'Nowon-gu': ['nowon', '노원구'],
  'Seodaemun-gu': ['seodaemun', '서대문구'],
  'Mapo-gu': ['mapo', '마포구'],
  'Gangseo-gu': ['gangseo', '강서구'],
  'Yangcheon-gu': ['yangcheon', '양천구'],
  'Yeongdeungpo-gu': ['yeongdeungpo', 'yeongdeungpo', '영등포구'],
  'Guro-gu': ['guro', '구로구'],
  'Geumcheon-gu': ['geumcheon', '금천구'],
};

export function canonicalSeoulDistrict(
  district: string | null | undefined,
): SeoulDistrict | undefined {
  if (!district) return undefined;
  const normalised = district.trim().toLowerCase().replace(/\s+/g, '');
  return (Object.keys(DISTRICT_ALIASES) as SeoulDistrict[]).find((candidate) => {
    const aliases = DISTRICT_ALIASES[candidate];
    return aliases.some((alias) => normalised.includes(alias.toLowerCase().replace(/\s+/g, '')));
  });
}

export interface AdministrativeResolutionInput {
  universityId?: string | UnknownValue | null;
  housingType?: HousingType | null;
  /** The user's registered residence district, not a guessed neighbourhood. */
  residenceDistrict?: string | null;
}

export type AdministrativeResolutionStatus = 'resolved' | 'review_required';

export interface AdministrativeResolution {
  status: AdministrativeResolutionStatus;
  district: SeoulDistrict | null;
  immigrationOffice: ImmigrationOffice | null;
  civilService: CivilServiceAuthority | null;
  /** True when district came from the university campus rather than the address. */
  usesCampusProxy: boolean;
  pendingFields: readonly ('universityId' | 'housingType' | 'residenceDistrict')[];
  reason: string;
  finalAuthority: string;
  confirmationHref: string;
}

function isSupportedUniversityId(value: unknown): value is SupportedUniversityId {
  return typeof value === 'string' && value in UNIVERSITY_CAMPUS_DISTRICTS;
}

/**
 * Resolve the place to ask for residence/immigration and local civil-service
 * help. Off-campus results require a district because the app has no address
 * field; they never inherit the campus jurisdiction silently.
 */
export function resolveAdministrativeAuthorities(
  input: AdministrativeResolutionInput,
): AdministrativeResolution {
  const suppliedDistrict = canonicalSeoulDistrict(input.residenceDistrict);
  const universityId = input.universityId;
  const housingType = input.housingType;

  if (input.residenceDistrict && !suppliedDistrict) {
    return {
      status: 'review_required',
      district: null,
      immigrationOffice: null,
      civilService: null,
      usesCampusProxy: false,
      pendingFields: ['residenceDistrict'],
      reason:
        'This district is not in the Seoul jurisdiction table. Confirm the registered address with 1345 before choosing an office.',
      finalAuthority: IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    };
  }

  if (suppliedDistrict) {
    const immigrationOffice = immigrationOfficeForDistrict(suppliedDistrict) ?? null;
    return {
      status: immigrationOffice ? 'resolved' : 'review_required',
      district: suppliedDistrict,
      immigrationOffice,
      civilService: civilServiceForDistrict(suppliedDistrict) ?? null,
      usesCampusProxy: false,
      pendingFields: immigrationOffice ? [] : ['residenceDistrict'],
      reason: immigrationOffice
        ? 'Resolved from the registered residence district.'
        : 'Ask 1345 to confirm the responsible immigration office for this address.',
      finalAuthority: immigrationOffice
        ? immigrationOffice.evidence.finalAuthority
        : IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    };
  }

  if (!isSupportedUniversityId(universityId)) {
    return {
      status: 'review_required',
      district: null,
      immigrationOffice: null,
      civilService: null,
      usesCampusProxy: false,
      pendingFields: ['universityId'],
      reason:
        'Choose your university or enter your registered residence district before the responsible office can be identified.',
      finalAuthority: IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    };
  }

  if (housingType === 'dormitory') {
    const district = UNIVERSITY_CAMPUS_DISTRICTS[universityId];
    const immigrationOffice = immigrationOfficeForDistrict(district) ?? null;
    return {
      status: immigrationOffice ? 'resolved' : 'review_required',
      district,
      immigrationOffice,
      civilService: civilServiceForDistrict(district) ?? null,
      usesCampusProxy: true,
      pendingFields: immigrationOffice ? [] : ['residenceDistrict'],
      reason:
        'Dormitory branch uses the university campus district as a proxy. Confirm the dormitory address if it is not on or near campus.',
      finalAuthority: immigrationOffice
        ? immigrationOffice.evidence.finalAuthority
        : IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    };
  }

  if (housingType === UNKNOWN || !housingType) {
    return {
      status: 'review_required',
      district: null,
      immigrationOffice: null,
      civilService: null,
      usesCampusProxy: false,
      pendingFields: ['housingType'],
      reason:
        'Tell us whether you live in a dormitory or off campus. An off-campus address is needed to choose the jurisdiction.',
      finalAuthority: IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    };
  }

  const campusOffice = immigrationOfficeForDistrict(UNIVERSITY_CAMPUS_DISTRICTS[universityId]);
  return {
    status: 'review_required',
    district: null,
    immigrationOffice: null,
    civilService: null,
    usesCampusProxy: false,
    pendingFields: ['residenceDistrict'],
    reason:
      'Your off-campus residence may be under a different office from the campus. Enter the registered district and confirm it with 1345 before visiting.',
    finalAuthority: campusOffice?.evidence.finalAuthority ?? IMMIGRATION_JURISDICTION_SOURCE.finalAuthority,
    confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
  };
}

export function universityJurisdictionFor(
  universityId: string | UnknownValue | null | undefined,
): ImmigrationOffice | undefined {
  if (!isSupportedUniversityId(universityId)) return undefined;
  return immigrationOfficeForDistrict(UNIVERSITY_CAMPUS_DISTRICTS[universityId]);
}

const PART_TIME_WORK_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.immigration.go.kr/bbs/immigration_eng/230/454085/download.do',
  sourceLabel: 'Korea Immigration Service — Scope of Employment for international students',
  checkedAt: ADMIN_CONTENT_CHECKED_AT,
  reviewAfter: ADMIN_REVIEW_AFTER,
  finalAuthority: '1345 and your jurisdictional immigration office',
  conflictNote:
    'The official guide confirms prior permission is required but eligibility, hours, employer documents, and prohibited workplaces depend on the current status and application. Confirm these details before accepting a job.',
  volatility: 'high',
  owner: 'Not confirmed (미확인)',
  conflictValues: [],
};

export const PART_TIME_WORK_METADATA: TaskMetadata = {
  taskId: 'part-time-work-permission',
  title: 'Check part-time work permission',
  summary: 'Confirm permission before doing any paid work in Korea.',
  source: PART_TIME_WORK_SOURCE,
};

export interface PartTimeWorkEvaluation {
  status: 'permission_required' | 'review_required';
  /** Never false: this guide does not grant work authorisation. */
  requiresPermissionBeforeStarting: true | UnknownValue;
  eligibility: 'needs_review';
  applicationRoutes: readonly string[];
  pendingFields: readonly ['visaTypeOrStatus'] | readonly [];
  reason: string;
  finalAuthority: string;
  confirmationHref: string;
  source: TaskSourceMetadata;
}

/**
 * D-2-6 and D-2-8 are the only student statuses represented by the current
 * onboarding model. For both, the safe conclusion is "permission first";
 * this function intentionally does not claim that a particular job or number
 * of hours is permitted.
 */
export function evaluatePartTimeWork(
  visaTypeOrStatus: VisaTypeOrStatus | string | null | undefined,
): PartTimeWorkEvaluation {
  const studentStatus = visaTypeOrStatus === 'D-2-6' || visaTypeOrStatus === 'D-2-8';
  if (studentStatus) {
    return {
      status: 'permission_required',
      requiresPermissionBeforeStarting: true,
      eligibility: 'needs_review',
      applicationRoutes: ['HiKorea electronic civil petition', 'jurisdictional immigration office'],
      pendingFields: [],
      reason:
        'Paid work is not authorised by this student status alone. Obtain time-limited-work permission before starting; confirm your job, hours, documents, and school recommendation with 1345 or the jurisdictional office.',
      finalAuthority: PART_TIME_WORK_SOURCE.finalAuthority,
      confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
      source: PART_TIME_WORK_SOURCE,
    };
  }

  return {
    status: 'review_required',
    requiresPermissionBeforeStarting: UNKNOWN,
    eligibility: 'needs_review',
    applicationRoutes: ['HiKorea electronic civil petition', '1345'],
    pendingFields: visaTypeOrStatus === UNKNOWN || !visaTypeOrStatus ? ['visaTypeOrStatus'] : [],
    reason:
      'This guide cannot infer work authorisation for the selected status. Do not start paid work until 1345 or the responsible immigration office confirms the route in writing.',
    finalAuthority: PART_TIME_WORK_SOURCE.finalAuthority,
    confirmationHref: IMMIGRATION_CONFIRMATION_HREF,
    source: PART_TIME_WORK_SOURCE,
  };
}

export function evaluatePartTimeWorkForProfile(
  profile: Pick<ConditionProfile, 'visaTypeOrStatus'>,
): PartTimeWorkEvaluation {
  return evaluatePartTimeWork(profile.visaTypeOrStatus);
}

const HEALTH_INSURANCE_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.nhis.or.kr/english/wbheaa02900m01.do',
  sourceLabel: 'National Health Insurance Service — Guidance for foreigners',
  checkedAt: ADMIN_CONTENT_CHECKED_AT,
  reviewAfter: ADMIN_REVIEW_AFTER,
  finalAuthority: 'NHIS Foreign Residents Center, 1577-1000 (press 7)',
  conflictNote:
    'The official guide describes mandatory subscription after six months for eligible long-term foreign residents and a student reduction, but NHIS must calculate the effective date and any exemption from the individual record and travel history.',
  volatility: 'high',
  owner: 'Not confirmed (미확인)',
  conflictValues: [],
};

export const HEALTH_INSURANCE_METADATA: TaskMetadata = {
  taskId: 'health-insurance-enrollment',
  title: 'Check National Health Insurance enrollment',
  summary: 'Understand when NHIS enrollment applies and ask about any documented exemption.',
  source: HEALTH_INSURANCE_SOURCE,
};

export interface HealthInsuranceEvaluation {
  status: 'likely_applicable' | 'exemption_review' | 'review_required';
  mandatoryAfterMonths: 6 | null;
  studentReductionPercent: 50 | null;
  requiresNHISConfirmation: true;
  exemptionDocuments: readonly string[];
  pendingFields: readonly ['visaTypeOrStatus' | 'homeCountryInsurance'] | readonly [];
  reason: string;
  finalAuthority: string;
  confirmationHref: string;
  source: TaskSourceMetadata;
}

const EXEMPTION_DOCUMENTS = [
  'Proof of medical coverage under foreign law or a foreign insurance policy',
  'The NHIS exclusion application or written statement requested by NHIS',
] as const;

export const NHIS_CONFIRMATION_HREF = 'tel:1577-1000';

/**
 * This is a routing guide, not a premium calculator. D-2 students are shown
 * the NHIS path; a home-country policy is treated as a possible exemption
 * review and never as an automatic opt-out.
 */
export function evaluateHealthInsurance(
  visaTypeOrStatus: VisaTypeOrStatus | string | null | undefined,
  homeCountryInsurance: 'yes' | 'no' | UnknownValue | null | undefined,
): HealthInsuranceEvaluation {
  const studentStatus = visaTypeOrStatus === 'D-2-6' || visaTypeOrStatus === 'D-2-8';
  if (!studentStatus) {
    return {
      status: 'review_required',
      mandatoryAfterMonths: null,
      studentReductionPercent: null,
      requiresNHISConfirmation: true,
      exemptionDocuments: EXEMPTION_DOCUMENTS,
      pendingFields:
        visaTypeOrStatus === UNKNOWN || !visaTypeOrStatus ? ['visaTypeOrStatus'] : [],
      reason:
        'This student guide does not assess the selected stay status. Ask NHIS whether you are covered, when eligibility begins, and whether an exclusion route exists.',
      finalAuthority: HEALTH_INSURANCE_SOURCE.finalAuthority,
      confirmationHref: NHIS_CONFIRMATION_HREF,
      source: HEALTH_INSURANCE_SOURCE,
    };
  }

  if (homeCountryInsurance === 'yes') {
    return {
      status: 'exemption_review',
      mandatoryAfterMonths: 6,
      studentReductionPercent: 50,
      requiresNHISConfirmation: true,
      exemptionDocuments: EXEMPTION_DOCUMENTS,
      pendingFields: [],
      reason:
        'A qualifying foreign policy may support an NHIS exclusion request, but coverage is not automatic. Submit the evidence and written request NHIS asks for and wait for its decision.',
      finalAuthority: HEALTH_INSURANCE_SOURCE.finalAuthority,
      confirmationHref: NHIS_CONFIRMATION_HREF,
      source: HEALTH_INSURANCE_SOURCE,
    };
  }

  if (homeCountryInsurance === 'no') {
    return {
      status: 'likely_applicable',
      mandatoryAfterMonths: 6,
      studentReductionPercent: 50,
      requiresNHISConfirmation: true,
      exemptionDocuments: EXEMPTION_DOCUMENTS,
      pendingFields: [],
      reason:
        'NHIS lists D-2 students among eligible foreign residents and states that mandatory subscription generally begins after six months. Ask NHIS to calculate your effective date and contribution; no premium is estimated here.',
      finalAuthority: HEALTH_INSURANCE_SOURCE.finalAuthority,
      confirmationHref: NHIS_CONFIRMATION_HREF,
      source: HEALTH_INSURANCE_SOURCE,
    };
  }

  return {
    status: 'review_required',
    mandatoryAfterMonths: 6,
    studentReductionPercent: 50,
    requiresNHISConfirmation: true,
    exemptionDocuments: EXEMPTION_DOCUMENTS,
    pendingFields: ['homeCountryInsurance'],
    reason:
      'Tell us whether you have qualifying medical coverage in your home country. NHIS, not this app, decides enrollment or any exclusion after reviewing your documents.',
    finalAuthority: HEALTH_INSURANCE_SOURCE.finalAuthority,
    confirmationHref: NHIS_CONFIRMATION_HREF,
    source: HEALTH_INSURANCE_SOURCE,
  };
}

export function evaluateHealthInsuranceForProfile(
  profile: Pick<ConditionProfile, 'visaTypeOrStatus' | 'homeCountryInsurance'>,
): HealthInsuranceEvaluation {
  return evaluateHealthInsurance(profile.visaTypeOrStatus, profile.homeCountryInsurance);
}

/** Evidence kept separate so the UI can link to the official multilingual contact route. */
export const NHIS_FOREIGN_RESIDENTS_CENTER: Readonly<{
  label: string;
  address: string;
  phone: string;
  foreignLanguagePhone: string;
  href: string;
  evidence: ContentEvidence;
}> = {
  label: 'NHIS Seoul Center for Foreign Residents',
  address: '3F Sindorim Techno Mart, 97 Saemal-ro, Guro-gu, Seoul',
  phone: '1577-1000 (press 7)',
  foreignLanguagePhone: '033-811-2000',
  href: 'https://www.nhis.or.kr/english/wbheaa02100m01.do',
  evidence: {
    sourceUrl: 'https://www.nhis.or.kr/english/wbheaa02100m01.do',
    sourceTitle: 'NHIS Center for Foreign Residents',
    publisher: 'National Health Insurance Service (국민건강보험공단)',
    checkedAt: ADMIN_CONTENT_CHECKED_AT,
    contentClass: 'A',
    verification: 'verified',
    finalAuthority: 'NHIS Foreign Residents Center',
    jurisdiction: 'Seoul',
  },
};
