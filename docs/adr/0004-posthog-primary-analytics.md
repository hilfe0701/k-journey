# 0004. PostHog as primary product analytics

* **Status:** accepted (retroactive)
* **Date:** 2026-05-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `analytics`, `observability`

## Context and Problem Statement

PRD v1.0 §11.1 listed Firebase Analytics as the only analytics surface. During implementation, the team wanted **richer product analytics** for the four MVP KPIs (D7/D30 retention, mission completion, app rating) — specifically:

* **Funnels** through onboarding (sign-in → dates → profile → era → home).
* **Cohort retention** by sign-up week.
* **Session replay** to debug confusing UX during friends-and-family beta.
* **Custom events** with property filters (e.g. `phase_transition` by era and university).

Firebase Analytics provides funnels and retention but session replay is absent and event explorer UX is heavy.

## Decision Drivers

* Need session replay for early QA — qualitative > quantitative at MVP scale.
* Funnel + cohort tools that update without 24h delay.
* Cost: < $100/mo at MVP scale (1,000 users × ~100 events/user/month).
* GDPR: not a hard requirement (user base is exchange students in Korea), but US region is fine.

## Considered Options

1. **PostHog Cloud (US region)**
2. **Firebase Analytics only**
3. **Amplitude**
4. **Mixpanel**
5. **Self-hosted PostHog**

## Decision Outcome

**Chosen:** PostHog Cloud (US region). Firebase Analytics stays as secondary (ADR-0005) for App Store optimisation funnels and as a fallback if PostHog is offline.

### Positive Consequences
* Session replay enabled for prod (with PII filtering — see ADR-0005 and `docs/SECURITY.md`).
* Funnel builder is interactive; A/B testing roadmap available post-MVP.
* The team can ship a feature and check its first 100 sessions visually within 1 hour.
* `KJEvent` union (`src/lib/posthog.ts`) provides typed event names — typos caught at compile time.

### Negative Consequences
* Two analytics sinks → 2x outgoing events on every `track()` call. Mitigated by single dispatch wrapper.
* Session replay sends DOM/layout fingerprints — must guarantee no PII leaks (ADR follow-up: PII filtering rules in `docs/SECURITY.md`).
* Vendor: $100–500/mo at scale post-MVP.

### Reversibility
Reversible. PostHog's data export is well-documented; we could swap to Mixpanel or back to Firebase-only with ~1 week of work.

## Pros and Cons of the Options

### PostHog Cloud (US)
* **+** Session replay + funnels + cohorts in one tool.
* **+** Open-source ethos, generous free tier (1M events/month).
* **−** Self-hosted is heavy; cloud has vendor lock-in.

### Firebase Analytics only
* **+** Zero extra cost; native to our stack.
* **−** No session replay; slow event explorer; mediocre cohort UX.

### Amplitude
* **+** Strong funnel/cohort tools.
* **−** Pricier; no session replay (separate Heap-style integration needed).

### Mixpanel
* **+** Funnel UX is industry standard.
* **−** No session replay; pricing aggressive at >100k events.

### Self-hosted PostHog
* **+** No vendor lock-in.
* **−** Infra burden during MVP — not worth at this scale.

## Links

* **PRD:** §11.1, §11.10 (monitoring), §16 (canonical event schema)
* **Code:** `src/lib/posthog.ts` (KJEvent union, `track`/`identify`/`reset`)
* **Project rules:** `CLAUDE.md` MUST #7
* **Related ADRs:** [ADR-0005](0005-firebase-analytics-secondary.md), [ADR-0021](0021-firestore-rules-acl-model.md) (PII boundary)
* **Memory:** `project_open_decisions_2026_05_05.md` — PostHog US region confirmed
