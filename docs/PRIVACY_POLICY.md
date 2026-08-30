# K-Journey privacy notice (publication draft)

- Product data model checked: 2026-08-02
- Effective date: fill when published
- Operator and contact: **must be filled before publication**
- This draft requires operator/legal review before store submission.

K-Journey helps exchange students prepare for life in Korea and record cultural experiences. The app is designed to work without an account.

## Data kept on your device

The following information is stored locally in the K-Journey app on the device you are using:

- arrival and departure dates;
- answers about university, housing, visa, insurance, nationality category, and other checklist conditions;
- administrative task status;
- cultural mission completion;
- Want-to list names, items, and completion;
- selected art era, notification preferences, and onboarding state.

This information is used to calculate which tasks apply, show journey phases, and render your byeongpung. It is not uploaded to a K-Journey account or per-user database. The app does not currently provide cross-device sync or cloud restore. Removing the app or losing the device may remove this data permanently.

K-Journey does not ask for passport numbers, residence-card numbers, bank details, contacts, or precise location.

## Analytics and diagnostics

When an operator configures a PostHog project key, K-Journey may send coarse interaction events such as a screen being opened, a task or mission ID being completed, or an art panel being unlocked. Event properties must not include names, emails, raw condition answers, Want-to text, coordinates, or document values. Session replay is disabled.

Native builds may use Firebase Crashlytics to receive crash diagnostics such as stack traces, app version, device model, and operating-system version. Error messages are designed not to contain user-authored text.

If these services are enabled, their network traffic is protected in transit by TLS. PostHog hosting region and diagnostic retention must be confirmed and disclosed for the actual production configuration before publication.

## Images, sharing, and permissions

When you choose Save or Share, the app creates a byeongpung image on your device and asks the operating system to save it to Photos or open the share sheet. K-Journey does not upload that image to its own server. The destination app you choose has its own privacy policy.

Notifications are local journey reminders when enabled. They are not marketing messages.

## Your choices

- You may edit local profile and journey settings in the app.
- You may reset K-Journey’s local data from Settings after confirmation, or uninstall the app.
- The current text export is a readable copy of profile conditions, administrative task state, cultural mission completions, Want-to lists and items, and the selected era. It is not an importable backup.
- You may deny notifications or photo-library access; the related optional feature will not work.

There is no account to delete. For questions about an analytics or diagnostic record, contact **[support email]** after the operator details are published.

## Children

K-Journey is intended for university-age exchange students and is not directed to children under 14.

## Changes and contact

Material changes to collection, cloud sync, account support, or processors require an updated notice before release.

Operator: **[legal entity or individual]**
Address: **[address]**
Contact: **[support email]**

## Pre-publication gate

- [ ] Fill operator, address, support email, effective date, and governing jurisdiction.
- [ ] Confirm whether PostHog and Crashlytics are enabled in the exact store build.
- [ ] Confirm processor regions and retention periods.
- [ ] Mirror the same facts in Play Data Safety and App Store privacy labels.
- [ ] Host at a public HTTPS URL and link it from the app and store listings.
- [ ] Complete operator/legal review.
