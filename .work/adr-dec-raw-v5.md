작성 레인: gpt-5.6-sol · high · 독립 재도출 · 실행 2026-07-27 결과

이전 역할: 검수 레인(1~3차)

# ADR 35건 독립 재도출 · `v4` 대조

> 판정 순서: 이 문서의 §0·§1을 `docs/adr/`와 지정 `DEC`·보조 원문만으로 먼저 작성한 뒤 `v4`를 열었다.  
> 독립성 한계: 금지된 `v1`~`v4`·검수본의 본문은 §1 고정 전 열지 않았으나, 필수 라우터 `.work/pmjob/AGENTS.md`의 「지금 할 일」이 기존 결과의 **총분포**(`13·9·12·1`)를 노출했다. ADR별 매핑은 그 문서에서 가져오지 않았고 아래 35건은 양쪽 원문으로 재도출했다.

## §0 집계 — 명령과 결과

### 0.1 ADR 개수

```bash
rg --files docs/adr |
awk -F/ '$NF != "README.md" && $NF != "template.md" && $NF ~ /^[0-9]{4}-.*\.md$/ {n++} END{print n+0}'
```

결과: `35`

### 0.2 `DEC` 개수

```bash
dec31_count=$(rg -c '^### `DEC-[0-9]{3}`' \
  .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md)
dec001_count=$(rg -c '^## 1\. `DEC-001`' \
  .work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md)
printf 'DEC31=%s\nDEC001=%s\nDEC_TOTAL=%s\n' \
  "$dec31_count" "$dec001_count" "$((dec31_count + dec001_count))"
```

결과:

```text
DEC31=26
DEC001=1
DEC_TOTAL=27
```

### 0.3 §1 표 행 수

작성 후 실행할 명령:

```bash
awk '
  /^## §1 /{s=1; next}
  /^## §2 /{s=0}
  s && /^\| ADR-[0-9][0-9][0-9][0-9] /{n++}
  END{print n+0}
' .work/adr-dec-raw-v5.md
```

§1 고정 직후 결과: `35`

### 0.4 독립 판정 분포

알려진 양성(`뒤집힘`, `유효`, `보강`, `불명`을 각 1회 넣은 4행)을 같은 `awk`에 먼저 통과시켜 네 키가 각각 `1`로 검출되는지 확인한 뒤 35행에 실행했다.

```bash
awk -F'|' '
  /^## §1 /{s=1; next}
  /^## §2 /{s=0}
  s && $2 ~ /^ ADR-[0-9][0-9][0-9][0-9] $/ {
    gsub(/^ +| +$/, "", $4); c[$4]++; n++
  }
  END {
    print "뒤집힘", c["뒤집힘"]+0
    print "유효", c["유효"]+0
    print "보강", c["보강"]+0
    print "불명", c["불명"]+0
    print "합계", n+0
  }
' .work/adr-dec-raw-v5.md
```

결과:

```text
뒤집힘 13
유효 9
보강 12
불명 1
합계 35
```

### 0.5 `v4` 최초 열람 전 §0·§1 고정

```bash
shasum -a 256 .work/adr-dec-raw-v5.md
```

§0·§1만 존재하던 시점의 결과:

```text
195a3d333f2582eeec862cd8c5e62e29fac2c57bb01682d1eb072708f5f36d34  .work/adr-dec-raw-v5.md
```

이 해시를 기록한 뒤 `v4`를 최초 열람했고, 그 뒤 §2~§7을 추가했다. 따라서 최종 파일 해시는 위 값과 다르다.

## §1 대조표 — ADR 전건 독립 판정

