# 0028. Error recovery & retry strategy — 4-tier decision tree

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `errors`, `ux`, `microcopy`, `recovery`

## Context and Problem Statement

[ADR-0012](0012-async-mutator-error-contract.md) standardized **how** async failures are recorded and surfaced — every mutator wraps in `try/catch` and calls `showOperationError(action, error)` (`src/lib/errorAlert.ts`). That helper currently issues a single `Alert.alert("Couldn't {action}", "Check your connection and try again.")`.

That contract has done its job for observability (Crashlytics) and silent-failure prevention. But it collapses **all** failure modes into one UI affordance — a blocking modal alert with a single "OK" button. This is wrong for K-Journey for three reasons:

1. **A blocking modal is the wrong surface for a transient network blip.** The user is in the middle of completing a mission; surfacing a full-screen interrupt for "no internet" trains them to dismiss every alert as noise.
2. **There is no retry path.** The user must re-perform the action manually after dismissing the alert. For sensitive multi-step actions (creating a bucket, uploading a photo), this means re-entering data.
3. **No distinction between user-recoverable and system errors.** A permission-denied error needs Settings deep-linking. A Firestore-rules failure needs a sign-in re-check. A clock-jump needs a clock-fix prompt. A quota-exceeded needs a sorry-try-again-later message. These are categorically different UX flows; collapsing them all to one modal is a design failure.

We need a decision tree that maps **error category → UI surface → retry affordance**, while keeping `showOperationError` as the single entry point so we don't fragment the contract.

## Decision Drivers

* The user's emotional state varies by error: a network blip is annoying, a data-loss risk is alarming, a permission denial is confusing. UX must match.
* Retry should be one tap, not "dismiss → re-tap the original button → cross fingers".
* The single-helper contract from ADR-0012 must survive — we are extending it, not replacing it.
* Crashlytics observability (ADR-0012) must continue for every category.
* WCAG 2.1 AA (ADR-0025) — alerts/toasts must announce; deep-links must be operable via VoiceOver.

## Considered Options

1. **4-tier decision tree** (chosen): toast+inline retry / modal+Try-again+Discard / Settings deep-link / app-level banner — based on error category.
2. **Always-toast strategy** — replace all alerts with toasts, with an inline "Retry" button.
3. **Always-modal strategy** — keep the status quo, just add a Retry button to every modal.
4. **Per-screen bespoke** — let each screen choose. (Status quo of "do whatever" — rejected.)

## Decision Outcome

**Chosen:** A 4-tier decision tree that `showOperationError` (and a future companion `showOperationErrorWithRetry`) routes into based on error category. Categories map to UI tiers as follows:

| Tier | Trigger category | UI surface | Retry affordance | Examples |
|---|---|---|---|---|
| **T1 — Toast** | Transient, idempotent, single-step | Bottom toast (4s, dismissable) with "Retry" inline button | One-tap retry of the same operation | `network` (offline), `firestore-quota-exceeded` (transient), `image-load-fail` |
| **T2 — Modal** | Data-loss risk, multi-step, or destructive | `Alert.alert()` with `Try again` (primary) + `Discard` (destructive) buttons | Retry preserves user input | Bucket create with photo upload, profile update with multiple fields, mission complete with photo |
| **T3 — Settings deep-link** | Permission/config required | `Alert.alert()` with `Open Settings` (primary) + `Not now` | User opens iOS/Android Settings; foreground-watcher (ADR-0015 Part E.7) auto-resumes | `permission-denied` (camera, photos, push), `notifications-disabled` |
| **T4 — App-level banner** | System-wide outage, auth expired, clock-jump | Sticky banner at top of root layout (`app/_layout.tsx`) with action button | Action depends on cause (sign-in, clock fix, wait-for-sync) | `auth-expired`, `firestore-rules-fail` (signed-out state), `clock-jump`, server-side incident broadcast |

**Routing**: each error code in `docs/ERROR_MESSAGES.md` declares its tier. `showOperationError(action, error)` reads the error's `code` field (or infers from `error.message` / Firestore error code) and routes to the matching surface. Default: T2 (modal) — same as ADR-0012's current behavior, ensuring backward-compatible call sites.

**Copy**: every error code has a fixed user-facing string in `docs/ERROR_MESSAGES.md`. The helper does not synthesize copy from `action` anymore — it looks up the code's copy.

