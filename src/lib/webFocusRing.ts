/**
 * Web keyboard focus indicator.
 *
 * `docs/ACCESSIBILITY.md` → "Web keyboard/focus" requires every actionable
 * element to carry a visible focus indicator at ≥3:1 contrast. React Native Web
 * ships `.r-outlineStyle-1ny4l3l { outline-style: none }` on every Pressable, so
 * without this module the app renders *zero* focus indication in a browser —
 * verified in Chrome: `getComputedStyle(el).outlineStyle === 'none'`.
 *
 * ## Why the ring is two-toned
 *
 * No single token clears 3:1 against both surfaces the app actually focuses on:
 *
 * | ring color | on canvas (#FFFFFF) | on ink (#222222) |
 * |------------|---------------------|------------------|
 * | `ink`      | 15.3:1 ✓            | —      ✗         |
 * | `rausch`   |  3.5:1 ✓            | 4.3:1  ✓ (thin)  |
 * | `muted`    |  5.0:1 ✓            | 3.1:1  ✓ (thin)  |
 *
 * Rausch and muted technically clear both, but Airbnb spends Rausch only on
 * CTAs and the save state — a focus ring is chrome, not brand. So the ring
 * pairs an `ink` outline with a `canvas` halo drawn into the outline's offset
 * gap. On light surfaces the outline is the visible ring; on the dark surfaces
 * (gallery header, mission-complete overlay) the outline disappears and the
 * halo carries it. Either way one of the two sits at 15.3:1.
 *
 * `:focus-visible` — not `:focus` — so pointer users never see the ring.
 */
import { Platform } from 'react-native';

import { palette } from '../../design-tokens';

const STYLE_ELEMENT_ID = 'kj-focus-ring';

/** Outer ring width, px. Matches the 3px minimum in WCAG 2.4.13 guidance. */
const RING_WIDTH = 3;
/** Gap between the element and the outer ring, filled by the halo. */
const RING_OFFSET = 2;

export const FOCUS_RING_CSS = `
:focus-visible {
  outline: ${RING_WIDTH}px solid ${palette.ink} !important;
  outline-offset: ${RING_OFFSET}px !important;
  box-shadow: 0 0 0 ${RING_OFFSET}px ${palette.canvas} !important;
}
:focus:not(:focus-visible) {
  outline: none !important;
}
`;

/**
 * Injects the focus ring stylesheet once. No-op off web and on repeat calls.
 * Call from the root layout so it lands before first paint.
 */
export function installWebFocusRing(): void {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = FOCUS_RING_CSS;
  // Appended last so it outranks React Native Web's own outline reset, which is
  // injected into an earlier stylesheet at the same specificity.
  document.head.appendChild(style);
}
