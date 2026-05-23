# 0021. Firestore Rules ACL model

* **Status:** proposed (this ADR proposes the rules; the `firestore.rules` file in repo root ships with the next deploy)
* **Date:** 2026-05-13
* **Deciders:** 김재윤
* **Tags:** `security`, `firestore`, `acl`

## Context and Problem Statement

K-Journey has shipped to internal QA on **default-allow-after-30-days Firestore Rules** (Firebase's open-tap default). This is acceptable for dev but is a **hard launch blocker** — without explicit rules, any authenticated user could read or write any document, and the 30-day default would lock everyone out the moment we ship.

We need a Firestore Rules file before any external test build (TestFlight, friends-and-family). The rules must:

* Allow signed-in **Apple or Google** users only (anonymous rejected — ADR-0014).
* Allow each user to read/write **only their own** `users/{uid}/**` documents.
* Allow read-only access to public catalogues (universities, missions catalogue).
* Allow open read of the **emergency guide** (CLAUDE.md MUST #9 spirit — emergency info should be reachable even before sign-in if technically possible).

## Decision Drivers

* PRD §11.5 (new in v1.1): security & privacy.
* Apple App Store privacy review: data-access claims must match enforcement.
* MVP threat model: a curious user reading another user's mission progress is the canonical bad outcome.
* No server-side code (no Cloud Functions in MVP) → rules are the entire authorization surface.

## Considered Options

1. **Strict owner-only with public catalogues read-only and emergency open-read** (chosen)
2. **Owner-only with no public collections** (move catalogue data into the bundle)
3. **Open read for any signed-in user, owner-only write**

## Decision Outcome

**Chosen:** Owner-only writes everywhere on user data; signed-in read on catalogues; open read on `emergency`. Anonymous tokens are explicitly rejected.

### Rules (target `firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null
          && request.auth.token.firebase.sign_in_provider in ['apple.com', 'google.com'];
    }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    match /users/{uid} {
      allow read, write: if isOwner(uid);
      match /missions/{missionId}  { allow read, write: if isOwner(uid); }
      match /buckets/{bucketId}    { allow read, write: if isOwner(uid); }
      match /exports/{exportId}    { allow read, write: if isOwner(uid); }
    }

    match /universities/{id}       { allow read: if isSignedIn(); allow write: if false; }
    match /missions_catalog/{id}   { allow read: if isSignedIn(); allow write: if false; }
    match /emergency/{id}          { allow read: if true;         allow write: if false; }
  }
}
```

### Positive Consequences
* Users cannot read each other's data.
* Public catalogues are not write-targets for spammers.
* Emergency guide remains reachable.
* Rules can be deployed via Firebase CLI from the same repo.

### Negative Consequences
* Any new collection or subcollection must update these rules; forgetting locks legitimate users out.
* Rules unit tests (planned in Part J via `@firebase/rules-unit-testing`) become an ongoing maintenance commitment.

### Reversibility
Trivially reversible — rules are deployable independently of app code.

## Pros and Cons of the Options

### Strict owner-only + public read + emergency open
* **+** Matches PRD privacy claims.
* **+** Spec-able + testable.
* **−** Adds rules-update burden per new collection.

### Owner-only, no public collections
* **+** Even more locked-down.
* **−** Catalogues (universities, missions metadata) ship in the bundle — version drift, larger bundle.

### Signed-in read everywhere
* **+** Simpler rules.
* **−** Privacy regression: any signed-in user could read another's `missions/{id}`.

## Testing

* `firebase emulators:start --only firestore`
* `@firebase/rules-unit-testing` to assert: anonymous reject, owner allow, non-owner reject, public read OK, emergency anonymous read OK.
* CI gate: rules tests run alongside `npm run check`.

## Links

* **PRD:** §11.5 (new section)
* **Docs:** `docs/SECURITY.md`
* **Code:** `firestore.rules` (new), `firestore.indexes.json` (new)
* **Related ADRs:** [ADR-0014](0014-anonymous-auth-removed.md) (no anonymous), [ADR-0013](0013-apple-primary-google-deferred.md) (which providers are allowed)
* **External:** [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
