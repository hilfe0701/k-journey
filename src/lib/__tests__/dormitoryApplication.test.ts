/** REQ-SFR-009 · TC-041 – TC-045. */

import {
  DORMITORY_APPLICATION_DEADLINES,
  DORMITORY_DEPENDENT_AXES,
  dormitoryDeadlineFor,
  evaluateDormitoryApplication,
} from '../dormitoryApplication';
import { UNKNOWN } from '../firebase';

const NOW = new Date('2026-07-28T09:00:00+09:00');

describe('REQ-SFR-009 dormitory application deadline', () => {
  it('TC-041 / AC1: a confirmed deadline yields one task with its date and evidence', () => {
    const verdict = evaluateDormitoryApplication('cau', {
      now: NOW,
      deadlineOverride: '2026-08-20',
    });

    expect(verdict.status).toBe('applicable');
    expect(verdict.deadline).toBe('2026-08-20');
    expect(verdict.sourceUrl).toContain('cau.ac.kr');
    expect(verdict.checkedAt).toBe('2026-07-25');
    expect(verdict.finalAuthority).toMatch(/Chung-Ang/);
  });

  it('TC-042 / AC2: a future deadline reports both the countdown and the absolute date', () => {
    const verdict = evaluateDormitoryApplication('cau', {
      now: NOW,
      deadlineOverride: '2026-08-20',
    });

    // Both, not either: a countdown alone is unreadable once the app is
    // reopened days later, and a date alone hides the urgency.
    expect(verdict.daysRemaining).toBe(23);
    expect(verdict.deadlineLabel).toBe('2026-08-20');

    // A deadline that is today is still open, not overdue.
    const today = evaluateDormitoryApplication('cau', {
      now: NOW,
      deadlineOverride: '2026-07-28',
    });
    expect(today.daysRemaining).toBe(0);
    expect(today.status).toBe('applicable');
  });

  it('TC-043 / AC3: a dormitory outcome recalculates the housing-driven axes', () => {
    expect(DORMITORY_DEPENDENT_AXES).toEqual(['housingType', 'contractHolder']);
  });

  it('TC-044 / AC4 (negative): an unconfirmed school never borrows another school\'s date', () => {
    // Every shipped record is dateless, so this is also the real shipped path.
    for (const record of DORMITORY_APPLICATION_DEADLINES) {
      const verdict = evaluateDormitoryApplication(record.universityId, { now: NOW });
      expect(verdict.status).toBe('review_required');
      expect(verdict.deadline).toBeNull();
      expect(verdict.deadlineLabel).toBe('Not confirmed (미확인)');
      expect(verdict.daysRemaining).toBeNull();
      expect(verdict.finalAuthority.trim().length).toBeGreaterThan(0);
    }

    // Giving one school a date must not leak into any other school.
    const cau = evaluateDormitoryApplication('cau', {
      now: NOW,
      deadlineOverride: '2026-08-20',
    });
    expect(cau.deadline).toBe('2026-08-20');
    expect(evaluateDormitoryApplication('yonsei', { now: NOW }).deadline).toBeNull();
    expect(evaluateDormitoryApplication('korea', { now: NOW }).deadline).toBeNull();

    // An unknown university asks for the university, not for a date.
    const unknown = evaluateDormitoryApplication(UNKNOWN, { now: NOW });
    expect(unknown.status).toBe('review_required');
    expect(unknown.reason).toMatch(/which university/i);
  });

  it('TC-045 / AC5 (edge): a passed deadline is flagged overdue and never auto-completed', () => {
    const verdict = evaluateDormitoryApplication('cau', {
      now: NOW,
      deadlineOverride: '2026-07-01',
    });

    expect(verdict.status).toBe('overdue');
    expect(verdict.daysRemaining).toBe(-27);
    expect(verdict.autoCompleted).toBe(false);
    expect(verdict.reason).toMatch(/passed/i);
    expect(verdict.finalAuthority).toMatch(/Chung-Ang/);
  });

  it('TC-045 / AC5 (edge): no evaluation path ever sets autoCompleted', () => {
    const cases = [
      evaluateDormitoryApplication(UNKNOWN, { now: NOW }),
      evaluateDormitoryApplication('cau', { now: NOW }),
      evaluateDormitoryApplication('cau', { now: NOW, deadlineOverride: '2026-08-20' }),
      evaluateDormitoryApplication('cau', { now: NOW, deadlineOverride: '2026-07-01' }),
    ];
    for (const verdict of cases) {
      expect(verdict.autoCompleted).toBe(false);
    }
  });

  it('ships every deadline empty, because none was verified', () => {
    expect(DORMITORY_APPLICATION_DEADLINES.length).toBeGreaterThan(0);
    expect(DORMITORY_APPLICATION_DEADLINES.every((record) => record.deadline === null)).toBe(true);

    // Chung-Ang is the one school with a verified page, and even it has no
    // published dormitory deadline — the URL is real, the date is not.
    const cau = dormitoryDeadlineFor('cau');
    expect(cau?.sourceUrl).toContain('cau.ac.kr');
    expect(cau?.deadline).toBeNull();
  });
});
