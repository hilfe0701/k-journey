# Edge Cases & Failure Modes

> ⛔ **(legacy — not injected into harness steps by default.)** the auth and remote-sync failure rows sit on `ADR-0006`/`0013`/`0014`/`0031`, all superseded. The rest of the feature × failure-mode matrix stands. Basis: `CLAUDE.md` Decision precedence · `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` (2026-07-27).

> Per-feature matrix of how K-Journey behaves under failure or unusual input. Mirrors PRD v1.1 §17 with code pointers and ADR back-references. If you're implementing a new feature, add a row.

## How to read this matrix

Each row is one **(feature × failure-mode)** pair. The cell answers: *what does the user see, what does the code do, where is the code?*

Cells reference:
* **ADR-NNNN** — design decision.
* **`file:line`** — implementation.
* **PRD §X.Y** — product spec.

## 1. Mission completion

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Network offline | MMKV optimistic + Firestore offline queue; UI shows "complete" immediately. | `firebase.ts:markMissionComplete`, RN-Firebase offline persistence default-on | ADR-0022 |
| Firestore quota exceeded | `set` throws; `showOperationError('save mission', e)` → Alert + Crashlytics; UI reverts. | `app/mission/[id].tsx:85` | ADR-0012 |
| Same mission already completed | `merge: true` idempotent; total stays correct. | `firebase.ts:markMissionComplete` | — |
| Mission marked complete then unmarked then re-marked | `claimPanelUnlock(n)` returns false on re-mark; no duplicate overlay/event/push. | `notifications.ts:claimPanelUnlock` | ADR-0009 |
| Clock manipulation | `serverTimestamp()` used for completion time → fake clock can't manipulate D-Day. | `firebase.ts:markMissionComplete` | ADR-0022 |
| MMKV `devMockMissions` corrupted (dev-mock) | `getJson` returns null → empty array fallback. Silent. | `storage.ts:getJson` | ADR-0023 |
| Two devices complete same mission simultaneously | Both call `set(..., merge:true)`; last write wins on `completedAtIso`. Counter stays at +1. | `firebase.ts` | PRD §11.2 |

## 2. D-Day calculation

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| `arrival` or `departure` missing | `usePhase` returns phase 1; DDayBanner shows "—". | `usePhase.ts` | — |
| `arrival > departure` (invalid input) | `validateDates` rejects at onboarding boundary; user cannot proceed. | `validation.ts:validateDates` | PRD §4.2.1 |
| Negative D-Day (post-departure) | DDayBanner shows "Departed N days ago"; gallery prompt eligible. | `DDayBanner.tsx`, `JourneyCompletePrompt.tsx` | PRD §10.2, NEVER #14 |
| Arrival == Departure | `validateDates` accepts; `calcPhase` → phase 2 (first-week window). | `usePhase.ts:calcPhase` | PRD §5.6 |
| Cross-timezone user (Sydney) | KST helpers ignore local time → phase boundary same as Seoul user. | `dates.ts:toKstStartOfDay` | ADR-0022 |
| System clock manipulated | `clockGuard` records to Crashlytics; UI not blocked. Server-timestamp protects writes. | `clockGuard.ts` | ADR-0022 |
| MMKV `phase:override` corrupted | `getNumber` returns undefined → falls through to date-based calc. | `usePhase.ts:calcPhase` | — |

## 3. Panel unlock

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Network offline at unlock moment | Overlay fires immediately (local); `panel_unlock` event queued in PostHog SDK; notification scheduled. | `notifications.ts:firePanelUnlock` | ADR-0009 |
| Notification permission denied | `firePanelUnlock` catches; no notification scheduled. Overlay still fires. | `notifications.ts:firePanelUnlock` | ADR-0015 |
| Mission unmarked then re-marked | `claimPanelUnlock` returns false; **no re-fire**. | `notifications.ts:claimPanelUnlock` | ADR-0009 |
| MMKV `firedPanelUnlocks` corrupted | Treated as empty array → unlock fires once more (acceptable). Migration runner backs up corruption. | `storage.ts:getJson` | ADR-0023 |
| Same panel unlocked across two devices | Each device fires once (per-device experience by design). | `notifications.ts:claimPanelUnlock` | ADR-0009 |
| 8 panels all unlocked already | `claimPanelUnlock(8)` returns false; total ≥ 48 doesn't fire anything. | `notifications.ts` | — |

