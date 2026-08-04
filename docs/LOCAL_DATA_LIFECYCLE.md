# Local data lifecycle and privacy boundary

> Current contract. This replaces account/Firestore lifecycle assumptions in older documents.

## Storage model

K-Journey has no user account and no per-user server database. Profile answers, dates, task state, cultural completions, bucket text, settings, and onboarding state are stored in MMKV inside the app sandbox on the current device.

MMKV is used for fast local persistence, not as a cryptographic vault. The app sandbox is the current boundary; no MMKV `encryptionKey` is configured. Therefore the product must not ask for passport numbers, ARC numbers, bank details, document photos, or other high-risk identifiers.

## Lifecycle

| Event | Expected result |
|---|---|
| App update | versioned migrations preserve supported local keys |
| Sign out | not applicable; there is no account |
| Clear/reset in Settings | local K-Journey keys are removed after confirmation |
| App uninstall | operating system removes local app data |
| New device / lost device | progress is not recoverable today |
| Text export | readable snapshot of profile conditions, administrative task state, completed cultural missions, and Want-to lists; not an importable backup |

Deletion is verified on web as well as native. It was not always: `Alert.alert`
is an empty function in React Native Web, so the confirmation never appeared
and the control could not be used at all in a browser. Confirmations now go
through `src/lib/alert.ts`; see `docs/ACCESSIBILITY.md`.

## Export truthfulness

The current export does **not** include byeongpung image state or every
notification preference, and there is no import flow. UI copy must not call it
a transfer, backup, or restore mechanism.

When the browser has no Web Share support the export reports "Not exported" and
renders the full text for manual copying, rather than reporting a delivery that
did not happen.

Before a future “backup” claim ships, one versioned portable schema must cover all user-owned data, include import validation, document conflict behavior, and pass round-trip tests.

## Analytics

- PostHog is inactive when no public project key is configured. The client is not constructed at all in that state, so the SDK makes no network request of any kind — `disabled: true` alone still fetched remote config on every page load.
- Allowed events use enumerated IDs and coarse states only.
- Names, emails, raw profile answers, raw bucket text, coordinates, document values, and free text are forbidden.
- Session replay remains disabled until there is explicit consent, input/image masking, a retention decision, and a web/native privacy review.
- Crash diagnostics may be collected by the native Crashlytics integration when configured; error messages must not include user-authored content.

## User-facing copy

Use: “Stored on this device.”

Do not use: “synced,” “saved to your account,” “available on another phone,” “restore,” or “securely encrypted” unless the underlying capability has been implemented and verified.

## Future cloud sync gate

Cloud sync requires a new product decision, privacy policy, threat model, deletion/export flow, account recovery design, data residency choice, and migration plan. Reintroducing old Firestore code is not sufficient authorization.
