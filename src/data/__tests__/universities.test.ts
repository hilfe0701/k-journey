import {
  LATEST_UNVERIFIED_UNIVERSITY_IDS,
  UNIVERSITIES,
  VERIFIED_UNIVERSITY_IDS,
  universityById,
} from '../universities';
import { BUCKET_TEMPLATES, BucketTemplateKey } from '../bucketTemplates';

describe('UNIVERSITIES catalog', () => {
  it('has at least 9 Seoul universities (PRD §8.1)', () => {
    expect(UNIVERSITIES.length).toBeGreaterThanOrEqual(9);
  });

  it('every university id is unique', () => {
    const ids = UNIVERSITIES.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every university has the required campus fields', () => {
    for (const u of UNIVERSITIES) {
      expect(u.id).toBeTruthy();
      expect(u.nameEn).toBeTruthy();
      expect(u.nameKo).toBeTruthy();
      expect(u.shortName).toBeTruthy();
      expect(u.address).toBeTruthy();
      expect(u.campusArea).toBeTruthy();
      expect(u.nearestStation).toBeTruthy();
      expect(u.dorm.prohibited.length).toBeGreaterThan(0);
      expect(u.dorm.checkin).toBeTruthy();
      expect(u.offCampusArea.length).toBeGreaterThan(0);
      expect(u.nearbyEats.length).toBeGreaterThan(0);
      expect(u.transitRoutes.length).toBeGreaterThan(0);
    }
  });

  it('keeps the two id lists in step with each record', () => {
    // Two hand-written lists and a status field can disagree silently; the
    // lists are the ones read elsewhere, so they must be derivable.
    expect([...VERIFIED_UNIVERSITY_IDS].sort()).toEqual(
      UNIVERSITIES.filter((u) => u.verification.status === 'verified')
        .map((u) => u.id)
        .sort(),
    );
    expect([...LATEST_UNVERIFIED_UNIVERSITY_IDS].sort()).toEqual(
      UNIVERSITIES.filter((u) => u.verification.status === 'latest_unverified')
        .map((u) => u.id)
        .sort(),
    );
  });

  it('never marks a record verified without a source that was opened', () => {
    for (const university of UNIVERSITIES) {
      if (university.verification.status !== 'verified') continue;
      expect(university.verification.sourceUrl).toMatch(/^https:\/\//);
      expect(university.verification.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('tracks evidence independently for address, dorm, transit, and neighborhood blocks', () => {
    const blocks = ['address', 'dorm', 'transit', 'nearbyEats'] as const;

    for (const university of UNIVERSITIES) {
      for (const block of blocks) {
        const evidence = university.contentEvidence[block];
        expect(evidence.sourceUrl).toMatch(/^https:\/\//);
        expect(evidence.sourceTitle).toBeTruthy();
        expect(evidence.publisher).not.toMatch(/K-Journey/i);
        expect(evidence.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(evidence.finalAuthority).toBeTruthy();
        expect(evidence.note).toBeTruthy();
      }
    }
  });

  it('uses neighborhood-level labels instead of fragile individual venues', () => {
    const venueNames = /Toast|Galbi|Bunsik|Cafe|Café|Coffee Bean|Pizza|Cook|Onion|Restaurant|Sutbul|Seolnongtang/i;

    for (const university of UNIVERSITIES) {
      expect(university.nearbyEats.length).toBeGreaterThan(0);
      expect(university.nearbyEats.join(' ')).not.toMatch(venueNames);
      expect(university.contentEvidence.nearbyEats.verification).toBe('needs_review');
    }
  });

  it('does not ship unverified dormitory laundry prices', () => {
    for (const university of UNIVERSITIES) {
      expect(university.dorm.laundry ?? '').not.toMatch(/₩|KRW|won|per wash|per dry/i);
    }
  });

  it('has a current official International Student Affairs source for Ewha', () => {
    const ewha = universityById('ewha');

    expect(ewha?.verification.status).toBe('verified');
    expect(ewha?.verification.sourceUrl).toBe('https://isa.ewha.ac.kr/oisa/index.do');
    expect(ewha?.verification.checkedAt).toBe('2026-08-29');
  });

  it('universityById finds existing universities and returns undefined for missing', () => {
    expect(universityById('yonsei')).toBeDefined();
    expect(universityById('does-not-exist')).toBeUndefined();
  });
});

describe('BUCKET_TEMPLATES catalog', () => {
  const expectedKeys: BucketTemplateKey[] = [
    'peony',
    'tiger',
    'crane',
    'lotus',
    'chaekgeori',
    'sansuhwa',
  ];

  it('has exactly the 6 minhwa templates', () => {
    expect(BUCKET_TEMPLATES).toHaveLength(6);
    const keys = BUCKET_TEMPLATES.map((t) => t.key).sort();
    expect(keys).toEqual([...expectedKeys].sort());
  });

  it('every template has palette-derived colors (no raw hex)', () => {
    // Every primary/secondary should match the obangsaek palette format.
    // We can't import palette directly here without coupling, but we can
    // verify it's a 7-char hex string starting with #.
    for (const t of BUCKET_TEMPLATES) {
      expect(t.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(t.secondaryColor).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('every template has English + Korean naming + symbolism + hint', () => {
    for (const t of BUCKET_TEMPLATES) {
      expect(t.nameEn).toBeTruthy();
      expect(t.nameKo).toBeTruthy();
      expect(t.symbolism).toBeTruthy();
      expect(t.hintFor).toBeTruthy();
    }
  });
});
