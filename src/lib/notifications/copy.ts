/**
 * Push notification copy catalog. Single source of every push string K-Journey
 * ever sends. Authority: docs/PUSH_COPY.md + ADR-0029. Lock policy:
 * ADR-0015 (3 push types · 7 unique strings · max 14 fires per user lifecycle).
 *
 * Voice rules (apply to every entry):
 *   - English only (no Korean parenthetical — lock-screen real estate is small)
 *   - No emoji, no urgency-scare, no greetings ("Good morning" misfires across tz)
 *   - Title ≤ 30 chars, body ≤ 110 chars (iOS lock-screen truncation point)
 *   - Sentence case
 */

export interface PushString {
  readonly title: string;
  readonly body: string;
}

export type PushCategory = 'dDay30' | 'dDay14' | 'dDay7' | 'phase2Start' | 'phase3Start' | 'phase4Start' | 'panelUnlock';

const make = (title: string, body: string): PushString => ({ title, body });

export const PUSH_COPY = {
  // A. D-Day milestones — fire at KST 09:00 on the matching day.
  dDay30: make('30 days to your K-Journey', 'Phase 1 missions are ready. Open to begin.'),
  dDay14: make('Two weeks to departure', 'Time to wrap up Phase 3. Open the journey.'),
  dDay7: make('One week left', "Phase 4 awaits. Save what you don't want to forget."),

  // B. Phase boundary crossings — fire at KST 09:00 on the day of crossing.
  phase2Start: make("You've arrived", 'Phase 2 is unlocked. Your first week starts here.'),
  phase3Start: make('Settling in', 'Phase 3 missions are now in your home.'),
  phase4Start: make('Final stretch', 'Phase 4 — gather what you want to remember.'),

  // C. Panel unlock (templated × 8 panels).
  panelUnlock: (n: number): PushString =>
    make(`Panel ${n} of 8 unlocked`, 'Open the byeongpung to see your scroll grow.'),
};

/**
 * The 5 priming-card slots are enumerated for transparency. Matches the body
 * copy below — keep in sync if either side changes.
 */
export const PUSH_PRIMING = {
  title: 'Get reminders about milestones',
  body: "We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever.",
  primaryCta: 'Allow notifications',
  secondaryCta: 'Not now',
} as const;
