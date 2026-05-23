# Security & Privacy

> Threat model, rules, PII policy, and key-rotation runbook for K-Journey. Decision authority for the rules model: [ADR-0021](adr/0021-firestore-rules-acl-model.md). For the runtime threat surface, see [`architecture/ARCHITECTURE.md`](architecture/ARCHITECTURE.md) §8.

## 1. Threat model summary

| # | Threat | Surface | Mitigation | Owner |
|---|---|---|---|---|
| T1 | User A reads User B's progress | Firestore | `firestore.rules` `isOwner(uid)` | ADR-0021 |
| T2 | Anonymous client writes user data | Firestore | `isSignedIn()` rejects anonymous tokens | ADR-0014, ADR-0021 |
| T3 | PII leaked to Crashlytics / PostHog | Telemetry | `setUserId(uid)` only; KJEvent union excludes PII | ADR-0004, ADR-0012 |
| T4 | Clock manipulation gives early phase / D-Day | App | `serverTimestamp()` for write times; `clockGuard.ts` records skew | ADR-0022 |
| T5 | Public catalogue write spam | Firestore | `write: if false` on catalogues | ADR-0021 |
| T6 | Apple Sign-In token replay | Auth | Nonce verification handled by Firebase Auth | ADR-0013 |
| T7 | MMKV cache corruption → crash loop | Local storage | `getJson` returns null on parse failure; migration runner backs up + resets corrupt keys | ADR-0023 |
| T8 | Secrets in repo | Build | `.env`, `GoogleService-Info.plist`, `google-services.json` in `.gitignore`; EAS Secrets for prod | CLAUDE.md NEVER #16 |
| T9 | Firestore Rules misconfiguration locks out real users | Deploy | Emulator-based rules tests before deploy (§4) | ADR-0021 |
| T10 | Reanimated worklet crash → app force-close | Animation | Inline-only rule for `useAnimatedStyle` callbacks | ADR-0019 |

## 2. Firestore Rules

Authoritative file: [`firestore.rules`](../firestore.rules) at repo root.

Summary:
* `users/{uid}/**` — owner read/write only (Apple or Google signed-in).
* `universities/{id}`, `missions_catalog/{id}` — signed-in read only; admin write via Console.
* `emergency/{id}` — open read (even anonymous, for emergency-borrowed-phone case); admin write only.

Deploy:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Per environment (ADR-0024): deploy to dev → staging → prod separately. **Never** deploy rules to prod without running the emulator tests first.

## 3. PII classification

| Field | Class | May appear in |
|---|---|---|
| `uid` | Internal identifier | Firestore (own user doc), Crashlytics (`setUserId`), PostHog (`distinctId`) |
| `email` | PII | Firestore (own user doc only). **Never** in Crashlytics. **Never** in PostHog event properties. |
| `displayName` | PII | Firestore (own user doc only). Same prohibitions as email. |
| `mission completion timestamps` | Behavioural | Firestore (own), PostHog as `phase` + `category` only (not the timestamp itself per event) |
| `bucket item text (user-typed)` | User content | Firestore (own) only. **Never** in PostHog (the `bucket_item_complete` event must carry `bucketId` + `itemId`, never the text) |
| `device location / coordinates` | Sensitive PII | **Not collected.** K-Journey does not request location permission. |
| `app crashes / stack traces` | Internal | Crashlytics — with PII stripped (no email/name) |

Code locations to inspect when changing the schema:
* `src/lib/posthog.ts` — `KJEvent` union and `track()` shape.
* `src/lib/errorAlert.ts` — Crashlytics `recordError` call (PII-free message wrapping).
* `src/hooks/useAuth.ts` — `identify(uid, props)` call: ensure props never carry PII beyond the uid.

## 4. Rules unit testing

Use `@firebase/rules-unit-testing` and the Firestore emulator. Test scenarios (also in `docs/TESTING.md` §Firestore Rules):

