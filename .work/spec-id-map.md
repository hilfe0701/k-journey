# Step 8 specification ID map

Source: `.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md` §3 (19 confirmed requirements), `.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md`, `.work/pmjob/k-journey/30-k-journey-traceability-matrix-2026-07-25.md`, and `.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`.

“구현함” means the current P0 slice has a code path for the requirement. “구현 안 함” is explicit scope or decision deferral; it is not a blank mapping.

| ID | 종류 | 코드 위치(파일:줄) | 비고 |
|---|---|---|---|
| `REQ-DAR-001` | 요구사항 | `app/(onboarding)/housing.tsx:1`, `src/lib/firebase.ts:58` | 구현함 — housing type and contract holder are collected and stored locally. |
| `REQ-SFR-001` | 요구사항 | `src/lib/conditionRules.ts:260`, `app/task/[id].tsx:221` | 구현함 — housing × contract-holder document rules and requested-from details. |
| `REQ-SFR-002` | 요구사항 | — | 구현 안 함 — the full nine-task pre-departure model and three-prerequisite flow are not in this slice; only the current departure-order task is present. |
| `REQ-DAR-002` | 요구사항 | `src/lib/taskState.ts:65`, `app/task/[id].tsx:393` | 구현함 — source URL, checked date, final authority, and conflict evidence are rendered. |
| `REQ-QUR-001` | 요구사항 | — | 구현 안 함 — the 50-item cultural mission audit is `MEM-01`/`DEC-024` out of scope; Step 7 audited the administrative slice only. |
| `REQ-SFR-003` | 요구사항 | `app/(tabs)/index.tsx:478`, `src/lib/taskState.ts:441` | 구현함 — available, blocked, and dependency-driven task derivation. |
| `REQ-SFR-004` | 요구사항 | `app/(tabs)/index.tsx:568` | 구현함 — not-applicable tasks remain visible with reason and official source. |
| `REQ-SFR-005` | 요구사항 | `src/lib/conditionRules.ts:418`, `app/(tabs)/index.tsx:232` | 구현함 — arrival-plus-90-day rule and KST deadline card. |
| `REQ-SFR-006` | 요구사항 | `app/(tabs)/index.tsx:646` | 구현함 — text warning for the single-entry visa and unissued residence card condition. |
| `REQ-SFR-007` | 요구사항 | — | 구현 안 함 — an independent immigration appointment task is not part of the current four-task slice. |
| `REQ-DAR-003` | 요구사항 | `app/(onboarding)/stay-length.tsx:1`, `src/lib/firebase.ts:72` | 구현함 — total stay days are entered, validated, and stored. |
| `REQ-SFR-008` | 요구사항 | `app/task/[id].tsx:624` | 구현함 — photo specification and no-photo-reuse warning are shown. |
| `REQ-SFR-009` | 요구사항 | — | 구현 안 함 — the independent dormitory application deadline task is not in this slice. |
| `REQ-QUR-002` | 요구사항 | `app/(onboarding)/stay-length.tsx:1` | 구현함 — the onboarding label is “Stay length” rather than an ambiguous stay-type label. |
| `REQ-DAR-004` | 요구사항 | `app/(onboarding)/nationality.tsx:1` | 구현함 — nationality and home-country insurance are collected with explicit unknown. |
| `REQ-SFR-010` | 요구사항 | `app/task/[id].tsx:642` | 구현함 — address-change restriction while the residence card is being issued is shown with the final authority. |
| `REQ-DAR-005` | 요구사항 | `app/(onboarding)/housing.tsx:1` | 구현함 — registered business accommodation is a distinct housing option. |
| `REQ-SFR-011` | 요구사항 | `src/lib/conditionRules.ts:461`, `src/lib/__tests__/conditionRules.test.ts:202` | 구현함 — Yonsei-only `<28` group-registration block and `>=28` review-required boundary. |
| `REQ-SFR-012` | 요구사항 | — | 구현 안 함 — the `SET-05` data-export surface is not part of Step 8; no export feature was added. |

## Explicitly not mapped to implementation

- `REQ-P0-02` remains pending in the requirements SSOT; no value was invented for the visiting-student branch.
- `REQ-TER-003` offline/reconnect execution is not a current path after `DEC-026` deletions. The local onboarding-resume test is mapped to `TC-133`; full manual relaunch remains in the QA report.
- `REQ-TER-002` `save_failed`/`E8` is isolated because only the deletion portion of `DEC-026` is confirmed. `TC-160` is not used as an implementation basis.
