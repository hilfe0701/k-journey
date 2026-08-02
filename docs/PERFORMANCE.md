# Performance budget

## Measured asset correction

Before the 2026-08-02 audit, the 24 byeongpung panels were about 49MB and the six bucket templates about 27MB. They were cropped to remove repeated edge marks and resized for their rendered dimensions.

Current source-asset targets and approximate post-optimization totals:

| Asset group | Count | Target | Current approximate total |
|---|---:|---:|---:|
| byeongpung panels | 24 | normally <700KB each | ~13MB |
| bucket templates | 6 | normally <900KB each | ~3.9MB |
| combined | 30 | <20MB | ~17MB |

The web audit also found about 35MB of full Korean font files. Runtime fonts are now local
subsets covering every glyph used by `app/` and `src/` plus Latin Extended (858 characters):
roughly 0.8MB total instead of 35MB. User-authored characters outside that subset rely on the
platform fallback font; regenerate the subsets whenever shipped UI/data introduces new glyphs.

Fresh 2026-08-02 production export after optimization: `dist/` 23MB; JavaScript
4,960,536 bytes raw / 1,017,350 bytes gzip. The previous output was 55MB before font
subsetting and 114MB before artwork optimization.

## Budgets

| Metric | Target | Block release at |
|---|---:|---:|
| artwork assets combined | <20MB | >25MB |
| single panel | <700KB typical | >1MB without documented reason |
| bucket template | <900KB | >1.2MB |
| initial web JS gzip | <1MB goal | >1.25MB |
| first actionable content | initial viewport or short scroll | more than one full viewport below mode control |
| interaction feedback | <100ms local response | >250ms |

## Practices

- Match source dimensions to maximum rendered size and high-density needs.
- Avoid loading/exporting all full-resolution artwork on the first tab unless needed.
- Keep wide web cards in the 760px app shell.
- Do not enable session replay or high-volume autocapture as an invisible performance cost.
- Measure after production static export, not from development Metro behavior.

## Release measurement

```bash
npm run build:web
du -sh dist
find dist -type f -print0 | xargs -0 du -h | sort -h | tail
```

Also record raw and gzip size of emitted JavaScript and test first load with a cold cache at mobile and desktop widths.
