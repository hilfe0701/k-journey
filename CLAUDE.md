# CLAUDE.md — K-Journey project rules

This file is loaded automatically into every Claude Code session in this repo,
and `scripts/execute.py:188-190` injects it into **every harness step** as a guardrail.
It encodes the currently applicable constraints. It does not prevent redesign:
when a current DEC conflicts with a legacy ADR, follow the current DEC, record the
conflict, and update or supersede the ADR before implementation.
For full context: read `reference/K-Journey_PRD_v1_1_KR.md` (product, **legacy in part** —
see Decision precedence below), `docs/architecture/ARCHITECTURE.md` (system),
`docs/adr/README.md` (**legacy** decisions), and `DESIGN.md` (visual system).
For the current redesign, also read
`.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md`,
`.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md`, and
`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`.

---

## Decision precedence — read before every step (added 2026-07-27)

**Current DEC + current requirements/policy > legacy ADR** for redesign scope.
Security, accessibility, i18n, and platform constraints survive unless a DEC
explicitly changes them.

Basis: `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md`
and its raw table `.work/adr-dec-raw-v4.md` — **all 35 ADRs × all 27 DECs, exhaustively
compared** (2026-07-27).

| Verdict | Meaning | Count |
|---|---|---:|
| `뒤집힘` **superseded** | A current DEC voids this ADR. **Do NOT use it as an implementation basis.** | **13** |
| `유효` **still valid** | Unaffected by the redesign, or still holds. | 9 |
| `보강` **refined** | A current DEC narrows it. Both stay live. | 12 |
| `불명` **undetermined** | Not enough basis to judge. **Do not fix it as an implementation rule.** | 1 |

**Superseded (13):** `ADR-0006` `ADR-0008` `ADR-0009` `ADR-0010` `ADR-0011` `ADR-0013`
`ADR-0014` `ADR-0021` `ADR-0030` `ADR-0031` `ADR-0032` `ADR-0033` `ADR-0034`.
**Undetermined (1):** `ADR-0007` (cold-start splash — both of its premises, `AuthGate`
and byeongpung panel opacity, are gone; nothing in the current design says a
cold-start splash is still needed).

They converge on two things: **(a) strip the auth / server-user-data layer**
(`DEC-001`, `DEC-022` — both confirmed) and **(b) move the legacy product concept
`Memory` out of scope** (`DEC-024`, confirmed — `SUP-01` Campus guide, `MEM-01`
Cultural missions, `MEM-02` Byeongpung, `MEM-03` Gallery are all `Won't`).

> ⛔ **Superseded is not "delete".** `DEC-024` keeps those screens as `Won't`, not
> removed. **Do not delete ADR files, screen IDs, assets, or `docs/` pages.** Mark them
> legacy and stop using them as an implementation basis. The delete/keep call is
> deferred until real usage data exists (`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md` `DEC-024` fields 7 and 10).

> ⚠️ **This redesign is not "add a few condition axes".** `firestore.rules`,
> `src/lib/firebase.ts`, `src/hooks/useAuth.ts`, `app/(onboarding)/sign-in.tsx`,
> `docs/SECURITY.md`, `docs/PLAY_DATA_SAFETY.md` are all in scope. A step planned
> around the rule engine alone will diverge.

### Isolation — confirmed and unconfirmed dependencies must not be mixed

Mixing them makes implementation start on top of an unconfirmed decision.
Source: `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` §4.

| DEC part | Target | In this implementation |
|---|---|---|
| **`DEC-026` deletions** — states `save_pending` / `sync_conflict`, transitions `E2`–`E6` | `ADR-0031` | ✅ **Confirmed (kept) — APPLY.** Strip remote-sync visuals and states. |
| **`DEC-026` additions** — state `save_failed`, transition `E8` | `ADR-0031` | ⛔ **ISOLATE.** Do not fix as an implementation basis until a separate session confirms it. |
| **`DEC-027`** — analytics event resolution, 3 rules | `ADR-0004`, `ADR-0005` | ⛔ **Sink wiring only; ISOLATE payload and cohort.** Do not fix condition-axis payloads before `DEC-027` is confirmed. |

> ⚠️ **Over-isolation is also a failure.** Deferring all of `DEC-026` revives the R02
> finding "a task completed offline must not be overwritten after reconnect"
> (grade **A**, cannot be rejected) — the *deletion* is what structurally satisfies it.
> **Apply the deletions, isolate only the additions.** Written as one cell, it is wrong.

