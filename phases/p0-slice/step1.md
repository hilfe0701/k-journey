# Step 1 — 인증·서버 사용자 데이터 계층을 걷어낸다

## 왜 이것이 첫 step인가

`app/_layout.tsx:110`의 `<AuthGate />`가 앱 진입을 막고, `:117-184`가 `useAuth()`의 `user`로
라우팅을 분기해 `sign-in`으로 보낸다. **`DEC-001`이 로그인을 없앴으므로 이 게이트가 남아 있는 한
온보딩 → 홈 슬라이스가 `npm run web`에서 끝까지 돌지 않는다.**

이것은 뒷정리가 아니라 **관통의 전제**다. 근거는 `DEC-028`(`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`).

## 근거 — 확정된 결정만 쓴다

| 결정 | 상태 | 무엇을 정했나 |
|---|---|---|
| `DEC-001` | **확정** | 로그인을 두지 않는다. 사용자 데이터는 로컬에 둔다 |
| `DEC-022` | **확정** | 서버(Firebase)가 하는 일은 **3가지뿐**이다 — 콘텐츠 배포 · 익명 이벤트 · 전원 공통 알림. 여기에 **운영자 감사 로그**가 4번째로 들어갔다(`41` §2) |
| `DEC-026` **삭제분** | **확정 — 적용한다** | 상태 `save_pending`·`sync_conflict`, 전이 `E2`~`E6`을 걷어낸다 |

**뒤집힌 ADR** (`.work/pmjob/k-journey/45-k-journey-adr-dec-reconciliation-2026-07-27.md`):
`ADR-0006` dev-mock auth · `ADR-0013` Apple/Google Sign-In · `ADR-0014` anonymous auth ·
`ADR-0021` Firestore owner ACL · `ADR-0033` 계정 삭제/export · `ADR-0031` 원격 sync.

## 작업

1. **진입 게이트를 연다** — `app/_layout.tsx`의 `AuthGate`에서 **인증 분기를 제거**한다.
   온보딩 완료 여부(`profile.onboardingCompletedAt`)만으로 온보딩 ↔ 탭을 가른다.
2. **`src/hooks/useAuth.ts`** 및 그것을 읽는 호출부를 정리한다. 로컬 프로필만 남긴다.
3. **`app/(onboarding)/sign-in.tsx`** — 화면 파일은 **삭제하지 않는다**(`DEC-024`의 「`Won't`는 삭제가 아니다」와 같은 처리).
   라우팅에서 **도달 불가로 만들고** 파일 머리에 legacy 주석 한 줄을 남긴다.
4. **`src/lib/firebase.ts`** — `Auth`, 사용자별 Firestore 문서, `Storage` 업로드 경로를 제거한다.
   Messaging · Analytics · Crashlytics는 남긴다(`DEC-022`의 3가지 + 감사 로그).
5. **`firestore.rules`** — per-user ACL 모델을 제거한다. 콘텐츠 읽기 전용 규칙만 남긴다.
6. **원격 sync 상태·전이 제거** — `save_pending` · `sync_conflict`와 전이 `E2`~`E6`.
   사용자 문자열에서 **「연결되면 반영」·「동기화」류를 0건으로** 만든다.

## AC — 직접 실행해서 확인하라

```bash
npm run typecheck && npm run lint && npm test     # 전부 통과 · jest 146건 이상 유지
grep -rn "useAuth\|signInWith\|AuthGate" app/ src/ --include=*.ts --include=*.tsx   # 0건 (주석 제외)
grep -rniE "연결되면 반영|동기화됩니다|synced|sync_conflict|save_pending" app/ src/ --include=*.ts --include=*.tsx
```

- [ ] `npm run check` 통과
- [ ] `jest` **146건 이상** 통과 (`I01` 기준선. 줄어들면 왜 줄었는지 `summary`에 적어라)
- [ ] 위 `grep` 2개가 **0건**(legacy 주석 · 이 step이 남긴 주석은 제외)
- [ ] `npx expo start --web`로 앱이 뜨고 **sign-in 화면을 거치지 않고** 온보딩이 렌더된다

> 🔻 **2026-07-27 정정 (`DEC-029`).** 마지막 항목은 원래 「온보딩 첫 화면(**`ONB-02` University**)에 도달한다」였다.
> **`ONB-02`는 이 시점에 코드에 없다** — `ONB-02`~`ONB-06`은 **step 3**(`onboarding-condition-input`)이 만든다.
> **step 1의 AC가 step 3의 산출물을 인수조건으로 적고 있었다.** step 1의 목적은 「진입을 연다」이므로
> 판정은 **「`sign-in`을 거치지 않고 온보딩이 렌더되는가」**로 충분하다.
> **판정을 낮춘 것이 아니라 잘못 놓인 인수조건을 제 step으로 돌려보낸 것이다.**

> ⚠️ **`jest` 건수는 `npm ci` 이후에 재라. 그러지 않으면 낡은 `node_modules`가 통과를 만든다.**
> 이 step이 `package.json`에서 지운 4종(`@react-native-firebase/auth`·`/firestore`·`google-signin`·
> `expo-apple-authentication`)은 **`npm install`을 돌리기 전까지 물리적으로 남아 있다.**
> 실제로 2026-07-27에 그 상태의 「146/146 통과」가 나왔고, 뒤늦게 정리되자 **16 suites 전부 실패**로 드러났다
> (`jest.setup.js`의 목만 남아 있었다). 근거는 `DEC-029` 사실 ⑥.

## ⛔ 이 step이 하지 않는 것

- **`app/(onboarding)/sign-in.tsx` 파일 삭제** — 도달 불가로만 만든다
- **`docs/adr/` 파일 수정·삭제** — 뒤집힘은 「구현 근거로 쓰지 않음」이지 삭제가 아니다
- **화면 ID 삭제** · **자산 삭제** · **`src/data/missions.ts` 삭제**
- **`save_failed`·`E8` 신설** — `DEC-026`의 **미확정** 부분이다. **격리한다**
- **조건 축·규칙 엔진** — step 2다
- **`docs/SECURITY.md`·`PLAY_DATA_SAFETY.md` 본문 수정** — 읽기만 한다. 배너가 이미 붙어 있다

## 실패하면

`MAX_RETRIES` 3회 후에도 실패하면 `index.json`에 `error`를 기록하고 멈춘다.
**되돌릴 조건이 이미 정해져 있다**(`DEC-028` 필드 10 ①): 계층 제거 대신 **`AuthGate` 우회만** 하고
`firestore.rules`·`useAuth.ts` 정리는 뒤로 미룬다. **관통이 목적이지 삭제가 목적이 아니다.**
그 경우 `error_message`에 **「어디까지 됐고 무엇이 막았는지」**를 적어라.
