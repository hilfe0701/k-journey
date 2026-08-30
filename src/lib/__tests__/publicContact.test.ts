import { normalizePublicHttpsUrl, normalizeSupportEmail } from '../publicContact';

describe('public contact configuration', () => {
  it('accepts a trimmed support email and rejects missing or malformed values', () => {
    expect(normalizeSupportEmail(' help@example.com ')).toBe('help@example.com');
    expect(normalizeSupportEmail(undefined)).toBeNull();
    expect(normalizeSupportEmail('support@example')).toBeNull();
  });

  it('accepts only credential-free HTTPS URLs', () => {
    expect(normalizePublicHttpsUrl(' https://example.com/privacy ')).toBe(
      'https://example.com/privacy',
    );
    expect(normalizePublicHttpsUrl('http://example.com/privacy')).toBeNull();
    expect(normalizePublicHttpsUrl('https://user:secret@example.com/privacy')).toBeNull();
    expect(normalizePublicHttpsUrl('not a URL')).toBeNull();
  });
});
