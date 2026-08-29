/**
 * Provenance for editorial content, as distinct from `TaskSourceMetadata`,
 * which covers the administrative task track.
 *
 * `docs/CONTENT_GOVERNANCE.md` defined the `ContentEvidence` shape and the
 * A/B/C review cadence but nothing implemented it, so the emergency guide and
 * the cultural catalogue carried no source at all. This module is that type
 * made real. It is deliberately separate from `TaskSourceMetadata`: a task
 * source answers "which office is right when we are wrong", while this answers
 * "where did this sentence come from and when did somebody last look".
 *
 * `reviewAfter` is derived rather than stored. A hand-written review date is
 * one more field that can silently disagree with the class it belongs to.
 */

import { kstDatePlusDays, kstDifferenceInDays, kstNow, toKstStartOfDay } from './dates';

/** `docs/CONTENT_GOVERNANCE.md` content classes. `U` is user-authored and never carries evidence. */
export type ContentClass = 'A' | 'B' | 'C';

/**
 * `verified` — a primary source was opened and states this.
 * `needs_review` — the claim is plausible and in use, but no primary source
 *   confirmed it on `checkedAt`. The UI must say so rather than imply it is
 *   confirmed (`CONTENT_GOVERNANCE.md` release gate step 5).
 * `editorial` — a Class C judgement that no source can settle, such as a
 *   translation gloss.
 * `unknown` — no suitable source was identified when the catalogue was
 *   checked. This is intentionally distinct from editorial guidance: the
 *   app must not imply that an unlocated source exists.
 */
export type EvidenceVerification = 'verified' | 'needs_review' | 'editorial' | 'unknown';

export interface ContentEvidence {
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
  /** `YYYY-MM-DD`, the day the source was actually opened. */
  checkedAt: string;
  contentClass: ContentClass;
  verification: EvidenceVerification;
  /** Who the reader asks when this app is wrong. Never empty. */
  finalAuthority: string;
  jurisdiction?: string;
}

/** `docs/CONTENT_GOVERNANCE.md`: A every 30 days, B every 90, C every 180. */
export const REVIEW_CADENCE_DAYS: Readonly<Record<ContentClass, number>> = {
  A: 30,
  B: 90,
  C: 180,
};

export function evidenceReviewAfter(evidence: ContentEvidence): string {
  return kstDatePlusDays(evidence.checkedAt, REVIEW_CADENCE_DAYS[evidence.contentClass]);
}

/** True once the review date has arrived in KST, matching `isSourceReviewDue`. */
export function isEvidenceReviewDue(evidence: ContentEvidence, now: Date = kstNow()): boolean {
  return (
    kstDifferenceInDays(toKstStartOfDay(now), toKstStartOfDay(evidenceReviewAfter(evidence))) >= 0
  );
}

/**
 * Whether the reader must be told this claim is not confirmed. Being past the
 * review date counts: content that nobody has re-opened in 30 days is not
 * distinguishable from content that was never confirmed.
 */
export function evidenceNeedsReview(evidence: ContentEvidence, now: Date = kstNow()): boolean {
  return (
    evidence.verification === 'needs_review' ||
    evidence.verification === 'unknown' ||
    isEvidenceReviewDue(evidence, now)
  );
}
