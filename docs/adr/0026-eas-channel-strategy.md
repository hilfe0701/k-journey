# 0026. EAS channel strategy & version policy

* **Status:** proposed
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `release`, `build`, `versioning`

## Context and Problem Statement

K-Journey will be distributed through TestFlight (iOS) and Play Console (Android). Both require **monotonic build numbers** per bundle ID — once a build number is used, it can never be reused. Without a policy, the team will hit submission errors at exactly the worst time (during a hotfix push).

Additionally, EAS Build has a *channel* concept that decides which OTA-update channel a build subscribes to. K-Journey is **not using OTA in MVP** (ADR follow-up: V1.1 considers Expo Updates), but the channel still selects which build profile a binary was built from.

## Decision Drivers

* Build-number collisions cause submission rejection.
* Semver communicates user-visible changes.
* Three environments (ADR-0024) need three channel mappings.
* OTA scope must be defined now even if not used until V1.1.

## Considered Options

1. **Semver + auto-increment buildNumber + per-env channel** (chosen)
2. **Date-based versioning** (`2026.05.13`)
3. **Manual build-number management**

## Decision Outcome

**Chosen:** Semver for user-visible versions; EAS-managed auto-increment for `buildNumber` (iOS) and `versionCode` (Android); explicit channels per environment.

### Version policy

* `MAJOR.MINOR.PATCH` — semver.
* `MAJOR` for breaking UX/data model changes.
* `MINOR` for new features.
* `PATCH` for bug fixes.
* Build number is internal-only (App Store / Play Console plumbing). User-facing version is the semver.
* `app.config.ts` reads `version` from a single constant (or `package.json` if EAS reads from there).

### Channel mapping

| Env | EAS profile | Channel | Distribution | OTA target |
|---|---|---|---|---|
| dev | `dev` | `internal` | Internal install (Expo Go-style dev client) | none (no OTA in MVP) |
| staging | `staging` | `preview` | Internal install + TestFlight | none |
| prod | `prod` | `production` | App Store / Play Store | none in MVP; reserved for V1.1 |

### OTA policy (V1.1 placeholder)

When Expo Updates is adopted (V1.1+), updates will be **opt-in** per release — every push to `production` channel is a deliberate decision, not an auto-deploy of every main-branch commit. Rationale: byeongpung artwork and PNG assets cannot be OTA-updated (native bundle), so silent JS-only updates risk visual drift.

### Positive Consequences
* No build-number collisions.
* Clear mental model: channel maps to env; binary built with the matching profile.
* OTA constrained → no surprise breaking changes shipped to users.

### Negative Consequences
* `eas.json` becomes load-bearing config — broken merge can break builds.
* Auto-increment requires EAS to track the counter; rare drift if the team also bumps manually.

### Reversibility
Easily reversible per release.

## Pros and Cons of the Options

### Semver + EAS auto-increment + channels
* **+** Standard, low friction.
* **−** EAS counter is opaque to the team (visible in EAS dashboard).

### Date versioning
* **+** Always monotonic by construction.
* **−** No semantic info; review notes harder to parse.

### Manual buildNumber
* **+** Total control.
* **−** Collision-prone at exactly the wrong time.

## Links

* **PRD:** §11.9
* **Code (target):** `eas.json` (new), `app.config.ts` (version)
* **Related ADRs:** [ADR-0024](0024-environment-separation-dev-staging-prod.md)
* **External:** [EAS Build profiles](https://docs.expo.dev/build/eas-json/), [Expo Updates](https://docs.expo.dev/eas-update/introduction/)