Confirmed: `DEC-001`, `DEC-022`, `DEC-024`.
Unconfirmed: `DEC-025`, `DEC-026` (additions only), `DEC-027`.

### Out of scope for this pass

Store submission / release · user interviews (late August) · `I02` migration code
(0 real users → no basis; decide the default-value policy only) · the 8 deliverable
changes in `.work/pmjob/k-journey/44-k-journey-role-review-unscored-dec-2026-07-27.md` §5 · review-lane
re-review of `.work/adr-dec-raw-v4.md` · `V5` re-confirmation of `DEC-026` / `DEC-027`.

**Record everything skipped as "not done + why". Never leave a blank or an optimistic phrase.**

---

## Source-of-truth files

> ⛔ Rows marked **(legacy)** sit on superseded ADRs. Read them for history; **do not
> use them as an implementation basis** for this redesign. See Decision precedence above.

| File | What it owns |
|---|---|
| `reference/K-Journey_PRD_v1_1_KR.md` | **Current PRD (v1.2 in-place revision, 2026-05-14, Wave 1 morning + Wave 2 evening).** Phases, missions, KPIs, error/edge cases, security, a11y, i18n, performance, build/release, ops, **empty state (§4.5)**, **aha-moment (§4.6)**, **profile/dates/era edit (§4.7)**, **push copy templates (§7.8)**, 4-tier error tree (§11.4), Reduce Motion + VoiceOver (§11.6.1-2), **Settings (§11.11)**, **Account/GDPR (§11.12)**, **Haptics·Offline·Photo (§11.13)**, dark mode explicit reject (§13.2 + ADR-0035). **(legacy in part)** — §11.11–§11.13 and the empty/gallery/byeongpung sections are **legacy reference only**. Their user-data, `Memory`, and haptics premises conflict with `DEC-001`, `DEC-022`, `DEC-024` and are **not** current implementation rules. |
| `reference/K-Journey_PRD_v1_0_KR.md` | Historical reference only — superseded by v1.1 on 2026-05-13, then v1.2 on 2026-05-14. |
| `docs/architecture/ARCHITECTURE.md` | System layers, data flow overview, threat model, ADR index. |
| `docs/architecture/DATA_FLOW.md` | Five core sequence diagrams (sign-in, mission complete, offline sync, panel unlock, era switch). **(legacy in part)** — sign-in, offline sync, and panel unlock rest on `ADR-0006`/`0013`/`0014`, `ADR-0031`, `ADR-0009`, all superseded. |
| `docs/architecture/MODULE_OWNERSHIP.md` | Per-module responsibility / side effects / dependency table. |
| `docs/adr/README.md` | **35 legacy ADRs** — use the current DEC log for redesign decisions; an ADR is applicable only where the reconciliation marks it `유효` / `보강`. Still the record of *why* the codebase looks the way it does. |
| `docs/SECURITY.md` | Threat model, Firestore Rules, PII classification, key rotation. **(legacy in part)** — the account/ACL sections rest on `ADR-0021`, superseded by `DEC-001`·`DEC-022`. The threat model and key-rotation practice survive. |
| `docs/ACCESSIBILITY.md` | WCAG 2.1 AA commitment + per-component checklist. |
| `docs/I18N_TIMEZONE.md` | English-first + Korean parenthetical rule + **KST single source of truth**. |
| `docs/EDGE_CASES.md` | Feature × failure-mode matrix with code pointers. |
| `docs/ANALYTICS_SCHEMA.md` | Canonical `KJEvent` schema + dedupe rules + **UX KPIs (§10)**. **(legacy in part)** — `sign_in`, `mission_complete`, `panel_unlock`, `byeongpung_share`, `gallery_open`, `photo_upload_outcome` sit on superseded ADRs. Condition-axis payloads depend on the **unconfirmed** `DEC-027`: **wire sinks only, isolate payload/cohort.** |
| `docs/MICROCOPY.md` | **Voice/tone, English-Korean pairing, length budgets, button/loading/celebration templates, voice review checklist.** Authority for every user-facing string. |
| `docs/ERROR_MESSAGES.md` | **Master error copy catalog** — code → tier (T1 toast / T2 modal / T3 settings / T4 banner) → title/body/CTA. `showOperationError` master table. |
| `docs/EMPTY_STATES.md` | **Per-screen empty state spec** — home, bucket, gallery, byeongpung, search, universities. Implementation guide for ADR-0027 (`유효`). **§§5–7 (gallery, byeongpung) are legacy** — they presuppose `MEM-02`·`MEM-03`, which `DEC-024` puts out of scope. The general 3-slot empty-state contract stands. |
| `docs/PUSH_COPY.md` | **Push notification copy catalog** — 3 push types · 7 unique strings · max 14 fires per user lifecycle. Implementation guide for ADR-0029 (`보강`). **The panel-unlock type, its `claimPanelUnlock` gate, and the "sync fires panels" wording are legacy** (`ADR-0009`, `DEC-024`). D-Day / phase local notification principles survive. |
| `docs/SETTINGS.md` | **(legacy — `ADR-0032` reference.)** Current account and storage behavior is governed by `DEC-001`, `DEC-022`, and the current policy. The §4 Account rows, Firestore/MMKV mirror, signed-in email, and `ADR-0033` soft-delete/export **cannot be kept**. Which of §1–§3 survives as local settings needs a new DEC — **do not decide it inside an implementation step.** |
| `docs/OPERATIONS.md` / `RELEASE.md` / `INCIDENT_RESPONSE.md` / `MONITORING.md` / `TESTING.md` / `PERFORMANCE.md` | Runbooks. INCIDENT_RESPONSE includes user notification templates §8.4-8.6. TESTING includes usability checklist §9. |
| `firestore.rules` | **(legacy)** Firebase Firestore security rules (`ADR-0021`, superseded by `DEC-001`·`DEC-022`). In scope for removal of the per-user ACL model — **not** a current implementation basis. |
| `DESIGN.md` | Brand essence, color tokens, type scale, motion, state variants (§14), microcopy summary (§16), **Settings pattern (§17)**, **Account management (§18)**, **Permission primer universal (§19)**, **Photo & sharing (§20)**, **Offline & sync conflict visuals (§21)**. **(legacy in part)** — §7 mission/byeongpung choreography, §§17–18 settings/account, §20 photo & gallery, and §21 remote-sync visuals sit on superseded ADRs. §21's reconnect and remote-conflict wording goes (`DEC-026` deletions, confirmed); the offline dot itself may stay. §15 dark mode is unaffected. |
| `design-tokens.ts` | Color/space/radius/elevation/typography token values. |
| `src/theme/eras.ts` | The three era variants (joseon/silla/goryeo). |
| `src/data/*.ts` | Missions (50), universities (9), emergency, bucket templates. **The 50-item cultural mission catalog is `MEM-01` `Won't` (`DEC-024`) — legacy.** Do not delete the file; stop treating it as the current content model. |
| `reference/K-Journey Prototype.html` | Visual reference only — never copy implementation logic. |

