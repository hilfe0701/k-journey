# Documentation map

## Current product and implementation

1. `../CLAUDE.md` — decision precedence and implementation guardrails
2. `../reference/K-Journey_PRD_v2_0_KR.md` — product SSOT
3. `JOURNEY_INTEGRATION_SPEC.md` — two-axis IA and completion contract
4. `LOCAL_DATA_LIFECYCLE.md` and `SECURITY.md` — actual device-local data boundary
5. `CONTENT_GOVERNANCE.md` — source and freshness policy
6. `BYEONGPUNG_ART_DIRECTION.md` — artwork quality and asset pipeline
7. `MEASUREMENT_AND_EXPERIMENTS.md` and `ANALYTICS_SCHEMA.md` — metrics without invented evidence
8. `architecture/*` — current runtime and ownership
9. `TESTING.md`, `ACCESSIBILITY.md`, `PERFORMANCE.md`, `RELEASE.md` — release gates

## Historical but retained

PRD v1.x, old Auth/Firestore/account/photo-upload ADRs, and dated `.work/pmjob` artifacts are kept as decision history and research evidence. They are not deleted because they explain how the project reached the current design.

When an older page says cultural missions or Byeongpung are `Won't`, `DEC-040` supersedes it. When it promises sign-in, cloud sync, account deletion, server export, or Firestore recovery, the current local-first docs supersede it.

## Update rule

A behavior change is incomplete until its owner document, privacy/data boundary, test case, and release consequence are updated. Do not solve contradictions by adding another unlabeled override; either update the current owner or mark the older claim historical at its source.
