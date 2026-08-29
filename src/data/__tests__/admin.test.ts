import {
  IMMIGRATION_OFFICES,
  UNIVERSITY_CAMPUS_DISTRICTS,
  evaluateHealthInsurance,
  evaluatePartTimeWork,
  immigrationOfficeForDistrict,
  resolveAdministrativeAuthorities,
  universityJurisdictionFor,
} from '../admin';
import { UNKNOWN } from '../../lib/firebase';

describe('administrative jurisdiction map', () => {
  it('covers all nine supported universities without changing the university catalog', () => {
    expect(Object.keys(UNIVERSITY_CAMPUS_DISTRICTS)).toHaveLength(9);
    expect(universityJurisdictionFor('cau')?.id).toBe('seoul');
    expect(universityJurisdictionFor('yonsei')?.id).toBe('seoul-south');
    expect(universityJurisdictionFor('ewha')?.id).toBe('seoul-south');
    expect(universityJurisdictionFor('korea')?.id).toBe('sejongno');
    expect(universityJurisdictionFor('hufs')?.id).toBe('sejongno');
  });

  it('matches the official Seoul district split', () => {
    expect(IMMIGRATION_OFFICES.map((office) => office.jurisdictionDistricts)).toEqual([
      expect.arrayContaining(['Dongjak-gu', 'Gwanak-gu', 'Seongdong-gu']),
      expect.arrayContaining(['Jongno-gu', 'Seongbuk-gu', 'Dongdaemun-gu']),
      expect.arrayContaining(['Seodaemun-gu', 'Mapo-gu', 'Yeongdeungpo-gu']),
    ]);
    expect(immigrationOfficeForDistrict('서울 서대문구')?.id).toBe('seoul-south');
    expect(immigrationOfficeForDistrict('Gwanak-gu')?.id).toBe('seoul');
    expect(immigrationOfficeForDistrict('Jungnang-gu')?.id).toBe('sejongno');
    expect(resolveAdministrativeAuthorities({ residenceDistrict: '서울 중랑구' }).district).toBe('Jungnang-gu');
  });

  it('resolves a dormitory from its campus district and labels the proxy', () => {
    const result = resolveAdministrativeAuthorities({
      universityId: 'snu',
      housingType: 'dormitory',
    });
    expect(result.status).toBe('resolved');
    expect(result.district).toBe('Gwanak-gu');
    expect(result.immigrationOffice?.id).toBe('seoul');
    expect(result.civilService?.district).toBe('Gwanak-gu');
    expect(result.usesCampusProxy).toBe(true);
    expect(result.confirmationHref).toBe('tel:1345');
  });

  it('does not guess an off-campus jurisdiction from the university', () => {
    const result = resolveAdministrativeAuthorities({
      universityId: 'snu',
      housingType: 'own_lease',
    });
    expect(result.status).toBe('review_required');
    expect(result.immigrationOffice).toBeNull();
    expect(result.pendingFields).toContain('residenceDistrict');
    expect(result.reason).toMatch(/registered district|1345/i);
  });

  it('uses an explicitly supplied residence district even when housing is unknown', () => {
    const result = resolveAdministrativeAuthorities({
      universityId: UNKNOWN,
      housingType: UNKNOWN,
      residenceDistrict: '서울 마포구',
    });
    expect(result.status).toBe('resolved');
    expect(result.immigrationOffice?.id).toBe('seoul-south');
    expect(result.civilService?.label).toContain('Mapo-gu');
  });

  it('keeps an unrecognised address visibly unresolved', () => {
    const result = resolveAdministrativeAuthorities({
      universityId: 'cau',
      housingType: 'own_lease',
      residenceDistrict: 'Busan',
    });
    expect(result.status).toBe('review_required');
    expect(result.immigrationOffice).toBeNull();
    expect(result.pendingFields).toEqual(['residenceDistrict']);
  });
});

describe('part-time work routing', () => {
  it('requires permission before work for the two student statuses in the model', () => {
    for (const visa of ['D-2-6', 'D-2-8'] as const) {
      const result = evaluatePartTimeWork(visa);
      expect(result.status).toBe('permission_required');
      expect(result.requiresPermissionBeforeStarting).toBe(true);
      expect(result.eligibility).toBe('needs_review');
      expect(result.reason).toMatch(/before starting/i);
      expect(result.source.sourceUrl).toMatch(/^https:\/\//);
      expect(result.confirmationHref).toBe('tel:1345');
    }
  });

  it('does not infer work authorisation for unknown or other statuses', () => {
    expect(evaluatePartTimeWork(UNKNOWN).status).toBe('review_required');
    expect(evaluatePartTimeWork('other').requiresPermissionBeforeStarting).toBe(UNKNOWN);
    expect(evaluatePartTimeWork(UNKNOWN).pendingFields).toEqual(['visaTypeOrStatus']);
  });
});

describe('health insurance routing', () => {
  it('routes D-2 students to NHIS without inventing a premium or date', () => {
    const result = evaluateHealthInsurance('D-2-6', 'no');
    expect(result.status).toBe('likely_applicable');
    expect(result.mandatoryAfterMonths).toBe(6);
    expect(result.studentReductionPercent).toBe(50);
    expect(result.requiresNHISConfirmation).toBe(true);
    expect(result.reason).toMatch(/effective date|contribution/i);
    expect(result.confirmationHref).toBe('tel:1577-1000');
  });

  it('treats home-country insurance as an exemption review, never an automatic opt-out', () => {
    const result = evaluateHealthInsurance('D-2-8', 'yes');
    expect(result.status).toBe('exemption_review');
    expect(result.exemptionDocuments.length).toBeGreaterThanOrEqual(2);
    expect(result.reason).toMatch(/not automatic|decision/i);
  });

  it('keeps missing insurance input visibly unresolved', () => {
    const result = evaluateHealthInsurance('D-2-6', UNKNOWN);
    expect(result.status).toBe('review_required');
    expect(result.pendingFields).toEqual(['homeCountryInsurance']);
  });
});
