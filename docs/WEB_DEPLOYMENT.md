# K-Journey web deployment

Last verified: 2026-08-30 12:50 KST (Asia/Seoul)

## Production

- Public URL: https://k-journey-three.vercel.app
- Vercel project: `wodbs990701-3298s-projects/k-journey`
- Production deployment: `dpl_ACc75Xqubs9nbDWZp2nKfGbvoHc7` (`READY`)
- Previous production deployment (rollback): `dpl_CAW2wJRHYnzUxjyXmuRkD3JBaDcv`
- Build command: `npm run build:web`
- Output directory: `dist`
- Routing mode: Expo Router single-page export with a Vercel catch-all rewrite
- Source commit: `dd7c63d41e998f0c55aa0d22f9b55cd9369dae8c`
- Promoted from verified preview: `dpl_HfcpA2j1tqiUiJB3mNPjUU7zuA5E`
- Reproducibility: **proven locally and remotely** — clean `npm ci`, production
  export, asset/a11y checks, and stateful E2E passed
- Product parity: **current** — the public bundle exactly matches the verified
  preview bundle described below

## Release candidate

- Application source and deployed evidence: `dd7c63d41e998f0c55aa0d22f9b55cd9369dae8c`
- Pre-candidate code rollback: `29bdced736bf36b8b9c274b05547c6a54b10c2e5`
- Preview URL: `https://k-journey-6ozpe5y4f-wodbs990701-3298s-projects.vercel.app`
- Preview deployment: `dpl_HfcpA2j1tqiUiJB3mNPjUU7zuA5E` (`READY`)
- Verified: 2026-08-30 02:14 KST
- Remote build: clean `npm ci` + `npm run build:web`, pass
- Protected-route smoke: authenticated Vercel requests returned HTTP 200 for
  `/`, `/mission/p1_pack`, `/task/residence-registration`, `/bucket/new`,
  `/byeongpung`, `/gallery`, favicon, and the 5,747,403-byte JS bundle.
- Browser interaction/a11y evidence: the identical emitted bundle
  `entry-14b8e4c26c9378b09687ec776d5b9573.js` and byte size passed local stateful
  E2E and 14-route × two-viewport checks. GitHub Quality run `33264883881`
  independently passed the same source through all remote gates. The
  preview is team-login protected, so anonymous curl correctly redirects to
  Vercel SSO.
- Production promotion: completed with user approval at 2026-08-30 12:50 KST;
  Vercel created production deployment `dpl_ACc75Xqubs9nbDWZp2nKfGbvoHc7`
- Public smoke: unauthenticated requests to the production alias returned HTTP
  200 for the same routes, favicon, and exact 5,747,403-byte bundle

## Current build measurement

Measured 2026-08-30 from the release-candidate `npm run build:web` described in
`STATUS.md`:

| Item | Size |
|---|---|
| `dist/` total | 25 MB (65 files) |
| Artwork and fonts (`dist/assets`) | 19 MB |
| JavaScript, one bundle | 5,747,403 bytes raw / 1,129,378 bytes gzipped |

Build verification: `npm run build:web` completed with Expo 57.0.18 from the
release-candidate working tree. The build includes the 24 sliced byeongpung
runtime assets, source/freshness UI, typed actions, Want-to suggestions,
editable guidance conditions, permission-aware reminders, and current
administrative guidance.

Artwork still dominates the payload. The SDK 57 migration increased the web
bundle, but its 1,129,378-byte gzip size remains below the 1.25MB release block.

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
