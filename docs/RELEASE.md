# Release Runbook

> The exact procedure for cutting a release from any environment (dev → staging → prod). For incidents during release see `INCIDENT_RESPONSE.md`.

## 1. Pre-flight

* [ ] All Round-2 blocker items closed (see `STATUS.md` if active)
* [ ] `npm run check` green (typecheck + lint + jest)
* [ ] 15-scenario manual sim QA pass (`docs/TESTING.md` §4)
* [ ] Real-device sanity (if releasing to staging or prod)
* [ ] `docs/STATUS.md` reflects current state
* [ ] Version bumped in `app.config.ts` (or `package.json`) per [ADR-0026](adr/0026-eas-channel-strategy.md)
  * MAJOR for breaking UX/data changes
  * MINOR for new features
  * PATCH for bug fixes
* [ ] Release notes drafted (see §7)
* [ ] All Open decisions in `CLAUDE.md` either resolved or explicitly deferred

## 2. Cut a build

### 2.1 Dev (internal preview)
```bash
eas build --profile dev --platform ios
# or --platform android, or --platform all
```
Distribution: internal team via Expo dashboard QR or TestFlight (if internal testers configured).

### 2.2 Staging (external preview)
```bash
eas build --profile staging --platform ios --auto-submit
# triggers TestFlight upload on success
```

After upload completes:
1. TestFlight processing (~5–30 min).
2. Add to External Test group.
3. Confirm internal QA pass on Staging build before promoting external testers.

### 2.3 Prod (App Store)
```bash
eas build --profile prod --platform all
```

After build:
```bash
eas submit --profile prod --platform ios
# then for Android:
eas submit --profile prod --platform android
```

## 3. Firestore Rules deploy

Required when `firestore.rules` or `firestore.indexes.json` changed:

```bash
firebase use k-journey            # dev
firebase deploy --only firestore:rules,firestore:indexes

firebase use k-journey-staging
firebase deploy --only firestore:rules,firestore:indexes

# Prod: rules tests must pass first
firebase emulators:exec --only firestore "npm test:rules"
firebase use k-journey-prod
firebase deploy --only firestore:rules,firestore:indexes
```

**Never deploy to prod without emulator test green.**

## 4. Verify

After each environment's deploy:

| Env | Verify |
|---|---|
| dev | Sign in works, mission complete works (dev-mock path + real path), telemetry shows in dev PostHog |
| staging | Same as dev + push notification arrives, byeongpung share works on real device |
| prod | Same + Crashlytics receives events, App Store listing renders correctly |

If any verification fails: do **not** promote to the next environment. Hotfix or roll back.

## 5. App Store / Play Console submission

### 5.1 App Store

* Build appears in TestFlight after `eas submit`.
* App Store Connect → My Apps → K-Journey → version → Build → select.
* Fill in:
  * Release notes (English).
  * Privacy form matches `docs/SECURITY.md` §8.
  * Age rating.
  * Sign-in info for review team (Apple test account).
* Submit for review.

### 5.2 Play Console

* AAB appears after `eas submit`.
* Play Console → Production → Create new release → upload AAB.
* Same privacy form discipline.
* Submit.

## 6. Post-launch monitoring

* First 24 h: check Crashlytics every few hours.
* First 7 days: check PostHog funnels daily.
* If any alert fires (see `docs/MONITORING.md` §3): follow `INCIDENT_RESPONSE.md`.

## 7. Release notes template

```
K-Journey vX.Y.Z

What's new
- (user-visible change)
- (user-visible change)

Improvements
- (perf / a11y / quality improvement)

Bug fixes
- (visible bug fixed)
```

Internal changelog (for ADRs, refactors, etc.) stays in `STATUS.md` or commit log — not user-facing.

## 8. Rollback

App binaries cannot be true-rolled-back on App Store / Play Console. Options:

* **Hotfix release**: increment PATCH, fix, ship as new version. Users on the previous version stay on it until they update.
* **Server-side**: if the regression is data-shaped (e.g. mission catalogue change), redeploy the previous Firestore catalog data or Firestore Rules (see `OPERATIONS.md` §9).
* **OTA**: not available in MVP (ADR-0026). When V1.1 introduces Expo Updates with opt-in policy, OTA rollbacks become possible for JS-only fixes.

## 9. Pre-launch checklist (first-time prod release)

In addition to §1, the **first** prod release requires:

* [ ] All items in `docs/OPERATIONS.md` §3 pre-launch checklist
* [ ] Firebase prod project + Auth providers + Crashlytics + FCM all configured
* [ ] App Store / Play Console accounts active
* [ ] App icon, splash, screenshots, listing text in App Store Connect
* [ ] Apple test account credentials provided in App Store Connect for review team
* [ ] Privacy policy URL live
* [ ] Support email live
* [ ] Bundle ID and app name reserved
* [ ] App Store / Play Console privacy form matches actual collection
* [ ] No `[Dev]` strings or `__DEV__`-only paths reachable in release build
* [ ] No `placeholder` strings in copy
* [ ] Open decisions in `CLAUDE.md` reduced to ≤ 1

## 10. Cadence (post-launch)

* Patch releases (PATCH): as needed, ad-hoc.
* Minor releases (MINOR): no fixed cadence; ship when a feature is ready and tested.
* Major releases (MAJOR): tied to V2.0 milestone.

## 11. Links

* `docs/OPERATIONS.md`
* `docs/INCIDENT_RESPONSE.md`
* `docs/MONITORING.md`
* `docs/TESTING.md`
* [ADR-0024](adr/0024-environment-separation-dev-staging-prod.md)
* [ADR-0026](adr/0026-eas-channel-strategy.md)
* [EAS Build](https://docs.expo.dev/build/introduction/)
* [EAS Submit](https://docs.expo.dev/submit/introduction/)
