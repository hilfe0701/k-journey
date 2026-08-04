# ADR × DEC 전수 대조 원자료 — v2

조사 대상은 `docs/adr/`의 번호가 붙은 ADR과
`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`에 나타난 `DEC`다.
판정은 DEC가 ADR의 결정 축을 바꾸는지로 했다. `뒤집힘`은 ADR 파일이나 화면 ID를
삭제한다는 뜻이 아니라, 이번 구현의 근거로 사용하지 않는다는 뜻이다. 아래 인용부호
안의 문장은 원문을 그대로 옮겼다.

## §0 집계 — 명령과 결과

```text
$ find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -print | sort | wc -l
35

$ (rg -o '^### `DEC-[0-9]{3}`' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md;
   rg -o '^\| 1 \| `DEC-ID` \| `DEC-[0-9]{3}`' .work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md) |
  rg -o 'DEC-[0-9]{3}' | sort -u | wc -l
27

$ rg '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw-v2.md |
  awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $4); c[$4]++}
    END {printf "%s %d\n", "뒤집힘", c["뒤집힘"]+0;
         printf "%s %d\n", "유효", c["유효"]+0;
         printf "%s %d\n", "보강", c["보강"]+0;
         printf "%s %d\n", "불명", c["불명"]+0}'
뒤집힘 13
유효 10
보강 12
불명 0

분포 합계: awk 결과의 13 + 12 + 0 + 10 = 35
```

분포는 한글 값을 `sort | uniq -c`로 세지 않고 `awk` 연관배열로 세었다. 따라서 로케일에
따른 한글 병합을 피했고, 합계 35는 ADR 개수 35 및 §1 표 행 수 35와 같다.
DEC heading만 세는 보조 확인은 26건이다. `DEC-001`은 이 파일의 heading이 아니라
`28-k-journey-service-policy-2026-07-25.md` §1에서 재사용되므로, 고유 DEC ID 집계는
heading 26건과 외부 정의 1건을 합친 위 명령을 사용했다.

## §1 대조표 — ADR 전건