| ADR ID | 제목 | **내 판정** | 관련 `DEC` | ADR 원문 | `DEC` 원문 | 코드 영향 |
|---|---|---:|---|---|---|---|
| ADR-0001 | React Native + Expo over Flutter | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** React Native + Expo (managed) + TypeScript strict mode, because it gave the team the *fastest path from PRD to first sim build* while preserving the cross-platform single-codebase goal that justified the original Flutter pick.” | 이 프레임워크 선택 축을 다루는 `DEC`가 없다. | 실재: `package.json`, `app.json`, `app/_layout.tsx`. RN·Expo 선택은 유지한다. |
| ADR-0002 | MMKV over Hive for local cache | 보강 | `DEC-001` | “**Chosen:** MMKV (`react-native-mmkv`), because it is the only sync-read, JSI-backed option, and K-Journey's persistence shape is key-value with small JSON blobs — exactly MMKV's sweet spot.” | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” | 실재: `src/lib/storage.ts`, `package.json`. MMKV 선택은 살고, 로컬 저장 책임이 캐시에서 원본으로 커진다. |
| ADR-0003 | Firebase RN Modular SDK over Web SDK | 보강 | `DEC-001`, `DEC-022` | “**Chosen:** `@react-native-firebase/*` modular API. It is the only option that delivers every PRD-required Firebase service without missing-service workarounds.” | “**앱 ↔ 서버 3가지**: ① 콘텐츠 정의 배포(**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드, `REQ-COR-003`) ② 익명 분석 이벤트 수집(**`not_applicable` 사유는 축을 식별하지 않는 3종만**: `ineligible`·`not_required`·`source_unconfirmed`) ③ 전원 공통 알림” / “**운영자 ↔ 서버 1가지**: ④ **콘텐츠 편집과 그 감사 로그**” | 실재: `src/lib/firebase.ts`, RN Firebase 패키지. SDK 선택은 폐기되지 않지만 Auth·사용자 Firestore 쓰기는 `DEC-001`/`022`와 충돌하므로 서비스 사용 범위를 잘라야 한다. |
| ADR-0004 | PostHog as primary product analytics | 보강 | `DEC-022` | “**Chosen:** PostHog Cloud (US region). Firebase Analytics stays as secondary (ADR-0005) for App Store optimisation funnels and as a fallback if PostHog is offline.” | “② 익명 분석 이벤트 수집(**`not_applicable` 사유는 축을 식별하지 않는 3종만**: `ineligible`·`not_required`·`source_unconfirmed`)” | 실재: `src/lib/posthog.ts`, `src/lib/telemetry.ts`. 공급자 우선순위는 살고 이벤트 익명성·사유 해상도를 제한한다. 미확정 `DEC-027`은 필수 근거로 쓰지 않는다. |
| ADR-0005 | Firebase Analytics as secondary | 보강 | `DEC-022` | “**Chosen:** Keep Firebase Analytics as secondary, fire essential events to both sinks.” | “② 익명 분석 이벤트 수집(**`not_applicable` 사유는 축을 식별하지 않는 3종만**: `ineligible`·`not_required`·`source_unconfirmed`)” | 실재: `package.json`, `app/_layout.tsx`; 부재: `@react-native-firebase/analytics` 의존성·초기화. 문서 결정은 살지만 현재 코드는 secondary sink 미구현이다. |
| ADR-0006 | Dev-mock bypass pattern (`isDevMock`) | 뒤집힘 | `DEC-001`, `DEC-022` | “**Chosen:** `isDevMock()` branch inside `src/lib/firebase.ts` plus reactive `useMMKVBoolean(KEYS.devMockAuth)` in `useAuth`.” | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장” / “조건 축·태스크 상태의 **원본은 올라가지 않는다**” | 실재: `src/lib/firebase.ts`, `src/hooks/useAuth.ts`, `app/(onboarding)/sign-in.tsx`; `isDevMock` 분기도 실재. 로컬을 dev 우회가 아니라 본 경로로 재설계한다. |
| ADR-0007 | Cold-start splash handler ref | 뒤집힘 | `DEC-024` | “**Chosen:** A React ref (`coldStartHandledRef`) in `AuthGate` (or root `_layout`). On first mount it sets itself true and forces a one-time redirect through `/splash`, after which the restored route resumes.” | “MoSCoW **`Won't`**로 명시하고 `19` §2.0·§3.1과 `30` §3.1에 **「이번 범위 밖 — 구현하지 않는다」**로 적는다.” / “**화면 ID는 남긴다**” | 실재: `app/_layout.tsx`의 `coldStartHandledRef`, `app/(onboarding)/splash.tsx`. ADR의 명시 목적이 `MEM-02` Byeongpung 초기화이므로 강제 우회를 이번 구현 근거로 쓰지 않는다. |
| ADR-0008 | Byeongpung PNG full-paintings (not SVG) | 뒤집힘 | `DEC-024` | “**Chosen:** 24 PNGs, one per (era, panel) pair, each baked with its era's colour and motif. The code's responsibility is *selection*, not styling.” | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” / “**「이번 범위 밖 — 구현하지 않는다」**” | 실재: `assets/byeongpung/` PNG 24개, `src/components/byeongpung/`, `app/(tabs)/byeongpung.tsx`. 자산·ID 삭제 뜻이 아니라 이번 구현 근거에서 제외한다. |
| ADR-0009 | Single-fire panel unlock gate (`claimPanelUnlock`) | 뒤집힘 | `DEC-024` | “**Chosen:** `claimPanelUnlock(panelNumber: number): boolean` in `src/lib/notifications.ts`.” | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” / “**「이번 범위 밖 — 구현하지 않는다」**” | 실재: `src/lib/notifications.ts`, 호출부 `app/mission/[id].tsx`, `app/bucket/[id].tsx`, 테스트. `MEM-01`·`MEM-02`가 돌아오기 전에는 패널 단발 게이트를 구현 근거로 쓰지 않는다. |
| ADR-0010 | Housing-specific mission tagging (`appliesTo`) | 뒤집힘 | `DEC-002`, `DEC-003`, `DEC-018` | “**Chosen:** `appliesTo?: 'dormitory' \| 'off-campus'` field. Missions without the field are universal (applies to both).” | “규칙 계층이 조합을 판정해 **서류 목록 + 항목별 `요청 대상자`**를 반환한다.” / “독립 범주로 추가한다. **원문의 4종 분류를 그대로 따른다**” | 실재: `src/data/missions.ts`, `missionsForHousing`, 테스트. 2값 UI 필터를 주거 4종 × `contractHolder` 규칙 판정으로 교체한다. |
| ADR-0011 | Single-source completion aggregation (`aggregateCompletions`) | 뒤집힘 | `DEC-024` | “**Chosen:** `aggregateCompletions` pure function in `src/lib/completions.ts`. Returns `{ missionCount, bucketItemCount, total }`.” | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” / “**「이번 범위 밖 — 구현하지 않는다」**” | 실재: `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, 소비 화면·테스트. 합산의 소비처인 문화 미션·병풍·갤러리가 `Won't`라 이번 기준에서 제외한다. |
| ADR-0012 | Async mutator error contract (`showOperationError`) | 보강 | `DEC-020`, `DEC-026` 삭제분 | “**Chosen:** A single helper `showOperationError(action, error)` in `src/lib/errorAlert.ts`” | “오류 5종을 **축 2**로 두고 태스크 카드에 **배지로 겹친다.**” / “**삭제** — 상태 **`save_pending`·`sync_conflict`**(오류 5종 → **4종**) · 전이 **`E2`·`E3`·`E4`·`E5`·`E6`**(7종 → **2종**)” | 실재: `src/lib/errorAlert.ts`, `src/lib/errors/catalog.ts`, `src/lib/errors/host.ts`. 단일 진입점·무음 실패 금지는 살고, 복구별 오류와 확정 삭제분에 맞춰 카탈로그를 보강한다. `save_failed`·`E8`은 격리한다. |
| ADR-0013 | Apple Sign-In primary, Google deferred | 뒤집힘 | `DEC-001` | “**Chosen:** Apple Sign-In wired + tested. Google Sign-In stubbed with a placeholder Alert until OAuth client config is obtained.” | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장” | 실재: `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`. 공급자 선택을 이번 구현 근거로 쓰지 않는다. |
| ADR-0014 | Anonymous auth removed | 뒤집힘 | `DEC-001` | “**Chosen:** Apple/Google only. Firestore Rules will explicitly reject anonymous tokens (ADR-0021).” | “**로그인을 두지 않는다.**” | 실재: `src/hooks/useAuth.ts`, `firestore.rules`; `signInAnonymously`는 부재. 익명 금지 결과만 우연히 같고 채택안인 Apple/Google-only 계정 구조는 무효다. |
| ADR-0015 | Behavior-triggered push only (no daily / weekly / marketing) | 보강 | `DEC-022`, `DEC-024` 범위 제약 | “**Chosen:** Behavior-triggered notifications only. Scheduled through `src/lib/notifications.ts`.” | “③ 전원 공통 알림” / “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**” | 실재: `src/lib/notifications.ts`. 행동 기반·비마케팅 원칙은 살고, 공통 원격 알림과 개인 로컬 알림을 분리한다. 병풍 패널 알림은 `DEC-024` 때문에 제외한다. |
| ADR-0016 | No CSS framework — inline RN styles + tokens | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** Plain RN styles + token imports. CLAUDE.md NEVER #17 forbids CSS frameworks.” | 이 스타일링 축을 다루는 `DEC`가 없다. | 실재: `design-tokens.ts`, `src/components/ui/`. 그대로 유지한다. |
| ADR-0017 | Design-token only color policy | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** Tokens only. CLAUDE.md MUST #1 + NEVER #1 + NEVER #20 enforce this.” | 이 색상 토큰 축을 다루는 `DEC`가 없다. | 실재: `design-tokens.ts`, `src/theme/eras.ts`. 재설계 화면에도 그대로 적용한다. 코드 내 직접 hex는 별도 정합성 문제다. |
| ADR-0018 | English first, Korean parenthetical for proper nouns | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** `English (한국어)` for proper nouns. Sentence-case English.” | proper-noun 병기 축을 다루는 `DEC`가 없다. `DEC-015`의 stay-type 라벨 재작성은 다른 축이다. | 실재: `src/data/missions.ts`, `src/data/universities.ts`, `src/data/bucketTemplates.ts`. 새 콘텐츠 카피에도 유지한다. |
| ADR-0019 | Reanimated worklet inline-only rule | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** Hard rule. `useAnimatedStyle(() => ({ ... }))` only — never `useAnimatedStyle(makeStyle())`.” | 이 런타임 구현 축을 다루는 `DEC`가 없다. | 실재: `src/components/mission/MissionCompleteOverlay.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx`. 새 애니메이션에도 유지한다. |
| ADR-0020 | Jest with React Native mocks | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** Jest with a custom `jest.setup.js` mocking the native modules we use (Firebase, MMKV, Notifications, MediaLibrary, etc.).” | 테스트 러너 축을 다루는 `DEC`가 없다. | 실재: `jest.setup.js`, `package.json`, 테스트 파일. 순수 로직 테스트 전략은 유지한다. |
| ADR-0021 | Firestore Rules ACL model | 뒤집힘 | `DEC-001`, `DEC-022` | “**Chosen:** Owner-only writes everywhere on user data; signed-in read on catalogues; open read on `emergency`. Anonymous tokens are explicitly rejected.” | “**로그인을 두지 않는다.**” / “조건 축·태스크 상태의 **원본은 올라가지 않는다**” | 실재: `firestore.rules`, `src/lib/firebase.ts`. 사용자 `uid` 소유권 ACL은 폐기하고 공개 콘텐츠·운영 감사 로그 범위만 새로 도출한다. |
| ADR-0022 | KST timezone as single source of truth | 보강 | `DEC-009`, `DEC-022` | “**Chosen:** Add `src/lib/dates.ts` exporting:” | “**절대 날짜 + 남은 일수를 함께** 표시한다.” / “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**” | 실재: `src/lib/dates.ts`, `src/lib/clockGuard.ts`, `src/hooks/usePhase.ts`, `src/lib/notifications.ts`. KST 단일원칙은 살고 새 절대기한·기기 알림의 계산 기반으로 구체화된다. Firestore `serverTimestamp()` 의존부는 제거 대상이다. |
| ADR-0023 | MMKV key versioning & migration | 보강 | `DEC-001` | “**Chosen:** Add `src/lib/storage/migrations.ts` with a typed `Migration[]` array, run via `runMigrations()` at app boot” | “조건 축·태스크 상태는 **기기 로컬에만** 저장” | ADR target `src/lib/storage/migrations.ts`는 부재; 실재 경로는 `src/lib/storageMigrations.ts`, 호출은 `app/_layout.tsx`, 테스트도 실재. 로컬이 원본이 되므로 마이그레이션 계약의 적용 범위가 커진다. |
| ADR-0024 | Environment separation (dev / staging / prod) | 보강 | `DEC-022` | “**Chosen:** Three environments with explicit separation. Replace `app.json` with `app.config.ts` that branches on `EAS_BUILD_PROFILE`.” | “**앱 ↔ 서버 3가지**: ① 콘텐츠 정의 배포(**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드, `REQ-COR-003`) ② 익명 분석 이벤트 수집(**`not_applicable` 사유는 축을 식별하지 않는 3종만**: `ineligible`·`not_required`·`source_unconfirmed`) ③ 전원 공통 알림” | 실재: `app.config.ts`, `eas.json`, `app.json`. 3환경 분리는 살고 환경별 Firebase 책임을 `DEC-022`의 3+1 역할로 좁힌다. 구현은 `APP_ENV` 분기라 ADR target과 차이가 있다. |
| ADR-0025 | Accessibility WCAG 2.1 AA target | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** WCAG 2.1 **AA** as the public-facing commitment.” | 접근성 등급 자체를 뒤집는 `DEC`가 없다. | 실재: `docs/ACCESSIBILITY.md`, `src/lib/a11y.ts`. `REQ-INR-003`의 WCAG 2.2·비색상 상태 표시는 상위 요구로 함께 적용한다. |
| ADR-0026 | EAS channel strategy & version policy | 보강 | `DEC-022` | “**Chosen:** Semver for user-visible versions; EAS-managed auto-increment for `buildNumber` (iOS) and `versionCode` (Android); explicit channels per environment.” | “① 콘텐츠 정의 배포(**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드, `REQ-COR-003`)” | 실재: `eas.json`, `app.config.ts`. 버전·채널 정책은 살고, 어떤 변경이 OTA/새 빌드인지 판정하는 책임이 추가된다. |
| ADR-0027 | Empty state pattern — icon + factual message + optional CTA | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** Every empty state in K-Journey is composed of exactly three slots, in this fixed order:” | 빈 상태의 시각·카피 조합을 정하는 `DEC`가 없다. `DEC-024`는 적용 화면 일부만 범위 밖으로 둔다. | 실재: `docs/EMPTY_STATES.md`, `src/components/ui/EmptyState.tsx`. 새 홈·설정 화면에도 패턴은 유지하되 Gallery 예시는 구현하지 않는다. |
| ADR-0028 | Error recovery & retry strategy — 4-tier decision tree | 보강 | `DEC-020`, `DEC-026` 삭제분 | “**Chosen:** A 4-tier decision tree that `showOperationError` (and a future companion `showOperationErrorWithRetry`) routes into based on error category.” | “오류 5종을 **축 2**로 두고 태스크 카드에 **배지로 겹친다.**” / “**삭제** — 상태 **`save_pending`·`sync_conflict`**(오류 5종 → **4종**) · 전이 **`E2`·`E3`·`E4`·`E5`·`E6`**(7종 → **2종**)” | 실재: `src/lib/errorAlert.ts`, `src/components/system/ToastHost.tsx`; ADR target `src/components/ui/Toast.tsx`, `IncidentBanner.tsx`, `useIncident.ts`는 부재. 4단 표면 전략은 살되 Auth·Firestore·동기화 예시는 제거하고 확정 오류축에 맞춘다. |
| ADR-0029 | Push notification copy library & permission priming | 보강 | `DEC-022`, `DEC-024` 범위 제약 | “### Part A — Single push copy library” / “### Part B — Permission priming UI” | “③ 전원 공통 알림” / “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**” | 실재: `src/lib/notifications/copy.ts`, `src/components/onboarding/NotificationPriming.tsx`, `src/lib/notifications.ts`. 단일 카피 정본·priming은 유지하고 전송 주체를 나눈다. phase/panel 카피는 새 범위에서 재선정한다. |
| ADR-0030 | Haptics & sound feedback policy | 불명 | `DEC-001`, `DEC-024`가 기존 순간을 제거하지만 대체 정책 없음 | “**Chosen:** Haptics fire at exactly **three moments**, using `expo-haptics`. Sound is **not** used at MVP.” | `DEC-024`: “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” / `DEC-001`: “**로그인을 두지 않는다.**” | 실재: `src/lib/haptics.ts`. 세 순간(패널 해금·문화 미션 완료·bucket/sign-out/photo 삭제)의 전제가 대부분 사라졌다. 새 태스크 완료·로컬 데이터 초기화에 햅틱을 둘지, 무음 정책을 유지할지 정한 근거가 없다. 새 상호작용 목록·접근성 테스트·명시적 햅틱 결정을 더 봐야 한다. |
| ADR-0031 | Offline state visibility & sync conflict resolution | 뒤집힘 | `DEC-001`, `DEC-022`, `DEC-026` 삭제분 | “### Part C — Sync conflict is silent” / “Backend resolves `last-write-wins`” | “조건 축·태스크 상태의 **원본은 올라가지 않는다**” / “**삭제** — 상태 **`save_pending`·`sync_conflict`**(오류 5종 → **4종**) · 전이 **`E2`·`E3`·`E4`·`E5`·`E6`**(7종 → **2종**)” | 실재: `src/components/ui/NetworkIndicator.tsx`, `src/state/useNetwork.ts`; ADR target `src/components/ui/Toast.tsx`는 부재, 실재 대응은 `src/components/system/ToastHost.tsx`. 일반 네트워크 표시만 재사용하고 사용자 데이터 sync/conflict 카피는 제거한다. |
| ADR-0032 | Settings screen architecture | 뒤집힘 | `DEC-001` + `19`의 확정 IA | “**Chosen:** A single Settings screen reachable from the More tab. The screen is composed of **5 categories**, each rendered as a section with header and list rows. No nested screens for now (V2 may split if any category grows past 6 rows).” | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” | 실재: `app/settings/index.tsx`, `app/(tabs)/more.tsx`; ADR target `src/state/useSettings.ts`는 부재. 확정 IA의 `SET-01`~`SET-05` 각 Page와 로컬 저장/내보내기로 재구성한다. |
| ADR-0033 | Account deletion & data export (GDPR / 한국 개인정보보호법) | 뒤집힘 | `DEC-001` | “**Chosen:** A two-action policy — **Delete account** and **Export my data** — both reachable from Settings → Account (ADR-0032). Deletion is **soft** for 30 days with a reaper Cloud Function; export is **immediate** with email-delivered ZIP.” | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” | 실재 legacy: `src/lib/accountDeletion.ts`, `firestore.rules`; ADR target `app/settings/account.tsx`, `useDeletionStatus`, Cloud Functions는 부재. 계정 삭제가 아니라 로컬 전체 삭제 + 텍스트 export로 바꾼다. |
| ADR-0034 | Photo upload pipeline (compression · EXIF · moderation · storage path) | 뒤집힘 | `DEC-022`, `DEC-024` | “**Chosen:** A four-part pipeline.” / “Storage path: `users/{uid}/photos/{missionId}/{ulid}.jpg`” | `DEC-024`: “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” / `DEC-022`의 앱↔서버 3가지에는 사진 업로드가 없다. | 실재: `app/mission/[id].tsx`; 부재: `src/lib/photoUpload.ts`, photo 컴포넌트, `storage.rules`. `MEM-01`·`MEM-03`와 사용자 업로드를 이번 구현 근거에서 제외한다. |
| ADR-0035 | Dark mode explicit rejection (MVP) | 유효 | 이 축을 다루는 `DEC` 없음 | “**Chosen:** K-Journey **explicitly rejects** dark mode for MVP. `userInterfaceStyle: 'light'` in `app.json` is the technical lock” | 다크 모드 축을 다루는 `DEC`가 없다. | 실재: `app.json`의 `userInterfaceStyle: "light"`, `design-tokens.ts`. 그대로 유지한다. |

