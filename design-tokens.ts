/**
 * K-Journey Design Tokens
 *
 * Single source of truth for colors, typography, spacing, radius, elevation.
 * Mirrors DESIGN.md. Era variants live in src/theme/eras.ts.
 */

export const palette = {
  // 적 (Jeok) — Red / South / Fire
  dancheong: '#C5302A',
  dancheongDeep: '#8B1A14',
  dancheongLight: '#F2D5D3',

  // 청 (Cheong) — Blue / East / Wood
  cheong: '#1A3A7A',
  cheongMid: '#2A5298',
  cheongLight: '#D0DBF2',

  // 황 (Hwang) — Yellow-Gold / Center / Earth
  hwanggeum: '#C4952A',
  hwanggeumDeep: '#9A7120',
  hwanggeumLight: '#F5E8C4',

  // 백 (Baek) — White / West / Metal
  hanji: '#FDFAF3',
  hwangto: '#F0E6CE',
  hwangtoDeep: '#E8D9BB',

  // 흑 (Heuk) — Black / North / Water
  meok: '#2C2416',
  meokMid: '#4A3F30',

  // Extended traditional palette
  jade: '#3D6B3A',
  jadeLight: '#CBE0CA',
  lotus: '#D4758A',
  lotusLight: '#F5D8DF',

  // Neutrals
  ash: '#6E6458',
  stone: '#9E9080',
  hairline: '#DDD5C4',
  cloud: '#F5EFE3',

  // Semantic
  error: '#B83025',
  success: '#3D6B3A',
  info: '#2A5298',
} as const;

export const semantic = {
  bg: {
    primary: palette.hanji,
    secondary: palette.hwangto,
    tertiary: palette.cloud,
    inverse: palette.meok,
  },
  fg: {
    primary: palette.meok,
    secondary: palette.ash,
    tertiary: palette.stone,
    inverse: palette.hanji,
    accent: palette.dancheong,
    link: palette.cheong,
  },
  border: {
    hairline: palette.hairline,
    focus: palette.meok,
  },
  cta: {
    bg: palette.dancheong,
    bgPressed: palette.dancheongDeep,
    text: palette.hanji,
  },
} as const;

export const phaseColors = {
  preArrival: palette.cheong,
  firstWeek: palette.hwanggeum,
  living: palette.jade,
  preDeparture: palette.dancheong,
} as const;

export const categoryColors = {
  settle: palette.cheong,
  food: palette.dancheong,
  activity: palette.jade,
  culture: palette.hwanggeum,
} as const;

export const typography = {
  family: {
    display: 'NotoSerifKR_700Bold',
    displayRegular: 'NotoSerifKR_500Medium',
    ui: 'Pretendard',
  },
  size: {
    hero: 56,
    display: 40,
    h1: 32,
    h2: 28,
    h3: 22,
    h4: 20,
    lead: 18,
    body: 16,
    sm: 14,
    xs: 12,
    micro: 11,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  lineHeight: {
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    display: -1.7,
    heading: -0.5,
    body: 0,
    badge: 0.4,
  },
} as const;

export const space = {
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
} as const;

export const radius = {
  sm: 4,
  md: 8,
  card: 12,
  lg: 20,
  pill: 28,
  full: 9999,
} as const;

export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  s1: {
    shadowColor: palette.meok,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  s2: {
    shadowColor: palette.meok,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  s3: {
    shadowColor: palette.meok,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  focus: {
    shadowColor: palette.meok,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

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
