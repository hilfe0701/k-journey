/**
 * REQ-SFR-002 · POL-004 · POL-006 · DEC-004 · DEC-023 · HOME-03 · TASK-01 · TASK-04:
 * the `pre-departure` stage — nine tasks (G1–G9) and three prerequisites.
 *
 * The nine tasks and their timing come from
 * `11-k-journey-proto-persona-pp05-dorm-departure.md` §3.2 and were verified
 * against primary sources in
 * `13-k-journey-source-verification-departure-tasks.md`.
 *
 * Two facts shape this module:
 *
 *  1. G1 (residence-card return) is a *permanent departure* act. Article 37(1)
 *     of the Immigration Act lists three re-entry exceptions, so a temporary
 *     departure must never be judged "return required" — it becomes
 *     `review_required` with the final authority named.
 *  2. G3 (deposit refund, paid *after* departure) and G4 (account closure,
 *     possible *only before* departure) genuinely conflict. Neither is a rule
 *     violation, so the app presents both outcomes instead of one answer.
 */

import type { TaskMetadata, TaskSourceMetadata } from './taskState';
import { UNKNOWN, type UnknownValue } from './firebase';

/** Whether the user intends to come back. Not a condition axis — see DEC-040. */
export type DepartureType = 'permanent' | 'temporary' | UnknownValue;

/** Whether one of the three Article 37(1) re-entry exceptions applies. */
export type ReentryException = 'yes' | 'no' | UnknownValue;

/** When a departure task can actually be carried out. */
export type DepartureTiming = 'before_departure' | 'at_departure' | 'after_departure';

export interface DepartureTaskSpec {
  taskId: string;
  /** Source-document identifier (G1–G9) so the ledger stays traceable. */
  sourceId: string;
  title: string;
  summary: string;
  timing: DepartureTiming;
  timingLabel: string;
  dependsOn: readonly string[];
  source: TaskSourceMetadata;
}

const UNKNOWN_VALUE_LABEL = 'Not confirmed (미확인)';

