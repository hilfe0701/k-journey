import type { ConditionAxis, ConditionProfile } from './firebase';
import {
  type AppliesWhen,
  changedConditionAxes,
  evaluateAppliesWhen,
  isUnknownConditionValue,
} from './conditionRules';
import { kstDifferenceInDays, kstNow, toKstStartOfDay } from './dates';

export const TASK_STATES = [
  'locked',
  'locked_permanent',
  'available',
  'in_progress',
  'completed',
  'not_applicable',
  'review_required',
] as const;

export type TaskState = (typeof TASK_STATES)[number];

/** DEC-020 axis 2 after the confirmed DEC-026 deletions. */
export const TASK_ERROR_STATES = [
  'input_invalid',
  'source_unreachable',
  'permission_denied',
] as const;

export type TaskErrorState = (typeof TASK_ERROR_STATES)[number];

export type TaskBlockType = 'sequential' | 'eligibility';

export interface TaskDefinition {
  taskId: string;
  appliesWhen?: AppliesWhen;
  dependsOn?: readonly string[];
  blockType?: TaskBlockType;
  relevantAxes?: readonly ConditionAxis[];
  notApplicable?: {
    reason: string;
    sourceUrl: string;
  };
  permanentBlock?: {
    when: AppliesWhen;
    reason: string;
    alternativeMeans: string;
  };
}

export interface TaskProgress {
  completedTaskIds: readonly string[];
  inProgressTaskIds?: readonly string[];
  completedAtByTaskId?: Readonly<Record<string, string>>;
  reviewReasons?: Readonly<Record<string, string>>;
  errorStateByTaskId?: Readonly<Record<string, TaskErrorState | undefined>>;
}

export interface TaskMetadata {
  taskId: string;
  title: string;
  summary: string;
  dependsOn?: readonly string[];
  source: TaskSourceMetadata;
}

export type SourceVolatility = 'low' | 'medium' | 'high' | 'unknown';

export interface TaskSourceValue {
  value: string;
  sourceLabel: string;
  sourceUrl: string;
  checkedAt: string | null;
}

/**
 * Provenance attached to every administrative task. Empty or null values are
 * intentional unknowns: the UI must show them as not confirmed alongside the
 * final authority instead of filling in a plausible value.
 */
export interface TaskSourceMetadata {
  sourceUrl: string;
  sourceLabel: string;
  checkedAt: string | null;
  reviewAfter: string | null;
  finalAuthority: string;
  conflictNote: string | null;
  volatility: SourceVolatility;
  owner: string;
  conflictValues: readonly TaskSourceValue[];
}

const UNKNOWN_SOURCE_VALUE = 'Not confirmed (미확인)';
const UNKNOWN_OWNER = UNKNOWN_SOURCE_VALUE;

const RESIDENCE_REGISTRATION_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.immigration.go.kr/bbs/immigration_eng/229/590314/artclView.do',
  sourceLabel: 'Ministry of Justice notice',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'the Ministry of Justice and HiKorea',
  conflictNote:
    'Registration fees differ by source and route. Check the final authority before paying.',
  volatility: 'high',
  owner: UNKNOWN_OWNER,
  conflictValues: [
    {
      value: '30,000 won',
      sourceLabel: 'University guidance',
      sourceUrl:
        'https://gsc.korea.ac.kr/gsc/ExchangeVisitingProgram/Visa_Immigration/Visa/Visa.do',
      checkedAt: '2026-07-25',
    },
    {
      value: '34,000 won',
      sourceLabel: 'CIEE application experience',
      sourceUrl: 'https://www.ciee.org/go-abroad/college-study-abroad/blog/getting-arc-without-hirevisa',
      checkedAt: '2026-07-25',
    },
    {
      value: '35,000 won',
      sourceLabel: 'Ministry of Justice notice',
      sourceUrl: 'https://www.immigration.go.kr/bbs/immigration_eng/229/590314/artclView.do',
      checkedAt: '2026-07-25',
    },
    {
      value: '40,000 won',
      sourceLabel: 'HiKorea application route',
      sourceUrl: 'https://www.hikorea.go.kr/board/BoardApplicationListR.pt',
      checkedAt: '2026-07-25',
    },
  ],
};

