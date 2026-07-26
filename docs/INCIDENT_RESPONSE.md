# Incident Response

> ⛔ **(legacy — not injected into harness steps by default.)** the account and server-user-data incident paths are out of scope under `DEC-001`/`DEC-022`. Severity ladder, contact tree, and the user-notification templates (§8.4–8.6) stand. Basis: `CLAUDE.md` Decision precedence · `.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md` (2026-07-27).

> What to do when something goes wrong in production. Not a script — a playbook of decisions. Acute action: page yourself, classify, decide, act, postmortem.

## 1. Severity ladder

| Severity | Trigger | Response time | Comms |
|---|---|---|---|
| **SEV-1** | Crash-free users < 95% over 1 h; or App Store removes app; or **data breach** | Immediate | "Apologies & we're investigating" tweet/email within 1 h |
| **SEV-2** | Crash-free users 95–99% over 1 h; or core feature broken (sign-in fails, mission complete fails); or Firestore Rules misconfig blocking real users | Within 4 h | Status note in next release notes |
| **SEV-3** | Single screen visual regression; non-blocking error in edge case | Within 1 week | Patched in next minor release |
| **SEV-4** | Documentation / spec drift; copy issues; non-functional cosmetics | Backlog | — |

## 2. Decision tree

```
Alert fires
  │
  ├─ Is it a crash spike? ── YES ─▶ Crashlytics; check top crasher  ──▶ SEV-1 or SEV-2
  │                                  │
  │                                  ├─ A new code path? → identify last change → hotfix or revert
  │                                  └─ A library / OS issue? → workaround
  │
  ├─ Is it a usage spike? ── YES ─▶ Firebase Usage; check Firestore reads
  │                                  │
  │                                  ├─ Runaway snapshot? → unsubscribe bug → hotfix
  │                                  └─ Real growth? → consider quota upgrade
  │
  ├─ Is it auth failures? ── YES ─▶ Firebase Auth + Apple developer status page
  │                                  │
  │                                  ├─ Apple ID outage? → wait + status comms
  │                                  └─ Our config broke? → rollback config
  │
  ├─ Is it Firestore Rules blocking real users? ── YES ─▶ Console → previous version → redeploy
  │
  └─ Is it a data leak / PII exposure? ── YES ─▶ SEV-1 — see §6
```

## 3. SEV-1 protocol

1. **Acknowledge** within minutes. Take notes.
2. **Mitigate** before fixing. If a Firestore Rules regression is locking users out, redeploy the previous rules version (Firebase Console → Rules → History) before debugging.
3. **Communicate** to users only if SEV-1 impacts experience or privacy: brief, factual, apologetic.
4. **Fix** with a hotfix release (PATCH bump).
5. **Verify** the fix in staging before promoting to prod.
6. **Postmortem** within 48 h. Write to this file under §10 incident log.

## 4. SEV-2 protocol

Similar to SEV-1 but with relaxed comms timing. Fix in the next minor release window if hotfix isn't justified.

## 5. Hotfix path

Skipping the usual cadence:

1. Branch off prod commit: `git checkout -b hotfix/X.Y.Z+1`
2. Patch the bug. No refactoring. **Do not** smuggle in unrelated changes.
3. `npm run check` green.
4. Run relevant manual scenario from `docs/TESTING.md`.
5. Bump PATCH version.
6. `eas build --profile prod`.
7. `eas submit --profile prod`.
8. Add `- Hotfix: (description)` to release notes.

App Store / Play Store expedited review:
* Apple: explain in "Review notes" that this is a critical fix. Reviews accelerate to ~24 h.
* Google: no expedited path; review usually <24 h anyway.

## 6. Data leak / PII exposure

If a leak is suspected (sensitive data in Crashlytics, PostHog event payload, public bucket, etc.):

1. **Stop the bleed**: revoke / delete the leaking payload from the destination (PostHog: event delete; Crashlytics: event delete; Firebase Storage: object delete).
2. **Identify scope**: how many users, what fields. Use Crashlytics filter + PostHog event explorer.
3. **Fix the source**: code change that prevents recurrence.
4. **Notify users** if the scope warrants (GDPR-ish threshold: PII actually identifiable & accessible to third parties).
5. **Postmortem** with the security-themed template (see §11).

## 7. App Store removal

If the app is pulled by Apple / Google:

1. Read the reason in the App Store Connect / Play Console notice.
2. Common reasons:
   * Sign-in required without "Sign in with Apple" → ADR-0013 compliance regression.
   * Privacy form mismatch → `docs/SECURITY.md` §8 didn't match actual collection.
   * 4.0 Design / 5.1 Privacy → policy violation, requires policy doc + code change.
3. Address the cited reason. Re-submit with explanation in Review Notes.

## 8. Communication templates

### 8.1 SEV-1 status update
> We're investigating an issue affecting some users since {time KST}. Sign-in is currently failing for new users. We've identified the cause and are deploying a fix. We'll update this thread when resolved. Sorry for the disruption.

### 8.2 Data exposure disclosure
> On {date}, we discovered that K-Journey was logging some user names to our crash reporting tool. We have removed the affected data and patched the code. If you were affected, you've received an email with details. We're sorry — this should not have happened.

### 8.3 Post-resolution
> The issue affecting {feature} since {time} has been resolved. Please update K-Journey to vX.Y.Z. Thank you for your patience.

