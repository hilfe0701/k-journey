# K-Journey Design System

> **2026-08-04 — full visual redesign.** K-Journey now runs the **Airbnb design
> system**. The previous 한국 전통 회화 / obangsaek visual language has been retired
> as the interface language. This document replaces it and is the single source of
> truth for the visual system; every value maps 1:1 to `design-tokens.ts`.
>
> Product scope, flows, and data contracts are unchanged and still live in
> `reference/K-Journey_PRD_v2_0_KR.md`, `docs/JOURNEY_INTEGRATION_SPEC.md`, and
> `docs/LOCAL_DATA_LIFECYCLE.md`. This redesign touched presentation only.

---

## 1. Brand essence

A generous, image-led consumer surface. The base canvas is **pure white**, the ink
is a deep near-black, and a **single voltage of Rausch** (`#FF385C`) carries every
primary CTA and save state. There is no secondary brand color.

The governing idea: **imagery carries the visual weight, chrome stays quiet.** On
Airbnb that imagery is property photography. Here it is the byeongpung panels and
the minhwa bucket templates — which is why the artwork keeps its own full-color
pigments while everything around it goes white and ink.

**Tone**

- Bilingual-aware — English first, Korean proper nouns in parentheses: `Tteokbokki (떡볶이)`
- Minimal copy — let the artwork carry the emotional weight
- Sentence case everywhere; uppercase only on micro-labels and the `NEW` tag

**Anti-patterns**

- Tinted "state" surfaces (a blocked card must not wear the brand color)
- More than one shadow tier
- Hue-coded categories — categories are distinguished by icon and position
- Hard corners; every interactive element is rounded

---

## 2. Color

### Brand
| Token | Value | Use |
|---|---|---|
| `rausch` | `#FF385C` | Primary CTA fill, save/completion state, brand links. Used **scarcely** |
| `rauschActive` | `#E00B41` | Press state on primary CTAs |
| `rauschDisabled` | `#FFD1DA` | Disabled CTA fill |
| `luxe` / `plus` | `#460479` / `#92174D` | Sub-brand accents. Not used in mainline surfaces |

### Surface
| Token | Value | Use |
|---|---|---|
| `canvas` | `#FFFFFF` | Default page floor. There is no dark mode |
| `surfaceSoft` | `#F7F7F7` | Lightest fill — disabled fields, receded cards, icon plates |
| `surfaceStrong` | `#F2F2F2` | Circular icon-button surface |

### Hairlines
| Token | Value | Use |
|---|---|---|
| `hairline` | `#DDDDDD` | Default 1px border |
| `hairlineSoft` | `#EBEBEB` | Long-scroll editorial dividers |
| `borderStrong` | `#C1C1C1` | Disabled outline buttons |

### Text
| Token | Value | Use |
|---|---|---|
| `ink` | `#222222` | Dominant text. Never pure black. Also the star-rating color |
| `body` | `#3F3F3F` | Long-form running copy |
| `muted` | `#6A6A6A` | Sub-titles, inactive tabs, receded state |
| `mutedSoft` | `#929292` | Disabled text only |
| `onPrimary` | `#FFFFFF` | Label on Rausch |

### Semantic
`error` `#C13515` · `errorHover` `#B32505` · `legalLink` `#428BFF` · scrim `rgba(0,0,0,0.5)`

### Where Rausch is allowed
Primary CTA fill · mission/bucket completion (the save state) · the active bottom-nav
tab · inline brand links · today's date in the picker. **Nowhere else.** Warnings use
`error`; blocked and not-applicable states recede to `muted` on `surfaceSoft`.

### Phase and category identity
`phaseColors` and `categoryColors` all resolve to `ink`. Categories are told apart by
their Lucide icon and their position in the strip, not by hue — this keeps the single
Rausch voltage intact. Selection is drawn as ink-vs-hairline.

---

## 3. Typography

