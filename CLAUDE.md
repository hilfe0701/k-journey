# CLAUDE.md — K-Journey project rules

This file is loaded automatically into every Claude Code session in this repo.
It encodes decisions that have already been made. Don't relitigate them.
For full context: read `reference/K-Journey_PRD_v1_1_KR.md` (product, current),
`docs/architecture/ARCHITECTURE.md` (system), `docs/adr/README.md` (decisions),
and `DESIGN.md` (visual system).

---

## Source-of-truth files

| File | What it owns |
|---|---|
| `reference/K-Journey_PRD_v1_1_KR.md` | **Current PRD (v1.2 in-place revision, 2026-05-14, Wave 1 morning + Wave 2 evening).** Phases, missions, KPIs, error/edge cases, security, a11y, i18n, performance, build/release, ops, **empty state (§4.5)**, **aha-moment (§4.6)**, **profile/dates/era edit (§4.7)**, **push copy templates (§7.8)**, 4-tier error tree (§11.4), Reduce Motion + VoiceOver (§11.6.1-2), **Settings (§11.11)**, **Account/GDPR (§11.12)**, **Haptics·Offline·Photo (§11.13)**, dark mode explicit reject (§13.2 + ADR-0035). |
| `reference/K-Journey_PRD_v1_0_KR.md` | Historical reference only — superseded by v1.1 on 2026-05-13, then v1.2 on 2026-05-14. |
| `docs/architecture/ARCHITECTURE.md` | System layers, data flow overview, threat model, ADR index. |
| `docs/architecture/DATA_FLOW.md` | Five core sequence diagrams (sign-in, mission complete, offline sync, panel unlock, era switch). |
| `docs/architecture/MODULE_OWNERSHIP.md` | Per-module responsibility / side effects / dependency table. |
| `docs/adr/README.md` | 35 ADR index — *why* the codebase looks the way it does. |
| `docs/SECURITY.md` | Threat model, Firestore Rules, PII classification, key rotation. |
| `docs/ACCESSIBILITY.md` | WCAG 2.1 AA commitment + per-component checklist. |
| `docs/I18N_TIMEZONE.md` | English-first + Korean parenthetical rule + **KST single source of truth**. |
| `docs/EDGE_CASES.md` | Feature × failure-mode matrix with code pointers. |
| `docs/ANALYTICS_SCHEMA.md` | Canonical `KJEvent` schema + dedupe rules + **UX KPIs (§10)**. |
| `docs/MICROCOPY.md` | **Voice/tone, English-Korean pairing, length budgets, button/loading/celebration templates, voice review checklist.** Authority for every user-facing string. |
| `docs/ERROR_MESSAGES.md` | **Master error copy catalog** — code → tier (T1 toast / T2 modal / T3 settings / T4 banner) → title/body/CTA. `showOperationError` master table. |
| `docs/EMPTY_STATES.md` | **Per-screen empty state spec** — home, bucket, gallery, byeongpung, search, universities. Implementation guide for ADR-0027. |
| `docs/PUSH_COPY.md` | **Push notification copy catalog** — 3 push types · 7 unique strings · max 14 fires per user lifecycle. Implementation guide for ADR-0029. |
| `docs/SETTINGS.md` | **Settings screen master spec** — 5 categories (Notifications / Era / Profile / Account / About) × per-row table (label / control / default / change behavior / storage). Implementation guide for ADR-0032. |
| `docs/OPERATIONS.md` / `RELEASE.md` / `INCIDENT_RESPONSE.md` / `MONITORING.md` / `TESTING.md` / `PERFORMANCE.md` | Runbooks. INCIDENT_RESPONSE includes user notification templates §8.4-8.6. TESTING includes usability checklist §9. |
| `firestore.rules` | Firebase Firestore security rules (ADR-0021). |
| `DESIGN.md` | Brand essence, color tokens, type scale, motion, state variants (§14), microcopy summary (§16), **Settings pattern (§17)**, **Account management (§18)**, **Permission primer universal (§19)**, **Photo & sharing (§20)**, **Offline & sync conflict visuals (§21)**. |
| `design-tokens.ts` | Color/space/radius/elevation/typography token values. |
| `src/theme/eras.ts` | The three era variants (joseon/silla/goryeo). |
| `src/data/*.ts` | Missions (50), universities (9), emergency, bucket templates. |
| `reference/K-Journey Prototype.html` | Visual reference only — never copy implementation logic. |

---

## Stack (locked)

