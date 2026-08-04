# ADR × DEC 전수 대조 원자료

조사 대상은 `docs/adr/`의 번호가 붙은 ADR과
`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`에 나타난 `DEC`다.
판정은 DEC가 ADR의 결정 축을 바꾸는지로 했다. 신 설계가 다른 영역을 결정하지 않은 경우에는
`유효` 또는 `불명`으로 남겼다. 아래 인용부호 안의 문장은 원문을 그대로 옮겼다.

## §0 집계 — 명령과 결과

```text
ADR 개수: find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -print | sort | wc -l → 35
DEC 개수: rg -o 'DEC-[0-9]{3}' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md | sort -u | wc -l → 27
판정 분포: 뒤집힘 7 · 유효 14 · 보강 13 · 불명 1 (합계 35 = ADR 개수 35, 일치)
```

DEC heading만 세는 보조 확인은 `rg -c '^### \`DEC-' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md` → `26`이다.
`DEC-001`은 이 파일의 heading이 아니라 `28-k-journey-service-policy-2026-07-25.md` §1에서 재사용되므로,
고유 ID 집계는 위의 `sort -u` 명령을 사용했다. 따라서 「DEC 27건」은 맞고, heading 수 26과 혼동하면 안 된다.

## §1 대조표 — ADR 전건

