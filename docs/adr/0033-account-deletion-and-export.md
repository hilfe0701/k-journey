# 0033. Account deletion & data export (GDPR / 한국 개인정보보호법)

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `gdpr`, `pipa`, `account`, `compliance`, `firestore`, `cloud-function`

## Context and Problem Statement

K-Journey collects identifiable personal data: Apple ID `uid`, name, university, housing type, arrival/departure dates, mission completion timestamps, photos, bucket entries. The app targets users in Korea, and our primary user base spans EU + Asia-Pacific exchange-student demographics. Two legal regimes apply:

* **GDPR** (EU users) — Right of erasure (Article 17), Right to data portability (Article 20). Users may request deletion or export at any time. The controller must respond within 30 days.
* **한국 개인정보보호법 (PIPA)** — Articles 36 (deletion) and 38 (transfer/export). Korean residents have analogous rights with shorter compliance windows.

App Store and Google Play policies enforce both:
* Apple App Store Review Guideline **5.1.1(v)** (since June 2022): if your app supports account creation, you **must** offer in-app account deletion.
* Google Play Console (since 2024): account-deletion link **and** in-app entry are required for any app that creates accounts.

K-Journey today has **no** in-app deletion path and **no** export path. Both gaps are **App Store rejection risks**, regardless of the legal arguments. This ADR locks the policy and the surface.

A second concern: K-Journey is a **4-month emotional artifact** for the user. Deletion is irreversible and may be regretted. Industry best practice is a **grace period** with a "restore" affordance.

## Decision Drivers

* App Store / Play Store compliance — required to ship.
* GDPR Article 17 + PIPA Article 36 — required by law for EU + Korean residents.
* User regret protection — the byeongpung is meant to be a 4-month memento; a one-tap delete that vaporizes 4 months of work is product malpractice.
* Engineering surface — must be implementable without a backend re-architecture. K-Journey currently uses Firestore + Storage; we have Cloud Functions available but no backend service.
* Auditability — every deletion request must produce an immutable record (legal trail).

## Considered Options

1. **30-day soft delete + Cloud Function reaper + email-delivered export** (chosen)
2. **Immediate hard delete on tap (no grace period)**
3. **External form (web) deletion request — manual ops processing**
4. **Soft delete + indefinite retention until reaper** (no time bound)

## Decision Outcome

**Chosen:** A two-action policy — **Delete account** and **Export my data** — both reachable from Settings → Account (ADR-0032). Deletion is **soft** for 30 days with a reaper Cloud Function; export is **immediate** with email-delivered ZIP.

### Part A — Delete account

#### User flow

1. Settings → Account → tap **Delete account** (destructive, `palette.dancheong`).
2. Modal confirmation 1: title `Delete your K-Journey account?` body `This will remove your byeongpung, missions, buckets, and photos in 30 days. You can change your mind during that window.` Buttons: `Cancel` (primary) / `Delete account` (destructive).
3. Modal confirmation 2 (only after tapping the destructive in step 2): title `One last check.` body `Tap "I'm sure" to schedule deletion. We'll email a recovery link to your Apple ID email — open it within 30 days to undo.` Buttons: `Cancel` (primary) / `I'm sure` (destructive).
4. On `I'm sure`: write `users/{uid}/_meta.deletionRequestedAt = serverTimestamp()` and sign user out. Show full-screen toast: `Account scheduled for deletion. Check your email.`
5. The user lands on the sign-in screen. Signing back in within the grace window restores the account (see Part C).

#### Backend

* **Soft delete marker**: Firestore document `users/{uid}/_meta` with `deletionRequestedAt: Timestamp`. Existing data is **not** modified.
* **Cloud Function reaper** (`functions/src/reapDeletedAccounts.ts`): scheduled daily at KST 04:00 (off-hours). Queries `users` where `_meta.deletionRequestedAt < (now - 30 days)`. For each: recursively delete `users/{uid}/**`, delete Storage `users/{uid}/**`, delete Firebase Auth user, write audit row to `_admin/deletionLog/{ulid}` with `uid`, `deletedAt`, `originalRequestedAt`.
* **Firestore Rules** (ADR-0021 update): a user with `_meta.deletionRequestedAt` set may still read their own data (so the Recovery flow can show "Welcome back, here's your byeongpung — undo deletion?") but writes other than `_meta.deletionRequestedAt` clear are blocked.
* **Auth recovery email**: a Cloud Function `sendDeletionEmail` triggered on `_meta.deletionRequestedAt` write. Email body: `Your K-Journey account is scheduled for deletion on YYYY-MM-DD. To undo, tap this link or sign in to the app within 30 days.`

