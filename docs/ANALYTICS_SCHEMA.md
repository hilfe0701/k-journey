# Analytics schema

> Current local-first event contract. PostHog is disabled when no usable key is configured. Session replay is disabled.

## Rules

- Add event names to `KJEvent` in `src/lib/posthog.ts` before capture.
- Send stable internal IDs and coarse enum state only.
- Never send name, email, raw dates, university/nationality/visa/housing/insurance answers, location, document values, raw Want-to text, or images.
- Do not call `identify` with profile properties. There is no account identity.
- Event presence in this document does not prove the call site or dashboard exists; verify both before reporting a metric.

## Current event families

| Family | Events | Allowed purpose |
|---|---|---|
| onboarding | `onboarding_step_complete`, `onboarding_complete`, tour shown/dismissed | first-run funnel without raw answers |
| journey | `journey_view_change`, `phase_transition`, `phase_manual_override`, `dday_milestone_view` | mode and phase navigation |
| admin tasks | `task_open`, `task_start`, `task_complete`, `task_uncomplete`, order/address/departure events | task behavior by internal ID/state |
| culture | `mission_complete`, `mission_uncomplete`, `mission_first_complete_time` | mission behavior by ID/phase/category |
| Want-to | `bucket_create`, `bucket_item_complete` | template/count and opaque IDs; no text |
| artwork | `panel_unlock`, `byeongpung_share`, `byeongpung_save_image`, `gallery_open`, `era_switch` | reveal/export behavior |
| settings/data | `settings_open`, `notification_pref_change`, `profile_field_change`, `data_export_delivered`, `data_export_failed` | coarse settings actions; field name only |
| support | `emergency_open`, permission/empty/error events | feature access and recoverability |

`sign_in`, `sign_out`, and `account_delete_initiated` remain in the historical union for compatibility but must not be used to describe the current no-account product.

## Current funnels

1. Onboarding complete → first task or mission detail → first completion.
2. Missing dates prompt → dates saved → first available task.
3. First cultural completion → first panel unlock → next cultural/Want-to completion.
4. Essentials action ↔ Culture action within seven days.

Exact metric definitions and experiment gates live in `docs/MEASUREMENT_AND_EXPERIMENTS.md`.

## Privacy verification

Before enabling a production key:

1. inspect every `track(` call and captured property;
2. run a test session through an intercepting proxy or PostHog live events;
3. verify session replay is absent;
4. set retention and deletion procedures;
5. make the privacy notice and store labels match the exact build.
