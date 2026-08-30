/**
 * Optional public contact points. Expo embeds EXPO_PUBLIC_* values in the
 * client bundle, so these values must never contain secrets.
 */

export function normalizeSupportEmail(value: string | undefined): string | null {
  const email = value?.trim() ?? '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function normalizePublicHttpsUrl(value: string | undefined): string | null {
  const candidate = value?.trim() ?? '';
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' && url.username === '' && url.password === ''
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export const PUBLIC_SUPPORT_EMAIL = normalizeSupportEmail(
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
);
export const PUBLIC_PRIVACY_POLICY_URL = normalizePublicHttpsUrl(
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
);
