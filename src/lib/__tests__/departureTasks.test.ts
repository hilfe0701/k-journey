/**
 * REQ-SFR-002 · TC-006 – TC-010.
 *
 * Each ID names a test that drives the rule, not a comment beside one — `47`
 * §2.2 ★12 found four IDs whose "verification" was a single comment line.
 */

import {
  DEPARTURE_TASKS,
  DEPARTURE_TASK_IDS,
  DEPOSIT_ACCOUNT_OUTCOMES,
  departureTaskSpec,
  departureTasksForTiming,
  evaluateResidenceCardReturn,
  RESIDENCE_CARD_RETURN_EXCEPTIONS,
  telecomOverseasGuidance,
} from '../departureTasks';
import { UNKNOWN } from '../firebase';

describe('REQ-SFR-002 pre-departure stage', () => {
  it('TC-006 / AC1: exposes nine departure tasks, each with its timing', () => {
    expect(DEPARTURE_TASKS).toHaveLength(9);

    // Every task must say when it can be done — AC1 asks for the tasks *and*
    // their timing, and a task with no timing is the failure this prevents.
    for (const task of DEPARTURE_TASKS) {
      expect(task.timingLabel.trim().length).toBeGreaterThan(0);
      expect(['before_departure', 'at_departure', 'after_departure']).toContain(task.timing);
    }

    // The nine are G1–G9 from the source research, with none collapsed away.
    expect(new Set(DEPARTURE_TASKS.map((task) => task.sourceId))).toEqual(
      new Set(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9']),
    );
    expect(new Set(DEPARTURE_TASKS.map((task) => task.taskId)).size).toBe(9);
  });

  it('TC-006 / AC1: splits the nine across before, at, and after departure', () => {
    expect(departureTasksForTiming('before_departure')).toHaveLength(7);
    expect(departureTasksForTiming('at_departure').map((task) => task.sourceId)).toEqual(['G1']);
    expect(departureTasksForTiming('after_departure').map((task) => task.sourceId)).toEqual(['G6']);
  });

  it('TC-006 / AC1: three prerequisites gate the account closure', () => {
    const account = departureTaskSpec(DEPARTURE_TASK_IDS.bankAccount);
    expect(account?.dependsOn).toHaveLength(3);
    expect(account?.dependsOn).toEqual(
      expect.arrayContaining([
        DEPARTURE_TASK_IDS.transitAutoCharge,
        DEPARTURE_TASK_IDS.telecom,
        DEPARTURE_TASK_IDS.utilities,
      ]),
    );

    // No other task carries a prerequisite: three is the confirmed number.
    const withDependencies = DEPARTURE_TASKS.filter((task) => task.dependsOn.length > 0);
    expect(withDependencies.map((task) => task.taskId)).toEqual([
      DEPARTURE_TASK_IDS.bankAccount,
    ]);
  });

  it('TC-007 / AC2: a permanent departure returns the card and shows all three exceptions', () => {
    const verdict = evaluateResidenceCardReturn('permanent', UNKNOWN);

    expect(verdict.status).toBe('return_required');
    expect(verdict.exceptions).toHaveLength(3);
    expect(verdict.exceptions).toEqual(RESIDENCE_CARD_RETURN_EXCEPTIONS);
    expect(verdict.sourceUrl).toContain('law.go.kr');
    expect(verdict.checkedAt).toBe('2026-07-25');
    expect(verdict.finalAuthority).toMatch(/HiKorea/);
  });

  it('TC-008 / AC3: both deposit and account outcomes are stated, neither marked correct', () => {
    expect(DEPOSIT_ACCOUNT_OUTCOMES).toHaveLength(2);
    expect(DEPOSIT_ACCOUNT_OUTCOMES.map((option) => option.choice)).toEqual([
      'deposit-first',
      'account-first',
    ]);

    for (const option of DEPOSIT_ACCOUNT_OUTCOMES) {
      expect(option.outcome.trim().length).toBeGreaterThan(0);
    }

    // Neither option may be presented as the answer. A recommendation word in
    // either outcome is the regression this catches.
    const recommendationWords = /\b(recommended|should|best|correct|must)\b/i;
    for (const option of DEPOSIT_ACCOUNT_OUTCOMES) {
      expect(option.outcome).not.toMatch(recommendationWords);
      expect(option.title).not.toMatch(recommendationWords);
    }
  });

  it('TC-009 / AC4 (negative): overseas cancellation is never claimed possible', () => {
    const guidance = telecomOverseasGuidance();

    expect(guidance.overseasCancellationConfirmed).toBe(false);
    expect(guidance.checkBeforeLeaving.length).toBeGreaterThan(0);
    expect(guidance.finalAuthority.trim().length).toBeGreaterThan(0);

    // The task's own conflict note must keep the unknown visible rather than
    // resolving it in the app's favour.
    const telecom = departureTaskSpec(DEPARTURE_TASK_IDS.telecom);
    expect(telecom?.source.conflictNote).toMatch(/not confirmed/i);
  });

  it('TC-010 / AC5 (edge): a temporary departure with an exception is not judged a return', () => {
    const verdict = evaluateResidenceCardReturn('temporary', 'yes');

    expect(verdict.status).toBe('review_required');
    expect(verdict.status).not.toBe('return_required');
    expect(verdict.finalAuthority).toMatch(/HiKorea/);
  });

  it('TC-010 / AC5 (edge): an unanswered temporary departure stays unresolved, not defaulted', () => {
    // The dangerous failure is a silent default either way: telling someone to
    // surrender a card they need, or to keep one they must hand over.
    expect(evaluateResidenceCardReturn('temporary', UNKNOWN).status).toBe('review_required');
    expect(evaluateResidenceCardReturn(UNKNOWN, UNKNOWN).status).toBe('review_required');
    expect(evaluateResidenceCardReturn(UNKNOWN, 'yes').status).toBe('review_required');

    // With no exception, the statute applies to a temporary departure too.
    expect(evaluateResidenceCardReturn('temporary', 'no').status).toBe('return_required');
  });

  it('G3 keeps an empty source and explains the gap instead of inventing a link', () => {
    // No national rule governs a dormitory deposit refund — each hall sets its
    // own residence regulations — so the record must carry the gap, the reason
    // for it, and the office to ask.
    const spec = departureTaskSpec(DEPARTURE_TASK_IDS.dormitoryDeposit);

    expect(spec?.source.sourceUrl).toBe('');
    expect(spec?.source.checkedAt).toBeNull();
    expect(spec?.source.finalAuthority.trim().length).toBeGreaterThan(0);
    expect(spec?.source.conflictNote).toMatch(/not by a national rule/);
  });

  it('G3 does not state when the refund arrives', () => {
    // The old summary asserted the refund "may be paid after you leave" with
    // nothing behind it. The task may raise the possibility as a reason to keep
    // an account open; it may not present a timing as established.
    const summary = departureTaskSpec(DEPARTURE_TASK_IDS.dormitoryDeposit)?.summary ?? '';

    expect(summary).toMatch(/dormitory decides/i);
    expect(summary).not.toMatch(/is paid after|will be paid after/);
  });

  it('G6 carries the national transcript listing and names the registrar', () => {
    const spec = departureTaskSpec(DEPARTURE_TASK_IDS.transcript);

    expect(spec?.source.sourceUrl).toMatch(/^https:\/\/www\.gov\.kr\//);
    expect(spec?.source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(spec?.source.finalAuthority).toMatch(/registrar/);
    // The listing covers the certificate, not overseas dispatch or fees.
    expect(spec?.source.conflictNote).toMatch(/each university/);
  });
});
