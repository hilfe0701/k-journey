# iOS release handoff

Web is the active release target. iOS is deferred and has not been submitted to TestFlight or the App Store.

## Current native identity

- Expo/EAS project ID: `a87d65e7-5b8f-4643-a62f-71a76f638d31`
- iOS bundle identifier: `com.kjourney.app`
- App version: `0.1.0`
- EAS production profile: remote version source with automatic build-number increment

## Required before the first external iOS build

1. Complete the Expo 52-to-current framework migration in a dedicated branch, resolve the transitive audit findings, and rerun the complete test suite.
2. Provision the production Firebase iOS app and upload its `GoogleService-Info.plist` as the EAS file secret `GOOGLE_SERVICES_PLIST`.
3. Add the public PostHog production key if analytics are required for launch validation.
4. Confirm Apple Developer team access, distribution certificate, App Store provisioning profile, App Store Connect app record, agreements, tax, and banking state.
5. Add an iOS `submit.production` configuration only after the App Store Connect app and credentials exist.
6. Build a physical-device preview and validate sign-in/data persistence, notifications, Crashlytics, camera, photo-library save, deep links, and all onboarding branches.
7. Run TestFlight internal testing, accessibility checks, privacy-manifest/data-use review, screenshots/metadata review, and release-candidate acceptance before App Review submission.

## Release commands after provisioning

```sh
eas build --platform ios --profile preview
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Do not run the production build or submission until the Firebase file secret and Apple/App Store Connect prerequisites above have been verified.
