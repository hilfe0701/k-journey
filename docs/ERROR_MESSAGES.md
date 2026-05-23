# Error Messages — User Copy Catalog

> Master copy table for every user-facing error in K-Journey. The single source of truth that `showOperationError(action, error)` (`src/lib/errorAlert.ts`) routes through. Authority: [ADR-0012](adr/0012-async-mutator-error-contract.md), [ADR-0028](adr/0028-error-recovery-retry-strategy.md). Voice: `MICROCOPY.md`. Edge-case rows: `EDGE_CASES.md`.

## How this file is read by code

Every error code in this catalog has:

* **`code`** — string key, kebab-case. The internal identifier.
* **`tier`** — `T1` toast | `T2` modal | `T3` settings deep-link | `T4` app-level banner. Maps to ADR-0028 routing.
* **`title`** — surface-appropriate (≤ 5 words for modal/banner, omit for toast).
* **`body`** — the user-facing copy. Matches MICROCOPY.md voice rules.
* **`primaryCta`** — the recommended action label.
* **`secondaryCta`** — optional fallback action label.
* **`origin`** — what triggers it (Firebase code, RN error, validation, etc.).

`src/lib/errorAlert.ts` reads the `code` from the caught error (preferring an explicit `error.code`, then inferring from `error.message`), looks up the row, and routes per `tier`. If no code matches, the default is **T2 with a generic copy** (the legacy ADR-0012 behavior).

## Voice rules (apply to every row)

* Factual, never blaming. ✅ "Couldn't reach the network." ❌ "Your connection failed."
* Action-oriented. ✅ "Try again" ❌ "Sorry, please retry"
* No tech jargon. ❌ "Firestore" / "JWT" / "WebSocket"
* No emoji. No urgency-scare. No emotional escalation. (See `MICROCOPY.md` §2.)
* English first. (Push payloads + alert text are English-only — proper-noun parenthetical does not apply.)

## Catalog

### A. Network & connectivity

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `network-offline` | T1 | (toast — no title) | `No connection. Your work is saved on this device.` | `Retry` | (auto-dismiss 6 s) | `NetInfo.isConnected === false`, or RN-Firebase offline queue active |
| `network-slow` | T1 | (toast — no title) | `Network is slow. Hang on.` | (none) | (auto-dismiss 4 s) | Operation > 5 s without success |
| `network-timeout` | T2 | `Couldn't save` | `The network took too long to respond.` | `Try again` | `Discard` | Operation > 30 s |

### B. Authentication

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `auth-cancelled` | (silent) | — | — | — | — | User dismissed Apple/Google sign-in sheet — no surface needed. |
| `auth-failed` | T2 | `Sign-in didn't work` | `Something blocked the sign-in. Try once more.` | `Try again` | `Cancel` | Apple/Google native auth error |
| `auth-expired` | T4 | `Signed out` | `Your sign-in session ended. Sign in to continue.` | `Sign in` | (none — banner sticks) | Firebase Auth token expired and refresh failed |
| `auth-no-account` | T2 | `No account found` | `We couldn't find a K-Journey account for this Apple ID.` | `Try a different sign-in` | `Cancel` | Firebase user record missing for credential |

### C. Firestore — saves

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `save-failed` | T2 | `Couldn't save` | `Something went wrong saving your change.` | `Try again` | `Discard` | Generic Firestore write failure (default for ADR-0012 fallback) |
| `quota-exceeded` | T1 | (toast) | `Server is busy. Trying again in a moment.` | `Retry now` | (auto-dismiss 6 s) | Firestore `resource-exhausted` |
| `firestore-rules-fail` | T4 | `Sign-in needed` | `Sign in to keep saving your journey.` | `Sign in` | (none) | Firestore `permission-denied` while signed-out path expected (ADR-0021) |
| `firestore-rules-fail-owner` | T2 | `Couldn't save` | `This data isn't yours to change.` | `OK` | (none) | Firestore `permission-denied` for non-owner write — should not happen in normal flow; surfaced only as a defensive net |
| `firestore-not-found` | T1 | (toast) | `That item is no longer there.` | (none) | (auto-dismiss 4 s) | Firestore `not-found` on a doc the client expected |

