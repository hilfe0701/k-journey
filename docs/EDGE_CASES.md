# Edge cases and failure modes

> Current local-first behavior. Historical Auth, Firestore, account-sync, and
> remote-deletion designs live only in superseded ADRs.

## Profile, dates, and administrative guidance

| Failure mode | Current behavior | Code |
|---|---|---|
| Required condition is missing or `unknown` | Keep the task visible as blocked/review-required; never infer visa, housing, insurance, nationality, or jurisdiction facts. | `src/lib/conditionRules.ts`, `src/data/taskState.ts` |
| Invalid or conflicting dates | Reject with specific validation copy; do not partially save. | `src/lib/validation.ts` |
| Date change moves phase backward | Preserve completed work and explain the new phase. | `app/settings/index.tsx` |
| Reminder cancellation or scheduling fails after a date save | Keep the saved dates, record the native failure, and state that the reminder schedule was not fully refreshed. | `src/lib/notifications.ts`, `app/settings/index.tsx` |
| Holiday year is not loaded | Treat government offices as unknown/closed and require current-source review. | `src/lib/holidays.ts` |
| Official source link fails to open | Preserve local content and show a recoverable error; the app never claims the external page opened. | `src/lib/linking.ts`, route call sites |
| System clock changes during one continuous foreground interval | Sample wall and monotonic elapsed time once per minute; warn only when they diverge by more than two days. Discard the baseline on inactive/background so suspend or relaunch gaps do not trigger. | `src/lib/clockGuard.ts`, `app/_layout.tsx` |

## Local writes and reset

| Failure mode | Current behavior | Code |
|---|---|---|
| MMKV write/read-back fails | Throw from the mutator; caller shows failure and must not claim completion. | `src/lib/firebase.ts`, `src/lib/storage.ts` |
| Stored JSON is malformed | Defensive readers return the safe default; migrations preserve known backup material where defined. | `src/lib/storage.ts`, `src/lib/storageMigrations.ts` |
| Mission or Want-to item is toggled repeatedly | Completion aggregation remains idempotent; panel celebration is claimed once per threshold. | `src/lib/completion.ts`, `src/lib/notifications.ts` |
| User confirms delete-all | Delete only enumerated K-Journey keys, reset tour state, and return to onboarding. No account or server deletion is implied. | `src/lib/localDataLifecycle.ts`, Settings data routes |
| User requests export | Produce a readable local snapshot and open the OS share destination. It is not an importable backup. | `src/lib/portableExport.ts`, `app/settings/export.tsx` |

## Notifications

| Failure mode | Current behavior | Code |
|---|---|---|
| Permission denied | Do not schedule; keep the app usable and offer the Settings route when relevant. | `src/lib/notifications.ts`, `src/lib/permissions.ts` |
| Permission granted later | Recheck on foreground and attempt to rebuild the enabled schedule. | `src/lib/permissions.ts` |
| Trigger date is already past | Skip that notification. | `src/lib/notifications.ts` |
| Reminder preference changes | Persist the preference, then cancel and rebuild known-date D-Day/phase reminders; panel unlocks remain immediate-only. | Settings, `src/lib/notifications.ts` |
| Existing-schedule cancellation fails | Stop before adding new reminders so a partial refresh cannot create duplicates. | `src/lib/notifications.ts` |
| OS scheduling limit or native error | Record best-effort diagnostics and return a partial result; never report full success. | `src/lib/notifications.ts` |
| Panel-unlock notification fails | Preserve the completion and on-screen reward; notification delivery is optional. | `src/lib/notifications.ts` |

## Byeongpung save and share

| Failure mode | Current behavior | Code |
|---|---|---|
| Nothing is complete | Disable Save and Share. | `app/(tabs)/byeongpung.tsx` |
| Locked panel selected on iOS | Explain how many completions remain; do not capture it. Android lists only unlocked panels. | `app/(tabs)/byeongpung.tsx` |
| Capture ref is unavailable or capture fails | Return false and show the catalog error; no success event. | `src/lib/share.ts` |
| OS share is unavailable | Explain that sharing is unavailable; keep the local artwork intact. | `src/lib/share.ts` |
| Photo-library add permission is denied | Offer the platform Settings path; do not request unrelated read access. | `src/lib/share.ts` |
| Artwork asset fails | Render the era fallback instead of crashing the route. | `src/components/byeongpung/PanelImage.tsx` |

## Accessibility and web routing

| Failure mode | Current behavior | Evidence |
|---|---|---|
| Reduced Motion enabled | Remove/downgrade nonessential motion and haptics; destructive warning haptic remains a safety signal. | `src/lib/a11y.ts`, `src/lib/haptics.ts` |
| Inactive tab remains mounted | Hide it from assistive technology and prevent focus leaks. | `src/lib/inactiveScreen.ts` |
| Browser refreshes a direct route | Serve the static Expo Router route without forcing native splash navigation. | `app/_layout.tsx`, web E2E |
| Render error escapes a route | Record configured native diagnostics and show a retry boundary without exposing stack details in production. | `app/_layout.tsx` |

## Telemetry and external processors

| Failure mode | Current behavior | Code |
|---|---|---|
| No usable PostHog key | Construct no client and send no analytics request. | `src/lib/posthog.ts` |
| Analytics is offline | App behavior does not depend on delivery; events are optional. | `src/lib/posthog.ts` |
| User-authored/profile data could enter an event | Event names and coarse properties are allowlisted; raw profile answers, dates, names, email, coordinates, and Want-to text are forbidden. | `src/lib/posthog.ts`, `docs/SECURITY.md` |
| Crashlytics is unavailable | Diagnostic calls are swallowed after the user-facing/local correctness path is handled. | error and notification helpers |

## Release-only checks

Unit and web automation do not close real-device, signed-artifact, store-form,
screen-reader, notification-delivery, or native Save/Share crop gates. Those
items remain in `docs/RELEASE.md`, `docs/TESTING.md`,
`docs/PLAY_DATA_SAFETY.md`, and `docs/BYEONGPUNG_ART_DIRECTION.md` until a named
human records the actual evidence.
