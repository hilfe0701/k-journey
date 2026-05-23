# K-Journey privacy policy (DRAFT)

> **Status: DRAFT — not yet published.** Review with legal counsel before going
> live. Host the final version at a public HTTPS URL (e.g. a GitHub Pages or
> Notion page) and put that URL in: Play Console → Store listing → Privacy
> policy, App Store Connect, and the in-app sign-in / Settings → About link.
> Korean translation follows each English section per `docs/MICROCOPY.md`
> (English-first). Effective date: _TBD on publish_.

K-Journey ("we", "the app") helps international students paint a four-month
byeongpung of their semester in Korea. This policy explains what we collect,
why, and your choices.

## 1. Who is responsible

K-Journey is operated by _[legal entity / individual name + contact address —
fill in before publishing]_. Contact: _[support email]_.

한국에 머무는 교환학생을 위한 앱 K-Journey의 개인정보 처리방침입니다. 운영 주체와
연락처는 게시 전 확정합니다.

## 2. Data we collect

We collect only what the app needs to work; there is no advertising SDK and no
data brokering.

| Category | Specific data | Source | Purpose |
|---|---|---|---|
| Account | Email address, display name | Apple Sign In / Google Sign In | Create and secure your account; bind your byeongpung to you across devices |
| User identifier | Firebase Auth UID | Generated on sign-in | Link your data to your account |
| Profile | University, housing type (dormitory/off-campus), arrival & departure dates, chosen era | You, during onboarding | Compute your journey phase, D-Day, and which missions apply |
| App activity | Completed missions, wishlist (bucket) items, byeongpung panel progress | You, in-app | Render your progress and gallery |
| User content | Byeongpung images you save/share | Generated from your progress | Save to your device / share at your request |
| Analytics | In-app events (e.g. mission completed, era switched), screens viewed, and **session replays** (screen recordings with text inputs masked) | PostHog SDK | Understand usage and improve UX |
| Diagnostics | Crash logs, device model, OS version | Firebase Crashlytics | Fix crashes |

We do **not** collect precise location, contacts, health data, or payment card
data. Paid download (if applicable) is handled entirely by the App Store / Play
Store — we never see your card.

수집 항목: 계정(이메일·이름), 식별자(UID), 프로필(대학·거주형태·도착/출국일·시대),
앱 활동(미션·위시리스트·병풍 진행), 사용자 콘텐츠(병풍 이미지), 분석(이벤트·화면·
세션 리플레이 — 텍스트 입력은 마스킹), 진단(크래시 로그). 위치·연락처·건강·결제카드
정보는 수집하지 않습니다.

## 3. How we use it

- Provide the core experience (phase, missions, byeongpung, gallery).
- Keep your account secure and restore your data on a new device.
- Send **behavior-triggered** push notifications only (D-30/D-14/D-7 reminders,
  phase changes, panel unlocks) — never marketing or daily/weekly nags.
- Diagnose crashes and improve usability through aggregate analytics.

## 4. Who processes your data (sub-processors)

| Processor | Role | Region |
|---|---|---|
| Google Firebase (Auth, Firestore, Storage, Crashlytics, Cloud Messaging) | Account, database, file storage, crash reporting, push | Production project region (e.g. `asia-northeast3`, Seoul) |
| PostHog | Product analytics & session replay | United States (`us.i.posthog.com`) |
| Apple / Google | Sign-in identity providers | Per their policies |

Analytics data is processed by PostHog in the **United States**. By using the
app you understand your event data may be transferred there.

데이터 처리 위탁: 구글 Firebase(계정·DB·스토리지·크래시·푸시), PostHog(분석·세션
리플레이, 미국), Apple/Google(로그인). 분석 데이터는 미국에서 처리됩니다.

## 5. Retention

Your account data is kept while your account exists. The byeongpung is designed
as a four-month keepsake, so we retain your progress until you delete it or your
account. Crash and analytics data are retained per the processors' default
windows.

## 6. Your rights

You can, from **Settings → Account** in the app:

- **Access / export** your data (`account_export_requested`).
- **Delete your account** and associated data (`account_delete_initiated`),
  which removes your profile, progress, and stored images.

For any request you cannot complete in-app, contact _[support email]_. We honor
access, correction, deletion, and portability requests. (See PRD §11.12 and the
account-management spec.)

설정 → 계정에서 데이터 내보내기·계정 삭제가 가능합니다. 접근·정정·삭제·이동 요청을
지원합니다.

## 7. Children

K-Journey is intended for university-age students and is **not directed at
children under 14**. We do not knowingly collect data from children under 14.

## 8. Security

Data in transit uses TLS. Firestore access is restricted by per-user security
rules (`firestore.rules`). Session replays mask all text inputs. See
`docs/SECURITY.md`.

## 9. Changes

We will update this policy as the app evolves and revise the effective date.
Material changes will be surfaced in-app.

## 10. Contact

_[support email]_ — _[legal entity + address]_.

---

### Pre-publish checklist (remove before publishing)

- [ ] Fill legal entity, address, and support email.
- [ ] Confirm production Firebase region once `k-journey-prod` exists.
- [ ] Confirm whether the app is paid (adjust §2 payment line).
- [ ] Legal review.
- [ ] Host at a public HTTPS URL; paste URL into Play Console, App Store Connect,
      and the in-app About link.
