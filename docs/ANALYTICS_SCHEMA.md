# Analytics Schema

> Canonical, typed event surface. Mirrors PRD v1.1 §16. The `KJEvent` union in `src/lib/posthog.ts` enforces this at compile time — add new events to the union *before* using them.

## 1. Schema

For every event:

* **Fire point** — the exact code location that calls `track(eventName, props)`.
* **Payload** — what gets sent.
* **Required props** — must be present; absence is a bug.
* **Forbidden props** — PII or user-content fields that must never appear. See `docs/SECURITY.md` §3.

## 2. Events

### Authentication

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `sign_in` | `useAuth` `onAuthStateChanged(user!=null)` | `{ provider: 'apple' \| 'google' \| 'devmock' }` | `provider` | `email`, `displayName` |
| `sign_out` | `useAuth.signOut` | `{}` | — | — |

### Onboarding

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `onboarding_step_complete` | each onboarding screen submit | `{ step: 'dates' \| 'profile_0' \| 'profile_1' \| 'profile_2' \| 'profile_3' \| 'profile_done' }` | `step` | raw input values |
| `onboarding_complete` | `era.tsx` final step | `{ era, university, housing }` | `era` (rest may be null if user skipped) | `displayName`, `email` |

### Missions

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `mission_complete` | `mission/[id].tsx` after `markMissionComplete` succeeds | `{ missionId, phase, category }` | all | mission title text |
| `mission_uncomplete` | `mission/[id].tsx` after `unmarkMission` succeeds | `{ missionId }` | `missionId` | — |

### Buckets (Want-To)

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `bucket_create` | `bucket/new.tsx` after `createBucket` succeeds | `{ templateId, itemCount }` | both | item text |
| `bucket_item_complete` | `bucket/[id].tsx` toggle item to checked | `{ bucketId, itemId }` | both | item text |

### Byeongpung / panels

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `panel_unlock` | after `claimPanelUnlock(n)` returns true | `{ panelNumber, source: 'mission' \| 'bucket' }` | both | — |
| `byeongpung_share` | byeongpung tab OR gallery share succeeds | `{ source: 'byeongpung_tab' \| 'gallery', completedPanels }` | both | — |
| `byeongpung_save_image` | byeongpung tab save succeeds | `{ completedPanels }` | `completedPanels` | — |

### Phase

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `phase_transition` | `useJourneyMilestones` detects auto-phase change | `{ from, to }` | both | — |
| `phase_manual_override` | Home phase tab tap on a different phase | `{ from, to }` (`from` = computed phase, `to` = chosen phase) | both | — |

### Era & navigation

| Event | Fire point | Payload | Required | Forbidden |
|---|---|---|---|---|
| `era_switch` | More tab era picker submit | `{ from, to }` | both | — |
| `dday_milestone_view` | `useJourneyMilestones` detects first crossing of 30/14/7-day threshold, MMKV-deduped across cold starts | `{ milestone, daysLeft }` | both | — |
| `emergency_open` | `emergency.tsx` mount | `{}` | — | — |
| `gallery_open` | `gallery.tsx` mount | `{ completedTotal }` | `completedTotal` | — |

### Diagnostic (not in `KJEvent` — sent ad-hoc)

| Event | Fire point | Payload | Notes |
|---|---|---|---|
| `clock_skew_detected` | `clockGuard.ts` boot | `{ deltaDays }` | Diagnostic; not used for funnels. PostHog only, no Firebase Analytics. |
| `push_permission_state` | `usePushPermissionWatcher` foreground | `{ state: 'granted' \| 'denied' \| 'undetermined' }` | Diagnostic. |

## 3. `trackOnce` dedupe contract

`src/lib/telemetry/index.ts` (Part F) provides:

```ts
trackOnce(event: KJEvent, dedupeKey: string, props?: object): void
```

Same `dedupeKey` is fired at most once per JS session. Used by:

* `dday_milestone_view` — key is `dday-${milestone}`. Page revisits within a session don't refire.
* `panel_unlock` — key is `panel-${n}`. (The MMKV `firedPanelUnlocks` already prevents cross-session duplicates per ADR-0009.)

## 4. Properties never sent

Globally banned from any event payload:

| Property | Why |
|---|---|
| `email` | PII. Goes only in Firestore own user doc. |
| `displayName` | PII. |
| Any raw mission title text | Could be reverse-mapped to identifying preferences. |
| Any raw bucket item text | User-typed content. |
| Coordinates / location | We never collect them. |
| Device identifier (IDFA / GAID) | Not requested. |

## 5. Adding a new event

1. Add the event name to the `KJEvent` union in `src/lib/posthog.ts`.
2. Add a row to §2 above.
3. Implement the `track()` call site.
4. If dedupe is needed, use `trackOnce(event, key, props)`.
5. If diagnostic-only, mark as such (§2.7) — diagnostics may stay outside the union, but document them here.
6. Update `docs/MONITORING.md` if the event drives an alert.

## 6. Funnels (PostHog)

Pre-defined funnels in PostHog dashboard:

| Funnel | Steps |
|---|---|
| Onboarding completion | `sign_in` → `onboarding_step_complete:dates` → `onboarding_step_complete:profile` → `onboarding_step_complete:era` → `onboarding_complete` |
| First mission | `onboarding_complete` → `mission_complete` (first) |
| First panel unlock | `mission_complete` (first) → `panel_unlock` (panel=1) |
| D-Day engagement | `dday_milestone_view:30` → `dday_milestone_view:14` → `dday_milestone_view:7` |
| Byeongpung share | `panel_unlock` (panel=1+) → `byeongpung_share` |
| Departure → gallery | `phase_transition:3→4` → `gallery_open` |

