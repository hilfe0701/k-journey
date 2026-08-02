# Play Console data-safety working sheet

> Verify against the exact signed Android artifact. This sheet reflects the 2026-08-02 local-first code, not the superseded account/Firestore design.

## Baseline facts

- No sign-in, email, name, Firebase UID, per-user Firestore, or cloud backup.
- Profile conditions, task state, missions, and Want-to text remain on device.
- No advertising SDK, Advertising ID use, location permission, contacts, health, financial data, or server photo upload.
- Byeongpung images are created locally and sent only to the OS photo/share flow at the user’s request.
- PostHog is disabled without a configured public key; session replay is disabled.
- Native Crashlytics dependency exists and may collect crash diagnostics when configured in the production artifact.

## Answers that depend on production configuration

The top-level “collects data” answer is **not safe to finalize from source alone**. Inspect the signed artifact and production environment:

### If PostHog and/or Crashlytics is enabled

- App interactions: collected for analytics, not linked to an account, required only if collection cannot be disabled by the user.
- Crash logs and diagnostics: collected for app functionality/analytics, not linked to an account.
- Declare processors as collection by service providers according to current Play definitions; do not claim that no third party receives data.
- Data encrypted in transit: yes for SDK transmissions over TLS.

### If both are disabled in the store build

Core journey data is device-only. Re-evaluate whether any listed Play user-data type is transmitted off device by the OS sharing, notification, or store platform behavior before answering “No data collected.”

## Do not declare from the current app model

- Email address or name
- Account/user IDs from authentication
- Raw visa, housing, insurance, nationality, or date answers
- Raw Want-to text
- Photos uploaded to K-Journey
- Precise or approximate location
- Contacts, calendar, SMS/call logs, health, payment data, browsing history, installed apps
- Session replay

## Deletion answer

There is no server account. Users can reset local app data or uninstall the app. Whether this satisfies a Play deletion question depends on which transmitted analytics/diagnostic types are enabled and the processor deletion process. Do not point reviewers to a nonexistent “Delete account” flow.

## Artifact verification checklist

- [ ] Inspect merged Android manifest for `AD_ID`, location, contacts, storage, and notification permissions.
- [ ] Inspect production environment for PostHog key and host.
- [ ] Verify session replay remains disabled in the shipped JS bundle.
- [ ] Confirm Crashlytics collection setting and processor retention.
- [ ] Exercise Save/Share and confirm no K-Journey server request.
- [ ] Make `docs/PRIVACY_POLICY.md`, Play answers, and App Store labels identical in substance.
