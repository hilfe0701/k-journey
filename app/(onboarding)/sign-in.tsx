import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getAuth,
  signInWithCredential,
  AppleAuthProvider,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Mail, Apple } from 'lucide-react-native';

import { Text, Button } from '../../src/components/ui';
import { palette, space } from '../../design-tokens';
import { surfaceError } from '../../src/lib/errorAlert';
import { storage, KEYS } from '../../src/lib/storage';

// Configure Google Sign-In once at module load. webClientId comes from
// app.config.ts → extra (per-env type-3 OAuth client); the native iOS client id
// + redirect URL scheme are supplied by the config plugin (iosUrlScheme), and
// Android reads its client from google-services.json via the google-services
// Gradle plugin.
GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId as string | undefined,
});

export default function SignIn() {
  const [busy, setBusy] = useState<'google' | 'apple' | null>(null);

  async function handleGoogle() {
    setBusy('google');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (!idToken) throw new Error('No idToken returned from Google');
        const googleCredential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(getAuth(), googleCredential);
        // `sign_in` analytics fires from useAuth's onAuthStateChanged
        // (provider='google') — the canonical fire point. No duplicate here.
      }
      // A cancelled response (user backed out) falls through as a no-op.
    } catch (e: any) {
      // Some platforms throw on cancellation instead of returning a cancelled
      // response — stay silent, matching the Apple flow.
      if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      // T2 via the catalog — records the cause + offers a one-tap retry.
      surfaceError('auth-failed', { onPrimary: handleGoogle, cause: e });
    } finally {
      setBusy(null);
    }
  }

  async function handleApple() {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple sign-in is iOS-only', 'On Android, please use Google sign-in.');
      return;
    }
    setBusy('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identityToken from Apple');
      const authCredential = AppleAuthProvider.credential(
        credential.identityToken,
        credential.authorizationCode ?? undefined,
      );
      await signInWithCredential(getAuth(), authCredential);
      // `sign_in` analytics fires from useAuth's onAuthStateChanged — the
      // canonical fire point (ANALYTICS_SCHEMA §2). No duplicate here.
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        // T2 via the catalog — records the cause + offers a one-tap retry.
        surfaceError('auth-failed', { onPrimary: handleApple, cause: e });
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.headerArea}>
        <Text role="display" color={palette.meok}>
          K&#x2013;Journey
        </Text>
        <Text role="body" color={palette.ash} style={{ marginTop: space[3] }}>
          Sign in to begin painting your Korean semester. Takes 5 seconds.
        </Text>
      </View>

      <View style={styles.actions}>
        {/* Apple sign-in is native-iOS only (AppleAuthentication). On Android we
            hide it rather than show a button that dead-ends in an alert, and
            promote Google to the primary CTA. iOS keeps both (Apple primary). */}
        {Platform.OS === 'ios' && (
          <Button
            label="Continue with Apple"
            onPress={handleApple}
            loading={busy === 'apple'}
            disabled={busy !== null && busy !== 'apple'}
            fullWidth
            leftIcon={<Apple size={18} color={palette.hanji} />}
          />
        )}
        <Button
          label="Continue with Google"
          onPress={handleGoogle}
          loading={busy === 'google'}
          disabled={busy !== null && busy !== 'google'}
          variant={Platform.OS === 'ios' ? 'secondary' : 'primary'}
          fullWidth
          leftIcon={
            <Mail size={18} color={Platform.OS === 'ios' ? palette.meok : palette.hanji} />
          }
        />
        <Text role="xs" color={palette.stone} align="center" style={{ marginTop: space[4] }}>
          By continuing, you accept K&#x2013;Journey&apos;s terms and acknowledge our privacy notice.
          Your byeongpung stays with your account, even if you change phones.
        </Text>
        {__DEV__ && (
          <>
            <Button
              label="[Dev] Skip auth (preview)"
              onPress={() => {
                // Preview mode: pre-onboarded dev user; jumps straight to tabs.
                // Clear any fresh-mode flag from prior dev session so useProfile
                // auto-seeds DEV_MOCK_PROFILE.
                storage.delete(KEYS.devMockFreshOnboarding);
                storage.set(KEYS.devMockAuth, true);
              }}
              variant="ghost"
              fullWidth
            />
            <Button
              label="[Dev] Fresh onboarding"
              onPress={() => {
                // Fresh-onboarding mode: bypass auth but force the user through
                // the onboarding flow. Clear any leftover profile + mission +
                // bucket state so the flow starts from blank.
                storage.delete(KEYS.profileCache);
                storage.delete(KEYS.devMockMissions);
                storage.delete(KEYS.devMockBuckets);
                storage.delete(KEYS.firedPanelUnlocks);
                storage.delete(KEYS.lastSeenPhase);
                storage.delete(KEYS.lastFiredDDayMilestones);
                storage.delete(KEYS.phaseOverride);
                storage.delete(KEYS.galleryDismissed);
                storage.set(KEYS.devMockFreshOnboarding, true);
                storage.set(KEYS.devMockAuth, true);
              }}
              variant="ghost"
              fullWidth
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
    paddingHorizontal: space[5],
    justifyContent: 'space-between',
  },
  headerArea: {
    paddingTop: space[16],
    paddingBottom: space[12],
  },
  actions: {
    paddingBottom: space[8],
    gap: space[3],
  },
});