## 7. Cohorts

| Cohort | Definition |
|---|---|
| New users this week | `sign_in` in last 7 days |
| Active users | `mission_complete` in last 7 days |
| At-risk drop-off | `onboarding_step_complete:dates` AND NOT `onboarding_complete` within 1 day |
| Byeongpung completers | `panel_unlock` (panel=8) ever |
| University X students | super-property `university` = "Yonsei" (etc.) |

## 8. Retention reports

Standard 7-day and 30-day retention computed against `sign_in` as the cohort event and any `mission_complete` / `bucket_item_complete` as the return event.

KPI targets — PRD v1.1 §1.2.

## 9. Privacy

Event payloads are inspected weekly during the Round-2-and-beyond cadence to confirm no PII has leaked. If a leak is detected, follow `docs/SECURITY.md` §9.

## 10. UX KPIs (Wave 2 — 2026-05-14)

KPIs that measure the **user experience** layer added in PRD v1.2 Wave 1+2. These are PostHog dashboard tiles, not events themselves — but each ties to one or more events.

### 10.1 New events (Wave 2)

Add these to the `KJEvent` union in `src/lib/posthog.ts`:

| Event | Properties | Triggered by |
|---|---|---|
| `screen_empty_view` | `screen` (home / bucket / gallery / byeongpung / search), `phase`, `secondsUntilFirstAction` (number) | Empty state rendered for ≥ 5 s without user interaction (ADR-0027). |
| `error_toast_dismissed` | `code` (network-offline / etc), `tier` (T1/T2), `dismissedVia` (auto / tap / retry) | T1 toast lifecycle end (ADR-0028). |
| `notification_priming_shown` | (none) | Priming card mounted (ADR-0029). |
| `notification_priming_response` | `response` (granted / dismissed) | User taps Allow or Not now on priming card (ADR-0029). |
| `mission_first_complete_time` | `secondsFromOnboarding` (number) | First-ever `mission_complete` event for this user. |
| `settings_open` | `category` (notifications / era / profile / account / about) | Settings → category section header in viewport (ADR-0032). |
| `notification_pref_change` | `code` (dDay30 / dDay14 / dDay7 / phaseTransitions / panelUnlocks), `value` (boolean) | Settings → Notifications toggle change. |
| `account_delete_initiated` | `stage` (first-confirm / second-confirm / committed / cancelled) | ADR-0033 deletion flow stages. |
| `account_export_requested` | (none) | ADR-0033 export flow. |
| `photo_upload_outcome` | `outcome` (success / fail-network / fail-size / fail-other), `bytes` (number) | ADR-0034 upload pipeline result. |
| `tour_aha_moment_shown` | (none) | First-launch tour mounted (PRD §4.6). |
| `tour_aha_moment_dismissed` | `secondsViewed` (number) | User taps `See my missions` CTA. |

### 10.2 KPI thresholds & alerts

| KPI | Definition | Target | Alert threshold |
|---|---|---|---|
| **Onboarding completion rate** | Users who reach home / total sign-ups | ≥ 80% | < 70% over 7-day rolling |
| **Aha-moment view rate** | `tour_aha_moment_shown` / sign-ups | ≥ 95% | < 90% (drop = nav bug or skipped section) |
| **Aha-moment median dismiss time** | median(`secondsViewed`) | 4–10 s | > 15 s = users not engaging or copy too dense |
| **Push permission grant rate** | `notification_priming_response` granted / shown | ≥ 60% (PRD §1.2) | < 50% over 7-day rolling |
| **Mission first-complete time** | median `secondsFromOnboarding` for `mission_first_complete_time` | < 24 h (Phase 1) | > 72 h = onboarding-to-engagement drop |
| **Empty-state stickiness** | `screen_empty_view` events / total session count | < 30% on home, < 50% on gallery | > 50% on home (means missions invisible) |
| **Error toast dismiss rate (auto)** | `error_toast_dismissed` auto / total `error_toast_dismissed` | < 60% | > 70% means users miss errors before action |
| **Photo upload success rate** | `photo_upload_outcome` success / total | ≥ 95% | < 90% over 7-day rolling |
| **Account deletion rate** | `account_delete_initiated` (committed) / DAU | < 0.5% | > 1% over 30-day = retention crisis signal |
| **Settings open rate** | `settings_open` / DAU | 5–15% (healthy curiosity) | > 30% = users hunting for something missing |

### 10.3 Funnel definitions (Wave 2 additions)

* **Onboarding → first mission**: `signin_complete` → `onboarding_dates_complete` → `notification_priming_response` → `tour_aha_moment_dismissed` → `mission_complete` (first). Target conversion ≥ 70%.
* **Permission priming**: `notification_priming_shown` → `notification_priming_response (granted)` → OS-level grant. Target ≥ 60%.
* **Account deletion**: `account_delete_initiated (first-confirm)` → `committed`. Target conversion < 50% (most who start should cancel — recovery is healthy).

### 10.4 Cohorts (UX-specific)

* **Empty-state heavy**: users with ≥ 5 `screen_empty_view` events in 7 days → likely struggling to engage.
* **Permission denied**: users with `notification_priming_response = dismissed` → never receive milestone reminders.
* **Settings explorers**: users with ≥ 3 `settings_open` events in 7 days → potential power users or potential churners.

## 11. Links

* PRD v1.1 §16
* [ADR-0004](adr/0004-posthog-primary-analytics.md)
* [ADR-0005](adr/0005-firebase-analytics-secondary.md)
* `src/lib/posthog.ts` (KJEvent union)
* `src/lib/telemetry/index.ts` (trackOnce wrapper, Part F)
* `docs/SECURITY.md` §3 (PII classification)
