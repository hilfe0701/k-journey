import { palette } from '../../design-tokens';

export type EraKey = 'joseon' | 'silla' | 'goryeo';

export interface EraTheme {
  key: EraKey;
  nameEn: string;
  nameKo: string;
  tagline: string;
  primary: string;
  accent: string;
  secondary: string;
  bgTint: string;
  panelBg: string;
  panelColors: readonly [string, string, string, string, string, string, string, string];
}

export const ERAS: Record<EraKey, EraTheme> = {
  joseon: {
    key: 'joseon',
    nameEn: 'Joseon',
    nameKo: '조선',
    tagline: 'Folk paintings (민화) and royal court decoration',
    primary: palette.dancheong,
    accent: palette.hwanggeum,
    secondary: palette.cheong,
    bgTint: palette.hanji,
    panelBg: '#F5E8C8',
    panelColors: [
      palette.dancheong,
      palette.lotus,
      palette.hwanggeum,
      palette.cheong,
      palette.jade,
      palette.lotus,
      palette.meok,
      palette.hwanggeum,
    ],
  },
  silla: {
    key: 'silla',
    nameEn: 'Silla',
    nameKo: '신라',
    tagline: 'Four guardian beasts (사신수) and Gyeongju gold',
    primary: palette.hwanggeum,
    accent: palette.dancheong,
    secondary: palette.cheong,
    bgTint: '#FDF8EE',
    panelBg: '#F0E0A0',
    panelColors: [
      palette.cheong,
      '#3D9BE8',
      palette.dancheong,
      '#E8563A',
      '#E8E8E8',
      '#C8C8C8',
      palette.meok,
      palette.hwanggeum,
    ],
  },
  goryeo: {
    key: 'goryeo',
    nameEn: 'Goryeo',
    nameKo: '고려',
    tagline: 'Buddhist paintings (불화) on celadon tones',
    primary: palette.cheong,
    accent: palette.jade,
    secondary: palette.hwanggeum,
    bgTint: '#F5F8F3',
    panelBg: '#D8E8D0',
    panelColors: [
      palette.jade,
      '#5A9A6A',
      palette.cheong,
      '#2A5AAA',
      palette.hwanggeum,
      '#D4A840',
      palette.lotus,
      palette.hwanggeum,
    ],
  },
};

export const ERA_LIST: EraTheme[] = [ERAS.joseon, ERAS.silla, ERAS.goryeo];
