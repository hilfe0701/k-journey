# Module ownership

| Area | Owner paths | May depend on | Must not own |
|---|---|---|---|
| navigation/screens | `app/**` | hooks, domain, UI | persistence key formats |
| design system | `src/components/ui/**`, `design-tokens.ts` | tokens, RN primitives | product rules |
| journey integration | `JourneyModeSwitch`, tab screens, `completions.ts` | profile, missions, buckets | administrative eligibility logic |
| administrative rules | `conditionRules.ts`, `taskState.ts`, departure/dormitory modules | typed profile, dates | UI navigation, analytics SDK calls |
| phase/time | `usePhase.ts`, `dates.ts` | date-fns | direct device-local timezone arithmetic |
| static content | `src/data/**` | content types | user state |
| local persistence | `storage.ts`, `firebase.ts`, `storageMigrations.ts` | MMKV, data types | screen copy and navigation |
| reactive state | `src/hooks/**`, `src/state/**` | persistence, pure rules | hidden network sync |
| telemetry | `posthog.ts`, telemetry helpers | allowlisted IDs/coarse values | raw profile or free text |
| release/ops | config files, `docs/*DEPLOY*`, runbooks | build tools | undocumented mutable production steps |

Cross-cutting changes need updates to the corresponding current spec. A new stored field requires data-lifecycle, migration, reset, export, privacy, and test decisions together.