### Positive Consequences
* Network blips no longer feel like crashes — toast + retry is one of the most-tested UX patterns in mobile.
* Permission denials become recoverable in 2 taps (alert → Settings → flip toggle → app foregrounds → notifications watcher reschedules).
* The user's mental model: "transient = brief notice, structural = block me until I act" — matches their actual stress level.
* Single source of truth for error copy (`docs/ERROR_MESSAGES.md`) — designers, PMs, and engineers all read the same file.

### Negative Consequences
* Implementing T1 (toast) requires picking a toast lib or building a primitive — there is none today. Default during MVP transition: keep T1 errors on `Alert.alert` until the toast primitive lands; downgrade is graceful.
* Implementing T4 (app-level banner) requires a new `<IncidentBanner />` mounted in `app/_layout.tsx` plus a state hook (`useIncident`). Scope creep risk — bound by ADR.
* Error code declarations in `docs/ERROR_MESSAGES.md` must be kept in sync with `src/lib/errorAlert.ts` routing — drift risk; mitigated by a Jest test (`__tests__/errorCodes.test.ts`) asserting every routed code is documented.

### Reversibility
Reversible per tier — each tier is an independent surface. Removing T1/T2/T3/T4 individually does not break the others. Falling back to ADR-0012's single-modal contract is a one-line revert in `showOperationError`.

## Pros and Cons of the Options

### 4-tier decision tree (chosen)
* **+** UX matches user stress level.
* **+** Retry is built into the contract.
* **+** Single source of error copy.
* **−** Larger surface to implement (T1 toast primitive, T4 banner primitive).

### Always-toast
* **+** One pattern.
* **+** Cheap.
* **−** Wrong for data-loss risk (toast disappears in 4s — user may not see it).
* **−** Wrong for permission denials (no Settings deep-link in a toast).

### Always-modal
* **+** Status quo, no new code.
* **−** Trains users to dismiss-without-reading; the noise/signal ratio collapses.

