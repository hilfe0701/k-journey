# K-Journey current status

- Updated: 2026-08-02
- Branch: `v2-conditional-orchestration`
- Base HEAD before the current working changes: `4626ad1f4bf3`
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

## Deployment

The previously deployed web version is [k-journey-three.vercel.app](https://k-journey-three.vercel.app), deployment `dpl_6DHArMDvrJvYYWakQ4TenHDVKrPC`.

That deployment predates the current audit and reinforcement changes. Do not describe it as equivalent to this working tree. The current changes have not been committed or redeployed yet.

## Known release blockers

- complete `npm run check` and resolve all new failures/warnings;
- rebuild static web output after asset optimization;
- verify 390×844 and 1440×900 layouts, direct detail URL refresh, tabs, links, export, and reset;
- pin a clean commit SHA to any new deployment;
- finish production privacy operator/contact/processor details;
- complete source metadata audit for volatile cultural, university, and emergency content;
- replace the independent-panel artwork with connected 8-panel masters when art production is authorized.

## Historical documents

Old Auth/Firestore/EAS instructions, PRD v1.x, and `DEC-024` cultural `Won't` language are historical. `CLAUDE.md` explains precedence. Do not execute those instructions as current release work.
