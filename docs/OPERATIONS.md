# Operations

> What to do when something breaks, who to call, and the routine maintenance cadence. For acute incidents see `INCIDENT_RESPONSE.md`. For release procedure see `RELEASE.md`.

## 1. Environments

| Env | Bundle ID | Firebase | PostHog | EAS channel | Who builds | Who can deploy rules |
|---|---|---|---|---|---|---|
| dev | `com.kjourney.app.dev` | `k-journey` | `k-journey-dev` | internal | any contributor | any |
| staging | `com.kjourney.app.staging` | `k-journey-staging` | `k-journey-staging` | preview | release manager | release manager |
| prod | `com.kjourney.app` | `k-journey-prod` | `k-journey-prod` | production | release manager | release manager only |

Authority: [ADR-0024](adr/0024-environment-separation-dev-staging-prod.md), [ADR-0026](adr/0026-eas-channel-strategy.md).

## 2. Routine cadence

| Frequency | Task | Owner |
|---|---|---|
| Daily (auto) | Firebase Usage spike check (set alert > 80% of free tier) | n/a (alert-based) |
| Daily (auto) | Crashlytics velocity alert (crash-free < 99%) | n/a |
| Weekly | PostHog funnel review (onboarding, first mission, panel unlock) | product owner |
| Weekly | STATUS.md refresh | release manager |
| Monthly | Firestore Storage size audit | release manager |
| Quarterly | Content QA — mission accuracy, university data, emergency numbers (PRD §12.3) | content owner |
| Quarterly | Secret rotation: PostHog write key | release manager |
| Quarterly | Dependency audit (`npm audit`, `expo upgrade --dry-run`) | engineer |
| Quarterly | Performance review (`docs/PERFORMANCE.md` §9) | engineer |
| Annual | University catalogue refresh (PRD §12.2) | content owner |

## 3. Pre-launch checklist (prod)

Use this before first App Store submission and any major release.

* [ ] `k-journey-prod` Firebase project created
* [ ] Apple Sign-In capability + Sign In with Apple in prod project
* [ ] Google Sign-In OAuth client provisioned (if Google is active — ADR-0013)
* [ ] `firestore.rules` deployed to prod
* [ ] `firestore.indexes.json` deployed to prod
* [ ] EAS Project ID set in `app.config.ts` `extra.easProjectId`
* [ ] `GoogleService-Info.plist` + `google-services.json` stored as EAS Secrets per env
* [ ] PostHog prod project — write key as EAS Secret
* [ ] FCM configured (Firebase Console → Cloud Messaging → APNs key uploaded)
* [ ] Bundle ID `com.kjourney.app` reserved in App Store Connect
* [ ] Privacy form (App Store / Play Console) matches `docs/SECURITY.md` §8
* [ ] App icon + splash assets locked
* [ ] Crashlytics alert threshold: crash-free < 99% → email
* [ ] Firebase usage alert: > 80% of any free-tier quota → email
* [ ] 15-scenario manual sim QA passed (`docs/TESTING.md` §4)
* [ ] Real-device sanity test on iPhone 13 / latest Android
* [ ] Privacy policy URL live
* [ ] Support email live
* [ ] Release notes drafted

## 4. Daily / on-call (lightweight)

K-Journey has no formal on-call rotation at MVP scale, but the release manager should:

* Glance at Firebase Console once per weekday (Crashlytics velocity, Firestore reads/writes).
* Glance at PostHog dashboard (onboarding funnel — if any step drop > 10% week-over-week, investigate).
* Watch for App Store / Play Console review email + 1-star reviews.

If a Crashlytics alert fires → follow `INCIDENT_RESPONSE.md`.

## 5. Firebase usage alerts

In Firebase Console → Project Settings → Usage and billing → set Budget Alert at 80% and 100% of the free tier:

| Quota | Threshold |
|---|---|
| Firestore document reads | 80% (50k/day default — adjust as MAU grows) |
| Firestore document writes | 80% (20k/day) |
| Firestore stored bytes | 80% (1 GB) |
| Cloud Storage egress | 80% (5 GB/month) |
| FCM messages | n/a (no quota in current plan) |