### D. Firestore — reads

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `read-failed` | T1 | (toast) | `Couldn't refresh. Showing what we have.` | `Retry` | (auto-dismiss 6 s) | Firestore read failure with stale MMKV cache available |
| `read-failed-empty` | T2 | `Couldn't load your data` | `We couldn't reach the server. Try again in a moment.` | `Try again` | `Sign out` | First-time read failure with no MMKV fallback (e.g. fresh install + offline) |

### E. Validation (onboarding & forms)

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `validation-arrival-after-departure` | (inline) | — | `Arrival date must be before departure date.` | (none) | (none) | `validation.ts:validateDates` |
| `validation-departure-too-soon` | (inline) | — | `Pick a departure date at least 7 days after arrival.` | (none) | (none) | `validation.ts:validateDates` (4-month curation needs minimum span) |
| `validation-name-empty` | (inline) | — | `Add a name so we can greet you.` | (none) | (none) | profile setup |
| `validation-photo-too-large` | T1 | (toast) | `Photo is too large. Try a smaller one.` | (none) | (auto-dismiss 4 s) | image upload > size limit |

### F. Permissions

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `permission-photos-denied` | T3 | `Photos access needed` | `Allow photos access to attach a photo to this mission.` | `Open Settings` | `Not now` | `MediaLibrary.requestPermissionsAsync` returned `denied` |
| `permission-camera-denied` | T3 | `Camera access needed` | `Allow camera access to take a photo here.` | `Open Settings` | `Not now` | `Camera.requestPermissionsAsync` returned `denied` |
| `permission-notifications-denied` | T3 | `Notifications are off` | `Turn on notifications to get D-Day and panel-unlock pings.` | `Open Settings` | `Not now` | `Notifications.requestPermissionsAsync` returned `denied`, surfaced when user attempts to re-enable |
| `permission-notifications-undetermined` | (priming UI) | `Get reminders about milestones` | `We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever.` | `Allow notifications` | `Not now` | First-time prompt, see ADR-0029 |

### G. Time & clock

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `clock-jump` | T4 | `Clock changed` | `Your device clock changed by more than a day. Phase progress uses Korea time.` | `Got it` | (none) | `clockGuard.ts` detected jump > 24 h (ADR-0022) |
| `clock-future` | T4 | `Date looks wrong` | `Your device clock is set in the future. Phase progress is paused until it's fixed.` | `Got it` | (none) | Local time > 1 month past expected (defensive) |

### H. Media & assets

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `image-load-fail` | (inline) | — | (fallback color block — no copy unless tapped) | (none) | (none) | PNG load failed; render `palette.cloud` swatch with `accessibilityLabel` "Image unavailable" |
| `image-upload-fail` | T2 | `Couldn't upload photo` | `The upload didn't finish. Try again or skip the photo.` | `Try again` | `Skip photo` | Storage upload failure |
| `byeongpung-asset-missing` | (inline) | — | (era-default fallback color, no banner) | (none) | (none) | PNG missing for current era — graceful degrade per `motifs.tsx` policy |

### I. App-level / system

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `app-update-required` | T4 | `Update needed` | `This version is no longer supported. Update to keep your journey going.` | `Open App Store` | (none) | Remote-config kill-switch |
| `system-incident` | T4 | `Service is having a moment` | `We're working on it. Your saved progress is safe.` | `Got it` | (none) | Server-side broadcast (future) |
| `unknown` | T2 | `Couldn't complete that` | `Something went wrong. Try again.` | `Try again` | `Cancel` | Default fallback when no code matches |

### J. Confirmations & status

> Not errors — success/status messages routed through the same T1/T2 surface bus (`<ToastHost>`). Listed here so the catalog ↔ code drift test (`errorCodes.test.ts`) and the MICROCOPY.md voice review cover them too. Rows with a dynamic value accept a `messageOverride` from the call site.

