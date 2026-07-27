import {
  ERROR_TRANSITIONS,
  TASK_ERROR_STATES,
  TASK_STATES,
  evaluateTasks,
  transitionTaskState,
} from '../taskState';
import type { ConditionProfile } from '../firebase';

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

describe('task state axes', () => {
  it('contains the seven meaning states and only the three confirmed error states', () => {
    expect(TASK_STATES).toHaveLength(7);
    expect(TASK_ERROR_STATES).toEqual([
      'input_invalid',
      'source_unreachable',
      'permission_denied',
    ]);
    expect(ERROR_TRANSITIONS).toEqual([
      { id: 'E1', from: 'valid', to: 'input_invalid' },
      { id: 'E7', from: 'granted', to: 'permission_denied' },
    ]);
  });
});

describe('evaluateTasks', () => {
  it('returns review_required for unknown appliesWhen inputs', () => {
    const result = evaluateTasks(
      [
        {
          taskId: 'visa-task',
          appliesWhen: { field: 'visaTypeOrStatus', equals: 'D-2-6' },
        },
      ],
      { ...profile, visaTypeOrStatus: 'unknown' },
      { completedTaskIds: [] },
    );

    expect(result[0]).toMatchObject({
      state: 'review_required',
      pendingFields: ['visaTypeOrStatus'],
    });
  });

  it('returns not_applicable with reason and official source', () => {
    const result = evaluateTasks(
      [
        {
          taskId: 'residence-task',
          appliesWhen: {
            all: [
              { field: 'totalStayDays', equals: 120 },
              { field: 'visaTypeOrStatus', notEquals: 'visa_free' },
            ],
          },
          notApplicable: {
            reason: 'This task does not apply to a visa-free short stay.',
            sourceUrl: 'https://example.com/official-guidance',
          },
        },
      ],
      { ...profile, visaTypeOrStatus: 'visa_free' },
      { completedTaskIds: [] },
    );

    expect(result[0]).toMatchObject({
      state: 'not_applicable',
      naReason: 'This task does not apply to a visa-free short stay.',
      naSourceUrl: 'https://example.com/official-guidance',
    });
  });

  it('locks tasks until every dependency is completed', () => {
    const definitions = [
      { taskId: 'appointment' },
      { taskId: 'submission', dependsOn: ['appointment'] },
    ];

    expect(evaluateTasks(definitions, profile, { completedTaskIds: [] })[1]).toMatchObject({
      state: 'locked',
      blockedBy: ['appointment'],
    });
    expect(
      evaluateTasks(definitions, profile, { completedTaskIds: ['appointment'] })[1].state,
    ).toBe('available');
  });

  it('preserves a completed task and asks for review after a relevant condition changes', () => {
    const previous = profile;
    const next = { ...profile, housingType: 'registered_business' as const };
    const result = evaluateTasks(
      [
        {
          taskId: 'residence-proof',
          relevantAxes: ['housingType'],
        },
      ],
      next,
      {
        completedTaskIds: ['residence-proof'],
        completedAtByTaskId: { 'residence-proof': '2026-08-04T00:00:00.000Z' },
      },
      { previousProfile: previous },
    );

    expect(result[0]).toMatchObject({
      state: 'review_required',
      completedAt: '2026-08-04T00:00:00.000Z',
    });
  });

  it('keeps eligibility blocking separate from sequential blocking', () => {
    const result = evaluateTasks(
      [
        {
          taskId: 'group-registration',
          permanentBlock: {
            when: { field: 'totalStayDays', equals: 27 },
            reason: 'This stay is below the confirmed eligibility boundary.',
            alternativeMeans: 'Use an individual appointment.',
          },
        },
      ],
      { ...profile, totalStayDays: 27 },
      { completedTaskIds: [] },
    );

    expect(result[0]).toMatchObject({
      state: 'locked_permanent',
      blockingReason: 'This stay is below the confirmed eligibility boundary.',
      alternativeMeans: 'Use an individual appointment.',
    });
  });
});

describe('task transitions', () => {
  it.each([
    ['available', 'start', 'in_progress'],
    ['in_progress', 'complete', 'completed'],
    ['in_progress', 'cancel', 'available'],
    ['completed', 'uncomplete', 'available'],
    ['review_required', 'resolve_review', 'completed'],
    ['review_required', 'reopen_review', 'available'],
  ] as const)('%s + %s → %s', (state, action, nextState) => {
    expect(transitionTaskState(state, action)).toMatchObject({
      state: nextState,
      changed: true,
    });
  });

  it('rejects user actions on blocked and not-applicable tasks', () => {
    expect(transitionTaskState('locked', 'start')).toMatchObject({
      state: 'locked',
      changed: false,
    });
    expect(transitionTaskState('not_applicable', 'complete')).toMatchObject({
      state: 'not_applicable',
      changed: false,
    });
  });
});
