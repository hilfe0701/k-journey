/**
 * MMKV-backed local cache. Used for:
 *   - Emergency content (must work offline)
 *   - Last-known user profile (offline first paint)
 *   - Onboarding progress (resume mid-flow if user closes app)
 *   - Local mission completion and bucket progress
 */

import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'k-journey' });

export const KEYS = {
  emergencyCache: 'emergency:v1',
  profileCache: 'profile:cache:v1',
  onboardingProgress: 'onboarding:progress:v1',
  completedMissionsCache: 'missions:completed:v1',
  taskProgressCache: 'tasks:progress:v1',
  bucketsCache: 'buckets:cache:v1',
  galleryDismissed: 'gallery:dismissed',
  phaseOverride: 'phase:override',
  lastSeenPhase: 'phase:lastSeen',
  lastFiredDDayMilestones: 'dday:firedMilestones:v1',
  firedPanelUnlocks: 'panel:fired:v1',
} as const;

export const ONBOARDING_ROUTES = [
  'university',
  'program',
  'housing',
  'stay-length',
  'nationality',
  'dates',
  'era',
] as const;

export type OnboardingRoute = (typeof ONBOARDING_ROUTES)[number];

export interface OnboardingProgress {
  currentRoute: OnboardingRoute;
}

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

export function setOnboardingProgress(currentRoute: OnboardingRoute): void {
  // REQ-TER-003 · POL-001 · TC-133: preserve the interrupted onboarding route locally.
  setJson<OnboardingProgress>(KEYS.onboardingProgress, { currentRoute });
}

export function getOnboardingProgress(): OnboardingProgress | null {
  const progress = getJson<OnboardingProgress>(KEYS.onboardingProgress);
  if (!progress || !ONBOARDING_ROUTES.includes(progress.currentRoute)) return null;
  return progress;
}

export function clearOnboardingProgress(): void {
  remove(KEYS.onboardingProgress);
}

export function onboardingRoutePath(route: OnboardingRoute): string {
  return `/(onboarding)/${route}`;
}
