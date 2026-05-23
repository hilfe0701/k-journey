# 0032. Settings screen architecture

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `ux`, `settings`, `navigation`, `architecture`

## Context and Problem Statement

K-Journey has no Settings screen. Today the app's navigation surfaces are: tabs (Home / Gallery / Bucket / More), a sign-in flow, an onboarding flow, and per-feature deep links. The "More" tab exists per `app/(tabs)/_layout.tsx` but contains only static placeholder content.

This is a problem because the app already needs places for:

* **Notification preferences** — once OS push permission is granted (ADR-0029), users may want to mute panel-unlock without muting D-Day. We promised this in PUSH_COPY.md V2 plan but the entry surface is undefined.
* **Era change** — per CLAUDE.md MUST #9, era switching preserves progress. The user picks era during onboarding but may regret the choice; today there is **no UI to change it post-onboarding**. The `setEraOverride` hook exists; the screen does not.
* **Profile/dates edit** — users sometimes change arrival or departure dates (visa change, flight change). Today the only path is to wipe the dev mock or sign out and re-onboard.
* **Account management** — sign out, delete account, export data (ADR-0033). GDPR/한국 개인정보보호법 strictly require an in-app account-delete entry point.
* **About** — version, support contact, legal links.

Without an architectural decision, each of these will end up in an ad-hoc location. Users won't find them. App Store reviewers may flag the missing account-delete entry point.

## Decision Drivers

* User must find Settings within **two taps** of the home screen — App Store review heuristic and basic usability.
* Adding a Settings tab to the bottom bar would crowd the brand-defining navigation (Home is the byeongpung; Gallery is the artifact; Bucket is the personal layer; More is the catch-all).
* Settings is **not a frequent destination** — once-per-month visit at most. It does not deserve tab real estate.
* Account delete must be discoverable to satisfy GDPR/PIPA — but not so discoverable that users tap it accidentally.
* Era and date changes are real editing flows that touch business-critical state (phase, byeongpung, push schedule). They cannot be hidden in a debug menu.
* Reduce-motion / a11y users must be able to navigate the Settings tree with VoiceOver in three swipes or fewer.

## Considered Options

1. **More tab → Settings (single screen, 5 categories)** (chosen)
2. **Add a Settings tab to the bottom bar (5-tab navigation)**
3. **Profile sheet from header avatar tap (no Settings concept)**
4. **iOS-style nested Settings — separate screens per category**
5. **No Settings — push every preference into onboarding only**

## Decision Outcome

**Chosen:** A single Settings screen reachable from the More tab. The screen is composed of **5 categories**, each rendered as a section with header and list rows. No nested screens for now (V2 may split if any category grows past 6 rows).

### Categories (in display order)

| # | Category | Rows | Purpose |
|---|---|---|---|
| 1 | **Notifications** | 5 toggles (D-30, D-14, D-7, phase changes, panel unlocks) + 1 link "Open Settings" if OS-disabled | Per-category opt-out without surrendering OS push permission. Default: all ON if OS-granted. |
| 2 | **Era** | Picker (joseon / silla / goryeo) with byeongpung preview thumbnail | CLAUDE.md MUST #9 — preserves progress on change. |
| 3 | **Profile** | Name (text), University (picker), Housing (picker), Arrival date, Departure date | Edits trigger validation (`validation.ts`) and recompute phase + push schedule. Date change shows confirm dialog. |
| 4 | **Account** | "Sign out" (destructive button), "Export my data" (link → ADR-0033), "Delete account" (destructive, deepest position) | GDPR/PIPA compliance. Deletion goes through 30-day grace period (ADR-0033). |
| 5 | **About** | App version (read-only), Build number (read-only, dev only), "Support" mailto link, "Privacy policy" link, "Terms of service" link | Legal + transparency. |

### Entry path

* From any tab: bottom tab bar → **More** tab → top-right gear icon (`Lucide Settings`, 24 px, `palette.meok`).
* Two taps from anywhere = tab + gear.
* The gear is the **only** Settings entry point — no header gear, no profile sheet shortcut. Single discoverable surface.

### Screen layout