- **React Native + Expo** managed workflow with EAS Build
- **TypeScript strict** mode
- **Expo Router** file-based routing (Stack + Tabs)
- **Firebase** (`@react-native-firebase/*`) — Auth, Firestore, Storage, Messaging, Analytics, Crashlytics
- **PostHog** for product analytics (session replay, funnels, cohorts)
- **MMKV** for offline cache
- **Reanimated 3** for animation
- **react-native-svg** for byeongpung artwork
- **Lucide** icons (1.5px stroke)
- **Pretendard** (UI) + **Noto Serif KR** (display) — only two font families

---

## MUST do

1. **Use design tokens.** Every color value must come from `palette`, `semantic`,
   `phaseColors`, `categoryColors`, or the active era. Never hardcode hex.
2. **Body weight is 500.** Never 400. Headings 600 or 700. (Same philosophy as
   Airbnb Cereal; Korean glyphs need the extra weight to harmonize with Latin.)
3. **English first, Korean in parentheses for proper nouns.** Format:
   `Try Tteokbokki (떡볶이)`, `Visit Gwangjang Market (광장시장)`.
4. **Sentence case** for all UI labels and body. Korean follows natural
   Korean capitalization. Only `<Badge>` micro labels (11–12px) use ALL CAPS.
5. **Mission cards = icon + category color.** No listing-card photos. The
   prototype style (44×44 colored icon square + title + summary) is the contract.
6. **Phase = date-based with manual override.** `usePhase.ts` is the only
   place that computes phase. Manual override stored under `phase:override` MMKV key.
7. **Track every key user action** via PostHog (`track(eventName, props)`). The
   typed `KJEvent` union in `src/lib/posthog.ts` is the allowed event set —
   add new events to that union before using them.
8. **Use Lucide icons** for all functional iconography. 1.5–1.7px stroke. The
   six minhwa motifs (peony/tiger/crane/lotus/chaekgeori/sansuhwa) are SVG
   illustration only — never used as functional icons.
9. **Era switching preserves progress.** When the user switches era, only the
   byeongpung art re-renders; `completedMissions` count stays.
10. **Push notifications are behavior-triggered only.** D-30, D-14, D-7,
    phase boundary crossings, and panel unlocks. Schedule them through
    `src/lib/notifications.ts`.
11. **Era artwork is 8 panels.** Always 8, never 6 or 10. `panelReveal(i) =
    clamp((completedCount - i*6) / 6, 0, 1)`.
12. **Read DESIGN.md** before adding any new component. Use existing
    primitives in `src/components/ui/` first; build new ones only if
    composition fails.
13. **Safe-area aware.** All top-level screens wrap in `SafeAreaView` with
    appropriate `edges` to avoid notch/island overlap.
14. **Gate every panel-unlock celebration through `claimPanelUnlock(n)`**
    (`src/lib/notifications.ts`). It returns `true` only the first time
    panel `n` is crossed; the call site then fires the overlay, the
    `panel_unlock` analytics event, and `firePanelUnlock` notification.
    Without this gate, toggling an item off and back on re-fires everything.
    Backed by MMKV `KEYS.firedPanelUnlocks`; cleared on dev-mock signOut.
15. **Tag housing-specific missions** with `appliesTo: 'dormitory' | 'off-campus'`
    in `src/data/missions.ts`. Omitting the field means the mission applies
    to both. Always render the home list via `missionsForHousing(housing)` —
    never iterate `MISSIONS` directly when computing visible counts or the
    DDayBanner denominator.
16. **All total-completion counts** flow through `aggregateCompletions`
    (`src/lib/completions.ts`) or its hook wrapper `useTotalCompletions`.
    Panel-unlock thresholds, byeongpung reveal, and the gallery summary
    all read from this single source so missions + bucket items stay in sync.
17. **Wrap every async mutator in `try / catch` with `showOperationError`**
    (`src/lib/errorAlert.ts`). The helper alerts the user and forwards to
    `crashlytics().recordError`. Silent network failures leave the user
    tapping a button that appears to do nothing.
18. **Run `npm run check` before declaring work done.** It chains
    `tsc --noEmit`, `expo lint`, and `jest`. Pure-logic helpers
    (`calcPhase`, `panelReveal`, `getInkColor`, `missionsForHousing`,
    `aggregateCompletions`, `claimPanelUnlock`) all have unit tests —
    extend them when changing the contract.
