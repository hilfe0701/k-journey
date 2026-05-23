# Module Ownership

> One-row-per-module table. Each row states the module's responsibility, side effects, dependencies, and the ADR(s) that govern its design. A module that changes scope without updating this table is drifting.

For overview, see [`ARCHITECTURE.md`](ARCHITECTURE.md). For runtime sequences, see [`DATA_FLOW.md`](DATA_FLOW.md).

## Domain layer — `src/lib/`

| Module | Responsibility | Side effects | Dependencies | Governing ADRs |
|---|---|---|---|---|
| `firebase.ts` | Firestore CRUD (profile, missions, buckets). `isDevMock` branches every mutator to MMKV when active. Uses `serverTimestamp()` for write times. | Firestore writes; MMKV writes (dev-mock only) | `@react-native-firebase/firestore`, `./storage` | [0003](../adr/0003-firebase-rn-modular-sdk.md), [0006](../adr/0006-dev-mock-bypass-pattern.md), [0022](../adr/0022-kst-timezone-single-source.md) |
| `storage.ts` | Sync MMKV wrapper. Owns `KEYS` table (versioned). `getJson`/`setJson` return null on corruption. | Local disk | `react-native-mmkv` | [0002](../adr/0002-mmkv-over-hive-for-cache.md), [0023](../adr/0023-mmkv-key-versioning-migration.md) |
| `storage/migrations.ts` | Versioned migration runner. Boot-time. Backs up & resets corrupt keys. | MMKV writes | `./storage` | [0023](../adr/0023-mmkv-key-versioning-migration.md) |
| `notifications.ts` | Schedule push (D-30/14/7, phase boundary, panel unlock single-fire). `claimPanelUnlock(n)` is the single-fire gate. Reads KST helpers for fire dates. | OS notifications; MMKV `firedPanelUnlocks` | `expo-notifications`, `./storage`, `./dates` | [0009](../adr/0009-single-fire-panel-unlock.md), [0015](../adr/0015-behavior-triggered-push-only.md), [0022](../adr/0022-kst-timezone-single-source.md) |
| `errorAlert.ts` | `showOperationError(action, error)` — Alert + Crashlytics. The single async-failure surface. | Alert UI; Crashlytics | `@react-native-firebase/crashlytics`, `react-native` | [0012](../adr/0012-async-mutator-error-contract.md) |
| `completions.ts` | Pure: `aggregateCompletions(missions, buckets)`. Counts that feed panel-unlock thresholds, byeongpung reveal %, and gallery summary. | None | `./missions`, `./buckets` types | [0011](../adr/0011-single-source-completion-aggregation.md) |
| `share.ts` | View capture → file → Sharing dialog → fallback save-to-library. Resilient: Alert on capture failure, double-attempt on save. | Filesystem, media library, share sheet | `react-native-view-shot`, `expo-sharing`, `expo-media-library` | — |
| `posthog.ts` | PostHog init, `track`, `identify`, `reset`. KJEvent union enforces typed events. | PostHog API | `posthog-react-native` | [0004](../adr/0004-posthog-primary-analytics.md) |
| `telemetry/index.ts` (Part F) | `trackOnce(event, dedupeKey)` wrapper. Prevents duplicate fires in a session. | PostHog API + session-scoped Set | `./posthog` | [0004](../adr/0004-posthog-primary-analytics.md) |
| `dates.ts` (Part E.1) | KST helpers: `kstNow`, `toKstStartOfDay`, `kstDifferenceInDays`, `scheduleAtKstMidnight`. | None (pure) | `date-fns`, `date-fns-tz` | [0022](../adr/0022-kst-timezone-single-source.md) |
| `validation.ts` (Part E.2) | `validateDates(arrival, departure)` returns `DateValidationError \| null`. Used at the onboarding boundary. | None (pure) | `./dates`, `date-fns` | [0022](../adr/0022-kst-timezone-single-source.md) |
| `permissions.ts` (Part E.7) | `usePushPermissionWatcher` hook — on app foreground, re-checks notification permission and reschedules if newly granted. | telemetry, notifications scheduling | `expo-notifications`, `./posthog` | [0015](../adr/0015-behavior-triggered-push-only.md) |
| `clockGuard.ts` (Part E.8) | Detects ≥ ±2-day jumps between boots. Records to Crashlytics + telemetry. Never blocks the UI. | Crashlytics + telemetry | `./posthog`, `./storage` | [0022](../adr/0022-kst-timezone-single-source.md) |
| `a11y.ts` (Part G) | `useReduceMotion()` — subscribes to `AccessibilityInfo`. | None | `react-native` | [0025](../adr/0025-accessibility-wcag-2-1-aa.md) |
| `icons.ts` | Re-exports Lucide icons with default props (1.5–1.7 px stroke). | None | `lucide-react-native` | — |