* `SafeAreaView` with `edges=['top','left','right']` (allow content to extend to bottom).
* Header: `Settings` (sentence case, 22 pt, `palette.meok`).
* Sections rendered as `SectionList` with section headers (`palette.ash`, 12 pt, ALL CAPS — the only ALL CAPS in the app per CLAUDE.md NEVER #4 exception for badge labels).
* Each row: 56 pt height (≥ 44 pt touch target), left-aligned label, right-aligned control (Switch / chevron / value).
* Destructive rows (Sign out, Delete account) use `palette.dancheong` text color.

### State persistence

| Setting | Storage |
|---|---|
| Notification toggles | Firestore `users/{uid}/settings/notifications` + MMKV `settings:notifications` mirror |
| Era | Firestore `users/{uid}/profile.era` (existing) |
| Profile fields | Firestore `users/{uid}/profile.*` (existing) |
| Account actions | Firebase Auth + Cloud Function (ADR-0033) |
| About fields | `expo-constants` (read-only) |

### What does NOT go in Settings

* Phase override (debug-only — stays in dev mock menu).
* Re-onboard / "fresh start" (debug-only — stays in `[Dev] Fresh onboarding` button per project memory `project_round2_review_complete_2026_05_14`).
* Help/FAQ — deferred to More tab Help submenu (V1.1, see Out of scope below).

### Positive Consequences
* Single discoverable surface — App Store reviewers find Account → Delete in two taps.
* Notification per-category toggles unlock the V2 plan from PUSH_COPY.md without architectural change.
* Era change has a real home — no more "the team didn't think of this" gaps.
* Bottom tab bar stays at 4 — brand navigation is not crowded.
* SectionList pattern means new categories are additive without screen redesign.

### Negative Consequences
* "Two taps" assumes the user knows to look in More. Some users may not. Accepted: this is App Store baseline.
* No nested screens means each category must fit in one section. If Profile grows beyond 6 fields (e.g. multiple addresses, language preference), we'll need to split. V2 problem.
* Notification toggles synced to Firestore = an extra round-trip per toggle. MMKV mirror keeps the UI snappy; the Firestore write is fire-and-forget per ADR-0012.

### Reversibility

Reversible — Settings is a single screen tree. Removing it returns the More tab to placeholder state. The settings data model (Firestore + MMKV) is additive — no existing schema is modified.

## Pros and Cons of the Options

### More tab → Settings (chosen)
* **+** Two taps from anywhere.
* **+** Bottom tab bar stays brand-shaped (4 tabs).
* **+** SectionList scales additively.
* **−** Less prominent than a tab.

### Add Settings tab
* **+** One tap.
* **−** Crowds brand navigation. Settings is not a daily destination.

### Profile sheet from avatar
* **+** Modern (Twitter-style).
* **−** No avatar in the design system — we'd have to invent one. Off-brand.
* **−** Sheet pattern doesn't compose with five categories cleanly.

### iOS-style nested screens
* **+** iOS-native feel.
* **−** Five small sub-screens for what could be one. More taps. More navigation state to manage.

### Onboarding-only preferences
* **+** Zero new UI.
* **−** Users can't change anything after onboarding. Era change impossible. Account delete impossible. PIPA failure.

## Test plan

* Unit (`__tests__/settings.test.ts`): each setting persists to its declared storage; Firestore write retries via ADR-0012 on failure; MMKV mirror updates synchronously.
* Integration: change era → byeongpung swaps to new era, completion count preserved (CLAUDE.md MUST #9 contract).
* Integration: change departure date → push schedule cancels and re-creates per `rescheduleAllNotifications` (ADR-0029).
* Manual QA (`docs/TESTING.md`): two-tap discovery — Home → More → gear → Settings visible.
* Manual QA: tap Sign out → confirm dialog → sign out completes; tap Delete account → 30-day grace warning per ADR-0033.
* a11y: VoiceOver navigates section headers and rows in declared order. Each Switch announces `${label}, switch, ${state}`. Destructive buttons announce `${label}, button, dangerous`.

## Migration plan

This ADR is forward-looking. Today's `app/(tabs)/more.tsx` (or equivalent) is placeholder.

1. **PR-A — Settings screen skeleton:** ship `app/settings/index.tsx` with empty SectionList and gear icon entry from More tab.
2. **PR-B — Notifications section:** wire 5 toggles + Firestore `users/{uid}/settings/notifications` + MMKV mirror. Update `notifications.ts` to filter by per-category preference before scheduling.
3. **PR-C — Era + Profile sections:** wire era picker (preview thumbnail) + profile fields with validation + date confirm dialog. Reuse existing `useProfile` hook.
4. **PR-D — Account section:** Sign out (existing) + Export + Delete (per ADR-0033 implementation).
5. **PR-E — About section:** read-only fields from `expo-constants` + external links.
6. **PR-F — `docs/SETTINGS.md`:** publish per-row spec (already drafted as part of v1.2 Wave 2).

## Links

* **PRD:** §11.11 (new — Settings 화면 아키텍처), §11.12 (Account management cross-ref)
* **Project rules:** CLAUDE.md MUST #9 (era preserves progress), MUST #10 (push triggers), NEVER #15 (no daily/weekly)
* **Related ADRs:** [ADR-0010](0010-housing-applies-to-tagging.md) (housing field in Profile), [ADR-0013](0013-apple-primary-google-deferred.md) (Sign out / sign-in shape), [ADR-0015](0015-behavior-triggered-push-only.md) (per-category opt-out doesn't change ADR-0015 promise), [ADR-0029](0029-push-copy-library-and-priming.md) (notification toggles target), [ADR-0033](0033-account-deletion-and-export.md) (Account section actions)
* **Docs:** `docs/SETTINGS.md` (per-row master spec)
* **Code (target):** `app/settings/index.tsx` (new), `src/state/useSettings.ts` (new), `app/(tabs)/more.tsx` (gear icon insertion)

## Notes

The decision to use **ALL CAPS** for section headers in this one screen is the only documented exception to CLAUDE.md NEVER #4 (no ALL CAPS) other than badge labels. The reason: SectionList headers in iOS-pattern Settings are universally read in caps; sentence-case headers would confuse the conventional reading pattern. A future redesign may revisit, but for V1 we honor the platform convention.

Choosing 5 categories (not 4, not 6) is a Goldilocks bet — fewer than 5 collapses Account into Profile (bad for GDPR discoverability); more than 5 starts pushing things into nested screens. Validate against post-launch feedback.
