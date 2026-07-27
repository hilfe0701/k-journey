import type { ConditionAxis, ConditionProfile } from './firebase';
import {
  type AppliesWhen,
  changedConditionAxes,
  evaluateAppliesWhen,
  isUnknownConditionValue,
} from './conditionRules';

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
}

/** Shared labels for the task page and Journey Home cards. */
export const TASK_METADATA: readonly TaskMetadata[] = [
  {
    taskId: 'residence-registration',
    title: 'Residence registration',
    summary: 'Assess the documents and timing for foreign resident registration.',
  },
  {
    taskId: 'housing-proof',
    title: 'Housing proof',
    summary: 'Prepare documents for your housing and contract holder.',
    dependsOn: ['residence-registration'],
  },
  {
    taskId: 'group-registration',
    title: 'Group registration',
    summary: 'Check whether university-supported registration applies to your stay.',
    dependsOn: ['residence-registration'],
  },
  {
    taskId: 'departure-order',
    title: 'Departure order',
    summary: 'Choose how to handle your deposit and account before leaving Korea.',
  },
] as const;

export function taskMetadata(taskId: string): TaskMetadata | undefined {
  return TASK_METADATA.find((task) => task.taskId === taskId);
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
