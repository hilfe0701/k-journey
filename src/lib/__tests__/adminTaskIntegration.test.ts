import { buildHomeTasks } from '../../../app/(tabs)/checklist';
import { whyForTask } from '../../../app/task/[id]';
import { EMPTY_TASK_PROGRESS, UNKNOWN, type LocalTaskProgress } from '../firebase';
import { normalizeUserProfile } from '../profileCompat';

const BASE_PROFILE = normalizeUserProfile({
  university: 'snu',
  universityId: 'snu',
  programType: 'exchange',
  visaTypeOrStatus: 'D-2-6',
  housing: 'off-campus',
  housingType: 'own_lease',
  contractHolder: 'self',
  totalStayDays: 120,
  nationality: 'DE',
  homeCountryInsurance: 'no',
  residenceCardStatus: 'not_started',
  arrivalDate: '2026-09-01',
  departureDate: '2026-12-29',
  programStartDate: '2026-09-02',
});

function tasks(
  profile = BASE_PROFILE,
  progress: LocalTaskProgress = EMPTY_TASK_PROGRESS,
) {
  return buildHomeTasks(profile, progress, 2);
}

describe('administrative task integration', () => {
  it('keeps an off-campus jurisdiction in review until the registered district is supplied', () => {
    const unresolved = tasks().find((task) => task.taskId === 'immigration-jurisdiction');
    expect(unresolved?.status).toBe('review_required');
    expect(unresolved?.unlocksWhen).toMatch(/registered residence district/i);

    const resolvedProfile = { ...BASE_PROFILE, residenceDistrict: 'Mapo-gu' };
    const resolved = tasks(resolvedProfile).find((task) => task.taskId === 'immigration-jurisdiction');
    expect(resolved?.status).toBe('available');
    expect(resolved?.reason).toMatch(/Seoul Southern Immigration Office/);
  });

  it('never turns a pending-field review into a completed card', () => {
    const progress: LocalTaskProgress = {
      ...EMPTY_TASK_PROGRESS,
      completedTaskIds: ['immigration-jurisdiction', 'part-time-work-permission'],
    };
    const unknownProfile = {
      ...BASE_PROFILE,
      visaTypeOrStatus: UNKNOWN,
      residenceDistrict: null,
    };
    const reviewed = tasks(unknownProfile, progress);
    expect(reviewed.find((task) => task.taskId === 'immigration-jurisdiction')?.status).toBe('review_required');
    expect(reviewed.find((task) => task.taskId === 'part-time-work-permission')?.status).toBe('review_required');
  });

  it('preserves completion once the required profile inputs resolve the task', () => {
    const profile = { ...BASE_PROFILE, residenceDistrict: 'Mapo-gu' };
    const progress: LocalTaskProgress = {
      ...EMPTY_TASK_PROGRESS,
      completedTaskIds: [
        'immigration-jurisdiction',
        'part-time-work-permission',
        'health-insurance-enrollment',
      ],
    };
    for (const id of progress.completedTaskIds) {
      expect(tasks(profile, progress).find((task) => task.taskId === id)?.status).toBe('completed');
    }
  });

  it('gives the three administrative cards task-specific reasons', () => {
    const jurisdiction = whyForTask('immigration-jurisdiction', BASE_PROFILE);
    const work = whyForTask('part-time-work-permission', BASE_PROFILE);
    const health = whyForTask('health-insurance-enrollment', BASE_PROFILE);

    expect(jurisdiction.headline).toMatch(/registered residence/i);
    expect(work.headline).toMatch(/paid work|permission/i);
    expect(health.headline).toMatch(/NHIS|medical coverage/i);
    for (const why of [jurisdiction, work, health]) {
      expect(why.headline).not.toMatch(/departure date/i);
    }
  });
});
