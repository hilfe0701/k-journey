# K-Journey architecture

> Current local-first architecture, 2026-08-02.

## Runtime

```text
Expo Router routes
  ├─ onboarding
  ├─ Journey: Essentials / Culture
  ├─ Byeongpung
  ├─ Want to
  └─ More and detail routes
        ↓
hooks and domain rules
  ├─ conditionRules / taskState / departure rules
  ├─ usePhase / dates (KST)
  ├─ completions (missions + bucket items)
  └─ profile compatibility
        ↓
local persistence
  └─ MMKV (`k-journey`)
```

There is no account, Auth gate, per-user Firestore source of truth, Storage upload, or remote sync queue. `src/lib/firebase.ts` is a compatibility filename for the local persistence API.

## Layers

| Layer | Primary paths | Responsibility |
|---|---|---|
| Routes | `app/**` | navigation, screen composition, interaction |
| UI | `src/components/**`, `design-tokens.ts` | reusable presentation and accessibility |
| Domain | `src/lib/conditionRules.ts`, `taskState.ts`, `completions.ts`, `dates.ts` | deterministic business rules |
| Data | `src/data/**` | static missions, university, emergency, templates |
| State/hooks | `src/hooks/**`, `src/state/**` | reactive MMKV reads and derived state |
| Persistence | `src/lib/storage.ts`, `firebase.ts`, `storageMigrations.ts` | key ownership, verified local writes, migration/reset |
| Optional telemetry | `src/lib/posthog.ts`, Crashlytics call sites | allowlisted events and diagnostics |

## Invariants

- Unknown condition values remain explicit and are never converted to a guessed default.
- Administrative task completion is independent from cultural artwork progress.
- `cultureTotal = missions + completed bucket items` and only the first 48 affect 8-panel reveal.
- Date/phase calculations use KST helpers.
- Era changes do not mutate completion state.
- Raw profile answers and user-authored Want-to text do not leave the device through analytics.
- Failed persistence must not be shown as a successful mutation.

## Web

The web build is an Expo static export hosted as a single-page application with route rewrites. The app is centered in a maximum 760px shell on wide screens. Browser refresh preserves the requested detail route; native-only branded splash behavior must not replace web URLs.

## Native services

Expo notifications provide local reminders when permission is granted. View-shot, media library, and OS sharing create/save/share artwork at the user’s request. Crashlytics may collect diagnostics in a configured native build. These services are not a user-data sync architecture.

## Historical boundary

ADRs for Firebase Auth, Firestore ACL, server timestamps, offline sync queues, account deletion, and photo upload explain earlier designs only. Current authority is `DEC-040`, PRD v2.0, and ADR-0036.
