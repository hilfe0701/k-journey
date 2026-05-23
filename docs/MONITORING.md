# Monitoring

> What we watch, where the dashboards live, and what alerts page whom. For routine cadence see `OPERATIONS.md`. For incidents see `INCIDENT_RESPONSE.md`.

## 1. Dashboards

| Tool | Dashboard | Purpose | Owner |
|---|---|---|---|
| Firebase Console | Crashlytics | Crashes by velocity, crash-free users, top crashers | release manager |
| Firebase Console | Performance Monitoring | Cold start P50/P75/P95, custom traces | release manager |
| Firebase Console | Firestore Usage | reads/writes/storage trends | release manager |
| Firebase Console | Cloud Messaging | delivery success rate (D-30/14/7, panel unlocks) | release manager |
| Firebase Console | Authentication | Sign-in success rate (Apple vs Google when active) | release manager |
| PostHog Insights | Onboarding funnel | sign_in → ... → onboarding_complete drop-off | product owner |
| PostHog Insights | First-mission funnel | onboarding_complete → mission_complete | product owner |
| PostHog Cohorts | New users weekly | retention | product owner |
| PostHog Recordings | Session replay | qualitative QA (sampled 30%) | product owner |
| App Store Connect | Crashes, ratings | store-side signals | release manager |
| Play Console | ANR, ratings | store-side signals | release manager |

## 2. KPIs (PRD v1.1 §1.2)

| Indicator | Target | Source | Cadence |
|---|---|---|---|
| Downloads (6 months post-launch) | 1,000+ | App Store / Play Console | weekly |
| Have-To mission completion rate | ≥ 60% | PostHog `mission_complete` / `missionsForHousing(housing).length` | weekly |
| D7 retention | ≥ 40% | PostHog cohort | weekly |
| D30 retention | ≥ 25% | PostHog cohort | weekly |
| App Store rating | ≥ 4.5 | App Store / Play Console | monthly |
| Crash-free users | ≥ 99.5% | Crashlytics | daily |
| Cold start P75 | ≤ 3.0 s | Firebase Performance | weekly |
| Push permission grant rate | ≥ 60% | PostHog `push_permission_state` | weekly |
| Onboarding completion rate | ≥ 70% | PostHog funnel | weekly |

## 3. Alerts

All alerts route to `wodbs990701@gmail.com` (release manager) at MVP scale.

| Alert | Trigger | Channel | Action |
|---|---|---|---|
| Crash-free users < 99% (7-day) | Crashlytics threshold | email | Investigate top crash → hotfix |
| Crash-free users < 95% (1-hour) | Crashlytics velocity | email + push to release manager | **PAGE** — `docs/INCIDENT_RESPONSE.md` |
| New crash type, > 5 occurrences | Crashlytics | email | Investigate within 24 h |
| Firestore reads > 80% of daily free tier | Firebase budget alert | email | Investigate query patterns; check for runaway loops |
| Firestore writes > 80% of daily free tier | Firebase budget alert | email | Investigate write loops |
| Storage egress > 80% of monthly free tier | Firebase budget alert | email | Investigate share-feature usage |
| FCM delivery success < 95% | Manual weekly check (no auto-alert in MVP) | dashboard | Investigate APNs config |
| Sign-in success rate < 90% | PostHog weekly review | dashboard | Investigate auth flow |
| PostHog event volume > 800k / month | PostHog usage | email | Approaching 1M free tier limit |

## 4. Custom traces / events

### 4.1 Firebase Performance custom traces
| Trace | Captured at | Pass criteria |
|---|---|---|
| `_app_start` (auto) | App boot | P75 ≤ 3.0 s |
| `byeongpung_first_paint` (custom) | from `app/_layout.tsx` mount to first byeongpung frame | P75 ≤ 1.5 s |
| `mission_complete_animation` (custom) | overlay show → fade complete | duration ~2.4 s, P95 ≤ 3.0 s |

### 4.2 PostHog diagnostic events
| Event | Used for |
|---|---|
| `clock_skew_detected` | Watch for any user manipulating system clock > 2 days |
| `push_permission_state` | Permission grant funnel; understand why users decline |

## 5. Logs

K-Journey does **not** ship a central log aggregator at MVP scale. Effective log sources:

* **Crashlytics**: error events from `recordError` calls (filter UI / `showOperationError` failures).
* **PostHog**: full event stream + session replay (sampled).
* **Firebase Auth logs**: auth attempts and failures.

For deep debugging of a specific issue: enable verbose `console.log` in `__DEV__` only, never ship to prod.

## 6. Health check ritual

Before declaring a release "stable":

1. Cold start P75 stayed ≤ 3.0 s for 24 h post-launch.
2. Crash-free users stayed ≥ 99.5% for 7 days.
3. No new top-crasher in Crashlytics.
4. Onboarding funnel drop-off unchanged from previous release (±3%).
5. App Store rating didn't drop > 0.2 stars.

If any of these fail → consider hotfix path.

## 7. Tuning thresholds as MAU grows

The thresholds in §3 assume MVP scale (1k MAU). Re-tune at these MAU bands:

| MAU band | Firestore reads/day adjust | Storage egress adjust | FCM delivery |
|---|---|---|---|
| 1k–10k | 100k reads, 10 GB egress | 50% threshold | weekly check |
| 10k–100k | 500k reads, 50 GB egress | 50% threshold | daily check, +auto-alert |
| 100k+ | enterprise SLA discussion | — | Pubsub + Cloud Functions for outage handling |

## 8. Links

* `docs/OPERATIONS.md`
* `docs/INCIDENT_RESPONSE.md`
* `docs/PERFORMANCE.md`
* PRD v1.1 §1.2, §11.10
* [Firebase Crashlytics velocity alerts](https://firebase.google.com/docs/crashlytics/customize-crash-reports#velocity-alerts)
