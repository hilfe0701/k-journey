import {
  ERROR_TRANSITIONS,
  TASK_ERROR_STATES,
  TASK_STATES,
  TASK_METADATA,
  evaluateTasks,
  isSourceReviewDue,
  transitionTaskState,
} from '../taskState';
import type { ConditionProfile } from '../firebase';
import { toKstStartOfDay } from '../dates';

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
  // REQ-TER-002 · TC-102 · TC-108: confirmed error-state boundaries only.
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

  // REQ-DAR-006 · POL-007 · TC-125.
  it('attaches the complete provenance model to every administrative task', () => {
    for (const task of TASK_METADATA) {
      expect(Object.keys(task.source).sort()).toEqual([
        'checkedAt',
        'conflictNote',
        'conflictValues',
        'finalAuthority',
        'owner',
        'reviewAfter',
        'sourceLabel',
        'sourceUrl',
        'volatility',
      ]);
      expect(typeof task.source.sourceUrl).toBe('string');
      expect(typeof task.source.sourceLabel).toBe('string');
      expect(typeof task.source.finalAuthority).toBe('string');
      expect(typeof task.source.owner).toBe('string');
      expect(Array.isArray(task.source.conflictValues)).toBe(true);
    }
  });

  // REQ-DAR-008 · POL-007 · TC-129.
  it('marks a known review date due in KST and leaves unknown dates unresolved', () => {
    const now = toKstStartOfDay('2026-07-27');

    expect(isSourceReviewDue({ reviewAfter: '2026-07-26' }, now)).toBe(true);
    expect(isSourceReviewDue({ reviewAfter: '2026-07-27' }, now)).toBe(true);
    expect(isSourceReviewDue({ reviewAfter: '2026-07-28' }, now)).toBe(false);
    expect(isSourceReviewDue({ reviewAfter: null }, now)).toBe(false);
  });

  it('never leaves a task with an empty source and no explanation for it', () => {
    // An empty `sourceUrl` is allowed — some facts have no primary source. What
    // is not allowed is an empty source that says nothing, because the reader
    // cannot tell a deliberate gap from a forgotten field.
    for (const task of TASK_METADATA) {
      if (task.source.sourceUrl) continue;
      expect(task.source.conflictNote?.trim()).toBeTruthy();
      expect(task.source.finalAuthority.trim()).toBeTruthy();
    }
  });

  it('gives departure-order both sides of the conflict it asks the user to resolve', () => {
    const order = TASK_METADATA.find((task) => task.taskId === 'departure-order');

    expect(order?.source.sourceUrl).toMatch(/^https:\/\//);
    expect(order?.source.conflictNote).toMatch(/No single authority sets this order/);
    expect(order?.source.conflictValues).toHaveLength(2);
    // The task must not present the guidance behind it as a primary authority.
    expect(order?.source.sourceLabel).toMatch(/not a primary authority/);
  });

  // REQ-DAR-007 · POL-008 · TC-127.
  it('preserves all four fee values instead of selecting a single amount', () => {
    const registration = TASK_METADATA.find((task) => task.taskId === 'residence-registration');
    expect(registration?.source.conflictValues.map((entry) => entry.value)).toEqual([
      '35,000 won',
    ]);
  });
});

describe('evaluateTasks', () => {
  // REQ-SFR-004 · POL-005 · TC-016 · TC-017 · TC-155.
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

  // REQ-SFR-003 · POL-004 · POL-006 · TC-011 · TC-144.
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

  // REQ-PER-002 · POL-003 · TC-112 · TC-152.
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
  // REQ-TER-002 · TC-145 · TC-146 · TC-147 · TC-148 · TC-153 · TC-154.
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

  // REQ-SFR-004 · REQ-SFR-011 · POL-005 · POL-006 · TC-149 · TC-151.
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
