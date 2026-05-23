# 0013. Apple Sign-In primary, Google deferred

* **Status:** accepted (retroactive, with planned supersession when Google OAuth config completes)
* **Date:** 2026-05-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `auth`, `users`

## Context and Problem Statement

PRD v1.0 §4.1 lists *"Google 로그인 (주요), 애플 로그인 (iOS 필수)"*. In practice, Apple Sign-In was wired first because:

* iOS App Store requires Sign in with Apple if any third-party SSO is offered.
* The native `expo-apple-authentication` flow with nonce + `OAuthProvider.credential('apple.com', token)` was the more complete reference implementation in `@react-native-firebase`.
* Google requires OAuth 2.0 client setup (iOS + Web for nonce verification), `REVERSED_CLIENT_ID` URL scheme, and a Google Cloud Console project. This was punted until OAuth credentials could be obtained without distraction.

A placeholder Alert in `sign-in.tsx` informs users that Google sign-in is coming. CLAUDE.md NEVER #12 prohibits enabling Google without the OAuth wiring.

## Decision Drivers

* iOS App Store ineligibility risk if Google ships before Apple.
* PRD product promise: account-bound 4-month artifact ⇒ stable auth more important than provider count.
* Korean market: Apple ID adoption is high among the target demographic (university exchange students with iPhones).

## Considered Options

1. **Apple first, Google deferred to a near-term follow-up** (chosen)
2. **Both at MVP launch**
3. **Google only** (rejected — App Store ineligibility)

## Decision Outcome

**Chosen:** Apple Sign-In wired + tested. Google Sign-In stubbed with a placeholder Alert until OAuth client config is obtained. CLAUDE.md NEVER #12 protects against accidentally enabling it half-wired.

### Positive Consequences
* Sim QA and TestFlight unblocked on Apple alone.
* Reduces moving pieces during MVP shaping.
* Apple's nonce flow validated.

### Negative Consequences
* Android users *cannot sign in* until Google ships. Mitigated by iOS-first launch (CLAUDE.md *Stack (locked)* implies both targets, but App Store first is a fair sequencing).
* Apple ID adoption gap among older Android-owning users — small but real for some Phase 4 (post-MVP) growth angles.
* The placeholder Alert is dead code that must be removed when Google ships. Tracked.

### Reversibility
Forward-only — Google sign-in activation will *supersede* this ADR (status will flip to *superseded by 0013-rev* when shipped).

## Pros and Cons of the Options

### Apple first
* **+** Compliant with App Store.
* **+** Single provider to wire and QA at MVP.
* **−** Android users blocked at sign-in.

### Both at launch
* **+** Full coverage.
* **−** OAuth setup is a multi-step external dependency; risks slipping launch.

### Google only
* **−** Forbidden by App Store policy if any third-party SSO is offered.

## Plan to supersede

When OAuth 2.0 client is provisioned:
1. Add iOS + Web OAuth clients (Google Cloud Console).
2. Add `REVERSED_CLIENT_ID` to Info.plist URL schemes.
3. Install `@react-native-google-signin/google-signin`.
4. Wire `GoogleSignin.signIn()` + `GoogleAuthProvider.credential(idToken)` in `sign-in.tsx`.
5. Handle `SIGN_IN_CANCELLED`, `IN_PROGRESS`, `PLAY_SERVICES_NOT_AVAILABLE` separately.
6. Remove CLAUDE.md NEVER #12.
7. Open a new ADR (0013-rev) marked *supersedes 0013*.

## Links

* **PRD:** §4.1, §11.1 (auth row)
* **Project rules:** `CLAUDE.md` NEVER #12, Open decisions §4
* **Code:** `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`
* **Memories:** `project_open_decisions_2026_05_05.md`
* **Related ADRs:** [ADR-0003](0003-firebase-rn-modular-sdk.md), [ADR-0014](0014-anonymous-auth-removed.md)