---

## Stack (locked)

- **React Native + Expo** managed workflow with EAS Build
- **TypeScript strict** mode
- **Expo Router** file-based routing (Stack + Tabs)
- **Firebase** (`@react-native-firebase/*`) — Messaging, Analytics, Crashlytics.
  ⛔ **`Auth`, per-user `Firestore` documents, and `Storage` uploads are out of scope**
  (`DEC-001`, `DEC-022`). Firebase is used only for content delivery, anonymous events,
  all-users notifications, and the operator audit log. The RN modular SDK choice itself stands.
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
9. **Era switching preserves progress.** ⛔ **Legacy premise** — the stated mechanics
   ("only the byeongpung art re-renders; `completedMissions` count stays") rest on
   `MEM-01`/`MEM-02`, both `Won't` (`DEC-024`). The *principle* — switching era never
   destroys user progress — survives; the byeongpung/mission wiring does not.
10. **Push notifications are behavior-triggered only.** D-30, D-14, D-7, and
    phase boundary crossings. Schedule them through `src/lib/notifications.ts`.
    ⛔ **Panel unlocks are removed from this list** — `ADR-0009` is superseded and
    `MEM-02` is `Won't` (`DEC-024`). Per `DEC-022`, push is an **all-users** channel.
11. ⛔ **LEGACY — do not implement.** *Era artwork is 8 panels. Always 8, never 6 or 10.
    `panelReveal(i) = clamp((completedCount - i*6) / 6, 0, 1)`.*
    `ADR-0008` is superseded; `MEM-02` Byeongpung is `Won't` (`DEC-024`). Keep the code
    and assets; do not build on them.
