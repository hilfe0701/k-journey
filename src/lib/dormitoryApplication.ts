/**
 * REQ-SFR-009 · POL-006 · DEC-014 · TASK-01:
 * the dormitory application deadline as an independent pre-arrival task.
 *
 * It is separated out because missing it changes `housingType`, which in turn
 * re-runs the residence-proof, address, and group-registration rules — a single
 * missed date cascades through the rest of the journey.
 *
 * ⛔ Every deadline below is `null`. `12-k-journey-proto-persona-synthesis-and-validation-plan.md`
 * §6.1 and the Chung-Ang guidance establish that the application happens before
 * arrival and is capacity-limited (grade A), but neither states a date, and no
 * other university's calendar was verified. The registry therefore carries the
 * shape and leaves the value empty, per `pm-evidence-gate` G4. Filling one
 * university's date in for another is exactly what AC4 forbids.
 */

import { UNKNOWN, type UnknownValue } from './firebase';
import { kstDifferenceInDays, kstNow, toKstStartOfDay } from './dates';
import type { TaskMetadata, TaskSourceMetadata } from './taskState';

const UNKNOWN_VALUE_LABEL = 'Not confirmed (미확인)';

export const DORMITORY_APPLICATION_TASK_ID = 'dormitory-application';

export interface DormitoryDeadlineRecord {
  universityId: string;
  /** ISO date, or `null` when no official calendar was verified. */
  deadline: string | null;
  sourceUrl: string;
  sourceLabel: string;
  checkedAt: string | null;
  finalAuthority: string;
}

/**
 * Chung-Ang is the one university whose immigration guidance was verified, and
 * even there the page does not publish a dormitory application deadline. Every
 * record is deliberately dateless.
 */
export const DORMITORY_APPLICATION_DEADLINES: readonly DormitoryDeadlineRecord[] = [
  {
    universityId: 'cau',
    deadline: null,
    sourceUrl: 'https://oia.cau.ac.kr/cauoia/exchange/visa.do',
    sourceLabel: 'Chung-Ang University Office of International Affairs guidance',
    checkedAt: '2026-07-25',
    finalAuthority: 'Chung-Ang University Office of International Affairs and dormitory office',
  },
  {
    universityId: 'yonsei',
    deadline: null,
    sourceUrl: '',
    sourceLabel: UNKNOWN_VALUE_LABEL,
    checkedAt: null,
    finalAuthority: 'Yonsei University international office and dormitory office',
  },
  {
    universityId: 'korea',
    deadline: null,
    sourceUrl: '',
    sourceLabel: UNKNOWN_VALUE_LABEL,
    checkedAt: null,
    finalAuthority: 'Korea University Global Service Center and dormitory office',
  },
  {
    universityId: 'snu',
    deadline: null,
    sourceUrl: '',
    sourceLabel: UNKNOWN_VALUE_LABEL,
    checkedAt: null,
    finalAuthority: 'Seoul National University Office of Global Affairs and dormitory office',
  },
  {
    universityId: 'hanyang',
    deadline: null,
    sourceUrl: '',
    sourceLabel: UNKNOWN_VALUE_LABEL,
    checkedAt: null,
    finalAuthority: 'Hanyang University Office of International Affairs and dormitory office',
  },
];

const GENERIC_FINAL_AUTHORITY = 'your university international office and dormitory office';

const DORMITORY_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://oia.cau.ac.kr/cauoia/exchange/visa.do',
  sourceLabel: 'Chung-Ang University Office of International Affairs guidance',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: GENERIC_FINAL_AUTHORITY,
  conflictNote:
    'Dormitory application deadlines were verified for no university. Confirm the date with your own school before relying on this task.',
  volatility: 'high',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

export const DORMITORY_APPLICATION_METADATA: TaskMetadata = {
  taskId: DORMITORY_APPLICATION_TASK_ID,
  title: 'Apply for dormitory housing',
  summary: 'Applications close before you arrive and places are limited.',
  source: DORMITORY_SOURCE,
};

