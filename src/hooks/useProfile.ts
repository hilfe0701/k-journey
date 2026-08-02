import { useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { LocalTaskProgress, UserProfile, EMPTY_TASK_PROGRESS } from '../lib/firebase';
import { getJson, KEYS, storage } from '../lib/storage';
import { normalizeUserProfile } from '../lib/profileCompat';

export type ProfileLoadError = 'profile_load_failed';

export interface ProfileState {
  loading: boolean;
  profile: UserProfile | null;
  error: ProfileLoadError | null;
}

export function useProfile(): ProfileState {
  const [profileCacheJson] = useMMKVString(KEYS.profileCache, storage);
  // Memoize on the raw JSON. Parsing on every render handed callers a new object
  // each time, so any `useEffect` depending on `profile` re-ran every render — on
  // the onboarding condition screens that reset the user's choice back to the
  // stored value, making six of the eight screens impossible to answer.
  const profile = useMemo(
    () =>
      profileCacheJson
        ? parseProfile(profileCacheJson)
        : normalizeStoredProfile(getJson<UserProfile>(KEYS.profileCache)),
    [profileCacheJson],
  );

  return {
    loading: false,
    profile,
    error: null,
  };
}

export interface TaskProgressState {
  loading: boolean;
  progress: LocalTaskProgress;
}

export function useTaskProgress(): TaskProgressState {
  const [progressJson] = useMMKVString(KEYS.taskProgressCache, storage);
  // Same reasoning as useProfile above — callers put `progress` in dependency arrays.
  const progress = useMemo(
    () =>
      progressJson
        ? parseTaskProgress(progressJson)
        : getJson<LocalTaskProgress>(KEYS.taskProgressCache) ?? EMPTY_TASK_PROGRESS,
    [progressJson],
  );

  return { loading: false, progress };
}

function parseProfile(raw: string): UserProfile | null {
  try {
    return normalizeUserProfile(JSON.parse(raw) as Partial<UserProfile>);
  } catch {
    return null;
  }
}

function normalizeStoredProfile(profile: UserProfile | null): UserProfile | null {
  return profile ? normalizeUserProfile(profile) : null;
}

function parseTaskProgress(raw: string): LocalTaskProgress {
  try {
    const stored = JSON.parse(raw) as Partial<LocalTaskProgress>;
    return {
      ...EMPTY_TASK_PROGRESS,
      ...stored,
      completedTaskIds: stored.completedTaskIds ?? [],
      inProgressTaskIds: stored.inProgressTaskIds ?? [],
      completedAtByTaskId: stored.completedAtByTaskId ?? {},
      housingProviderAddressMatchesProof: stored.housingProviderAddressMatchesProof ?? null,
      departureOrderChoice: stored.departureOrderChoice ?? null,
      departureType: stored.departureType ?? null,
      reentryException: stored.reentryException ?? null,
      appointmentDate: stored.appointmentDate ?? null,
    };
  } catch {
    return EMPTY_TASK_PROGRESS;
  }
}