## 4. Push notification scheduling

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Permission denied at scheduling time | `rescheduleAllNotifications` returns silently; no notification. | `notifications.ts` | ADR-0015 |
| Permission granted later (via Settings) | `usePushPermissionWatcher` (Part E.7) detects on foreground → calls reschedule. | `permissions.ts` (Part E.7) | ADR-0015 |
| User changes arrival/departure dates | `rescheduleAllNotifications` cancels existing and re-schedules. | `(onboarding)/dates.tsx:onSubmit` | — |
| Schedule date already in the past | `if (fireDate > today)` filter skips. | `notifications.ts:rescheduleAllNotifications` | — |
| OS notification limit hit (64 pending on iOS) | `scheduleNotificationAsync` may silently fail; Crashlytics records. | `notifications.ts` (Part E follow-up) | — |
| Cross-timezone user | Fires at KST 09:00 — translates to local time of user wherever they are. | `dates.ts:scheduleAtKstMidnight` | ADR-0022 |

## 5. Apple Sign-In

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| User cancels Apple sheet | `e.code === 'ERR_CANCELLED'` swallowed; no error UI. | `sign-in.tsx:18-34` | — |
| No `identityToken` returned | `showOperationError('sign in', new Error('No identity token'))`. | `sign-in.tsx` | ADR-0012 |
| Nonce mismatch | Firebase rejects credential; `showOperationError`. | `sign-in.tsx` | — |
| Apple ID locked / disabled | Apple SDK throws → `showOperationError`. Retry from same screen. | `sign-in.tsx` | — |
| Network offline | `signInWithCredential` throws → `showOperationError`. User retries. | `sign-in.tsx` | — |
| `ensureUserDocument` Firestore write fails | (Part E.4) try/catch wrap; Crashlytics records; user remains signed-in (UI can retry). | `useAuth.ts` (Part E.4) | ADR-0012 |
| (Future) Google sign-in cancelled | `SIGN_IN_CANCELLED` swallowed. | `sign-in.tsx` (Part H) | ADR-0013 |
| (Future) Play Services unavailable | Alert + Settings deep-link. | `sign-in.tsx` (Part H) | ADR-0013 |

## 6. Byeongpung share / save

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| `viewRef.current` is null at capture | `captureViewToFile` returns null → Alert "Could not capture image". | `share.ts:captureViewToFile` | — |
| `captureRef` throws | Same as above; Crashlytics records. | `share.ts` | — |
| `Sharing.isAvailableAsync` false | Alert "Sharing not available". | `share.ts:shareByeongpungImage` | — |
| `Sharing.shareAsync` throws | Returns false; (Part E follow-up) user-visible feedback. | `share.ts` | — |
| MediaLibrary permission denied | First attempt `saveToLibraryAsync` fails → second attempt `createAssetAsync` with explicit permission request → if both fail, Alert. | `share.ts:saveByeongpungImage` | — |
| PNG asset load fails | `<PanelImage>` `onError` → ink-color fallback rendered in capture. | `PanelImage.tsx` (Part E.6) | ADR-0008 |

## 7. Era switch

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Network offline | MMKV immediate; Firestore queue. UI shows new era. | `firebase.ts:updateUserProfile` | — |
| Firestore update fails (caught) | `showOperationError('switch era', e)`; UI reverts to previous era. | `app/(tabs)/more.tsx` (era switch logic) | ADR-0012 |
| PNG load fails after era swap | `<PanelImage>` `onError` → ink-color solid. | `PanelImage.tsx` (Part E.6) | ADR-0008 |
| Snapshot lag between Firestore and UI | UI may briefly show old era's panels until snapshot arrives. Acceptable. | `useProfile.ts` | — |
| Completed mission count preserved | `completedMissions` unaffected by era swap. | `useCompletedMissions.ts` | CLAUDE.md MUST #9 |

