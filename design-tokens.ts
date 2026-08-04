/**
 * K-Journey Design Tokens — Airbnb design system
 *
 * Single source of truth for colors, typography, spacing, radius, elevation.
 *
 * The system is Airbnb's: a pure white canvas, near-black ink, and a single
 * voltage of Rausch (#ff385c) carrying every primary CTA and save state. There
 * is no secondary brand color. Depth comes from photography, white-on-white
 * surface separation, and rounded-corner clipping rather than layered shadows —
 * the whole system has exactly one shadow tier.
 *
 * Legacy Korean-named palette keys (dancheong, hanji, meok, …) are retained as
 * aliases onto the Airbnb values so the ~50 existing consumers keep compiling
 * while they migrate to the canonical names below.
 */

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

export const palette = {
  // Brand — the single accent. Used scarcely: most surfaces are white + ink
  // with one or two Rausch moments.
  rausch: '#FF385C',
  rauschActive: '#E00B41',
  rauschDisabled: '#FFD1DA',

  // Sub-brand accents. Scoped to Luxe / Plus surfaces only — never mainline.
  luxe: '#460479',
  plus: '#92174D',

  // Surface. Airbnb has no dark mode on the public web.
  canvas: '#FFFFFF',
  surfaceSoft: '#F7F7F7',
  surfaceStrong: '#F2F2F2',

  // Hairlines and borders
  hairline: '#DDDDDD',
  hairlineSoft: '#EBEBEB',
  borderStrong: '#C1C1C1',

  // Text. Never pure black.
  ink: '#222222',
  body: '#3F3F3F',
  muted: '#6A6A6A',
  mutedSoft: '#929292',
  onPrimary: '#FFFFFF',

  // Semantic
  error: '#C13515',
  errorHover: '#B32505',
  legalLink: '#428BFF',
  success: '#222222',
  info: '#222222',

  // Scrim — rendered at 50% opacity at the call site.
  scrim: '#000000',

  // --- Legacy aliases (Korean palette). Remapped onto the Airbnb system. -----
  /** @deprecated use `rausch` */
  dancheong: '#FF385C',
  /** @deprecated use `rauschActive` */
  dancheongDeep: '#E00B41',
  /** @deprecated use `rauschDisabled` */
  dancheongLight: '#FFD1DA',
  /** @deprecated use `ink` */
  cheong: '#222222',
  /** @deprecated use `body` */
  cheongMid: '#3F3F3F',
  /** @deprecated use `surfaceSoft` */
  cheongLight: '#F7F7F7',
  /** @deprecated use `ink` */
  hwanggeum: '#222222',
  /** @deprecated use `ink` */
  hwanggeumDeep: '#222222',
  /** @deprecated use `surfaceSoft` */
  hwanggeumLight: '#F7F7F7',
  /** @deprecated use `canvas` */
  hanji: '#FFFFFF',
  /** @deprecated use `surfaceSoft` */
  hwangto: '#F7F7F7',
  /** @deprecated use `surfaceStrong` */
  hwangtoDeep: '#F2F2F2',
  /** @deprecated use `ink` */
  meok: '#222222',
  /** @deprecated use `body` */
  meokMid: '#3F3F3F',
  /** @deprecated use `ink` */
  jade: '#222222',
  /** @deprecated use `surfaceSoft` */
  jadeLight: '#F7F7F7',
  /** @deprecated use `rausch` */
  lotus: '#FF385C',
  /** @deprecated use `rauschDisabled` */
  lotusLight: '#FFD1DA',
  /** @deprecated use `muted` */
  ash: '#6A6A6A',
  /** @deprecated use `muted` */
  stone: '#6A6A6A',
  /** @deprecated use `surfaceSoft` */
  cloud: '#F7F7F7',
} as const;

export const semantic = {
  bg: {
    primary: palette.canvas,
    secondary: palette.surfaceSoft,
    tertiary: palette.surfaceStrong,
    inverse: palette.ink,
  },
  fg: {
    primary: palette.ink,
    secondary: palette.muted,
    tertiary: palette.mutedSoft,
    inverse: palette.canvas,
    accent: palette.rausch,
    link: palette.ink,
  },
  border: {
    hairline: palette.hairline,
    soft: palette.hairlineSoft,
    strong: palette.borderStrong,
    focus: palette.ink,
  },
  cta: {
    bg: palette.rausch,
    bgPressed: palette.rauschActive,
    bgDisabled: palette.rauschDisabled,
    text: palette.onPrimary,
  },
} as const;

