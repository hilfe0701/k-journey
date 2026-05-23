import { useEffect, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import { onSnapshot } from '@react-native-firebase/firestore';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
import { userDoc, UserProfile } from '../lib/firebase';
import { useAuth, DEV_MOCK_USER_UID } from './useAuth';
import { setJson, getJson, storage, KEYS } from '../lib/storage';

export type ProfileLoadError = 'profile_load_failed';

export interface ProfileState {
  loading: boolean;
  profile: UserProfile | null;
  error: ProfileLoadError | null;
}

const DEV_MOCK_PROFILE: UserProfile = {
  uid: DEV_MOCK_USER_UID,
  email: 'dev@k-journey.local',
  displayName: 'Dev Preview',
  photoUrl: null,
  university: 'yonsei',
  stayType: 'exchange-1',
  housing: 'dormitory',
  arrivalDate: '2026-04-01',
  departureDate: '2026-08-01',
  era: 'joseon',
  onboardingCompletedAt: '2026-05-05T00:00:00.000Z',
  createdAt: null,
};

export function useProfile(): ProfileState {
  const { user } = useAuth();
  const isDevMockUser = __DEV__ && user?.uid === DEV_MOCK_USER_UID;
  const [profileCacheJson] = useMMKVString(KEYS.profileCache, storage);
  const [state, setState] = useState<ProfileState>({
    loading: true,
    profile: getJson<UserProfile>(KEYS.profileCache),
    error: null,
  });

  useEffect(() => {
    if (!user) {
      setState({ loading: false, profile: null, error: null });
      return;
    }

    if (isDevMockUser) {
      // Fresh onboarding mode: leave the cache empty so AuthGate routes to the
      // onboarding stack. The onboarding screens write to MMKV via the dev-mock
      // branches in `updateUserProfile`, so progress persists across reloads
      // and the user reaches the tabs once `onboardingCompletedAt` is set.
      const freshMode = storage.getBoolean(KEYS.devMockFreshOnboarding) ?? false;
      if (!freshMode && !getJson<UserProfile>(KEYS.profileCache)) {
        setJson(KEYS.profileCache, DEV_MOCK_PROFILE);
      }
      return;
    }

    const unsubscribe = onSnapshot(
      userDoc(user.uid),
      (snap) => {
        if (snap.exists) {
          const data = snap.data() as UserProfile;
          setJson(KEYS.profileCache, data);
          setState({ loading: false, profile: data, error: null });
        } else {
          setState({ loading: false, profile: null, error: null });
        }
      },
      (err) => {
        // Surface to UI rather than silently logging. Cache (if any) stays as
        // the displayed value; callers should render a "couldn't refresh" toast
        // or retry affordance keyed off `error !== null`. ADR-0012.
        recordError(getCrashlytics(), err instanceof Error ? err : new Error(String(err)));
        setState((prev) => ({ ...prev, loading: false, error: 'profile_load_failed' }));
      },
    );

    return unsubscribe;
  }, [user, isDevMockUser]);

  useEffect(() => {
    if (!isDevMockUser) return;
    const freshMode = storage.getBoolean(KEYS.devMockFreshOnboarding) ?? false;
    if (!profileCacheJson) {
      // In fresh mode we deliberately keep profile null so AuthGate sends the
      // user into onboarding. Otherwise fall back to the populated DEV_MOCK_PROFILE.
      setState({
        loading: false,
        profile: freshMode ? null : DEV_MOCK_PROFILE,
        error: null,
      });
      return;
    }
    try {
      setState({ loading: false, profile: JSON.parse(profileCacheJson) as UserProfile, error: null });
    } catch {
      setState({ loading: false, profile: freshMode ? null : DEV_MOCK_PROFILE, error: null });
    }
  }, [isDevMockUser, profileCacheJson]);

  return state;
}
