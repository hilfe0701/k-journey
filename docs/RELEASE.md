# Release checklist

## Source and decision gate

- [x] PRD v2.0, `DEC-040`, ADR-0036, and current code agree.
- [x] Working tree reviewed; release source committed (`2859ac6166ac06b50e8217764ce8af824869b94f`).
- [x] Source commit SHA and rollback SHA (`e9add7dfd63ffd245a15192c24013318eb34c44d`) recorded.
- [x] No historical Auth/Firestore instructions are being executed.

## Quality gate

- [x] `npm run check` passes without avoidable warnings. (38 suites / 338 tests, 2026-08-30)
- [x] `npm run build:web` succeeds. (2026-08-30)
- [x] Asset, JS, and output sizes meet `docs/PERFORMANCE.md`.
- [x] Integrated web scenarios in `docs/TESTING.md` pass through `audit:a11y` and `test:e2e:web`.
- [ ] Privacy notice and store disclosures match the exact build configuration.

## Web release

Protected preview `dpl_4JQEFMTvu7D6q9i3HFxMaMa6JbMT` is ready and its
direct routes/assets return HTTP 200 through Vercel's authenticated verifier.
Production promotion and the public-alias smoke below remain pending explicit
approval.

1. Build fresh static output from the pinned commit.
2. Deploy with SPA route rewrite configuration.
3. Record URL, provider deployment ID, source SHA, build command, environment, timestamp, and rollback target in `docs/WEB_DEPLOYMENT.md`.
4. Verify production at 390×844 and 1440×900.
5. Refresh direct mission/task/bucket URLs.
6. Check console/network failures, official links, export, and artwork load.

## Native release

- Inspect signed artifact permissions and SDK collection behavior.
- Verify notifications, Save/Share permission denial, offline restart, reset, and text scaling.
- Complete operator/legal details and store privacy forms.
- Do not promise account restore or reviewer login; the product has no account.

## Rollback

Rollback restores the last verified artifact/deployment. Local schema changes must remain backward-safe or include a documented migration/downgrade decision; rolling back code must not silently destroy MMKV data.
