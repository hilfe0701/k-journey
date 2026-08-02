import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
import { AlertTriangle } from 'lucide-react-native';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useProfile } from '../src/hooks/useProfile';
import { posthog } from '../src/lib/posthog';
import { Text } from '../src/components/ui';
import { ToastHost } from '../src/components/system/ToastHost';
import {
  AhaMomentTour,
  hasShownAhaMoment,
} from '../src/components/onboarding/AhaMomentTour';
import { palette, space, radius } from '../design-tokens';
import { runMigrations } from '../src/lib/storageMigrations';
import { checkClockSkew } from '../src/lib/clockGuard';
import { usePushPermissionWatcher } from '../src/lib/permissions';
import { surfaceError } from '../src/lib/errorAlert';
import { getOnboardingProgress, onboardingRoutePath } from '../src/lib/storage';
import { knownProfileDate } from '../src/lib/profileCompat';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Boot path: MMKV migrations + clock-skew diagnostic. Both are synchronous and
// must precede any hook that reads MMKV (for example, useProfile). See
// ADR-0023 (migrations) and ADR-0022 (clock guard). Side-effect on module load
// is intentional — RN guarantees this module is the entry point.
try {
  runMigrations();
} catch {
  // intentional swallow: migration runner already records partial failures
  // internally. Boot must continue regardless.
}
let clockSkewDetectedAtBoot = false;
try {
  clockSkewDetectedAtBoot = checkClockSkew().detected;
} catch {
  // intentional swallow: diagnostic only; no behaviour gated on it.
}

/**
 * Expo Router calls this when a render-time error escapes a route. We forward
 * to Crashlytics (in release) and show a recoverable retry UI.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    try {
      recordError(getCrashlytics(), error);
    } catch {
      // Crashlytics not initialized (e.g., dev without Firebase) — swallow.
    }
  }, [error]);

  return (
    <SafeAreaView style={errorStyles.root} edges={['top', 'bottom']}>
      <View style={errorStyles.icon}>
        <AlertTriangle size={32} color={palette.dancheong} strokeWidth={1.5} />
      </View>
      <Text role="h2" align="center">
        Something went wrong
      </Text>
      <Text role="sm" color={palette.ash} align="center" style={errorStyles.detail}>
        {error.message}
      </Text>
      <Pressable
        onPress={retry}
        style={({ pressed }) => [errorStyles.btn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text role="body" weight="semibold" color={palette.hanji}>
          Try again
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Pretendard: require('../assets/fonts/PretendardKJourney.ttf'),
    NotoSerifKR_500Medium: require('../assets/fonts/NotoSerifKR500KJourney.ttf'),
    NotoSerifKR_700Bold: require('../assets/fonts/NotoSerifKR700KJourney.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: palette.hanji }} />;
  }

  return (
    <GestureHandlerRootView style={shellStyles.canvas}>
      <View style={shellStyles.appViewport}>
        <SafeAreaProvider>
          <PostHogProvider client={posthog} autocapture={false}>
            <RouteGate />
          </PostHogProvider>
        </SafeAreaProvider>
      </View>
    </GestureHandlerRootView>
  );
}

function RouteGate() {
  const { profile } = useProfile();
  const segments = useSegments();
  const router = useRouter();
  const coldStartHandledRef = useRef(false);
  const [showTour, setShowTour] = React.useState(false);

  // Aha-moment tour: surface exactly once after onboarding completes (PRD §4.6).
  React.useEffect(() => {
    if (!profile?.onboardingCompletedAt) return;
    if (hasShownAhaMoment()) return;
    const segs = segments as string[];
    if (segs[0] !== '(tabs)') return;
    setShowTour(true);
  }, [profile?.onboardingCompletedAt, segments]);

  // Surface a one-time clock-jump banner if boot detected device-clock skew
  // (ADR-0022, ADR-0028 T4). Deferred to an effect so the ToastHost is mounted.
  useEffect(() => {
    if (clockSkewDetectedAtBoot) {
      clockSkewDetectedAtBoot = false;
      surfaceError('clock-jump');
    }
  }, []);

  // Permission watcher: re-check push permission on every foreground transition
  // (and at cold start), reschedule if the user newly granted via Settings (§7.5).
  usePushPermissionWatcher({
    arrivalDate: knownProfileDate(profile?.arrivalDate),
    departureDate: knownProfileDate(profile?.departureDate),
  });

  useEffect(() => {
    const segs = segments as string[];
    const inOnboarding = segs[0] === '(onboarding)';
    const subRoute = segs[1];

    // Cold-start splash gate: Expo Router restores nav state across app launches,
    // which makes returning users skip the splash entirely. Force one trip through
    // splash on the first local-profile render of every session.
    // Keep native's branded cold-start splash, but never destroy a browser deep
    // link on refresh. Web already has the static document loading surface.
    if (Platform.OS !== 'web' && !coldStartHandledRef.current) {
      coldStartHandledRef.current = true;
      if (subRoute !== 'splash') {
        router.replace('/(onboarding)/splash');
        return;
      }
    }

    // Splash owns its own 2.2s display + post-animation routing.
    if (subRoute === 'splash') return;

    const onboardingComplete = !!profile?.onboardingCompletedAt;

    if (!onboardingComplete) {
      if (!inOnboarding || subRoute === 'sign-in' || subRoute === 'profile') {
        router.replace(onboardingRoutePath(getOnboardingProgress()?.currentRoute ?? 'university'));
      }
      return;
    }

    // Fully onboarded — push to tabs if currently inside onboarding,
    // EXCEPT when re-entering the era picker from More tab to switch eras.
    if (inOnboarding && subRoute !== 'era') {
      router.replace('/(tabs)');
    }
  }, [profile, segments, router]);

  const era = profile?.era ?? 'joseon';

  return (
    <ThemeProvider era={era}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.hanji } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <AhaMomentTour
        visible={showTour}
        era={era}
        onDismiss={() => setShowTour(false)}
      />
      <ToastHost />
    </ThemeProvider>
  );
}

const errorStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.hanji,
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[3],
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.dancheong + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: {
    paddingHorizontal: space[4],
  },
  btn: {
    marginTop: space[4],
    paddingHorizontal: space[6],
    paddingVertical: space[3],
    borderRadius: radius.pill,
    backgroundColor: palette.meok,
  },
});

const shellStyles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: palette.cloud,
  },
  appViewport: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: palette.hanji,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.hairline,
  },
});