## §2 ★ `v4`와의 대조

> §1의 독립 판정·35행·분포·SHA-256을 고정한 뒤 `.work/adr-dec-raw-v4.md`를 최초 열람했다.  
> 결과: **일치 29 / 불일치 6 / 합계 35**. 분포는 우연히 양쪽 모두 `뒤집힘 13 · 유효 9 · 보강 12 · 불명 1`이지만, 판정 주체가 다른 6행이 서로 상쇄됐다.

| ADR | `v4` 판정 | **내 판정** | 일치 | 불일치면 — 어느 쪽이 맞나 · 근거 원문 양쪽 |
|---|---:|---:|:---:|---|
| ADR-0001 | 유효 | 유효 | O | — |
| ADR-0002 | 보강 | 보강 | O | — |
| ADR-0003 | 보강 | 보강 | O | — |
| ADR-0004 | 보강 | 보강 | O | — |
| ADR-0005 | 보강 | 보강 | O | — |
| ADR-0006 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0007 | 불명 | 뒤집힘 | X | **`v4`가 맞고 내가 틀렸다.** ADR은 “forces a one-time redirect through `/splash`”를 택했고 문제 맥락은 복귀한 Byeongpung의 era/theme·panel opacity 초기화다. `DEC-001`은 “**로그인을 두지 않는다.**”, `DEC-024`는 `MEM-02`를 “**「이번 범위 밖 — 구현하지 않는다」**”로 둔다. 이는 구 근거가 사라졌다는 뜻이지 새 root에도 splash가 불필요하다는 결정은 아니다. 독립 cold-start 요구, 새 boot/navigation, splash의 남은 책임이 없으므로 `불명`이 맞다. |
| ADR-0008 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0009 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0010 | 뒤집힘 | 뒤집힘 | O | —. 단 내 관련 `DEC-002·003·018` 연결은 잘못이다. 정확한 근거는 `DEC-024`의 `MEM-01 Cultural missions` `Won't`다. |
| ADR-0011 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0012 | 보강 | 보강 | O | — |
| ADR-0013 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0014 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0015 | 보강 | 보강 | O | — |
| ADR-0016 | 유효 | 유효 | O | — |
| ADR-0017 | 유효 | 유효 | O | — |
| ADR-0018 | 보강 | 유효 | X | **`v4`가 맞고 내가 너무 좁게 읽었다.** ADR은 “**Chosen:** `English (한국어)` for proper nouns. Sentence-case English.”를 정하고, `DEC-015`는 “라벨을 재작성하고 예시를 병기한다. **제한된 영어 사용자를 전제**로 관용구·축약어를 피한다”고 한다. proper-noun 병기 규칙을 폐기하지 않으면서 같은 English-first 카피 체계를 실제 온보딩 라벨로 구체화하므로 `보강`이다. |
| ADR-0019 | 유효 | 유효 | O | — |
| ADR-0020 | 유효 | 유효 | O | — |
| ADR-0021 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0022 | 보강 | 보강 | O | — |
| ADR-0023 | 보강 | 보강 | O | — |
| ADR-0024 | 유효 | 보강 | X | **`v4`가 맞고 내가 인접 축을 보강으로 과장했다.** ADR은 “**Chosen:** Three environments with explicit separation.”을 택한다. `DEC-022`는 “**앱 ↔ 서버 3가지**: ① 콘텐츠 정의 배포(**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드, `REQ-COR-003`) ② 익명 분석 이벤트 수집(**`not_applicable` 사유는 축을 식별하지 않는 3종만**: `ineligible`·`not_required`·`source_unconfirmed`) ③ 전원 공통 알림”을 정할 뿐 dev/staging/prod 환경 수·bundle ID·채널을 구체화하지 않는다. 환경 분리 결정은 그대로 성립하므로 `유효`다. |
| ADR-0025 | 보강 | 유효 | X | **`v4`가 맞고 내가 새 상태 표현을 놓쳤다.** ADR은 “**Chosen:** WCAG 2.1 **AA** as the public-facing commitment.”를 택한다. `DEC-007`은 “2단으로 분리하고 **차단 태스크에 「무엇이 완료되면 풀리는지」를 반드시 표시**한다.”고 하고, `DEC-008`은 “**기본은 접힌 상태**로 하고 펼치면 사유 + 공식 근거 링크를 보여준다.”고 한다. 접근성 목표를 뒤집지 않고 새 상태·차단·경고의 정보 표현으로 구체화하므로 `보강`이다. |
| ADR-0026 | 유효 | 보강 | X | **`v4`가 맞고 내가 배포 경로와 릴리스 채널을 합쳤다.** ADR은 “**Chosen:** Semver for user-visible versions; EAS-managed auto-increment for `buildNumber` (iOS) and `versionCode` (Android); explicit channels per environment.”를 택한다. `DEC-022`의 “**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드”는 콘텐츠 변경의 배포 경로 판정이지 semver·buildNumber·EAS channel 결정이 아니다. 따라서 `유효`다. |
| ADR-0027 | 유효 | 유효 | O | — |
| ADR-0028 | 보강 | 보강 | O | — |
| ADR-0029 | 보강 | 보강 | O | — |
| ADR-0030 | 뒤집힘 | 불명 | X | **`v4`가 맞고 내가 `불명`으로 과소 판정했다.** ADR은 “**Chosen:** Haptics fire at exactly **three moments**, using `expo-haptics`. Sound is **not** used at MVP.”라고 고정한다. `DEC-024`는 대상을 “**`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**”으로 적고 “**「이번 범위 밖 — 구현하지 않는다」**”고 하며, `DEC-001`은 “**로그인을 두지 않는다.**”고 한다. 기존 세 순간 계약은 그대로 구현할 수 없다는 결론이 충분하므로 `뒤집힘`이다. 새 햅틱 정책이 미정인 것은 뒤집힘 이후의 다음 결정 공백이다. |
| ADR-0031 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0032 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0033 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0034 | 뒤집힘 | 뒤집힘 | O | — |
| ADR-0035 | 유효 | 유효 | O | — |

대조 뒤 최종 채택 판정은 `v4`의 35행이다. 내 §1은 독립 재도출 당시의 판정을 보존하고, 위 6행에서 내 오판을 명시적으로 철회한다.

## §3 `뒤집힘` 상세

아래 13건은 대조 뒤 최종 채택 판정 기준이다. 경로는 **실재**, **ADR target(부재)**, **실재 인접 경로**를 구분한다. 되돌릴 조건은 `DEC` 필드 10의 신호를 발동 분기로만 쓴다.

### ADR-0006 — Dev-mock auth/mutator

- **무효:** `isDevMock()`이 MMKV를 dev 우회로, Auth/Firestore를 제품 본 경로로 두는 전제.
- **코드·문서:** 실재 `src/lib/firebase.ts`, `src/hooks/useAuth.ts`, `app/(onboarding)/sign-in.tsx`, `docs/ANALYTICS_SCHEMA.md`.
- **신 방향:** 로그인과 사용자 Firestore 원본을 없애고 조건 축·태스크 상태를 로컬 원본으로 둔다. Firebase는 `DEC-022`의 3+1 역할만 남긴다.
- **되돌릴 조건:** `DEC-001`의 각 신호 — 완료 이력 소실이 중대 불만 상위 3위, 체류 중 기기 교체가 흔하다는 근거, `MET-006` 내보내기 실행률 저조 — 중 하나 관측 → `DEC-001` 대안 A 재검토 → 계정/서버 동기화 새 결정 확정. 그 뒤 dev/prod 이중 경로를 새로 도출한다.

### ADR-0008 — Byeongpung PNG 24장

- **무효:** 3 era × 8 panel PNG를 이번 구현에 번들하고 병풍 화면을 만드는 실행 전제.
- **코드·문서:** 실재 `assets/byeongpung/` 24개, `src/components/byeongpung/PanelImage.tsx`, `ByeongpungStrip.tsx`, `DESIGN.md §7`.
- **신 방향:** `MEM-02` ID·ADR·자산은 삭제하지 않되 `Won't`이므로 이번 구현 근거에서 격리한다.
- **되돌릴 조건:** `DEC-024`의 각 신호 — 진입 비율 10% 초과 / `I6` 카드 소팅에서 Memory와 실용 흐름 결합 / 8월 말 코호트 인터뷰 문화 콘텐츠 요구 — 중 하나 관측 → `DEC-024` Memory 범위 재검토 → 정식 `REQ`와 새 구현 결정 확정.

