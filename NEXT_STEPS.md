# K-Journey next steps

Ordered by release risk, not by document age.

## P0 — finish the current reinforcement

Done on 2026-08-04; evidence in "Release verification pass" in `STATUS.md`.
Repeat with `npm run check`, `npm run build:web`, and `npm run audit:a11y`
before any release. The audit covers items 2–4 and now fails the build on a
regression; items 5 and 6 stay manual.

## P0 — reproducible release

1. ~~Commit the integrated product and documentation with a clean source SHA.~~ Done: `2859ac6166ac06b50e8217764ce8af824869b94f`.
2. ~~Rebuild `dist/` from that SHA and deploy only that output.~~ Done in protected preview `dpl_4JQEFMTvu7D6q9i3HFxMaMa6JbMT` with clean remote `npm ci` + build.
3. ~~Record source SHA, deployment ID/URL, build command, verification date, and rollback target in `docs/WEB_DEPLOYMENT.md`.~~ Done 2026-08-30.
4. Run the same browser smoke test against production.

## P1 — content and art

1. ~~Add evidence metadata to 55 missions and volatile university/emergency facts.~~ Done 2026-08-29: 55-row ledger, university block evidence, emergency language-access provenance, and source UI.
2. ~~Remove or qualify exact costs, processing times, “mandatory,” and “universal” claims lacking a current primary source.~~ Done 2026-08-29: uncertain amounts are removed or routed to official live lookups with `needs_review`.
3. ~~Create one connected 8-panel master per era, keep provenance/licensing records, then slice and optimize it.~~ Done 2026-08-29: generated masters are recorded in `assets/byeongpung/masters/README.md` and sliced into 24 runtime assets. Cultural/visual approval remains a release review.
4. ~~Review Culture items that duplicate administrative tasks; move them, rename the axis, or define the distinct completion behavior.~~ Done 2026-08-30: the three legacy IDs remain stable for existing local completion records, but now represent distinct Korean-language and daily-life actions instead of visa/card/bank administration.

## P1 — product depth

1. ~~Add useful mission action types.~~ Done 2026-08-30: official-link, save-place, and reservation actions are typed, rendered, and attached only where a real next action exists. Checklist/reflection remain product options, not empty placeholders.
2. ~~Add component/E2E coverage for routes, 5→6 panel unlock, undo, Want-to creation/direct refresh, export/reset, and responsive layouts.~~ Done 2026-08-30: `npm run test:e2e:web` owns the stateful path; `npm run audit:a11y` owns the route and two-viewport sweep.
3. ~~Add web focus-visible treatment, audit all icon-only controls for 44×44 targets and labels, automate the DOM audit, and run it in CI.~~ Done — see "Accessibility pass" and "Release verification pass" in `STATUS.md`; `.github/workflows/quality.yml` runs the same gates with least-privilege permissions and pinned actions.
4. ~~Complete the portable backup/import design before making any restore promise.~~ Design complete in `docs/PORTABLE_BACKUP.md`; implementation remains intentionally unpromised until its acceptance criteria pass.

## Validation without interviews

- official-source desk review;
- cognitive walkthroughs for unknown dates and conditions;
- first-click tests for Essentials/Culture naming;
- 5-second tests for locked artwork legibility;
- automated accessibility, route, bundle, and asset checks.

Real interviews remain a separate later validation step and must not be simulated in reporting.
