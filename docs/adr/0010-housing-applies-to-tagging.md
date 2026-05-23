# 0010. Housing-specific mission tagging (`appliesTo`)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-05 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `missions`, `data-model`

## Context and Problem Statement

PRD §8.2 mandates content branching by housing type — dormitory vs. off-campus. Some Have-To missions only make sense for one population (e.g. "check dormitory check-in procedures" vs. "find your nearest 빨래방 / laundromat"). The data model needs to distinguish *universal* missions from *housing-conditional* ones without splitting the mission list.

A bug surfaced during Phase B QA where the home screen denominator ("X of 50 done") was computed by `MISSIONS.length` — even though the rendered list filtered to ~42 for off-campus users. The numerator and denominator disagreed, making the progress bar stuck below 100%.

## Decision Drivers

* One canonical mission catalogue, not three.
* The denominator everywhere must equal the count of *missions the user will ever see*.
* Future-proof: a third housing variant (homestay?) shouldn't require a schema migration.

## Considered Options

1. **Tag each housing-conditional mission with `appliesTo: 'dormitory' | 'off-campus'`**; missions without the field apply to both. Filter via `missionsForHousing(housing)`. (Chosen)
2. **Two separate mission arrays** `MISSIONS_DORM`, `MISSIONS_OFF` — duplicate the universal entries
3. **Boolean flags** `dormOnly: true`, `offCampusOnly: true`

## Decision Outcome

**Chosen:** `appliesTo?: 'dormitory' | 'off-campus'` field. Missions without the field are universal (applies to both). Always render via `missionsForHousing(housing)` (§15 of CLAUDE.md MUST list).

### Positive Consequences
* Single source of truth (`src/data/missions.ts`).
* Denominator everywhere flows through one helper → no numerator/denominator drift.
* Adding a third housing type would extend the union, not duplicate data.

### Negative Consequences
* Anyone iterating `MISSIONS` directly bypasses the filter and reintroduces the bug. CLAUDE.md MUST #15 forbids this; ADR-0011 reinforces it.
* The `appliesTo` field is optional, which means data authors must remember to *omit* it for universal missions; adding it accidentally would hide a mission from one half of users.

### Reversibility
Trivially reversible (delete the field; revert filter to `MISSIONS`). Has zero downstream impact if migrated carefully.

## Pros and Cons of the Options

### `appliesTo` field + filter helper
* **+** Single catalogue, single denominator path.
* **−** Requires discipline at call site.

### Two arrays
* **+** Static-typed exhaustiveness.
* **−** Duplicate universal missions; sync drift over time.

### Boolean flags
* **+** Familiar pattern.
* **−** Two flags can both be true / both false — undefined semantics.

## Links

* **PRD:** §8.2, §8.3 (mid-journey housing change is a follow-up)
* **Project rules:** `CLAUDE.md` MUST #15
* **Code:** `src/data/missions.ts` (Mission type + MISSIONS + `missionsForHousing`), `app/(tabs)/index.tsx` (uses filter), `src/components/home/DDayBanner.tsx` (denominator)
* **Tests:** `src/data/__tests__/missions.test.ts`
* **Related ADRs:** [ADR-0011](0011-single-source-completion-aggregation.md)
