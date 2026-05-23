# Performance Budgets & Quotas

> Per-metric budgets, the rationale, and how each is measured. Authority: PRD v1.1 §11.8. For monitoring/alerting see `MONITORING.md`.

## 1. App performance budgets

| Metric | Budget | Measured by | Rationale |
|---|---|---|---|
| Cold start (iPhone 13, Wi-Fi, fresh install) | **P75 ≤ 3.0 s** | Firebase Performance Monitoring `app_start` trace | Splash → first interactable home tab. Brand calm should not feel slow. |
| First paint after splash | ≤ 1.0 s | Reanimated frame timing + manual stopwatch | Splash → byeongpung visible. |
| Time to interactive (tab tap → response) | ≤ 200 ms P95 | Manual / `useTrace` | RN bridge constraint. |
| Animation frame rate (mission complete) | ≥ 55 fps over the 2.4 s window | Reanimated frame stats | Brand hero moment. |
| JS bundle (release, gz, single platform) | ≤ 4.5 MB | EAS build report | Keeps install size sane after PNG bundling. |
| Total app size (release IPA / AAB) | ≤ 60 MB | App Store / Play Console | 24 byeongpung PNG ≈ 6–8 MB; rest is fonts + JS + native. |
| Memory (idle, after 60 s home tab) | ≤ 250 MB | Xcode Instruments / Android Studio Profiler | Headroom for image caches. |
| Memory (during mission complete animation) | ≤ 400 MB | Xcode Instruments | Worst-case spike. |

## 2. Backend quotas (Firebase free tier headroom)

K-Journey uses Firebase Blaze plan (pay as you go). MVP scale (1k users × 6-month run) should comfortably stay within free-tier limits. Track these per MAU:

| Quota | Budget per MAU | Measured by | Source |
|---|---|---|---|
| Firestore reads | ≤ 500 / MAU | Firebase Usage tab | Snapshot subscriptions; tight if user re-opens app frequently. |
| Firestore writes | ≤ 150 / MAU | Firebase Usage tab | Mission completions + bucket toggles. |
| Firestore stored bytes | ≤ 200 KB / user | Firebase Usage tab | Profile + 50 missions + ~6 buckets × ~10 items. |
| Storage egress | ≤ 5 MB / MAU | Firebase Usage tab | Byeongpung PNG exports (rare). |
| FCM messages | ≤ 12 / MAU | scheduler logs | D-30/14/7 + 3 phase transitions + up to 8 panel unlocks. |
| Auth verifications | ≤ 5 / MAU | Firebase Auth dashboard | One per cold start auth refresh. |
| Crashlytics events | ≤ 10 / MAU | Crashlytics dashboard | Aim for crash-free 99.5%+. |

**Alert** when monthly usage projection > 80% of any free-tier limit.

## 3. Analytics quotas (PostHog free tier)

| Quota | Budget | Notes |
|---|---|---|
| Events / month | ≤ 1 M | Far above expected scale at 1k users. |
| Session replays / month | ≤ 5 k | Sampling 30% of sessions sufficient. |
| Cohorts | ≤ 50 | More than enough for our funnels. |

## 4. Bundle size discipline

Top size contributors:

| Dependency | Approx. install delta | Notes |
|---|---|---|
| `@react-native-firebase/*` (8 modules) | ~3 MB JS | Modular — only imported services bundled. |
| `react-native-reanimated` | ~500 KB | Native; required for byeongpung animations. |
| 24 byeongpung PNGs | ~6 MB | One per (era, panel). Optimised at delivery. |
| 6 bucket template PNGs | ~1.5 MB | Same. |
| Pretendard variable font | ~250 KB | All weights in one file. |
| `posthog-react-native` | ~200 KB | Acceptable. |
| `date-fns` + `date-fns-tz` | ~150 KB | KST helpers — ADR-0022. |

**Adding a dependency > 200 KB** requires:
1. Justification in PR description.
2. Update this section.
3. Re-run `npm run build` and confirm budget intact.

## 5. Image asset rules

* PNG only for byeongpung panels (ADR-0008).
* Each panel ≤ 400 KB target. Source PNGs are larger; optimisation pass (pngquant + zopflipng) before commit.
* `resizeMode="cover"` for byeongpung panels; do not load images larger than the layout requires.
* `<Image>` defaults — RN handles native caching.

## 6. Measurement: cold start

Manual:
1. Force-quit app.
2. Stopwatch from tap on icon to "tab interactable" (first home tab tap responds).
3. Repeat 5x, take median.

Automated (Firebase Performance Monitoring):
* `_app_start` automatic trace.
* Custom trace `byeongpung_first_paint` from `app/_layout.tsx` mount to first byeongpung frame.

Sample acceptance: P75 across 1k user sessions, gathered weekly.

## 7. Measurement: animation

Reanimated has built-in frame stats. For the mission complete animation:

```ts
import { measure } from 'react-native-reanimated';
// In the worklet: measure() returns layout info; combine with frame timestamps for fps.
```

Manual check: `Show FPS Monitor` in dev menu, run the animation. Should stay ≥ 55 fps on iPhone 13.

## 8. Memory leaks — known gotchas

* **Firestore snapshot subscriptions** must `unsubscribe` on unmount (each hook does this). Verify on inspection.
* **Reanimated shared values** in hooks must be created once (use refs / `useSharedValue` at the top of the hook body, not inside `useEffect`).
* **`useEffect` cleanups** for `useFocusEffect` callbacks must guard against late state updates.

## 9. Quarterly performance review

Each quarter, run through:
* Firebase Usage trends (per-user growth).
* Crashlytics velocity (any new top crashers?).
* P75 cold start (regressed?).
* PostHog onboarding funnel (drop-off shifted?).

Document in `docs/STATUS.md` (after STATUS.md is updated to have a cadence — Part K).

## 10. Links

* PRD v1.1 §11.8
* `docs/MONITORING.md`
* `docs/RELEASE.md` (release checklist includes performance smoke test)
* [Firebase Performance](https://firebase.google.com/docs/perf-mon)
* [PostHog free tier](https://posthog.com/pricing)
