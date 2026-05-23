# 0008. Byeongpung PNG full-paintings (not SVG)

* **Status:** accepted (retroactive)
* **Date:** 2026-05-08 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `assets`, `byeongpung`, `design`

## Context and Problem Statement

Originally, byeongpung panels were SVG (`src/components/byeongpung/motifs.tsx`) with `currentColor` so a single asset could be tinted per era. This worked for line-art motifs but **didn't scale** when the brief widened to include full traditional paintings (사신수 for 신라, 불화 for 고려, 민화 for 조선) with multiple inks, gold leaf, and silk texture.

The team commissioned a 3-person Gemini-assisted generation pass (`project_image_gen_briefing_2026_05_08.md` and `project_image_gen_integration_2026_05_11.md` memories). Deliverable: **24 PNG panels** = 3 eras × 8 panels, each painted in era-specific colour.

## Decision Drivers

* Visual richness of full paintings exceeds what `currentColor`-tintable SVG can deliver.
* PNGs are easy to deliver from a multi-asset image-gen pipeline.
* Panel artwork is the brand's hero — degradation is unacceptable.
* PNG `require()` is statically bundled — no runtime fetch, no load-time skeleton needed.

## Considered Options

1. **24 era-specific PNGs** (3×8) — chosen
2. **8 SVGs with era-aware fills**
3. **8 PNGs with era-aware overlay** (one painting per panel, recoloured at runtime)
4. **3 era-specific atlases** (one big PNG per era, sliced at runtime)

## Decision Outcome

**Chosen:** 24 PNGs, one per (era, panel) pair, each baked with its era's colour and motif. The code's responsibility is *selection*, not styling.

### Positive Consequences
* Visual quality matches the brief; era differences are felt, not just labelled.
* Code path simplifies to `<Image source={BYEONGPUNG_PANEL_IMAGES[era][panel]} />`.
* `getInkColor()` deleted — no longer needed (code reduction is small but real).

### Negative Consequences
* Bundle size grew by ~6–8 MB (24 paintings + 6 bucket templates). Acceptable for the brand experience. **Implication for Wave 2 (2026-05-14)**: app store binary now ~50–55 MB on iOS / ~45–50 MB on Android, comfortably within typical limits but worth tracking via PERFORMANCE.md `App size ≤ 60 MB` budget.
* If the brand later adds a 4th era, that's 8 new PNGs from the same artist family.
* **PNG load failure** is a real risk on low-storage devices or corrupted bundles. Mitigation: `<Image onError>` → ink-colour solid fallback (see Part E.6 in plan).
* **Low-spec device fallback (Wave 2 boost)**: on devices with < 2 GB RAM (detected via `expo-device`), defer loading of full-resolution byeongpung panels for non-revealed positions — render the dark "unrevealed" placeholder swatch instead of preloading. Cuts startup memory ~3 MB on phones like Galaxy A12. Reveal on threshold crossing still uses full PNG.
* **Lazy loading policy (Wave 2 boost)**: only the **3 panels around the user's current position** (current + previous + next likely-to-unlock) are bundled into the initial render. Other 5 panels lazy-load on scroll using `<Image>`'s native deferred decoding. Cold-start byeongpung paint stays under PERFORMANCE.md `TTI ≤ 200ms` target.
* **Bundle weight per era split (Wave 2 visibility)**: joseon ~2.4 MB / silla ~2.6 MB / goryeo ~2.3 MB. If a future era's PNGs exceed 3 MB cumulatively, the artist must compress or the era must be split into a "lite" panel set.

### Reversibility
Possible but expensive — would mean re-commissioning SVG artwork. Treat as one-way.

## Pros and Cons of the Options

### 24 era-specific PNGs
* **+** Brand-quality output.
* **+** Simple code.
* **−** Larger bundle; no runtime tint.

### 8 SVGs + era fill
* **+** Smaller bundle, code-tintable.
* **−** Hits the ceiling of what tinted SVG can express; doesn't match full-painting brief.

### 8 PNGs + runtime overlay
* **+** Smaller asset count.
* **−** Runtime overlay rarely matches a hand-painted era version.

### Era atlases
* **+** Fewer files.
* **−** Image slicing in RN is awkward; subview cropping causes layout drift on iOS/Android.

## Links

* **PRD:** §6.3 (era-specific byeongpung paintings)
* **Code:** `src/components/byeongpung/motifs.tsx` (BYEONGPUNG_PANEL_IMAGES + BUCKET_TEMPLATE_IMAGES), `app/(tabs)/byeongpung.tsx`, `app/gallery.tsx`
* **Asset brief:** `AI_IMAGE_PROMPTS.md`
* **Memories:** `project_image_gen_briefing_2026_05_08.md`, `project_image_gen_integration_2026_05_11.md`
* **Related ADRs:** [ADR-0017](0017-design-token-only-colors.md) (panel colours still come from era tokens for UI chrome around the painting)
