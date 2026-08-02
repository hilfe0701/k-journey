# Settings — Per-Row Master Spec

> **Current-use note:** notification, era, profile, local export, and local deletion settings are
> active. Account, signed-in email, Firestore mirror, soft-delete, and server export sections are
> historical. `docs/LOCAL_DATA_LIFECYCLE.md` owns current data behavior.

> Implementation guide for [ADR-0032](adr/0032-settings-screen-architecture.md). Voice rules: `MICROCOPY.md`. Account flows: [ADR-0033](adr/0033-account-deletion-and-export.md). Notification toggles: [ADR-0029](adr/0029-push-copy-library-and-priming.md).

## Entry path

* From any tab: bottom tab bar → **More** tab → top-right gear icon (Lucide `Settings`, 24 px, `palette.meok`).
* Two taps from anywhere = tab + gear. Single discoverable surface (no header gear, no avatar shortcut).
* Screen route: `app/settings/index.tsx`.

## Screen frame

* `SafeAreaView` with `edges={['top','left','right']}` (allow content to extend to bottom of safe area).
* Header: `Settings` (sentence case, 22 pt, `palette.meok`) + back chevron (left).
* Body: `SectionList` with 5 sections in declared order.
* Section header style: 12 pt, ALL CAPS, `palette.ash` (the only ALL CAPS in the app outside badge labels — the platform-conventional Settings header style; documented exception per ADR-0032).
* Row height: 56 pt (≥ 44 pt touch target per ADR-0025).
* Row layout: left-aligned `label`, right-aligned `control` (Switch / chevron / value text). Destructive rows use `palette.dancheong` for label.
* Divider: 1 px `palette.hairline` between rows within a section. No divider between sections (gap is the separator).

## Section 1 — Notifications

`accessibilityLabel` for section header: `Notifications settings`.

| Row | Label | Control | Default | Storage | On change |
|---|---|---|---|---|---|
| 1.1 | `D-30 reminder` | Switch | ON (if OS push granted) | `users/{uid}/settings/notifications.dDay30` + MMKV mirror `settings:notifications:dDay30` | If OFF, `rescheduleAllNotifications` skips `dDay30`. PostHog event `notification_pref_change` with `code='dDay30'`. |
| 1.2 | `D-14 reminder` | Switch | ON | `.dDay14` | Same pattern as 1.1. |
| 1.3 | `D-7 reminder` | Switch | ON | `.dDay7` | Same pattern as 1.1. |
| 1.4 | `Phase change reminders` | Switch | ON | `.phaseTransitions` | Controls all 3 phase pushes (1→2, 2→3, 3→4) as a group. |
| 1.5 | `Panel unlock celebrations` | Switch | ON | `.panelUnlocks` | Controls panel-unlock push (overlay still fires regardless). |
| 1.6 | `OS push permission` | Status text + button | varies | `Notifications.getPermissionsAsync()` | Reads OS state. If `denied`, show button `Open Settings` → `Linking.openSettings()` (T3 pattern, ADR-0028). If `granted` or `undetermined`, hide button. |

**Rules:**
* If `OS push permission !== granted`, all 5 toggles are visually disabled (`accessibilityState={{ disabled: true }}`) and a hint row appears: `Turn on system notifications to use these.` (factual, not blame — MICROCOPY.md voice).
* Toggles are stored in Firestore (round-trip is fire-and-forget per ADR-0012). MMKV mirror keeps the UI snappy.
* Per-category toggles do not violate ADR-0015 (behavior-triggered only) — they are **opt-out** within the documented set, not new categories.

## Section 2 — Era

`accessibilityLabel` for section header: `Era theme`.

