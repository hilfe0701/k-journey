# 0024. Environment separation (dev / staging / prod)

* **Status:** proposed
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `build`, `release`, `firebase`

## Context and Problem Statement

The repo currently has one bundle identifier (`com.kjourney.app`), one Firebase project (`k-journey`, dev), and a placeholder `EAS_PROJECT_ID`. Shipping to TestFlight or the App Store from this state is a **hard launch blocker**:

* The same Firebase project would receive both QA and real-user traffic.
* Crashlytics, Analytics, and PostHog dashboards mix dev noise with prod signal.
* A bad QA write could not be reverted without affecting real users.

CLAUDE.md Open decisions §2 explicitly flags this: *"Production Firebase project does not exist yet; create `k-journey-prod` (or rename current → `k-journey-dev`) before any external test build."*

## Decision Drivers

* Crash-free baseline and retention KPIs (PRD §1.2) need clean prod data.
* Rollback ability requires environment isolation.
* App Store and Play Console each need a stable bundle ID.
* Apple's bundle ID is **one** per app — `.dev` / `.staging` / production must each have their own.

## Considered Options

1. **Three environments: dev / staging / prod, each with own bundle ID and Firebase project** (chosen)
2. **Two environments: dev + prod** (no staging)
3. **One environment with feature flags for "prod mode"**

## Decision Outcome

**Chosen:** Three environments with explicit separation. Replace `app.json` with `app.config.ts` that branches on `EAS_BUILD_PROFILE`.

| Env | Bundle ID | Firebase project | PostHog project | EAS channel |
|---|---|---|---|---|
| dev | `com.kjourney.app.dev` | `k-journey` (existing) | `k-journey-dev` | internal |
| staging | `com.kjourney.app.staging` | `k-journey-staging` (new) | `k-journey-staging` (new) | preview |
| prod | `com.kjourney.app` | `k-journey-prod` (new) | `k-journey-prod` (new) | production |

### Positive Consequences
* TestFlight beta runs on staging — real OS, real network, isolated data.
* Prod data is clean from day one.
* Bug found in staging is fixed before it ever sees prod.
* Crashlytics / PostHog dashboards are per-env, signal isn't drowned in noise.

### Negative Consequences
* Firebase project setup is multi-step (create project, download `GoogleService-Info.plist` and `google-services.json`, configure Auth providers, set up Crashlytics, deploy Firestore Rules).
* Three sets of secrets to rotate.
* `app.config.ts` becomes the source of truth for bundle ID — anyone editing must understand profile branching.
* **Environment-visibility banner (Wave 2 — 2026-05-14)**: dev and staging builds **must** display a thin sticky banner at the top of every screen reading `DEV — non-production data` or `STAGING — non-production data` (sentence case per MICROCOPY.md, no exclamation, no emoji). Banner background `palette.hwanggeumLight`, text `palette.meok`, height 24 pt. Production builds render no banner. Implementation: `expo-constants` exposes `Constants.expoConfig.extra.environment` set per `app.config.ts` profile; `<EnvironmentBanner />` mounted in `app/_layout.tsx` reads it. **Why**: prevents internal testers and screenshot reviewers from confusing staging data with prod data, which has caused QA-vs-prod miscommunication in past projects. Telemetry: `environment_loaded` event with `env` property (dev/staging/prod) on app open — sanity check that the right binary is on the right device.
* **Staging push notification prefix (Wave 2 boost)**: staging push payloads are prefixed with `[STAGING] ` so a tester receiving a push during dogfooding cannot accidentally screenshot it as a prod marketing asset. Implemented in `src/lib/notifications.ts` by reading `Constants.expoConfig.extra.environment` and prefixing the title.

### Reversibility
Forward-only at the bundle-ID level (once an app is on the App Store with a bundle ID, you can't merge it with another).

## Pros and Cons of the Options

### dev / staging / prod
* **+** Industry-standard, clean separation.
* **−** 3x setup, 3x ops.

### dev + prod only
* **+** Less setup.
* **−** Staging is a useful pre-prod soak; without it, prod is the first real-OS test.

### Single env with flags
* **+** Cheapest.
* **−** Defeats the purpose; bad QA writes hit prod.

## Migration plan (Part I of Round 2)

1. Create Firebase projects `k-journey-staging`, `k-journey-prod` in Firebase Console.
2. Create matching PostHog projects.
3. Replace `app.json` with `app.config.ts` (env-aware).
4. Create `eas.json` with three build profiles.
5. Provision EAS Project ID; replace `PLACEHOLDER_EAS_PROJECT_ID`.
6. Store `GoogleService-Info.plist` / `google-services.json` per env — EAS Secrets, not in repo.
7. Update CLAUDE.md Open decisions §2 with completion date.

## Links

* **PRD:** §11.9 (build & deploy)
* **Project rules:** `CLAUDE.md` Open decisions §2
* **Code (target):** `app.config.ts` (new), `eas.json` (new), `app.json` (removed)
* **Related ADRs:** [ADR-0026](0026-eas-channel-strategy.md), [ADR-0021](0021-firestore-rules-acl-model.md)
* **External:** [EAS Build profiles](https://docs.expo.dev/build/eas-json/)