const UNIVERSITY_RESIDENCE_SOURCE: TaskSourceMetadata = {
  sourceUrl:
    'https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133',
  sourceLabel: 'Yonsei University GIT guidance',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'the university international office',
  conflictNote: null,
  volatility: 'high',
  owner: UNKNOWN_OWNER,
  conflictValues: [],
};

const UNIVERSITY_GROUP_SOURCE: TaskSourceMetadata = {
  ...UNIVERSITY_RESIDENCE_SOURCE,
  sourceLabel: 'University international-office guidance',
  finalAuthority: 'your university international office',
};

const UNCONFIRMED_SOURCE: TaskSourceMetadata = {
  sourceUrl: '',
  sourceLabel: UNKNOWN_SOURCE_VALUE,
  checkedAt: null,
  reviewAfter: null,
  finalAuthority: 'your university international office',
  conflictNote: null,
  volatility: 'unknown',
  owner: UNKNOWN_OWNER,
  conflictValues: [],
};

/** Shared labels for the task page and Journey Home cards. */
export const TASK_METADATA: readonly TaskMetadata[] = [
  {
    taskId: 'residence-registration',
    title: 'Residence registration',
    summary: 'Assess the documents and timing for foreign resident registration.',
    source: RESIDENCE_REGISTRATION_SOURCE,
  },
  {
    taskId: 'housing-proof',
    title: 'Housing proof',
    summary: 'Prepare documents for your housing and contract holder.',
    dependsOn: ['residence-registration'],
    source: UNIVERSITY_RESIDENCE_SOURCE,
  },
  {
    taskId: 'group-registration',
    title: 'Group registration',
    summary: 'Check whether university-supported registration applies to your stay.',
    dependsOn: ['residence-registration'],
    source: UNIVERSITY_GROUP_SOURCE,
  },
  {
    taskId: 'departure-order',
    title: 'Departure order',
    summary: 'Choose how to handle your deposit and account before leaving Korea.',
    source: UNCONFIRMED_SOURCE,
  },
] as const;

export function taskMetadata(taskId: string): TaskMetadata | undefined {
  return TASK_METADATA.find((task) => task.taskId === taskId);
}

/** Returns true only when a known review date is today or earlier in KST. */
export function isSourceReviewDue(
  source: Pick<TaskSourceMetadata, 'reviewAfter'>,
  now: Date = kstNow(),
): boolean {
  if (!source.reviewAfter) return false;
  return kstDifferenceInDays(
    toKstStartOfDay(now),
    toKstStartOfDay(source.reviewAfter),
  ) >= 0;
}

export interface EvaluatedTask {
  taskId: string;
  state: TaskState;
  errorState?: TaskErrorState;
  blockedBy?: readonly string[];
  blockingReason?: string;
  alternativeMeans?: string;
  naReason?: string;
  naSourceUrl?: string;
  reviewReason?: string;
  pendingFields?: readonly ConditionAxis[];
  completedAt?: string;
}

export interface EvaluateTaskOptions {
  previousProfile?: ConditionProfile;
}

export type TaskAction =
  | 'start'
  | 'complete'
  | 'cancel'
  | 'uncomplete'
  | 'resolve_review'
  | 'reopen_review';

export interface TaskTransitionResult {
  state: TaskState;
  changed: boolean;
  reason?: string;
}

export interface ErrorTransition {
  id: 'E1' | 'E7';
  from: 'valid' | 'granted';
  to: 'input_invalid' | 'permission_denied';
}

/** Only confirmed axis-2 transitions are represented here. */
export const ERROR_TRANSITIONS: readonly ErrorTransition[] = [
  { id: 'E1', from: 'valid', to: 'input_invalid' },
  { id: 'E7', from: 'granted', to: 'permission_denied' },
];

function uniqueAxes(fields: readonly ConditionAxis[]): ConditionAxis[] {
  return [...new Set(fields)];
}

