import { useEffect, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signOut as fbSignOut,
  type FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
import { useMMKVBoolean } from 'react-native-mmkv';
import { ensureUserDocument } from '../lib/firebase';
import { identify, reset, track } from '../lib/posthog';
import { surfaceError } from '../lib/errorAlert';
import { storage, KEYS } from '../lib/storage';

export const DEV_MOCK_USER_UID = 'dev-mock-user';

/** Firebase Auth codes that mean the session is irrecoverably dead — these
 *  surface the `auth-expired` T4 banner. Transient/permission errors do not. */
const AUTH_EXPIRY_CODES = new Set([
  'auth/id-token-expired',
  'auth/user-token-expired',
  'auth/invalid-user-token',
]);

const DEV_MOCK_USER = {
  uid: DEV_MOCK_USER_UID,
  email: 'dev@k-journey.local',
  displayName: 'Dev Preview',
  photoURL: null,
  isAnonymous: false,
  emailVerified: true,
  providerData: [],
  metadata: {},
} as unknown as FirebaseAuthTypes.User;

export interface AuthState {
  initializing: boolean;
  user: FirebaseAuthTypes.User | null;
}

export function useAuth(): AuthState & {
  signOut: () => Promise<void>;
} {
  const [devMock] = useMMKVBoolean(KEYS.devMockAuth, storage);
  const [state, setState] = useState<AuthState>({ initializing: true, user: null });

  useEffect(() => {
    if (__DEV__ && devMock) {
      setState({ initializing: false, user: DEV_MOCK_USER });
      track('sign_in', { provider: 'devmock' });
      return;
    }

    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      try {
        if (user) {
          await ensureUserDocument(user);
          identify(user.uid, { email: user.email });
          track('sign_in', { provider: providerOf(user) });
        } else {
          reset();
        }
      } catch (err) {
        // Auth-side write failure (e.g. Firestore Rules misconfiguration during
        // a deploy window). Record but keep the user session — they can retry
        // any mutator from inside the app. ADR-0012.
        recordError(getCrashlytics(), err instanceof Error ? err : new Error(String(err)));
        // A genuine token-expiry code means the session is dead — surface the
        // T4 sign-in banner (ADR-0028). Transient errors stay silent.
        const code = (err as { code?: string } | null)?.code;
        if (code && AUTH_EXPIRY_CODES.has(code)) {
          surfaceError('auth-expired');
        }
      } finally {
        setState({ initializing: false, user });
      }
    });
    return unsubscribe;
  }, [devMock]);

  const signOut = useCallback(async () => {
    if (__DEV__ && storage.getBoolean(KEYS.devMockAuth)) {
      storage.delete(KEYS.devMockAuth);
      storage.delete(KEYS.devMockFreshOnboarding);
      storage.delete(KEYS.devMockMissions);
      storage.delete(KEYS.devMockBuckets);
      storage.delete(KEYS.profileCache);
      storage.delete(KEYS.lastSeenPhase);
      storage.delete(KEYS.lastFiredDDayMilestones);
      storage.delete(KEYS.firedPanelUnlocks);
      storage.delete(KEYS.phaseOverride);
      track('sign_out');
      return;
    }
    track('sign_out');
    await fbSignOut(getAuth());
  }, []);

  function providerOf(user: FirebaseAuthTypes.User): 'apple' | 'google' | 'devmock' {
    const provider = user.providerData?.[0]?.providerId;
    if (provider === 'apple.com') return 'apple';
    if (provider === 'google.com') return 'google';
    return 'devmock';
  }

  return { ...state, signOut };
}
