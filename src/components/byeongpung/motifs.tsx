import type { ImageSourcePropType } from 'react-native';
import type { BucketTemplateKey } from '../../data/bucketTemplates';
import type { EraKey } from '../../theme/eras';

export const PANEL_MOTIF_KEYS = [
  'peony',
  'crane',
  'tiger',
  'lotus',
  'mountain',
  'wave',
  'sun',
  'chaekgeori',
] as const;

export type PanelMotifKey = (typeof PANEL_MOTIF_KEYS)[number];

export const PANEL_MOTIF_NAMES = [
  'Peony',
  'Crane',
  'Tiger',
  'Lotus',
  'Mountain',
  'Wave',
  'Sun',
  'Chaekgeori',
] as const;

type PanelTuple = readonly [
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
  ImageSourcePropType,
];

export const BYEONGPUNG_PANEL_IMAGES: Record<EraKey, PanelTuple> = {
  joseon: [
    require('../../../assets/byeongpung/byeongpung_joseon_peony.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_crane.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_tiger.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_lotus.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_mountain.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_wave.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_sun.png'),
    require('../../../assets/byeongpung/byeongpung_joseon_chaekgeori.png'),
  ],
  silla: [
    require('../../../assets/byeongpung/byeongpung_silla_peony.png'),
    require('../../../assets/byeongpung/byeongpung_silla_crane.png'),
    require('../../../assets/byeongpung/byeongpung_silla_tiger.png'),
    require('../../../assets/byeongpung/byeongpung_silla_lotus.png'),
    require('../../../assets/byeongpung/byeongpung_silla_mountain.png'),
    require('../../../assets/byeongpung/byeongpung_silla_wave.png'),
    require('../../../assets/byeongpung/byeongpung_silla_sun.png'),
    require('../../../assets/byeongpung/byeongpung_silla_chaekgeori.png'),
  ],
  goryeo: [
    require('../../../assets/byeongpung/byeongpung_goryeo_peony.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_crane.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_tiger.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_lotus.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_mountain.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_wave.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_sun.png'),
    require('../../../assets/byeongpung/byeongpung_goryeo_chaekgeori.png'),
  ],
};

export function panelImage(era: EraKey, panelIndex: number): ImageSourcePropType {
  return BYEONGPUNG_PANEL_IMAGES[era][panelIndex];
}

export const BUCKET_TEMPLATE_IMAGES: Record<BucketTemplateKey, ImageSourcePropType> = {
  peony: require('../../../assets/bucket-templates/bucket_peony.png'),
  tiger: require('../../../assets/bucket-templates/bucket_tiger.png'),
  crane: require('../../../assets/bucket-templates/bucket_crane.png'),
  lotus: require('../../../assets/bucket-templates/bucket_lotus.png'),
  chaekgeori: require('../../../assets/bucket-templates/bucket_chaekgeori.png'),
  sansuhwa: require('../../../assets/bucket-templates/bucket_sansuhwa.png'),
};