### ADR-0009 — Single-fire panel unlock

- **무효:** `claimPanelUnlock`이 overlay·telemetry·notification을 단발로 발동시키는 계약.
- **코드·문서:** 실재 `src/lib/notifications.ts`, `app/mission/[id].tsx`, `app/bucket/[id].tsx`, 테스트, `docs/PUSH_COPY.md`.
- **신 방향:** `MEM-01`·`MEM-02`가 `Won't`인 동안 gate·overlay·panel notification을 구현하지 않는다.
- **되돌릴 조건:** `DEC-024`의 세 신호 각각 → Memory 범위 재검토 → 문화 미션·병풍 요구와 panel unlock을 새로 확정.

### ADR-0010 — Housing-specific cultural-mission tagging

- **무효:** `appliesTo?: 'dormitory' | 'off-campus'`를 50개 구 문화 미션 카탈로그 필터로 쓰는 전제.
- **코드·문서:** 실재 `src/data/missions.ts`, `app/(tabs)/index.tsx`, `missionsForHousing`, 테스트.
- **신 방향:** `DEC-024`의 `MEM-01 Cultural missions` `Won't`에 따라 구 카탈로그 필터를 격리한다. `DEC-003`·`DEC-018`의 행정 서류 규칙으로 이 타입을 교체하라는 뜻이 아니다.
- **되돌릴 조건:** `DEC-024`의 세 신호 각각 → `MEM-01` 범위 재검토 → 문화 미션 요구와 조건 모델 새 결정 확정.