| ADR ID | ADR 제목 | 판정 | 충돌/관련 DEC | ADR 원문 | DEC 원문 | 코드 영향 |
|---|---|---|---|---|---|---|
| ADR-0001 | React Native + Expo over Flutter | 유효 | 직접 충돌 없음 | “**Chosen:** React Native + Expo (managed) + TypeScript strict mode, because it gave the team the *fastest path from PRD to first sim build* while preserving the cross-platform single-codebase goal that justified the original Flutter pick.” (`docs/adr/0001-react-native-expo-over-flutter.md:33`) | 직접 관련 DEC 없음. 확인한 범위의 원문: “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**이고, 조건 축·태스크 상태의 **원본은 올라가지 않는다**” (`DEC-022`, 31:431) | `app/_layout.tsx`, `app.config.ts`, `package.json` |
| ADR-0002 | MMKV over Hive for local cache | 보강 | DEC-001 | “**Chosen:** MMKV (`react-native-mmkv`), because it is the only sync-read, JSI-backed option, and K-Journey's persistence shape is key-value with small JSON blobs — exactly MMKV's sweet spot.” (`docs/adr/0002-mmkv-over-hive-for-cache.md:33`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/lib/storage.ts`, `src/lib/storageMigrations.ts`, `app/_layout.tsx` |
| ADR-0003 | Firebase RN Modular SDK over Web SDK | 보강 | DEC-001, DEC-022 | “**Chosen:** `@react-native-firebase/*` modular API. It is the only option that delivers every PRD-required Firebase service without missing-service workarounds.” (`docs/adr/0003-firebase-rn-modular-sdk.md:32`) | “**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드” (`DEC-022`, 31:431) | `src/lib/firebase.ts`, `src/hooks/useAuth.ts`, `package.json` — Auth 경로는 재검토 대상 |
| ADR-0004 | PostHog as primary product analytics | 보강 | DEC-022, DEC-027* | “**Chosen:** PostHog Cloud (US region). Firebase Analytics stays as secondary (ADR-0005) for App Store optimisation funnels and as a fallback if PostHog is offline.” (`docs/adr/0004-posthog-primary-analytics.md:36`) | “**규칙 1 (금지 — 값 자체)**: **취약 상황을 드러내는 축의 값은 어떤 해상도로도 보내지 않는다.**” (`DEC-027`, 31:595) | `src/lib/posthog.ts`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0005 | Firebase Analytics as secondary | 보강 | DEC-022, DEC-027* | “**Chosen:** Keep Firebase Analytics as secondary, fire essential events to both sinks.” (`docs/adr/0005-firebase-analytics-secondary.md:29`) | “**규칙 2 (허용 — 버킷)**: **그 밖의 조건 축은 원값이 아니라 버킷으로만** 보낸다.” (`DEC-027`, 31:595) | `src/lib/posthog.ts`, `package.json`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0006 | Dev-mock bypass pattern (`isDevMock`) | 뒤집힘 | DEC-001 | “**Chosen:** `isDevMock()` branch inside `src/lib/firebase.ts` plus reactive `useMMKVBoolean(KEYS.devMockAuth)` in `useAuth`. Each mutator (sign-in, profile update, mission complete, bucket CRUD) checks `isDevMock()` and writes to MMKV instead of Firestore.” (`docs/adr/0006-dev-mock-bypass-pattern.md:31`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `app/(onboarding)/sign-in.tsx`, `docs/PLAY_DATA_SAFETY.md` |
| ADR-0007 | Cold-start splash handler ref | 유효 | 직접 충돌 없음 | “**Chosen:** A React ref (`coldStartHandledRef`) in `AuthGate` (or root `_layout`). On first mount it sets itself true and forces a one-time redirect through `/splash`, after which the restored route resumes.” (`docs/adr/0007-cold-start-splash-handler-ref.md:28`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “단계는 조건 축의 판정 결과이지 화면이 아니다.” (`DEC-023`, 31:455) | `app/_layout.tsx`, `app/(onboarding)/splash.tsx` |
| ADR-0008 | Byeongpung PNG full-paintings (not SVG) | 유효 | 직접 충돌 없음 | “**Chosen:** 24 PNGs, one per (era, panel) pair, each baked with its era's colour and motif. The code's responsibility is *selection*, not styling.” (`docs/adr/0008-byeongpung-png-not-svg.md:30`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**절대 날짜 + 남은 일수를 함께** 표시한다.” (`DEC-009`, 31:226) | `src/components/byeongpung/PanelImage.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx`, `src/theme/eras.ts` |
| ADR-0009 | Single-fire panel unlock gate (`claimPanelUnlock`) | 유효 | 직접 충돌 없음 | “**Chosen:** `claimPanelUnlock(panelNumber: number): boolean` in `src/lib/notifications.ts`.” (`docs/adr/0009-single-fire-panel-unlock.md:33`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**오류 5종을 축 2로 두고 태스크 카드에 배지로 겹친다.**” (`DEC-020`, 31:384) | `src/lib/notifications.ts`, `src/components/mission/MissionCompleteOverlay.tsx`, `docs/PUSH_COPY.md` |
| ADR-0010 | Housing-specific mission tagging (`appliesTo`) | 보강 | DEC-003, DEC-018 | “**Chosen:** `appliesTo?: 'dormitory' \| 'off-campus'` field. Missions without the field are universal (applies to both).” (`docs/adr/0010-housing-applies-to-tagging.md:28`) | “**원문의 4종 분류를 그대로 따른다** — 내가 재분류하지 않는다” (`DEC-018`, 31:356) | `src/data/missions.ts`, `app/(tabs)/index.tsx`, `src/lib/firebase.ts` — 4종 housing 입력과 기존 2종 미션 적용의 매핑이 필요 |
| ADR-0011 | Single-source completion aggregation (`aggregateCompletions`) | 유효 | 직접 교체 DEC 없음 | “**Chosen:** `aggregateCompletions` pure function in `src/lib/completions.ts`. Returns `{ missionCount, bucketItemCount, total }`.” (`docs/adr/0011-single-source-completion-aggregation.md:31`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**저장 실패·동기화 충돌·권한 거부는 태스크 상태 7종 안에서 표현할 수 있다**” (`DEC-020`, 31:375) | `src/lib/completions.ts`, `src/hooks/useTotalCompletions.ts`, `app/gallery.tsx`, `app/(tabs)/byeongpung.tsx` |
| ADR-0012 | Async mutator error contract (`showOperationError`) | 보강 | DEC-020, DEC-026 | “**Chosen:** A single helper `showOperationError(action, error)` in `src/lib/errorAlert.ts`” (`docs/adr/0012-async-mutator-error-contract.md:32`) | “**낙관적 UI를 적용하지 않는다** — 값이 남지 않으므로 완료로 보이면 안 된다” (`DEC-026`, 31:550) | `src/lib/errorAlert.ts`, `src/lib/errors/catalog.ts`, `docs/ERROR_MESSAGES.md` |
| ADR-0013 | Apple Sign-In primary, Google deferred | 뒤집힘 | DEC-001 | “**Chosen:** Apple Sign-In wired + tested. Google Sign-In stubbed with a placeholder Alert until OAuth client config is obtained.” (`docs/adr/0013-apple-primary-google-deferred.md:32`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `app/(onboarding)/sign-in.tsx`, `src/hooks/useAuth.ts`, `src/lib/firebase.ts`, `docs/SECURITY.md` |
| ADR-0014 | Anonymous auth removed | 뒤집힘 | DEC-001 | “**Chosen:** Apple/Google only. Firestore Rules will explicitly reject anonymous tokens (ADR-0021).” (`docs/adr/0014-anonymous-auth-removed.md:31`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/hooks/useAuth.ts`, `firestore.rules`, `docs/SECURITY.md`, `docs/ANALYTICS_SCHEMA.md` |
| ADR-0015 | Behavior-triggered push only | 보강 | DEC-009, DEC-010, DEC-022 | “**Chosen:** Behavior-triggered notifications only. Scheduled through `src/lib/notifications.ts`.” (`docs/adr/0015-behavior-triggered-push-only.md:32`) | “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**이고, 조건 축·태스크 상태의 **원본은 올라가지 않는다**” (`DEC-022`, 31:431) | `src/lib/notifications.ts`, `src/lib/notifications/copy.ts`, `docs/PUSH_COPY.md` |
| ADR-0016 | No CSS framework — inline RN styles + tokens | 유효 | 직접 충돌 없음 | “**Chosen:** Plain RN styles + token imports. CLAUDE.md NEVER #17 forbids CSS frameworks.” (`docs/adr/0016-no-css-framework-inline-styles.md:31`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “화면은 1개로 고정한다” (`DEC-003`, 31:142) | `app/**/*.tsx`, `src/**/*.tsx`, `design-tokens.ts` |
| ADR-0017 | Design-token only color policy | 유효 | 직접 충돌 없음 | “**Chosen:** Tokens only. CLAUDE.md MUST #1 + NEVER #1 + NEVER #20 enforce this.” (`docs/adr/0017-design-token-only-colors.md:35`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**조건 해당 시에만** 상시 노출한다” (`DEC-010`, 31:240) | `design-tokens.ts`, `src/**/*.tsx`, `DESIGN.md` |
| ADR-0018 | English first, Korean parenthetical for proper nouns | 보강 | DEC-015 | “**Chosen:** `English (한국어)` for proper nouns. Sentence-case English.” (`docs/adr/0018-english-first-korean-parenthetical.md:30`) | “라벨을 재작성하고 예시를 병기한다. **제한된 영어 사용자를 전제**로 관용구·축약어를 피한다” (`DEC-015`, 31:310) | `app/(onboarding)/*.tsx`, `docs/MICROCOPY.md`, `docs/I18N_TIMEZONE.md` |
| ADR-0019 | Reanimated worklet inline-only rule | 유효 | 직접 충돌 없음 | “**Chosen:** Hard rule. `useAnimatedStyle(() => ({ ... }))` only — never `useAnimatedStyle(makeStyle())`.” (`docs/adr/0019-reanimated-worklet-inline-rule.md:28`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**오류 5종을 축 2로 두고 태스크 카드에 배지로 겹친다.**” (`DEC-020`, 31:384) | `src/components/mission/MissionCompleteOverlay.tsx`, `src/components/byeongpung/ByeongpungStrip.tsx` |
| ADR-0020 | Jest with React Native mocks | 유효 | 직접 충돌 없음 | “**Chosen:** Jest with a custom `jest.setup.js` mocking the native modules we use (Firebase, MMKV, Notifications, MediaLibrary, etc.).” (`docs/adr/0020-jest-with-rn-mocks.md:33`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**장애 주입** — 로컬 저장을 실패시켰을 때 「저장하지 못했습니다」가 나오고 **완료 표시가 남지 않는가**” (`DEC-026`, 31:552) | `jest.setup.js`, `src/**/__tests__/*`, `package.json` |
| ADR-0021 | Firestore Rules ACL model | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** Owner-only writes everywhere on user data; signed-in read on catalogues; open read on `emergency`. Anonymous tokens are explicitly rejected.” (`docs/adr/0021-firestore-rules-acl-model.md:34`) | “**사용자 데이터에 접근 권한 없음. 서버에 없으므로 물리적으로 불가**” (`POL-001`, 28:78) 및 “**이 방향에 사용자 데이터는 없다.**” (`DEC-022`, 31:431) | `firestore.rules`, `src/lib/firebase.ts`, `docs/SECURITY.md`, `docs/architecture/ARCHITECTURE.md` |
| ADR-0022 | KST timezone as single source of truth | 보강 | DEC-004, DEC-009, DEC-014 | “**Chosen:** Add `src/lib/dates.ts` exporting:” (`docs/adr/0022-kst-timezone-single-source.md:35`) | “**절대 날짜 + 남은 일수를 함께** 표시한다. 처리 소요(6~7주)를 함께 노출해 역산 가능하게 한다” (`DEC-009`, 31:226) | `src/lib/dates.ts`, `src/lib/clockGuard.ts`, `src/hooks/usePhase.ts`, `src/components/home/DDayBanner.tsx` |
| ADR-0023 | MMKV key versioning & migration | 보강 | DEC-001, DEC-026 | “**Chosen:** Add `src/lib/storage/migrations.ts` with a typed `Migration[]` array, run via `runMigrations()` at app boot (before any hook reads MMKV).” (`docs/adr/0023-mmkv-key-versioning-migration.md:31`) | “**낙관적 UI를 적용하지 않는다** — 값이 남지 않으므로 완료로 보이면 안 된다” (`DEC-026`, 31:550) | `src/lib/storageMigrations.ts` (현재 경로), `src/lib/storage.ts`, `app/_layout.tsx` |
| ADR-0024 | Environment separation (dev / staging / prod) | 유효 | DEC-022 | “**Chosen:** Three environments with explicit separation. Replace `app.json` with `app.config.ts` that branches on `EAS_BUILD_PROFILE`.” (`docs/adr/0024-environment-separation-dev-staging-prod.md:33`) | “**배포 경로 3종 구분** — 서버 데이터 / 번들 OTA / 새 빌드” (`DEC-022`, 31:431) | `app.config.ts`, `app.json`, `eas.json`, `firestore.rules`/Firebase 설정 |
| ADR-0025 | Accessibility WCAG 2.1 AA target | 보강 | DEC-007, DEC-008, DEC-010, DEC-019 | “**Chosen:** WCAG 2.1 **AA** as the public-facing commitment.” (`docs/adr/0025-accessibility-wcag-2-1-aa.md:32`) | “차단 태스크에 「무엇이 완료되면 풀리는지」를 **반드시 표시**한다” (`DEC-007`, 31:198) | `src/lib/a11y.ts`, `docs/ACCESSIBILITY.md`, `src/components/**/*.tsx` |
| ADR-0026 | EAS channel strategy & version policy | 유효 | DEC-022 | “**Chosen:** Semver for user-visible versions; EAS-managed auto-increment for `buildNumber` (iOS) and `versionCode` (Android); explicit channels per environment.” (`docs/adr/0026-eas-channel-strategy.md:29`) | “**새 빌드가 필요한 변경**(권한·알림·네이티브)” (`REQ-COR-003`, 27:276) | `eas.json`, `app.config.ts`, `docs/RELEASE.md` |
| ADR-0027 | Empty state pattern | 유효 | DEC-008 | “**Chosen:** Every empty state in K-Journey is composed of exactly three slots, in this fixed order:” (`docs/adr/0027-empty-state-pattern.md:37`) | “노출한다. **기본은 접힌 상태**로 하고 펼치면 사유 + 공식 근거 링크를 보여준다” (`DEC-008`, 31:212) | `src/components/ui/EmptyState.tsx`, `docs/EMPTY_STATES.md` |
| ADR-0028 | Error recovery & retry strategy | 보강 | DEC-020, DEC-026 | “**Chosen:** A 4-tier decision tree that `showOperationError` (and a future companion `showOperationErrorWithRetry`) routes into based on error category.” (`docs/adr/0028-error-recovery-retry-strategy.md:37`) | “**오류 5종을 축 2로 두고 태스크 카드에 배지로 겹친다.**” (`DEC-020`, 31:384) | `src/lib/errorAlert.ts`, `src/lib/errors/catalog.ts`, `src/lib/errors/host.ts`, `docs/ERROR_MESSAGES.md` |
| ADR-0029 | Push copy library & permission priming | 보강 | DEC-009, DEC-015, DEC-022 | “**Chosen:** Both halves of the problem are fixed in one ADR because they share an owner file and review cadence.” (`docs/adr/0029-push-copy-library-and-priming.md:39`) | “**전원 공통 알림**” 및 “**개인 기한 알림은 기기가 스케줄하는 로컬 알림**” (`DEC-022`, 31:431) | `src/lib/notifications/copy.ts`, `src/components/onboarding/NotificationPriming.tsx`, `docs/PUSH_COPY.md` |
| ADR-0030 | Haptics & sound feedback policy | 유효 | 직접 충돌 없음 | “**Chosen:** Haptics fire at exactly **three moments**, using `expo-haptics`. Sound is **not** used at MVP.” (`docs/adr/0030-haptics-and-sound-feedback.md:36`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**실제 개입은 `출국 전`에 배치한다” (`DEC-004`, 31:156) | `src/lib/haptics.ts`, `app/mission/[id].tsx`, `src/lib/notifications.ts` |
| ADR-0031 | Offline state visibility & sync conflict resolution | 뒤집힘 | DEC-022, DEC-026* | “* `disconnected → connected` **with pending writes**: T1 toast `Synced.`” (`docs/adr/0031-offline-state-visibility.md:51-52`) | “**삭제** — 상태 **`save_pending`·`sync_conflict`** … 전이 **`E2`·`E3`·`E4`·`E5`·`E6`**” (`DEC-026`, 31:550) | `src/state/useNetwork.ts`, `src/state/useNetworkToasts.ts`, `src/components/ui/NetworkIndicator.tsx`, `DESIGN.md §21`, `docs/ERROR_MESSAGES.md` |
| ADR-0032 | Settings screen architecture | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** A single Settings screen reachable from the More tab. The screen is composed of **5 categories**” (`docs/adr/0032-settings-screen-architecture.md:41`) | “**로그인을 두지 않는다**” (`28-k-journey-service-policy-2026-07-25.md:39`) 및 “**조건 축·태스크 상태의 원본은 올라가지 않는다**” (`DEC-022`, 31:431) | `app/settings/index.tsx`, `app/(tabs)/more.tsx`, `docs/SETTINGS.md`, `DESIGN.md §§17–18` — Account/Firestore rows는 그대로 둘 수 없음 |
| ADR-0033 | Account deletion & data export | 뒤집힘 | DEC-001, DEC-022 | “**Chosen:** A two-action policy — **Delete account** and **Export my data** — both reachable from Settings → Account (ADR-0032). Deletion is **soft** for 30 days with a reaper Cloud Function; export is **immediate** with email-delivered ZIP.” (`docs/adr/0033-account-deletion-and-export.md:50`) | “**로그인을 두지 않는다.** 조건 축·태스크 상태는 **기기 로컬에만** 저장하고, 사용자가 원할 때 **텍스트로 내보내기**를 제공한다” (`28-k-journey-service-policy-2026-07-25.md:39`) | `src/lib/accountDeletion.ts`, `src/lib/firebase.ts`, `docs/SETTINGS.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `DESIGN.md §18` |
| ADR-0034 | Photo upload pipeline | 불명 | DEC-013만 인접; 신 DEC가 업로드 범위를 결정하지 않음 | “**Chosen:** A four-part pipeline.” (`docs/adr/0034-photo-upload-pipeline.md:38`) | “규격을 전수 노출하고, **재사용 금지는 별도 경고 블록**으로 분리한다” (`DEC-013`, 31:282) | 현재 `src/lib/photoUpload.ts`·`src/components/photo/*`는 확인되지 않음. `src/lib/share.ts`, `app/mission/[id].tsx`, `docs/PLAY_DATA_SAFETY.md`는 사진을 로컬 저장/공유로 기술 |
| ADR-0035 | Dark mode explicit rejection | 유효 | 직접 충돌 없음 | “**Chosen:** K-Journey **explicitly rejects** dark mode for MVP. `userInterfaceStyle: 'light'` in `app.json` is the technical lock” (`docs/adr/0035-dark-mode-explicit-rejection.md:40`) | 직접 관련 DEC 없음. 확인한 DEC 원문: “**화면 ID는 남긴다**” (`DEC-024`, 31:477) | `app.json`, `app.config.ts`, `DESIGN.md §15`, `src/theme/ThemeProvider.tsx` |

\* `DEC-026`·`DEC-027`은 현재 로그에 기록되어 있으나 `44-k-journey-role-review-unscored-dec-2026-07-27.md`에 의해 확정되지 않은 상태다. 위 표는 “기록된 DEC가 요구하는 방향”으로 대조했으며, 확정 여부는 §5에 별도로 남겼다.

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

## §3 `docs/` 파급

### 지정된 충돌 후보 확인

| 후보 | 확인 결과 | 원문 근거와 파급 |
|---|---|---|
| `docs/ANALYTICS_SCHEMA.md`의 `KJEvent` ↔ DEC-027 · POL-001 | **참 — 현재 문서와 신 규칙이 충돌한다.** 단, DEC-027은 미확정이다. | 현재 문서는 `sign_in` 이벤트를 `provider: 'apple' \| 'google' \| 'devmock'`로 정의하고, `onboarding_complete` payload에 `{ era, university, housing }`를 넣는다. 또 `University X students` cohort에서 `university`를 super-property로 쓴다. 반면 DEC-001은 “**로그인을 두지 않는다**”, DEC-027은 “**취약 상황을 드러내는 축의 값은 어떤 해상도로도 보내지 않는다**”, 그 밖의 조건 축은 사전 정의 버킷만 허용한다고 한다. `housing`은 현재 허용 목록에 없고, 새 축을 판정하지 않으면 규칙 1로 취급된다. `sign_in`은 DEC-001과 직접 충돌한다. `src/lib/posthog.ts`의 union과 `docs/ANALYTICS_SCHEMA.md` §2·§7·§10을 함께 고쳐야 하지만, 먼저 DEC-027 확정과 축별 판정이 필요하다. |
| `DESIGN.md` §21 ↔ DEC-026 | **참 — 직접 충돌한다.** DEC-026이 확정되기 전까지는 잠정 뒤집힘이다. | §21은 `Synced.`, `Updated from another device.`, “**eventual consistency**”와 다른 기기 conflict를 시각 계약으로 둔다. DEC-026은 `save_pending`·`sync_conflict`와 `E2`~`E6`을 삭제하고 `save_failed`·`E8`만 남긴다. §21.1의 offline dot 자체는 남을 수 있지만 §21.2–§21.4의 재연결·원격 conflict 문장은 살려 둘 수 없다. `DESIGN.md`, `src/state/useNetworkToasts.ts`, `docs/ERROR_MESSAGES.md`, `docs/EDGE_CASES.md`를 함께 재대조해야 한다. |
| `docs/PLAY_DATA_SAFETY.md` · `docs/STORE_LISTING.md` ↔ POL-012 | **참 — 다중 충돌이다.** | `PLAY_DATA_SAFETY.md`는 “**Does your app collect …? → Yes (collects)**”, 삭제 surface, Email/Name/User IDs를 linked/required로 적는다. `STORE_LISTING.md`는 “**your progress is bound to your account**”와 “**sign-in required**”를 적는다. POL-012는 고지와 실제 이벤트 집합이 1:1이어야 하고, POL-001/DEC-001은 계정·이메일·사용자 조건 값을 서버에 두지 않는다고 한다. 따라서 현재 두 문서는 제출 가능 상태가 아니며, `DEC-022` 이벤트 payload와 DEC-027 규칙을 확정한 뒤 스토어 고지·Privacy Policy를 다시 써야 한다. |

### 뒤집힘 ADR을 근거로 삼는 `docs/` 목록

- **ADR-0006·0013·0014·0021(인증/서버 사용자 데이터):** `docs/ANALYTICS_SCHEMA.md`, `docs/ERROR_MESSAGES.md`, `docs/EDGE_CASES.md`, `docs/SECURITY.md`, `docs/PRIVACY_POLICY.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `docs/TESTING.md`, `docs/OPERATIONS.md`, `docs/INCIDENT_RESPONSE.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DATA_FLOW.md`.
- **ADR-0031(원격 sync):** `DESIGN.md §21`, `docs/ERROR_MESSAGES.md`, `docs/EDGE_CASES.md`, `docs/architecture/DATA_FLOW.md`, `docs/TESTING.md`.
- **ADR-0032(설정):** `docs/SETTINGS.md`, `DESIGN.md §§17–18`, `docs/ANALYTICS_SCHEMA.md` §10.1, `CLAUDE.md` source-of-truth table.
- **ADR-0033(계정 삭제/export):** `docs/SETTINGS.md`, `DESIGN.md §18`, `docs/ERROR_MESSAGES.md`, `docs/PLAY_DATA_SAFETY.md`, `docs/STORE_LISTING.md`, `docs/PRIVACY_POLICY.md`, `docs/TESTING.md`.

### 지정 문서별 결론

- `docs/EMPTY_STATES.md`: **뒤집힘 ADR과의 직접 충돌은 확인되지 않았다.** `DEC-008`의 `not_applicable` 사유·근거 노출은 empty state의 3-slot 계약과 다른 상태 모델이다. 다만 홈/갤러리의 `aggregateCompletions`와 mission 전제는 신 IA에서 별도 재검증해야 한다.
- `docs/SETTINGS.md`: **충돌 확인.** §4 Account, Firestore/MMKV mirror, signed-in email, `ADR-0033` soft-delete/export를 DEC-001/022와 함께 유지할 수 없다. §1–§3 중 무엇을 로컬 설정으로 남길지는 Settings 자체의 새 DEC가 필요하다.
- `docs/PUSH_COPY.md`: **부분 충돌/보강 필요.** behavior-triggered/no-daily 원칙은 살아 있지만, 문서는 모든 알림을 하나의 “push” catalog처럼 서술하고 `sync fires panels`라고 쓴다. DEC-022의 “전원 공통 알림” 대 “기기 로컬 기한 알림” transport 경계와 DEC-026의 sync 제거를 반영해 명칭·전달 경로·오프라인 문장을 분리해야 한다.
- `docs/ERROR_MESSAGES.md`: **충돌 확인.** `auth-*`, signed-in Firestore failure, `network-offline-recovered`, `bucket-conflict`, `account-deletion-*`, `export-*` 행이 각각 DEC-001/022/026과 어긋난다. `save_failed`/`E8`의 새 문구도 아직 원문 기준으로 추가해야 한다.
- `docs/PLAY_DATA_SAFETY.md`: **충돌 확인.** 계정·email/name/UID linked collection과 in-app delete가 DEC-001/POL-001/POL-012와 어긋난다. 사진은 “not collected/no Firebase Storage”로 적혀 있어 ADR-0034가 실제 구현되지 않았다는 보조 근거다.
- `docs/STORE_LISTING.md`: **충돌 확인.** account-bound progress, sign-in required, Apple/Google reviewer credentials가 DEC-001과 정면으로 어긋난다. 문화 미션·byeongpung copy도 새 설계의 서비스 설명으로 유지할지 별도 제품 범위 확인이 필요하다.
- `DESIGN.md`: **§17 Settings와 §18 Account는 충돌, §21 sync visuals는 DEC-026과 직접 충돌**한다. §15 dark mode는 충돌 없음.
- `docs/ANALYTICS_SCHEMA.md`: **충돌 확인.** 위 후보 표와 같이 auth events 및 조건 축 raw payload/cohort가 DEC-001/027과 어긋난다. DEC-027이 미확정이므로 확정 전 제출/구현을 막아야 한다.

## §4 저장소 `CLAUDE.md` 개정 제안

현재 실제 개수는 `docs/adr/README.md`의 “35 ADR index”와 맞는다. §0 명령도 35를 반환한다. 다만 root `CLAUDE.md`가 구 제품 ADR/PRD를 현재 결론으로 고정하고 있어, 신 설계의 DEC가 이기는 경우를 표현하지 못한다. 파일은 수정하지 않고 다음 줄 단위로 제안한다.

| 현재 줄 | 제안 |
|---|---|
| 4 | `It encodes the currently applicable constraints. It does not prevent redesign: when a current DEC conflicts with a legacy ADR, follow the current DEC, record the conflict, and update or supersede the ADR before implementation.` |
| 5–7 | 기존 “full context” 문장 뒤에 `For the current redesign, also read `.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md`, `28-k-journey-service-policy-2026-07-25.md`, and `31-k-journey-decision-log-2026-07-25.md`.` 를 추가. |
| 15 | `reference/K-Journey_PRD_v1_1_KR.md`를 **legacy product PRD**로 표시하고, 조건부 여정 오케스트레이션의 현재 제품 SSOT는 `27`·`28`·`31`이라고 명시. |
| 20 | `docs/adr/README.md`의 설명을 `35 legacy ADRs — use the current DEC log for redesign decisions; ADRs remain applicable only when §1 says 유효/보강.` 으로 교체. |
| 20 뒤에 신설 | `Decision precedence: current DEC + current requirements/policy > legacy ADR for redesign scope. Security, accessibility, i18n, and platform constraints survive unless a DEC explicitly changes them.` |
| 30 | Settings 문장을 `legacy ADR-0032 reference; current account/storage behavior is governed by DEC-001, DEC-022, and the current policy.`로 교체. |
| 94–98 | `housingType` 4종을 반영하되, `appliesTo`의 두 broad bucket과의 매핑은 DEC-018 후속 결정 없이는 확정하지 않는다고 명시. |
| 147–153 | Google/Apple sign-in을 “구 ADR 기반 legacy path”로 내리고, DEC-001 확정 전에는 sign-in UI·provider·demo credential을 현재 규칙으로 취급하지 않는 문장으로 교체. |
| 154–155 | Firebase RN modular SDK 선택 자체는 유지하되, `Auth`·사용자 Firestore 저장은 DEC-001/022 범위 밖이라고 명시. |
| 173–174 | `serverTimestamp()`와 사용자 Firestore 원격 truth 전제를 제거하고, 새 설계의 로컬 저장·로컬 실패 규칙을 가리키도록 교체. |
| 232–242 | “enable Apple+Google Auth”를 삭제하고, Firebase는 콘텐츠 배포·익명 이벤트·전원 공통 알림·운영자 감사 로그의 범위에서만 사용한다고 교체. |
| 248–250 | 계정/스토어 상태를 DEC-001·POL-012와 대조한 뒤 별도 결정을 만들기 전까지 `미확인`으로 두도록 교체. |

## §5 네가 막힌 곳

1. **DEC-027 확정성:** `31`은 규칙 3조를 기록했지만 `44`가 확정하지 않았다. `POL-001`의 현재 대조표에는 DEC-027이 허용한 `programType`·`intakeSeason`이 0건이고, 판정되지 않은 축도 7건(`contractHolder`, `departureDate`, `housingType`, `programStartDate`, `residenceCardStatus`, `totalStayDays`, `universityId`)이다. 따라서 analytics 관련 `보강`과 docs 충돌은 방향은 확인되지만 최종 판정·제출은 `불명` 상태를 해소한 뒤 가능하다.
2. **DEC-026 확정성:** `DEC-026`은 ADR-0031을 명시적으로 뒤집는 방향이지만, `44` 기준 같은 세션에서 작성·채점되어 V5가 닫히지 않았다. 위 표의 `뒤집힘`은 현재 DEC가 요구하는 구현 방향 기준이며, 별도 세션 확정 전에는 `DESIGN.md §21`을 지우거나 고치는 작업을 실행하면 안 된다.
3. **`DEC-001`의 위치:** DEC 고유 ID 27건에는 들어가지만 원문 heading은 31이 아니라 28 §1에 있다. 이 위치를 숨기면 heading 수 26을 27로 잘못 보고할 수 있다.
4. **사진 범위:** `DEC-013`은 서류 사진 재사용 경고만 결정하고, ADR-0034의 사용자 사진 업로드·EXIF·moderation을 채택/폐기하지 않는다. 현재 코드와 `docs/PLAY_DATA_SAFETY.md`는 Firebase Storage 업로드가 없다고 말하지만, 이것만으로 신 설계의 사진 scope가 최종 폐기됐다고 단정하지 않았다. 신 요구사항/정책에 사진 보존·공유 여부를 명시해야 ADR-0034를 `유효` 또는 `뒤집힘`으로 바꿀 수 있다.
5. **ADR 내부 상태 드리프트:** ADR-0033 본문은 launch에서 이미 client-side immediate deletion으로 superseded라고 적지만, `docs/adr/README.md` index는 `proposed`로 남아 있다. 이것은 DEC 대조와 별개의 기존 문서 정합성 문제이며, 새 ADR 번호·supersede 관계를 확인해야 최종 문서 권위를 정할 수 있다.
6. **남은 `sync` 낱말:** `DEC-022` §8은 `21`의 `E2`·`E4`·`E5`·`E6`과 `22` `UF09`의 “동기화”가 아직 반영되지 않았다고 적었고, DEC-026은 상태/전이를 내렸지만 모든 사용자 문장을 고치지는 않았다. 구현 경로와 문서 용어를 다시 검색해야 한다.
7. **코드 경로 존재성:** ADR-0023이 지목한 `src/lib/storage/migrations.ts`는 현재 없고 `src/lib/storageMigrations.ts`가 있다. ADR-0034의 `src/lib/photoUpload.ts`·`src/components/photo/*`도 현재 목록에서 확인되지 않는다. 따라서 표의 코드 영향은 실제 존재 경로와 ADR의 target 경로를 구분해 적었다.

## §0 재집계 및 표 행 검증

마지막으로 §0의 명령을 다시 실행하고, 이 파일의 ADR 행을 별도 명령으로 세었다.

```text
$ find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -print | sort | wc -l
35

$ rg -o 'DEC-[0-9]{3}' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md | sort -u | wc -l
27

$ rg -c '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw.md
35
```

재집계 결과는 `ADR 35 = 표 행 35`다. §0 분포도 `7 + 14 + 13 + 1 = 35`로 같은 분모를 사용한다. 코드는 수정하지 않았고, 이 조사 산출물만 작성했다.
