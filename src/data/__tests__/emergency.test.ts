import { EMERGENCY_ITEMS, EMERGENCY_SECTIONS } from '../emergency';
import {
  evidenceNeedsReview,
  evidenceReviewAfter,
  isEvidenceReviewDue,
  REVIEW_CADENCE_DAYS,
  type ContentEvidence,
} from '../../lib/contentEvidence';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function itemsById(sectionId: string) {
  const section = EMERGENCY_SECTIONS.find((candidate) => candidate.id === sectionId);
  if (!section) throw new Error(`No emergency section ${sectionId}`);
  return section.items;
}

describe('emergency content ledger', () => {
  it('keeps the five sections and twenty-five items the inventory counts', () => {
    expect(EMERGENCY_SECTIONS.map((section) => section.id)).toEqual([
      'phones',
      'medical',
      'lost',
      'phrases',
      'embassies',
    ]);
    expect(EMERGENCY_ITEMS).toHaveLength(25);
  });

  it('gives every item a source that can be opened and an authority to ask', () => {
    for (const item of EMERGENCY_ITEMS) {
      const { evidence } = item;
      expect(evidence.sourceUrl).toMatch(/^https:\/\//);
      expect(evidence.sourceTitle.trim()).not.toHaveLength(0);
      expect(evidence.publisher.trim()).not.toHaveLength(0);
      expect(evidence.finalAuthority.trim()).not.toHaveLength(0);
      expect(evidence.checkedAt).toMatch(ISO_DATE);
    }
  });

  it('never marks a claim verified without naming who published it', () => {
    const verified = EMERGENCY_ITEMS.filter((item) => item.evidence.verification === 'verified');
    // Every entry the reader is told is confirmed must trace to an institution,
    // not to K-Journey. A blank publisher here is the failure this test exists for.
    expect(verified.length).toBeGreaterThan(0);
    for (const item of verified) {
      expect(item.evidence.publisher).not.toMatch(/K-Journey/i);
    }
  });

  it('classes safety phone lines as A and phrase glosses as editorial C', () => {
    for (const item of itemsById('phones')) {
      expect(item.evidence.contentClass).toBe('A');
      expect(item.href).toMatch(/^tel:/);
    }
    for (const item of itemsById('phrases')) {
      expect(item.evidence.contentClass).toBe('C');
      expect(item.evidence.verification).toBe('editorial');
    }
  });
});

describe('emergency claims that were previously wrong', () => {
  it('states the 1345 hours instead of implying a night line', () => {
    const immigration = itemsById('phones').find((item) => item.label.includes('1345'));
    expect(immigration?.detail).toContain('09:00–22:00');
    expect(immigration?.detail).toContain('After 18:00');
  });

  it('separates the 24-hour 1330 languages from the ones that stop at 19:00', () => {
    const hotline = itemsById('phones').find((item) => item.label.includes('1330'));
    expect(hotline?.detail).toContain('24 hours');
    expect(hotline?.detail).toContain('08:00–19:00');
  });

  it('lists all four subway lost-and-found centres by line', () => {
    const subway = itemsById('lost').find((item) => item.label.includes('subway'));
    expect(subway?.detail).toContain('02-6110-1122');
    expect(subway?.detail).toContain('02-6110-3344');
    expect(subway?.detail).toContain('02-6311-6765');
    expect(subway?.detail).toContain('02-6311-6766');
    // The old copy claimed two offices covering Lines 1–4 and 5–8.
    expect(subway?.detail).not.toContain('Lines 1–4');
    expect(subway?.detail).not.toContain('Lines 5–8');
  });

  it('points at the pharmacy finder rather than naming one shop', () => {
    const pharmacy = itemsById('medical').find((item) => item.label.includes('Pharmacies'));
    expect(pharmacy?.href).toBe('https://www.pharm114.or.kr/');
    expect(pharmacy?.detail).not.toMatch(/Gangnam Station Exit/i);
  });

  it('leads the embassy section with the directory that covers every country', () => {
    const [first] = itemsById('embassies');
    expect(first.evidence.publisher).toContain('Ministry of Foreign Affairs');
    expect(first.href).toContain('mofa.go.kr');
  });

  it('does not publish an unreachable embassy number as confirmed', () => {
    const unconfirmed = itemsById('embassies').filter(
      (item) => item.evidence.verification === 'needs_review',
    );
    expect(unconfirmed.length).toBeGreaterThan(0);
    for (const item of unconfirmed) {
      expect(evidenceNeedsReview(item.evidence)).toBe(true);
    }
  });

  it('drops the US after-hours number that no source publishes', () => {
    const usa = itemsById('embassies').find((item) => item.label === 'United States');
    expect(usa?.detail).not.toContain('02-397-4000');
    expect(usa?.detail).toContain('02-397-4114');
  });
});

describe('review cadence', () => {
  const base: ContentEvidence = {
    sourceUrl: 'https://example.go.kr/',
    sourceTitle: 'Example',
    publisher: 'Example Agency',
    checkedAt: '2026-08-04',
    contentClass: 'A',
    verification: 'verified',
    finalAuthority: 'Example Agency',
  };

  it('derives the review date from the content class', () => {
    expect(REVIEW_CADENCE_DAYS).toEqual({ A: 30, B: 90, C: 180 });
    expect(evidenceReviewAfter(base)).toBe('2026-09-03');
    expect(evidenceReviewAfter({ ...base, contentClass: 'B' })).toBe('2026-11-02');
    expect(evidenceReviewAfter({ ...base, contentClass: 'C' })).toBe('2027-01-31');
  });

  it('comes due on the review date, not after it', () => {
    expect(isEvidenceReviewDue(base, new Date('2026-09-02T12:00:00+09:00'))).toBe(false);
    expect(isEvidenceReviewDue(base, new Date('2026-09-03T00:30:00+09:00'))).toBe(true);
  });

  it('treats stale verified content the same as unconfirmed content', () => {
    expect(evidenceNeedsReview(base, new Date('2026-08-05T12:00:00+09:00'))).toBe(false);
    expect(evidenceNeedsReview(base, new Date('2026-10-05T12:00:00+09:00'))).toBe(true);
  });
});
