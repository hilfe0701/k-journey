# Testing strategy

## Required gates

```bash
npm run typecheck
npm run lint
npm test
npm run build:web
```

`npm run check` runs the first three. Record the actual Jest suite/test counts from the current run; do not copy historical “52 tests” claims.

## Existing strengths

- deterministic condition and task-state rules;
- KST phase/date calculations;
- completion aggregation and 6-completion threshold;
- storage migrations and profile compatibility;
- export status/delivery semantics;
- accessibility helper invariants.

## Required integrated regression

| Scenario | Assertions |
|---|---|
| Essentials/Culture switch | selected mode persists; administrative and cultural state do not mix |
| missing dates | one setup prompt, no duplicate status slabs, route opens Settings |
| 5→6 completion | exactly one next panel threshold; admin task completion has no effect |
| undo/delete | aggregate and partial reveal recalculate honestly |
| bucket creation | chosen image template is preselected; user text persists locally |
| direct URL | mission/task/bucket detail survives browser refresh and back navigation |
| inactive tabs | only active screen is exposed to web/native accessibility APIs |
| official links | browser/dialer action fires and failure is recoverable |
| export/reset | all supported user-owned data is present; reset returns to onboarding |
| responsive | 390×844 and 1440×900 first action and artwork hierarchy pass |
| route boot failure | browser gates fail if the application ErrorBoundary renders |

## Accessibility checks

- automated role/name/value scan;
- keyboard Tab/Shift+Tab/Enter/Space on web;
- VoiceOver/TalkBack order for tabs, sheets, and lists;
- 200% text and reduced motion;
- contrast calculation against actual token/background pairs.

## Visual checks

Capture each primary tab and representative details at 390×844 and 1440×900. Compare first-action position, clipping, horizontal overflow, hidden-tab DOM, image seams, and share/export states. A passing static build is not visual evidence.

## Failure injection coverage

- [x] MMKV write/read-back mismatch for profile, task, mission, and bucket mutations (`firebaseFailures.test.ts`);
- [x] malformed and older-version JSON (`storageMigrations.test.ts`);
- [x] OS share unavailable/dismissed/thrown and capture failure (`share.test.ts`);
- [x] external link handler rejection (`linking.test.ts`);
- [x] photo permission denied plus primary/fallback save failures (`share.test.ts`);
- [x] unknown condition combinations (condition/admin/task-state suites).

Native permission dialogs, OS share sheets, and process-restart behavior still
require the signed artifact/device pass; unit failure injection does not replace it.
