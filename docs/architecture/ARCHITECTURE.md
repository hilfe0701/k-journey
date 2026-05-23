# K-Journey Architecture

> Single-screen overview of how K-Journey is put together. For decisions ("why this way?") read [`docs/adr/`](../adr/README.md). For product behaviour ("what does it do?") read [`reference/K-Journey_PRD_v1_1_KR.md`](../../reference/K-Journey_PRD_v1_1_KR.md). For data-flow walkthroughs read [`DATA_FLOW.md`](DATA_FLOW.md). For per-module contracts read [`MODULE_OWNERSHIP.md`](MODULE_OWNERSHIP.md).

## 1. Scope & non-goals

**This document covers** the runtime architecture of the React Native app:

* Layers and their responsibilities
* External dependencies and where they're touched
* Cross-cutting concerns (errors, observability, a11y, time)
* Threat model summary

**Non-goals:**

* Backend service architecture — there is **no custom backend in MVP**. Firestore Rules (`firestore.rules`) are the entire authorisation surface. Cloud Functions are a V1.1+ consideration.
* Build and release pipelines — see [`docs/RELEASE.md`](../RELEASE.md) and [ADR-0024](../adr/0024-environment-separation-dev-staging-prod.md).
* Visual design tokens — see `DESIGN.md` at repo root.

## 2. System diagram

```
                       ┌──────────────────┐
                       │  Apple ID Server │
                       │  Google OAuth    │
                       └────────┬─────────┘
                                │  id_token + nonce
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│  K-Journey App  (React Native 0.76 + Expo SDK 52 + TypeScript)        │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │ Presentation     app/  Expo Router screens                     │   │
│  │   (onboarding)  splash·sign-in·dates·profile·era               │   │
│  │   (tabs)        index·byeongpung·wantto·more                   │   │
│  │   mission/[id]  bucket/[id]  bucket/new  gallery  emergency    │   │
│  └────────────┬───────────────────────────────────────────────────┘   │
│               │ render / dispatch                                     │
│  ┌────────────▼───────────────────────────────────────────────────┐   │
│  │ Composition     src/hooks/                                     │   │
│  │   useAuth · usePhase · useProfile · useCompletedMissions       │   │
│  │   useBuckets · useTotalCompletions · useJourneyMilestones      │   │
│  └────────────┬───────────────────────────────────────────────────┘   │
│               │ pure call / observable                                │
│  ┌────────────▼───────────────────────────────────────────────────┐   │
│  │ Domain (lib)    src/lib/                                       │   │
│  │   firebase  storage  notifications  errorAlert  completions    │   │
│  │   posthog  share  dates  validation  permissions  clockGuard   │   │
│  └─────┬───────────────┬───────────────┬───────────────┬──────────┘   │
│        │               │               │               │              │
│  ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼─────────┐    │
│  │ MMKV      │  │ Firestore   │  │ Expo      │  │ Reanimated /   │    │
│  │ (sync KV) │  │ (offline-Q) │  │ Notif (FCM│  │ react-native-  │    │
│  │  ADR-0002 │  │  ADR-0003   │  │  bridge)  │  │ svg / view-shot│    │
│  └───────────┘  └──────┬──────┘  └───────────┘  └────────────────┘    │
└────────────────────────┼──────────────────────────────────────────────┘
                         │
            ┌────────────┴─────────────┐
            ▼                          ▼
   ┌──────────────────┐       ┌──────────────────┐
   │  Firebase prod   │       │     PostHog      │
   │  Auth · Firestore│       │  events + cohort │
   │  Storage · FCM   │       │  + session replay│
   │  Crashlytics     │       │  (US region)     │
   │  Analytics       │       │   ADR-0004       │
   └──────────────────┘       └──────────────────┘
```

## 3. Layers

K-Journey is intentionally a **3-layer app** with a clear contract at each seam.

### 3.1 Presentation — `app/`

* **What it owns:** screens, routing, UI composition, the visible behaviour of taps.
* **What it consumes:** hooks (it never imports `src/lib/firebase.ts` directly).
* **What it does not do:** persistence, network, business math.
* **File-based routing** via Expo Router. Groups `(onboarding)` and `(tabs)` map to PRD §4 and §5–§10 respectively.
* **ErrorBoundary** lives at `app/_layout.tsx` (root) — catches render errors only, not async (those flow through `showOperationError` per ADR-0012).

### 3.2 Composition — `src/hooks/`

