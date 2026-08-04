# K-Journey next steps

Ordered by release risk, not by document age.

## P0 — finish the current reinforcement

Done on 2026-08-04; evidence in "Release verification pass" in `STATUS.md`.
Repeat with `npm run check`, `npm run build:web`, and `npm run audit:a11y`
before any release. The audit covers items 2–4 and now fails the build on a
regression; items 5 and 6 stay manual.

## P0 — reproducible release

1. Commit the integrated product and documentation with a clean source SHA.
2. Rebuild `dist/` from that SHA and deploy only that output.
3. Record source SHA, deployment ID/URL, build command, verification date, and rollback target in `docs/WEB_DEPLOYMENT.md`.
4. Run the same browser smoke test against production.

## P1 — content and art

1. Add evidence metadata to 55 missions and volatile university/emergency facts.
2. Remove or qualify exact costs, processing times, “mandatory,” and “universal” claims lacking a current primary source.
3. Create one connected 8-panel master per era, keep provenance/licensing records, then slice and optimize it.
4. Review Culture items that duplicate administrative tasks; move them, rename the axis, or define the distinct completion behavior.

## P1 — product depth

1. Add mission action types such as checklist, official link, save place, reservation, and reflection where they create real value.
2. Add component/E2E coverage for tabs, routes, first actions, 5→6 panel unlock, undo/delete, export/reset, and responsive layouts.
3. ~~Add web focus-visible treatment and audit all icon-only controls for 44×44 targets and labels. Automate the DOM audit so it runs as a command instead of by hand.~~ Done — see "Accessibility pass" and "Release verification pass" in `STATUS.md`. `npm run audit:a11y` runs it; wiring that command into CI is the remaining step.
4. Complete the portable backup/import design before making any restore promise.

## Validation without interviews

- official-source desk review;
- cognitive walkthroughs for unknown dates and conditions;
- first-click tests for Essentials/Culture naming;
- 5-second tests for locked artwork legibility;
- automated accessibility, route, bundle, and asset checks.

Real interviews remain a separate later validation step and must not be simulated in reporting.