| # | Setup | Action | Expected |
|---|---|---|---|
| R1 | Anonymous token | Read `users/anyuid` | DENY |
| R2 | Apple-signed-in as uid=A | Read `users/A/missions/m1` | ALLOW |
| R3 | Apple-signed-in as uid=A | Read `users/B/missions/m1` | DENY |
| R4 | Apple-signed-in as uid=A | Write `universities/Yonsei` | DENY |
| R5 | Apple-signed-in as uid=A | Read `universities/Yonsei` | ALLOW |
| R6 | Anonymous (no token) | Read `emergency/police` | ALLOW |
| R7 | Apple-signed-in | Write a 2 MB blob to `users/A` | DENY (size limit 100 KB) |

CI step: run rules tests before `firebase deploy --only firestore:rules`. **Do not skip.**

## 5. Secret management

| Secret | Where it lives | Rotation |
|---|---|---|
| `GoogleService-Info.plist` (iOS) | `.gitignore`'d locally; EAS Secret for builds | Per Firebase project create/delete |
| `google-services.json` (Android) | same | same |
| Firebase API key | embedded in plist/json (public — but restricted to bundle ID by Firebase) | n/a |
| PostHog write key | `.env` local; `EXPO_PUBLIC_POSTHOG_KEY` via EAS Secret | Quarterly |
| Apple Developer credentials | App Store Connect | n/a (per-developer) |

**Never** copy a prod plist into the repo, even with `_prod` suffix. EAS Secrets only.

## 6. Crashlytics PII filter

`src/lib/errorAlert.ts:showOperationError` is the single recording surface. Rules:

* `setUserId(uid)` only — never `setUserName` / `setUserEmail`.
* `recordError(err)` — `err.message` must not contain `email`, `displayName`, or user-typed strings (mission text, bucket item text, free-form input).
* `setAttribute(key, value)` — keys like `era`, `phase`, `university` are OK; never `displayName`.

If a thrown error includes user input in its message, wrap it: `throw new Error('User input failed validation')` — the validation code already produced the specific error code (`validation.ts`), so the user input doesn't need to round-trip through the exception.

## 7. Anonymous-auth permanent removal

ADR-0014. **Never** re-add `signInAnonymously()`. Firestore Rules `isSignedIn()` would silently allow anonymous tokens if we ever switch back — explicit provider whitelist (`apple.com`, `google.com`) blocks this from drifting.

## 8. Privacy disclosure (App Store / Play Console)

| Data type | Collected? | Linked to user? | Purpose |
|---|---|---|---|
| Email | Yes (provided by Apple/Google sign-in) | Yes | Account |
| Name | Yes (provided by Apple/Google sign-in, optional) | Yes | Display only |
| App functionality data (mission completion) | Yes | Yes | Core product |
| Diagnostics (crashes) | Yes | Yes (uid) | Crashlytics |
| Product interaction (events) | Yes | Yes (uid) | PostHog — funnel/retention |
| Location | **No** | n/a | n/a |
| Contacts | **No** | n/a | n/a |
| Photos | Yes (when user shares byeongpung image) | No (only the captured image is written to library) | Share feature |

Store-listing privacy form must match the above. Mismatch is grounds for App Store review rejection.

## 9. Incident: PII leak found in event properties

If a code review or production telemetry shows PII in a PostHog event:

1. **Immediately** revoke PostHog event by editing the event in the dashboard (PostHog supports event deletion).
2. Open a hotfix PR removing the PII from the event payload.
3. Deploy.
4. Notify users only if the leak was substantive (per GDPR/CCPA thresholds). Document the incident in `docs/INCIDENT_RESPONSE.md`.

## 10. Links

* [ADR-0021 Firestore Rules ACL](adr/0021-firestore-rules-acl-model.md)
* [ADR-0014 Anonymous auth removed](adr/0014-anonymous-auth-removed.md)
* [ADR-0013 Apple primary, Google deferred](adr/0013-apple-primary-google-deferred.md)
* [ADR-0022 KST timezone single source](adr/0022-kst-timezone-single-source.md)
* [ADR-0012 Async mutator error contract](adr/0012-async-mutator-error-contract.md)
* `firestore.rules` (repo root)
* `docs/INCIDENT_RESPONSE.md` (sister doc)
