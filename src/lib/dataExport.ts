/**
 * REQ-SFR-012 · POL-010 · DEC-001 · SET-05 · MET-006:
 * export the local journey data as human-readable text.
 *
 * This exists because `DEC-001` chose to keep every value on the device with no
 * account. That choice has a cost — a lost or wiped phone loses everything — and
 * a manual export is the compensating measure, not a convenience feature.
 *
 * Two rules shape the output:
 *  - An empty export is never reported as a success (AC5). A file containing
 *    nothing looks exactly like a successful backup until the day it is needed.
 *  - A missing completion time is written as unknown, not omitted (AC2), so the
 *    reader can tell "not done" apart from "done, time not recorded".
 */

import { CONDITION_AXES, CONDITION_AXIS_GROUPS } from './conditionRules';
import { UNKNOWN, type ConditionProfile, type LocalTaskProgress } from './firebase';
import { ALL_TASK_IDS, taskMetadata } from './taskState';

const UNKNOWN_VALUE_LABEL = 'Not confirmed (미확인)';

export type ConditionGroupKey = (typeof CONDITION_AXIS_GROUPS)[number];

const CONDITION_GROUP_LABELS: Record<ConditionGroupKey, string> = {
  universityId: 'University',
  programType: 'Program type',
  visaTypeOrStatus: 'Visa type or status',
  housingType: 'Housing type',
  contractHolder: 'Contract holder',
  totalStayDays: 'Total stay length (days)',
  nationality: 'Nationality',
  homeCountryInsurance: 'Home-country insurance',
  residenceCardStatus: 'Residence card status',
  dates: 'Dates (arrival / departure / program start)',
};

export interface ExportedCondition {
  key: ConditionGroupKey;
  label: string;
  value: string;
}

export interface ExportedTask {
  taskId: string;
  title: string;
  state: 'completed' | 'in_progress' | 'not_started';
  completedAt: string;
}

export type ExportStatus = 'ready' | 'empty';

export interface ExportPayload {
  status: ExportStatus;
  conditions: readonly ExportedCondition[];
  tasks: readonly ExportedTask[];
  text: string;
  /** AC3 · TC-058: stated on every successful export, never implied. */
  custodyNotice: string;
}

export const CUSTODY_NOTICE =
  'This text is yours to keep. K-Journey does not store, back up, or restore it — if you lose this file, the app cannot recover it.';

const EMPTY_NOTICE =
  'There is nothing to export yet. Complete onboarding so your conditions and tasks have values.';

function hasValue(value: unknown): boolean {
  return value !== UNKNOWN && value !== null && value !== undefined && value !== '';
}

function formatConditionValue(value: unknown): string {
  return hasValue(value) ? String(value) : UNKNOWN_VALUE_LABEL;
}

function readGroupValue(profile: ConditionProfile, key: ConditionGroupKey): string {
  if (key !== 'dates') {
    return formatConditionValue(profile[key]);
  }
  // The glossary treats the three date fields as one axis group, so they are
  // exported as one named line with all three values kept distinguishable.
  return [
    `arrival ${formatConditionValue(profile.arrivalDate)}`,
    `departure ${formatConditionValue(profile.departureDate)}`,
    `program start ${formatConditionValue(profile.programStartDate)}`,
  ].join(' · ');
}

function taskStateFor(
  progress: LocalTaskProgress,
  taskId: string,
): ExportedTask['state'] {
  if (progress.completedTaskIds.includes(taskId)) return 'completed';
  if (progress.inProgressTaskIds.includes(taskId)) return 'in_progress';
  return 'not_started';
}

/** AC1 · AC2 · AC5 · TC-056 · TC-057 · TC-060. */
export function buildExportPayload(
  profile: ConditionProfile | null,
  progress: LocalTaskProgress,
): ExportPayload {
  const conditions: ExportedCondition[] = CONDITION_AXIS_GROUPS.map((key) => ({
    key,
    label: CONDITION_GROUP_LABELS[key],
    value: profile ? readGroupValue(profile, key) : UNKNOWN_VALUE_LABEL,
  }));

  const tasks: ExportedTask[] = ALL_TASK_IDS.map((taskId) => ({
    taskId,
    title: taskMetadata(taskId)?.title ?? taskId,
    state: taskStateFor(progress, taskId),
    // AC2: a completed task with no recorded time keeps its state and says so.
    completedAt: progress.completedAtByTaskId[taskId] ?? UNKNOWN_VALUE_LABEL,
  }));

  // AC5: "no profile" and "every condition unknown with no task touched" are
  // both empty. Writing either one out as a successful file would hand the user
  // a backup of nothing.
  //
  // Emptiness is decided on the raw values, not the rendered ones: the `dates`
  // group renders as "arrival … · departure … · program start …", which never
  // equals the unknown label even when all three are unknown. Comparing
  // rendered strings marked a fully empty profile as ready to export.
  const hasCondition = profile !== null && CONDITION_AXES.some((axis) => hasValue(profile[axis]));
  const hasTaskActivity = tasks.some((task) => task.state !== 'not_started');
  const status: ExportStatus = hasCondition || hasTaskActivity ? 'ready' : 'empty';

  return {
    status,
    conditions,
    tasks,
    text: status === 'empty' ? EMPTY_NOTICE : renderExportText(conditions, tasks),
    custodyNotice: CUSTODY_NOTICE,
  };
}

function renderExportText(
  conditions: readonly ExportedCondition[],
  tasks: readonly ExportedTask[],
): string {
  const conditionLines = conditions.map(
    (condition) => `- ${condition.label}: ${condition.value}`,
  );
  const taskLines = tasks.map(
    (task) => `- ${task.title} (${task.taskId}): ${task.state} · completed at ${task.completedAt}`,
  );

  return [
    'K-Journey export',
    '',
    `Conditions (${conditions.length})`,
    ...conditionLines,
    '',
    `Tasks (${tasks.length})`,
    ...taskLines,
    '',
    CUSTODY_NOTICE,
  ].join('\n');
}

export type DeliveryOutcome = 'delivered' | 'failed' | 'nothing_to_export';

export interface ExportResultView {
  outcome: DeliveryOutcome;
  /** AC4 · TC-059: false whenever delivery failed, regardless of text length. */
  reportedAsSuccess: boolean;
  message: string;
  /** AC4: the same full text stays available to copy after a failure. */
  copyableText: string | null;
  /** AC5 · TC-060: the action offered when there is no data at all. */
  action: 'none' | 'copy' | 'go_to_onboarding';
}

/**
 * AC3 · AC4 · AC5 · TC-058 · TC-059 · TC-060.
 *
 * A failed delivery is not a failed export: the text was built successfully and
 * is offered for copying. What must not happen is calling it delivered.
 */
export function resolveExportResult(
  payload: ExportPayload,
  delivered: boolean,
): ExportResultView {
  if (payload.status === 'empty') {
    return {
      outcome: 'nothing_to_export',
      reportedAsSuccess: false,
      message: EMPTY_NOTICE,
      copyableText: null,
      action: 'go_to_onboarding',
    };
  }

  if (!delivered) {
    return {
      outcome: 'failed',
      reportedAsSuccess: false,
      message:
        'The export was not delivered. The full text is below — copy it somewhere you control.',
      copyableText: payload.text,
      action: 'copy',
    };
  }

  return {
    outcome: 'delivered',
    reportedAsSuccess: true,
    message: payload.custodyNotice,
    copyableText: payload.text,
    action: 'copy',
  };
}