### ADR-0011 — Completion aggregation

- **무효:** `{ missionCount, bucketItemCount, total }`을 panel threshold·병풍 reveal·gallery summary의 단일 원천으로 쓰는 전제.
- **코드·문서:** 실재 `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, `app/gallery.tsx`, `app/(tabs)/byeongpung.tsx`, 테스트.
- **신 방향:** `MEM-01`~`MEM-03`의 `Won't` 동안 기존 합산과 소비자를 격리한다.
- **되돌릴 조건:** `DEC-024`의 세 신호 각각 → Memory 범위 재검토 → 살아나는 소비자와 완료 원천을 새로 확정.

### ADR-0013 — Apple/Google Sign-In

- **무효:** Apple 주 인증·Google 보류라는 공급자 선택.
- **코드·문서:** 실재 `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `firestore.rules`, `docs/SECURITY.md`.
- **신 방향:** 인증 화면·provider gate·UID 보관을 제거하고 로컬 원본·텍스트 export로 바꾼다.
- **되돌릴 조건:** `DEC-001`의 세 신호 각각 → 계정 대안 재검토 → 새 인증·보존 결정 확정. 옛 Apple/Google 경로는 자동 복구하지 않는다.

### ADR-0014 — Anonymous auth removed

- **무효:** Apple/Google만 허용하고 anonymous token을 거부하는 인증 모델.
- **코드·문서:** 실재 `src/hooks/useAuth.ts`, `firestore.rules`, `docs/SECURITY.md`.
- **신 방향:** 사용자 인증 경로 자체를 두지 않는다. 익명 분석 이벤트는 anonymous auth 계정과 다른 개념이다.
- **되돌릴 조건:** `DEC-001`의 신호 하나 → 계정/서버 동기화 재검토 → 새 인증 모델 확정. anonymous 허용 여부도 그때 별도 결정한다.

### ADR-0021 — Firestore owner ACL

- **무효:** 사용자 데이터가 `users/{uid}`에 있고 signed-in owner가 읽고 쓴다는 ACL.
- **코드·문서:** 실재 `firestore.rules`, `src/lib/firebase.ts`, `docs/SECURITY.md`, `docs/architecture/ARCHITECTURE.md`.
- **신 방향:** 조건 축·태스크 상태는 로컬에만 둔다. 서버는 공개 콘텐츠·익명 이벤트·전원 공통 알림·사용자 데이터 없는 운영 감사 로그만 처리한다.
- **되돌릴 조건:** `DEC-001` 신호 또는 `DEC-022` 필드 10의 종속 신호가 발동 → 해당 결정 재검토 → 서버가 사용자 값을 갖는 새 결정 확정 → 데이터 모델·인증·ACL 동시 재도출.

### ADR-0030 — Haptics exact-three policy

- **무효:** panel unlock·mission complete·bucket delete/sign out/remove photo의 정확히 세 순간 계약.
- **코드·문서:** 실재 `src/lib/haptics.ts`, `app/mission/[id].tsx`, `src/lib/notifications.ts`, `DESIGN.md §7.1`.
- **신 방향:** 구 세 순간을 현재 구현 근거에서 격리하고 새 제품의 촉각 피드백 목록을 별도 결정한다. sound 미사용 원칙까지 자동 폐기했다는 뜻은 아니다.
- **되돌릴 조건:** `DEC-024`의 각 신호 → Memory 범위 재검토 → 새 Memory 결정 확정. `DEC-001`의 각 신호 → 계정 대안 재검토 → 새 인증 결정 확정. 두 결정의 신호는 누적 AND가 아니며, 어느 신호도 옛 세 순간을 자동 부활시키지 않는다.

### ADR-0031 — Offline sync/conflict visuals

- **무효:** pending writes, 원격-로컬 conflict, 재연결 `Synced.`, 다른 기기 갱신이라는 원격 sync 전제.
- **코드·문서:** 실재 `src/state/useNetworkToasts.ts`, `src/components/ui/NetworkIndicator.tsx`, `DESIGN.md §21`; ADR target `src/components/ui/Toast.tsx`는 부재, 실재 대응은 `src/components/system/ToastHost.tsx`.
- **신 방향:** **확정 적용:** `save_pending`·`sync_conflict`, `E2`~`E6` 삭제. **미확정 격리:** `save_failed`·`E8`. 일반 offline indicator의 필요성은 별도다.
- **되돌릴 조건:** `DEC-026` 필드 10 ① `DEC-001` 또는 `DEC-022`가 되돌려져 서버가 사용자 값을 갖게 됨 → 동기화 상태 재도출 → 새 ID는 `E9`부터. 필드 10 ②·③은 각각 낙관적 UI·계측 신뢰도의 별도 재검토 분기다.

### ADR-0032 — Settings architecture

- **무효:** 단일 5-section Settings의 Firestore mirror, signed-in Account, sign-out/delete/export 구조.
- **코드·문서:** 실재 `app/settings/index.tsx`, `app/(tabs)/more.tsx`, `docs/SETTINGS.md`; ADR target `src/state/useSettings.ts`는 부재, 실재 세부 상태는 `src/state/useNotificationSettings.ts`.
- **신 방향:** 확정 IA의 `SET-01`~`SET-05`와 로컬 프로필·알림·초기화·텍스트 export에 맞춰 다시 설계한다.
- **되돌릴 조건:** `DEC-001`의 각 신호 → 계정 대안 재검토 → 새 인증/보존 결정 확정 → Account 영역 새 설계.

### ADR-0033 — Account deletion/export

- **무효:** 30일 soft delete, reaper, recovery email, email ZIP export와 뒤의 client-side Auth hard-delete 경로.
- **코드·문서:** 실재 legacy `src/lib/accountDeletion.ts`, `firestore.rules`, `docs/SETTINGS.md`; ADR target `app/settings/account.tsx`, `useDeletionStatus`, Cloud Functions는 부재.
- **신 방향:** 계정 삭제가 아니라 로컬 전체 삭제와 사용자가 관리하는 텍스트 export만 둔다.
- **되돌릴 조건:** `DEC-001`의 각 신호 → 계정형 백업 재검토 → 새 법적 보존·삭제·export 결정 확정.

### ADR-0034 — Photo upload pipeline

- **무효:** UID Firebase Storage 업로드와 문화 미션 사진을 Gallery·Byeongpung에 연결하는 파이프라인.
- **코드·문서:** **ADR target(부재):** `src/lib/photoUpload.ts`, `src/components/photo/PhotoCaptureButton.tsx`, `PhotoUploadProgress.tsx`, `storage.rules`. **실재 인접:** `src/lib/share.ts`는 병풍 이미지를 OS share sheet로 내보내며 사진 업로드 코드가 아니다. 실재 문서 `DESIGN.md §20`, `docs/ANALYTICS_SCHEMA.md`.
- **신 방향:** 사용자 사진 업로드와 `MEM-01`·`MEM-03` 연결을 격리한다. 로컬 OS share는 사진 업로드 제거와 별개로 다룬다.
- **되돌릴 조건:** `DEC-024`의 각 신호 → Memory 범위 재검토 → 새 요구 확정. UID 서버 업로드에 직접 연결되는 것은 `DEC-022` 필드 10 ③(`DEC-001` 되돌림)뿐이다. 그 신호 → `DEC-001`/`022` 재검토 → 사진 서버 저장을 허용하는 새 결정 확정. `DEC-022`의 푸시·감사·역할·OTA 신호를 사진 업로드의 누적 조건으로 쓰지 않는다.

## §4 확정 / 미확정 의존 분리

| `DEC`/부분 | 걸린 ADR | 상태 | 이번 구현 경계 |
|---|---|---|---|
| `DEC-001` 로그인 없음·로컬 원본 | `0002·0003·0006·0013·0014·0021·0023·0031·0032·0033·0034` | 확정 | 적용한다. |
| `DEC-022` 서버 3+1 역할 | `0003·0004·0005·0015·0021·0022·0024·0029·0031·0034` | 확정 | 적용한다. |
| `DEC-024` `SUP-01`·`MEM-01`~`03` `Won't` | `0007·0008·0009·0010·0011·0015·0027·0029·0030·0034` | 확정 | 화면/ID는 보존하고 이번 구현 근거만 격리한다. |
| `DEC-026` **삭제분** — `save_pending`·`sync_conflict`, `E2`~`E6` | `0012·0028·0031` | **확정(유지)** | 삭제를 적용한다. 과잉 격리하지 않는다. |
| `DEC-026` **신설분** — `save_failed`·`E8` | `0012·0028·0031` 인접 | **미확정** | 구현 기준에서 격리한다. 삭제분까지 유보하지 않는다. |
| `DEC-027` 분석 이벤트 해상도 규칙 3조 | `0004·0005`의 payload/cohort | **미확정** | PostHog/Firebase sink 선택과 `DEC-022`의 익명 이벤트 방향은 적용 가능. 조건 축 원값·버킷·셀 하한 payload는 격리한다. |
| `DEC-025` 학기 코호트 | 직접 걸린 ADR 없음 | **미확정** | 이 표의 ADR 판정을 바꾸지 않는다. 지표 구현에서는 `DEC-027` 종속과 함께 격리한다. |