## Composition — `src/hooks/`

| Hook | Returns | Subscribes to | Side effects | Notes |
|---|---|---|---|---|
| `useAuth` | `{ initializing, user, signOut }` | Firebase `onAuthStateChanged`, MMKV `devMockAuth` | Crashlytics on errors; telemetry `sign_in`/`sign_out` | Dev-mock branch returns fixture user. ADR-0006. |
| `usePhase` | `{ phase, override, setPhaseOverride }` | `kstNow()` + arrival/departure from profile | MMKV (`phase:override`) | Uses KST helpers post-Part E.1. ADR-0022. |
| `useProfile` | `{ profile, loading, error }` + mutators | Firestore `onSnapshot(users/{uid})`, MMKV cache | MMKV write of latest snapshot | Snapshot error surfaces `error` to UI (Part E.4). |
| `useCompletedMissions` | `{ missions, loading, error, mark, unmark }` | Firestore subcollection snapshot, MMKV | MMKV cache | ADR-0010 + ADR-0011 contracts. |
| `useBuckets` | `{ buckets, loading, error, create, addItem, toggleItem, deleteItem, deleteBucket }` | Firestore subcollection snapshot, MMKV | MMKV cache | All mutators wrapped per ADR-0012. |
| `useTotalCompletions` | `{ missionCount, bucketItemCount, total }` | `useCompletedMissions` + `useBuckets` | None (pure composition) | Wraps `aggregateCompletions`. ADR-0011. |
| `useJourneyMilestones` | `{ phase, lastSeenPhase }` + dispatch | `usePhase` + MMKV `lastSeenPhase` | Telemetry `phase_transition` on detected change | Phase-transition event source (Part F). |

## Presentation — `app/`

| File | Screen role | Mutates | Subscribes |
|---|---|---|---|
| `app/_layout.tsx` | Root: fonts, theme, AuthGate, ErrorBoundary, splash gate, `runMigrations` (Part E.5), permission watcher (Part E.7) | — | useAuth, useProfile (for redirect) |
| `app/(onboarding)/splash.tsx` | First-paint splash + era init | — | — |
| `app/(onboarding)/sign-in.tsx` | Apple / Google sign-in | useAuth | — |
| `app/(onboarding)/dates.tsx` | Arrival + departure pickers, validation, schedule push | `updateUserProfile`, `rescheduleAllNotifications` | useProfile |
| `app/(onboarding)/profile.tsx` | University + housing | `updateUserProfile` | useProfile |
| `app/(onboarding)/era.tsx` | Era pick (joseon/silla/goryeo); commits onboarding | `updateUserProfile` | useProfile |
| `app/(tabs)/index.tsx` | Home: D-Day banner + Phase tabs + filtered mission list | `setPhaseOverride` | useProfile, usePhase, useTotalCompletions, useCompletedMissions |
| `app/(tabs)/byeongpung.tsx` | 8-panel byeongpung with reveal anim + share/save | `share`, `save` | useProfile (era), useTotalCompletions |
| `app/(tabs)/wantto.tsx` | Want-To buckets list, navigate to bucket detail | — | useBuckets |
| `app/(tabs)/more.tsx` | Settings: era switch, sign-out, emergency entry, gallery entry | `updateUserProfile` (era), `useAuth.signOut` | useProfile, useAuth |
| `app/mission/[id].tsx` | Mission detail + complete button + claimPanelUnlock | `markMissionComplete`, `unmarkMission` | useCompletedMissions |
| `app/bucket/[id].tsx` | Bucket detail + add/toggle/delete items + claimPanelUnlock | `addBucketItem`, `toggleBucketItem`, `deleteBucketItem` | useBuckets |
| `app/bucket/new.tsx` | Create bucket from template | `createBucket` (`bucket_create` telemetry — Part F) | — |
| `app/gallery.tsx` | Completed byeongpung gallery (post-departure mode) | — | useProfile, useTotalCompletions |
| `app/emergency.tsx` | Emergency phrases + numbers | — | (static data) |
| `app/campus.tsx` | University-specific tips | — | useProfile, (static data) |

