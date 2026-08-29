import { BUCKET_TEMPLATES } from '../bucketTemplates';

describe('bucket template suggestions', () => {
  it('keeps six templates with five to eight opt-in suggestions each', () => {
    expect(BUCKET_TEMPLATES).toHaveLength(6);
    for (const template of BUCKET_TEMPLATES) {
      expect(template.suggestedItems.length).toBeGreaterThanOrEqual(5);
      expect(template.suggestedItems.length).toBeLessThanOrEqual(8);
      expect(new Set(template.suggestedItems).size).toBe(template.suggestedItems.length);
      expect(template.suggestedItems.every((item) => item.trim().length > 0)).toBe(true);
    }
  });
});
