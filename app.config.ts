/* eslint-env node */
import { ExpoConfig, ConfigContext } from 'expo/config';

// K-Journey environment selection — ADR-0024 (prod-add scope, 2026-05-22).
//
// `APP_ENV` is set per EAS build profile in eas.json and defaults to 'dev', so
// the existing local workflow is untouched: dev keeps bundle id
// `com.kjourney.app`, the `k-journey` (dev) Firebase project, and the patched
// native folders. dev and prod intentionally SHARE the bundle id for now — they
// cannot be installed side-by-side on one device, which is acceptable for MVP.
// To allow side-by-side installs later, give dev a `.dev` suffix + mount the
// <EnvironmentBanner /> (ADR-0024 Wave 2). staging is scaffolded but not yet
// provisioned.
type AppEnv = 'dev' | 'staging' | 'prod';

const APP_ENV: AppEnv = (process.env.APP_ENV as AppEnv) || 'dev';

// Firebase native config file per env. EAS cloud builds inject an absolute file
// path via a file-type secret (GOOGLE_SERVICES_PLIST / GOOGLE_SERVICES_JSON);
// local builds fall back to the on-disk path. Per-env files live under
// config/firebase/ and are gitignored (CLAUDE.md NEVER #16). dev keeps the
// existing root files unchanged.
const firebaseFiles: Record<AppEnv, { ios: string; android: string }> = {
  dev: {
    ios: process.env.GOOGLE_SERVICES_PLIST || './GoogleService-Info.plist',
    android: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
  },
  staging: {
    ios: process.env.GOOGLE_SERVICES_PLIST || './config/firebase/GoogleService-Info.staging.plist',
    android: process.env.GOOGLE_SERVICES_JSON || './config/firebase/google-services.staging.json',
  },
  prod: {
    ios: process.env.GOOGLE_SERVICES_PLIST || './config/firebase/GoogleService-Info.prod.plist',
    android: process.env.GOOGLE_SERVICES_JSON || './config/firebase/google-services.prod.json',
  },
};

// Google Sign-In OAuth config per env (2026-05-22). webClientId = the type-3
// (web) OAuth client from each project's google-services.json; iosUrlScheme =
// the REVERSED_CLIENT_ID from GoogleService-Info.plist. dev values are the
// existing k-journey project's (public OAuth IDs, safe to commit). Fill
// prod/staging when those Firebase projects exist. Each env also needs the
// build's Android SHA-1 registered in Firebase + Google enabled as an Auth
// provider.
const googleAuth: Record<AppEnv, { webClientId: string; iosUrlScheme: string }> = {
  dev: {
    webClientId: '676898992516-ikh6k9hv74mqoqoin5r8sf9r8qethh8a.apps.googleusercontent.com',
    iosUrlScheme: 'com.googleusercontent.apps.676898992516-ra6qhea9qu5r29t0vui1ata0f3r4l3ql',
  },
  staging: {
    webClientId: 'TODO_FILL_FROM_STAGING_google-services.json',
    iosUrlScheme: 'com.googleusercontent.apps.TODO_FILL_FROM_STAGING_plist',
  },
  prod: {
    // From k-journey-prod google-services.json (type-3 web client), filled 2026-05-23.
    webClientId: '442880340610-gtcocrq95605nm0ma7ksmevlnf146mpp.apps.googleusercontent.com',
    // Android-only launch (project_launch_android_only_2026_05_23): no prod iOS plist
    // yet. Unused by `eas build -p android`; fill from the prod plist REVERSED_CLIENT_ID
    // if/when iOS ships.
    iosUrlScheme: 'com.googleusercontent.apps.TODO_FILL_FROM_PROD_plist',
  },
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  // Everything not branched below (icon, scheme, plugins, infoPlist, permissions,
  // adaptiveIcon, …) is inherited verbatim from app.json — the single source of
  // truth for shared config. Only the env-specific fields are overridden here.
  ...config,
  name: config.name ?? 'K-Journey',
  slug: config.slug ?? 'k-journey',
  ios: {
    ...config.ios,
    googleServicesFile: firebaseFiles[APP_ENV].ios,
  },
  android: {
    ...config.android,
    googleServicesFile: firebaseFiles[APP_ENV].android,
  },
  plugins: [
    ...(config.plugins ?? []),
    // Google Sign-In native module + iOS OAuth redirect URL scheme. Appended
    // here rather than in app.json so iosUrlScheme can branch per env.
    ['@react-native-google-signin/google-signin', { iosUrlScheme: googleAuth[APP_ENV].iosUrlScheme }],
  ],
  extra: {
    ...config.extra,
    // Read at runtime via Constants.expoConfig.extra.* — environment drives the
    // future EnvironmentBanner / environment_loaded / staging push prefix
    // (ADR-0024 Wave 2); googleWebClientId feeds GoogleSignin.configure().
    environment: APP_ENV,
    googleWebClientId: googleAuth[APP_ENV].webClientId,
    eas: {
      ...config.extra?.eas,
      projectId: process.env.EAS_PROJECT_ID || config.extra?.eas?.projectId,
    },
  },
});
