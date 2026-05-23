# 0018. English first, Korean parenthetical for proper nouns

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `i18n`, `copy`, `design-system`

## Context and Problem Statement

K-Journey's MVP target user is an English-speaking exchange student arriving in Korea. The product must be navigable on day one (no Korean reading skill required) but should still **introduce Korean culture authentically** — proper nouns, foods, places, customs all have meaning that doesn't survive translation.

Solution: every Korean proper noun is rendered as `English (한국어)` — e.g. *Try Tteokbokki (떡볶이)*, *Visit Gwangjang Market (광장시장)*. The English form is primary so the eye finds the actionable label first; the Korean is offered as cultural ground truth.

## Decision Drivers

* PRD §11.3: MVP English only.
* Target user can't read Hangul on arrival but will start to within weeks.
* Korean parenthetical helps users pronounce the word to taxi drivers / shop staff.
* Brand voice mixes English clarity with Korean cultural depth (DESIGN.md §1).

## Considered Options

1. **English first, Korean in parens for proper nouns** (chosen)
2. **English only**
3. **Korean primary, English subtitle**
4. **Locale-switched** (full Korean version)

## Decision Outcome

**Chosen:** `English (한국어)` for proper nouns. Sentence-case English. Korean follows natural Korean capitalisation (no rules — Hangul has no case). Only `<Badge>` micro-labels (11–12px) use ALL CAPS.

### Positive Consequences
* Day-one usable for English speakers.
* Cultural authenticity preserved.
* Pronounceable in the field with the Korean form.

### Negative Consequences
* Strings are longer; some component layouts must accommodate two-line labels.
* Translators (post-MVP, if ever) will need a clear strategy for the inverse direction.
* The rule applies to *proper nouns* — common UI verbs ("Save", "Cancel") stay English-only. Edge cases (does *Subway* the food count as a proper noun?) require judgement.

### Reversibility
Trivially reversible per string.

## Pros and Cons of the Options

### English first, Korean in parens
* **+** Best of both worlds.
* **−** String length.

### English only
* **+** Shortest strings.
* **−** Loses cultural depth.

### Korean primary
* **+** Authentic.
* **−** Day-one users can't read it.

### Locale-switched
* **+** Future-proof.
* **−** MVP scope explicitly excludes (§13.2).

## Links

* **PRD:** §11.3, §11.7 (i18n), DESIGN.md §11 (voice and copy rules)
* **Project rules:** `CLAUDE.md` MUST #3, MUST #4 (sentence case), NEVER #10 (no Korean-primary), NEVER #4 (no ALL CAPS outside badge)
* **Related ADRs:** [ADR-0017](0017-design-token-only-colors.md), [ADR-0025](0025-accessibility-wcag-2-1-aa.md) (accessibilityLabel must include the Korean parenthetical for screen reader pronunciation)
