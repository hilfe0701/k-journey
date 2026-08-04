# K-Journey next steps

Ordered by release risk, not by document age.

## P0 — finish the current reinforcement

1. Run typecheck, lint, all unit tests, and the static web build.
2. Start the local web build and inspect 390×844 and 1440×900.
3. Verify direct refresh for `/mission/p1_pack`, a task detail, and a bucket detail.
4. Verify inactive tabs are absent from the web accessibility tree.
5. Exercise official-source links, emergency dial links, residence-card unknown state, full text export, and local-data deletion.
6. Record final asset and bundle sizes.

## P0 — reproducible release

1. Review the full dirty diff and separate unrelated user changes if needed.
2. Commit the integrated product and documentation with a clean source SHA.
3. Deploy only the newly generated `dist/` from that SHA.
4. Record source SHA, deployment ID/URL, build command, verification date, and rollback target in `docs/WEB_DEPLOYMENT.md`.
5. Run the same browser smoke test against production.

## P1 — content and art

1. Add evidence metadata to 55 missions and volatile university/emergency facts.
2. Remove or qualify exact costs, processing times, “mandatory,” and “universal” claims lacking a current primary source.
3. Create one connected 8-panel master per era, keep provenance/licensing records, then slice and optimize it.
4. Review Culture items that duplicate administrative tasks; move them, rename the axis, or define the distinct completion behavior.

## P1 — product depth

1. Add mission action types such as checklist, official link, save place, reservation, and reflection where they create real value.
2. Add component/E2E coverage for tabs, routes, first actions, 5→6 panel unlock, undo/delete, export/reset, and responsive layouts.
3. ~~Add web focus-visible treatment and audit all icon-only controls for 44×44 targets and labels.~~ Done — see "Accessibility pass" in `STATUS.md`. Still open: automate the DOM audit in `docs/ACCESSIBILITY.md` so it runs in CI instead of by hand.
4. Complete the portable backup/import design before making any restore promise.

## Validation without interviews

- official-source desk review;
- cognitive walkthroughs for unknown dates and conditions;
- first-click tests for Essentials/Culture naming;
- 5-second tests for locked artwork legibility;
- automated accessibility, route, bundle, and asset checks.

Real interviews remain a separate later validation step and must not be simulated in reporting.
