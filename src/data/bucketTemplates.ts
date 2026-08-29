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
  /** Optional editorial prompts. Users add them explicitly; none are prefilled. */
  suggestedItems: readonly string[];
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
    symbolism: 'A traditional symbol of wealth and abundance.',
    hintFor: 'Cafés, fashion, beauty hauls.',
    suggestedItems: [
      'Try a café in a new neighborhood',
      'Browse a local fashion market',
      'Find a Korean skincare favorite',
      'Wear hanbok for a portrait',
      'Visit a flower market',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'tiger',
    nameEn: 'Tiger (호랑이)',
    nameKo: '호랑이',
    symbolism: 'A traditional symbol of bravery and protection.',
    hintFor: 'Adventure trips, extreme food, hikes.',
    suggestedItems: [
      'Hike a marked mountain trail',
      'Try a dish outside my comfort zone',
      'Take a weekend trip by train',
      'Join an outdoor activity',
      'Explore a coastal walking path',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'crane',
    nameEn: 'Crane (학)',
    nameKo: '학',
    symbolism: 'A traditional symbol of longevity.',
    hintFor: 'Slow travel, temple stays, day trips.',
    suggestedItems: [
      'Book a temple stay',
      'Take a slow day trip outside Seoul',
      'Walk along a riverside trail',
      'Watch sunrise by the sea',
      'Visit a traditional garden',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'lotus',
    nameEn: 'Lotus (연꽃)',
    nameKo: '연꽃',
    symbolism: 'Purity and rebirth, rising clean from mud.',
    hintFor: 'Self-care, journaling, learning.',
    suggestedItems: [
      'Write a Korean-language journal entry',
      'Take a mindful walk without a schedule',
      'Learn a simple Korean craft',
      'Try a jjimjilbang wellness day',
      'Read in a neighborhood library',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'chaekgeori',
    nameEn: 'Chaekgeori (책가도)',
    nameKo: '책가도',
    symbolism: 'Love of books, learning, and scholarly cultivation.',
    hintFor: 'Books, classes, language goals.',
    suggestedItems: [
      'Finish a book by a Korean author',
      'Take a Korean language class',
      'Visit a university library',
      'Learn a traditional craft technique',
      'Attend a public lecture or workshop',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
  {
    key: 'sansuhwa',
    nameEn: 'Sansuhwa (산수화)',
    nameKo: '산수화',
    symbolism: 'Love of nature, contemplation, and ideal landscapes.',
    hintFor: 'Travel, hiking, nature lists.',
    suggestedItems: [
      'Visit a national park',
      'Walk part of the Seoul City Wall',
      'See autumn foliage in the mountains',
      'Spend a day beside a lake or river',
      'Take a scenic regional train',
    ],
    primaryColor: CHROME,
    secondaryColor: CHROME_SECONDARY,
  },
];