12. **Read DESIGN.md** before adding any new component. Use existing
    primitives in `src/components/ui/` first; build new ones only if
    composition fails.
13. **Safe-area aware.** All top-level screens wrap in `SafeAreaView` with
    appropriate `edges` to avoid notch/island overlap.
14. ⛔ **LEGACY — do not implement.** *Gate every panel-unlock celebration through
    `claimPanelUnlock(n)` (`src/lib/notifications.ts`); it returns `true` only the first
    time panel `n` is crossed, and the call site then fires the overlay, the
    `panel_unlock` analytics event, and `firePanelUnlock`.*
    `ADR-0009` is superseded (`DEC-024`). The whole panel-unlock celebration —
    overlay, analytics event, notification — is out of scope for this pass.
15. ⛔ **LEGACY — do not implement.** *Tag housing-specific missions with
    `appliesTo: 'dormitory' | 'off-campus'` in `src/data/missions.ts` and render the
    home list via `missionsForHousing(housing)`.*
    `ADR-0010` is superseded. `appliesTo` is a filter over the **50-item cultural
    mission catalog** (`MEM-01`, `Won't` per `DEC-024`) — **it is not an administrative
    document rule.** Do not "replace" it with a document-type rule either: the new
    administrative model is `DEC-003`·`DEC-018`, a separate matter that the ADR × DEC
    reconciliation explicitly did not decide.
16. ⛔ **LEGACY — do not implement.** *All total-completion counts flow through
    `aggregateCompletions` (`src/lib/completions.ts`) / `useTotalCompletions`, feeding
    panel-unlock thresholds, byeongpung reveal, and the gallery summary.*
    `ADR-0011` is superseded — all three consumers are `MEM` screens that `DEC-024`
    marks `Won't`. The helper stays in the tree; it is not the current counting contract.
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
    Korea Standard Time (UTC+9) regardless of device locale. Per ADR-0022 (`보강`)
    and `docs/I18N_TIMEZONE.md`.
    ⛔ **The Firestore `serverTimestamp()` clause is removed.** There is no remote
    user-data store to write to (`DEC-001`, `DEC-022`). Completion times are recorded
    locally through the KST helpers. **Do not introduce a local save-failure state here** —
    `save_failed` / `E8` are the unconfirmed part of `DEC-026` (see the isolation table).
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
12. ⛔ **LEGACY PATH — sign-in is not a current rule.** *Google sign-in was wired
    2026-05-22 via `@react-native-google-signin/google-signin`, with `webClientId` from
    `app.config.ts` → `extra` per env.* `ADR-0013`·`ADR-0014`·`ADR-0006` are superseded by
    `DEC-001` (**confirmed**): **the redesign has no sign-in.** Do not treat the sign-in UI,
    the providers, or the demo credentials as current implementation rules, and do not
    add new ones. Removing the auth layer is in scope for this pass.
13. **NEVER use the Firebase web SDK** (`firebase` npm package). We use
    `@react-native-firebase/*` exclusively. This SDK choice stands — but
    **`Auth` and per-user Firestore storage are outside the scope** of `DEC-001`·`DEC-022`.
14. ⛔ **LEGACY — moot for this pass.** *Never auto-switch to the gallery when the
    departure date passes; show a prompt instead.* `MEM-03` Gallery is `Won't`
    (`DEC-024`), so there is no gallery to switch to. Do **not** implement the prompt.
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
    Per ADR-0022 (`보강`). ⛔ **The Firestore `serverTimestamp()` clause is removed** —
    there is no remote user-data store (`DEC-001`, `DEC-022`). See MUST #19.
22. **NEVER swallow an `async` mutator error silently.** Empty `catch {}`
    blocks require a `// intentional swallow: <reason>` comment. Per
    ADR-0012. The standard surface is `showOperationError(action, error)`
    (`src/lib/errorAlert.ts`).
23. ⛔ **LEGACY — moot for this pass.** *Never bypass `claimPanelUnlock(n)` when firing
    the celebration overlay, `panel_unlock` analytics, or the panel-unlock notification.*
    `ADR-0009` is superseded (`DEC-024`): none of those three fire at all in this scope.
    See MUST #14.

