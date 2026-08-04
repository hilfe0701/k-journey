# Specification ID map

> 🔻 **2026-07-28.** Four of the five `구현 안 함` rows became `구현함`
> (`REQ-SFR-002` · `REQ-SFR-007` · `REQ-SFR-009` · `REQ-SFR-012`).
> **`REQ-QUR-001` stays `구현 안 함` and is not a gap** — `DEC-024` confirmed
> `MEM-01` as `Won't`, so building it would reverse a confirmed decision.
> **19 confirmed requirements: 구현함 18 · 구현 안 함 1.**


Source: `.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md` §3 (19 confirmed requirements), `.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md`, `.work/pmjob/k-journey/30-k-journey-traceability-matrix-2026-07-25.md`, and `.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`.

“구현함” means the current P0 slice has a code path for the requirement. “구현 안 함” is explicit scope or decision deferral; it is not a blank mapping.

| ID | 종류 | 코드 위치(파일:줄) | 비고 |
|---|---|---|---|
| `REQ-DAR-001` | 요구사항 | `app/(onboarding)/housing.tsx:1`, `src/lib/firebase.ts:58` | 구현함 — housing type and contract holder are collected and stored locally. |
| `REQ-SFR-001` | 요구사항 | `src/lib/conditionRules.ts:260`, `app/task/[id].tsx:221` | 구현함 — housing × contract-holder document rules and requested-from details. |
| `REQ-SFR-002` | 요구사항 | `src/lib/departureTasks.ts:130`, `src/lib/departureTasks.ts:285`, `app/(tabs)/index.tsx:707`, `app/task/[id].tsx:706` | 구현함 (2026-07-28) — nine tasks G1–G9 with timing labels, the three prerequisites into the account closure, the Article 37(1) permanent/temporary branch, the unconfirmed overseas-cancellation guidance, and both deposit/account outcomes. |
| `REQ-DAR-002` | 요구사항 | `src/lib/taskState.ts:65`, `app/task/[id].tsx:393` | 구현함 — source URL, checked date, final authority, and conflict evidence are rendered. |
| `REQ-QUR-001` | 요구사항 | — | 구현 안 함 — the 50-item cultural mission audit is `MEM-01`/`DEC-024` out of scope; Step 7 audited the administrative slice only. |
| `REQ-SFR-003` | 요구사항 | `app/(tabs)/index.tsx:478`, `src/lib/taskState.ts:441` | 구현함 — available, blocked, and dependency-driven task derivation. |
| `REQ-SFR-004` | 요구사항 | `app/(tabs)/index.tsx:568` | 구현함 — not-applicable tasks remain visible with reason and official source. |
| `REQ-SFR-005` | 요구사항 | `src/lib/conditionRules.ts:418`, `app/(tabs)/index.tsx:232` | 구현함 — arrival-plus-90-day rule and KST deadline card. |
| `REQ-SFR-006` | 요구사항 | `app/(tabs)/index.tsx:646` | 구현함 — text warning for the single-entry visa and unissued residence card condition. |
| `REQ-SFR-007` | 요구사항 | `src/lib/immigrationAppointment.ts:60`, `src/lib/immigrationAppointment.ts:92`, `src/lib/taskState.ts:212` | 구현함 (2026-07-28) — the appointment is an independent task and a declared `dependsOn` of `housing-proof`; completing it without a date is allowed, no lead time is generated, and un-booking re-blocks the document task while keeping its completion. |
| `REQ-DAR-003` | 요구사항 | `app/(onboarding)/stay-length.tsx:1`, `src/lib/firebase.ts:72` | 구현함 — total stay days are entered, validated, and stored. |
| `REQ-SFR-008` | 요구사항 | `app/task/[id].tsx:624` | 구현함 — photo specification and no-photo-reuse warning are shown. |
| `REQ-SFR-009` | 요구사항 | `src/lib/dormitoryApplication.ts:44`, `src/lib/dormitoryApplication.ts:137`, `app/(tabs)/index.tsx:598` | 구현함 (2026-07-28) — an independent pre-arrival task keyed on `universityId`. ⛔ Every shipped deadline value is `null`: no university calendar was verified, so the structure exists and the value stays `미확인` with the office to ask. One school's date is never substituted for another's, and the task is never auto-completed. |
| `REQ-QUR-002` | 요구사항 | `app/(onboarding)/stay-length.tsx:1` | 구현함 — the onboarding label is “Stay length” rather than an ambiguous stay-type label. |
| `REQ-DAR-004` | 요구사항 | `app/(onboarding)/nationality.tsx:1` | 구현함 — nationality and home-country insurance are collected with explicit unknown. |
| `REQ-SFR-010` | 요구사항 | `app/task/[id].tsx:642` | 구현함 — address-change restriction while the residence card is being issued is shown with the final authority. |
| `REQ-DAR-005` | 요구사항 | `app/(onboarding)/housing.tsx:1` | 구현함 — registered business accommodation is a distinct housing option. |
| `REQ-SFR-011` | 요구사항 | `src/lib/conditionRules.ts:461`, `src/lib/__tests__/conditionRules.test.ts:202` | 구현함 — Yonsei-only `<28` group-registration block and `>=28` review-required boundary. |
| `REQ-SFR-012` | 요구사항 | `src/lib/dataExport.ts:88`, `src/lib/dataExport.ts:170`, `app/settings/export.tsx:1` | 구현함 (2026-07-28) — `SET-05` exports the ten condition groups and every task's state and completion time as text. An empty export is not reported as a success, a failed delivery is not called delivered, and a missing completion time reads `미확인` rather than being omitted. |

## Explicitly not mapped to implementation

- `REQ-P0-02` remains pending in the requirements SSOT; no value was invented for the visiting-student branch.
- `REQ-TER-003` offline/reconnect execution is not a current path after `DEC-026` deletions. The local onboarding-resume test is mapped to `TC-133`; full manual relaunch remains in the QA report.
- `REQ-TER-002` `save_failed`/`E8` is isolated because only the deletion portion of `DEC-026` is confirmed. `TC-160` is not used as an implementation basis.
