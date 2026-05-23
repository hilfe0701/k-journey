# 0001. React Native + Expo over Flutter

* **Status:** accepted (retroactive record of decision originally made ~2026-04, before the PRD ink dried)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤 (founder/eng)
* **Tags:** `frontend`, `stack`, `foundation`

## Context and Problem Statement

K-Journey's original PRD v1.0 (§11.1) listed **Flutter (Dart)** as the frontend stack. By the time the first sprint started, the team had pivoted to **React Native + Expo + TypeScript**. The PRD was never updated to reflect this, and the inconsistency surfaced during the 2026-05-13 documentation audit. This ADR records the pivot retroactively so future contributors can read *why* the actual code does not match the original PRD.

The pivot happened because the team needed:
* A native Firebase SDK with Crashlytics, FCM, and `signInWithCredential` for Apple — `firebase_messaging` for Flutter was viable but the team's prior shipping experience was JS/RN.
* Expo's managed workflow + Expo Router for fast iteration without writing platform-specific build code.
* A typed component model the team was already fluent in (TS + JSX).

## Decision Drivers

* **Team prior art.** Founder ships JS/RN apps faster than Dart/Flutter — the calendar pressure to ship by 2026 가을학기 dominated framework purity.
* **Firebase RN modular SDK** (`@react-native-firebase/*`) is first-party and has all the auth/Crashlytics/FCM/Messaging hooks the PRD needs. Flutter's `firebase_*` packages were comparable but added a Dart/JS skill split for the AI-pair-coding workflow ("vibe coding") the PRD plans for.
* **Expo Router** (file-based) maps cleanly to the screen list in PRD §4–§10.
* **Reanimated 3 + react-native-svg** were already known to deliver the byeongpung reveal choreography (§6) at 60fps.

## Considered Options

1. **Flutter (Dart)** — the PRD's original choice
2. **React Native + Expo (managed)** — the actual chosen path
3. **React Native bare workflow** — more control, more setup pain
4. **Native iOS-first (SwiftUI), Android later** — fastest to App Store, slowest to parity

## Decision Outcome

**Chosen:** React Native + Expo (managed) + TypeScript strict mode, because it gave the team the *fastest path from PRD to first sim build* while preserving the cross-platform single-codebase goal that justified the original Flutter pick.

### Positive Consequences
* JS/TS toolchain reuse → Vibe coding (LLM-assisted) is 1st-class.
* Expo Router screens map 1:1 to PRD sections — onboarding (§4), tabs (§5–§10), modal flows.
* MMKV, Reanimated, view-shot, expo-sharing all have clean RN/Expo bindings.
* `@react-native-firebase/*` modular API → tree-shakable, no web-SDK incompatibilities.

### Negative Consequences
* Flutter's Skia-rendered text would have been slightly more uniform across Android OEMs; RN inherits OS text rendering.
* Expo managed workflow caps native customisation. Xcode 26 fmt patch + `NSPhotoLibraryAddUsageDescription` had to be re-applied after every `expo prebuild --clean` (see `project_xcode26_fmt_patch` memory) — a small but recurring tax.
* Expo SDK 52's `expo run:ios` is currently broken on Xcode 26; team has to drive iOS sim build from Xcode IDE (see same memory).

### Reversibility
Effectively irreversible at this point — re-platforming to Flutter would be a from-scratch rewrite. The MVP ships RN.

## Pros and Cons of the Options

### Flutter (Dart)
* **+** Pixel-perfect cross-OEM rendering via Skia.
* **+** Built-in Material + Cupertino.
* **−** Dart skill cost; team's prior shipping experience is JS.
* **−** Adds a second language for AI-pair-coding (the PRD's "바이브 코딩" rollout).

### React Native + Expo (managed)
* **+** JS/TS reuse; large library ecosystem; LLM coding fluency higher.
* **+** Expo Router + EAS Build + Expo modules cover ~95% of MVP needs without ejecting.
* **−** Managed workflow's native customisation ceiling. Xcode 26 + RN 0.76.9 has rough edges.
* **−** Animation perf less deterministic than Skia (mitigated by Reanimated 3 worklets, ADR-0019).

### React Native bare workflow
* **+** Full native control.
* **−** Significant native-build pain. Defeats the velocity rationale.

### Native iOS-first
* **+** App Store ship in weeks.
* **−** Android parity becomes a separate codebase — KPI §1.2 includes Play Store ratings.

## Links

* **PRD:** `reference/K-Journey_PRD_v1_1_KR.md` §11.1 (the corrected stack table)
* **Historical PRD:** `reference/K-Journey_PRD_v1_0_KR.md` §11.1 (the original Flutter listing — preserved for history)
* **Project rules:** `CLAUDE.md` *Stack (locked)*
* **Code:** `package.json` (expo + RN versions), `app.json` (Expo Router config)
* **Related ADRs:** [ADR-0003](0003-firebase-rn-modular-sdk.md), [ADR-0019](0019-reanimated-worklet-inline-rule.md)
* **External:** [Expo Router](https://docs.expo.dev/router/introduction/), [React Native Firebase](https://rnfirebase.io/)

## Notes

The pivot is the single biggest *doc-vs-code* drift in the project. v1.1 of the PRD (2026-05-13) is the canonical source. If anyone reads v1.0 in isolation again, the Flutter table is a relic, not a requirement.
