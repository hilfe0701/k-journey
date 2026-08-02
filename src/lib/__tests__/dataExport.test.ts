/** REQ-SFR-012 · TC-056 – TC-060. */

import { buildExportPayload, CUSTODY_NOTICE, resolveExportResult } from '../dataExport';
import { CONDITION_AXIS_GROUPS } from '../conditionRules';
import { EMPTY_TASK_PROGRESS, UNKNOWN, type ConditionProfile, type LocalTaskProgress } from '../firebase';
import { ALL_TASK_IDS } from '../taskState';

const FILLED_PROFILE: ConditionProfile = {
  universityId: 'cau',
  programType: 'exchange',
  visaTypeOrStatus: 'D-2-6',
  housingType: 'dormitory',
  contractHolder: 'none',
  totalStayDays: 120,
  nationality: 'DE',
  homeCountryInsurance: 'yes',
  residenceCardStatus: 'not_started',
  arrivalDate: '2026-09-01',
  departureDate: '2026-12-29',
  programStartDate: '2026-09-02',
};

const EMPTY_PROFILE: ConditionProfile = {
  universityId: UNKNOWN,
  programType: UNKNOWN,
  visaTypeOrStatus: UNKNOWN,
  housingType: UNKNOWN,
  contractHolder: UNKNOWN,
  totalStayDays: UNKNOWN,
  nationality: UNKNOWN,
  homeCountryInsurance: UNKNOWN,
  residenceCardStatus: UNKNOWN,
  arrivalDate: null,
  departureDate: null,
  programStartDate: UNKNOWN,
};

function progressWith(overrides: Partial<LocalTaskProgress>): LocalTaskProgress {
  return { ...EMPTY_TASK_PROGRESS, ...overrides };
}

describe('REQ-SFR-012 data export', () => {
  it('TC-056 / AC1: every condition and every task reaches the text', () => {
    const progress = progressWith({
      completedTaskIds: ['residence-registration'],
      completedAtByTaskId: { 'residence-registration': '2026-09-20T02:00:00.000Z' },
    });
    const payload = buildExportPayload(FILLED_PROFILE, progress);

    expect(payload.status).toBe('ready');
    expect(payload.conditions).toHaveLength(10);
    expect(payload.conditions).toHaveLength(CONDITION_AXIS_GROUPS.length);
    expect(payload.tasks).toHaveLength(ALL_TASK_IDS.length);

    // Not just counted — actually present in the text a user would paste.
    for (const condition of payload.conditions) {
      expect(payload.text).toContain(condition.label);
      expect(payload.text).toContain(condition.value);
    }
    for (const taskId of ALL_TASK_IDS) {
      expect(payload.text).toContain(taskId);
    }

    // The three date fields are one axis group but all three values survive.
    const dates = payload.conditions.find((condition) => condition.key === 'dates');
    expect(dates?.value).toContain('2026-09-01');
    expect(dates?.value).toContain('2026-12-29');
    expect(dates?.value).toContain('2026-09-02');
  });

  it('TC-057 / AC2: a completed task with no recorded time keeps its state', () => {
    const payload = buildExportPayload(
      FILLED_PROFILE,
      progressWith({ completedTaskIds: ['group-registration'] }),
    );

    const task = payload.tasks.find((entry) => entry.taskId === 'group-registration');
    // "completed, time unknown" must stay distinguishable from "not done".
    expect(task?.state).toBe('completed');
    expect(task?.completedAt).toBe('Not confirmed (미확인)');
    expect(payload.text).toContain('completed · completed at Not confirmed (미확인)');
  });

  it('TC-058 / AC3: a delivered export states that the user, not the app, holds it', () => {
    const payload = buildExportPayload(FILLED_PROFILE, progressWith({}));
    const result = resolveExportResult(payload, true);

    expect(result.outcome).toBe('delivered');
    expect(result.reportedAsSuccess).toBe(true);
    expect(result.message).toBe(CUSTODY_NOTICE);
    expect(result.message).toMatch(/does not store, back up, or restore/i);
    expect(payload.text).toContain(CUSTODY_NOTICE);
  });

  it('TC-059 / AC4 (negative): a failed delivery is not reported as success', () => {
    const payload = buildExportPayload(FILLED_PROFILE, progressWith({}));
    const result = resolveExportResult(payload, false);

    expect(result.outcome).toBe('failed');
    expect(result.reportedAsSuccess).toBe(false);

    // The text was built fine, so it is still offered — identical to what the
    // delivery would have carried, not a truncated fallback.
    expect(result.copyableText).toBe(payload.text);
    expect(result.action).toBe('copy');
  });

  it('TC-060 / AC5 (edge): zero data is never delivered as an empty success', () => {
    const payload = buildExportPayload(EMPTY_PROFILE, progressWith({}));
    expect(payload.status).toBe('empty');

    // Even asked to treat it as delivered, the result refuses to claim success —
    // an empty file looks like a working backup until the day it is needed.
    const result = resolveExportResult(payload, true);
    expect(result.outcome).toBe('nothing_to_export');
    expect(result.reportedAsSuccess).toBe(false);
    expect(result.copyableText).toBeNull();
    expect(result.action).toBe('go_to_onboarding');

    // A missing profile is the same case.
    expect(buildExportPayload(null, progressWith({})).status).toBe('empty');
  });

  it('TC-060 / AC5 (edge): a single answered condition is enough to be non-empty', () => {
    const oneAnswer = buildExportPayload(
      { ...EMPTY_PROFILE, universityId: 'cau' },
      progressWith({}),
    );
    expect(oneAnswer.status).toBe('ready');

    // So is a single touched task, even with no conditions answered.
    const oneTask = buildExportPayload(
      EMPTY_PROFILE,
      progressWith({ inProgressTaskIds: ['residence-registration'] }),
    );
    expect(oneTask.status).toBe('ready');
  });

  it('exports cultural missions, Want-to text, and era in the user-owned copy', () => {
    const payload = buildExportPayload(EMPTY_PROFILE, progressWith({}), {
      completedMissions: [{ missionId: 'p2_tteokbokki', completedAt: new Date('2026-09-03T00:00:00.000Z') }],
      era: 'silla',
      buckets: [{
        id: 'bkt_1',
        themeName: 'My Seoul days',
        templateKey: 'tiger',
        maxItems: 8,
        createdAtIso: '2026-09-01T00:00:00.000Z',
        items: [{ id: 'itm_1', text: 'Walk along the Han River', completedAtIso: null }],
      }],
    });

    expect(payload.status).toBe('ready');
    expect(payload.missions).toHaveLength(1);
    expect(payload.buckets).toHaveLength(1);
    expect(payload.text).toContain('p2_tteokbokki');
    expect(payload.text).toContain('Walk along the Han River');
    expect(payload.text).toContain('Era: silla');
  });
});