**One family for the entire scale: Pretendard.** Airbnb runs Cereal VF across display,
body, nav, and captions; Pretendard shares its geometric-humanist proportions and,
unlike Inter, carries full Hangul — which this product needs. There is no separate
display face, and the Noto Serif KR display faces have been removed from the bundle.

| Role | Size | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|
| `rating` | 64 | 700 | 1.1 | -1 | The one loud moment (see below) |
| `hero` | 32 | 700 | 1.2 | -0.44 | D-day countdown |
| `displayXl` | 28 | 700 | 1.43 | 0 | Screen h1 |
| `displayLg` | 22 | 500 | 1.18 | -0.44 | Detail h1 |
| `displayMd` | 21 | 700 | 1.43 | 0 | Section heads |
| `displaySm` | 20 | 600 | 1.20 | -0.18 | Sub-section titles |
| `titleMd` / `titleSm` | 16 | 600 / 500 | 1.25 | 0 | Card titles / column heads |
| `bodyMd` | 16 | 400 | 1.5 | 0 | Default running text |
| `bodySm` | 14 | 400 | 1.43 | 0 | Card meta, dates, prices |
| `caption` | 14 | 500 | 1.29 | 0 | Field labels |
| `captionSm` | 13 | 400 | 1.23 | 0 | Legal / fine print |
| `badge` | 11 | 600 | 1.18 | 0 | Floating badge text |
| `micro` | 12 | 700 | 1.33 | 0 | Micro-labels, tab labels |
| `tag` | 8 | 700 | 1.25 | 0.32 | `NEW` tag, uppercase |
| `buttonMd` / `buttonSm` | 16 / 14 | 500 | 1.25 / 1.29 | 0 | Button labels |
| `link` | 14 | 400 | 1.43 | 0 | Inline links |
| `navLink` | 16 | 600 | 1.25 | 0 | Product-nav labels |

**Display weights stay modest.** Screen h1 sits at 28/700 and detail h1 at 22/500 —
quieter than a typical SaaS page, because the artwork carries the hierarchy.

**Body text is weight 400**, not 500. This reverses the older rule and is deliberate.

**The one loud moment.** `rating` (64/700) is the only place the system trusts type
alone to carry hierarchy. In this product the equivalent signal is the **D-day
countdown**, which renders at `hero` (32/700) in the banner.

Legacy roles (`h1`–`h4`, `lead`, `body`, `sm`, `xs`, `display`) remain and are
remapped onto the scale above, so existing screens inherit the system unchanged.

---

## 4. Spacing and layout

Base unit **4px**, with a 2px micro-step.

