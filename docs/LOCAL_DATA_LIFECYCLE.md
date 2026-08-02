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
| Text export | readable snapshot of supported profile conditions and administrative task state; not an importable backup |

## Export truthfulness

The current export does **not** include cultural mission completion, buckets, byeongpung state, or every notification preference, and there is no import flow. UI copy must not call it a transfer, backup, or restore mechanism.

Before a future “backup” claim ships, one versioned portable schema must cover all user-owned data, include import validation, document conflict behavior, and pass round-trip tests.

## Analytics

- PostHog is inactive when no public project key is configured.
- Allowed events use enumerated IDs and coarse states only.
- Names, emails, raw profile answers, raw bucket text, coordinates, document values, and free text are forbidden.
- Session replay remains disabled until there is explicit consent, input/image masking, a retention decision, and a web/native privacy review.
- Crash diagnostics may be collected by the native Crashlytics integration when configured; error messages must not include user-authored content.

## User-facing copy

Use: “Stored on this device.”

Do not use: “synced,” “saved to your account,” “available on another phone,” “restore,” or “securely encrypted” unless the underlying capability has been implemented and verified.

## Future cloud sync gate

Cloud sync requires a new product decision, privacy policy, threat model, deletion/export flow, account recovery design, data residency choice, and migration plan. Reintroducing old Firestore code is not sufficient authorization.
