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

```ts
type ContentEvidence = {
  sourceUrl: string;
  sourceTitle: string;
  publisher: string;
  checkedAt: string; // YYYY-MM-DD
  jurisdiction?: string;
  verification: 'verified' | 'needs_review' | 'editorial';
};
```

The current static cultural catalog predates this schema. Until metadata is added, mission details must avoid guarantees and display that prices, hours, requirements, and local rules can change.

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
5. Record unresolved claims as `needs_review`; do not silently publish them as verified.

## Non-interview validation backlog

- Create a source ledger for all 55 missions and university records.
- Replace unqualified exact processing times and “mandatory/universal” wording.
- Conduct an expert desk review for immigration and insurance content.
- Run scenario walkthroughs for unknown nationality, unknown housing, no dates, and conflicting university guidance.