* **What it owns:** stateful glue between Firestore snapshots, MMKV caches, and screens.
* **What it consumes:** `src/lib/*` and React.
* **Pattern:** each hook returns `{ data, loading, error }` plus mutators. Snapshot subscriptions are torn down on unmount.
* **No screen logic.** A hook does not know which screen called it.

### 3.3 Domain — `src/lib/`

* **What it owns:** Firestore CRUD, MMKV wrappers, telemetry, dates, validation, permissions, error handling.
* **What it consumes:** native modules and pure helpers.
* **Pure functions where possible** (`completions.ts`, `dates.ts`, `validation.ts`). Side effects are isolated in `firebase.ts`, `notifications.ts`, `share.ts`, `permissions.ts`, `clockGuard.ts`.

### 3.4 Static data — `src/data/`

* `missions.ts` (50 Have-To missions, tagged by phase / category / `appliesTo` per ADR-0010)
* `universities.ts` (9 Seoul universities)
* `bucketTemplates.ts` (6 Want-To themes)
* `emergency.ts` (numbers, phrases, references)

### 3.5 Theme — `src/theme/`

* `eras.ts` — three era variants (joseon / silla / goryeo). Each defines a colour palette, label set, and which 8 byeongpung PNGs to load.
* `ThemeProvider.tsx` — React context wrapper.

## 4. External dependencies map

| External | Layer that touches it | Purpose | ADR |
|---|---|---|---|
| `@react-native-firebase/auth` | `src/hooks/useAuth.ts`, `src/lib/firebase.ts` | Sign-in (Apple + Google) | [0003](../adr/0003-firebase-rn-modular-sdk.md), [0013](../adr/0013-apple-primary-google-deferred.md) |
| `@react-native-firebase/firestore` | `src/lib/firebase.ts` | User progress, profile, buckets | [0003](../adr/0003-firebase-rn-modular-sdk.md), [0021](../adr/0021-firestore-rules-acl-model.md) |
| `@react-native-firebase/storage` | (future) `src/lib/share.ts` | Byeongpung export uploads | — |
| `@react-native-firebase/messaging` | `src/lib/notifications.ts` | FCM bridge for push | [0015](../adr/0015-behavior-triggered-push-only.md) |
| `@react-native-firebase/crashlytics` | `src/lib/errorAlert.ts`, hooks | Crash & error recording | [0012](../adr/0012-async-mutator-error-contract.md) |
| `@react-native-firebase/analytics` | `app/_layout.tsx` boot | Secondary analytics + Crashlytics correlation | [0005](../adr/0005-firebase-analytics-secondary.md) |
| `react-native-mmkv` | `src/lib/storage.ts` | Sync local KV cache | [0002](../adr/0002-mmkv-over-hive-for-cache.md), [0023](../adr/0023-mmkv-key-versioning-migration.md) |
| `posthog-react-native` | `src/lib/posthog.ts` | Primary product analytics | [0004](../adr/0004-posthog-primary-analytics.md) |
| `expo-apple-authentication` | `app/(onboarding)/sign-in.tsx` | Apple Sign-In nonce | [0013](../adr/0013-apple-primary-google-deferred.md) |
| `@react-native-google-signin/google-signin` | (Part H) | Google Sign-In | [0013](../adr/0013-apple-primary-google-deferred.md) |
| `expo-notifications` | `src/lib/notifications.ts` | Scheduling, permissions | [0015](../adr/0015-behavior-triggered-push-only.md) |
| `expo-sharing` + `expo-media-library` + `react-native-view-shot` | `src/lib/share.ts` | Byeongpung export | — |
| `react-native-reanimated` | `src/components/mission/MissionCompleteOverlay.tsx`, byeongpung anim | UI animations | [0019](../adr/0019-reanimated-worklet-inline-rule.md) |
| `react-native-svg` | `src/components/byeongpung/*` (UI chrome) | Decorative SVG | [0008](../adr/0008-byeongpung-png-not-svg.md) (panels are PNG, not SVG) |
| `date-fns` + `date-fns-tz` | `src/lib/dates.ts` | KST helpers | [0022](../adr/0022-kst-timezone-single-source.md) |
| `lucide-react-native` | UI icons | Functional iconography (1.5px stroke) | — |

## 5. Caching strategy

K-Journey is **offline-first by default**. The contract:

1. **Read:** MMKV first → Firestore snapshot when online (delivers fresher data + subscribes to changes).
2. **Write:** local optimistic update (MMKV) → Firestore (which queues offline if needed). Server timestamp wins on conflict (ADR-0022, last-write-wins per PRD §11.2).
3. **Cache invalidation:** on `signOut`, MMKV user-scoped keys are cleared (`useAuth.signOut`). Public catalogues stay cached.

