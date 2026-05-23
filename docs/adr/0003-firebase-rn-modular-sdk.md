# 0003. Firebase RN Modular SDK over Web SDK

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `firebase`, `auth`, `foundation`

## Context and Problem Statement

Once RN was the platform (ADR-0001), there were two Firebase paths: (a) the standard `firebase` npm package (web SDK), or (b) `@react-native-firebase/*` (a native-bridge family of modules with separate packages per Firebase service).

The Firebase web SDK *technically* runs in RN, but:
* **Crashlytics, Performance Monitoring, and App Check** are not implemented in the web SDK.
* **FCM** in the web SDK targets browsers, not RN's native push pipeline (APNs/FCM).
* **Auth persistence** in the web SDK uses IndexedDB shims that are fragile on RN.
* **Bundle size** of the web SDK in RN bundles is large (no tree-shaking on RN's old Metro).

## Decision Drivers

* PRD §11.1 requires Crashlytics, FCM, Firebase Auth (Apple + Google), Firestore, Storage, Analytics — *all* services.
* App Store requires real native push handling, not web push shims.
* CLAUDE.md NEVER #13 already locked this for future contributors: *"NEVER use the Firebase web SDK"*.

## Considered Options

1. **`@react-native-firebase/*`** modular API (current default since v18)
2. **Firebase web SDK** (`firebase` npm)
3. **Wrap web SDK + add native modules separately** (Crashlytics native, web SDK for Firestore)

## Decision Outcome

**Chosen:** `@react-native-firebase/*` modular API. It is the only option that delivers every PRD-required Firebase service without missing-service workarounds.

### Positive Consequences
* All services available with consistent modular API: `getAuth()`, `getFirestore()`, `getCrashlytics()`, `getMessaging()`.
* Modular tree-shakes — final bundle only includes services we import.
* Native FCM means iOS/Android push handles APNs token refresh, background, and notification taps natively.

### Negative Consequences
* Each service is its own `npm` package; `package.json` has ~8 `@react-native-firebase/*` entries.
* iOS native deps: GoogleService-Info.plist required at build time; CocoaPods install needs FirebaseSDK 11.x. Xcode 26 has a fmt 11.1.4 patch dance (`project_xcode26_fmt_patch` memory).
* Web preview / Expo Go won't work — must build a Dev Client (acceptable).

### Reversibility
Very expensive — all our Firestore queries, auth callbacks, and Crashlytics records are coupled to the modular API surface. ~1 month of work to swap.

## Pros and Cons of the Options

### `@react-native-firebase/*` modular
* **+** All services, native parity, tree-shakable.
* **+** Maintained by Invertase, mature.
* **−** Native build pain for upgrades.

### Firebase web SDK
* **+** One package, simpler to install.
* **−** Crashlytics/FCM missing → blockers for §11.1.
* **−** Auth persistence shims fragile.

### Hybrid
* **−** Worst of both: two auth surfaces, two Firestore handles, double-bundle.

## Links

* **PRD:** §11.1, §11.5 (security model uses Auth providers)
* **Project rules:** `CLAUDE.md` NEVER #13
* **Code:** `src/lib/firebase.ts` (all `getXxx()` modular helpers), `package.json` (`@react-native-firebase/*`)
* **Related ADRs:** [ADR-0013](0013-apple-primary-google-deferred.md), [ADR-0021](0021-firestore-rules-acl-model.md)
* **External:** [React Native Firebase Modular API](https://rnfirebase.io/#migrating-to-v22)
