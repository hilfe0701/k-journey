/** REQ-SFR-007 · TC-031 – TC-035. */

import {
  APPOINTMENT_LEAD_TIME_DAYS,
  evaluateDocumentTaskAgainstAppointment,
  evaluateImmigrationAppointment,
  IMMIGRATION_APPOINTMENT_TASK_ID,
} from '../immigrationAppointment';
import { UNKNOWN } from '../firebase';
import { taskMetadata } from '../taskState';

describe('REQ-SFR-007 immigration appointment as a prerequisite', () => {
  it('TC-031 / AC1: an unbooked appointment locks the document task and names the prerequisite', () => {
    const state = evaluateDocumentTaskAgainstAppointment(false, false);

    expect(state.state).toBe('locked');
    expect(state.blockedBy).toEqual([IMMIGRATION_APPOINTMENT_TASK_ID]);
    expect(state.blockedBy).toHaveLength(1);
    expect(state.reason).toMatch(/appointment/i);

    // The dependency must also be declared on the task itself, or the detail
    // screen shows a lock with no prerequisite listed beside it.
    expect(taskMetadata('housing-proof')?.dependsOn).toContain(IMMIGRATION_APPOINTMENT_TASK_ID);
  });

  it('TC-032 / AC2: booking the appointment moves the document task to available', () => {
    const state = evaluateDocumentTaskAgainstAppointment(true, false);

    expect(state.state).toBe('available');
    expect(state.blockedBy).toHaveLength(0);
  });

  it('TC-033 / AC3: completing without a date is allowed and the date reads as unknown', () => {
    const verdict = evaluateImmigrationAppointment(true, null);

    expect(verdict.status).toBe('booked');
    expect(verdict.appointmentDate).toBeNull();
    expect(verdict.appointmentDateLabel).toBe('Not confirmed (미확인)');
    expect(verdict.finalAuthority).toMatch(/HiKorea/);

    // An explicitly unknown value behaves the same as a missing one.
    expect(evaluateImmigrationAppointment(true, UNKNOWN).appointmentDateLabel).toBe(
      'Not confirmed (미확인)',
    );

    // A real date is kept as given.
    expect(evaluateImmigrationAppointment(true, '2026-09-10').appointmentDate).toBe('2026-09-10');
  });

  it('TC-034 / AC4 (negative): no waiting period is generated or guaranteed', () => {
    // The source has no lead time. Producing one would be read as guidance.
    expect(APPOINTMENT_LEAD_TIME_DAYS).toBe(UNKNOWN);
    expect(evaluateImmigrationAppointment(true, '2026-09-10').leadTimeDays).toBeNull();
    expect(evaluateImmigrationAppointment(false, null).leadTimeDays).toBeNull();

    // The task's own source keeps the gap visible rather than closing it.
    expect(taskMetadata(IMMIGRATION_APPOINTMENT_TASK_ID)?.source.conflictNote).toMatch(
      /not confirmed/i,
    );
  });

  it('TC-035 / AC5 (edge): un-booking re-blocks the document task but keeps its completion', () => {
    const state = evaluateDocumentTaskAgainstAppointment(false, true);

    expect(state.state).toBe('review_required');
    expect(state.blockedBy).toEqual([IMMIGRATION_APPOINTMENT_TASK_ID]);

    // The completion the user recorded survives. Deleting it would destroy work
    // the user actually did — the failure DEC-026 field 7 forbids.
    expect(state.retainedCompletion).toBe(true);
    expect(state.reason).toMatch(/kept/i);
  });

  it('TC-035 / AC5 (edge): re-booking restores availability without losing the completion', () => {
    const state = evaluateDocumentTaskAgainstAppointment(true, true);

    expect(state.state).toBe('available');
    expect(state.retainedCompletion).toBe(true);
  });
});
