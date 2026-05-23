# 0014. Anonymous auth removed

* **Status:** accepted (retroactive)
* **Date:** 2026-05-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `auth`, `product`, `users`

## Context and Problem Statement

Early drafts considered Firebase Anonymous Auth as a friction-reducing "try before you sign in" option. After product re-scoping, this was discarded. The byeongpung is positioned as **a 4-month artifact you take with you** — that promise is only credible if progress is account-bound and recoverable on a second device.

Allowing anonymous accounts would:
* Create an orphaned-data problem (UID rotates on app reinstall → progress lost → user thinks the app is buggy).
* Undermine the product promise that "your byeongpung is yours, even after departure".
* Add a code path for *anonymous → linked* migrations that we don't need at MVP scale.

## Decision Drivers

* Product promise integrity > onboarding friction reduction.
* Korean Apple ID adoption among target users is high — sign-in friction is real but not prohibitive.
* Eliminating an auth state simplifies Firestore Rules (ADR-0021): only signed-in users (Apple/Google) ever write.

## Considered Options

1. **No anonymous auth** (chosen)
2. **Anonymous auth with later upgrade flow**
3. **Anonymous read-only with sign-in for write**

## Decision Outcome

**Chosen:** Apple/Google only. Firestore Rules will explicitly reject anonymous tokens (ADR-0021).

### Positive Consequences
* Byeongpung promise holds.
* Single auth state to reason about (signed-out / signed-in).
* Firestore Rules can use `request.auth.token.firebase.sign_in_provider in ['apple.com','google.com']` as a hard gate.

### Negative Consequences
* Onboarding has a friction step (sign-in) that some users will bounce on. **Mitigation:** the value proposition (4-month artifact) is communicated on the splash + sign-in screen.
* Dev-mock pattern (ADR-0006) is the only anonymous-like path — but it's `__DEV__`-only and never reaches prod.

### Reversibility
Reversible: would require re-adding `signInAnonymously()` calls and relaxing Firestore Rules. Estimate: 1 PR.

## Pros and Cons of the Options

### No anonymous auth
* **+** Clean product promise.
* **+** Single auth path.
* **−** Adds friction at first launch.

### Anonymous + upgrade
* **+** Lower friction.
* **−** Upgrade flow is well-known to lose data on bad days; doesn't fit the artifact promise.

### Anonymous read-only
* **+** Lets users browse before commitment.
* **−** PRD MVP has nothing public to browse pre-onboarding except the splash.

## Links

* **PRD:** §4.1, §13.1 (auth row), §10 (post-departure artifact promise)
* **Project rules:** `CLAUDE.md` Open decisions §5 (locked, do not re-add)
* **Code:** `src/hooks/useAuth.ts` (no `signInAnonymously` import or call), `app/(onboarding)/sign-in.tsx`
* **Memory:** `project_open_decisions_2026_05_05.md`
* **Related ADRs:** [ADR-0013](0013-apple-primary-google-deferred.md), [ADR-0021](0021-firestore-rules-acl-model.md)
