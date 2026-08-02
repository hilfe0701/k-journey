# CLAUDE.md — K-Journey current project rules

This file is the concise implementation guardrail for the current product. Historical planning and ADR documents remain in the repository, but they do not override the current decision and product spec below.

## Decision precedence

1. Explicit user direction
2. `DEC-040` in `.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`
3. `reference/K-Journey_PRD_v2_0_KR.md`
4. Current accepted ADRs, especially `docs/adr/0036-unified-journey-experience.md`
5. Current implementation companion docs
6. Historical PRDs, superseded ADRs, and dated planning snapshots

`DEC-040` replaces the product-scope part of `DEC-024` for cultural missions, Byeongpung, and Want-to. `DEC-001` and `DEC-022` still apply: there is no account, Auth, per-user Firestore, Storage upload, or cloud restore.

## Current product contract

- `Journey` contains `Essentials / Culture`; Essentials is the default.
- Essentials is the conditional administrative checklist and remains separate from the artwork reward.
- Culture contains 55 missions across four phases.
- `Byeongpung`, `Want to`, and `More` are first-class tabs beside Journey.
- Completed cultural missions plus completed Want-to items form one total. Six completions reveal one panel; 48 reveal all eight.
- Administrative task completion never contributes to that total.
- Undo may reduce the current reveal. Era switching changes artwork but preserves progress.
- User journey data is stored on this device in MMKV.

## Source of truth

| File | Owns |
|---|---|
| `reference/K-Journey_PRD_v2_0_KR.md` | current product, scope, flows, metrics, acceptance |
| `docs/JOURNEY_INTEGRATION_SPEC.md` | relationship between Essentials, Culture, Want-to, Byeongpung |
| `docs/LOCAL_DATA_LIFECYCLE.md` | local storage, reset, export, privacy boundary |
| `docs/CONTENT_GOVERNANCE.md` | source/freshness rules for administrative and cultural content |
| `docs/BYEONGPUNG_ART_DIRECTION.md` | connected-screen art and asset quality |
| `docs/MEASUREMENT_AND_EXPERIMENTS.md` | honest measurement status, events, experiments |
| `docs/architecture/ARCHITECTURE.md` | current runtime architecture |
| `docs/ACCESSIBILITY.md` | accessibility acceptance |
| `DESIGN.md` and `design-tokens.ts` | visual language and token values |
| `src/lib/firebase.ts` | local journey persistence; filename retained for compatibility only |

`reference/K-Journey_PRD_v1_0_KR.md`, `reference/K-Journey_PRD_v1_1_KR.md`, old Firestore/Auth ADRs, and dated `.work` documents are historical evidence. If they mention account sync, server timestamps, server deletion, photo upload, or cultural surfaces as `Won't`, do not implement those statements.

## Stack

- React Native + Expo Router, TypeScript strict
- React Native Web static export for web
- MMKV for user-owned local state
- Firebase Crashlytics only where a configured native build uses diagnostics
- PostHog optional; disabled without a key; session replay disabled
- Reanimated, react-native-svg, Lucide icons
- Pretendard UI and Noto Serif KR display typography

## MUST

1. Use colors and spacing from `design-tokens.ts`; do not add arbitrary hex values.
2. Body text weight is 500. Headings use 600 or 700.
3. Use English first and Korean in parentheses for Korean proper nouns.
4. Use sentence case. Badge micro-labels may use uppercase.
5. Use Lucide for functional icons; artwork motifs are not controls.
6. Use `usePhase.ts` as the only phase computation path and KST helpers from `src/lib/dates.ts` for all date math.
7. Preserve explicit `unknown`; never infer visa, housing, insurance, residence-card, or date facts.
8. Keep administrative task state separate from cultural completion aggregation.
9. Use `aggregateCompletions` / `useTotalCompletions` for mission + Want-to totals and keep the 6×8 contract covered by tests.
10. Era switching must never delete or reset completion data.
11. Every local mutation must surface a failure and verify persistence before claiming success.
12. Every official-source link must be actionable, show freshness, and retain a final authority.
13. Never send raw profile values, dates, names, emails, coordinates, or Want-to text to analytics or crash reports.
14. Session replay stays off until a separate consent, masking, retention, and privacy decision is accepted.
15. Top-level screens are safe-area aware; controls are at least 44×44pt; state is not conveyed by color alone.
16. Web must preserve direct URLs on refresh and hide inactive tab content from the accessibility tree.
17. Read `DESIGN.md` before adding components and prefer primitives in `src/components/ui`.
18. Run `npm run check`, `npm run build:web`, and mobile/desktop browser regression before claiming release readiness.

## NEVER

- Do not reintroduce account, Auth, per-user Firestore, Storage upload, or server sync from historical files without a new product decision.
- Do not describe the current text export as a backup or restore file.
- Do not collect identity-document numbers, bank details, or document photos in MMKV.
- Do not hardcode exact legal/fee/deadline claims without current primary-source evidence and review metadata.
- Do not treat internal walkthroughs as real user validation.
- Do not deploy an old `dist/` or an unidentified dirty working tree as a reproducible release.

## Completion checklist

- Product and decision docs agree with the code.
- `npm run check` passes with no avoidable warnings.
- Static web export succeeds and asset/bundle size is recorded.
- 390×844 and 1440×900 screens are visually checked.
- Direct detail URL refresh, back navigation, tab accessibility, unknown states, 5→6 panel threshold, undo, bucket creation, export, and reset are verified.
- Store privacy answers are based on the exact signed build, not assumptions.