## 6. Crashlytics alert config

* **Velocity alert**: notify when a single crash type increases >50% in 1 hour.
* **New crash alert**: notify on any new crash type with >5 occurrences.
* **Crash-free users**: alert if drops below 99% over a 7-day window.

## 7. Secret rotation runbook

### 7.1 PostHog write key (quarterly)
1. Log in to PostHog → Project Settings → Project API Key → Rotate.
2. Copy new key.
3. Update EAS Secret: `eas secret:create --scope project --name EXPO_PUBLIC_POSTHOG_KEY --type string --value <new-key> --force`.
4. Trigger a build for each env, deploy via OTA when adopted (currently: native rebuild).
5. After 7 days of dual operation, revoke the old key from PostHog.

### 7.2 Firebase API key
Firebase API keys are public-by-design (restricted by bundle ID at the Firebase end), so rotation is rare. If exposure is suspected:
1. Generate new `GoogleService-Info.plist` / `google-services.json` from Firebase Console.
2. Replace EAS Secrets.
3. Rebuild and submit. Old config files are useless once the Firebase project rotates its key, but rebuild is required so binary signing matches.

## 8. Deployment commands

### 8.1 Firestore Rules
```bash
firebase use k-journey-staging    # or k-journey, k-journey-prod
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 8.2 EAS build
```bash
eas build --profile dev --platform ios
eas build --profile staging --platform ios --auto-submit-with-profile staging
eas build --profile prod --platform ios --auto-submit-with-profile prod
```

### 8.3 App Store submission
```bash
eas submit --profile prod --platform ios
```

Or use Xcode Organizer → upload → distribute.

## 9. Rollback

* **Firestore Rules**: redeploy previous version (rules are versioned in Firebase Console → Rules tab).
* **App binary**: cannot truly roll back a release on the App Store. Push a hotfix release (patch version bump).
* **Content (Firestore data)**: Firestore does not have native time-travel; restore from a manually-managed export (see §10).

## 10. Backups

| Data | How | Cadence |
|---|---|---|
| Firestore prod | Manual export via `gcloud firestore export` to a Cloud Storage bucket | Weekly |
| Firestore Rules | Versioned in Firebase Console (automatic) | — |
| Firestore indexes | `firestore.indexes.json` in repo | git |
| App config | `app.config.ts` in repo | git |
| Secrets | EAS Secrets dashboard | n/a (no backup of secrets) |
| Build artifacts | EAS retains last 30 builds | EAS |

## 11. Cost monitoring

At MVP scale (1k users), expected monthly Firebase cost is **$0** (within free tier). Tipping points:

| Cost driver | Trigger |
|---|---|
| Firestore reads | > 50k / day = $0.06 per 100k after. |
| Cloud Storage | > 5 GB egress / month. |
| Functions invocations | n/a in MVP. |
| Crashlytics | free at any scale. |
| Analytics | free at any scale. |

PostHog: free tier covers 1M events/month — well above MVP.

If MVP scales to > 10k MAU, revisit (`docs/PERFORMANCE.md` §2 thresholds and budget).

## 12. Compliance

* App Store / Play Console privacy form: see `docs/SECURITY.md` §8.
* No GDPR-region specific obligations triggered at MVP (Korea-domestic users; PostHog US region per ADR-0004).
* No CCPA explicit obligations triggered (no California-resident user disclosure path).
* If user base internationalises (V2), revisit jurisdiction-specific obligations.

## 13. Contact

* Release manager: 김재윤
* Apple ID: `zinylee1@daum.net` (Xcode + Apple Developer)
* Support email: TBD before launch (Open decision #4 in CLAUDE.md)
* GitHub repo: TBD before launch

## 14. Links

* [ADR-0024](adr/0024-environment-separation-dev-staging-prod.md)
* [ADR-0026](adr/0026-eas-channel-strategy.md)
* `docs/RELEASE.md`
* `docs/INCIDENT_RESPONSE.md`
* `docs/MONITORING.md`
* `docs/SECURITY.md`
