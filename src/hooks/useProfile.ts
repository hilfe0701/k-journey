import { useMMKVString } from 'react-native-mmkv';
import { UserProfile } from '../lib/firebase';
import { getJson, KEYS, storage } from '../lib/storage';

export type ProfileLoadError = 'profile_load_failed';

export interface ProfileState {
  loading: boolean;
  profile: UserProfile | null;
  error: ProfileLoadError | null;
}

export function useProfile(): ProfileState {
  const [profileCacheJson] = useMMKVString(KEYS.profileCache, storage);
  const profile = profileCacheJson
    ? parseProfile(profileCacheJson)
    : getJson<UserProfile>(KEYS.profileCache);

  return {
    loading: false,
    profile,
    error: null,
  };
}

function parseProfile(raw: string): UserProfile | null {
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}
