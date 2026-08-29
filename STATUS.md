# K-Journey current status

- Updated: 2026-08-30
- Branch: `v2-conditional-orchestration`
- Base HEAD before this release-candidate work: `e9add7dfd63ffd245a15192c24013318eb34c44d`
- Release-candidate source SHA: `dd7c63d41e998f0c55aa0d22f9b55cd9369dae8c`
- Pre-candidate rollback SHA: `29bdced736bf36b8b9c274b05547c6a54b10c2e5`
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
- completed post-onboarding editing for every guidance condition, including an
  explicit Unknown state and safe journey-date reminder refresh;
- made notification refresh permission-aware, duplicate-safe, and serialized
  across rapid preference changes;
- replaced the invalid cross-launch clock-gap heuristic with foreground-only
  wall/monotonic sampling that discards background and suspend intervals;
- added current 2026 and official 2027 Korean public-holiday tables, including
  the 2026 Labor Day and Constitution Day amendment;
- added Android full-screen or per-panel byeongpung save selection, current
  cultural-source notes, and a no-alpha 1024×500 Play feature-graphic draft;
- made support and privacy rows actionable only for validated, explicitly
  configured public destinations, rather than invented placeholder contacts.

## Verification evidence — 2026-08-30

- `npm run check`: **41 suites / 353 tests**, typecheck and lint pass.
- `npm run build:web`: pass; `dist/` **25MB / 65 files**.
- JavaScript: **5,747,403 bytes raw / 1,129,378 bytes gzip**.
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
  sizes; evidence is stored in `docs/evidence/web-2026-08-30/`. The generated
  Play feature graphic was inspected at its exact 1024×500 RGB/no-alpha output.
- Independent final review: no blocking, high, or medium findings after the
  notification, clock, holiday, Settings, contact, and Android-save fixes.
- GitHub Quality run `33264883881`: all remote gates passed for source
  `dd7c63d41e998f0c55aa0d22f9b55cd9369dae8c`.
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

The protected release-candidate preview is
[k-journey-6ozpe5y4f-wodbs990701-3298s-projects.vercel.app](https://k-journey-6ozpe5y4f-wodbs990701-3298s-projects.vercel.app),
deployment `dpl_HfcpA2j1tqiUiJB3mNPjUU7zuA5E`. Vercel's clean `npm ci` and
Expo export passed; authenticated direct requests to `/`, mission, task,
bucket, byeongpung, and gallery routes plus the exact JS bundle all returned
HTTP 200. The preview was verified at 2026-08-30 02:14 KST. Production has not
been promoted.

## External release blockers

These cannot be invented or completed from the repository alone:

- legal operator name, address, contact, effective date, governing law,
  processor region/retention, and legal approval for the privacy notice;
- named human content owners, later one-off holidays, and the official 2028+
  Korean holiday tables;
- carrier/plan-specific overseas or proxy cancellation, the user's assigned
  dormitory schedule, and remaining high-volatility `needs_review` records;
- cultural/historical approval of the generated era artwork and motif copy;
- native VoiceOver/TalkBack, 200% text, Save/Share, and process-restart checks on
  real iOS/Android devices;
- exact signed-store-artifact Crashlytics behavior, retention, and final Play/App
  Store privacy forms;
- a real support email and public hosted privacy-policy URL.

## Historical documents

Old Auth/Firestore/EAS instructions, PRD v1.x, phase-plan checkboxes, and
`DEC-024` cultural `Won't` language are historical. `CLAUDE.md` explains
precedence; do not execute them as current work.
