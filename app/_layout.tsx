import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Pressable, Platform, AppState } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';
import { getCrashlytics, recordError } from '@react-native-firebase/crashlytics';
import { AlertTriangle } from 'lucide-react-native';

import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useProfile } from '../src/hooks/useProfile';
import { posthog } from '../src/lib/posthog';
import { Text } from '../src/components/ui';
import { AlertHost } from '../src/components/system/AlertHost';
import { ToastHost } from '../src/components/system/ToastHost';
import {
  AhaMomentTour,
  hasShownAhaMoment,
} from '../src/components/onboarding/AhaMomentTour';
import { palette, space, radius } from '../design-tokens';
import { runMigrations } from '../src/lib/storageMigrations';
import { checkClockSkew, resetClockSkewBaseline } from '../src/lib/clockGuard';
import { usePushPermissionWatcher } from '../src/lib/permissions';
import { surfaceError } from '../src/lib/errorAlert';
import { getOnboardingProgress, onboardingRoutePath } from '../src/lib/storage';
import { knownProfileDate } from '../src/lib/profileCompat';
import { installWebFocusRing } from '../src/lib/webFocusRing';

SplashScreen.preventAutoHideAsync().catch(() => {});

// React Native Web zeroes the outline on every Pressable, so the browser build
// ships without any keyboard focus indicator unless this runs. No-op on native.
installWebFocusRing();

// MMKV migrations must precede hooks that read MMKV.
try {
  runMigrations();
} catch {
  // intentional swallow: migration runner already records partial failures
  // internally. Boot must continue regardless.
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
        <AlertTriangle size={32} color={palette.error} strokeWidth={1.5} />
      </View>
      <Text role="displayLg" align="center">
        Something went wrong
      </Text>
      <Text role="bodySm" color={palette.muted} align="center" style={errorStyles.detail}>
        {__DEV__
          ? error.message
          : 'The screen could not be loaded. Try again; your saved journey stays on this device.'}
      </Text>
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        accessibilityHint="Reloads the screen that failed."
        style={({ pressed }) => [errorStyles.btn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text role="buttonMd" color={palette.onPrimary}>
          Try again
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  // One family for the entire scale, the way Airbnb runs Cereal VF across
  // display, body, nav, and captions. Pretendard stands in for Cereal: same
  // geometric-humanist proportions, and unlike Inter it carries Hangul. The
  // Noto Serif display faces are gone with the serif hierarchy they served.
  const [fontsLoaded] = useFonts({
    Pretendard: require('../assets/fonts/PretendardKJourney.ttf'),
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
          {/* No key configured → no client, and therefore no provider: mounting
              one would put the SDK back on the network. */}
          {posthog ? (
            <PostHogProvider client={posthog} autocapture={false}>
              <RouteGate />
            </PostHogProvider>
          ) : (
            <RouteGate />
          )}
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
  const [dismissedTourCompletion, setDismissedTourCompletion] = React.useState<string | null>(null);
  const onboardingCompletedAt = profile?.onboardingCompletedAt ?? null;
  const showTour =
    !!onboardingCompletedAt &&
    dismissedTourCompletion !== onboardingCompletedAt &&
    (segments as string[])[0] === '(tabs)' &&
    !hasShownAhaMoment();

  // Compare clocks only during one continuous foreground interval. Native
  // monotonic clocks may pause during device suspend, so background samples
  // must never share a baseline with later foreground samples.
  useEffect(() => {
    let sampleTimer: ReturnType<typeof setInterval> | null = null;

    const sample = () => {
      try {
        if (checkClockSkew().detected) surfaceError('clock-jump');
      } catch {
        // Diagnostic only; foreground recovery must continue.
      }
    };

    const stopSampling = () => {
      if (sampleTimer) clearInterval(sampleTimer);
      sampleTimer = null;
      resetClockSkewBaseline();
    };

    const startSampling = () => {
      stopSampling();
      sample(); // establish a fresh foreground-only baseline
      sampleTimer = setInterval(sample, 60_000);
    };

    if (AppState.currentState === 'active') startSampling();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') startSampling();
      else stopSampling();
    });
    return () => {
      stopSampling();
      subscription.remove();
    };
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
      if (!inOnboarding) {
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
        onDismiss={() => setDismissedTourCompletion(onboardingCompletedAt)}
      />
      <ToastHost />
      <AlertHost />
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
    backgroundColor: palette.surfaceSoft,
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
    borderRadius: radius.sm,
    backgroundColor: palette.rausch,
  },
});

const shellStyles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: palette.surfaceSoft,
  },
  appViewport: {
    flex: 1,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    backgroundColor: palette.canvas,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: palette.hairline,
  },
});
