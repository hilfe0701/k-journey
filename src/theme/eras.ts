import { palette } from '../../design-tokens';

export type EraKey = 'joseon' | 'silla' | 'goryeo';

export interface EraTheme {
  key: EraKey;
  nameEn: string;
  nameKo: string;
  tagline: string;
  /** Chrome accent. Airbnb runs a single voltage, so every era resolves to Rausch. */
  primary: string;
  accent: string;
  secondary: string;
  /** Page floor. Airbnb's canvas is pure white regardless of era. */
  bgTint: string;
  /** Artwork ground — belongs to the panel art, not the UI chrome. */
  panelBg: string;
  /**
   * Artwork pigments. These are deliberately NOT drawn from the UI palette:
   * the byeongpung plays the role photography plays on Airbnb, carrying the
   * visual weight while the surrounding chrome stays white and ink. Flattening
   * these to the chrome palette would erase the reward.
   */
  panelColors: readonly [string, string, string, string, string, string, string, string];
}

export const ERAS: Record<EraKey, EraTheme> = {
  joseon: {
    key: 'joseon',
    nameEn: 'Joseon',
    nameKo: '조선',
    tagline: 'Folk paintings (민화) and royal court decoration',
    primary: palette.rausch,
    accent: palette.ink,
    secondary: palette.muted,
    bgTint: palette.canvas,
    panelBg: '#F5E8C8',
    panelColors: [
      '#C5302A',
      '#D4758A',
      '#C4952A',
      '#1A3A7A',
      '#3D6B3A',
      '#D4758A',
      '#2C2416',
      '#C4952A',
    ],
  },
  silla: {
    key: 'silla',
    nameEn: 'Silla',
    nameKo: '신라',
    tagline: 'Four guardian beasts (사신수) and Gyeongju gold',
    primary: palette.rausch,
    accent: palette.ink,
    secondary: palette.muted,
    bgTint: palette.canvas,
    panelBg: '#F0E0A0',
    panelColors: [
      '#1A3A7A',
      '#3D9BE8',
      '#C5302A',
      '#E8563A',
      '#E8E8E8',
      '#C8C8C8',
      '#2C2416',
      '#C4952A',
    ],
  },
  goryeo: {
    key: 'goryeo',
    nameEn: 'Goryeo',
    nameKo: '고려',
    tagline: 'Buddhist paintings (불화) on celadon tones',
    primary: palette.rausch,
    accent: palette.ink,
    secondary: palette.muted,
    bgTint: palette.canvas,
    panelBg: '#D8E8D0',
    panelColors: [
      '#3D6B3A',
      '#5A9A6A',
      '#1A3A7A',
      '#2A5AAA',
      '#C4952A',
      '#D4A840',
      '#D4758A',
      '#C4952A',
    ],
  },
};

export const ERA_LIST: EraTheme[] = [ERAS.joseon, ERAS.silla, ERAS.goryeo];