Cache layers (read order):

```
┌────────────────┐    ┌──────────────────┐    ┌───────────────────┐
│ React state    │ →  │ MMKV (sync)      │ →  │ Firestore snapshot│
│ (hook return)  │    │ ADR-0002         │    │ (online or queue) │
└────────────────┘    └──────────────────┘    └───────────────────┘
        ▲                       │                       │
        │                       └───── populated  ◀─────┘
        │       useEffect re-render on snapshot
        └──────────────────────────────────────────────────────
```

## 6. State management

**No Redux. No Zustand. Hooks + MMKV + Firestore snapshots only.**

* Local UI state (selected era, current phase tab) lives in component state or hook return values.
* Persistent state lives in MMKV or Firestore.
* "Reactive" reads use `useMMKVBoolean` / `useMMKVString` (for `dev:mockAuth` and similar) or Firestore `onSnapshot` (for user progress).
* No global state container. The cost would exceed the savings at MVP scale.

## 7. Cross-cutting concerns

### 7.1 Error handling
* **Async failures:** all mutators wrapped in `try/catch` → `showOperationError(action, error)` (`src/lib/errorAlert.ts`) → Alert + Crashlytics. ADR-0012, CLAUDE.md MUST #17.
* **Render errors:** root `ErrorBoundary` in `app/_layout.tsx`. Route-level boundaries added in Part E.4 (Round 2).
* **Empty catches:** forbidden without a `// intentional swallow: <reason>` comment.

### 7.2 Telemetry
* **PostHog primary** (`src/lib/posthog.ts`). 17 typed `KJEvent` values; PRD §16 is the canonical schema.
* **Firebase Analytics** auto-collects `screen_view` and `first_open` for App/Play Console funnels.
* **Crashlytics** records exceptions (PII filtered: `setUserId(uid)` only).
* **`trackOnce(event, key)`** helper (Part F) prevents duplicate fires in the same session (e.g. DDayBanner milestone view).

### 7.3 Accessibility
* All interactive components carry `accessibilityLabel` + `accessibilityRole` + `accessibilityState` (Part G).
* `useReduceMotion()` swaps the mission-complete animation for a cross-fade.
* Dynamic Type ±2 supported by default — tested in `docs/ACCESSIBILITY.md` checklist.
* See ADR-0025 and `docs/ACCESSIBILITY.md`.

### 7.4 i18n & time
* MVP English only. Korean proper nouns in parentheses (ADR-0018).
* Time is **KST single source of truth** (ADR-0022). Helpers in `src/lib/dates.ts`.
* See `docs/I18N_TIMEZONE.md`.

### 7.5 Logging
* No central logger. `console.warn` is used sparingly in hooks for development. In production these are forwarded to Crashlytics via `showOperationError`.

## 8. Threat model (summary)

| Threat | Surface | Mitigation |
|---|---|---|
| User A reads User B's progress | Firestore | `firestore.rules` `isOwner(uid)` — ADR-0021 |
| Anonymous client writes user data | Firestore | `isSignedIn()` checks `firebase.sign_in_provider in ['apple.com','google.com']` |
| PII in Crashlytics / PostHog | Telemetry | `setUserId(uid)` only; never email/displayName/coordinates. `docs/SECURITY.md` §PII |
| Clock manipulation gives early phase | App | KST helpers + `serverTimestamp()` for write timestamps. `clockGuard.ts` records skew. ADR-0022 |
| Public catalogue write spam | Firestore | Catalogues are `write: if false` |
| Apple Sign-In token replay | Auth | Nonce verification handled by Firebase Auth |
| MMKV cache corruption → infinite crash | Local storage | `getJson` returns null on parse failure; migrations back up and reset corrupted keys. ADR-0023 |
| Secrets in repo | Build | `.env`, `GoogleService-Info.plist`, `google-services.json` in `.gitignore`. EAS Secrets for prod. `docs/SECURITY.md` |

## 9. Module ownership

See [`MODULE_OWNERSHIP.md`](MODULE_OWNERSHIP.md) for the full table.

## 10. ADR index

See [`docs/adr/README.md`](../adr/README.md).

## 11. Next steps (V1.1+ architectural backlog)

* Cloud Functions for server-side push token rotation and exported-byeongpung email delivery (currently client-only).
* Expo Updates (OTA) with strict opt-in per ADR-0026.
* Detox or Maestro for E2E coverage (currently sim QA only).
* Sentry alongside Crashlytics if `recordError` data turns out too coarse.