function expressionFields(expression: AppliesWhen | undefined): ConditionAxis[] {
  if (!expression || typeof expression === 'function') return [];
  if ('field' in expression) return [expression.field];
  if ('not' in expression) return expressionFields(expression.not);
  const expressions = 'all' in expression ? expression.all : expression.any;
  return uniqueAxes(expressions.flatMap(expressionFields));
}

function hasAffectedCondition(
  definition: TaskDefinition,
  changedAxes: readonly ConditionAxis[],
): boolean {
  if (changedAxes.length === 0) return false;
  const inferredAxes = uniqueAxes([
    ...expressionFields(definition.appliesWhen),
    ...(definition.permanentBlock ? expressionFields(definition.permanentBlock.when) : []),
  ]);
  const relevantAxes = definition.relevantAxes ?? inferredAxes;
  // A callback cannot be introspected. Treat it as affected unless it declares
  // a narrower axis list, so a condition change never silently loses a review.
  if (relevantAxes.length === 0 && (definition.appliesWhen || definition.permanentBlock)) {
    return true;
  }
  return relevantAxes.some((axis) => changedAxes.includes(axis));
}

function reviewTask(
  definition: TaskDefinition,
  reason: string,
  pendingFields: readonly ConditionAxis[] = [],
  completedAt?: string,
  errorState?: TaskErrorState,
): EvaluatedTask {
  return {
    taskId: definition.taskId,
    state: 'review_required',
    errorState,
    reviewReason: reason,
    pendingFields,
    completedAt,
  };
}

function isCompleted(progress: TaskProgress, taskId: string): boolean {
  return progress.completedTaskIds.includes(taskId);
}

function evaluateTask(
  definition: TaskDefinition,
  profile: ConditionProfile,
  progress: TaskProgress,
  completedIds: ReadonlySet<string>,
  options: EvaluateTaskOptions,
): EvaluatedTask {
  const completedAt = progress.completedAtByTaskId?.[definition.taskId];
  const errorState = progress.errorStateByTaskId?.[definition.taskId];
  const applies = evaluateAppliesWhen(definition.appliesWhen, profile);
  const changedAxes = options.previousProfile
    ? changedConditionAxes(options.previousProfile, profile)
    : [];
  const conditionChanged = hasAffectedCondition(definition, changedAxes);
  const wasCompleted = isCompleted(progress, definition.taskId);

  if (applies.status === 'unknown') {
    return reviewTask(
      definition,
      'Enter the missing conditions to assess this task.',
      applies.unknownFields,
      completedAt,
      errorState,
    );
  }

  if (applies.status === 'does_not_match') {
    if (wasCompleted && conditionChanged) {
      return reviewTask(
        definition,
        'Conditions changed. Recheck this completed task.',
        [],
        completedAt,
        errorState,
      );
    }
    if (
      !definition.notApplicable ||
      !definition.notApplicable.reason.trim() ||
      !definition.notApplicable.sourceUrl.trim()
    ) {
      return reviewTask(
        definition,
        'The official basis for marking this task not applicable is missing.',
        [],
        completedAt,
        errorState,
      );
    }
    return {
      taskId: definition.taskId,
      state: 'not_applicable',
      errorState,
      naReason: definition.notApplicable.reason,
      naSourceUrl: definition.notApplicable.sourceUrl,
      completedAt,
    };
  }

  if (wasCompleted && conditionChanged) {
    return reviewTask(
      definition,
      'Conditions changed. Recheck this completed task.',
      [],
      completedAt,
      errorState,
    );
  }
  if (wasCompleted) {
    return { taskId: definition.taskId, state: 'completed', errorState, completedAt };
  }
  if (progress.reviewReasons?.[definition.taskId]) {
    return reviewTask(
      definition,
      progress.reviewReasons[definition.taskId],
      [],
      completedAt,
      errorState,
    );
  }

  if (definition.permanentBlock) {
    const block = evaluateAppliesWhen(definition.permanentBlock.when, profile);
    if (block.status === 'unknown') {
      return reviewTask(
        definition,
        'Enter the missing conditions to assess eligibility.',
        block.unknownFields,
        completedAt,
        errorState,
      );
    }
    if (
      block.status === 'matches' &&
      definition.permanentBlock.reason.trim() &&
      definition.permanentBlock.alternativeMeans.trim()
    ) {
      return {
        taskId: definition.taskId,
        state: 'locked_permanent',
        errorState,
        blockingReason: definition.permanentBlock.reason,
        alternativeMeans: definition.permanentBlock.alternativeMeans,
        completedAt,
      };
    }
  }

  const dependencies = definition.dependsOn ?? [];
  const incompleteDependencies = dependencies.filter((taskId) => !completedIds.has(taskId));
  if (incompleteDependencies.length > 0) {
    return {
      taskId: definition.taskId,
      state: 'locked',
      errorState,
      blockedBy: incompleteDependencies,
      blockingReason: `Complete ${incompleteDependencies.join(', ')} first.`,
      completedAt,
    };
  }

  if (progress.inProgressTaskIds?.includes(definition.taskId)) {
    return { taskId: definition.taskId, state: 'in_progress', errorState, completedAt };
  }

  return { taskId: definition.taskId, state: 'available', errorState, completedAt };
}

