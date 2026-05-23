# 0012. Async mutator error contract (`showOperationError`)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-05 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `errors`, `ux`, `observability`

## Context and Problem Statement

Async mutators (mission complete, bucket CRUD, profile update, sign-in) can fail for many reasons (network, Firestore quota, auth expiry, validation). Without a uniform pattern, the team would inevitably:

* Show silent failures (tap, nothing happens, no toast, no log).
* Use ad-hoc `Alert.alert()` calls with inconsistent copy.
* Forget to record errors in Crashlytics, losing prod observability.

## Decision Drivers

* Users must always know something failed — never tap a button that appears to do nothing.
* Crashlytics must record every unexpected failure (with PII filtered).
* Copy must be consistent — the user shouldn't read three different phrasings of "couldn't save".
* Wrapping should be one line of overhead, not a ceremony.

## Considered Options

1. **`showOperationError(action: string, error: unknown)` helper called from every catch** (chosen)
2. **Global error event bus** subscribers fire toasts and Crashlytics
3. **Per-screen `try/catch` with custom Alerts** (status quo, rejected)
4. **React Error Boundary for async** (not supported by React — would need react-error-boundary's `useErrorHandler`)

## Decision Outcome

**Chosen:** A single helper `showOperationError(action, error)` in `src/lib/errorAlert.ts`:
1. Coerces `error` to `Error`.
2. Calls `recordError(getCrashlytics(), err)` (with a defensive try/catch in case Crashlytics is unavailable).
3. Shows `Alert.alert("Couldn't {action}", "Check your connection and try again.")`.

CLAUDE.md MUST #17 mandates that *every* async mutator wraps in `try/catch` and calls this helper on failure.

### Positive Consequences
* Uniform copy → users build accurate mental model of failures.
* Crashlytics captures everything; PII filtering happens in one place.
* Adding a new async action is a 3-line ceremony: `try { … } catch (e) { showOperationError('do thing', e); }`.

### Negative Consequences
* English-only copy in the helper — once we localise, the helper needs a key-based message.
* The helper swallows the error after alerting → caller can't re-throw to a higher boundary. **Accepted** because async failures at this layer are user-recoverable (try again).
* Empty `catch {}` is now a code smell that must be justified in a comment (ADR-0012 forbids silent swallows except for documented edge cases like `SplashScreen.hideAsync` and Crashlytics absence).

### Reversibility
Trivially reversible at call sites; the helper itself is 12 lines.

## Pros and Cons of the Options

### `showOperationError` helper
* **+** One line per call site.
* **+** PII filter in one place.
* **−** Hardcoded English; localisation lift needed later.

### Global event bus
* **+** Decouples emitters from UI.
* **−** Heavier than needed at MVP scale; harder to test.

### Per-screen Alerts
* **+** Bespoke copy per action.
* **−** Drift, inconsistency, missed Crashlytics calls.

### Async Error Boundary
* **+** Centralised.
* **−** Not idiomatic React; requires `react-error-boundary`'s helper.

## Links

* **PRD:** §11.4 (error handling contract)
* **Project rules:** `CLAUDE.md` MUST #17
* **Code:** `src/lib/errorAlert.ts:12-23`, call sites: `app/mission/[id].tsx:85`, `app/bucket/[id].tsx:100,137,147,166`, `app/bucket/new.tsx:61`
* **Related ADRs:** [ADR-0021](0021-firestore-rules-acl-model.md) (PII filtering rationale)
