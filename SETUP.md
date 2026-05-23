# K-Journey — Local setup

This is a React Native + Expo (managed workflow) app. **Firebase native modules
mean Expo Go won't work — you need a development client.**

## 1. Prerequisites

- Node 20+ (you're on 24, that's fine)
- Xcode 15+ (for iOS) and/or Android Studio (for Android)
- A Firebase project — https://console.firebase.google.com
- A PostHog project (free tier) — https://posthog.com

## 2. Firebase config

In Firebase Console → your K-Journey project → Project settings → General:

- Add an **iOS app** with bundle ID `com.kjourney.app`. Download
  `GoogleService-Info.plist` and save it at the project root.
- Add an **Android app** with package `com.kjourney.app`. Download
  `google-services.json` and save it at the project root.

Then enable in Firebase Console:

- **Authentication** → Sign-in method → enable Apple and Google. (Anonymous is
  intentionally not used per CLAUDE.md NEVER #11 — members-only.)
- **Firestore Database** → Create in production mode (start with default rules,
  tighten later).
- **Cloud Storage** → Get started.
- **Cloud Messaging (FCM)** → no setup needed; the SDK auto-registers.

> Both `.plist` and `.json` files are in `.gitignore` — don't commit them.

## 3. PostHog config

Create `.env` at the project root by copying `.env.example`:

```
EXPO_PUBLIC_POSTHOG_API_KEY=phc_yourActualKey
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

If you skip this, the analytics calls become no-ops — the app still runs.

## 4. Install + first run

```sh
# Install JS deps
npm install

# Generate native iOS/Android folders from app.json (only on first run or after
# config changes — destructive, wipes ios/ and android/)
npx expo prebuild --clean
```

**Patch fmt for Xcode 26** (required — RN 0.76.9 ships fmt 11.0.2 which fails on
Xcode 26.4 Clang). Edit `node_modules/react-native/third-party-podspecs/fmt.podspec`:

- `spec.version = "11.0.2"` → `"11.1.4"`
- `:tag => "11.0.2"` → `"11.1.4"`

`npm install` wipes this — reapply after every fresh install.

```sh
# Pod install (autolinking picks up native modules)
cd ios && pod install && cd ..

# Open the workspace in Xcode and build (Cmd+R)
open ios/KJourney.xcworkspace
```

In Xcode → Signing & Capabilities → set **Personal Team** for automatic
codesigning. This embeds `com.apple.developer.applesignin` entitlement into the
binary signature; ad-hoc `xcodebuild` skips this and Apple Sign-In fails
silently. `npx expo run:ios` is also broken on Xcode 26 — use Xcode IDE Cmd+R.

The first build takes 5–15 minutes (CocoaPods + Xcode). Subsequent JS reloads
hot-update through the Metro bundler.

## 5. What to verify

- Splash plays for 2.2s with eight color bars rising in sequence.
- Sign-in screen appears. **Apple Sign-In** lands on profile setup.
  In `__DEV__` mode, the **[Dev] Skip auth** button bypasses to a fixture profile.
- Profile flow (4 steps) → Date picker (arrival + departure) → Era selection →
  drops you into the Home tab.
- Home shows D-Day computed from your departure date, four phase tabs, and the
  mission list filtered to your current phase.
- Tap a mission card → detail screen → Mark complete → the byeongpung strip on
  Home updates the corresponding panel reveal.
- More tab → Sign out → returns to splash → sign-in.
- Emergency tab → opens offline-cached emergency content.

## 6. Build status

See `STATUS.md` for the current MVP completion snapshot — what's built, what's
verified, what's left for sim QA, and what's left before external distribution.

## 7. Useful commands

```sh
npm run check             # typecheck + lint + jest (52 tests)
npx tsc --noEmit          # typecheck only
npx expo start            # JS dev server (after native build is installed)
```

For changes to native modules or `app.json` plugin config, rebuild via
Xcode IDE (Cmd+R) — not `expo run:ios`, see §4.
