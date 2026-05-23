# Per-environment Firebase native config

These files are **gitignored** (CLAUDE.md NEVER #16) and must never be committed.
`app.config.ts` selects the right pair per `APP_ENV` (set by the eas.json build profile).

| Env | iOS file | Android file | Firebase project |
|---|---|---|---|
| dev | `../../GoogleService-Info.plist` (repo root) | `../../google-services.json` (repo root) | `k-journey` (existing) |
| staging | `GoogleService-Info.staging.plist` | `google-services.staging.json` | `k-journey-staging` (not yet created) |
| prod | `GoogleService-Info.prod.plist` | `google-services.prod.json` | `k-journey-prod` (not yet created) |

dev keeps its files at the repo root (unchanged). staging/prod files go **here**.

## How to populate prod (do this for #1 — production Firebase)

1. Firebase Console → create project `k-journey-prod`.
2. Add an **iOS app** with bundle id `com.kjourney.app` → download `GoogleService-Info.plist`
   → save it here as `GoogleService-Info.prod.plist`.
3. Add an **Android app** with package `com.kjourney.app` → download `google-services.json`
   → save it here as `google-services.prod.json`.
4. Enable **Auth providers** (Apple + Google), create **Firestore** (production mode),
   enable **Storage**, then deploy rules: `firebase deploy --only firestore:rules --project <prod-id>`.

## Local build vs EAS cloud build

- **Local** (`expo prebuild`, `eas build --local`): reads the on-disk path above.
- **EAS cloud** (`eas build`): upload each file as a file-type secret so it is not in the repo:

  ```sh
  eas secret:create --scope project --name GOOGLE_SERVICES_JSON \
    --type file --value ./config/firebase/google-services.prod.json
  eas secret:create --scope project --name GOOGLE_SERVICES_PLIST \
    --type file --value ./config/firebase/GoogleService-Info.prod.plist
  ```

  EAS sets `GOOGLE_SERVICES_JSON` / `GOOGLE_SERVICES_PLIST` to the in-build file path,
  which `app.config.ts` reads in preference to the on-disk default.