/** Re-evaluates the full task set from local conditions and progress. */
export function evaluateTasks(
  definitions: readonly TaskDefinition[],
  profile: ConditionProfile,
  progress: TaskProgress,
  options: EvaluateTaskOptions = {},
): EvaluatedTask[] {
  const completedIds = new Set(progress.completedTaskIds);
  return definitions.map((definition) =>
    evaluateTask(definition, profile, progress, completedIds, options),
  );
}

/** Named entry point for condition-change callers; verdicts remain derived. */
export function reevaluateTasks(
  definitions: readonly TaskDefinition[],
  profile: ConditionProfile,
  progress: TaskProgress,
  options: EvaluateTaskOptions = {},
): EvaluatedTask[] {
  return evaluateTasks(definitions, profile, progress, options);
}

export function transitionTaskState(current: TaskState, action: TaskAction): TaskTransitionResult {
  switch (action) {
    case 'start':
      return current === 'available'
        ? { state: 'in_progress', changed: true }
        : { state: current, changed: false, reason: 'Only available tasks can be started.' };
    case 'complete':
      return current === 'available' || current === 'in_progress' || current === 'review_required'
        ? { state: 'completed', changed: true }
        : { state: current, changed: false, reason: 'This task is not ready to be completed.' };
    case 'cancel':
      return current === 'in_progress'
        ? { state: 'available', changed: true }
        : { state: current, changed: false, reason: 'Only in-progress tasks can be cancelled.' };
    case 'uncomplete':
      return current === 'completed'
        ? { state: 'available', changed: true }
        : { state: current, changed: false, reason: 'Only completed tasks can be uncompleted.' };
    case 'resolve_review':
      return current === 'review_required'
        ? { state: 'completed', changed: true }
        : { state: current, changed: false, reason: 'Only review-required tasks can be resolved.' };
    case 'reopen_review':
      return current === 'review_required'
        ? { state: 'available', changed: true }
        : { state: current, changed: false, reason: 'Only review-required tasks can be reopened.' };
  }
}

export function errorStateForInput(
  isValid: boolean,
): Extract<TaskErrorState, 'input_invalid'> | undefined {
  return isValid ? undefined : 'input_invalid';
}

export function errorStateForPermission(
  permission: 'granted' | 'denied',
): Extract<TaskErrorState, 'permission_denied'> | undefined {
  return permission === 'denied' ? 'permission_denied' : undefined;
}

export function errorStateForSource(
  reachable: boolean,
): Extract<TaskErrorState, 'source_unreachable'> | undefined {
  return reachable ? undefined : 'source_unreachable';
}

export function hasUnknownFields(profile: ConditionProfile, fields: readonly ConditionAxis[]): boolean {
  return fields.some((field) => isUnknownConditionValue(profile[field]));
}