`xxs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `base` 16 · `lg` 24 · `xl` 32 · `xxl` 48 · `section` 64

Numeric keys (`space[1]`…`space[24]`) are retained for existing call sites.

- **Card internal padding:** 24 (`lg`)
- **Card gutters:** 16 (`base`) — grids stay dense
- **Major bands:** 64 (`section`) — tighter than SaaS marketing on purpose
- **Content caps:** 1280 editorial / 1080 detail; the app shell caps at 760

The contrast is intentional: open hero, dense list below.

---

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `sm` | 8 | Buttons, inputs |
| `md` | 12 | Small surfaces |
| `card` | 14 | Cards, reservation/host surfaces, modals |
| `lg` | 16 | Larger panels |
| `xl` | 32 | Category strip shells |
| `pill` / `full` | 9999 | Badges, segmented controls, circular icon buttons |

Nothing in the system has a hard corner except the body grid itself.

---

## 6. Elevation

**One shadow tier plus flat.** That is the entire system.

- **Flat** — body, headers, footers, and ~95% of surfaces
- **`elevation.float`** — hover-floated cards, the featured card, dropdowns.
  Web renders Airbnb's exact three-layer stack, exported as `BOX_SHADOW_FLOAT`:
  `rgba(0,0,0,.02) 0 0 0 1px, rgba(0,0,0,.04) 0 2px 6px, rgba(0,0,0,.1) 0 4px 8px`
- **Scrim** — `SCRIM` (`rgba(0,0,0,0.5)`) behind modals

Legacy `s1`/`s2`/`s3` all collapse onto `float`. Depth comes from imagery,
white-on-white separation, and corner clipping — not from layered shadows.

---

## 7. Components

**Button** — `primary` is Rausch fill / white label, 48px tall, 8px radius, weight 500.
Press flips the fill to `rauschActive` with **no transform and no shadow change**.
`secondary` is white with a 1px ink outline. `ghost` is underlined ink text.
`pill` is a 40px stadium for compact actions.

**Card** — 14px clipping, 1px hairline, 24px padding over white. `raised` opts into
the one shadow tier; `borderless` drops the hairline for photo-first cells.

**Input** — 56px tall, 8px radius, 1px hairline, label stacked above in muted caption.
On focus the border thickens to 2px and flips to ink — **no glow, no ring**.

**Badge** — `soft` (chip on a tint), `float` (white pill over a photo, carrying the one
shadow tier), `tag` (the tiny uppercase `NEW` pill).

**PhaseTabs** — Airbnb's category strip: muted label on bare canvas, active label in ink
with a 2px ink underline.

**Bottom nav** — white, 1px top hairline, Rausch active tab, muted inactive.

**Date picker** — ink-filled selected days, white text, `surfaceSoft` range lozenge,
today in Rausch.

---

## 8. Accessibility

Verified by `npm run audit:a11y` at 390×844 and 1440×900 — 14 routes, zero undersized
targets, zero unnamed controls, zero overflow, zero inactive-tab focus leaks.

Measured contrast on the shipped palette:

| Pair | Ratio | AA normal |
|---|---|---|
| `ink` on `canvas` | 15.91 | pass |
| `body` on `canvas` | 10.53 | pass |
| `muted` on `canvas` | 5.41 | pass |
| `muted` on `surfaceSoft` | 5.05 | pass |
| `ink` on `surfaceSoft` | 14.85 | pass |
| `error` on `canvas` | 5.54 | pass |
| **`onPrimary` on `rausch`** | **3.52** | **fails AA for normal text** |
| `mutedSoft` on `canvas` | 3.11 | disabled text only — exempt |

> **Known gap, inherited from the Airbnb spec.** White on `#FF385C` measures 3.52:1.
> That clears AA for large text and UI components (3:1) but not for normal text
> (4.5:1), and our CTA label is 16px/500. This is the value Airbnb actually ships and
> the spec explicitly pairs `on-primary` with `primary`, so it is kept for fidelity.
> Swapping the CTA fill to `rauschActive` (`#E00B41`) reaches 4.89:1 and would close
> the gap with a one-line change in `semantic.cta.bg` — a product decision, not a
> visual-system one.

State is never carried by color alone: blocked tasks pair the muted surface with a
lock icon and a `BLOCKED` label; completed missions pair Rausch with a check glyph
and a strike-through. Explicit unknowns keep a distinct tone (`error`) so they never
collapse into the settled `ink` of a confirmed value.

**Captions over artwork** — `readableOn()` in `MissionCompleteOverlay` measures the
WCAG contrast of ink and white against the panel pigment and returns the stronger.
A fixed threshold mishandles mid-tones (Goryeo's `#D4A840` reads darkish at
luminance 0.42 but pairs 6.9:1 with ink versus 2.2:1 with white). Across all 13 era
pigments this yields 12 at AA-normal and 13 at AA-large; the floor is 4.25:1 on
Silla's `#E8563A`, which is the best achievable for that pigment and clears the 3:1
bar that its display-size caption is held to.

**Focus ring (web)** — a 3px `ink` outline with a `canvas` halo in the offset gap, so
one of the two always sits at 15.3:1 regardless of surface. `:focus-visible` only.

---

## 9. Verification

```bash
npm run check        # typecheck + lint + 253 tests
npm run build:web    # static export
npm run audit:a11y   # 390x844 and 1440x900 DOM audit
```