| ADR ID | ADR 제목 | 판정 | 충돌/관련 DEC | ADR 원문 | DEC 원문 | 코드 영향 |
|---|---|---|---|---|---|---|
| ADR-0001 | React Native + Expo over Flutter | 유효 | 직접 충돌 없음 | “**Chosen:** React Native + Expo (managed) + TypeScript strict mode, because it gave the team the *fastest path from PRD to first sim build* while preserving the cross-platform single-codebase goal that justified the original Flutter pick.” (`docs/adr/0001-react-native-expo-over-flutter.md:33`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 플랫폼 선택을 바꾸지 않아 재설계와 무관하므로 유효하다. | `app/_layout.tsx`, `app.config.ts`, `package.json` |
| ADR-0002 | MMKV over Hive for local cache | 보강 | DEC-001 | “**Chosen:** MMKV (`react-native-mmkv`), because it is the only sync-read, JSI-backed option, and K-Journey's persistence shape is key-value with small JSON blobs — exactly MMKV's sweet spot.” (`docs/adr/0002-mmkv-over-hive-for-cache.md:33`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/lib/storage.ts`, `src/lib/storageMigrations.ts`, `app/_layout.tsx` |
| ADR-0003 | Firebase RN Modular SDK over Web SDK | 보강 | DEC-001, DEC-022 | “**Chosen:** `@react-native-firebase/*` modular API. It is the only option that delivers every PRD-required Firebase service without missing-service workarounds.” (`docs/adr/0003-firebase-rn-modular-sdk.md:32`) | “**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드” (`DEC-022`, 31:431) | `src/lib/firebase.ts`, `src/hooks/useAuth.ts`, `package.json` — Auth 경로는 재검토 대상 |
| ADR-0004 | PostHog as primary product analytics | 보강 | DEC-022, DEC-027* | “**Chosen:** PostHog Cloud (US region). Firebase Analytics stays as secondary (ADR-0005) for App Store optimisation funnels and as a fallback if PostHog is offline.” (`docs/adr/0004-posthog-primary-analytics.md:36`) | “**규칙 1 (금지 — 값 자체)**: **취약 상황을 드러내는 축의 값은 어떤 해상도로도 보내지 않는다.**” (`DEC-027`, 31:595) | `src/lib/posthog.ts`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0005 | Firebase Analytics as secondary | 보강 | DEC-022, DEC-027* | “**Chosen:** Keep Firebase Analytics as secondary, fire essential events to both sinks.” (`docs/adr/0005-firebase-analytics-secondary.md:29`) | “**규칙 2 (허용 — 버킷)**: **그 밖의 조건 축은 원값이 아니라 버킷으로만** 보낸다.” (`DEC-027`, 31:595) | `src/lib/posthog.ts`, `package.json`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0006 | Dev-mock bypass pattern (`isDevMock`) | 뒤집힘 | DEC-001 | “**Chosen:** `isDevMock()` branch inside `src/lib/firebase.ts` plus reactive `useMMKVBoolean(KEYS.devMockAuth)` in `useAuth`. Each mutator (sign-in, profile update, mission complete, bucket CRUD) checks `isDevMock()` and writes to MMKV instead of Firestore.” (`docs/adr/0006-dev-mock-bypass-pattern.md:31`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `app/(onboarding)/sign-in.tsx`, `docs/PLAY_DATA_SAFETY.md` |
| ADR-0007 | Cold-start splash handler ref | 유효 | 직접 충돌 없음 | “**Chosen:** A React ref (`coldStartHandledRef`) in `AuthGate` (or root `_layout`). On first mount it sets itself true and forces a one-time redirect through `/splash`, after which the restored route resumes.” (`docs/adr/0007-cold-start-splash-handler-ref.md:28`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 cold-start redirect를 바꾸지 않아 그대로 성립하므로 유효하다. | `app/_layout.tsx`, `app/(onboarding)/splash.tsx` |
| ADR-0008 | Byeongpung PNG full-paintings (not SVG) | 뒤집힘 | DEC-024 | “**Chosen:** 24 PNGs, one per (era, panel) pair, each baked with its era's colour and motif. The code's responsibility is *selection*, not styling.” (`docs/adr/0008-byeongpung-png-not-svg.md:30`) | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31-k-journey-decision-log-2026-07-25.md:468`) / “MoSCoW **`Won't`**로 명시하고 `19` §2.0·§3.1과 `30` §3.1에 **「이번 범위 밖 — 구현하지 않는다」**로 적는다. **화면 ID는 남긴다**” (`31-k-journey-decision-log-2026-07-25.md:477) / `MEM-02` Byeongpung (`19-k-journey-f03-ia-screen-inventory-2026-07-25.md:193) | `src/components/byeongpung/PanelImage.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx`, `src/theme/eras.ts`, `DESIGN.md §7`, `docs/EMPTY_STATES.md §7` — 이번 구현에서는 사용하지 않음 |
| ADR-0009 | Single-fire panel unlock gate (`claimPanelUnlock`) | 뒤집힘 | DEC-024 | “**Chosen:** `claimPanelUnlock(panelNumber: number): boolean` in `src/lib/notifications.ts`.” (`docs/adr/0009-single-fire-panel-unlock.md:33`) | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31-k-journey-decision-log-2026-07-25.md:468`) / “**이번 범위 밖 — 구현하지 않는다**” (`31-k-journey-decision-log-2026-07-25.md:477) / `MEM-01` Cultural missions · `MEM-02` Byeongpung (`19-k-journey-f03-ia-screen-inventory-2026-07-25.md:192-193) | `src/lib/notifications.ts`, `src/components/mission/MissionCompleteOverlay.tsx`, `docs/PUSH_COPY.md §C`, `docs/ANALYTICS_SCHEMA.md §2` — 발동원과 결과 화면이 모두 이번 범위 밖 |
| ADR-0010 | Housing-specific mission tagging (`appliesTo`) | 뒤집힘 | DEC-003, DEC-018 | “**Chosen:** `appliesTo?: 'dormitory' \| 'off-campus'` field. Missions without the field are universal (applies to both).” (`docs/adr/0010-housing-applies-to-tagging.md:28`) | “규칙 계층이 조합을 판정해 **서류 목록 + 항목별 `요청 대상자`**를 반환한다.” (`DEC-003`, 31:142) / “**원문의 4종 분류를 그대로 따른다** — 내가 재분류하지 않는다” (`DEC-018`, 31:356) | `src/data/missions.ts`, `app/(tabs)/index.tsx`, `src/lib/firebase.ts`, `CLAUDE.md:94-98` — 2값 union을 4종 주거 × 계약 명의 조합 규칙으로 교체 |
| ADR-0011 | Single-source completion aggregation (`aggregateCompletions`) | 뒤집힘 | DEC-024 | “**Chosen:** `aggregateCompletions` pure function in `src/lib/completions.ts`. Returns `{ missionCount, bucketItemCount, total }`.” (`docs/adr/0011-single-source-completion-aggregation.md:31`) | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31-k-journey-decision-log-2026-07-25.md:468`) / “**이번 범위 밖 — 구현하지 않는다**” (`31-k-journey-decision-log-2026-07-25.md:477) / `MEM-01` Cultural missions · `MEM-02` Byeongpung · `MEM-03` Gallery는 모두 `Won't` (`19-k-journey-f03-ia-screen-inventory-2026-07-25.md:192-194) | `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, `app/gallery.tsx`, `app/(tabs)/byeongpung.tsx`, `CLAUDE.md:99-102` — 세 소비자 모두 이번 구현 근거에서 제외 |
| ADR-0012 | Async mutator error contract (`showOperationError`) | 보강 | DEC-020 | “**Chosen:** A single helper `showOperationError(action, error)` in `src/lib/errorAlert.ts`” (`docs/adr/0012-async-mutator-error-contract.md:32`) | “**오류 5종을 축 2로 두고 태스크 카드에 배지로 겹친다.**” (`DEC-020`, 31:384) | `src/lib/errorAlert.ts`, `src/lib/errors/catalog.ts`, `docs/ERROR_MESSAGES.md` |
| ADR-0013 | Apple Sign-In primary, Google deferred | 뒤집힘 | DEC-001 | “**Chosen:** Apple Sign-In wired + tested. Google Sign-In stubbed with a placeholder Alert until OAuth client config is obtained.” (`docs/adr/0013-apple-primary-google-deferred.md:32`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `docs/SECURITY.md` |
| ADR-0014 | Anonymous auth removed | 뒤집힘 | DEC-001 | “**Chosen:** Apple/Google only. Firestore Rules will explicitly reject anonymous tokens (ADR-0021).” (`docs/adr/0014-anonymous-auth-removed.md:31`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/hooks/useAuth.ts`, `firestore.rules`, `docs/SECURITY.md`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0015 | Behavior-triggered push only | 보강 | DEC-009, DEC-010, DEC-022 | “**Chosen:** Behavior-triggered notifications only. Scheduled through `src/lib/notifications.ts`.” (`docs/adr/0015-behavior-triggered-push-only.md:32`) | “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**이고, 조건 축·태스크 상태의 **원본은 올라가지 않는다**” (`DEC-022`, 31:431) | `src/lib/notifications.ts`, `src/lib/notifications/copy.ts`, `docs/PUSH_COPY.md` |
| ADR-0016 | No CSS framework — inline RN styles + tokens | 유효 | 직접 충돌 없음 | “**Chosen:** Plain RN styles + token imports. CLAUDE.md NEVER #17 forbids CSS frameworks.” (`docs/adr/0016-no-css-framework-inline-styles.md:31`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 스타일 구현 규칙을 바꾸지 않아 그대로 성립하므로 유효하다. | `app/**/*.tsx`, `src/**/*.tsx`, `design-tokens.ts` |
| ADR-0017 | Design-token only color policy | 유효 | 직접 충돌 없음 | “**Chosen:** Tokens only. CLAUDE.md MUST #1 + NEVER #1 + NEVER #20 enforce this.” (`docs/adr/0017-design-token-only-colors.md:35`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 색상 토큰 정책을 바꾸지 않아 그대로 성립하므로 유효하다. | `design-tokens.ts`, `src/**/*.tsx`, `DESIGN.md` |
| ADR-0018 | English first, Korean parenthetical for proper nouns | 보강 | DEC-015 | “**Chosen:** `English (한국어)` for proper nouns. Sentence-case English.” (`docs/adr/0018-english-first-korean-parenthetical.md:30`) | “라벨을 재작성하고 예시를 병기한다. **제한된 영어 사용자를 전제**로 관용구·축약어를 피한다” (`DEC-015`, 31:310) | `app/(onboarding)/*.tsx`, `docs/MICROCOPY.md`, `docs/I18N_TIMEZONE.md` |
| ADR-0019 | Reanimated worklet inline-only rule | 유효 | 직접 충돌 없음 | “**Chosen:** Hard rule. `useAnimatedStyle(() => ({ ... }))` only — never `useAnimatedStyle(makeStyle())`.” (`docs/adr/0019-reanimated-worklet-inline-rule.md:28`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 worklet 작성 규칙을 바꾸지 않아 그대로 성립하므로 유효하다. | `src/components/mission/MissionCompleteOverlay.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx` |
| ADR-0020 | Jest with React Native mocks | 유효 | 직접 충돌 없음 | “**Chosen:** Jest with a custom `jest.setup.js` mocking the native modules we use (Firebase, MMKV, Notifications, MediaLibrary, etc.).” (`docs/adr/0020-jest-with-rn-mocks.md:33`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 테스트 프레임워크 선택을 바꾸지 않아 그대로 성립하므로 유효하다. | `jest.setup.js`, `src/**/__tests__/*`, `package.json` |
| ADR-0021 | Firestore Rules ACL model | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** Owner-only writes everywhere on user data; signed-in read on catalogues; open read on `emergency`. Anonymous tokens are explicitly rejected.” (`docs/adr/0021-firestore-rules-acl-model.md:34`) | “**사용자 데이터에 접근 권한 없음. 서버에 없으므로 물리적으로 불가**” (`POL-001`, 28:78) 및 “**이 방향에 사용자 데이터는 없다.**” (`DEC-022`, 31:431) | `firestore.rules`, `src/lib/firebase.ts`, `docs/SECURITY.md`, `docs/architecture/ARCHITECTURE.md` |
| ADR-0022 | KST timezone as single source of truth | 보강 | DEC-004, DEC-009, DEC-014 | “**Chosen:** Add `src/lib/dates.ts` exporting:” (`docs/adr/0022-kst-timezone-single-source.md:35`) | “**절대 날짜 + 남은 일수를 함께** 표시한다. 처리 소요(6~7주)를 함께 노출해 역산 가능하게 한다” (`DEC-009`, 31:226) | `src/lib/dates.ts`, `src/lib/clockGuard.ts`, `src/hooks/usePhase.ts`, `src/components/home/DDayBanner.tsx` |
| ADR-0023 | MMKV key versioning & migration | 보강 | DEC-001 | “**Chosen:** Add `src/lib/storage/migrations.ts` with a typed `Migration[]` array, run via `runMigrations()` at app boot (before any hook reads MMKV).” (`docs/adr/0023-mmkv-key-versioning-migration.md:31`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/lib/storageMigrations.ts` (현재 경로), `src/lib/storage.ts`, `app/_layout.tsx` |
| ADR-0024 | Environment separation (dev / staging / prod) | 유효 | DEC-022 | “**Chosen:** Three environments with explicit separation. Replace `app.json` with `app.config.ts` that branches on `EAS_BUILD_PROFILE`.” (`docs/adr/0024-environment-separation-dev-staging-prod.md:33`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. DEC-022는 배포 경로의 인접 원칙일 뿐 이 환경 분리 선택을 교체하지 않는다. 신 설계에서도 세 환경 분리 원칙이 그대로 성립하므로 유효하다. | `app.config.ts`, `app.json`, `eas.json`, `firestore.rules`/Firebase 설정 |
| ADR-0025 | Accessibility WCAG 2.1 AA target | 보강 | DEC-007, DEC-008, DEC-010, DEC-019 | “**Chosen:** WCAG 2.1 **AA** as the public-facing commitment.” (`docs/adr/0025-accessibility-wcag-2-1-aa.md:32`) | “차단 태스크에 「무엇이 완료되면 풀리는지」를 **반드시 표시**한다” (`DEC-007`, 31:198) | `src/lib/a11y.ts`, `docs/ACCESSIBILITY.md`, `src/components/**/*.tsx` |
| ADR-0026 | EAS channel strategy & version policy | 유효 | DEC-022 | “**Chosen:** Semver for user-visible versions; EAS-managed auto-increment for `buildNumber` (iOS) and `versionCode` (Android); explicit channels per environment.” (`docs/adr/0026-eas-channel-strategy.md:29`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 버전·채널 운영 방식을 바꾸지 않아 그대로 성립하므로 유효하다. | `eas.json`, `app.config.ts`, `docs/RELEASE.md` |
| ADR-0027 | Empty state pattern | 유효 | DEC-008 | “**Chosen:** Every empty state in K-Journey is composed of exactly three slots, in this fixed order:” (`docs/adr/0027-empty-state-pattern.md:37`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. DEC-008은 not_applicable 사유 노출을 다루지만 세 슬롯 계약을 교체하지 않는다. 신 설계에서도 세 슬롯 계약이 그대로 성립하므로 유효하다. | `src/components/ui/EmptyState.tsx`, `docs/EMPTY_STATES.md` |
| ADR-0028 | Error recovery & retry strategy | 보강 | DEC-020 | “**Chosen:** A 4-tier decision tree that `showOperationError` (and a future companion `showOperationErrorWithRetry`) routes into based on error category.” (`docs/adr/0028-error-recovery-retry-strategy.md:37`) | “**오류 5종을 축 2로 두고 태스크 카드에 배지로 겹친다.**” (`DEC-020`, 31:384) | `src/lib/errorAlert.ts`, `src/lib/errors/catalog.ts`, `src/lib/errors/host.ts`, `docs/ERROR_MESSAGES.md` |
| ADR-0029 | Push copy library & permission priming | 보강 | DEC-009, DEC-015, DEC-022 | “**Chosen:** Both halves of the problem are fixed in one ADR because they share an owner file and review cadence.” (`docs/adr/0029-push-copy-library-and-priming.md:39`) | “**전원 공통 알림**” 및 “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**” (`DEC-022`, 31:431) | `src/lib/notifications/copy.ts`, `src/components/onboarding/NotificationPriming.tsx`, `docs/PUSH_COPY.md` |
| ADR-0030 | Haptics & sound feedback policy | 뒤집힘 | DEC-001, DEC-024 | “**Chosen:** Haptics fire at exactly **three moments**, using `expo-haptics`. Sound is **not** used at MVP.” (`docs/adr/0030-haptics-and-sound-feedback.md:36`) | “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31-k-journey-decision-log-2026-07-25.md:468`) / “**이번 범위 밖 — 구현하지 않는다**” (`31-k-journey-decision-log-2026-07-25.md:477) / “**로그인을 두지 않는다.**” (`28-k-journey-service-policy-2026-07-25.md:39) | `src/lib/haptics.ts`, `app/mission/[id].tsx`, `src/lib/notifications.ts`, `CLAUDE.md:15,185-197` — 세 순간 계약을 그대로 구현하지 않음 |
| ADR-0031 | Offline state visibility & sync conflict resolution | 뒤집힘 | DEC-022, DEC-026* | “When `NetInfo.isConnected` transitions from `false → true`:<br><br>* **Indicator dot disappears.**<br>* **No "you're back online" toast** by default — the user usually notices. Exception: if there were ≥ 1 pending writes that synced on reconnect, fire a single short toast: `Synced.` (4 s, dismissable, no CTA). This is the only "good news" toast in the app.” (`docs/adr/0031-offline-state-visibility.md:49-52`) | “**삭제** — 상태 **`save_pending`·`sync_conflict`**(오류 5종 → **4종**) · 전이 **`E2`·`E3`·`E4`·`E5`·`E6`**(7종 → **2종**)<br>**신설** — 상태 **`save_failed`**(**로컬** 저장 실패. `POL-001` 예외 처리가 이미 규정한 것에 이름을 준다. **낙관적 UI를 적용하지 않는다** — 값이 남지 않으므로 완료로 보이면 안 된다) · 전이 **`E8` `saved → save_failed`**<br>**삭제한 ID는 재사용하지 않는다**(`19-k-journey-f03-ia-screen-inventory-2026-07-25.md` §1.0 규칙 3). 새 전이가 `E2`가 아니라 **`E8`**인 이유다<br>**`REQ-TER-002` 전이 19종 → 15종** (축 1 `T1`~`T12` **12** + 축 2 `E1`·`E7`·`E8` **3**)” (`31-k-journey-decision-log-2026-07-25.md:550) | `src/state/useNetwork.ts`, `src/state/useNetworkToasts.ts`, `src/components/ui/NetworkIndicator.tsx`, `DESIGN.md §21`, `docs/ERROR_MESSAGES.md` |
| ADR-0032 | Settings screen architecture | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** A single Settings screen reachable from the More tab. The screen is composed of **5 categories**” (`docs/adr/0032-settings-screen-architecture.md:41`) | “**로그인을 두지 않는다**” (`28-k-journey-service-policy-2026-07-25.md:39`) 및 “**조건 축·태스크 상태의 원본은 올라가지 않는다**” (`DEC-022`, 31:431) | `app/settings/index.tsx`, `app/(tabs)/more.tsx`, `docs/SETTINGS.md`, `DESIGN.md §§17–18` — Account/Firestore rows는 그대로 둘 수 없음 |
| ADR-0033 | Account deletion & data export | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** A two-action policy — **Delete account** and **Export my data** — both reachable from Settings → Account (ADR-0032). Deletion is **soft** for 30 days with a reaper Cloud Function; export is **immediate** with email-delivered ZIP.” (`docs/adr/0033-account-deletion-and-export.md:50`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39) | `src/lib/accountDeletion.ts`, `src/lib/firebase.ts`, `docs/SETTINGS.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `DESIGN.md §18` |
| ADR-0034 | Photo upload pipeline | 뒤집힘 | DEC-001, DEC-022, DEC-024 | “**Chosen:** A four-part pipeline.” (`docs/adr/0034-photo-upload-pipeline.md:38`) / “Storage path: `users/{uid}/photos/{missionId}/{ulid}.jpg`” (`docs/adr/0034-photo-upload-pipeline.md:71`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기를 제공한다**” (`28-k-journey-service-policy-2026-07-25.md:39`) / “**이 방향에 사용자 데이터는 없다.**” (`DEC-022`, 31:431) / 대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`** (`31-k-journey-decision-log-2026-07-25.md:468`), “**이번 범위 밖 — 구현하지 않는다**” (`31-k-journey-decision-log-2026-07-25.md:477) | `DESIGN.md §20`, `docs/PLAY_DATA_SAFETY.md:36-40`, `docs/EMPTY_STATES.md §§5-7`, `src/lib/share.ts` — UID 기반 Firebase Storage 업로드·갤러리/병풍 전제를 이번 구현 근거에서 제외 |
| ADR-0035 | Dark mode explicit rejection | 유효 | 직접 충돌 없음 | “**Chosen:** K-Journey **explicitly rejects** dark mode for MVP. `userInterfaceStyle: 'light'` in `app.json` is the technical lock” (`docs/adr/0035-dark-mode-explicit-rejection.md:40`) | 해당 DEC 없음 — 이 ADR의 결정 축을 다루는 DEC이 로그에 없다. 신 설계가 테마 모드를 바꾸지 않아 그대로 성립하므로 유효하다. | `app.json`, `app.config.ts`, `DESIGN.md §15`, `src/theme/ThemeProvider.tsx` |

\* `DEC-026`·`DEC-027`은 현재 로그에 기록되어 있으나 `44-k-journey-role-review-unscored-dec-2026-07-27.md`에 의해 확정되지 않은 상태다. 위 표는 기록된 DEC가 요구하는 방향으로 대조했으며, 확정 여부와 구현 격리는 §7에 별도로 남겼다.

## §2 `뒤집힘` 상세

### ADR-0006 — Dev-mock auth/mutator 경로

- **무엇이 무효가 되는가:** `isDevMock()`이 가상의 인증 사용자와 Firestore 대체 경로를 제공한다는 전제다. 신 결정에서는 제품 로그인 자체가 없다. 따라서 `useAuth`의 `DEV_MOCK_USER`, sign-in 화면, sign-in analytics를 유지한 채 두면 신 설계의 로그인 부재를 위반한다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `app/(onboarding)/sign-in.tsx`, `docs/ANALYTICS_SCHEMA.md`의 `sign_in`, `docs/PLAY_DATA_SAFETY.md`의 계정·UID 수집 표.
- **신 DEC이 요구하는 방향:** DEC-001의 원문 그대로 **“로그인을 두지 않는다.”** 조건 축과 태스크 상태는 MMKV 등 기기 로컬에 두고, export는 텍스트로 제공한다. Firebase는 DEC-022가 정한 콘텐츠 배포·익명 이벤트·공통 알림 범위만 남는다.
- **되돌릴 조건:** DEC-001 §10의 조건, 즉 완료 이력 소실이 사용자 불만 상위 3위가 되거나, 체류 중 기기 교체가 흔하다는 근거가 나오거나, `MET-006` 내보내기 실행률이 낮아 완화책이 작동하지 않으면 계정 로그인 대안을 다시 연다.

### ADR-0013 — Apple/Google Sign-In

- **무엇이 무효가 되는가:** Apple Sign-In을 주 인증으로 연결하고 Google을 공급자 설정 대기 상태로 두는 결정이다. DEC-001은 공급자 선택이 아니라 인증 surface 자체를 없앤다.
- **그 ADR을 근거로 짜인 코드·문서:** `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `firestore.rules`, `docs/SECURITY.md`, `docs/ERROR_MESSAGES.md`의 `auth-*` 행, `docs/STORE_LISTING.md`의 sign-in required 안내.
- **신 DEC이 요구하는 방향:** 인증 화면·Firebase Auth provider gate·계정 UID 보관을 제품 경로에서 제거하고, 로컬 조건 축/태스크 상태와 텍스트 export로 바꾼다.
- **되돌릴 조건:** DEC-001 §10의 세 조건 중 하나가 관측되어 사용자 데이터의 기기 간 복구가 우선순위가 되면, 먼저 새 인증 DEC를 만들고 이 ADR을 supersede해야 한다. 기존 Apple/Google 경로를 그대로 재활성화하는 조건은 아니다.

### ADR-0014 — Anonymous auth removed

- **무엇이 무효가 되는가:** Apple/Google만 허용하고 anonymous token을 거부하는 인증 모델이다. 로그인하지 않는 제품에는 anonymous token을 허용/거부할 사용자 인증 경로 자체가 없다.
- **그 ADR을 근거로 짜인 코드·문서:** `firestore.rules:isSignedIn`, `docs/SECURITY.md`의 anonymous threat row, `docs/EDGE_CASES.md`의 anonymous emergency 문장, `src/hooks/useAuth.ts`.
- **신 DEC이 요구하는 방향:** 사용자 조건 값·태스크 상태는 서버에 저장하지 않는다. DEC-022의 서버 이벤트는 익명 분석 이벤트이고, 운영자 감사 로그에는 사용자 데이터가 없다. 이것은 anonymous auth를 되살리라는 뜻이 아니다.
- **되돌릴 조건:** DEC-001이 되돌려져 계정·서버 동기화를 채택할 때만 인증 모델을 다시 결정한다. 그때도 Apple/Google/anonymous 중 무엇을 허용할지는 별도 근거가 필요하다.

### ADR-0021 — Firestore owner ACL

- **무엇이 무효가 되는가:** 사용자 데이터가 `users/{uid}`에 있고 signed-in owner가 읽고 쓰며, catalogues도 signed-in user가 읽는다는 모델이다. POL-001은 사용자 데이터의 서버 전송·운영자 접근을 막는다.
- **그 ADR을 근거로 짜인 코드·문서:** `firestore.rules`, `src/lib/firebase.ts`의 profile/completedMissions/buckets write, `docs/SECURITY.md`, `docs/architecture/ARCHITECTURE.md`, `docs/TESTING.md` Rules matrix.
- **신 DEC이 요구하는 방향:** DEC-001은 조건 축·태스크 상태를 로컬에만 둔다. DEC-022는 Firebase의 역할을 콘텐츠 정의 배포, 익명 분석 이벤트 수집, 전원 공통 알림으로 한정하고, 운영자↔서버 감사 로그에는 사용자 데이터가 없어야 한다.
- **되돌릴 조건:** DEC-001 또는 DEC-022의 되돌릴 조건이 발동해 서버가 사용자 값을 갖게 되면, 그때 새 데이터 모델·ACL·인증을 함께 도출한다. 현재 Rules를 남겨 둔 채 신 설계에 쓰는 것은 안 된다.

### ADR-0031 — Offline sync/conflict visuals

- **무엇이 무효가 되는가:** `pending writes`, 원격 값과 로컬 값의 충돌, 재연결 후 `Synced.`, 다른 기기에서 갱신된 bucket count를 사용자에게 보여주는 부분이다. DEC-026은 그 원격 사용자 데이터 전제를 삭제한다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/state/useNetworkToasts.ts`, `src/components/ui/NetworkIndicator.tsx`, `DESIGN.md §21`, `docs/ERROR_MESSAGES.md`의 `network-offline-recovered`·`bucket-conflict`, `docs/EDGE_CASES.md`와 `docs/architecture/DATA_FLOW.md`의 sync sequence.
- **신 DEC이 요구하는 방향:** `save_pending`·`sync_conflict` 상태와 `E2`~`E6` 전이를 삭제하고, 로컬 쓰기 실패만 `save_failed`/`E8`로 남긴다. 실패 시 완료 표시가 남으면 안 되며 「저장하지 못했습니다. 입력한 내용이 유지되지 않습니다」를 보여준다.
- **되돌릴 조건:** DEC-001 또는 DEC-022가 되돌아가 서버가 사용자 값을 갖게 되면 동기화 상태·전이를 다시 도출한다. DEC-026은 삭제한 ID를 `E9`부터 다시 붙이라고 했다. 익명 이벤트 큐 유실을 측정할 수 있고 유실률이 5%를 넘는 경우도 재검토 조건이다.

### ADR-0032 — Settings architecture

- **무엇이 무효가 되는가:** 5-category Settings 전체가 아니라, Account category의 signed-in email/Sign out/Firestore preference writes/계정 export·delete를 현재 ADR 그대로 유지하는 것이 무효다. 신 설계에는 로그인·계정 서버가 없다.
- **그 ADR을 근거로 짜인 코드·문서:** `app/settings/index.tsx`, `docs/SETTINGS.md` §1·§3·§4, `DESIGN.md §§17–18`, `docs/ANALYTICS_SCHEMA.md` `settings_open`, root `CLAUDE.md` source-of-truth table.
- **신 DEC이 요구하는 방향:** Settings가 필요하다는 별도 DEC가 없는 상태에서, 남길 수 있는 것은 로컬 알림·로컬 프로필·로컬 데이터 삭제/텍스트 export 등이다. Firestore `users/{uid}/settings`와 signed-in email 행은 제거하거나 범위를 다시 정해야 한다.
- **되돌릴 조건:** DEC-001이 계정 로그인을 되돌리는 세 조건 중 하나를 충족하고 새 인증/보존 결정이 확정되면 Account category를 다시 설계한다. 그 전에는 Settings 전체를 유지한다는 이유로 계정 기능을 살려 두면 안 된다.

### ADR-0033 — Account deletion/export

- **무엇이 무효가 되는가:** 30일 soft delete, reaper Cloud Function, recovery email, email-delivered ZIP export다. `DEC-001`은 계정이 없고, `POL-002`는 로컬 데이터 전체 삭제와 텍스트 export를 말한다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/lib/accountDeletion.ts`의 현재 hard-delete 경로, `docs/SETTINGS.md` Account rows, `DESIGN.md §18`, `docs/ERROR_MESSAGES.md`의 account/export rows, `docs/PLAY_DATA_SAFETY.md` 삭제 답변, `docs/STORE_LISTING.md` account access 안내.
- **신 DEC이 요구하는 방향:** 계정·서버 데이터가 없다는 전제에서 앱 내 로컬 전체 삭제와 사용자가 관리하는 텍스트 export만 남긴다. 서버 reaper·recovery·email export는 구현 대상으로 두지 않는다.
- **되돌릴 조건:** DEC-001의 기기 교체/완료 이력 손실/export 완화 실패 조건이 관측되어 계정형 백업을 다시 채택할 때, 법적 보존·삭제·export 요구를 새 DEC로 먼저 확정한다.

### ADR-0008 — Byeongpung PNG full-paintings

- **무엇이 무효가 되는가:** 3개 era × 8 panel의 24개 PNG를 이번 구현에서 번들하고, `PanelImage`·`ByeongpungStrip`으로 병풍을 구현한다는 실행 전제다. `DEC-024`는 `MEM-02`를 삭제하지 않고 `Won't`로 남겼으므로, ADR 문서 자체가 무효화되거나 화면 ID가 삭제되는 것은 아니다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/components/byeongpung/PanelImage.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx`, `src/theme/eras.ts`, `DESIGN.md §7`, `docs/EMPTY_STATES.md §7`, `CLAUDE.md:81-82,225-229`.
- **신 DEC이 요구하는 방향:** `DEC-024` 필드 7의 **`Won't` — 이번 범위 밖 — 구현하지 않는다**를 적용한다. 화면 ID와 ADR 파일은 남기되, PNG 자산·병풍 reveal·관련 구현을 이번 구현의 근거로 사용하지 않는다.
- **되돌릴 조건:** `DEC-024` 필드 10의 세 조건, 즉 **진입 비율이 10%를 넘으면** `Won't`를 되돌리고 `REQ`를 정식 도출한다; 카드 소팅 **`I6`**에서 사용자가 `Memory`를 실용 흐름과 묶으면 분리 판단부터 다시 본다; **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오면 재검토한다.

### ADR-0009 — Single-fire panel unlock gate

- **무엇이 무효가 되는가:** `claimPanelUnlock`을 패널 unlock overlay·telemetry·notification의 발동원으로 이번 구현에 두는 계약이다. `MEM-01` 문화 미션과 `MEM-02` 병풍이 모두 `Won't`이므로 발동원과 결과 화면이 함께 없다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/lib/notifications.ts`, `src/components/mission/MissionCompleteOverlay.tsx`, `docs/PUSH_COPY.md §C`, `docs/ANALYTICS_SCHEMA.md`의 `panel_unlock`, `DESIGN.md §7.1`, `CLAUDE.md:88-93,179-181`.
- **신 DEC이 요구하는 방향:** `DEC-024`의 `MEM-01`·`MEM-02` 범위 밖 결정을 적용해 gate·overlay·panel notification을 이번 구현의 근거에서 격리한다. ADR 파일은 남기고, 삭제·재활성화 판단은 하지 않는다.
- **되돌릴 조건:** `DEC-024` 필드 10의 **진입 비율 10% 초과**, 카드 소팅 **`I6`**에서 `Memory`를 실용 흐름과 묶는 결과, **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오는 경우 재검토한다.

### ADR-0010 — Housing-specific mission tagging

- **무엇이 무효가 되는가:** `appliesTo?: 'dormitory' | 'off-campus'` 두 값 union과 누락 시 양쪽에 적용하는 규칙을 신 주거 판정의 표현으로 쓰는 전제다. 4종 주거 × 계약 명의 조합을 이 두 값으로 표현할 수 없다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/data/missions.ts`, `app/(tabs)/index.tsx`, `src/lib/firebase.ts`, `CLAUDE.md:94-98`, ADR의 `missionsForHousing` 전제.
- **신 DEC이 요구하는 방향:** DEC-003의 조합 판정과 DEC-018의 원문 4종 분류를 기준으로 새 입력·출력 모델을 도출한다. 기존 2값 union을 보강해 매핑하는 방식이 아니라 교체 대상으로 격리한다.
- **되돌릴 조건:** `DEC-024` 필드 10의 **진입 비율 10% 초과**, 카드 소팅 **`I6`**에서 `Memory`를 실용 흐름과 묶는 결과, **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오는 경우 이 범위 판단을 재검토한다.

### ADR-0011 — Single-source completion aggregation

- **무엇이 무효가 되는가:** `{ missionCount, bucketItemCount, total }` 집계 하나를 panel-unlock threshold·병풍 reveal·gallery summary 세 소비자의 단일 원천으로 구현하는 전제다. 세 소비자가 모두 `MEM-01`~`MEM-03`의 `Won't` 화면 구조에 묶여 있다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, `app/gallery.tsx`, `app/(tabs)/byeongpung.tsx`, `DESIGN.md §7`, `docs/EMPTY_STATES.md §§5-7`, `CLAUDE.md:99-102`.
- **신 DEC이 요구하는 방향:** `DEC-024`의 범위 밖 결정을 적용해 기존 집계 함수와 세 소비자를 이번 구현의 근거에서 격리한다. ADR 파일과 화면 ID는 보존하며, 다른 집계 설계를 지금 확정하지 않는다.
- **되돌릴 조건:** `DEC-024` 필드 10의 **진입 비율 10% 초과**, 카드 소팅 **`I6`**에서 `Memory`를 실용 흐름과 묶는 결과, **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오는 경우 재검토한다.

### ADR-0030 — Haptics & sound feedback policy

- **무엇이 무효가 되는가:** haptics를 정확히 세 순간, 즉 panel unlock·mission complete·bucket delete/sign out/remove photo에 고정하는 계약이다. 앞의 두 순간은 `Won't` 화면 전제에 걸리고 sign out은 로그인 없음과 충돌하므로 세 순간 계약을 그대로 구현할 수 없다.
- **그 ADR을 근거로 짜인 코드·문서:** `src/lib/haptics.ts`, `app/mission/[id].tsx`, `src/lib/notifications.ts`, `DESIGN.md §7.1`, `CLAUDE.md:15,185-197`.
- **신 DEC이 요구하는 방향:** `DEC-001`·`DEC-024`에 맞춰 기존 세 순간 목록을 이번 구현의 근거에서 격리하고, 새 제품에 남는 촉각 피드백만 별도 범위에서 다시 정한다. ADR 파일을 삭제하지 않는다.
- **되돌릴 조건:** `DEC-024` 필드 10의 **진입 비율 10% 초과**, 카드 소팅 **`I6`**에서 `Memory`를 실용 흐름과 묶는 결과, **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오는 경우 재검토한다.

### ADR-0034 — Photo upload pipeline

- **무엇이 무효가 되는가:** `users/{uid}/photos/{missionId}/{ulid}.jpg` Firebase Storage 업로드와 문화 미션 사진을 갤러리·병풍에 연결하는 네 부분 파이프라인을 이번 구현 전제로 두는 것이다. DEC-001·DEC-022의 로컬 데이터 원칙과 `MEM-01`~`MEM-03`의 `Won't`가 동시에 충돌한다.
- **그 ADR을 근거로 짜인 코드·문서:** `DESIGN.md §20`, `docs/ANALYTICS_SCHEMA.md`의 `photo_upload_outcome`, `docs/EMPTY_STATES.md` §§5-7, `docs/PLAY_DATA_SAFETY.md`의 사진 수집 표, `src/lib/share.ts`.
- **신 DEC이 요구하는 방향:** 사용자 조건·태스크 상태는 로컬에만 두고, UID 기반 Storage 업로드와 갤러리·병풍 연결은 이번 구현의 근거에서 제외한다. `docs/PLAY_DATA_SAFETY.md`의 “Photos / files: Not collected”와도 맞춰, ADR 파일은 남기되 구현은 격리한다.
- **되돌릴 조건:** `DEC-024` 필드 10의 **진입 비율 10% 초과**, 카드 소팅 **`I6`**에서 `Memory`를 실용 흐름과 묶는 결과, **8월 말 코호트 인터뷰**에서 문화 콘텐츠 요구가 나오는 경우 재검토한다.

## §3 `docs/` 파급

### 지정된 충돌 후보 확인

| 후보 | 확인 결과 | 원문 근거와 파급 |
|---|---|---|
| `docs/ANALYTICS_SCHEMA.md`의 `KJEvent` ↔ DEC-027 · POL-001 | **참 — 현재 문서와 신 규칙이 충돌한다.** 단, DEC-027은 미확정이다. | 현재 문서는 `sign_in` 이벤트를 `provider: 'apple' \| 'google' \| 'devmock'`로 정의하고, `onboarding_complete` payload에 `{ era, university, housing }`를 넣는다. 또 `mission_complete`, `panel_unlock`, `gallery_open`, `photo_upload_outcome`을 정의한다(`docs/ANALYTICS_SCHEMA.md:20,28,34,48-49,66,153-162`). DEC-001은 “**로그인을 두지 않는다**”, DEC-027은 취약 축의 원값 금지·그 밖의 축 버킷화다. 따라서 auth·panel·gallery·photo 이벤트의 payload와 `src/lib/posthog.ts` union을 다시 대조해야 하며, DEC-027 확정 전에는 조건 축 payload를 구현 근거로 고정하지 않는다. |
| `DESIGN.md` §21 ↔ DEC-026 | **참 — 직접 충돌한다.** DEC-026이 확정되기 전까지는 잠정 뒤집힘이다. | §21은 `Synced.`, `Updated from another device.`, “**eventual consistency**”와 다른 기기 conflict를 시각 계약으로 둔다(`DESIGN.md:697-713`). DEC-026은 `save_pending`·`sync_conflict`와 `E2`~`E6`을 삭제하고 `save_failed`·`E8`만 남긴다. §21.1의 offline dot 자체는 남을 수 있지만 재연결·원격 conflict 문장은 살려 둘 수 없다. |
| `DESIGN.md` §§7, 20 ↔ DEC-024 · DEC-001 · DEC-022 | **참 — 병풍·미션·사진·갤러리 계약이 이번 범위 밖 전제에 걸린다.** | §7.1은 mission complete 때 panel art와 “Byeongpung panel N unlocked”를 보여주고(`DESIGN.md:216-231`), §20은 ADR-0034 권위, 업로드 progress, 2 MB Storage cap, gallery의 byeongpung header를 둔다(`DESIGN.md:644-674`). `DEC-024`의 `MEM-01`~`MEM-03` `Won't`, `DEC-001`·`DEC-022`의 로컬 사용자 데이터 원칙에 맞춰 이 문장·화면·업로드를 legacy/scope-out으로 격리한다. |
| `docs/PUSH_COPY.md` ↔ DEC-024 | **참 — panel unlock 알림 catalog가 `Won't` 전제에 걸린다.** | 문서는 3번째 push type을 panel unlock으로 두고(`docs/PUSH_COPY.md:7-13`), `claimPanelUnlock`이 true일 때 `firePanelUnlock`을 호출하며(`:57-69`), priming copy와 테스트도 panel unlock을 전제로 한다(`:98-125`). `ADR-0009`와 `MEM-01`·`MEM-02`가 이번 구현 근거에서 제외되므로 해당 catalog·priming·테스트를 구현하지 않고 legacy로 표시한다. D-Day/phase local notification 원칙까지 자동으로 삭제한다는 뜻은 아니다. |
| `docs/ANALYTICS_SCHEMA.md`의 mission/panel/gallery/photo events ↔ DEC-024 | **참 — 이벤트가 범위 밖 화면·소비자에 종속된다.** | `mission_complete`와 `panel_unlock`, `byeongpung_share`, `gallery_open` 및 `photo_upload_outcome`이 각각 `docs/ANALYTICS_SCHEMA.md:30-50,59-67,151-162`에 있다. `ADR-0011`·`ADR-0009`·`ADR-0034`가 `뒤집힘`이므로 이 이벤트의 구현·집계·photo payload는 격리하고, 이름만 남아 있는 문서는 새 범위가 확정된 뒤 다시 쓴다. |
| `docs/EMPTY_STATES.md` §§5-7 ↔ DEC-024 | **참 — gallery·byeongpung empty state가 `Won't` 화면을 구현 전제로 한다.** | Gallery 두 상태는 `completedMissionsWithPhotos.length === 0`을 trigger로 두고(`docs/EMPTY_STATES.md:74-98`), Byeongpung 상태는 ADR-0008과 `revealedPanels`를 전제로 한다(`:100-113`). `MEM-02`·`MEM-03`을 삭제하지는 않지만, 이 empty-state 문장과 snapshot을 이번 구현의 근거에서 격리한다. |
| `docs/PLAY_DATA_SAFETY.md` ↔ DEC-001 · DEC-022 · ADR-0034 | **참 — 계정/사용자 데이터 고지와 사진 pipeline 문장이 서로 다른 방향이다.** | 문서는 Email/Name/User IDs와 계정 삭제를 수집·연결 데이터로 적고(`docs/PLAY_DATA_SAFETY.md:8-28`), 동시에 Photos/files는 로컬 저장·OS share sheet만 사용하며 Firebase Storage가 없다고 명시한다(`:35-40`). 전자는 DEC-001·DEC-022와, 후자는 ADR-0034의 Storage upload 전제와 충돌하므로 스토어 고지는 계측·보존 범위를 확정한 뒤 다시 맞춘다. |

### 뒤집힘 ADR을 근거로 삼는 `docs/` 목록

- **ADR-0006·0013·0014·0021(인증/서버 사용자 데이터):** `docs/ANALYTICS_SCHEMA.md`, `docs/ERROR_MESSAGES.md`, `docs/EDGE_CASES.md`, `docs/SECURITY.md`, `docs/PRIVACY_POLICY.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `docs/TESTING.md`, `docs/OPERATIONS.md`, `docs/INCIDENT_RESPONSE.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DATA_FLOW.md`.
- **ADR-0008·0009·0011(병풍·패널·집계):** `DESIGN.md §§7,20`, `docs/PUSH_COPY.md`, `docs/ANALYTICS_SCHEMA.md`, `docs/EMPTY_STATES.md`, `CLAUDE.md`의 panel/aggregate 규칙.
- **ADR-0010(주거 미션 태깅):** `src/data/missions.ts`, `app/(tabs)/index.tsx`, `CLAUDE.md:94-98` — 새 4종 주거 × 계약 명의 출력 규칙으로 다시 설계한다.
- **ADR-0030(햅틱·미션 choreography):** `src/lib/haptics.ts`, `app/mission/[id].tsx`, `DESIGN.md §7.1`, `CLAUDE.md:15,185-197` — 기존 세 순간 계약을 현재 구현 근거로 쓰지 않는다.
- **ADR-0031(원격 sync):** `DESIGN.md §21`, `docs/ERROR_MESSAGES.md`, `docs/EDGE_CASES.md`, `docs/architecture/DATA_FLOW.md`, `docs/TESTING.md`.
- **ADR-0032(설정):** `docs/SETTINGS.md`, `DESIGN.md §§17–18`, `docs/ANALYTICS_SCHEMA.md` §10.1, `CLAUDE.md` source-of-truth table.
- **ADR-0033(계정 삭제/export):** `docs/SETTINGS.md`, `DESIGN.md §18`, `docs/ERROR_MESSAGES.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `docs/PRIVACY_POLICY.md`, `docs/TESTING.md`.
- **ADR-0034(사진 업로드):** `DESIGN.md §20`, `docs/ANALYTICS_SCHEMA.md` `photo_upload_outcome`, `docs/EMPTY_STATES.md` §§5-7, `docs/PLAY_DATA_SAFETY.md`, `src/lib/share.ts`.

### 지정 문서별 결론

- `docs/EMPTY_STATES.md`: 일반 empty-state 3-slot 계약 자체와 직접 충돌하지는 않는다. 다만 §§5-7의 gallery·byeongpung 상태는 `ADR-0008`·`ADR-0011`·`ADR-0034`의 범위 밖 전제에 걸리므로 이번 구현에서 격리한다.
- `docs/SETTINGS.md`: **충돌 확인.** §4 Account, Firestore/MMKV mirror, signed-in email, `ADR-0033` soft-delete/export를 DEC-001/022와 함께 유지할 수 없다. §1–§3 중 무엇을 로컬 설정으로 남길지는 Settings 자체의 새 DEC가 필요하다.
- `docs/PUSH_COPY.md`: **부분 충돌/보강 필요.** D-Day·phase 알림 원칙은 남을 수 있지만, panel unlock catalog·`claimPanelUnlock` gate·“sync fires panels” 문장은 `ADR-0009`·`DEC-024`와 충돌한다. transport 경계와 범위 밖 catalog를 분리해야 한다.
- `docs/ERROR_MESSAGES.md`: **충돌 확인.** `auth-*`, signed-in Firestore failure, `network-offline-recovered`, `bucket-conflict`, `account-deletion-*`, `export-*` 행이 각각 DEC-001/022/026과 어긋난다. `save_failed`/`E8`의 새 문구도 원문 기준으로 추가해야 한다.
- `docs/PLAY_DATA_SAFETY.md`: **충돌 확인.** 계정·email/name/UID linked collection과 in-app delete가 DEC-001/POL-001/POL-012와 어긋난다. 사진은 “not collected/no Firebase Storage”로 적혀 있어 ADR-0034의 UID Storage upload를 이번 구현에서 제외하는 보조 근거다.
- `docs/STORE_LISTING.md`: **충돌 확인.** account-bound progress, sign-in required, Apple/Google reviewer credentials가 DEC-001과 정면으로 어긋난다. 문화 미션·byeongpung copy도 새 설계의 서비스 설명으로 유지할지 범위 확인이 필요하다.
- `DESIGN.md`: **§7의 미션/병풍 choreography, §20의 사진/갤러리, §21의 sync visuals가 각각 ADR-0008·0011·0030·0034·0031 및 해당 DEC와 충돌한다.** §15 dark mode는 충돌 없음.
- `docs/ANALYTICS_SCHEMA.md`: **충돌 확인.** auth events 및 조건 축 raw payload/cohort는 DEC-001/027과, mission/panel/gallery/photo events는 DEC-024와 어긋난다. DEC-027이 미확정이므로 조건 축 payload는 확정 전 구현하지 않는다.

## §4 저장소 `CLAUDE.md` 개정 제안

현재 실제 개수는 `docs/adr/README.md`의 “35 ADR index”와 맞는다. 파일은 수정하지 않고 다음 줄 단위로 제안한다. `DEC-024` 관련 제안은 ADR/화면 ID를 지우는 것이 아니라, `Won't` 범위를 구현 규칙에서 분리하는 것이다.

| 현재 줄 | 제안 |
|---|---|
| 4 | `It encodes the currently applicable constraints. It does not prevent redesign: when a current DEC conflicts with a legacy ADR, follow the current DEC, record the conflict, and update or supersede the ADR before implementation.` |
| 5–7 | 기존 “full context” 문장 뒤에 `For the current redesign, also read `.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md`, `28-k-journey-service-policy-2026-07-25.md`, and `31-k-journey-decision-log-2026-07-25.md`.` 를 추가. |
| 15 | `reference/K-Journey_PRD_v1_1_KR.md`의 Haptics·Offline·Photo 및 empty/gallery/byeongpung 설명을 legacy reference로 표시하고, DEC-001·DEC-022·DEC-024와 충돌하는 사용자 데이터·Memory·햅틱 전제는 현재 구현 규칙으로 사용하지 않는다고 명시. |
| 20 | `docs/adr/README.md`의 설명을 `35 legacy ADRs — use the current DEC log for redesign decisions; ADRs remain applicable only when §1 says 유효/보강.` 으로 교체. |
| 20 뒤에 신설 | `Decision precedence: current DEC + current requirements/policy > legacy ADR for redesign scope. Security, accessibility, i18n, and platform constraints survive unless a DEC explicitly changes them.` |
| 30 | Settings 문장을 `legacy ADR-0032 reference; current account/storage behavior is governed by DEC-001, DEC-022, and the current policy.`로 교체. |
| 81–93, 179–181 | 병풍 8-panel·`claimPanelUnlock`·panel overlay/analytics/notification 규칙을 `DEC-024`의 `MEM-01`·`MEM-02` `Won't` 범위에 있는 legacy 규칙으로 표시하고, 되돌림 조건 전에는 구현하지 않는다고 제안. |
| 94–98 | 기존 `appliesTo: 'dormitory' \| 'off-campus'` 2값 계약을 제거하고, DEC-003·DEC-018에 따른 4종 주거 × 계약 명의 조합과 규칙 계층 출력으로 교체한다고 제안. |
| 99–102 | `aggregateCompletions`를 panel threshold·byeongpung reveal·gallery summary의 현재 구현 근거로 두지 말고 `DEC-024` `Won't` 범위의 legacy contract로 표시. |
| 147–153 | Google/Apple sign-in을 “구 ADR 기반 legacy path”로 내리고, DEC-001 확정 전에는 sign-in UI·provider·demo credential을 현재 규칙으로 취급하지 않는 문장으로 교체. |
| 154–155 | Firebase RN modular SDK 선택 자체는 유지하되, `Auth`·사용자 Firestore 저장은 DEC-001/022 범위 밖이라고 명시. |
| 173–174 | `serverTimestamp()`와 사용자 Firestore 원격 truth 전제를 제거하고, 새 설계의 로컬 저장·로컬 실패 규칙을 가리키도록 교체. |
| 185–197 | mission completion four-stage choreography, panel reveal, “Panel N unlocked” 문구와 관련 haptic moment를 `DEC-024` `Won't` 범위의 legacy contract로 표시하고, 현재 구현에는 적용하지 않는다고 제안. |
| 225–229 | 24개 PNG 병풍 자산과 `gallery.tsx` panel renderer rewrite 지시를 `MEM-02` `Won't` 범위의 보류 제안으로 바꾸고, 화면 ID·ADR 파일은 삭제하지 않는다고 명시. |
| 232–242 | “enable Apple+Google Auth”를 삭제하고, Firebase는 콘텐츠 배포·익명 이벤트·전원 공통 알림·운영자 감사 로그의 범위에서만 사용한다고 교체. |

## §5 네가 막힌 곳

1. **DEC-027 확정성:** `31`은 규칙 3조를 기록했지만 `44`가 확정하지 않았다. `POL-001`의 현재 대조표에는 DEC-027이 허용한 `programType`·`intakeSeason`이 0건이고, 판정되지 않은 축도 7건(`contractHolder`, `departureDate`, `housingType`, `programStartDate`, `residenceCardStatus`, `totalStayDays`, `universityId`)이다. 따라서 analytics 관련 `보강`과 docs 충돌은 방향은 확인되지만, DEC-027 의존 payload를 구현에 고정할 수 없다.
2. **DEC-026 확정성:** `DEC-026`은 ADR-0031을 명시적으로 뒤집는 방향이지만, `44` 기준 같은 세션에서 작성·채점되어 V5가 닫히지 않았다. ADR-0031의 `뒤집힘`은 현재 DEC가 요구하는 구현 방향 기준이며, §7에 적은 것처럼 확정 전에는 sync 문서·코드를 구현 기준으로 확정하지 않는다.
3. **`DEC-001`의 위치:** DEC 고유 ID 27건에는 들어가지만 원문 heading은 31이 아니라 28 §1에 있다. 이 위치를 숨기면 heading 수 26을 27로 잘못 보고할 수 있다.
4. **`DEC-024`의 의미:** `DEC-024`는 화면을 삭제하지 않고 `Won't`로 남긴다. `뒤집힘`은 ADR 파일 삭제나 화면 ID 삭제가 아니라 **현재 구현의 근거로 사용하지 않음**을 뜻한다. 진입 비율·I6 카드 소팅·8월 말 코호트 인터뷰가 필드 10의 되돌림 신호다.
5. **ADR 내부 상태 드리프트:** ADR-0033 본문은 launch에서 이미 client-side immediate deletion으로 superseded라고 적지만, `docs/adr/README.md` index는 `proposed`로 남아 있다. 이것은 DEC 대조와 별개의 기존 문서 정합성 문제이며, 새 ADR 번호·supersede 관계를 확인해야 최종 문서 권위를 정할 수 있다.
6. **남은 `sync` 낱말:** `DEC-022` §8은 `21`의 `E2`·`E4`·`E5`·`E6`과 `22` `UF09`의 “동기화”가 아직 반영되지 않았다고 적었고, DEC-026은 상태/전이를 내렸지만 모든 사용자 문장을 고치지는 않았다. 구현 경로와 문서 용어를 다시 검색해야 한다.
7. **코드 경로 존재성:** ADR-0023이 지목한 `src/lib/storage/migrations.ts`는 현재 없고 `src/lib/storageMigrations.ts`가 있다. ADR-0034의 `src/lib/photoUpload.ts`·`src/components/photo/*`도 현재 목록에서 확인되지 않는다. 따라서 표의 코드 영향은 실제 존재 경로와 ADR의 target 경로를 구분해 적었다.

## §6 이의

이의 없음.

## §7 미확정 의존

아래 표는 `뒤집힘`·`보강` 중 미확정 DEC-026·DEC-027에 직접 걸린 항목만 분리한 것이다. 확정 의존과 미확정 의존을 한 구현 표로 섞지 않는다.

| 미확정 DEC | ADR | 현재 판정 | 미확정 의존의 내용 | 이번 구현에서 손대도 되는가 / 격리해야 하는가 |
|---|---|---|---|---|
| `DEC-026` (미확정) | ADR-0031 | 뒤집힘 | `save_pending`·`sync_conflict`와 `E2`~`E6`을 삭제하고 `save_failed`·`E8`로 바꾸는 원격 sync 상태 결정 | **격리해야 한다.** DEC-026 확정 전에는 기존 sync visual도 새 `E8`도 구현 기준으로 확정하지 않는다. |
| `DEC-027` (미확정) | ADR-0004 | 보강 | PostHog primary sink에 어떤 조건 축을 금지하고 어떤 축을 버킷으로 보낼지의 payload 규칙 | **sink 배선만 손댈 수 있고 payload/cohort는 격리해야 한다.** 조건 축 원값·허용 버킷을 DEC-027 확정 전에는 고정하지 않는다. |
| `DEC-027` (미확정) | ADR-0005 | 보강 | Firebase secondary sink에 보낼 essential event와 조건 축 버킷의 동일 규칙 적용 | **sink 배선만 손댈 수 있고 payload/cohort는 격리해야 한다.** DEC-027 확정 전에는 양쪽 sink의 조건 축 payload를 구현하지 않는다. |

그 밖의 범위 변경은 이 표의 미확정 DEC-026·DEC-027 의존으로 분류하지 않는다. 특히 인증·원격 사용자 데이터·Memory 범위는 확정된 `DEC-001`·`DEC-022`·`DEC-024`에 따라 구현 여부를 판단한다. 그 밖의 보강은 §1에 적은 확정 DEC의 결정 축을 따른다. ADR-0010의 표현 교체는 §1에 적은 DEC-003·DEC-018의 주거 규칙을 따른다.

## §0 재집계 및 표 행 검증

마지막으로 §0의 집계와 이 파일의 ADR 행을 다시 명령으로 세었다.

```text
$ find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -print | sort | wc -l
35

$ (rg -o '^### `DEC-[0-9]{3}`' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md;
   rg -o '^\| 1 \| `DEC-ID` \| `DEC-[0-9]{3}`' .work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md) |
  rg -o 'DEC-[0-9]{3}' | sort -u | wc -l
27

$ rg -c '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw-v2.md
35

$ rg '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw-v2.md |
  awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $4); c[$4]++}
    END {printf "%s %d\n", "뒤집힘", c["뒤집힘"]+0;
         printf "%s %d\n", "유효", c["유효"]+0;
         printf "%s %d\n", "보강", c["보강"]+0;
         printf "%s %d\n", "불명", c["불명"]+0;
         total=0; for (k in c) total+=c[k]; print "합계", total}'
뒤집힘 13
유효 10
보강 12
불명 0
합계 35
```

최종 확인 결과는 `ADR 35 = §1 표 행 35 = 판정 분포 합계 35`다. 원본
`.work/adr-dec-raw.md`, `.work/adr-dec-review.md`, 코드, `docs/`, `CLAUDE.md`는 수정하지
않았다.