---

## Mission completion choreography — ⛔ LEGACY, not a current implementation rule

`ADR-0030` (haptics & sound) and `ADR-0008`/`ADR-0009` (byeongpung, panel unlock) are
superseded by `DEC-001` and `DEC-024`. `MEM-01` Cultural missions and `MEM-02` Byeongpung
are `Won't`, so **the four-stage mission-complete choreography, the panel reveal, the
"Panel N unlocked" copy, and the associated haptic moments are not implemented in this
pass.** Kept below as the legacy contract — do not delete it, do not build on it.

The four-stage animation was the brand's hero moment. Timings:

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
   3 eras × 8 motifs). ⛔ **On hold — `MEM-02` Byeongpung is `Won't` (`DEC-024`).**
   The 24-PNG asset set and the `motifs.tsx` / `ByeongpungStrip` / `gallery.tsx`
   panel-renderer rewrite are **not** implemented in this pass. **Screen IDs and ADR
   files are not deleted.** Functional icons stay Lucide (no scope change to
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
   (gitignored) → Firestore (prod mode) + deploy rules → `eas init` to replace
   `PLACEHOLDER_EAS_PROJECT_ID`. ⛔ **"Enable Apple+Google Auth" is removed** —
   `DEC-001`·`DEC-022` limit Firebase to content delivery, anonymous events,
   all-users notifications, and the operator audit log. dev & prod
   share the bundle id by decision (no side-by-side install); add `.dev`
   suffix + EnvironmentBanner later for full isolation. See
   `project_env_separation_prod_add_2026_05_22` memory.
3. ~~PostHog region~~ — **Decided 2026-05-04: US region** (`us.i.posthog.com`).
   GDPR not required for Korean-user app, default is fine.
4. **App Store / Play Store developer accounts** — exist already? Different
   bundle IDs per environment (dev/staging/prod) are easier to set up before
   prebuild than after.
5. ~~Anonymous sign-in retention~~ — *Decided 2026-05-04: members-only; Apple + Google
   only; byeongpung as a 4-month artifact makes account-bound storage the product promise.*
   ⛔ **LEGACY — superseded.** `ADR-0014` falls under `DEC-001` (**confirmed**): the
   redesign has **no sign-in at all**, so "members-only vs. anonymous" is moot and
   account-bound storage is not the promise. `MEM-02` Byeongpung is `Won't` (`DEC-024`).
   Do not add `signInAnonymously()` — and do not add any other sign-in either.

---

## Provenance of the 2026-07-27 revision (`pm-evidence-gate` `G1`)

This revision marks legacy scope. **It deletes no ADR file, no screen ID, and no asset.**

### What was applied

`.work/adr-dec-raw-v4.md` §4 proposed **14 line-level edits**; all 14 are applied.
**15 further sites** were tagged that §4 did not list but §3 of the same file names as
affected: **7 rules** (MUST #9, #10, #15, #19 · NEVER #14 · Open decision #5 · the Firebase
line in Stack) and **8 source-of-truth rows** (§4 proposed 3 of the 11 rows now annotated).
**MUST #15 is the important one** — `ADR-0010` is superseded, yet §4 carried no row for it,
so applying §4 alone would have left an `appliesTo` rule live on top of a `Won't` catalog.

⚠️ **`CLAUDE.md` is only ~16% of what the harness injects.** `scripts/execute.py:186-195`
loads `CLAUDE.md` (~29k chars) **plus all 19 `docs/*.md`** (**152,615** chars, `wc -m`,
2026-07-27) into every step. **This revision fixed one sixth of the guardrail.** The rest
still describes sign-in, panel unlock, gallery, and remote sync. Before running any step,
either mark the conflicting `docs/` pages legacy, or restate this section's precedence
inside each `step<N>.md`.

### Evidence ledger

| 진술 | 출처 | 확인일 | 등급 | 최종 확인처 | 충돌 |
|---|---|---|---|---|---|
| ADR은 35건이다 | `find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' \| wc -l` → 35 | 2026-07-27 | A | — | 없음 |
| 판정은 `뒤집힘` 13 · `유효` 9 · `보강` 12 · `불명` 1 = 35이다 | `.work/adr-dec-raw-v4.md` §1 표 35행을 `awk`로 집계(`LC_ALL=C`) | 2026-07-27 | A | — | 없음 |
| `뒤집힘` 13건은 `ADR-0006`·`0008`·`0009`·`0010`·`0011`·`0013`·`0014`·`0021`·`0030`·`0031`·`0032`·`0033`·`0034`이다 | 같은 표를 판정별로 정렬해 출력 | 2026-07-27 | A | — | 없음 |
| `DEC-001`·`DEC-022`·`DEC-024`는 확정이다 | `.work/pmjob/k-journey/43-k-journey-role-review-v5-recheck-2026-07-26.md` | 2026-07-27 | A | — | 없음 |
| `DEC-026`은 삭제분만 확정이고 신설분(`save_failed`·`E8`)은 미확정이다 | `.work/pmjob/k-journey/44-k-journey-role-review-unscored-dec-2026-07-27.md` §2.1 | 2026-07-27 | A | — | 대조 1·2차 산출물은 「전체 미확정」으로 적었다 |
| `SUP-01`·`MEM-01`·`MEM-02`·`MEM-03`은 `Won't`다 | `.work/pmjob/k-journey/39-k-journey-cross-document-consistency-2026-07-26.md` §3.2 · `.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md` `DEC-024` 필드 7 | 2026-07-27 | A | — | 없음 |
| `appliesTo`는 문화 미션 카탈로그 50건의 필터이며 행정 서류 규칙이 아니다 | `docs/adr/0010-housing-applies-to-tagging.md:10-12` · `src/data/missions.ts:1-13` | 2026-07-27 | A | — | **대조 1차 검수가 행정 서류 규칙으로 봤다가 3차에서 철회했다** |
| `scripts/execute.py`가 이 파일을 매 step 주입한다 | `scripts/execute.py:188-190` | 2026-07-27 | A | — | 없음 |
| 다른 모델의 독립 재도출이 구현 경계에서 35/35 일치했다 | `.work/adr-dec-raw-v5.md` · `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` §5.2 | 2026-07-27 | A | — | **판정 자체는 6건 갈렸다** |
| `ADR-0007`을 `유효`로 되돌릴 수 있는가 | **미확인** — 독립적인 cold-start 요구사항이 없다 | 2026-07-27 | — | `pm-req-spec` 레인 | `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` §3.1 |
| `ADR-0033`의 정본 상태(본문 superseded ↔ index `proposed`) | **미확인** | 2026-07-27 | — | 저장소 ADR 소유자(**미확인** — 운영 조직이 없다) | `.work/adr-dec-raw-v4.md` §5 항목 5 |

### 등급 분포

```bash
awk -f .work/pmjob/tools/count-grades.awk CLAUDE.md
```

| 등급 | 셀 수 |
|---|---:|
| **A** | 9 |
| **B** | 0 |
| **C** | 0 |
| 합계 | **9** |

근거 대장은 **11행**이고 그중 **2행은 등급을 비웠다**(`미확인`, `G4`). 9 + 2 = 11로 맞는다.
`C`가 0인 것은 이 개정이 새 추론을 하지 않기 때문이다 — 전부 원문 확인 또는 재현 명령의 결과다.

### 한계 — 정직하게

- ⛔ **`V5` 미충족.** `.work/adr-dec-raw-v4.md` §4를 쓴 것은 작성 레인이고, **이 파일의 개정과
  그 자기 점검을 같은 세션이 했다.** 한계 명시 방식은
  `.work/pmjob/k-journey/34-k-journey-role-review-2026-07-25.md` §0.2와 같다.
- ⛔ `.work/adr-dec-raw-v4.md` 자체가 **검수 레인의 재검수를 받지 않았다.**
- ⚠️ **`docs/`는 이 개정에서 손대지 않았다.** 위 표의 legacy 표기는 `docs/` 본문과 아직 어긋난다 —
  `docs/` 정리는 ㈒ 이후의 몫이다. **어긋난 채로 남겨 둔 것을 알고 있다.**
- ⚠️ `.work/pmjob/k-journey/handoff.md` §0.1이 §4 제안을 **「15행」**으로 적었으나 실제 제안 행은
  **14행**이다(헤더 행을 포함해 센 값). 제안은 14건 전부 반영했다.
