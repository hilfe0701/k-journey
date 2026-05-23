# Accessibility (WCAG 2.1 AA)

> K-Journey commits to WCAG 2.1 Level AA. Decision authority: [ADR-0025](adr/0025-accessibility-wcag-2-1-aa.md). Visual rules: `DESIGN.md`.

## 1. Commitment

Target: **WCAG 2.1 AA** with the iOS/Android platform conventions on top. We do *not* claim AAA. We *do* commit to keeping VoiceOver and TalkBack navigable, Dynamic Type / Font Scale ±2 steps non-breaking, and Reduce Motion respected.

## 2. Per-component checklist

Every interactive component MUST set:

* `accessibilityLabel` — what it is.
* `accessibilityRole` — `button`, `tab`, `radio`, `header`, `link`, etc.
* `accessibilityState` — `{ selected, disabled, checked, busy, expanded }` as applicable.
* `accessibilityHint` (optional) — what tapping it will do, if non-obvious.

| Component | `Role` | `Label` formula | `State` |
|---|---|---|---|
| `ui/Button` | `button` | `title` prop | `{ disabled }` |
| `ui/Card` (pressable) | `button` | `accessibilityLabel` prop required when `onPress` set | — |
| `ui/Badge` | `text` | uppercase label as-is | — |
| `ui/ProgressBar` | `progressbar` | `${percent}% complete` | — |
| `home/DDayBanner` | `text` | `${dday} days until departure` (or `Departed N days ago` if negative) | — |
| `home/PhaseTabs` (each tab) | `tab` | phase name | `{ selected: phase === current }` |
| `home/JourneyCompletePrompt` (CTA) | `button` | "Open your gallery" | — |
| `byeongpung/ByeongpungStrip` | `image` | `Byeongpung — ${revealedPanels} of 8 panels revealed` | — |
| `byeongpung/PanelImage` | (decorative — `accessibilityElementsHidden`) | — | — |
| `mission/MissionCompleteOverlay` | — | `accessibilityViewIsModal=true`, `accessibilityLiveRegion="polite"` for the "Panel N unlocked" text | — |
| `bucket/[id]` item checkbox | `checkbox` | item text | `{ checked }` |
| `(onboarding)/sign-in` Apple button | `button` | "Sign in with Apple" | `{ busy: signingIn }` |
| `(onboarding)/dates` date picker | `button` | "Arrival date — ${formatted}" | `{ disabled }` |

## 3. Touch targets

iOS HIG: **≥ 44×44 pt**. Android Material: ≥ 48×48 dp.

Audit: any `<Pressable>`, `<TouchableOpacity>`, or `<Button>` with `style` that produces less than the minimum needs explicit `hitSlop` to reach the target, even if the visible chrome is smaller.

```tsx
<Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
  ...
</Pressable>
```

## 4. Colour contrast

Target ratios:
* Body text on background: **≥ 4.5:1**.
* Large text (18pt regular / 14pt bold): **≥ 3:1**.
* UI chrome (button borders, icon strokes): **≥ 3:1**.

Token-pair audit lives in `DESIGN.md` §2. Any new token introduced in `design-tokens.ts` MUST be checked against `semantic.bg.canvas`, `semantic.bg.surface`, and the three era palettes.

## 5. Dynamic Type / Font Scale

* iOS: `allowFontScaling=true` is the default and **MUST stay default** for all text except `<Badge>` micro labels (which would break a 12px design at +2 steps).
* Test: iOS Simulator → Settings → Accessibility → Display & Text Size → Larger Text → ±2 steps. Visual regression check on:
  * Home (DDayBanner + Phase tabs + first 3 mission cards)
  * Byeongpung (no text-driven layout)
  * Mission detail (long mission descriptions)
  * Onboarding dates picker
  * Bucket item list (long user text)

## 6. Reduce Motion

iOS / Android exposes a system flag. `src/lib/a11y.ts` (Part G) provides `useReduceMotion()` hook subscribed to `AccessibilityInfo`.

| Element | Default motion | Reduce-motion alternative |
|---|---|---|
| `MissionCompleteOverlay` | 4-stage choreography (~2.4s) — cardSink → inkRing → panelReveal → fadeUp | Cross-fade overlay 250ms, no scale/translate transforms |
| Byeongpung panel reveal on era switch | clipPath circle expand | Instant opacity swap |
| Card press feedback (scale 0.97) | 100ms transform | No transform, just opacity 0.8 |
| Tab switch indicator | translateX | No animation |
| ProgressBar fill | Animated.timing | Direct value |

## 7. Screen reader (VoiceOver / TalkBack) manual test plan

Run these on a real device (sim VoiceOver works but device is canonical).

| Scenario | Steps | Pass criteria |
|---|---|---|
| S1 Onboarding | VoiceOver on → cold start → sign in → arrive at dates → select arrival date | Each control announces label + role; dates picker announces selected date |
| S2 Home navigation | swipe through D-Day banner, phase tabs, mission cards | All announced; phase tabs announce selection state |
| S3 Mission complete | open a mission, tap Done | "Marked complete" feedback announced; if panel unlocks, "Panel N unlocked" announced via `accessibilityLiveRegion` |
| S4 Byeongpung | navigate to byeongpung tab | Strip announces total reveal; individual panels are decorative (skipped) |
| S5 Emergency | navigate to emergency | 112/119/1345 each announce; tap dials |

Document any failures in `docs/INCIDENT_RESPONSE.md` accessibility section.

## 8. Colour-blind sanity

Categories and phases use **icon + colour** in combination, never colour alone.

| Pair | Icon | Colour token |
|---|---|---|
| Mission category — Food | `utensils` | category.food |
| Mission category — Travel | `map-pin` | category.travel |
| Mission category — Culture | `landmark` | category.culture |
| Mission category — Living | `home` | category.living |
| Phase 1 | `plane-takeoff` | phase.1 |
| Phase 2 | `door-open` | phase.2 |
| Phase 3 | `compass` | phase.3 |
| Phase 4 | `sun-set` | phase.4 |

## 9. RTL

Not supported in MVP. Korean and English are LTR. RTL languages are V2.0 scope.

## 10. Roadmap

* **Round 2 Part G (current):** label/role/state rollout across all interactive components. Reduce-motion + Dynamic Type baseline.
* **V1.1:** `eslint-plugin-react-native-a11y` integrated.
* **V1.1:** scripted VoiceOver scenarios in Maestro or Detox.
* **V2:** RTL support tracked alongside multilingual rollout.

## 11. Links

* [ADR-0025](adr/0025-accessibility-wcag-2-1-aa.md)
* [ADR-0018](adr/0018-english-first-korean-parenthetical.md) — Korean parenthetical helps screen reader pronunciation
* `DESIGN.md` (colour tokens, type scale)
* [WCAG 2.1 AA quick reference](https://www.w3.org/WAI/WCAG21/quickref/?levels=a%2Caa)