### 8.4 In-app banner (Wave 2 — 2026-05-14)

When an incident is **active** and users are likely to hit it before sign-in / before opening the app's social channels, surface a top-of-app banner via the T4 incident banner primitive (ADR-0028, ADR-0031). Voice rules per `docs/MICROCOPY.md` — factual, no apology spiral, no urgency-scare.

| Phase | Banner copy (English) | Banner copy (Korean translation guide) |
|---|---|---|
| **Investigating** | `Service is having a moment. We're looking into it.` | `서비스 일시 점검 중. 원인 확인 중입니다.` |
| **Identified** | `Issue identified. We'll have it fixed shortly.` | `원인 파악 완료. 곧 정상화됩니다.` |
| **Monitoring (post-fix)** | `Things are back. Please reopen the app if you see issues.` | `정상 동작 복귀. 이상 시 앱 재실행 부탁드립니다.` |
| **Resolved** (auto-dismiss banner after 1 h) | (banner removed) | — |

**Wiring**: incidents are flagged in Firestore `_incidents/active` → all clients foreground-poll on app open + every 60 s while open → `<IncidentBanner />` mounted in `app/_layout.tsx` reads the doc and renders. `accessibilityRole="alert"`, `accessibilityLiveRegion="assertive"` per ADR-0028.

### 8.5 Push notification (use sparingly)

For SEV-1 lasting > 30 min affecting majority of users, send a one-time push via Firebase Console manual push:

| Push title | Push body |
|---|---|
| `K-Journey is having a moment` | `We're investigating an issue. Your byeongpung and missions are safe. We'll let you know when it's fixed.` |

**Constraints (ADR-0015 trade-off)**:
* Manual push is the single allowed exception to "behavior-triggered only" — counts as **incident-triggered**, not behavior-triggered.
* Maximum 1 push per incident. No "still investigating" updates via push (use the in-app banner — §8.4).
* Send via FCM segment `incident_subscribers_v1` (V2 may add user opt-out).

### 8.6 Post-incident apology + compensation

For incidents with **user data impact** (mission progress lost, photo deleted, panel unlock dropped):

**Apology email template** (sent within 24 h of resolution, via Firebase Extensions "Trigger Email" + SendGrid):

```
Subject: K-Journey — what happened on {date}

Hello,

On {date} between {start} and {end} KST, K-Journey experienced an issue that affected
{specific impact — e.g. "your byeongpung panel count temporarily showed lower than expected"}.

We've fixed the underlying cause. Your data is safe — {specific reassurance —
e.g. "we restored the correct count from server timestamps"}.

What we're doing differently:
- {specific change 1 — e.g. "We now alert when panel-unlock event volume drops below baseline"}
- {specific change 2 — e.g. "We added a Cypress test for the cross-device merge case"}

Sorry for the disruption.

— K-Journey team
```

**Compensation policy**:
* MVP: no monetary compensation. K-Journey is a paid app ($2-3) but the brand promise (4-month memento) is honored by **restoring data**, not refunding.
* If data is **unrecoverable** (e.g. a Firestore doc was permanently deleted by an ops error), surface a one-time T2 modal on next app open: `We restored your account but couldn't recover {specific items}.` Body explains exactly what is missing. No CTA other than `Got it`.
* **Do not** offer free in-app currency or unlocks — there are no in-app purchases in MVP. Future V2 may revisit if the monetization model changes.

**When to apologize publicly vs privately**:
* SEV-1 with > 100 users impacted → public Twitter/X + GitHub Discussions thread (§8.1 status update + §8.3 post-resolution + §8.6 apology email all applied).
* SEV-2 with < 100 users → email only.
* PII exposure (any scale) → email + regulatory notification per `docs/SECURITY.md` §9 (GDPR 72-hour rule).

## 9. Postmortem template

```
# Postmortem — {short title}

* Date: YYYY-MM-DD
* Severity: SEV-{1,2}
* Duration: {start → end}
* Author: {name}

## Summary
One paragraph. What happened, who was affected.

## Timeline
- HH:MM (KST) - first signal / alert
- HH:MM - acknowledged
- HH:MM - mitigated
- HH:MM - fixed
- HH:MM - verified

## Root cause
Specific. "Mutator missing isDevMock() branch" not "config issue".

## Why it wasn't caught
Tests, review, or pre-flight that should have caught it but didn't.

## Action items
- [ ] (owner, date) Specific change that prevents recurrence.
- [ ] (owner, date) Test that catches this class of bug.
- [ ] (owner, date) Doc update if needed.
```

## 10. Incident log

(Add postmortems here as they happen.)

*No incidents recorded yet at v1.1 publication.*

## 11. Past memorable lessons

* **Dev-mock mutator omission** caused an "infinite spinner" loop (memory: `feedback_devmock_mutator_required.md`). ADR-0006 + ADR-0012 now codify the rule. Code review checklist includes "every new mutator has an isDevMock branch."
* **Reanimated worklet factory closure** caused a UI-thread crash (memory: `feedback_reanimated_worklet.md`). ADR-0019 codifies the inline-only rule.

## 12. Links

* `docs/OPERATIONS.md`
* `docs/RELEASE.md`
* `docs/MONITORING.md`
* `docs/SECURITY.md`
