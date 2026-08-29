/**
 * Guards the "no key means no network" promise in
 * `docs/MEASUREMENT_AND_EXPERIMENTS.md` and `docs/PRIVACY_POLICY.md`.
 *
 * The previous shape constructed the SDK with a placeholder key and
 * `disabled: true`. That stops event capture but not the remote-config fetch:
 * the web build issued `GET .../array/phc_analytics_disabled/config` on every
 * page load, so a build documented as analytics-free still announced each
 * visitor to PostHog. The client must simply not exist without a real key.
 *
 * `EXPO_PUBLIC_*` is inlined at transform time, so the key cannot be varied
 * from a test. The decision is therefore asserted through the predicate, and
 * the default build (no key) is asserted directly.
 */

import { isUsableProjectKey, posthog, track } from '../posthog';

describe('isUsableProjectKey', () => {
  it('rejects an absent key', () => {
    expect(isUsableProjectKey('')).toBe(false);
  });

  it('rejects the .env.example placeholder', () => {
    expect(isUsableProjectKey('phc_REPLACE_ME')).toBe(false);
  });

  it('accepts a real project key', () => {
    expect(isUsableProjectKey('phc_realprojectkey')).toBe(true);
  });
});

describe('the default build', () => {
  it('has no client at all, so the SDK never reaches the network', () => {
    expect(posthog).toBeNull();
  });

  it('keeps the event helpers safe no-ops', () => {
    expect(() => track('emergency_open')).not.toThrow();
  });
});
