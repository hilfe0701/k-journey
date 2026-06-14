# K-Journey — 다음 할 일 (resume here)

> 최종 업데이트: 2026-05-23. 목표: **Google Play 스토어 등록 (Android 전용).**
> iOS/App Store는 이번 출시 범위 아님 — Apple Developer 계정·APNs·iOS 빌드 불필요
> (코드의 iOS 배선은 그대로 두면 나중에 무손실 재사용). 코드·빌드 설정·런치 문서는
> **완료·검증 끝** (`npm run check` green, `expo-doctor` 18/18).
> 남은 건 **당신 계정이 필요한 외부 작업**뿐. 아래 순서대로.
> 맥락 상세: `STATUS.md`의 "Play Store readiness" 섹션 +
> `project_play_store_prep_2026_05_22` 메모리.

## ⚠️ 코드 변경됨 (2026-06-12) — 출시 전 필수 확인
Play 출시 전수조사에서 데모 핵 제거 + 결함 수정을 반영함(2차 재감사 포함). 코드 게이트는 green
(`npm run check`: typecheck + lint + 146 tests). 단, 아래 **외부 작업**이 남음:
- 🟡 **2차 재감사(2026-06-12): 안 쓰는 Firebase SDK 3개 제거** — `analytics`/`messaging`/
  `storage`를 package.json에서 삭제(코드 미사용인데 RN 오토링킹으로 빌드에 포함돼 `AD_ID`
  광고ID 권한을 끌고 오던 문제 → 개인정보처리방침의 "no advertising SDK"와 모순). 이제
  광고ID 미수집 → **데이터안전 양식의 "광고 ID" 질문은 "수집 안 함"으로 답할 것.** 함께:
  약관(terms) 죽은 링크 제거(`kjourney.app/terms` 페이지 불필요), firestore.rules의 죽은
  soft-delete/exports/_admin 코드 정리. ⚠️ 네이티브 변경이라 **다음 prod 빌드(EAS가
  prebuild 새로 생성)에서 로컬 알림·크래시 리포팅 정상 동작 1회 확인**.
- ✅ **Firestore 규칙 재배포 — 완료 2026-06-12** (`k-journey-prod`에 배포: compiled successfully →
  released → Deploy complete). `firestore.rules`의 `missions` → `completedMissions` 오타 수정 +
  죽은 soft-delete 코드 정리분이 prod에 반영됨 → 미션 완료 쓰기 정상화.
- 🔴 **개인정보처리방침 채우기+호스팅** — `docs/PRIVACY_POLICY.md`에 법인명·support 이메일·
  시행일 빈칸 남음. 채워서 `https://kjourney.app/privacy`(앱이 링크하는 URL)에 호스팅.
  `support@kjourney.app` 메일박스도 실제 동작해야 함.
- ⚠️ **계정 삭제는 실기기 prod 빌드에서 테스트** — 데모용 가짜 로그인 제거(진짜 Apple/Google
  복원), 계정 삭제를 백엔드 없는 **클라이언트 즉시 삭제**로 구현
  (`src/lib/accountDeletion.ts`: 재인증 → Firestore 데이터 삭제 → Auth 사용자 삭제).
  재인증·deleteUser는 dev-mock/jest로 검증 불가 → 첫 prod 빌드에서 1회 수동 확인.
  데이터 내보내기(export) 기능은 제거(백엔드 없음, Play 필수 아님).

## 이미 끝난 것 (할 일 없음)
- 환경 분리 (`app.config.ts` + `eas.json` + `firebase.json`)
- Google 로그인 배선 (lib v16; dev OAuth 실값, prod는 TODO)
- Android targetSdk 34→35 (Play 필수 요건)
- async-storage 정렬 (doctor 18/18)
- 런치 문서: `docs/PRIVACY_POLICY.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`
- 512² 스토어 아이콘: `store-assets/play-store-icon-512.png`
- 로그인 화면 Android 대응 (2026-05-23): `sign-in.tsx` Apple 버튼 iOS 전용 게이팅 + Android는 Google primary (작동 안 하는 버튼 = Play 반려 위험 제거)

## 다음에 할 것 (외부 — 당신만 가능, 순서대로)