핵심은 `DEC-026`을 통째로 미확정 취급하지 않는 것이다. 삭제분은 등급 A·기각 불가 지적을 구조적으로 충족한 확정(유지)이며, 신설분만 별도 세션 확정 전까지 멈춘다.

## §5 저장소 `CLAUDE.md` 개정 제안

파일은 수정하지 않는다. 아래는 §1·§2의 최종 채택 판정에서 직접 나오는 줄 단위 제안이다.

| 현재 줄 | 제안 |
|---|---|
| 4 | `It encodes the currently applicable constraints. For the redesign, current DEC + current requirements/policy override a conflicting legacy ADR.`로 교체. |
| 5–7 뒤 | 현재 정본으로 `27-k-journey-requirements-spec-2026-07-25.md`, `28-k-journey-service-policy-2026-07-25.md`, `31-k-journey-decision-log-2026-07-25.md`를 추가. |
| 15 | 구 PRD의 Haptics·Offline·Photo·Memory 설명은 legacy reference이며 `DEC-001·022·024·026`과 충돌하는 부분을 구현 근거로 쓰지 않는다고 표시. |
| 20 | `35 ADR index`를 `35 legacy ADRs; current DEC가 충돌하면 DEC를 따른다`로 교체. |
| 30 | `docs/SETTINGS.md`를 ADR-0032 legacy spec으로 표시하고 현재 계정/저장 동작은 `DEC-001·022`와 `SET-01`~`SET-05` IA를 따르게 한다. |
| 46 Stack | Firebase 항목에서 Auth·사용자 Firestore 원본을 제거하고, 콘텐츠 정의 배포·익명 이벤트·전원 공통 알림·운영 감사 로그만 허용한다고 명시. |
| 78–80 MUST 10 | 행동 기반·비마케팅 알림 원칙은 유지하되 panel unlock은 `MEM-01·02 Won't`로 빼고, 개인 기한=기기 로컬 / 전원 공통=서버 경계를 명시. |
| 81–93 MUST 11·14 | 8-panel·`claimPanelUnlock` 규칙을 `DEC-024`의 `MEM-01·02 Won't` legacy contract로 표시. 화면 ID·ADR은 삭제하지 않는다. |
| 94–98 MUST 15 | `appliesTo`·`missionsForHousing`을 현 행정 규칙으로 오인하지 않도록 `MEM-01` legacy contract로 표시. 4종 주거 × 명의 규칙으로 기계 교체하라는 문장은 넣지 않는다. |
| 99–102 MUST 16 | `aggregateCompletions`를 panel/byeongpung/gallery의 현재 구현 근거에서 제외하고 `MEM-01`~`03` legacy contract로 표시. |
| 103–108 MUST 17 | `showOperationError` 단일 진입점은 유지하되 원격 sync 오류를 제거하고 `DEC-026` 삭제분 적용/신설분 격리 경계를 명시. |
| 112–117 MUST 19 | KST helper는 유지하되 사용자 Firestore `serverTimestamp()` 원격 truth 문장을 로컬 원본 설계와 분리. |
| 147–155 NEVER 12–13 | Apple/Google sign-in을 legacy path로 표시하고 `DEC-001`에 따라 현재 제품 경로에서는 활성화하지 않는다. RN Firebase SDK 자체는 유지 가능하되 역할을 `DEC-022`로 제한. |
| 175–181 NEVER 22–23 | `showOperationError`·`claimPanelUnlock`을 분리해, 전자는 보강 유지하고 후자는 `DEC-024` 범위에서 구현하지 않는다고 표시. |
| 185–197 | mission completion choreography와 관련 haptic/panel 문구를 `MEM-01·02 Won't` legacy contract로 표시. 새 태스크 완료 피드백은 별도 결정 전 고정하지 않는다. |
| 225–229 | PNG 24장·gallery renderer rewrite를 현 작업 지시에서 내리고 `MEM-02 Won't` 보류로 표시. |
| 232–242 | production Firebase setup에서 Apple/Google Auth 활성화 지시를 제거하고 `DEC-022`의 허용 서버 역할만 환경별로 분리. |