19. **All times MUST use KST helpers** from `src/lib/dates.ts`
    (`kstNow`, `toKstStartOfDay`, `kstDifferenceInDays`, `scheduleAtKstMorning`).
    Phase math, D-Day counters, and notification schedules all anchor to
    Korea Standard Time (UTC+9) regardless of device locale. Per ADR-0022
    and `docs/I18N_TIMEZONE.md`. Mission completion times use Firestore
    `serverTimestamp()` so clock manipulation can't game D-Day.
20. **All interactive UI elements MUST carry a11y props** —
    `accessibilityLabel` + `accessibilityRole` + `accessibilityState`
    where applicable. Per ADR-0025 and `docs/ACCESSIBILITY.md` per-component
    checklist. Touch targets ≥ 44×44 pt. Reduce-Motion alternate for the
    mission-complete choreography.
21. **Boot path runs migrations + clock guard** at module load in
    `app/_layout.tsx`. `runMigrations()` and `checkClockSkew()` are sync
    MMKV operations that MUST precede any hook reading MMKV. Per ADR-0022
    and ADR-0023.

---

## NEVER do

1. **NEVER hardcode hex colors.** Reach for `palette.X` first.
2. **NEVER use 400 weight body text.** Default body is 500.
3. **NEVER use emoji.** Minhwa motifs and Lucide icons cover all needs.
4. **NEVER use ALL CAPS** outside the badge component.
5. **NEVER add gradient backgrounds.** The only allowed gradient is the
   K&#x2013;Journey wordmark treatment.