export function dormitoryDeadlineFor(
  universityId: string,
): DormitoryDeadlineRecord | undefined {
  return DORMITORY_APPLICATION_DEADLINES.find(
    (record) => record.universityId === universityId,
  );
}

export type DormitoryVerdictStatus = 'applicable' | 'overdue' | 'review_required';

export interface DormitoryApplicationVerdict {
  status: DormitoryVerdictStatus;
  /** Absolute ISO deadline, or `null` when unconfirmed. */
  deadline: string | null;
  deadlineLabel: string;
  /** Days from today to the deadline. `null` whenever the deadline is unknown. */
  daysRemaining: number | null;
  reason: string;
  finalAuthority: string;
  sourceUrl: string;
  checkedAt: string | null;
  /** REQ-SFR-009 AC5 · TC-045: never set by the app itself. */
  autoCompleted: false;
}

/**
 * REQ-SFR-009 AC1 · AC2 · AC4 · AC5 · TC-041 · TC-042 · TC-044 · TC-045.
 *
 * `deadlineOverride` exists so a confirmed date can be supplied once a school's
 * calendar is verified — and so the confirmed-deadline path is testable while
 * every shipped record is still empty.
 */
export function evaluateDormitoryApplication(
  universityId: string | UnknownValue,
  options: { now?: Date; deadlineOverride?: string | null } = {},
): DormitoryApplicationVerdict {
  const now = options.now ?? kstNow();

  if (universityId === UNKNOWN || !universityId) {
    return {
      status: 'review_required',
      deadline: null,
      deadlineLabel: UNKNOWN_VALUE_LABEL,
      daysRemaining: null,
      reason: 'Tell us which university you are going to before this deadline can be assessed.',
      finalAuthority: GENERIC_FINAL_AUTHORITY,
      sourceUrl: '',
      checkedAt: null,
      autoCompleted: false,
    };
  }

  const record = dormitoryDeadlineFor(universityId);
  const deadline = options.deadlineOverride ?? record?.deadline ?? null;
  const finalAuthority = record?.finalAuthority ?? GENERIC_FINAL_AUTHORITY;

  // AC4 · TC-044: an unverified school gets its own empty value, never a date
  // borrowed from a school whose calendar happens to be known.
  if (!deadline) {
    return {
      status: 'review_required',
      deadline: null,
      deadlineLabel: UNKNOWN_VALUE_LABEL,
      daysRemaining: null,
      reason:
        'No official dormitory application deadline was confirmed for this university. Ask the office below for the date.',
      finalAuthority,
      sourceUrl: record?.sourceUrl ?? '',
      checkedAt: record?.checkedAt ?? null,
      autoCompleted: false,
    };
  }

  const daysRemaining = kstDifferenceInDays(
    toKstStartOfDay(deadline),
    toKstStartOfDay(now),
  );

  if (daysRemaining < 0) {
    return {
      status: 'overdue',
      deadline,
      deadlineLabel: deadline,
      daysRemaining,
      reason:
        'The application deadline has passed and this task was not marked complete. Confirm your status with the office below.',
      finalAuthority,
      sourceUrl: record?.sourceUrl ?? '',
      checkedAt: record?.checkedAt ?? null,
      autoCompleted: false,
    };
  }

  return {
    status: 'applicable',
    deadline,
    deadlineLabel: deadline,
    daysRemaining,
    reason: 'Places are limited and applications close before arrival.',
    finalAuthority,
    sourceUrl: record?.sourceUrl ?? '',
    checkedAt: record?.checkedAt ?? null,
    autoCompleted: false,
  };
}

/**
 * REQ-SFR-009 AC3 · TC-043: a dormitory outcome changes `housingType`, which
 * feeds the residence-proof, address, and group-registration rules. Returns the
 * axes whose downstream tasks must be recalculated.
 */
export const DORMITORY_DEPENDENT_AXES = ['housingType', 'contractHolder'] as const;

export function axesAffectedByDormitoryOutcome(): readonly string[] {
  return DORMITORY_DEPENDENT_AXES;
}
