# Byeongpung art direction and asset specification

## Product role

The byeongpung is the emotional payoff of K-Journey, not a decorative gallery. It must make a user understand three things in one glance: this is one folding screen, it belongs to the selected era, and their completed moments are revealing it.

## Composition

- Each era starts from one connected 8-panel master composition, then is sliced into eight assets.
- Horizon, clouds, water, branches, or shelf lines cross at least five of the seven seams.
- Each panel still has a recognisable motif so a single-panel save remains useful.
- The assembled view uses a dark wood/ink outer frame, warm metallic hinges or seams, and no card gaps.
- Do not place model watermarks, repeated corner marks, logos, or pseudo-signatures in generated artwork.

## Era distinction

| Era | Visual cues | Avoid |
|---|---|---|
| Silla | gold, celestial ornament, tomb/crown geometry, luminous mineral color | generic palace tourism imagery |
| Goryeo | celadon green, inlay rhythm, Buddhist/cloud-water calm, refined line | simply recoloring the Joseon set green |
| Joseon | ink, restrained mineral color, minhwa wit, bookshelf/flowers/animals | eight unrelated posters |

Historical labels describe an art-direction interpretation, not authenticated period artifacts. Marketing and UI copy must not call generated images “traditional originals.”

Chaekgeori emerged and became established in late Joseon, certainly by the
late eighteenth century; it is not period-authentic Silla or Goryeo imagery.
The Silla panel deliberately substitutes Buddhist sutra scrolls and ritual
objects, while the Goryeo panel substitutes Tripitaka woodblocks and Buddhist
scrolls. Those two panels are contemporary thematic adaptations of “books and
learning,” not reconstructions of chaekgeori from those periods. The detailed
mapping is preserved in `AI_IMAGE_PROMPTS.md` §§5.10 and 7.5.

## Reveal states

- Locked: artwork remains legible at roughly 30–40% visual presence with a translucent hanji wash.
- Partial: reveal is continuous within the next panel and announced as progress text.
- Complete: full color and contrast; seam and frame remain visible.
- Reduced motion: state changes instantly; no sweeping mask animation.

## Asset pipeline

- Working master: lossless, minimum 2640px total width, retained outside the app bundle.
- App panel target: about 330×1080px, optimized PNG/WebP as supported, normally under 700KB each.
- Bucket template target: 640×640px, normally under 900KB each.
- App-bundled total target for 24 panels + 6 templates: under 20MB.
- Preserve a provenance sheet per generation: prompt, model/version, date, editor, source/reference rights, modifications, and approval.

## QA checklist

- [x] One continuous scene reads at phone and desktop widths. (2026-08-30, 390×844 and 1440×900 captures plus all three masters)
- [x] No repeated watermark or accidental glyph. (2026-08-30 visual pass)
- [x] Faces, hands, architecture, Korean text, and animal anatomy have no obvious generation artifacts. (2026-08-30 visual pass; formal cultural approval remains separate)
- [x] Seams do not cut the main focal subject awkwardly. (2026-08-30 assembled-view pass)
- [x] Locked art remains distinguishable without looking completed. (2026-08-30, 5/48 state)
- [ ] 8-panel export and single-panel export crop correctly.
- [x] Three eras are distinguishable without reading the label. (Silla gold/crown, Goryeo celadon, Joseon ink/minhwa treatment)
- [x] Asset budget and first-load performance pass. (18.7MiB combined runtime art; see `docs/PERFORMANCE.md`)

The current runtime panels are slices of the three connected masters recorded in
`assets/byeongpung/masters/README.md`; they have been resized and edge-cropped
for runtime quality. The remaining export-crop checkbox requires a native
Save/Share artifact, not another connected-master redraw.