#### Recovery (within 30 days)

1. User signs in with the same Apple ID.
2. App detects `_meta.deletionRequestedAt` is set → `useDeletionStatus` hook returns `pending`.
3. Show full-screen modal: title `Welcome back. Your account is scheduled for deletion in N days.` body `Tap "Cancel deletion" to keep your byeongpung.` Buttons: `Cancel deletion` (primary) / `Continue with deletion` (destructive, dismisses modal but keeps schedule).
4. On `Cancel deletion`: clear `_meta.deletionRequestedAt`. Toast: `Account restored.`

#### After 30 days

* Reaper purges. Auth user is gone; signing in with the same Apple ID creates a **new** user document — there is no link to the old data.
* Audit log row stays in `_admin/deletionLog` indefinitely (retention policy out of scope; expect annual review).

### Part B — Export my data

#### User flow

1. Settings → Account → tap **Export my data**.
2. Modal: title `Export your K-Journey data?` body `We'll email a ZIP with your byeongpung images, missions, buckets, and photos. Allow up to 10 minutes.` Buttons: `Cancel` (primary) / `Send to my email` (primary).
3. On confirm: write `users/{uid}/_meta.exportRequestedAt = serverTimestamp()`. Show toast: `Export queued. Check your email shortly.`
4. Cloud Function `generateExport` triggered on `_meta.exportRequestedAt` write:
   * Read `users/{uid}/profile`, `users/{uid}/missions/**`, `users/{uid}/buckets/**`.
   * Read Storage `users/{uid}/photos/**`.
   * Read byeongpung composed image (regenerated from current panel state).
   * Bundle into ZIP: `profile.json`, `missions.json`, `buckets.json`, `photos/` (with original filenames preserved), `byeongpung_current.png`.
   * Upload ZIP to Storage `users/{uid}/exports/{ulid}.zip` (signed URL, 7-day expiry).
   * Send email to Apple ID email with download link.
   * Clear `_meta.exportRequestedAt`.

#### Throttling

* One export per user per 24 hours. If the user re-taps within the window, surface T2 modal: title `Export already queued` body `Check your email — your last export was sent at HH:MM.`

### Part C — Audit trail

* Every deletion (committed by reaper) writes to `_admin/deletionLog/{ulid}` with `uid`, `deletedAt`, `originalRequestedAt`. **No PII** — just the uid and timestamps.
* Every export writes to `_admin/exportLog/{ulid}` with `uid`, `exportedAt`, `byteSize`. No PII.
* Both logs are admin-only Firestore Rules (no client read).

### Positive Consequences
* App Store / Play Store compliance unblocked.
* GDPR / PIPA compliance with documented user flow.
* 30-day grace period protects users from regretted deletion.
* Export is real (ZIP via email), not a paper promise.
* Audit log gives legal/incident-response teams a trail without retaining PII.

### Negative Consequences
* Cloud Functions are new infrastructure for K-Journey. Adds operational surface (deploy, monitor, error budget).
* Email delivery requires SMTP configuration (recommend Firebase Extensions "Trigger Email" with SendGrid).
* 30-day soft retention means storage costs persist for 30 days post-request — small overhead, acceptable.
* Recovery flow adds complexity to sign-in path — `useDeletionStatus` hook + modal.

### Reversibility

Reversible at the policy layer (window length adjustable per ADR amendment). The Cloud Function reaper is the irreversible step — once it runs, data is gone. Mitigated by 30-day window + email warning.

## Pros and Cons of the Options

### 30-day soft delete + reaper + email export (chosen)
* **+** App Store compliant.
* **+** GDPR / PIPA compliant.
* **+** User-regret protected.
* **+** Audit trail.
* **−** Requires Cloud Functions + email infrastructure.

### Immediate hard delete
* **+** Simpler.
* **−** No undo. Catastrophic for the 4-month memento product.

### External web form
* **+** Zero in-app surface.
* **−** Apple App Store rejects this (5.1.1(v) requires **in-app** entry).

### Soft delete with no time bound
* **+** Maximum recovery flexibility.
* **−** GDPR requires the controller to act within 30 days. Indefinite retention violates the spirit.

