/**
 * Want-to bucket-list art templates.
 * Six minhwa (Korean folk painting) styles users pick from when creating a bucket.
 * As bucket items get checked, the template's visual gradually fills in.
 */

import { palette } from '../../design-tokens';

export type BucketTemplateKey =
  | 'peony'
  | 'tiger'
  | 'crane'
  | 'lotus'
  | 'chaekgeori'
  | 'sansuhwa';

export interface BucketTemplate {
  key: BucketTemplateKey;
  nameEn: string;
  nameKo: string;
  symbolism: string;
  hintFor: string;
  /**
   * Chrome tone for this template's borders, swatches, and progress track —
   * NOT the artwork. Every template resolves to ink: the minhwa illustration
   * carries the identity (as photography does on Airbnb), so a per-template
   * hue in the surrounding chrome would compete with it and dilute the single
   * Rausch voltage. Selection is drawn as ink-vs-hairline.
   */
  primaryColor: string;
  secondaryColor: string;
}

const CHROME = palette.ink;
const CHROME_SECONDARY = palette.muted;

export const BUCKET_TEMPLATES: BucketTemplate[] = [
  {
    key: 'peony',
    nameEn: 'Peony (모란)',
    nameKo: '모란',
    symbolism: 'Wealth, abundance, blooming youth.',
    hintFor: 'Cafés, fashion, beauty hauls.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'tiger',
    nameEn: 'Tiger (호랑이)',
    nameKo: '호랑이',
    symbolism: 'Courage, daring, protection.',
    hintFor: 'Adventure trips, extreme food, hikes.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'crane',
    nameEn: 'Crane (학)',
    nameKo: '학',
    symbolism: 'Longevity, peace, slow grace.',
    hintFor: 'Slow travel, temple stays, day trips.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'lotus',
    nameEn: 'Lotus (연꽃)',
    nameKo: '연꽃',
    symbolism: 'Purity rising from mud, rebirth, calm.',
    hintFor: 'Self-care, journaling, learning.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'chaekgeori',
    nameEn: 'Chaekgeori (책가도)',
    nameKo: '책가도',
    symbolism: 'Scholarly bookshelf, curiosity, study.',
    hintFor: 'Books, classes, language goals.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'sansuhwa',
    nameEn: 'Sansuhwa (산수화)',
    nameKo: '산수화',
    symbolism: 'Mountains and rivers — the wandering soul.',
    hintFor: 'Travel, hiking, nature lists.',
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
];