## Component primitives — `src/components/`

| Component | Layer | Responsibility |
|---|---|---|
| `ui/Button.tsx` | UI | Tokenised button. a11y label+role+state per ADR-0025. |
| `ui/Card.tsx` | UI | Tokenised card; can be pressable (then carries `accessibilityRole='button'`). |
| `ui/Text.tsx` | UI | Tokenised text. Default `allowFontScaling=true` except `<Badge>` micro. |
| `ui/Badge.tsx` | UI | The single component allowed ALL CAPS (CLAUDE.md MUST #4). |
| `ui/ProgressBar.tsx` | UI | Token-only colours. |
| `ui/Input.tsx` | UI | Form input. |
| `home/DDayBanner.tsx` | Home | KST-aware D-Day display. Fires `dday_milestone_view` once per milestone (Part F). |
| `home/PhaseTabs.tsx` | Home | Tab strip; `phase_manual_override` on tap. |
| `home/JourneyCompletePrompt.tsx` | Home | Post-departure prompt to open gallery (CLAUDE.md NEVER #14). |
| `mission/MissionCompleteOverlay.tsx` | Mission | 4-stage choreography (cardSink → inkRing → panelReveal → fadeUp). Reduce-motion swap (Part G). |
| `byeongpung/ByeongpungStrip.tsx` | Byeongpung | 8-panel strip; uses `<PanelImage>`. |
| `byeongpung/PanelImage.tsx` (Part E.6) | Byeongpung | `<Image>` with `onError` → ink-colour solid fallback. |
| `byeongpung/motifs.tsx` | Byeongpung | `BYEONGPUNG_PANEL_IMAGES[era][panel]` + `BUCKET_TEMPLATE_IMAGES`. PNG sources only. ADR-0008. |

## Static data — `src/data/`

| File | Shape | Consumers |
|---|---|---|
| `missions.ts` | `Mission[]` (~50). Each with `phase`, `category`, optional `appliesTo`. `missionsForHousing(housing)` filter helper. | `app/(tabs)/index.tsx`, `app/mission/[id].tsx`, DDayBanner denominator |
| `universities.ts` | `University[]` (9 Seoul universities). Names, housing info. | onboarding/profile, campus.tsx |
| `bucketTemplates.ts` | 6 template bucket themes with default item suggestions. | bucket/new.tsx |
| `emergency.ts` | Numbers (112/119/1345), embassies, phrases. | emergency.tsx |

## Theme — `src/theme/`

| File | Exports |
|---|---|
| `eras.ts` | `ERAS: { joseon, silla, goryeo }` — each with colour palette + label set + panel image source map. |
| `ThemeProvider.tsx` | React context wrapping the selected era + design tokens. |

---

## How to use this table

1. **Adding a new module:** add a row before merging. State responsibility, side effects, deps, ADRs.
2. **Removing a module:** delete the row in the same PR. If the module was load-bearing, write an ADR explaining removal.
3. **Refactoring scope:** if the *Responsibility* column changes, update it. If the new scope crosses a layer (e.g. a `lib/` file now manipulates UI state), reconsider the placement.