| Row | Label | Control | Default | Storage | On change |
|---|---|---|---|---|---|
| 2.1 | `Era` | Picker (modal, 3 options with thumbnail preview) | onboarding selection | `users/{uid}/profile.era` (existing) | Triggers `setEraOverride(era)`. Byeongpung swaps to new era PNG set. Completion count preserved (CLAUDE.md MUST #9). PostHog event `era_switch`. Tile thumbnail re-renders within ~200 ms. |

**Picker modal:**
* Three rows: Joseon / Silla / Goryeo. Each row shows the era's emblem + first byeongpung panel thumbnail (60×40 px) + name + tagline.
* Tap row → preview accent color shifts on the modal background → tap "Use this era" CTA to commit.
* Cancel chevron returns to Settings without change.

**Voice:**
* Picker title: `Choose your era`
* Picker body: `Your byeongpung swaps to the new theme. Your progress stays.`

## Section 3 — Profile

`accessibilityLabel` for section header: `Your profile`.

| Row | Label | Control | Storage | On change |
|---|---|---|---|---|
| 3.1 | `Name` | Text input (sheet) | `users/{uid}/profile.name` | Validates non-empty (`validation.ts:validateName`). Save on sheet dismiss. |
| 3.2 | `University` | Picker (9 options from `src/data/universities.ts`) | `users/{uid}/profile.university` | Updates housing options if applicable. PostHog event `profile_field_change` with `field='university'`. |
| 3.3 | `Housing` | Picker (Dormitory / Off-campus) | `users/{uid}/profile.housing` | Recomputes `missionsForHousing(housing)` (CLAUDE.md MUST #15). Mission list refreshes. |
| 3.4 | `Arrival date` | Date picker | `users/{uid}/profile.arrival` | Triggers confirm dialog (see below). |
| 3.5 | `Departure date` | Date picker | `users/{uid}/profile.departure` | Triggers confirm dialog (see below). |

**Date change confirm dialog** (rows 3.4 + 3.5):
* Title: `Update your journey dates?`
* Body: `Your phase, missions, and reminders will be recalculated.`
* Buttons: `Cancel` (primary) / `Update` (primary destructive style — `palette.dancheong`).
* On Update:
  1. Validate (`validation.ts:validateDates`) — reject if `arrival > departure` or span < 7 days (T1 toast with copy from `docs/ERROR_MESSAGES.md` `validation-arrival-after-departure` / `validation-departure-too-soon`).
  2. Write to Firestore (per ADR-0012 wrap).
  3. Recompute phase via `usePhase`.
  4. Cancel pending push notifications and `rescheduleAllNotifications`.
  5. T1 toast: `Dates updated. Reminders rescheduled.`
* If recompute pushes phase backward (e.g. user extended departure date, returning from phase 3 to phase 2 territory), surface T2 modal:
  * Title: `Phase changed`
  * Body: `Your new dates put you in Phase ${newPhase}. Existing missions stay completed.`
  * Buttons: `Got it` (primary).

## Section 4 — Account

`accessibilityLabel` for section header: `Account`.

| Row | Label | Control | Storage | On tap |
|---|---|---|---|---|
| 4.1 | (signed-in email, e.g. `zinylee1@daum.net`) | Text (read-only) | Apple ID email | — |
| 4.2 | `Sign out` | Destructive button | — | Confirm modal (MICROCOPY.md §6.4): title `Sign out?` body `Your byeongpung stays. You can sign back in to continue.` Buttons: `Cancel` / `Sign out`. On confirm: `signOut()` → land on sign-in screen. |
| 4.3 | `Export my data` | Link with chevron | — | Per ADR-0033 Part B — confirm modal then queue export Cloud Function. |
| 4.4 | `Delete account` | Destructive button (deepest position) | — | Per ADR-0033 Part A — two-stage confirm + 30-day grace period. |

## Section 5 — About

`accessibilityLabel` for section header: `About`.

| Row | Label | Control | Storage |
|---|---|---|---|
| 5.1 | `Version` | Text (read-only, e.g. `1.0.0`) | `expo-constants` `manifest.version` |
| 5.2 | `Build` | Text (read-only, dev-only — hidden in prod) | `expo-constants` `manifest.runtimeVersion` |
| 5.3 | `Support` | Link with mail icon | `mailto:support@kjourney.app?subject=K-Journey%20Support` |
| 5.4 | `Privacy policy` | Link with external icon | `https://kjourney.app/privacy` (placeholder; coordinate with legal) |
| 5.5 | `Terms of service` | Link with external icon | `https://kjourney.app/terms` (placeholder; coordinate with legal) |
| 5.6 | (dev only) `[Dev] Fresh onboarding` | Destructive button | — | Per project memory `project_round2_review_complete_2026_05_14` — clears MMKV + signs out. `__DEV__` only. |
| 5.7 | (dev only) `[Dev] Skip auth` | Toggle | MMKV `dev:mockAuth` | Per project memory `project_dev_auth_bypass`. `__DEV__` only. |

## Cross-cutting rules

* **Persist optimistically.** Every Switch / Picker write fires the Firestore write but updates the UI immediately from MMKV mirror. Rollback on Firestore failure (T2 modal `Couldn't save`, ADR-0028).
* **a11y.** Every row has `accessibilityLabel` (label + state). Every Switch announces `${label}, switch, ${state}`. Every destructive button announces `${label}, button, dangerous`.
* **Voice.** All copy follows `MICROCOPY.md`. No emoji. No urgency. Sentence case. Specific verbs ("Sign out", not "OK").
* **Reduce motion.** Picker modal slides without bounce; cross-fade if `useReduceMotion()=true`.

## Test plan

* Unit (`__tests__/settings.test.ts`): each setting persists to Firestore + MMKV; rollback on Firestore failure; date change recomputes phase.
* Integration (Firestore emulator): toggle D-30 OFF → reschedule skips `dDay30` slot.
* Integration: era change preserves `aggregateCompletions(...)` count (regression of CLAUDE.md MUST #9).
* Manual QA (`docs/TESTING.md`): two-tap discovery (Home → More → gear → Settings).
* Manual QA: change departure date 2 weeks back → phase recompute → T2 phase-changed modal fires.
* Manual QA: Sign out / Delete account / Export round-trips.
* a11y: VoiceOver navigates all sections + rows in declared order.

## Adding a new setting

1. Pick the appropriate section.
2. Add a new row to the catalog above with all five fields (label / control / default / storage / on-change).
3. Update `src/state/useSettings.ts` to load + persist the new field.
4. Add a Jest assertion for the storage round-trip.
5. Voice review per MICROCOPY.md §8.
6. If the setting belongs in a new category, amend ADR-0032.

## Links

* **Authority ADRs:** [ADR-0032](adr/0032-settings-screen-architecture.md) (architecture), [ADR-0029](adr/0029-push-copy-library-and-priming.md) (notification toggles), [ADR-0033](adr/0033-account-deletion-and-export.md) (Account section actions), [ADR-0010](adr/0010-housing-applies-to-tagging.md) (housing field), [ADR-0025](adr/0025-accessibility-wcag-2-1-aa.md) (a11y), [ADR-0035](adr/0035-dark-mode-explicit-rejection.md) (no Dark mode toggle in Settings)
* **Voice rules:** `MICROCOPY.md`
* **Error catalog:** `ERROR_MESSAGES.md` (validation rows for date inputs)
* **Project rules:** CLAUDE.md MUST #9, MUST #10, MUST #15, MUST #17
* **Code (target):** `app/settings/index.tsx` (new), `src/state/useSettings.ts` (new), `app/(tabs)/more.tsx` (gear icon insertion)