## §6 내가 이전에 틀렸던 것

**1건.** 검수 1차 지적 #4에서 ADR-0010의 2값 문화 미션 필터를 `DEC-003`·`DEC-018`의 4종 주거 × `contractHolder` 행정 서류 규칙이 교체한다고 연결한 것은 틀렸다. 검수 2차에서 이미 철회했으며, 이번 독립 재도출 §1에서 같은 오류를 다시 범했다.

- ADR-0010 원문은 “Some Have-To missions”와 “X of 50 done”을 다루는 **구 문화 미션 카탈로그**다.
- `DEC-003` 원문은 “**서류 목록 + 항목별 `요청 대상자`**”를 반환하는 **행정 서류 규칙**이다.
- 올바른 `뒤집힘` 근거는 `DEC-024`가 `MEM-01 Cultural missions`을 “**「이번 범위 밖 — 구현하지 않는다」**”로 둔 것이다.

이전 지적 18건 중 그 밖에 틀렸다고 새로 확인된 것은 없다.

## §7 내가 막힌 곳

1. **ADR-0007:** `AuthGate`·Byeongpung 목적이 사라진 뒤에도 독립 cold-start splash가 필요한지 근거가 없다. 새 root boot/navigation, splash의 현재 책임, 독립 요구사항을 봐야 한다. 그래서 최종 판정은 `불명`이다.
2. **`DEC-027`:** 규칙 3조는 `44`에서 확정되지 않았다. `POL-012` 고지 대조표 누락, 판정되지 않은 축 7종, 전송/집계 층위 혼합이 남아 조건 축 payload를 구현에 고정할 수 없다.
3. **`DEC-026` 신설분:** 삭제는 확정이지만 `save_failed`·`E8`은 원인별 복구와 측정 수단이 미해소다. 새 문구·상태·전이는 별도 세션 확정이 필요하다.
4. **ADR-0030 후속 정책:** 구 정확히 세 순간은 뒤집혔지만 새 태스크 완료·로컬 데이터 초기화에 햅틱을 쓸지, 무음 정책을 유지할지는 결정이 없다. 뒤집힘 판정과 다음 정책 공백을 섞지 않는다.
5. **ADR-0033 권위 드리프트:** 본문은 launch에서 client-side immediate deletion으로 superseded라고 적고 index는 `proposed`로 남아 있다. DEC-001이 이번 구현 방향은 정하지만 ADR 내부 상태 불일치는 별도 정리가 필요하다.
6. **경로 드리프트:** ADR-0023 target `src/lib/storage/migrations.ts`는 부재하고 실제는 `src/lib/storageMigrations.ts`; ADR-0034 upload target 4개는 부재다. 문서 target과 실재 경로를 같은 것으로 보고 구현하면 안 된다.
7. **기존 `sync` 문구 잔존:** 상태·전이 삭제가 확정되어도 F04·DESIGN·ERROR_MESSAGES 등의 “연결되면 반영”, `Synced.`, 다른 기기 conflict 문장이 자동으로 사라지지 않는다. 구현 전 전수 문자열 검사가 필요하다.

## 마지막 — `v4`를 그대로 구현 근거로 써도 되는가?

**가능.**

내 독립 1차 판정과 `v4`는 **29/35건 일치**했고, 불일치 6건은 원문 재대조 결과 모두 `v4`가 맞았다. `v4` 내부의 확정/미확정 경계 — 특히 `DEC-026` **삭제분 적용·신설분 격리**, `DEC-027` payload 격리 — 까지를 함께 구현 근거로 사용해야 한다. 이는 `v4`를 고쳐야 한다는 조건이 아니라 `v4`가 이미 명시한 실행 경계다.
