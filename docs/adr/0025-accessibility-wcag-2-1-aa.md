# 0025. Accessibility WCAG 2.1 AA target

* **Status:** proposed
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `accessibility`, `a11y`, `design-system`

## Context and Problem Statement

A grep through `src/` finds exactly **one** `accessibilityLabel` reference. Buttons, cards, banners, animation overlays, and the byeongpung strip are all unlabelled. VoiceOver navigation is broken in practice — a user with low vision opens the app and the first interactive surface announces nothing useful.

K-Journey's target user (exchange students arriving in Korea) skews young and digitally able, but:
* App Store review increasingly cares about a11y. A blanket-no-a11y app risks rejection narratives.
* International students may use the app in fragile contexts (after long flights, in unfamiliar environments) where reduce-motion and dynamic-type matter.
* The design (large rounded cards, sentence-case copy, generous spacing) is *already* accessibility-leaning — we're not far from compliance.

## Decision Drivers

* WCAG 2.1 AA is a well-defined, testable bar.
* Native RN accessibility props (`accessibilityLabel`, `accessibilityRole`, `accessibilityState`) are zero-cost to add.
* iOS Dynamic Type and Android Font Scale should not break layout up to ±2 steps.
* `AccessibilityInfo.isReduceMotionEnabled()` is one API call away.

## Considered Options

1. **WCAG 2.1 AA target with phased rollout** (chosen)
2. **WCAG 2.1 A only** — minimum legal baseline
3. **No declared target** (status quo)

## Decision Outcome

**Chosen:** WCAG 2.1 **AA** as the public-facing commitment. Rollout in two waves:

| Wave | Scope | When |
|---|---|---|
| 1 | All interactive components labelled + role + state. DDayBanner, PhaseTabs, MissionCard, Bucket items, ByeongpungStrip, sign-in, share button. | Round 2 (Part G) |
| 2 | Reduce-motion alternate for MissionCompleteOverlay animation. Dynamic Type ±2 visual regression check. Colour-blind sanity for category/phase colour pairs. | Round 2 (Part G) |
| 3 (V1.1) | Auditing tool integration (`eslint-plugin-react-native-a11y`). VoiceOver scripted scenarios. | post-MVP |

### Positive Consequences
* Screen-reader users can navigate the app.
* App Store review confidence.
* Sets a culture early — adding a11y to new components becomes routine, not retrofit.

### Negative Consequences
* String-length growth: `accessibilityLabel` often duplicates visible text plus pronunciation cues — but Korean parenthetical (ADR-0018) helps screen readers.
* Reduce-motion alternative for the mission-complete animation needs design review (a 2.4s choreography → a cross-fade). It's a known UX downgrade for reduce-motion users — by design.

### Reversibility
Reversible per component but the *commitment* is one-way once stated publicly (e.g. in App Store metadata).

## Pros and Cons of the Options

### WCAG 2.1 AA
* **+** Strong bar, achievable.
* **+** Industry standard.
* **−** Some rework needed.

### WCAG 2.1 A only
* **+** Lower bar.
* **−** AA is the de-facto industry standard; falling short is noticed.

### No target
* **+** Zero rework.
* **−** Broken VoiceOver; review risk.

## Test plan

* `docs/ACCESSIBILITY.md` lists 5 VoiceOver manual scenarios.
* Visual regression with Dynamic Type +1 / +2.
* AccessibilityInfo `useReduceMotion()` hook drives motion variants.
* (V1.1) `eslint-plugin-react-native-a11y` enforces label presence on `Pressable`.

## Links

* **PRD:** §11.6 (new)
* **Docs:** `docs/ACCESSIBILITY.md`
* **Project rules (follow-up):** CLAUDE.md MUST #20 (planned): "All interactive UI elements MUST have a11y label/role."
* **Code (target):** `src/lib/a11y.ts` (new — `useReduceMotion`), component sweeps in Part G
* **External:** [WCAG 2.1 AA quick reference](https://www.w3.org/WAI/WCAG21/quickref/?levels=a%2Caa), [RN accessibility](https://reactnative.dev/docs/accessibility)
