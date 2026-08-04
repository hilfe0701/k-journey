import { MISSIONS, missionsForHousing, missionsByPhase } from '../missions';
import { APPOINTMENT_LEAD_TIME_DAYS } from '../../lib/immigrationAppointment';
import { UNKNOWN } from '../../lib/firebase';

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

/**
 * The three administrative missions state facts that the Essentials track also
 * states, from sourced data and against the user's conditions. When the two
 * disagree the app contradicts itself, so these lock the reconciliation.
 */
describe('administrative missions defer to the Essentials track', () => {
  function mission(id: string) {
    const found = MISSIONS.find((candidate) => candidate.id === id);
    if (!found) throw new Error(`No mission ${id}`);
    return `${found.summary} ${found.tips.join(' ')}`;
  }

  it('p2_arc does not restate the 90-day registration rule', () => {
    // `evaluateResidenceRegistration` decides this from stay length *and* visa
    // status, and excuses a visa-free stay of any length. A flat "required over
    // 90 days" on the mission card tells those users the opposite.
    const text = mission('p2_arc');

    expect(text).not.toMatch(/90 days/);
    expect(text).toMatch(/Essentials/);
  });

  it('p2_arc does not estimate an appointment lead time', () => {
    // The appointment module refuses to generate a waiting period because a
    // wrong number gets acted on as guidance. The mission may not supply one.
    expect(APPOINTMENT_LEAD_TIME_DAYS).toBe(UNKNOWN);

    const text = mission('p2_arc');
    expect(text).not.toMatch(/weeks in advance|days in advance|fill up/);
  });

  it('p2_arc does not pin one immigration office for every reader', () => {
    // Jurisdiction follows the registered address; one Seoul office was shown
    // to everyone. See CONTENT_INVENTORY §11.1③.
    const arc = MISSIONS.find((candidate) => candidate.id === 'p2_arc');
    expect(arc?.mapHint).toBeUndefined();
  });

  it('p1_visa does not assert a visa type the app refuses to infer', () => {
    // K-Journey asks for `visaTypeOrStatus` rather than deriving it, and
    // supports visa-free stays. CLAUDE.md MUST 7.
    const text = mission('p1_visa');

    expect(text).not.toMatch(/D-2/);
    expect(text).toMatch(/embassy or consulate/);
  });

  it('p2_bank states no universal document list and no same-day guarantee', () => {
    const text = mission('p2_bank');

    expect(text).not.toMatch(/You need:/);
    expect(text).not.toMatch(/issued same day/);
    // It must still say who actually decides.
    expect(text).toMatch(/differs by bank/);
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
