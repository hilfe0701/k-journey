import { ERROR_CATALOG, resolveErrorRow } from '../errors/catalog';

describe('ERROR_CATALOG', () => {
  it('every row has a tier and body', () => {
    for (const [code, row] of Object.entries(ERROR_CATALOG)) {
      expect(row.code).toBe(code);
      expect(row.tier).toMatch(/^(T1|T2|T3|T4|inline|silent)$/);
      expect(typeof row.body).toBe('string');
    }
  });

  it('T2 rows have a title and primaryCta', () => {
    for (const row of Object.values(ERROR_CATALOG)) {
      if (row.tier === 'T2') {
        expect(row.title).toBeTruthy();
        expect(row.primaryCta).toBeTruthy();
      }
    }
  });

  it('T3 rows have Open Settings primary CTA', () => {
    for (const row of Object.values(ERROR_CATALOG)) {
      if (row.tier === 'T3') {
        expect(row.primaryCta).toBe('Open Settings');
        expect(row.secondaryCta).toBe('Not now');
      }
    }
  });

  it('T4 banners have a sticky primary CTA (no auto-dismiss)', () => {
    for (const row of Object.values(ERROR_CATALOG)) {
      if (row.tier === 'T4') {
        expect(row.primaryCta).toBeTruthy();
        expect(row.autoDismissMs).toBeUndefined();
      }
    }
  });
});

describe('resolveErrorRow', () => {
  it('resolves a known string code', () => {
    expect(resolveErrorRow('network-offline').tier).toBe('T1');
  });

  it('falls back to unknown for arbitrary input', () => {
    expect(resolveErrorRow(new Error('mystery')).code).toBe('unknown');
  });

  it('resolves an explicit current catalog code on an error-shaped object', () => {
    const err = Object.assign(new Error('permission denied'), { code: 'permission-photos-denied' });
    expect(resolveErrorRow(err).code).toBe('permission-photos-denied');
  });

  it('detects "Network request failed" message string', () => {
    expect(resolveErrorRow(new Error('Network request failed')).code).toBe('network-offline');
  });

  it('detects timeout messages', () => {
    expect(resolveErrorRow(new Error('Request timed out')).code).toBe('network-timeout');
  });
});