## Test plan

* Unit (`__tests__/accountDeletion.test.ts`): `_meta.deletionRequestedAt` write triggers sign-out; recovery clears the field; deletion modal flow requires two confirmations.
* Cloud Function unit (`functions/__tests__/reaper.test.ts`): emulator test — past-due document is purged; in-window document is preserved; audit log written.
* Integration (Firestore emulator + functions emulator): full lifecycle — request → email mock fires → recovery → cancel → restored.
* Manual QA (`docs/TESTING.md`): two-confirm delete UX; recovery within 30 days; expired window → fresh user document.
* Manual QA: export request → email arrives within 10 min → ZIP downloads → contents match expected schema.
* Manual QA: throttle — re-tap export within 24 h → modal "already queued".
* Security review: Firestore Rules deny all client reads of `_admin/**`; deletion/export logs admin-only.

## Migration plan

This ADR is forward-looking — no in-app account-management surface exists today.

1. **PR-A — Settings Account section UI:** Sign out (existing) + Export + Delete buttons + 2-confirm modals per spec above. Persist `_meta` write.
2. **PR-B — Cloud Function `reapDeletedAccounts`:** scheduled daily KST 04:00. Emulator tests.
3. **PR-C — Cloud Function `generateExport`:** triggered on `_meta.exportRequestedAt`. Storage write + signed URL + email. Throttle.
4. **PR-D — Cloud Function `sendDeletionEmail`:** triggered on `_meta.deletionRequestedAt` write. Recovery link + warning copy.
5. **PR-E — `useDeletionStatus` hook:** signed-in users with `_meta.deletionRequestedAt` see the recovery modal at app foreground.
6. **PR-F — Firestore Rules update (`firestore.rules`):** soft-delete read carve-out + `_admin/**` lockdown. Coordinate with ADR-0021 owner.
7. **PR-G — Email template + Firebase Extension setup:** "Trigger Email" + SendGrid (or alternative). Templates in `functions/src/emails/`.

## Links

* **PRD:** §11.12 (new — Account management & GDPR), §11.5 (security cross-ref)
* **Project rules:** none new (CLAUDE.md NEVER #16 — no committed secrets — applies to SendGrid keys via EAS Secrets)
* **Related ADRs:** [ADR-0013](0013-apple-primary-google-deferred.md) (Apple Sign-In email), [ADR-0014](0014-anonymous-auth-removed.md) (no anonymous = always have an Apple ID email), [ADR-0021](0021-firestore-rules-acl-model.md) (Rules update), [ADR-0024](0024-environment-separation-dev-staging-prod.md) (Cloud Function deploys per env), [ADR-0032](0032-settings-screen-architecture.md) (entry surface)
* **Docs:** `docs/SECURITY.md` (PII classification cross-ref), `docs/SETTINGS.md` (Account section spec)
* **Code (target):** `app/settings/account.tsx` (new), `src/state/useDeletionStatus.ts` (new), `functions/src/reapDeletedAccounts.ts` (new), `functions/src/generateExport.ts` (new), `functions/src/sendDeletionEmail.ts` (new), `firestore.rules` (update)
* **External:** [Apple App Store 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/#5.1.1), [Google Play account deletion policy](https://support.google.com/googleplay/android-developer/answer/13327111), [GDPR Art. 17](https://gdpr-info.eu/art-17-gdpr/), [PIPA Art. 36](https://elaw.klri.re.kr/eng_service/lawView.do?hseq=53044&lang=ENG)

## Notes

The two-confirm modal pattern is intentionally annoying — App Store reviewers test that delete-account is reachable but not accidentally tappable. Two confirmations + email follow-up satisfies the "accidental delete" anti-pattern detection.

The 30-day grace period is the GDPR upper bound, not the absolute floor. PIPA may require shorter — if Korean legal review later imposes a 15-day window, the constant is one config value (`DELETION_GRACE_DAYS = 30`) and the email copy needs an update.

The export ZIP intentionally regenerates the byeongpung as a single composed PNG (rather than 8 separate panel files). This is the user-facing artifact they care about; a developer-facing JSON of panel state would be obscure. Engineering may add a `panels/` subfolder later if power users request.

Email is the chosen delivery mechanism (vs in-app download) because (a) Apple ID email is verified, (b) 7-day signed URL works on any device, (c) email is the legal jurisdiction's expected medium for data portability requests.
