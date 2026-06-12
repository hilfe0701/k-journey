/**
 * Client-side immediate account deletion.
 *
 * Replaces the ADR-0033 soft-delete (30-day grace + recovery email + reaper
 * Cloud Function) — that backend was never built, so the old "request" flow
 * only wrote a Firestore marker that nothing acted on. This deletes for real,
 * entirely on-device, which is what Google Play's account-deletion policy
 * requires.
 *
 * Flow (real auth): re-authenticate the user (Firebase requires a recent login
 * to delete an auth account, and it doubles as an identity confirm for an
 * irreversible action) → wipe their Firestore data → delete the auth account.
 * If the user backs out of the re-auth prompt, nothing is deleted.
 */

import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';

import { storage, KEYS } from './storage';
import { deleteAccountData } from './firebase';
import { reset } from './posthog';

// GoogleSignin must be configured before signIn()/reauth. sign-in.tsx configures
// it at module load, but a returning user who is already signed in never mounts
// that screen — so configure here too (idempotent, same webClientId source).
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId as string | undefined,
});

// Local per-account state cleared on a dev-mock deletion (mirrors the mock data
// that real Firestore would hold). The auth flag itself is cleared by signOut().
const DEV_MOCK_DATA_KEYS = [
  KEYS.profileCache,
  KEYS.devMockMissions,
  KEYS.devMockBuckets,
  KEYS.firedPanelUnlocks,
  KEYS.lastSeenPhase,
  KEYS.lastFiredDDayMilestones,
  KEYS.phaseOverride,
  KEYS.galleryDismissed,
];

function isDevMockAuth(): boolean {
  return __DEV__ && (storage.getBoolean(KEYS.devMockAuth) ?? false);
}

/** True when the thrown value is the user backing out of a sign-in prompt. */
function isUserCancellation(e: unknown): boolean {
  if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return true;
  return (e as { code?: string } | null)?.code === 'ERR_REQUEST_CANCELED';
}

/** Re-authenticates the current user via their original provider. Throws a
 *  cancellation-coded error if the user backs out. */
async function reauthenticate(user: FirebaseAuthTypes.User): Promise<void> {
  const providerId = user.providerData[0]?.providerId;

  if (providerId === 'apple.com') {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error('No identityToken from Apple');
    const cred = AppleAuthProvider.credential(
      credential.identityToken,
      credential.authorizationCode ?? undefined,
    );
    await reauthenticateWithCredential(user, cred);
    return;
  }

  // Default to Google — the Android launch provider.
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response) || !response.data.idToken) {
    // A non-success response (user backed out) is treated as cancellation.
    const err = new Error('Reauthentication cancelled') as Error & { code?: string };
    err.code = statusCodes.SIGN_IN_CANCELLED;
    throw err;
  }
  const cred = GoogleAuthProvider.credential(response.data.idToken);
  await reauthenticateWithCredential(user, cred);
}

/**
 * Permanently deletes the signed-in user's data and account.
 * @returns `true` on success, `false` if the user backed out of the re-auth
 *          prompt (nothing was deleted). Throws on real failures.
 */
export async function deleteAccount(uid: string): Promise<boolean> {
  if (isDevMockAuth()) {
    DEV_MOCK_DATA_KEYS.forEach((k) => storage.delete(k));
    // Clear the mock-auth flags too so AuthGate routes back to sign-in (the
    // real path gets this for free when deleteUser fires onAuthStateChanged).
    storage.delete(KEYS.devMockAuth);
    storage.delete(KEYS.devMockFreshOnboarding);
    reset();
    return true;
  }

  const user = getAuth().currentUser;
  if (!user) throw new Error('No authenticated user to delete');

  try {
    await reauthenticate(user);
  } catch (e) {
    if (isUserCancellation(e)) return false;
    throw e;
  }

  // Data first (while still authed + before the auth record is gone), then the
  // account. Re-auth above guarantees deleteUser won't hit requires-recent-login.
  // deleteUser fires onAuthStateChanged(null), so AuthGate routes to sign-in —
  // the caller must NOT also call signOut() (it would throw no-current-user).
  await deleteAccountData(uid);
  await deleteUser(user);
  reset();
  return true;
}
