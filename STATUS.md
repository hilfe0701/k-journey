# K-Journey current status

- Updated: 2026-08-04
- Branch: `v2-conditional-orchestration`
- Base HEAD before the current working changes: `9ccba15`
- Product SSOT: `reference/K-Journey_PRD_v2_0_KR.md` + `DEC-040`
- Current model: unified local-first product; no account or per-user server data

## Product

The current working tree unifies two axes:

- Journey → Essentials: condition-based administrative checklist
- Journey → Culture: 55 cultural/life missions across four phases
- Byeongpung: eight-panel progress from cultural missions + completed Want-to items
- Want to: six image-led templates and user-authored lists
- More: campus, gallery, emergency guide, settings, and data controls

Administrative task status does not unlock artwork. User-owned state is stored in MMKV on the current device.

## Quality work in this working tree

- consolidated missing-date UX and surfaced a first Culture action;
- added responsive 760px web shell;
- improved physical byeongpung framing, locked-state visibility, progress, and export affordances;
- replaced Want-to color swatches with artwork thumbnails and preselected templates;
- added mission completion criteria and changeable-information notice;
- made official sources and emergency numbers actionable;
- preserved browser deep links on refresh and detached inactive tabs;
- added residence-card editing and corrected unknown-state warning behavior;
- expanded text export to cultural missions and Want-to lists;
- exposed production local-data deletion;
- disabled session replay and documented the real local-data boundary;
- optimized 24 panel and 6 bucket images from about 76MB to about 17MB combined.
- subset runtime fonts from about 35MB to about 0.8MB; fresh web output is 23MB with
  4.96MB raw / 1.02MB gzip JavaScript.

## Accessibility pass

Three React Native Web behaviours had been silently voiding accepted criteria in
`docs/ACCESSIBILITY.md`. Each was verified in Chrome before and after; the native
build was unaffected in all three cases, which is why none surfaced in review.

- **No focus indicator at all.** RNW sets `outline-style: none` on every
  `Pressable`, so the web build shipped with nothing for keyboard users.
  `src/lib/webFocusRing.ts` installs a `:focus-visible` ring — a `meok` outline
  plus a `hanji` halo, because no single token clears 3:1 on both the hanji
  surfaces and the dark gallery/overlay headers.
- **`accessibilityState` dropped on web.** RNW's `Pressable` never forwards it,
  so 27 selected/checked/expanded states announced nothing — including the
  Essentials/Culture switch, the phase tabs, and every onboarding radio. Added
  `a11yState()` in `src/lib/a11y.ts`, which emits both dialects, and applied it
  at every call site.
- **`hitSlop` does not exist on web.** Icon controls sized to 44pt via `hitSlop`
  measured 24×24 in a browser. Added the `IconButton` primitive, which lays down
  a real 44×44 box and requires an `accessibilityLabel`, and converted every
  icon-only control to it.

Also fixed alongside: the tab bar overwrote its own bottom safe-area inset;
the Essentials/Culture buttons were 42pt; the gallery share button exposed no
disabled reason; bucket chips, template cards, item checkboxes, and the
notification switches carried no role, name, or state.

`DESIGN.md` §13.2 previously instructed using `hitSlop` to reach the 44pt floor —
the direct source of that defect class — and now says the opposite.

Verified across twelve routes at 500px and 1440px: zero undersized targets, zero
unnamed controls, zero stateful roles missing state. `npm run check` passes
(237 tests). Not yet re-verified: native iOS/Android and a real screen reader.

## Release verification pass — 2026-08-04

`npm run check` (30 suites, 253 tests, no lint warnings) and a fresh
`npm run build:web` both pass. The static export was then served with the
production catch-all rewrite and swept in Chromium at 390×844 and 1440×900.
Fourteen routes were entered by direct URL — the refresh case — and all
fourteen rendered their own screen: `/`, `/checklist`, `/byeongpung`,
`/wantto`, `/more`, `/mission/p1_pack`, two task routes, `/bucket/new`, a
created `/bucket/<id>`, `/campus`, `/emergency`, `/gallery`, `/settings`,
`/settings/export`. Zero undersized targets, unnamed controls, stateless roles,
horizontal overflow, or console errors at either width.

Exercised end to end in the browser: official-source links (open, 44pt),
emergency call controls, the residence-card unknown state, bucket creation plus
detail refresh, the full text export, and local-data deletion.

Four defects were found and fixed in this pass. Each one is invisible from the
code and correct on native:

- **Tab order walked into the inactive tab screen.** `aria-hidden` hides a
  subtree from a screen reader but leaves it focusable. On Byeongpung the
  accessibility tree exposed six controls while Tab reached the Journey task
  list, the Essentials/Culture switch, and "Emergency guide". Root views now
  spread `useInactiveScreen()`, which adds `inert` on web.
- **`Alert.alert` is an empty function in React Native Web.** "Delete all local
  data" therefore did nothing at all in a browser — the only local-erase
  control the product offers was unusable — as did deleting a Want-to list, the
  T2/T3 error tiers, and every share/save result. `src/lib/alert.ts` +
  `AlertHost` render them; deletion is verified working on web.
- **Analytics contacted PostHog with no key configured.** `disabled: true`
  stops capture but not the remote-config fetch, so every page load sent
  `GET .../array/phc_analytics_disabled/config` — a 404 per route. The client is
  no longer constructed without a real key.
- **Undersized web targets survived the last pass.** Official-source links were
  17px tall (`hitSlop` again), the notification "Open Settings" button 36pt.
  The gallery's 720px off-screen capture canvas sat at `left: 0`, so the page
  scrolled sideways at phone width. The emergency screen had no heading.

`scripts/a11y-audit.mjs` (`npm run audit:a11y`) now runs the whole sweep and
exits non-zero on any of these, so this class of defect fails a command instead
of waiting for a manual browser pass.

Final build: `dist` 23 MB total, artwork 18 MB, one JS bundle at 4.97 MB raw /
1.02 MB gzipped, 66 files.

Still not verified: native iOS/Android and a real screen reader.

## Deployment

The previously deployed web version is [k-journey-three.vercel.app](https://k-journey-three.vercel.app), deployment `dpl_6DHArMDvrJvYYWakQ4TenHDVKrPC`.

That deployment predates the current audit and reinforcement changes. Do not describe it as equivalent to this working tree. Nothing from this pass has been redeployed.

## Known release blockers

Cleared on 2026-08-04: `npm run check`, the rebuilt static export, and the
390×844 / 1440×900 browser pass over routes, refresh, tabs, links, export, and
deletion. Remaining:

- pin a clean commit SHA to any new deployment, and deploy only the `dist/`
  built from it;
- finish production privacy operator/contact/processor details;
- complete source metadata audit for volatile cultural, university, and
  emergency content;
- replace the independent-panel artwork with connected 8-panel masters when art
  production is authorized — three concept masters are staged, unapproved and
  not wired to runtime, under `assets/byeongpung/masters/`;
- verify on native iOS/Android with a real screen reader; every web fix in this
  pass was a browser-only behaviour, but the native paths have not been
  re-walked.

## Historical documents

Old Auth/Firestore/EAS instructions, PRD v1.x, and `DEC-024` cultural `Won't` language are historical. `CLAUDE.md` explains precedence. Do not execute those instructions as current release work.
