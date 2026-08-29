# K-Journey web deployment

Last verified: 2026-08-29 (Asia/Seoul)

## Production

- Public URL: https://k-journey-three.vercel.app
- Vercel project: `wodbs990701-3298s-projects/k-journey`
- Production deployment: `dpl_CAW2wJRHYnzUxjyXmuRkD3JBaDcv`
- Previous production deployment (rollback): `dpl_6DHArMDvrJvYYWakQ4TenHDVKrPC`
- Build command: `npm run build:web`
- Output directory: `dist`
- Routing mode: Expo Router single-page export with a Vercel catch-all rewrite
- Source commit: not recorded in Vercel metadata for this 2026-08-04 CLI deployment
- Reproducibility: **proven locally** — clean commit, `npm run build:web`, and asset/a11y checks passed
- Product parity: **stale** — it predates the 2026-08-02 full audit and reinforcement work

Do not promote the existing `dist/` again. It was generated before the current image optimization and UI fixes.

## Release candidate

- Application source: `2859ac6166ac06b50e8217764ce8af824869b94f`
- Evidence commit deployed: `3d43566b618048849b71b4222cf580f35bd01742`
- Pre-candidate code rollback: `e9add7dfd63ffd245a15192c24013318eb34c44d`
- Preview URL: `https://k-journey-c6xithud6-wodbs990701-3298s-projects.vercel.app`
- Preview deployment: `dpl_4JQEFMTvu7D6q9i3HFxMaMa6JbMT` (`READY`)
- Verified: 2026-08-30 01:20 KST
- Remote build: clean `npm ci` + `npm run build:web`, pass
- Protected-route smoke: authenticated Vercel requests returned HTTP 200 for
  `/`, `/mission/p1_pack`, `/task/residence-registration`, `/bucket/new`,
  `/byeongpung`, `/gallery`, favicon, and the 5,735,307-byte JS bundle.
- Browser interaction/a11y evidence: the identical emitted bundle filename and
  byte size passed local stateful E2E and 14-route × two-viewport checks. The
  preview is team-login protected, so anonymous curl correctly redirects to
  Vercel SSO.
- Production promotion: requires explicit approval after preview verification

## Current build measurement

Measured 2026-08-30 from the release-candidate `npm run build:web` described in
`STATUS.md`:

| Item | Size |
|---|---|
| `dist/` total | 25 MB (65 files) |
| Artwork and fonts (`dist/assets`) | 19 MB |
| JavaScript, one bundle | 5,735,307 bytes raw / 1,126,811 bytes gzipped |

Build verification: `npm run build:web` completed with Expo 57.0.18 from the
release-candidate working tree. The build includes the 24 sliced byeongpung
runtime assets, source/freshness UI, typed actions, Want-to suggestions, and
current administrative guidance.

Artwork still dominates the payload. The SDK 57 migration increased the web
bundle, but its 1,126,811-byte gzip size remains below the 1.25MB release block.

## Release procedure

1. Review and commit the exact release source; record its SHA and rollback SHA.
2. Run `npm run check`, `npx expo-doctor`, and a fresh `npm run build:web`.
3. Run `npm run audit:a11y` and `npm run test:e2e:web` against that build; both must exit zero.
4. Record output, JS, and artwork sizes.
5. Create a protected preview with `npx vercel deploy --yes`.
6. Verify `/`, `/mission/p1_pack`, a task route, and a bucket route by direct refresh.
7. Verify 390×844 and 1440×900 layouts, inactive-tab accessibility, links, export, and browser console.
8. Promote the verified deployment with `npx vercel promote <preview-url> --yes`.
9. Record source SHA, preview/production deployment IDs, verifier, timestamp, and smoke result here.

## Rollback

If the app fails to boot, a direct route stops returning HTTP 200, or a release adds a blocking browser error, restore the last known-good production deployment from the Vercel dashboard or promote that deployment again. The production alias is moved atomically, so the public URL remains unchanged.

## Environment and account notes

- `EXPO_PUBLIC_*` values are embedded in the browser bundle. Only public client configuration belongs there.
- PostHog remains disabled until a real public project key is provided as `EXPO_PUBLIC_POSTHOG_API_KEY`.
- CLI deployments work. Git-triggered automatic deployments require connecting the GitHub login in the Vercel account and then linking `hilfe0701/k-journey`.
- Expo 57 / RN 0.86 / React 19 is now the verified release-candidate toolchain.
  `npm audit --omit=dev` reports 14 moderate findings and zero high/critical
  findings. All 14 are the Expo build-tooling `xcode → uuid` path; a forced
  audit fix proposes an invalid Expo package downgrade and is not used.
- iOS packaging, signing, TestFlight, and App Store release are intentionally deferred to the iOS release phase.
