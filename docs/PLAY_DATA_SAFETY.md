# Play Console — Data Safety form answers

> Fill this into **Play Console → App content → Data safety**. Derived from the
> actual data surface (`src/lib/posthog.ts`, `useAuth.ts`, `firebase.ts`,
> `firestore.rules`). Keep in sync with `docs/PRIVACY_POLICY.md`. The App Store
> "Privacy Nutrition Labels" use the same facts — mirror there.

## Top-level answers

- **Does your app collect or share any of the required user data types?** → **Yes** (collects).
- **Is all collected data encrypted in transit?** → **Yes** (TLS to Firebase + PostHog).
- **Do you provide a way for users to request that their data is deleted?** →
  **Yes** — in-app **Settings → Account → Delete account** (`account_delete_initiated`).
- **Sharing:** We do **not** share data with third parties for their own use.
  Firebase (Google) and PostHog are **service providers / processors** acting on
  our behalf → in Play's model these are **"collected," not "shared."**

## Data types — declare as collected

| Play data type | Collected | Linked to user | Purpose(s) | Optional? |
|---|---|---|---|---|
| **Email address** | Yes | Yes | App functionality (account), Analytics | Required (sign-in) |
| **Name** | Yes | Yes | App functionality (account display) | Required (from Apple/Google) |
| **User IDs** (Firebase UID; PostHog/analytics IDs) | Yes | Yes | App functionality, Analytics | Required |
| **App interactions** (events: mission complete, era switch, etc.; screens) | Yes | Yes | Analytics, App functionality | Required |
| **Other user-generated content** (wishlist text, byeongpung progress) | Yes | Yes | App functionality | Required |
| **Crash logs** | Yes | Yes | Diagnostics (App functionality) | Required |
| **Diagnostics** (device model, OS version, performance) | Yes | Yes | Diagnostics | Required |

### Session replay note
PostHog **session replay is enabled** (`enableSessionReplay: true`) with
`maskAllTextInputs: true`. Declare this under **App interactions** (screen
recordings of in-app activity). Text inputs are masked; images are not masked.

### Resolved / confirmed
- **Photos / files:** **Not collected.** Verified in code — byeongpung images
  are captured locally (`react-native-view-shot`) and only saved to the device
  Photos library or shared via the OS share sheet (`src/lib/share.ts`). There is
  **no Firebase Storage upload** (the `@react-native-firebase/storage` dependency
  was removed, 2026-06-12). Do **not** declare Photos and videos as collected.
- **Approximate/precise location:** none collected → declare nothing.
- **Financial info:** none — paid download (if any) is handled by the store; we
  never receive payment data.

## Security practices section
- Data encrypted in transit: **Yes**.
- Users can request data deletion: **Yes** (in-app).
- Committed to Play Families Policy / directed at children: **No** (audience is
  university-age; not a kids app).
- Independent security review: **No** (unless one is commissioned).

## Data not collected (explicitly)
Precise/approximate location, contacts, calendar, SMS/call logs, health &
fitness, web browsing history, installed apps, payment info.

### Advertising ID — NOT collected
There is **no advertising SDK**. Firebase Analytics (which would pull
`com.google.android.gms.permission.AD_ID`) was **removed** along with the unused
`@react-native-firebase/analytics` / `messaging` / `storage` modules (2026-06-12),
so the build neither requests `AD_ID` nor collects the Advertising ID. Answer the
Play Data Safety advertising-ID question accordingly (**not collected**) and do
**not** add the `AD_ID` permission.
