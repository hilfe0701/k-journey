# Release checklist

## Source and decision gate

- [x] PRD v2.0, `DEC-040`, ADR-0036, and current code agree.
- [x] Working tree reviewed; release source committed (`dd7c63d41e998f0c55aa0d22f9b55cd9369dae8c`).
- [x] Source commit SHA and rollback SHA (`29bdced736bf36b8b9c274b05547c6a54b10c2e5`) recorded.
- [x] No historical Auth/Firestore instructions are being executed.

## Quality gate

- [x] `npm run check` passes without avoidable warnings. (41 suites / 353 tests, 2026-08-30)
- [x] `npm run build:web` succeeds. (2026-08-30)
- [x] Asset, JS, and output sizes meet `docs/PERFORMANCE.md`.
- [x] Integrated web scenarios in `docs/TESTING.md` pass through `audit:a11y` and `test:e2e:web`.
- [ ] Privacy notice and store disclosures match the exact build configuration.

## Web release

Protected preview `dpl_HfcpA2j1tqiUiJB3mNPjUU7zuA5E` is ready and its
direct routes/assets return HTTP 200 through Vercel's authenticated verifier.
With explicit user approval it was promoted to production deployment
`dpl_ACc75Xqubs9nbDWZp2nKfGbvoHc7`. Unauthenticated public-alias requests to
all required routes, favicon, and the exact bundle return HTTP 200.

- [x] Build fresh static output from the pinned commit.
- [x] Deploy with SPA route rewrite configuration.
- [x] Record URL, provider deployment ID, source SHA, build command,
  environment, timestamp, and rollback target in `docs/WEB_DEPLOYMENT.md`.
- [x] Verify the exact production bundle at 390×844 and 1440×900.
- [x] Refresh direct mission/task/bucket URLs on the public alias.
- [x] Check browser failures, links, export, reset, and artwork through the
  identical-bundle accessibility/E2E gates and public route smoke.

## Native release

- Inspect signed artifact permissions and SDK collection behavior.
- Verify notifications, Save/Share permission denial, offline restart, reset, and text scaling.
- Complete operator/legal details and store privacy forms.
- Do not promise account restore or reviewer login; the product has no account.

## Rollback

Rollback restores the last verified artifact/deployment. Local schema changes must remain backward-safe or include a documented migration/downgrade decision; rolling back code must not silently destroy MMKV data.
