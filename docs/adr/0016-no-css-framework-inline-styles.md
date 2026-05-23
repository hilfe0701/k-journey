# 0016. No CSS framework — inline RN styles + tokens

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `design-system`, `frontend`

## Context and Problem Statement

A standard RN project might reach for Tailwind (NativeWind), styled-components, or restyle. K-Journey deliberately uses **plain `StyleSheet.create` + inline style objects + design tokens** from `design-tokens.ts`.

Why? Because the token system (DESIGN.md, `design-tokens.ts`) is already the single source of truth for colour / type / spacing / radius / elevation. A CSS framework would either:
* Duplicate that system as utility classes (NativeWind), or
* Wrap it in a styled API that obscures token usage in code review.

## Decision Drivers

* Token discipline (CLAUDE.md MUST #1, NEVER #1, NEVER #20) is the entire design system. Anything that hides token references makes the discipline harder to enforce.
* RN's `StyleSheet` already supports all of CSS-in-JS's basics and is well-supported by Reanimated.
* Plain styles + tokens stay LLM-friendly for the "vibe coding" workflow.

## Considered Options

1. **Plain RN styles + token imports** (chosen)
2. **NativeWind (Tailwind for RN)**
3. **styled-components / Emotion**
4. **Restyle (Shopify's RN-native variant system)**

## Decision Outcome

**Chosen:** Plain RN styles + token imports. CLAUDE.md NEVER #17 forbids CSS frameworks.

### Positive Consequences
* Every colour in code is a direct `palette.X` or `semantic.Y` reference → token violations show up in git diff.
* No build-time CSS extraction; Metro stays simple.
* Reanimated worklets work without framework-bridge issues.

### Negative Consequences
* No utility-class shorthand → component styles are slightly more verbose.
* Variants (e.g. button sizes) are implemented as conditional style objects, not as a typed variant API. Acceptable at K-Journey component count (~30).

### Reversibility
Adding a framework later is possible but not without cost — every component would need migration.

## Pros and Cons of the Options

### Plain RN styles + tokens
* **+** Token discipline visible in diffs.
* **+** No build complexity.
* **−** Verbose at scale.

### NativeWind
* **+** Concise.
* **−** Hides token references; build pipeline complication.

### styled-components
* **+** Familiar to web devs.
* **−** Runtime cost; theme-prop drilling overhead.

### Restyle
* **+** Type-safe variants.
* **−** Adds a dependency for what design tokens already deliver.

## Links

* **PRD:** §11.1 (frontend), DESIGN.md (token system)
* **Project rules:** `CLAUDE.md` NEVER #17, MUST #1
* **Code:** `design-tokens.ts`, `src/components/ui/` (every component uses `StyleSheet.create` with token references)
* **Related ADRs:** [ADR-0017](0017-design-token-only-colors.md)