6. **NEVER use glass morphism, frosted blur, or backdrop blur effects.**
7. **NEVER use spring physics or bouncy animations.** Easing is `ease-out` for
   hovers (200ms) and `ease-in-out` for panels (300ms). The mission-complete
   animation uses `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
8. **NEVER overlay text on photographs.** No gradient scrims, no captions over images.
9. **NEVER add a fourth era.** Only joseon/silla/goryeo.
10. **NEVER make Korean the primary UI language** in the MVP. English first.
11. **NEVER reintroduce the "여정 / 정수 / 궁" Airbnb-style product tiers.**
    That model was explicitly discarded — K-Journey is curation, not a marketplace.
12. **Google sign-in is wired (2026-05-22)** via `@react-native-google-signin/google-signin` —
    `webClientId` comes from `app.config.ts` → `extra` per env, `iosUrlScheme`
    from the appended config plugin. dev has real OAuth IDs; **prod/staging are
    `TODO_FILL_FROM_*` placeholders.** NEVER ship Google sign-in for an env until
    its OAuth IDs are filled, the build's Android SHA-1 is registered in that
    Firebase project, and Google is enabled as an Auth provider. Do NOT re-add
    the old placeholder alert.
13. **NEVER use the Firebase web SDK** (`firebase` npm package). We use
    `@react-native-firebase/*` exclusively.
14. **NEVER auto-switch to the gallery** when the departure date passes. Show a
    prompt: "Your journey is complete — open your gallery?"
15. **NEVER schedule daily, weekly, or marketing push notifications.**
    Behavior-triggered only.
16. **NEVER commit `GoogleService-Info.plist`, `google-services.json`, or `.env`.**
    They're in `.gitignore` for a reason.
17. **NEVER add a CSS framework** (Tailwind, styled-components, NativeWind).
    We use inline RN styles + design tokens.
18. **NEVER copy implementation from `reference/K-Journey Prototype.html`.**
    It's a single-file React web prototype. Use it only to confirm visual intent.
19. **NEVER bypass the type system** with `// @ts-ignore` or `as any` to silence
    legitimate errors. The PostHog property cast is the only sanctioned `as any`.
20. **NEVER add a new color outside the obangsaek palette** without updating
    `DESIGN.md` and `design-tokens.ts` first.
21. **NEVER use system `Date` / `new Date()` / `startOfDay` directly for phase
    or D-Day math.** Always go through the KST helpers in `src/lib/dates.ts`
    (`kstNow`, `toKstStartOfDay`, `kstDifferenceInDays`, `scheduleAtKstMorning`).
    Per ADR-0022. Server-side timestamps for writes use Firestore
    `serverTimestamp()` so clock manipulation can't game D-Day.
22. **NEVER swallow an `async` mutator error silently.** Empty `catch {}`
    blocks require a `// intentional swallow: <reason>` comment. Per
    ADR-0012. The standard surface is `showOperationError(action, error)`
    (`src/lib/errorAlert.ts`).
23. **NEVER bypass `claimPanelUnlock(n)` when firing the celebration overlay,
    `panel_unlock` analytics, or panel-unlock notification.** All three MUST
    only fire when `claimPanelUnlock` returns true. Per ADR-0009.

---

## Mission completion choreography (do not modify lightly)

The four-stage animation is the brand's hero moment. Timings:

| Stage | Window | Effect |
|---|---|---|
| 1 cardSink | 0–400ms | scale 1→0.92, opacity 1→0, translate Y +20 |
| 2 inkRingOut | 400–520ms | 4 concentric circles, 120ms stagger |
| 3 panelReveal | 400–1200ms | clipPath circle 0→200%, easing `(0.25, 0.46, 0.45, 0.94)` |
| 4 fadeUpIn | 1200–2200ms | "Panel N unlocked" text fade up |

Total ~2.4s. If you need to change any timing, update `motion.missionComplete`
in `design-tokens.ts` and DESIGN.md §7.1 in the same commit.

---

## Phase computation contract

```ts
// usePhase.ts — date-based, with MMKV override
today < arrivalDate                       → 1 (pre-arrival)
arrivalDate ≤ today ≤ arrivalDate + 7d    → 2 (first week)
arrivalDate + 8d ≤ today ≤ depart - 21d   → 3 (living)
depart - 20d ≤ today ≤ departureDate      → 4 (pre-departure)
```

Manual override (set via `setPhaseOverride(phase)`) wins until cleared.
`Home.tsx` calls `setPhaseOverride(p)` when the user taps a phase tab outside
the computed phase, and `setPhaseOverride(null)` when they tap back.

---

## Open decisions (please confirm)

1. ~~App icon, splash image, adaptive icon~~ — **Decided 2026-05-08: Gemini-
   generated, 3-person team handoff in flight.** Concept locked: square 도장
   (印) seal, vermilion #C5302A background, white "K" in 전서체 seal-script.
   Splash = enlarged centered seal on hanji #FDFAF3. Full asset list and
   prompts in `AI_IMAGE_PROMPTS.md` at repo root. Status: awaiting team
   delivery (임선균 12장 / 정진우 12장 / 최민희 11장). **Bigger architectural
   decision in same brief**: byeongpung panels go from SVG (`motifs.tsx`
   with `currentColor`) to **PNG full-paintings, era-specific** (24 panels =
   3 eras × 8 motifs). When assets land, `motifs.tsx`, `ByeongpungStrip`,
   `gallery.tsx` panel renderers, and `getInkColor()` need a rewrite —
   panel backgrounds and stroke colors are baked into the PNG, code just
   shows the image. Functional icons stay Lucide (no scope change to
   MUST #8). See `project_image_gen_briefing_2026_05_08` memory.
2. **Production Firebase project** — `k-journey` is **dev** (confirmed
   2026-05-05). Production project does **not** exist yet. **Env-separation
   code scaffolded 2026-05-22 (prod-add scope, ADR-0024):** `app.config.ts`
   layers over `app.json`, branching Firebase config + `extra.environment` on
   `APP_ENV` (default `dev`, so dev is untouched — keeps `com.kjourney.app` +
   `k-journey`). `eas.json` adds `dev`/`preview`/`production` profiles;
   `firebase.json` enables Firestore-rules deploy. **Remaining (external):**
   create `k-journey-prod` in Firebase Console → register iOS+Android apps
   under `com.kjourney.app` → drop configs into `config/firebase/*.prod.*`
   (gitignored) → enable Apple+Google Auth → Firestore (prod mode) + deploy
   rules → `eas init` to replace `PLACEHOLDER_EAS_PROJECT_ID`. dev & prod
   share the bundle id by decision (no side-by-side install); add `.dev`
   suffix + EnvironmentBanner later for full isolation. See
   `project_env_separation_prod_add_2026_05_22` memory.
3. ~~PostHog region~~ — **Decided 2026-05-04: US region** (`us.i.posthog.com`).
   GDPR not required for Korean-user app, default is fine.
4. **App Store / Play Store developer accounts** — exist already? Different
   bundle IDs per environment (dev/staging/prod) are easier to set up before
   prebuild than after.
5. ~~Anonymous sign-in retention~~ — **Decided 2026-05-04: members-only.**
   Anonymous/guest sign-in is removed. Apple + Google only. The byeongpung
   is meant to be a 4-month artifact, so account-bound storage is the
   product promise. Do **not** add `signInAnonymously()` back.