const IMMIGRATION_ACT_37: TaskSourceMetadata = {
  sourceUrl: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=245973',
  sourceLabel: 'Immigration Act Article 37(1), Korean Law Information Center',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'HiKorea and the Korea Immigration Service call centre 1345',
  conflictNote: null,
  volatility: 'low',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

const TELECOM_CANCELLATION: TaskSourceMetadata = {
  sourceUrl:
    'https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=1650&ccfNo=3&cciNo=2&cnpClsNo=1',
  sourceLabel: 'Easy Law Korea — telecommunications contract termination procedure',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'your mobile carrier',
  conflictNote:
    'Whether the contract can be cancelled from outside Korea is not confirmed. Check with the carrier before you leave.',
  volatility: 'medium',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

const NHIS_ELECTRONIC_BILL: TaskSourceMetadata = {
  sourceUrl:
    'https://che.yonsei.ac.kr/che/community_che/notice.do?mode=download&articleNo=113543&attachNo=95814',
  sourceLabel: 'National Health Insurance Service guidance for foreign subscribers',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'NHIS 1577-1000 (press 7 for foreign-language service)',
  conflictNote: null,
  volatility: 'high',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

const LEAVING_KOREA_HANDBOOK: TaskSourceMetadata = {
  sourceUrl: 'https://www.fulbright.or.kr/en/handbook/leaving-korea/',
  sourceLabel: 'Fulbright Korea — leaving Korea handbook (secondary institutional guidance)',
  checkedAt: '2026-07-25',
  reviewAfter: null,
  finalAuthority: 'your bank, carrier, or service provider',
  conflictNote:
    'This handbook is practical institutional guidance, not a bank, carrier, or government rule. Confirm the final procedure with the named service provider.',
  volatility: 'medium',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

const BANK_ACCOUNT_CLOSURE: TaskSourceMetadata = {
  ...LEAVING_KOREA_HANDBOOK,
  sourceLabel: 'Fulbright Korea and SUNY Korea departure guidance (secondary; not a bank authority)',
  finalAuthority: 'your bank branch',
  conflictNote:
    'Fulbright/SUNY Korea guidance is secondary institutional advice, not a bank rule. An account may have branch-specific closure requirements, while a dormitory deposit may arrive after departure. Ask your bank branch and dormitory office; both outcomes are shown instead of one recommendation.',
};

/**
 * G3. No national rule governs a dormitory deposit refund: each hall sets its
 * own residence regulations, and the ones published by Korean universities
 * differ on both the deduction and when the money moves. So the source stays
 * empty on purpose — but the task no longer states a procedure to go with it,
 * and the note says why the field is blank rather than leaving the reader to
 * read "Not confirmed" as an oversight.
 */
const DORMITORY_DEPOSIT_SOURCE: TaskSourceMetadata = {
  sourceUrl: '',
  sourceLabel: UNKNOWN_VALUE_LABEL,
  checkedAt: null,
  reviewAfter: null,
  finalAuthority: 'your dormitory office',
  conflictNote:
    'Deposit refunds are set by each dormitory’s own residence regulations, not by a national rule, so K-Journey does not state an amount, a deduction, or a date. Ask your dormitory office how and when yours is paid.',
  volatility: 'unknown',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

/**
 * G6. The Ministry of Education publishes the university transcript service
 * itself, which settles that the certificate exists and is issued by the
 * university. Everything the reader actually needs next — overseas dispatch,
 * whether a digital copy is accepted — is set by their own registrar.
 */
const TRANSCRIPT_SOURCE: TaskSourceMetadata = {
  sourceUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13404000008',
  sourceLabel: 'Government24 — university transcript service (교육부)',
  checkedAt: '2026-08-04',
  reviewAfter: null,
  finalAuthority: 'your university registrar',
  conflictNote:
    'The national listing covers the certificate. Overseas postage, digital issuance, and fees are set by each university.',
  volatility: 'medium',
  owner: UNKNOWN_VALUE_LABEL,
  conflictValues: [],
};

export const DEPARTURE_TASK_IDS = {
  nhisElectronicBill: 'departure-nhis-ebill',
  transitAutoCharge: 'departure-transit-autocharge',
  telecom: 'departure-telecom',
  utilities: 'departure-utilities',
  entryExitCertificate: 'departure-entry-exit-certificate',
  bankAccount: 'departure-bank-account',
  residenceCardReturn: 'departure-residence-card-return',
  dormitoryDeposit: 'departure-dormitory-deposit',
  transcript: 'departure-transcript',
} as const;

/**
 * The nine tasks, ordered the way the user meets them: everything that must be
 * finished before the flight, then the airport itself, then what is only
 * possible afterwards.
 *
 * Three prerequisites (G7 → G4, G2 → G4, G8 → G4) exist because each of those
 * leaves a recurring charge that would go unpaid once the account is closed.
 */
export const DEPARTURE_TASKS: readonly DepartureTaskSpec[] = [
  {
    taskId: DEPARTURE_TASK_IDS.nhisElectronicBill,
    sourceId: 'G5',
    title: 'Switch health-insurance billing to electronic',
    summary:
      'Paper bills are posted to your registered address, so the final one arrives after you have gone.',
    timing: 'before_departure',
    timingLabel: 'Before departure',
    dependsOn: [],
    source: NHIS_ELECTRONIC_BILL,
  },
  {
    taskId: DEPARTURE_TASK_IDS.transitAutoCharge,
    sourceId: 'G7',
    title: 'Stop transit-card auto-charge',
    summary:
      'Auto-charge debits your account about twice a month, so stop it before you close the account.',
    timing: 'before_departure',
    timingLabel: 'Before departure — ahead of closing your account',
    dependsOn: [],
    source: LEAVING_KOREA_HANDBOOK,
  },
  {
    taskId: DEPARTURE_TASK_IDS.telecom,
    sourceId: 'G2',
    title: 'Cancel your mobile contract',
    summary:
      'Cancel in person, by phone, by fax, or online. Overpaid charges and deposits are refunded separately.',
    timing: 'before_departure',
    timingLabel: 'Before departure — required',
    dependsOn: [],
    source: TELECOM_CANCELLATION,
  },
  {
    taskId: DEPARTURE_TASK_IDS.utilities,
    sourceId: 'G8',
    title: 'Cancel internet and utilities',
    summary: 'Contact each service provider directly to end the contract.',
    timing: 'before_departure',
    timingLabel: 'Before departure',
    dependsOn: [],
    source: LEAVING_KOREA_HANDBOOK,
  },
  {
    taskId: DEPARTURE_TASK_IDS.entryExitCertificate,
    sourceId: 'G9',
    title: 'Get an entry and exit record certificate',
    summary:
      'Issued at a community service centre or an immigration office. The fee reported by the handbook is 2,000 won.',
    timing: 'before_departure',
    timingLabel: 'Before departure',
    dependsOn: [],
    source: LEAVING_KOREA_HANDBOOK,
  },
  {
    taskId: DEPARTURE_TASK_IDS.bankAccount,
    sourceId: 'G4',
    title: 'Decide what to do with your bank account',
    summary:
      'Closing an account requires a branch visit and cannot be done once you have left Korea.',
    timing: 'before_departure',
    timingLabel: 'Before departure — the only window',
    dependsOn: [
      DEPARTURE_TASK_IDS.transitAutoCharge,
      DEPARTURE_TASK_IDS.telecom,
      DEPARTURE_TASK_IDS.utilities,
    ],
    source: BANK_ACCOUNT_CLOSURE,
  },
  {
    taskId: DEPARTURE_TASK_IDS.residenceCardReturn,
    sourceId: 'G1',
    title: 'Return your residence card',
    summary:
      'Hand the card to the immigration officer at departure control. Returning it declares that you are leaving for good.',
    timing: 'at_departure',
    timingLabel: 'At departure — at the airport',
    dependsOn: [],
    source: IMMIGRATION_ACT_37,
  },
  {
    taskId: DEPARTURE_TASK_IDS.dormitoryDeposit,
    sourceId: 'G3',
    title: 'Receive your dormitory deposit refund',
    summary:
      'Ask your dormitory office how and when the refund is paid. If it can arrive after you fly, it needs an account that is still open.',
    timing: 'after_departure',
    timingLabel: 'After departure',
    dependsOn: [],
    source: DORMITORY_DEPOSIT_SOURCE,
  },
  {
    taskId: DEPARTURE_TASK_IDS.transcript,
    sourceId: 'G6',
    title: 'Request your transcript',
    summary:
      'Your university issues it. Ask your registrar whether it can be sent abroad or issued digitally before you leave.',
    timing: 'after_departure',
    timingLabel: 'After departure',
    dependsOn: [],
    source: TRANSCRIPT_SOURCE,
  },
] as const;

/** REQ-SFR-002 AC1: every departure task carries the time it can be done. */
export const DEPARTURE_TASK_METADATA: readonly TaskMetadata[] = DEPARTURE_TASKS.map((task) => ({
  taskId: task.taskId,
  title: task.title,
  summary: task.summary,
  dependsOn: task.dependsOn.length > 0 ? task.dependsOn : undefined,
  source: task.source,
}));

export function departureTaskSpec(taskId: string): DepartureTaskSpec | undefined {
  return DEPARTURE_TASKS.find((task) => task.taskId === taskId);
}

/**
 * The three exceptions in Article 37(1). Kept as data so the task detail can
 * show them verbatim rather than paraphrasing a statute.
 */
export const RESIDENCE_CARD_RETURN_EXCEPTIONS: readonly string[] = [
  'You hold a re-entry permit and will return to Korea within its validity period.',
  'You hold a multiple-entry visa, or are a national of a country exempt from re-entry permits, and will return within your permitted stay.',
  'You hold a refugee travel document and will return within its validity period.',
];

export type ResidenceCardReturnStatus = 'return_required' | 'review_required';

export interface ResidenceCardReturnVerdict {
  status: ResidenceCardReturnStatus;
  reason: string;
  exceptions: readonly string[];
  finalAuthority: string;
  sourceUrl: string;
  checkedAt: string | null;
}

/**
 * REQ-SFR-002 AC2 · AC5 · TC-007 · TC-010.
 *
 * A temporary departure is never judged "return required" here. The statute
 * makes the exception depend on the permit the traveller holds, which the app
 * does not verify, so an unresolved case stays `review_required` with the
 * office that can answer it named.
 */
export function evaluateResidenceCardReturn(
  departureType: DepartureType,
  reentryException: ReentryException,
): ResidenceCardReturnVerdict {
  const base = {
    exceptions: RESIDENCE_CARD_RETURN_EXCEPTIONS,
    finalAuthority: IMMIGRATION_ACT_37.finalAuthority,
    sourceUrl: IMMIGRATION_ACT_37.sourceUrl,
    checkedAt: IMMIGRATION_ACT_37.checkedAt,
  };

  if (departureType === UNKNOWN) {
    return {
      ...base,
      status: 'review_required',
      reason: 'Tell us whether you are leaving Korea for good so this task can be assessed.',
    };
  }

  if (departureType === 'permanent') {
    return {
      ...base,
      status: 'return_required',
      reason:
        'Article 37(1) requires the card to be handed to the immigration officer when you leave for good.',
    };
  }

  if (reentryException === 'yes') {
    return {
      ...base,
      status: 'review_required',
      reason:
        'You reported a re-entry exception, so this is not judged a return. Confirm which exception applies before you travel.',
    };
  }

  if (reentryException === UNKNOWN) {
    return {
      ...base,
      status: 'review_required',
      reason:
        'A temporary departure only avoids return under one of three exceptions. Confirm which one applies to you.',
    };
  }

  return {
    ...base,
    status: 'return_required',
    reason:
      'You reported no re-entry exception, so Article 37(1) applies to this departure as well.',
  };
}

export interface TelecomOverseasGuidance {
  /** Never true: no source confirms cancelling from outside Korea. */
  overseasCancellationConfirmed: false;
  checkBeforeLeaving: readonly string[];
  finalAuthority: string;
}

/**
 * REQ-SFR-002 AC4 · TC-009: the app must not state that a mobile contract can
 * be cancelled from abroad. It lists what to confirm before leaving instead.
 */
export function telecomOverseasGuidance(): TelecomOverseasGuidance {
  return {
    overseasCancellationConfirmed: false,
    checkBeforeLeaving: [
      'Whether your carrier accepts a cancellation request from outside Korea.',
      'Whether a proxy in Korea can cancel on your behalf, and what they would need.',
      'How an overpayment or deposit refund would reach you once you have left.',
    ],
    finalAuthority: TELECOM_CANCELLATION.finalAuthority,
  };
}

export interface DepositAccountOutcome {
  choice: 'deposit-first' | 'account-first';
  title: string;
  outcome: string;
}

/**
 * REQ-SFR-002 AC3 · TC-008: both outcomes are stated. Original research found
 * neither option to be a rule violation, so no default is marked correct.
 */
export const DEPOSIT_ACCOUNT_OUTCOMES: readonly DepositAccountOutcome[] = [
  {
    choice: 'deposit-first',
    title: 'Keep the account open until the deposit arrives',
    outcome:
      'The refund has somewhere to land, but you keep an account you can no longer visit a branch to manage, and online banking needs a certificate renewed each year.',
  },
  {
    choice: 'account-first',
    title: 'Close the account before you leave',
    outcome:
      'Nothing is left running, but a deposit refunded after departure has no account to arrive in and you cannot reopen one from abroad.',
  },
];

export function departureTasksForTiming(
  timing: DepartureTiming,
): readonly DepartureTaskSpec[] {
  return DEPARTURE_TASKS.filter((task) => task.timing === timing);
}
