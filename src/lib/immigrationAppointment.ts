/**
 * REQ-SFR-007 · POL-006 · DEC-011 · TASK-01 · T1:
 * the immigration appointment as an independent task that precedes document
 * preparation.
 *
 * The ordering exists because appointment slots, not paperwork, are the scarce
 * resource: `14-k-journey-source-verification-registration-documents.md` §4·§7
 * found the booking constrained while the documents themselves are not.
 *
 * What that source does *not* give is a lead time. No waiting period is
 * generated here — `appointmentLeadTimeDays` is permanently unknown rather than
 * estimated, because a wrong number would be acted on as if it were guidance.
 */

import type { TaskMetadata, TaskSourceMetadata } from './taskState';
import { UNKNOWN, type UnknownValue } from './firebase';

const UNKNOWN_VALUE_LABEL = 'Not confirmed (미확인)';

export const IMMIGRATION_APPOINTMENT_TASK_ID = 'immigration-appointment';

const APPOINTMENT_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.hikorea.go.kr/Main.pt',
  sourceLabel: 'HiKorea visit reservation service',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'HiKorea and your local immigration office',
  conflictNote:
    'Waiting time and the rule for rebooking after a rejected application are not confirmed. Check availability directly.',
  volatility: 'high',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

/**
 * REQ-SFR-007 AC4 · TC-034: there is no confirmed lead time, and the app does
 * not invent one. This constant exists so the absence is explicit and testable
 * rather than being an omission nobody notices.
 */
export const APPOINTMENT_LEAD_TIME_DAYS: UnknownValue = UNKNOWN;

export const IMMIGRATION_APPOINTMENT_METADATA: TaskMetadata = {
  taskId: IMMIGRATION_APPOINTMENT_TASK_ID,
  title: 'Book your immigration appointment',
  summary: 'Secure a visit slot before you start preparing the registration documents.',
  source: APPOINTMENT_SOURCE,
};

export interface AppointmentVerdict {
  status: 'booked' | 'not_booked';
  /** ISO date the user entered, or `null` when they marked it done without one. */
  appointmentDate: string | null;
  /** REQ-SFR-007 AC3 · TC-033: completion without a date is allowed, not blocked. */
  appointmentDateLabel: string;
  finalAuthority: string;
  /** REQ-SFR-007 AC4: always null. Kept as a field so tests can assert it. */
  leadTimeDays: null;
}

/**
 * REQ-SFR-007 AC3 · TC-033: marking the appointment done without entering a
 * date is a valid state. The date is shown as unknown with the office that can
 * confirm it, instead of refusing the completion or inventing a date.
 */
export function evaluateImmigrationAppointment(
  isCompleted: boolean,
  appointmentDate: string | null | UnknownValue,
): AppointmentVerdict {
  const knownDate =
    typeof appointmentDate === 'string' && appointmentDate !== UNKNOWN ? appointmentDate : null;

  return {
    status: isCompleted ? 'booked' : 'not_booked',
    appointmentDate: knownDate,
    appointmentDateLabel: knownDate ?? UNKNOWN_VALUE_LABEL,
    finalAuthority: APPOINTMENT_SOURCE.finalAuthority,
    leadTimeDays: null,
  };
}

export interface DownstreamDocumentState {
  state: 'locked' | 'available' | 'review_required';
  blockedBy: readonly string[];
  reason?: string;
  /** REQ-SFR-007 AC5 · TC-035: an existing completion is never deleted. */
  retainedCompletion: boolean;
}

/**
 * REQ-SFR-007 AC1 · AC2 · AC5 · TC-031 · TC-032 · TC-035.
 *
 * Un-completing the appointment re-blocks the document task, but a document
 * completion the user already recorded is kept and flagged for recheck. Losing
 * it would delete work the user did, which `DEC-026` forbids.
 */
export function evaluateDocumentTaskAgainstAppointment(
  appointmentCompleted: boolean,
  documentPreviouslyCompleted: boolean,
): DownstreamDocumentState {
  if (appointmentCompleted) {
    return {
      state: 'available',
      blockedBy: [],
      retainedCompletion: documentPreviouslyCompleted,
    };
  }

  if (documentPreviouslyCompleted) {
    return {
      state: 'review_required',
      blockedBy: [IMMIGRATION_APPOINTMENT_TASK_ID],
      reason:
        'The appointment is no longer marked as booked. Your document progress is kept — recheck it against the new appointment.',
      retainedCompletion: true,
    };
  }

  return {
    state: 'locked',
    blockedBy: [IMMIGRATION_APPOINTMENT_TASK_ID],
    reason: 'Book the immigration appointment before preparing the documents.',
    retainedCompletion: false,
  };
}
