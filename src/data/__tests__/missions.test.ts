import { MISSIONS, missionsForHousing, missionsByPhase } from '../missions';

describe('MISSIONS catalog', () => {
  it('has 4 phases distributed across categories', () => {
    expect(MISSIONS).toHaveLength(55);
    for (const m of MISSIONS) {
      expect([1, 2, 3, 4]).toContain(m.phase);
      expect(['settle', 'food', 'activity', 'culture']).toContain(m.category);
    }
  });

  it('every mission id is unique', () => {
    const ids = MISSIONS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps direct mission actions typed, labelled, and HTTPS-only', () => {
    const actionMissions = MISSIONS.filter((mission) => mission.actions.length > 0);
    expect(actionMissions.length).toBeGreaterThan(20);
    for (const mission of actionMissions) {
      for (const action of mission.actions) {
        expect(['official_link', 'save_place', 'reservation']).toContain(action.type);
        expect(action.label.trim().length).toBeGreaterThan(0);
        expect(action.href).toMatch(/^https:\/\//);
      }
    }
    expect(MISSIONS.find((mission) => mission.id === 'p3_templestay')?.actions)
      .toEqual(expect.arrayContaining([expect.objectContaining({ type: 'reservation' })]));
    for (const id of ['p2_tmoney', 'p3_hangang', 'p3_hike', 'p4_gifts']) {
      expect(MISSIONS.find((mission) => mission.id === id)?.actions)
        .not.toEqual(expect.arrayContaining([expect.objectContaining({ type: 'save_place' })]));
    }
    expect(MISSIONS.find((mission) => mission.id === 'p3_hanbok')?.actions)
      .toEqual(expect.arrayContaining([expect.objectContaining({ type: 'save_place' })]));
  });

  it('marks weather- and festival-dependent missions for annual review', () => {
    for (const id of ['p3_hangang', 'p3_hike', 'p3_festival']) {
      const seasonal = MISSIONS.find((mission) => mission.id === id)?.seasonal;
      expect(seasonal?.reviewEachYear).toBe(true);
      expect(seasonal?.note).toMatch(/current|each year|season/i);
    }
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

  it('has completion criteria, provenance, and an owner for every mission', () => {
    for (const mission of MISSIONS) {
      expect(mission.completeWhen.trim().length).toBeGreaterThan(0);
      expect(mission.evidence.sourceTitle.trim()).not.toHaveLength(0);
      expect(mission.evidence.publisher.trim()).not.toHaveLength(0);
      expect(mission.evidence.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(mission.evidence.finalAuthority.trim()).not.toHaveLength(0);
      expect(mission.owner.trim()).not.toHaveLength(0);
    }
  });

  it('keeps unresolved mission provenance explicit', () => {
    const unresolved = MISSIONS.filter((mission) => mission.evidence.verification === 'unknown');
    expect(unresolved.length).toBeGreaterThan(0);
    for (const mission of unresolved) {
      expect(mission.evidence.sourceUrl).toBe('');
    }
  });

  it('keeps fee-sensitive cards tied to official live lookups', () => {
    const expectedSources: Record<string, string> = {
      p2_tmoney: 'https://english.visitseoul.net/transportation/Transportation-in-Seoul_/6398',
      p3_ktx: 'https://smart.letskorail.com/ebizbf/EbizBfTicketSearchM.do?hidJobDv=NRM',
      p3_clinic: 'https://www.mohw.go.kr/board.es?mid=a10409020000&bid=0026&list_no=1487937',
    };

    for (const [id, sourceUrl] of Object.entries(expectedSources)) {
      const mission = MISSIONS.find((candidate) => candidate.id === id);
      expect(mission?.evidence.sourceUrl).toBe(sourceUrl);
      expect(mission?.evidence.verification).toBe('needs_review');
      expect(mission?.evidence.checkedAt).toBe('2026-08-29');
    }
  });
});

/**
 * These legacy IDs once duplicated Essentials tasks and therefore let
 * administrative work unlock cultural artwork. They now carry distinct
 * everyday-language and life-experience completion standards.
 */
describe('Culture missions do not duplicate Essentials administration', () => {
  function mission(id: string) {
    const found = MISSIONS.find((candidate) => candidate.id === id);
    if (!found) throw new Error(`No mission ${id}`);
    return `${found.summary} ${found.tips.join(' ')}`;
  }

  it('p2_arc is an address note, not residence registration', () => {
    const text = mission('p2_arc');
    expect(text).toMatch(/address note|road-name address/i);
    expect(text).not.toMatch(/registration|appointment|visa|90 days/i);
  });

  it('p2_arc does not pin one immigration office for every reader', () => {
    // Jurisdiction follows the registered address; one Seoul office was shown
    // to everyone. See CONTENT_INVENTORY §11.1③.
    const arc = MISSIONS.find((candidate) => candidate.id === 'p2_arc');
    expect(arc?.mapHint).toBeUndefined();
  });

  it('p1_visa is an arrival phrase card, not visa preparation', () => {
    const text = mission('p1_visa');
    expect(text).toMatch(/Korean|phrase|어떻게/);
    expect(text).not.toMatch(/visa|embassy|consulate|D-2/i);
  });

  it('p2_bank is a kiosk experience, not account opening', () => {
    const text = mission('p2_bank');
    expect(text).toMatch(/kiosk|everyday order/i);
    expect(text).not.toMatch(/bank|account|passport|residence card/i);
  });

  it('p1_airport drops the AREX fare that two increases have overtaken', () => {
    // ₩9,500 was the adult express fare until October 2023. It is now the
    // child and senior fare, so leaving it in quoted the wrong ticket.
    const text = mission('p1_airport');

    expect(text).not.toMatch(/₩9,500/);
    expect(text).toMatch(/₩18,000/);
  });

  it('p1_airport no longer promises the limousine stops at universities', () => {
    // The operator publishes fares by route into central Seoul; nothing it
    // publishes says a route serves a university gate.
    expect(mission('p1_airport')).not.toMatch(/most major universities/);
  });

  it('p3_museum does not price special exhibitions the museum prices per show', () => {
    const text = mission('p3_museum');

    expect(text).not.toMatch(/₩5,000–13,000/);
    expect(text).toMatch(/free/i);
  });

  it('p3_clinic states no consultation fee without the notice that sets it', () => {
    const text = mission('p3_clinic');

    expect(text).not.toMatch(/₩4,000–10,000/);
    expect(text).toMatch(/No fixed amount/);
  });

  it('p2_tmoney does not ship an unverified card price', () => {
    const text = mission('p2_tmoney');

    expect(text).not.toMatch(/₩4,000/);
    expect(text).toMatch(/confirm the current price/i);
  });

  it('p3_ktx defers the fare to the live KORAIL search', () => {
    const text = mission('p3_ktx');

    expect(text).not.toMatch(/₩60,000/);
    expect(text).toMatch(/current KORAIL schedule and fare/i);
  });

  it('p3_hanbok names the sites its source names', () => {
    const text = mission('p3_hanbok');

    expect(text).not.toMatch(/all five royal palaces/);
    expect(text).toMatch(/Jongmyo/);
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
