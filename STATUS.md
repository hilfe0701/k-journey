# K-Journey current status

- Updated: 2026-08-30
- Branch: `v2-conditional-orchestration`
- Base HEAD before this release-candidate work: `e9add7dfd63ffd245a15192c24013318eb34c44d`
- Release-candidate source SHA: `2859ac6166ac06b50e8217764ce8af824869b94f`
- Pre-candidate rollback SHA: `e9add7dfd63ffd245a15192c24013318eb34c44d`
- Product SSOT: `reference/K-Journey_PRD_v2_0_KR.md` + `DEC-040`
- Current model: unified local-first product; no account or per-user server data

## Product

- Journey → Essentials: condition-based administrative guidance.
- Journey → Culture: 55 cultural/life missions across four phases.
- Byeongpung: eight-panel progress from cultural missions and completed Want-to items.
- Want to: six image-led templates, optional editorial suggestions, and user-authored lists.
- More: campus, gallery, emergency guide, settings, text export, and local reset.

Administrative state does not unlock artwork. User-owned journey state is stored
on the current device through MMKV.

## Release-candidate changes

- fixed KST calendar math so D-Day, scheduling, validation, and holiday behavior
  are independent of the device timezone and DST;
- added Sydney, Auckland, and Los Angeles timezone checks to CI;
- added the registered Seoul district input and connected it to immigration and
  local-office jurisdiction resolution;
- prevented unresolved review tasks from creating ghost completion state and
  exposed the actual jurisdiction, 1345, work-permission, and NHIS routes;
- fixed Jungnang-gu/Jung-gu parsing and hid internal production error messages;
- replaced the three Culture items that duplicated visa/card/bank administration
  while preserving their legacy IDs for existing device data;
- added typed official-link, save-place, and reservation mission actions, with
  recoverable platform-link failures;
- added optional Want-to suggestions and seasonal metadata for festival, Hangang,
  and hiking missions;
- corrected current official facts: 35,000 won residence-card fee, 15-day
  residence-change filing, HiKorea reservation scope, NHIS foreign-language
  extension 6, and D-2-6/D-2-8 labels;
- replaced cross-carrier telecom and dormitory refund assumptions with official
  carrier-specific conflicts and current-office confirmation;
- limited map actions to stable single places and corrected Gyeongbokgung access;
- added versioned portable-backup/import design without promising an unshipped
  import feature;
- removed unused Android read/write-storage and overlay permissions through
  Expo `blockedPermissions`, and removed unused iOS camera/photo-read descriptions;
- added least-privilege, SHA-pinned GitHub Actions quality gates;
- added failure-injection coverage for verified MMKV writes, malformed data,
  capture/share/save failures, denied photo permission, and link-handler rejection;
- migrated Expo 52 / React Native 0.76 to Expo 57 / React Native 0.86 and
  React 19, including the new architecture, Android SDK 36, Router/Reanimated
  compatibility, and React compiler lint rules;
- moved the function-based media-save flow to the SDK 57 legacy entry point so
  web routes do not load the native-only next API, and made both browser gates
  fail if the application error boundary renders;
- reduced the runtime dependency audit from 45 findings (3 critical) to 14
  moderate findings, with zero high or critical findings.

## Verification evidence — 2026-08-30

- `npm run check`: **38 suites / 338 tests**, typecheck and lint pass.
- `npm run build:web`: pass; `dist/` **25MB / 65 files**.
- JavaScript: **5,735,307 bytes raw / 1,126,811 bytes gzip**.
- Runtime panel + template art: **about 18.7MiB**, inside the 20MB budget.
- `npx expo-doctor`: **21/21 checks passed**.
- `npm audit --omit=dev`: **14 moderate, 0 high, 0 critical**; the remaining
  `xcode → uuid` path is Expo build tooling, and `npm audit fix --force` would
  incorrectly downgrade current Expo packages.
- `npm run audit:a11y`: 14 direct routes at 390×844 and 1440×900,
  zero undersized/unnamed/stateless controls, no horizontal overflow, and no
  inactive-tab focus leaks.
- `npm run test:e2e:web`: 5→6 panel unlock, undo, opt-in Want-to suggestion,
  direct bucket refresh, export scope, and confirmed reset all pass.
- Visual pass: connected art and locked-state legibility checked at both viewport
  sizes; all three era masters inspected directly.
- Clean Expo 57 Android/iOS prebuild: Android compile/target SDK 36 and new
  architecture enabled; no advertising ID, media-read, location, contact,
  camera, microphone, or account permission. Legacy storage, selected-media
  read, and overlay permissions are explicitly removed. iOS contains only the
  photo-library add description and initializes Firebase. The signed-artifact
  check is still required.
- Linked Vercel production environment: no environment variables, therefore no
  PostHog project key or custom host.

## Deployment

The public alias is [k-journey-three.vercel.app](https://k-journey-three.vercel.app),
currently deployment `dpl_CAW2wJRHYnzUxjyXmuRkD3JBaDcv` (created 2026-08-04).
It predates this release candidate and must not be described as current parity.
The verified preview, source SHA, and rollback record belong in
`docs/WEB_DEPLOYMENT.md` after the source is committed.

## External release blockers

These cannot be invented or completed from the repository alone:

- legal operator name, address, contact, effective date, governing law,
  processor region/retention, and legal approval for the privacy notice;
- named human content owners and the official 2027+ Korean holiday table;
- carrier/plan-specific overseas or proxy cancellation, the user's assigned
  dormitory schedule, and remaining high-volatility `needs_review` records;
- cultural/historical approval of the generated era artwork and motif copy;
- native VoiceOver/TalkBack, 200% text, Save/Share, and process-restart checks on
  real iOS/Android devices;
- exact signed-store-artifact Crashlytics behavior, retention, and final Play/App
  Store privacy forms.

## Historical documents

Old Auth/Firestore/EAS instructions, PRD v1.x, phase-plan checkboxes, and
`DEC-024` cultural `Won't` language are historical. `CLAUDE.md` explains
precedence; do not execute them as current work.