| Code | Tier | Title | Body | Primary CTA | Secondary CTA | Origin |
|---|---|---|---|---|---|---|
| `profile-updated` | T1 | (toast) | `Profile updated.` | (none) | (auto-dismiss 4 s) | Settings → Profile name/university/housing saved (PRD §4.7) |
| `dates-updated` | T1 | (toast) | `Dates updated. Reminders rescheduled.` | (none) | (auto-dismiss 4 s) | Settings → Profile arrival/departure saved (PRD §4.7) |
| `onboarding-resumed` | T1 | (toast) | `Picking up where you left off.` | (none) | (auto-dismiss 4 s) | Dates screen re-entered mid-onboarding with a restored snapshot (PRD §4.6) |
| `phase-changed` | T2 | `Phase changed` | `Your new dates moved you to a different phase. Existing missions stay completed.` | `Got it` | (none) | Date edit moved the user to a lower phase; `messageOverride` injects the phase number (PRD §4.7) |
| `network-offline-recovered` | T1 | (toast) | `Synced.` | (none) | (auto-dismiss 3 s) | Reconnect after offline with pending writes (ADR-0031) |
| `bucket-conflict` | T1 | (toast) | `Updated from another device.` | (none) | (auto-dismiss 4 s) | Bucket item count dropped between snapshots (ADR-0031) |
| `account-deletion-scheduled` | T1 | (toast) | `Account scheduled for deletion. Check your email.` | (none) | (auto-dismiss 6 s) | Delete-account second confirm committed (ADR-0033 §A) |
| `account-restored` | T1 | (toast) | `Account restored.` | (none) | (auto-dismiss 4 s) | Recovery flow — user cancelled a pending deletion (ADR-0033 §C) |
| `export-queued` | T1 | (toast) | `Export queued. Check your email shortly.` | (none) | (auto-dismiss 6 s) | Data export requested (ADR-0033 §B) |
| `export-already-queued` | T2 | `Export already queued` | `Check your email — your last export is on its way.` | `OK` | (none) | Re-tap within the 24 h throttle window (ADR-0033 §B); `messageOverride` may inject the last-export time |

## Mapping notes

* **`code` resolution order in `errorAlert.ts`**:
  1. If `error.code` is a string and matches a row → use it.
  2. Else if Firebase error code (`firestore/permission-denied`, etc.) → map per the F-prefix table below.
  3. Else if `error.message` contains a known marker (e.g. `"Network request failed"`) → map.
  4. Else → `unknown`.
* **Firebase code → catalog code map**:
  * `firestore/permission-denied` (signed in) → `firestore-rules-fail-owner`
  * `firestore/permission-denied` (signed out) → `firestore-rules-fail`
  * `firestore/not-found` → `firestore-not-found`
  * `firestore/resource-exhausted` → `quota-exceeded`
  * `firestore/unavailable` (transient) → `network-offline`
  * `auth/network-request-failed` → `network-offline`
  * `auth/user-not-found` → `auth-no-account`
  * `auth/id-token-expired` → `auth-expired`
  * `storage/canceled` → silent
  * `storage/unknown` → `image-upload-fail`

## Test plan

* Unit: `__tests__/errorAlert.test.ts` — every `code` in this catalog routes to its declared `tier` and produces the declared title + body.
* Unit: `__tests__/errorCodes.test.ts` — every code referenced in `src/` exists in this catalog (string-search assertion); every code in this catalog is referenced from at least one path or marked `(reserved)`.
* Manual QA — one scenario per tier, mirroring ADR-0028 §Test plan.
* Voice review — every body string passes the MICROCOPY.md §8 checklist.

## Adding a new error code

1. Add a row to the appropriate section in this file.
2. If the row needs a new tier mapping, update `src/lib/errorAlert.ts`'s router.
3. Add a Jest assertion: code triggered → expected `tier`, title, body.
4. Cross-link from `EDGE_CASES.md` if it's a new failure mode.
5. Sentence-case voice review (MICROCOPY.md §8).

## Links

* **Authority ADRs:** [ADR-0012](adr/0012-async-mutator-error-contract.md), [ADR-0028](adr/0028-error-recovery-retry-strategy.md)
* **Voice rules:** `MICROCOPY.md`
* **Per-feature failure rows:** `EDGE_CASES.md` §1–§7
* **Project rules:** `CLAUDE.md` MUST #17, NEVER #22
* **Code:** `src/lib/errorAlert.ts`, `src/lib/clockGuard.ts`, `src/lib/notifications.ts`
