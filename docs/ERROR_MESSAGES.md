# Error messages

> Current local-first catalog. Superseded Auth, Firestore, cloud-upload,
> account-deletion, and emailed-export copy belongs only to historical ADRs.
> Runtime authority: `src/lib/errors/catalog.ts`.

## Routing

- T1: transient toast.
- T2: modal acknowledgement or retry.
- T3: permission explanation with an OS Settings action.
- T4: app-level incident banner.
- `inline`: rendered by the owning form.

Unknown operation failures use a T2 modal. `showOperationError(action, error)`
adds the concrete action to the fallback title and records configured native
diagnostics without making success depend on telemetry.

## Current catalog

| Code | Tier | Title | Body | Action / origin |
|---|---|---|---|---|
| `network-offline` | T1 | — | `No connection. Your work is saved on this device.` | Retry when a network-backed OS/external action reports offline |
| `network-timeout` | T2 | `Couldn't finish` | `The request took too long to respond.` | Try again / cancel |
| `validation-arrival-after-departure` | inline | — | `Arrival date must be before departure date.` | Profile date validation |
| `validation-departure-too-soon` | inline | — | `Pick a departure date at least 7 days after arrival.` | Profile date validation |
| `permission-photos-denied` | T3 | `Photos access needed` | `Allow photo-library access to save this image.` | Save byeongpung; Open Settings / Not now |
| `permission-notifications-denied` | T3 | `Notifications are off` | `Turn on notifications to get D-Day and panel-unlock reminders.` | Notification opt-in; Open Settings / Not now |
| `clock-jump` | T4 | `Clock changed` | `Your device clock changed unexpectedly. Phase progress uses Korea time.` | Wall time diverged from monotonic elapsed time by more than two days during a continuous foreground interval |
| `profile-updated` | T1 | — | `Profile updated.` | A verified Settings profile write completed |
| `dates-updated` | T1 | — | `Dates updated. Reminders rescheduled.` | Date write and all reminder operations completed |
| `dates-updated-notifications-off` | T1 | — | `Dates updated. Notifications are off.` | Date write completed and old reminders were cleared while OS permission is off |
| `dates-updated-reminder-warning` | T1 | — | `Dates updated. The reminder schedule could not be fully refreshed.` | Date write completed, but reminder cancel/schedule was partial |
| `notification-pref-updated-notifications-off` | T1 | — | `Notification preference saved. System notifications are off.` | Preference write completed but OS permission changed before refresh |
| `notification-pref-updated-reminder-warning` | T1 | — | `Notification preference saved. The reminder schedule could not be fully refreshed.` | Preference write completed, but reminder cancel/schedule was partial |
| `phase-changed` | T2 | `Phase changed` | `Your new dates moved you to a different phase. Existing missions stay completed.` | Date correction moved the user to an earlier phase; call site supplies phase number |
| `unknown` | T2 | `Couldn't complete that` | `Something went wrong. Try again.` | Unclassified operation failure |

## Voice and correctness rules

- State what happened; do not blame or patronize.
- Never report a mutation, reminder refresh, export, share, or save as complete
  unless the owning operation returned success.
- Use specific action labels; no generic `OK` when a clearer verb exists.
- Do not expose provider, stack, token, server, or database jargon.
- No emoji, alarmist urgency, or promises that local evidence cannot support.
- Dynamic values use `messageOverride`; the underlying static row remains testable.

## Tests

- `src/lib/__tests__/errorAlert.test.ts` covers one route per active tier and
  dynamic message substitution.
- `src/lib/__tests__/errorCodes.test.ts` enforces code↔documentation parity and
  validates every literal `surfaceError('code')` call.
- Feature tests must also prove the success/failure result that selects a status
  message; catalog routing alone cannot prove the message is truthful.
