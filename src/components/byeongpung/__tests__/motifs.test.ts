import {
  BYEONGPUNG_PANEL_IMAGES,
  BUCKET_TEMPLATE_IMAGES,
  PANEL_MOTIF_KEYS,
  PANEL_MOTIF_NAMES,
  panelImage,
} from '../motifs';
import { ERAS } from '../../../theme/eras';
import { BUCKET_TEMPLATES } from '../../../data/bucketTemplates';

describe('BYEONGPUNG_PANEL_IMAGES', () => {
  it('has 8 panels for each of the three eras', () => {
    for (const era of Object.keys(ERAS)) {
      const panels = BYEONGPUNG_PANEL_IMAGES[era as keyof typeof ERAS];
      expect(panels).toHaveLength(8);
      panels.forEach((src) => expect(src).toBeTruthy());
    }
  });
});

describe('BUCKET_TEMPLATE_IMAGES', () => {
  it('covers every bucket template key', () => {
    for (const tpl of BUCKET_TEMPLATES) {
      expect(BUCKET_TEMPLATE_IMAGES[tpl.key]).toBeTruthy();
    }
  });
});

describe('PANEL_MOTIF_KEYS / NAMES', () => {
  it('keeps the canonical 8-motif order in sync', () => {
    expect(PANEL_MOTIF_KEYS).toHaveLength(8);
    expect(PANEL_MOTIF_NAMES).toHaveLength(8);
  });
});

describe('panelImage', () => {
  it('returns the source matching the era + index', () => {
    expect(panelImage('joseon', 0)).toBe(BYEONGPUNG_PANEL_IMAGES.joseon[0]);
    expect(panelImage('silla', 7)).toBe(BYEONGPUNG_PANEL_IMAGES.silla[7]);
    expect(panelImage('goryeo', 3)).toBe(BYEONGPUNG_PANEL_IMAGES.goryeo[3]);
  });
});