## 8. Onboarding

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| User force-quits mid-flow | Next launch resumes from where profile last persisted. | `useProfile.ts` snapshot + redirect logic in `app/_layout.tsx` | — |
| Firestore unavailable | MMKV cache holds last-known profile; user can still navigate; mutators queue. | `firebase.ts` offline | — |
| Invalid date input | `validateDates` rejects → Alert with specific error code. | `validation.ts` | PRD §4.2.1 |
| User skips Era picker | Phase 1 enters; first home screen prompts Era selection. | `app/(tabs)/index.tsx` (era check) | — |

## 9. Housing change mid-journey

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Mid-journey housing change (dorm → off-campus) | New mission list applied; already-completed dorm-specific missions remain counted in `total`. Denominator shifts. | `missions.ts:missionsForHousing` + `index.tsx` | ADR-0010, PRD §8.3 |
| Threshold for panel unlock unaffected | Always absolute (6, 12, 18...). Denominator change doesn't shift threshold. | `aggregateCompletions` | ADR-0011 |

## 10. Bucket items

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Add item offline | MMKV optimistic; Firestore queue. | `bucket/[id].tsx`, `firebase.ts:addBucketItem` | — |
| Toggle item to complete | `serverTimestamp()` for `completedAtIso`. Idempotent. | `firebase.ts:toggleBucketItem` | — |
| Delete bucket with items | Cascade delete (subcollection items). Rules permit (owner). | `firebase.ts:deleteBucket` + Rules | ADR-0021 |
| Item text contains PII | **Stays in Firestore (owner-readable). Never in PostHog event.** | `posthog.ts:KJEvent` payload restrictions | docs/SECURITY.md §3 |

## 11. Emergency guide

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Anonymous user (not signed in) opens emergency | Allowed by Firestore Rules (`emergency/{id}` is `allow read: if true`). | `firestore.rules:emergency` | ADR-0021 |
| Offline | Static `src/data/emergency.ts` data always available. | `emergency.tsx` | — |

## 12. Telemetry

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| PostHog SDK offline | Events queued in PostHog SDK; flush on reconnect. | `posthog.ts` | — |
| `track()` called with wrong event name | TypeScript catches at compile via `KJEvent` union. | `posthog.ts` | ADR-0004 |
| `trackOnce` called twice with same key | Second call no-op. | `telemetry/index.ts` (Part F) | — |
| Crashlytics offline | Errors queued by SDK; flush on reconnect. | `errorAlert.ts` | — |

## 13. Theme / fonts

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| Pretendard font asset missing | RN falls back to system font; layout may shift slightly. | `app/_layout.tsx:useFonts` | — |
| Noto Serif KR weight missing | Display headings fall back to system serif. | `app/_layout.tsx` | — |
| Era theme tokens read after era change | `ThemeProvider` re-renders downstream. | `theme/ThemeProvider.tsx` | — |

## 14. Reanimated worklets

| Failure mode | Behaviour | Code pointer | ADR |
|---|---|---|---|
| `useAnimatedStyle` callback wrapped in factory closure | **Worklet crash on UI thread.** Forbidden by ADR-0019. | n/a (rule, not code) | ADR-0019 |
| `useReduceMotion()` true | `MissionCompleteOverlay` cross-fade variant. | `a11y.ts:useReduceMotion` + overlay component | ADR-0025 |

## 15. Adding a new feature

When a new feature lands:

1. Add a section here covering its failure modes.
2. Add `accessibilityLabel` + `role` (ADR-0025).
3. Add `track()` event if user behaviour is interesting (PRD §16).
4. Add try/catch + `showOperationError` if it has an async mutator (ADR-0012).
5. Add migration if it introduces new MMKV keys (ADR-0023).
6. Add a row to `docs/architecture/MODULE_OWNERSHIP.md` if it introduces a new module.

## 16. Links

* PRD v1.1 §17
* `docs/architecture/ARCHITECTURE.md` §8 threat model
* `docs/SECURITY.md`
* `docs/ACCESSIBILITY.md`
* `docs/I18N_TIMEZONE.md`
