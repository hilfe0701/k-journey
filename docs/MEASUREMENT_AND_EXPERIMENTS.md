# Measurement and experiments

## Measurement status

The deployed web app may run without a PostHog key. In that state no product funnel is being measured. Targets below are hypotheses for future instrumented builds, not observed results.

Session replay is disabled. Product analytics uses allowlisted event names and coarse properties only.

## North-star behavior

`integrated_week` = within seven days on one anonymous installation, the user performs at least one meaningful Essentials action and at least one Culture/Want-to action.

This measures whether the two product axes reinforce each other. It does not treat app opens or tab taps alone as success.

## Core events

| Event | Meaning | Allowed properties |
|---|---|---|
| `journey_view_change` | switched Essentials/Culture | `from`, `to` |
| `task_status_change` | changed an administrative task | task ID, from/to status, phase; no profile answers |
| `mission_complete` / `mission_uncomplete` | changed cultural mission state | mission ID, phase, category |
| `bucket_create` | created a Want-to list | template ID, initial item count |
| `bucket_item_complete` | checked an item | bucket/item opaque IDs; no text |
| `panel_unlock` | crossed a six-completion threshold | panel number, source |
| `byeongpung_share` / `byeongpung_save_image` | exported artwork | completed panel count, surface |
| `dates_setup_open` | followed missing-dates prompt | source screen |

## Funnels

1. Onboarding complete → first actionable card open → first task or cultural completion.
2. First cultural completion → first panel unlock → return to another Culture/Want-to action.
3. Missing dates prompt → dates saved → first available administrative task open.
4. Essentials action → Culture switch → cultural detail open, and the reverse direction.

## Guardrail metrics

- Setup-prompt repeat views without save
- Task `review_required` dwell with no destination
- Undo rate immediately after completion
- Web console errors and failed asset requests
- Export attempts when no panel is meaningfully revealed
- Initial JS and artwork payload size

## Pre-interview experiments

| Experiment | Method | Decision it informs |
|---|---|---|
| Mode naming | unmoderated first-click prototype: Essentials/Culture vs Prepare/Explore | comprehension and first action |
| Culture hierarchy | current `Start here` card vs plain phase list | time to first mission |
| Locked artwork | 20%, 35%, 50% presence in a 5-second test | desire without false completion |
| Template choice | image thumbnail vs color swatch | bucket creation start |
| Date unknown state | one consolidated prompt vs two status cards | setup completion and perceived urgency |

Experiments must define sample, task, success threshold, exclusion rule, and stopping rule before collection. Do not label internal walkthrough results as user validation.