### Per-screen bespoke
* **+** Maximum flexibility.
* **−** Drift, inconsistency, missed Crashlytics. (Same reasoning as ADR-0012's rejection of this option.)

## Migration plan

This ADR is **forward-looking** — `src/lib/errorAlert.ts` (lines 12–23 as of 2026-05-14) still implements ADR-0012's single-modal contract: `Alert.alert("Couldn't ${action}", "Check your connection and try again.")`. Call sites (`app/mission/[id].tsx:85`, `app/bucket/[id].tsx:100,137,147,166`, `app/bucket/new.tsx:61`, `(onboarding)/sign-in.tsx`) all pass an `action` string.

### Drift to acknowledge

* **`action` parameter becomes vestigial.** Once the router reads copy from `docs/ERROR_MESSAGES.md` via `error.code`, the human-readable `action` is no longer used to compose the body. We keep the parameter (a) for backward source compatibility and (b) for Crashlytics breadcrumbs (the action description aids triage). It is not surfaced to the user.
* **Default tier is T2** (modal) so unrouted errors behave exactly as ADR-0012 — no regression for existing call sites.
* **T1 toast and T4 banner primitives do not exist yet.** Until they ship, T1-classified errors fall back to T2 modal automatically. T3 settings-deep-link uses native `Alert.alert` with a `Linking.openSettings()` button — no new primitive needed.

### Migration PRs (sequenced)

1. **PR-A — Catalog import:** introduce `src/lib/errorAlert/codes.ts` exporting the typed error code map mirrored from `docs/ERROR_MESSAGES.md`. Add `__tests__/errorCodes.test.ts` asserting docs ↔ code parity. No behavior change.
2. **PR-B — Router skeleton:** extend `showOperationError(action, error)` to read `error.code` (or infer from Firebase code) and select tier. Default tier T2 → existing behavior preserved. Add `__tests__/errorAlert.test.ts`.
3. **PR-C — Toast primitive (T1):** ship `src/components/ui/Toast.tsx` + `useToast` hook. Re-route documented T1 codes (network-offline, network-slow, image-load-fail, etc.) from T2 modal to T1 toast. Visual regression on toast.
4. **PR-D — Settings deep-link (T3):** wire T3 router to `Linking.openSettings()` with permission-watcher resume (ADR-0015 Part E.7).
5. **PR-E — App-level banner (T4):** ship `src/components/ui/IncidentBanner.tsx` + `src/state/useIncident.ts`, mounted in `app/_layout.tsx`. Wire `auth-expired`, `clock-jump`, `firestore-rules-fail` to T4.

### Risk

* If PRs A–E are partially shipped, error UX is **mixed-tier** (some T1, some T2). Acceptable as long as no error code is **un**routed (router default = T2).
* If `errorAlert.ts` API signature ever changes (drop `action`), every call site needs a sweep. Mitigation: keep `action` as the second argument (now optional), maintain backward compat indefinitely.

### Coordination — boot-path primitives in `app/_layout.tsx`

Wave 2 mounts **three** new primitives at the root layout (`app/_layout.tsx`) across separate ADRs. Coordinate the mount order in a **single PR** (or sequence them with explicit z-index):

| Layer (top → bottom in z) | Primitive | Source ADR | Mount notes |
|---|---|---|---|
| 1 (top, z=1003) | `<Toast />` host | ADR-0028 PR-C (this) | Stacks above banners; toasts always visible regardless of incident state. |
| 2 (z=1002) | `<IncidentBanner />` | ADR-0028 PR-E (this) | Sticky; only renders when `useIncident()` reports active. |
| 3 (z=1001) | `<EnvironmentBanner />` | ADR-0024 (boost) | dev/staging only — invisible in prod. Stacks below incident so a real incident is always more prominent than the env hint. |
| 4 (router root) | `<Stack />` | Expo Router | App content. |

`<NetworkIndicator />` (ADR-0031 dot, not the toast) mounts inside the home screen header (not the root layout) — separate concern. The toast it fires uses the global `<Toast />` host from layer 1.

Recommend: ship layer 1 (`<Toast />` host) first as PR-C; layers 2–3 land in subsequent PRs. Each PR adds one primitive to `app/_layout.tsx` with the documented z-index.

## Test plan

* Unit: `__tests__/errorAlert.test.ts` — every documented error code routes to its declared tier.
* Unit: `__tests__/errorCodes.test.ts` — every routed code in code is documented in `docs/ERROR_MESSAGES.md`, and vice versa.
* Manual QA scripts (`docs/TESTING.md`) — one scenario per tier:
  * T1: airplane mode → tap "Done" on mission → toast appears → re-enable network → tap Retry → mission completes.
  * T2: airplane mode → create bucket with 3 fields → tap Save → modal appears with Try again / Discard → tap Try again offline → still fails → tap Discard → fields preserved on the screen until manually cleared.
  * T3: deny push permission → trigger panel unlock → alert with Open Settings → flip toggle → return to app → notifications reschedule.
  * T4: sign out via dev menu → trigger any Firestore write → app-level banner appears with "Sign in again" CTA.
* a11y: `accessibilityLiveRegion="assertive"` for T1/T2 alert text; T3 alert speaks Settings instructions; T4 banner uses `accessibilityRole="alert"`.

## Links

* **PRD:** §11.4 (error handling — extended)
* **Docs:** `docs/ERROR_MESSAGES.md` (master copy table), `docs/MICROCOPY.md` (voice rules), `docs/EDGE_CASES.md` §1–§7 (per-feature failure rows)
* **Project rules:** CLAUDE.md MUST #17 (`showOperationError` wrap)
* **Related ADRs:** [ADR-0012](0012-async-mutator-error-contract.md) (extended by this), [ADR-0015](0015-behavior-triggered-push-only.md) (T3 routes to push permission), [ADR-0021](0021-firestore-rules-acl-model.md) (T4 routes to Firestore-rules failure), [ADR-0022](0022-kst-timezone-single-source.md) (T4 routes to clock-jump)
* **Code (target):** `src/lib/errorAlert.ts` (extended), `src/components/ui/Toast.tsx` (new), `src/components/ui/IncidentBanner.tsx` (new), `src/state/useIncident.ts` (new)

## Notes

T1's toast primitive is the largest single piece of work; it is acceptable for the MVP to ship with T1 errors temporarily routed to T2 (modal) until the toast primitive lands. The ADR is forward-looking; the routing contract is what's locked, not the implementation timeline.

T4's banner is reserved for **truly app-wide** problems. Per-screen issues (e.g. a single mission card failing to load) belong in T1/T2. We do not want banner fatigue.

If a future error category emerges that doesn't fit any tier (e.g. a long-running background sync failure), document it in `docs/ERROR_MESSAGES.md` first; if the routing genuinely needs a new tier, amend this ADR.