/**
 * Phase and category identity.
 *
 * Airbnb distinguishes categories with illustrated icons and position, not hue —
 * the palette stays ink-dominant so Rausch keeps its single voltage. Both maps
 * resolve to ink; selection state is what turns Rausch.
 */
export const phaseColors = {
  preArrival: palette.ink,
  firstWeek: palette.ink,
  living: palette.ink,
  preDeparture: palette.ink,
} as const;

export const categoryColors = {
  settle: palette.ink,
  food: palette.ink,
  activity: palette.ink,
  culture: palette.ink,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Airbnb runs Cereal VF for everything — display, body, nav, captions. We run
 * Pretendard, which shares Cereal's geometric-humanist proportions and, unlike
 * Inter, carries full Hangul coverage. One family for the entire scale; there
 * is no separate display face.
 */
export const typography = {
  family: {
    display: 'Pretendard',
    displayRegular: 'Pretendard',
    ui: 'Pretendard',
  },
  size: {
    /** Listing-detail rating display — the one loud typographic moment. */
    rating: 64,
    hero: 32,
    display: 28,
    h1: 28,
    h2: 22,
    h3: 21,
    h4: 20,
    lead: 18,
    body: 16,
    sm: 14,
    xs: 13,
    micro: 12,
    badge: 11,
    tag: 8,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '700',
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.29,
    relaxed: 1.43,
    loose: 1.5,
  },
  letterSpacing: {
    rating: -1,
    display: -0.44,
    heading: -0.18,
    body: 0,
    badge: 0,
    tag: 0.32,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing — 4px base with a 2px micro-step
// ---------------------------------------------------------------------------

export const space = {
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
  20: 80,
  24: 96,

  // Named aliases
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Major page band rhythm. Tighter than SaaS marketing — marketplace pages
   *  need card density per scroll. */
  section: 64,
} as const;

// ---------------------------------------------------------------------------
// Radius — soft everywhere. Nothing in the system has a hard corner.
// ---------------------------------------------------------------------------

export const radius = {
  /** Buttons, inputs. */
  sm: 8,
  md: 12,
  /** Property cards, reservation card, host card. */
  card: 14,
  lg: 16,
  /** Category strip shells. */
  xl: 32,
  pill: 9999,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Elevation — one shadow tier plus the flat baseline. That is the whole system.
// ---------------------------------------------------------------------------

const NONE = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
} as const;

/**
 * The single shadow definition. Web renders the full three-layer stack
 * (`rgba(0,0,0,.02) 0 0 0 1px, rgba(0,0,0,.04) 0 2px 6px, rgba(0,0,0,.1) 0 4px 8px`);
 * native approximates it with the closest single offset/radius pair.
 */
const FLOAT = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
} as const;

export const elevation = {
  none: NONE,
  /** Card hover float, search bar at rest, dropdown menus. */
  float: FLOAT,
  // Legacy tiers collapse onto the one definition.
  /** @deprecated use `float` */
  s1: FLOAT,
  /** @deprecated use `float` */
  s2: FLOAT,
  /** @deprecated use `float` */
  s3: FLOAT,
  focus: NONE,
} as const;

/** Web-only box-shadow string matching Airbnb's exact three-layer stack. */
export const BOX_SHADOW_FLOAT =
  'rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0';

/** Global modal backdrop. */
export const SCRIM = 'rgba(0, 0, 0, 0.5)';

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const layout = {
  /** Editorial / homepage content cap. */
  maxContent: 1280,
  /** Listing-detail cap — keeps the photo banner and reservation rail readable. */
  maxDetail: 1080,
  breakpoint: {
    mobile: 744,
    tablet: 1128,
    desktop: 1440,
  },
  /** Minimum tap target. Airbnb ships primary CTAs above WCAG AAA. */
  touchTarget: 48,
} as const;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const motion = {
  hover: 200,
  panel: 300,
  splashTotal: 2200,
  missionComplete: {
    cardSink: 400,
    inkRingStagger: 120,
    panelReveal: 800,
    textFadeIn: 1000,
    total: 2400,
  },
  easing: {
    standard: [0.25, 0.46, 0.45, 0.94] as const,
  },
} as const;

export type Palette = typeof palette;
export type PaletteKey = keyof Palette;
export type PhaseKey = keyof typeof phaseColors;
export type CategoryKey = keyof typeof categoryColors;
