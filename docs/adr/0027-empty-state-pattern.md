# 0027. Empty state pattern — icon + factual message + optional CTA

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `ux`, `design-system`, `microcopy`, `empty-state`

## Context and Problem Statement

K-Journey screens have many "zero" states by design: a brand-new user has 0 missions completed, 0 bucket items, 0 photos in the gallery, 0% byeongpung revealed. These states are not exception cases — they are the **first impression** every user experiences before doing anything.

A grep across the codebase finds no shared empty-state component and no copy convention. The current behavior in those screens is inconsistent: home renders the mission list as-is (which means a long scroll of unticked items, no orientation), gallery renders nothing, bucket renders nothing. There is no spec for what should appear, what tone to use, or whether to nudge the user toward a first action.

Worse, when other lifestyle apps fill the gap, they reach for one of two anti-patterns:
* **Self-deprecating cute copy** ("Oops! Nothing here yet 😅") — clashes with K-Journey's `warm authority` brand voice (DESIGN.md §1).
* **Aggressive CTA stacks** ("Add your first item! Click here! Or here! Or here!") — turns a calm scroll-painting into a marketing landing page.

Without a single decision, every screen will drift toward one of those anti-patterns under engineering time pressure.

## Decision Drivers

* Empty states are the user's **first impression** of every section — they must reinforce, not erode, the brand voice (calm, deliberate, reverent).
* The user should always know **what this screen will become** once they engage — no mystery boxes.
* Engineering cost should be one shared component, not N bespoke screens.
* Copy should be falsifiable at review time (a designer or PM can say "this isn't on-spec") rather than a matter of taste.
* WCAG 2.1 AA (ADR-0025) — empty states must announce themselves to VoiceOver/TalkBack.

## Considered Options

1. **Icon + 1-line factual message + optional single CTA** (chosen)
2. **Icon + headline + body + multiple CTAs** — typical SaaS empty state
3. **Self-deprecating illustration + emoji + cute copy** — typical lifestyle app
4. **Render nothing** — status quo

## Decision Outcome

**Chosen:** Every empty state in K-Journey is composed of exactly three slots, in this fixed order:

1. **Icon (required)** — a single Lucide icon (1.5px stroke) tinted in the screen's owning category color, OR a single minhwa motif if it is the brand-defining moment (gallery, byeongpung). Size 48×48 pt centered. No illustration, no photograph, no emoji.
2. **Message (required)** — a single short factual sentence (≤ 9 words) describing the *current state of the world*, not the user's failure. English first per ADR-0018; Korean parenthetical only for proper nouns.
3. **CTA (optional)** — at most one button. Used only when there is one obvious next action the user can take *now* on this screen. Never two CTAs. If the next action requires leaving the screen, omit the CTA and let the user navigate naturally.

Implementation lives in `docs/EMPTY_STATES.md` (per-screen spec) and a future shared `<EmptyState />` primitive in `src/components/ui/`.

**Voice rules** (factual, never negative):
* ✅ "No missions completed yet" — describes the state.
* ❌ "Oops, you haven't done anything!" — blames the user.
* ✅ "Your gallery starts when you complete your first mission" — projects the future state.
* ❌ "Nothing to see here 😅" — self-deprecating, uses emoji.

### Positive Consequences
* Every empty state across the app feels like the same product.
* Designers and engineers have a shared decision tree (does this screen need a CTA? if yes, which one?) — eliminates bikeshed.
* Brand voice is preserved at the moments that matter most (first impressions).
* VoiceOver behavior is predictable: icon hidden as decorative, message read as the screen's accessible label.

### Negative Consequences
* Some screens (e.g. home with 0 missions) genuinely have multiple useful next actions — we are constraining them to one CTA on purpose, which may reduce engagement marginally.
* Engineers cannot ship a "creative" empty state without a design review.
* Copy reviews become slightly more expensive — every empty-state string goes through the voice rule check.

### Reversibility
Reversible per screen — each empty state lives in its own component file. The shared `<EmptyState />` primitive is the convergence point, but screens can opt out for a one-off if a future product moment requires it (would need an ADR amendment).

## Pros and Cons of the Options

### Icon + 1-line + optional CTA
* **+** Constrains brand drift.
* **+** One pattern to learn, ship, and review.
* **+** Cheap to implement (≤ 60 LOC primitive).
* **−** Limits expressive empty states (acceptable trade — see negatives above).

### Icon + headline + body + multiple CTAs
* **+** More room to explain.
* **−** Multiple CTAs invariably become "primary + ignored secondary" — analytics from prior projects show the secondary is < 5% click rate.
* **−** Larger surface, harder to keep on-brand (calm scroll-painting).

### Self-deprecating illustration + emoji
* **+** Industry-familiar.
* **−** Off-brand. Violates CLAUDE.md NEVER #3 (no emoji).
* **−** Erodes trust — the app is about Korea, not about being cute.

### Render nothing (status quo)
* **+** Zero code.
* **−** The user has no idea what the screen is supposed to be. Fails first-impression test.
* **−** No accessible label for the screen's purpose.

## Test plan

* `docs/EMPTY_STATES.md` enumerates every empty state (home, bucket list, bucket detail, gallery, byeongpung, search) with icon, message, and CTA decision.
* Visual regression on each screen at zero-state.
* VoiceOver: empty-state message must be the first announcement when the screen is focused.
* Copy lint: a future grep / lint check rejects strings matching `^Oops|^Sorry|😀|😅` in empty-state components.

## Links

* **PRD:** §4.5 (new — Empty State policy)
* **Docs:** `docs/EMPTY_STATES.md` (per-screen spec), `docs/MICROCOPY.md` (voice rules)
* **Project rules:** CLAUDE.md NEVER #3 (no emoji), MUST #4 (sentence case), ADR-0018 (English first)
* **Related ADRs:** [ADR-0017](0017-design-token-only-colors.md) (icon tinting via tokens), [ADR-0018](0018-english-first-korean-parenthetical.md), [ADR-0025](0025-accessibility-wcag-2-1-aa.md)
* **Code (target):** `src/components/ui/EmptyState.tsx` (new)

## Notes

The "optional CTA" rule is the most contested design decision here. The fallback is: if you cannot decide between two CTAs, omit both. The screen's empty state should never become a Choose Your Own Adventure page.

A future revision (V2) may permit a secondary "learn more" link below the CTA when onboarding flows mature, but the MVP commits to single-CTA-or-nothing.
