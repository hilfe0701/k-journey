# 0005. Firebase Analytics as secondary

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `analytics`, `observability`

## Context and Problem Statement

With PostHog selected as primary product analytics (ADR-0004), Firebase Analytics was on the chopping block. We kept it as a **secondary sink** for two specific reasons:

1. **App Store / Play Store optimization.** Both stores have first-class integration with Firebase Analytics for *Acquisition* funnels (install → first_open → retained). PostHog can do this but the store consoles already accept Firebase data natively.
2. **Crashlytics correlation.** Firebase Crashlytics auto-tags crashes with the Analytics user session. Keeping Analytics keeps that correlation alive.

## Decision Drivers

* Free at any scale we will hit.
* Already required for Crashlytics correlation.
* Native to `@react-native-firebase/*` (ADR-0003) — already linked.

## Considered Options

1. **Keep Firebase Analytics + PostHog (current)**
2. **Drop Firebase Analytics; use PostHog only**
3. **Use Firebase Analytics only** (rejected — see ADR-0004)

## Decision Outcome

**Chosen:** Keep Firebase Analytics as secondary, fire essential events to both sinks.

### Positive Consequences
* App Store / Play Console "Acquisition" funnel reports work out of the box.
* Crashlytics crash reports include automatic Firebase session context.
* If PostHog is ever down or offline, we still have core retention data.

### Negative Consequences
* Two sinks → schema must be enforced in both. We dispatch through a single `track()` in `src/lib/posthog.ts` and let Firebase auto-collect `screen_view` and `first_open`.
* PII vigilance applies to both sinks — Crashlytics `setUserId(uid)` only (no email/displayName), Analytics events same `KJEvent` shape, no raw mission text or bucket-item bodies.

### Reversibility
Trivially reversible — remove the `@react-native-firebase/analytics` import and one initialise call.

## Pros and Cons of the Options

### Keep both
* **+** Store funnels + crash correlation + redundancy.
* **−** Two sinks to keep in sync.

### Drop Firebase Analytics
* **+** Single sink to reason about.
* **−** Lose App Store / Play Console integration.
* **−** Lose automatic Crashlytics session enrichment.

## Links

* **PRD:** §11.1, §11.10
* **Code:** `package.json` (`@react-native-firebase/analytics`), boot init in app/_layout
* **Related ADRs:** [ADR-0003](0003-firebase-rn-modular-sdk.md), [ADR-0004](0004-posthog-primary-analytics.md)
* **External:** [Firebase Analytics + Crashlytics](https://firebase.google.com/docs/crashlytics/customize-crash-reports)
