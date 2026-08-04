# K-Journey development setup

## Requirements

- Node.js compatible with Expo SDK 52
- npm
- For native iOS: Xcode and CocoaPods
- For native Android: Android Studio/SDK

No Firebase Auth or Firestore project is required for the core local journey. Native Crashlytics and optional analytics need their own environment-specific configuration only when those services are being tested.

## Install and run

```bash
npm install
npm run web
npm run ios
npm run android
```

The web app uses Expo Router. Do not force browser deep links through the native branded splash.

## Environment

Copy `.env.example` only for optional public analytics configuration. `EXPO_PUBLIC_*` values are embedded in clients and are not secrets.

- No usable PostHog key: analytics client is disabled.
- Usable PostHog key: allowlisted events may be sent; session replay remains disabled.
- Never commit native Firebase service files, signing credentials, store credentials, or `.env`.

## Quality commands

```bash
npm run typecheck
npm run lint
npm test
npm run check
npm run build:web
```

`npm run check` chains TypeScript, Expo lint, and Jest. A release candidate also requires a successful static web export and browser regression; unit tests alone do not verify routing, accessibility, or visual layout.

## Local data

MMKV ID: `k-journey`. The filename `src/lib/firebase.ts` is retained for import compatibility but contains the local data API.

During development, use Settings → Delete all local data or the development fresh-onboarding control. The production delete flow is intentionally available because users need control over device-local data.

## Current docs

Read these before changing behavior:

- `CLAUDE.md`
- `reference/K-Journey_PRD_v2_0_KR.md`
- `docs/JOURNEY_INTEGRATION_SPEC.md`
- `docs/LOCAL_DATA_LIFECYCLE.md`
- `docs/CONTENT_GOVERNANCE.md`
- `docs/BYEONGPUNG_ART_DIRECTION.md`

The v1 PRDs and old Auth/Firestore runbooks are historical references, not setup instructions.
