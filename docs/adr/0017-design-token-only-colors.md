# 0017. Design-token only color policy

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `design-system`, `tokens`

## Context and Problem Statement

K-Journey's brand is built on the **obangsaek** (오방색) palette — five traditional Korean colours plus era-specific accents (joseon / silla / goryeo). The palette is curated, not arbitrary. A single off-palette colour ruins the visual unity.

Every colour referenced anywhere in K-Journey code MUST come from:
* `palette.X` (raw obangsaek tokens), or
* `semantic.Y` (purpose-named tokens: `semantic.text.primary`, `semantic.bg.surface`), or
* `phaseColors[phase]` / `categoryColors[category]` (mapping tokens), or
* the active era's `theme.era.*` (era-specific palette).

Direct hex strings (`#C5302A`, `'red'`) are forbidden. The only sanctioned hex outside tokens is the *image asset metadata*.

## Decision Drivers

* Brand integrity.
* Era theming requires runtime swapping — direct hex makes that impossible.
* Token violations are easy to grep for in review.
* DESIGN.md is the source of truth — if the palette must change, it changes in one place.

## Considered Options

1. **Design-token only — direct hex forbidden** (chosen)
2. **Recommend tokens; allow hex when "necessary"**
3. **Tokens + named CSS colour shortcuts**

## Decision Outcome

**Chosen:** Tokens only. CLAUDE.md MUST #1 + NEVER #1 + NEVER #20 enforce this. Adding a new colour requires updating DESIGN.md + `design-tokens.ts` first, then referencing.

### Positive Consequences
* Era swapping works (only byeongpung art re-renders; UI chrome stays).
* Grep-checkable: `/#[0-9a-fA-F]{3,6}/` in `src/` should be empty.
* Linting opportunity: a custom ESLint rule can fail PRs that introduce hex strings (planned in Part K).

### Negative Consequences
* Adding a one-off colour for a new feature is slightly slower (must update tokens first). Considered a *feature*: it forces the conversation about whether the new colour deserves to be in the system.
* The hex string in `AI_IMAGE_PROMPTS.md` (image generation prompts) is *not* code and is explicitly exempt.

### Reversibility
Reversible by deleting this ADR and the corresponding CLAUDE.md rules. Should not happen casually.

## Pros and Cons of the Options

### Tokens only
* **+** Brand integrity, theming works.
* **+** Lint-enforceable.
* **−** Slightly slower for one-offs.

### Recommend + allow exceptions
* **+** Pragmatic.
* **−** "Necessary" exceptions accumulate; brand degrades.

### Tokens + CSS shortcuts
* **+** Familiar to web devs.
* **−** RN doesn't have CSS colour keywords; defeats the purpose.

## Links

* **Project rules:** `CLAUDE.md` MUST #1, NEVER #1, NEVER #20
* **Code:** `design-tokens.ts`, `src/theme/eras.ts`, DESIGN.md §2
* **Related ADRs:** [ADR-0016](0016-no-css-framework-inline-styles.md)
