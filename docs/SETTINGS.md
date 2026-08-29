# Settings specification

> Current local-first implementation. There is no account, sign-in, Firestore
> mirror, server export, or soft-delete flow.

## Entry and frame

- Route: `app/settings/index.tsx`, opened from the More tab.
- Five sections, in order: Notifications, Era theme, Your profile, Your data,
  About.
- Every actionable row is at least 44 pt, has a role and label, and uses
  sentence-case copy. Section headers are the documented badge-style uppercase
  exception.

## Notifications

| Row | Storage / behavior |
|---|---|
| D-30, D-14, D-7 | Local preference keys; enabled by default and scheduled only when OS permission is granted. |
| Phase change reminders | One local preference controls the supported phase-transition reminders. |
| Panel unlock celebrations | Controls the local notification only; the in-app completion result remains. |
| OS push permission | Reads the OS state and offers Open Settings only when permission is denied. |

Disabled toggles remain visible with a factual explanation. A date update calls
`rescheduleAllNotifications`; the app reports full success only when cancelling
and every new schedule operation succeeded. Changing a D-Day or phase toggle
also cancels and rebuilds the known-date schedule immediately; panel-unlock
notifications are immediate events, so their toggle only changes the local gate.
If old-schedule cancellation fails, the app does not add another schedule that
could produce duplicate reminders. A section-wide in-memory lock prevents rapid
changes to different toggles from starting overlapping cancel/rebuild operations.
Date-save and preference-save status copy remain separate, and permission-off
is reported as a normal state rather than a scheduling failure.

## Era theme

The picker shows Joseon, Silla, and Goryeo with a panel preview. Changing era
writes the local profile and swaps artwork without changing the aggregate
completion count.

## Profile

These rows allow users to correct every condition that affects guidance after
onboarding; destructive reset is never the only correction path.

| Row | Control | Local profile field / rule |
|---|---|---|
| Name | text sheet | `displayName`; non-empty after trim |
| University | picker including Unknown | `universityId` plus compatibility field |
| Program | Exchange / Visiting / Unknown | `programType`; shared option source with onboarding |
| Visa or status | D-2-6 / D-2-8 / Visa-free / Other / Unknown | `visaTypeOrStatus`; shared option source with onboarding |
| Housing | housing picker including Unknown | `housingType` plus compatibility field |
| Contract holder | picker including Unknown | `contractHolder` |
| Total stay | whole-number input + Unknown | `totalStayDays`; blank/decimal/non-number cannot be saved |
| Nationality | trimmed free text + Unknown | `nationality`; no inferred country list or visa fact |
| Home-country insurance | Yes / No / Unknown | `homeCountryInsurance`; shared option source with onboarding |
| Registered district | Seoul district + Unknown/outside Seoul | `residenceDistrict`; re-resolves jurisdiction guidance |
| Residence card | status picker + Unknown | `residenceCardStatus` |
| Program start date | calendar + Unknown | `programStartDate`; past corrections allowed |
| Arrival date | calendar + Unknown | `arrivalDate`; past corrections allowed within validation policy |
| Departure date | calendar + Unknown | `departureDate`; cannot precede a known arrival |

When both journey dates are known, arrival/departure saves validate them,
recompute phase, cancel old reminders, and build the new schedule. A backward
phase move preserves completed work and shows the resulting phase. When either
date becomes Unknown, old journey reminders are cancelled; a cancellation
failure is reported as a partial refresh rather than success.

## Your data

| Row | Behavior |
|---|---|
| Export your data | Builds readable text from local profile, task, culture, and Want-to data and opens the OS share sheet. It is not an importable backup. |
| Delete all local data | Two-step destructive confirmation; deletes enumerated K-Journey keys, resets tour state, and returns to onboarding. |

## About

| Row | Behavior |
|---|---|
| Version | Read from Expo constants. |
| Build | Runtime version, development-only when present. |
| Support | Opens `EXPO_PUBLIC_SUPPORT_EMAIL` only when it is syntactically valid; otherwise shows `Not published`. |
| Privacy policy | Opens credential-free HTTPS `EXPO_PUBLIC_PRIVACY_POLICY_URL` only when configured; otherwise shows `Publication pending`. |
| `[Dev] Fresh onboarding` | Development-only local reset. |

Blank values in `.env.example` deliberately keep Support and Privacy policy
non-actionable. Legal/operator review owns the real destinations.

## Verification

- `src/lib/__tests__/settingsProfile.test.ts`: shared choices, labels, patch
  validation, Unknown states, and historical-date minimums.
- `src/lib/__tests__/notifications.test.ts`: schedule copy, full/partial result,
  and cancellation result.
- Web accessibility and stateful E2E cover route structure, focus/target rules,
  export, reset, and refresh. Native calendar, notification delivery, and
  screen-reader behavior still require the real-device release checklist.
