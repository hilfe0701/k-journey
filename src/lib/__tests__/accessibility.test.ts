/**
 * REQ-INR-003 · TC-120 · TC-121.
 *
 * ⛔ These two cover the *text* half of the acceptance criteria only — that the
 * information exists in words rather than in colour alone. Whether a screen
 * reader actually announces it is a browser-lane judgment and is NOT covered
 * here. `TC-122`, `TC-123`, and `TC-124` have no automated coverage at all;
 * see `.work/through-line-run3.md` for why and `54-...` §6 for the record.
 *
 * Raised by `47-k-journey-role-review-unscored-dec-round2-2026-07-27.md`
 * §2.2 ★11: the web target made screen-reader judgment possible for the first
 * time, and accessibility still had zero lines of code behind it.
 */

import {
  TASK_STATE_LABELS,
  TASK_STATES,
  evaluateTasks,
  taskStateLabel,
  type TaskDefinition,
} from '../taskState';
import { evaluateGroupRegistration } from '../conditionRules';
import { UNKNOWN, type ConditionProfile } from '../firebase';

const PROFILE: ConditionProfile = {
  universityId: 'yonsei',
  programType: 'exchange',
  visaTypeOrStatus: 'D-2-6',
  housingType: 'dormitory',
  contractHolder: 'none',
  totalStayDays: 20,
  nationality: 'DE',
  homeCountryInsurance: 'yes',
  residenceCardStatus: 'not_started',
  arrivalDate: '2026-09-01',
  departureDate: '2026-12-29',
  programStartDate: '2026-09-02',
};

describe('REQ-INR-003 accessibility — text, not colour', () => {
  it('TC-120 / AC1: all seven task states are distinguishable by text alone', () => {
    const labels = TASK_STATES.map(taskStateLabel);

    // Every state has a label...
    expect(labels).toHaveLength(7);
    for (const label of labels) {
      expect(label.trim().length).toBeGreaterThan(0);
    }

    // ...and no two states share one. A duplicate here is precisely the
    // "distinguished by colour alone" failure the criterion forbids.
    expect(new Set(labels).size).toBe(7);
    expect(Object.keys(TASK_STATE_LABELS).sort()).toEqual([...TASK_STATES].sort());
  });

  it('TC-121 / AC2: a sequential block and an eligibility block read differently', () => {
    expect(taskStateLabel('locked')).not.toBe(taskStateLabel('locked_permanent'));

    const definitions: readonly TaskDefinition[] = [
      { taskId: 'prerequisite' },
      // Sequential: clears when the prerequisite is completed.
      { taskId: 'sequential-block', dependsOn: ['prerequisite'], blockType: 'sequential' },
      // Eligibility: never clears by completing something else.
      {
        taskId: 'eligibility-block',
        blockType: 'eligibility',
        permanentBlock: {
          when: { field: 'totalStayDays', equals: 20 },
          reason: 'Stays shorter than one month are excluded from group registration.',
          alternativeMeans: 'Make an individual appointment through HiKorea.',
        },
      },
    ];

    const [, sequential, eligibility] = evaluateTasks(definitions, PROFILE, {
      completedTaskIds: [],
    });

    expect(sequential.state).toBe('locked');
    expect(eligibility.state).toBe('locked_permanent');

    // Different sentences, not the same sentence in a different colour.
    expect(sequential.blockingReason).not.toBe(eligibility.blockingReason);

    // The eligibility block must also announce a way forward, or the user is
    // told "no" with nowhere to go.
    expect(eligibility.alternativeMeans?.trim().length).toBeGreaterThan(0);
    expect(sequential.alternativeMeans).toBeUndefined();
  });

  it('TC-121 / AC2: the shipped eligibility rule carries an alternative means', () => {
    // Not a synthetic fixture — the real Yonsei under-28-day rule.
    const verdict = evaluateGroupRegistration(PROFILE);

    expect(verdict.status).toBe('locked_permanent');
    if (verdict.status === 'locked_permanent') {
      expect(verdict.reason.trim().length).toBeGreaterThan(0);
      expect(verdict.alternativeMeans.trim().length).toBeGreaterThan(0);
      expect(verdict.reason).not.toBe(verdict.alternativeMeans);
    }
  });

  it('TC-121 / AC2: a review block states which condition is missing', () => {
    const verdict = evaluateGroupRegistration({ ...PROFILE, totalStayDays: UNKNOWN });

    expect(verdict.status).toBe('review_required');
    if (verdict.status === 'review_required') {
      // "Blocked" with no named cause is unreadable to anyone, sighted or not.
      expect(verdict.pendingFields).toContain('totalStayDays');
      expect(verdict.finalAuthority.trim().length).toBeGreaterThan(0);
    }
  });
});
