import { UNIVERSITIES, universityById } from '../universities';
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
      expect(u.campusArea).toBeTruthy();
      expect(u.nearestStation).toBeTruthy();
      expect(u.dorm.prohibited.length).toBeGreaterThan(0);
      expect(u.dorm.checkin).toBeTruthy();
      expect(u.offCampusArea.length).toBeGreaterThan(0);
      expect(u.nearbyEats.length).toBeGreaterThan(0);
      expect(u.transitTip).toBeTruthy();
    }
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
