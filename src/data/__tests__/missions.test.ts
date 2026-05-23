import { MISSIONS, missionsForHousing, missionsByPhase } from '../missions';

describe('MISSIONS catalog', () => {
  it('has 4 phases distributed across categories', () => {
    expect(MISSIONS.length).toBeGreaterThan(0);
    for (const m of MISSIONS) {
      expect([1, 2, 3, 4]).toContain(m.phase);
      expect(['settle', 'food', 'activity', 'culture']).toContain(m.category);
    }
  });

  it('every mission id is unique', () => {
    const ids = MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every appliesTo value is dormitory or off-campus when set', () => {
    for (const m of MISSIONS) {
      if (m.appliesTo !== undefined) {
        expect(['dormitory', 'off-campus']).toContain(m.appliesTo);
      }
    }
  });

  it('has at least one mission for each housing type', () => {
    const dorm = MISSIONS.filter((m) => m.appliesTo === 'dormitory');
    const off = MISSIONS.filter((m) => m.appliesTo === 'off-campus');
    expect(dorm.length).toBeGreaterThan(0);
    expect(off.length).toBeGreaterThan(0);
  });
});

describe('missionsForHousing', () => {
  it('returns the full catalog when housing is null', () => {
    expect(missionsForHousing(null)).toHaveLength(MISSIONS.length);
  });

  it('returns the full catalog when housing is undefined', () => {
    expect(missionsForHousing(undefined)).toHaveLength(MISSIONS.length);
  });

  it('excludes off-campus missions for dormitory students', () => {
    const result = missionsForHousing('dormitory');
    const offCampusInResult = result.filter((m) => m.appliesTo === 'off-campus');
    expect(offCampusInResult).toHaveLength(0);
    // Universal missions should still be present
    const universalInResult = result.filter((m) => m.appliesTo === undefined);
    expect(universalInResult.length).toBeGreaterThan(0);
  });

  it('excludes dormitory missions for off-campus students', () => {
    const result = missionsForHousing('off-campus');
    const dormInResult = result.filter((m) => m.appliesTo === 'dormitory');
    expect(dormInResult).toHaveLength(0);
  });

  it('narrows by phase when phase is provided', () => {
    const phase1 = missionsForHousing('dormitory', 1);
    expect(phase1.length).toBeGreaterThan(0);
    for (const m of phase1) {
      expect(m.phase).toBe(1);
    }
  });

  it('returns more missions for off-campus than dormitory when off-campus has more parallels', () => {
    // The current catalog has 4 off-campus and 3 dorm missions. Off-campus
    // should see ≥ dorm count when both filter universal+specific.
    const dormCount = missionsForHousing('dormitory').length;
    const offCount = missionsForHousing('off-campus').length;
    expect(offCount).toBeGreaterThanOrEqual(dormCount);
  });
});

describe('missionsByPhase', () => {
  it('returns missions for each phase 1-4', () => {
    for (const phase of [1, 2, 3, 4] as const) {
      const result = missionsByPhase(phase);
      expect(result.length).toBeGreaterThan(0);
      for (const m of result) {
        expect(m.phase).toBe(phase);
      }
    }
  });
});
