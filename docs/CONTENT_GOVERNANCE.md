# Content governance

## Purpose

Administrative and cultural guidance can become wrong while the app still builds successfully. Every claim that could affect eligibility, money, deadlines, safety, or legal status needs an owner and a freshness signal.

## Content classes

| Class | Examples | Required evidence | Review cadence |
|---|---|---|---|
| A — high consequence | visa, immigration, insurance, bank/telecom eligibility, deadlines | primary official source, URL, checked date, jurisdiction, fallback contact | before each release and every 30 days |
| B — operational | university office hours, dorm rules, transport process | official institution/operator source, checked date | every 90 days |
| C — experiential | food, places, etiquette, seasonal activities | reputable source or clearly labeled editorial guidance | every 180 days |
| U — user-authored | Want-to titles and items | no editorial verification; local only | not applicable |

## Required metadata

High-consequence content must be representable with:

This schema is implemented in `src/lib/contentEvidence.ts`. It adds `contentClass` and `finalAuthority` to the fields above, and derives the review date from the class rather than storing it, so a hand-written date cannot disagree with the cadence it belongs to.

The emergency guide carries it on every item (`src/data/emergency.ts`), and
all 55 cultural missions now carry it through `Mission.evidence` (see
`docs/MISSION_SOURCE_LEDGER.md`). Mission details must still avoid guarantees,
must display that prices, hours, requirements, and local rules can change, and
must not restate an administrative fact that the Essentials track derives from
conditions. A blank source URL is allowed only when verification is explicitly
`unknown` or `editorial`.

## Writing rules

- Never state a visa type, processing time, fee, or eligibility as universal when it depends on nationality, school, or date.
- Separate “commonly useful” advice from “required.”
- Prefer “Check with …” plus the final authority over false precision.
- Do not present a map hint as live navigation or an opening-hours guarantee.
- Keep English first; Korean in parentheses only where it helps identification.

## Release gate

1. Diff content files and list changed claims.
2. Re-check all changed Class A/B claims at their primary sources.
3. Run tests for counts, IDs, phase/category validity, and duplicate IDs.
4. Spot-check every mission detail for completion criteria and stale exact numbers.
5. Record unresolved claims as `needs_review` or `unknown`; do not silently publish them as verified.

## Non-interview validation backlog

- Create a source ledger for all 55 missions and university records. The
  mission portion is tracked in `docs/MISSION_SOURCE_LEDGER.md`; university
  records remain in the university verification backlog.
- Replace unqualified exact processing times and “mandatory/universal” wording.
- Conduct an expert desk review for immigration and insurance content.
- Run scenario walkthroughs for unknown nationality, unknown housing, no dates, and conflicting university guidance.
