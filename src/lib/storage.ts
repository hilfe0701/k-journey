/**
 * MMKV-backed local cache. Used for:
 *   - Emergency content (must work offline)
 *   - Last-known user profile (offline first paint)
 *   - Onboarding progress (resume mid-flow if user closes app)
 *   - Local mission completion (synced to Firestore on reconnect)
 */

import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'k-journey' });

export const KEYS = {
  emergencyCache: 'emergency:v1',
  profileCache: 'profile:cache:v1',
  onboardingProgress: 'onboarding:progress:v1',
  completedMissionsCache: 'missions:completed:v1',
  galleryDismissed: 'gallery:dismissed',
  phaseOverride: 'phase:override',
  devMockAuth: 'dev:mockAuth',
  devMockFreshOnboarding: 'dev:mockFreshOnboarding',
  devMockMissions: 'dev:missions:v1',
  devMockBuckets: 'dev:buckets:v1',
  lastSeenPhase: 'phase:lastSeen',
  lastFiredDDayMilestones: 'dday:firedMilestones:v1',
  firedPanelUnlocks: 'panel:fired:v1',
} as const;

export function setJson<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export function getJson<T>(key: string): T | null {
  const raw = storage.getString(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function remove(key: string) {
  storage.delete(key);
}