- [x] ✅ **1. 프로덕션 Firebase `k-journey-prod` 생성** — **완료 2026-05-23** (Google provider · Firestore 서울 `asia-northeast3` · 규칙 배포 ✔ · `app.config.ts` webClientId 채움 + `expo config` 검증)
  - ~~iOS 앱 추가~~ → **Android 전용이라 스킵** (`GoogleService-Info.prod.plist` 불필요)
  - Android 앱 추가 (패키지 `com.kjourney.app`, SHA-1은 4번 빌드 후) → json을 `config/firebase/google-services.prod.json`로 저장
  - Authentication → **Google** provider만 활성화 (Apple은 iOS 출시 때)
  - ❗ Google provider 켠 **뒤** `google-services.json`을 재다운로드해 저장 (webClientId 포함됨)
  - Firestore → 생성 (프로덕션 모드, 리전 `asia-northeast3` 서울 권장 ⚠️변경불가)
  - 규칙 배포: `firebase deploy --only firestore:rules --project <prod-id>` (CLI 설치됨: firebase-cli 15.18.0 via brew)
- [ ] **2. Google Play 개발자 계정** 개설 ($25, play.google.com/console)
- [x] ✅ **3. EAS 설정** — **완료 2026-05-23** (`@k-journey/k-journey`, projectId `a87d65e7-5b8f-4643-a62f-71a76f638d31`, owner `k-journey`; eas-cli `~/.local`; `eas init`이 app.json에 구운 dev `environment`/`googleWebClientId` 정리 — app.config.ts가 env 단일소스 유지)
- [ ] **4. 프로덕션 빌드** — `eas build -p android --profile production` (AAB 생성)
  - **(사전 필수, ✅완료 2026-05-23)** `google-services.prod.json`은 gitignore라 클라우드 빌드 서버에 없음 → EAS **file env var(`sensitive`)** 로 업로드: `eas env:create production --name GOOGLE_SERVICES_JSON --type file --value ./config/firebase/google-services.prod.json --visibility sensitive --scope project`. ⚠️ **`secret` 가시성은 안 됨** — 설정(app.config.ts) 평가 단계에서 안 잡혀 `googleServicesFile`이 gitignore 경로로 굳고 Gradle 실패함. `sensitive`여야 평가 시점에 주입됨. (secret→sensitive는 `--force` 불가, `eas env:delete` 후 재생성.)
  - 키스토어는 첫 빌드에서 이미 생성됨(EAS 원격) → 재빌드 시 프롬프트 없음
  - 첫 빌드 시 "Generate a new Android Keystore?" → **Yes** (EAS가 서명 관리; 대화형이라 직접 터미널에서)
  - 빌드 후 `eas credentials` (Android → production)로 **SHA-1** 확인 → Firebase **prod** Android 앱 → "SHA 지문 추가"에 등록. 안 하면 Google 로그인 `DEVELOPER_ERROR`
  - 참고: PostHog 키가 placeholder(`phc_REPLACE…`)라 분석은 꺼진 채로 출시됨. 원하면 실제 키를 EAS env로 주입(별도 작업)
- [ ] **5. Play Console 스토어 등록**
  - 개인정보처리방침: `docs/PRIVACY_POLICY.md` 공개 URL 호스팅 → Console에 입력
  - Data safety: `docs/PLAY_DATA_SAFETY.md`대로 입력
  - 스토어 등록정보 (`docs/STORE_LISTING.md` 카피 사용) — **이미지 자료 2종 신규 제작 필요** (상세 스펙은 STORE_LISTING.md §Graphics checklist):
    - **피처 그래픽** `1024×500` PNG/JPG, **알파(투명) 금지** — 도장+한지 컨셉(`DESIGN.md`), 텍스트·이모지 최소. 중요한 요소를 가장자리/정중앙에 두지 말 것(잘림/재생버튼 오버레이)
    - **폰 스크린샷 4~8장** (빌드 실행 후 캡처, 짧은 변 ≥1080px, 알파 금지): 온보딩 / 홈(phase+D-Day) / **미션완료 reveal**⭐ / 병풍 채워짐 / 갤러리 / 캠퍼스 / 긴급가이드 / 버킷리스트
    - 아이콘 512² = ✅ 완료(`store-assets/play-store-icon-512.png`), 태블릿·프로모영상 = 스킵(폰 전용)
    - **리뷰어 테스트 로그인** 제공 (로그인 벽 = 흔한 반려 사유)
- [ ] **6. AAB를 내부 테스트 트랙에 업로드** (`eas submit -p android` 또는 수동)

## "X 주면 내가 Y 해줌" (다음 세션에 요청만)
- **prod `google-services.json`** 주면 → `app.config.ts` `googleAuth.prod.webClientId` 채움 (Android 전용이라 `iosUrlScheme`은 TODO로 둠 — Android 빌드에 무해)
- **prod PostHog 프로젝트** 만들면 → dev/prod 분석 분리 (`eas.json` env) 배선
- 첫 빌드 후 → **Android 15 edge-to-edge QA** (targetSdk 35 부작용) 도움

## 언제든 재검증
```
npm run check        # 146 tests + typecheck + lint
npx expo-doctor      # 18/18
```
