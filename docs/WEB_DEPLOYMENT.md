# K-Journey web deployment

Last verified: 2026-08-29 (Asia/Seoul)

## Production

- Public URL: https://k-journey-three.vercel.app
- Vercel project: `wodbs990701-3298s-projects/k-journey`
- Production deployment: `dpl_6DHArMDvrJvYYWakQ4TenHDVKrPC`
- Previous production deployment (rollback): `dpl_4mVLsoEyKgK93AdfcUqQNdCCHKo3`
- Build command: `npm run build:web`
- Output directory: `dist`
- Routing mode: Expo Router single-page export with a Vercel catch-all rewrite
- Source commit: `3d61e32` (integrated local release source; documentation-only record follows this commit)
- Reproducibility: **proven locally** — clean commit, `npm run build:web`, and asset/a11y checks passed
- Product parity: **stale** — it predates the 2026-08-02 full audit and reinforcement work

Do not promote the existing `dist/` again. It was generated before the current image optimization and UI fixes.

## Current build measurement

Measured 2026-08-29 from `npm run build:web` after the source/content integration
pass described in `STATUS.md`:

| Item | Size |
|---|---|
| `dist/` total | 24 MB (64 files) |
| Artwork and fonts (`dist/assets`) | 19 MB |
| JavaScript, one bundle | 5.04 MB raw / 1.04 MB gzipped |

Build verification: `npm run build:web` completed with Expo 52.0.49 from the
integrated source. The build includes the 24 sliced byeongpung runtime assets and
the source/freshness UI.

Artwork dominates the payload; the JS bundle is unchanged by this pass.

## Release procedure

1. Review and commit the exact release source; record its SHA and rollback SHA.
2. Run `npm run check`, `npx expo-doctor`, and a fresh `npm run build:web`.
3. Run `npm run audit:a11y` against that build; it must exit zero.
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
- `npm audit` reports 38 transitive findings in the Expo 52 toolchain. Its proposed remediation upgrades Expo to 57 and React Native to 0.86, so it must be handled as a tested framework migration rather than an unattended production patch.
- iOS packaging, signing, TestFlight, and App Store release are intentionally deferred to the iOS release phase.
