# K-Journey

**제품 요구사항 정의서 (PRD)**

*교환학생을 위한 한국 여정 큐레이션 앱*

- **버전:** 1.2 (MVP, UX 레이어 신설 — empty state · 에러 카피 · 마이크로카피 · 푸시 카피)
- **작성일:** 2026년 4월 (v1.0) · 2026년 5월 13일 (v1.1 개정) · 2026년 5월 14일 (v1.2 개정)
- **작성자:** 김재윤
- **상태:** 발효 (in effect)
- **이전 버전:** [`K-Journey_PRD_v1_0_KR.md`](K-Journey_PRD_v1_0_KR.md) — superseded 표시

> v1.2의 변경 요점: §4.5(empty state 정책)·§7.8(푸시 알림 카피 템플릿) 신설, §11.4(에러 핸들링)에 4-tier 결정 트리 + 에러 카피 카탈로그 link 추가, §11.6(접근성)에 Reduce Motion 폴백·VoiceOver expected announcements 보강. 신규 ADR 3건 (ADR-0027 empty state pattern · ADR-0028 error recovery & retry · ADR-0029 push copy library & priming). 신규 docs 4건 (`docs/MICROCOPY.md` · `docs/ERROR_MESSAGES.md` · `docs/EMPTY_STATES.md` · `docs/PUSH_COPY.md`). 자세한 변경 차트는 §18 참조.
>
> v1.1의 변경 요점: §11(기술 아키텍처) 전면 재작성(Flutter→RN+Expo+TS), §11.4~§11.10 신설(에러/보안/접근성/i18n/성능/배포/운영), §4·§5·§6·§7·§8·§10에 엣지 케이스 절 신설, §14 리스크 8건 추가, §16(이벤트 분석 스키마)·§17(엣지 케이스 매트릭스)·§18(변경 이력) 신설. 26개 ADR(`docs/adr/`)이 의사결정 근거.

---

## 목차

1. [개요](#1-개요)
2. [타겟 사용자](#2-타겟-사용자)
3. [수익 모델](#3-수익-모델)
4. [온보딩 및 유저 플로우](#4-온보딩-및-유저-플로우)
5. [페이즈 시스템](#5-페이즈-시스템)
6. [게이미피케이션: 병풍 시스템](#6-게이미피케이션-병풍-시스템)
7. [미션 시스템](#7-미션-시스템)
8. [대학교별 맞춤 콘텐츠](#8-대학교별-맞춤-콘텐츠)
9. [긴급 상황 가이드](#9-긴급-상황-가이드)
10. [출국 후 경험](#10-출국-후-경험)
11. [기술 아키텍처](#11-기술-아키텍처)
12. [콘텐츠 관리](#12-콘텐츠-관리)
13. [MVP 범위 및 제외 사항](#13-mvp-범위-및-제외-사항)
14. [리스크 및 대응 방안](#14-리스크-및-대응-방안)
15. [개발 로드맵](#15-개발-로드맵)
16. [이벤트 분석 스키마](#16-이벤트-분석-스키마-신설)
17. [기능별 엣지 케이스 매트릭스](#17-기능별-엣지-케이스-매트릭스-신설)
18. [변경 이력](#18-변경-이력-신설)

---

## 1. 개요

K-Journey는 한국에서 교환학생 생활을 하는 외국인 학생을 위한 모바일 큐레이션 앱입니다. 입국 전 준비부터 출국 후 추억 관리까지, 교환학생의 전체 여정을 단계별로 안내하며 관광객이 아닌 현지인만 아는 Exclusive한 한국 경험을 제공합니다.

한국 전통 미술(병풍)을 활용한 게이미피케이션을 핵심 차별점으로, 유저가 미션을 수행할수록 전통 회화가 점차 완성되는 독창적인 경험을 제공합니다.

### 1.1 제품 비전

교환학생 경험을 **단순한 학업 한 학기**에서 **인생을 정의하는 문화적 여정**으로 전환하고, 귀국 후에도 한국과의 긍정적 연결고리를 유지합니다.

### 1.2 핵심 성과 지표 (MVP 성공 기준)

| 지표 | 목표 | 측정 방법 |
| --- | --- | --- |
| 다운로드 수 (출시 후 6개월) | 1,000+ | App Store / Google Play 분석 |
| 미션 완료율 | Have To 미션 60% 이상 | PostHog `mission_complete` / `missionsForHousing(housing).length` |
| D7 리텐션 | 40% 이상 | PostHog cohort retention |
| D30 리텐션 | 25% 이상 | PostHog cohort retention |
| 앱스토어 평점 | 4.5 이상 | 스토어 리뷰 |
| **(신규)** Crash-free 사용자 | 99.5% 이상 | Firebase Crashlytics |
| **(신규)** 콜드스타트 P75 | ≤ 3.0초 (iPhone 13 기준) | Firebase Performance Monitoring |
| **(신규)** 푸시 권한 grant율 | 60% 이상 | PostHog `push_permission_state` |

### 1.3 용어집 (Glossary) — 신설

| 용어 | 정의 |
|---|---|
| **Have-To 미션** | 팀이 사전에 큐레이션한 50개의 필수 미션 (§7.1) |
| **Want-To 버킷** | 유저가 직접 만드는 개인 버킷리스트 (§7.2) |
| **병풍 (Byeongpung)** | 8폭 한국 전통 회화 게이미피케이션 표면 (§6) |
| **패널 (Panel)** | 병풍의 1폭. 약 6개 완료마다 1폭 언락 |
| **시대 (Era)** | 조선/신라/고려 세 가지 시각 테마 |
| **페이즈 (Phase)** | 입국 전 → 첫 주 → 거주 → 출국 전 4단계 |
| **KST** | Korea Standard Time (UTC+9). 모든 시간 계산의 기준 (ADR-0022) |
| **claimPanelUnlock** | 패널 언락 1회성 발화 가드 (`src/lib/notifications.ts`, ADR-0009) |
| **isDevMock** | 개발용 Firebase bypass 분기 (`__DEV__`-only, ADR-0006) |
| **ADR** | Architecture Decision Record. `docs/adr/` 참조 |

---

## 2. 타겟 사용자

### 2.1 1차 타겟

서울 소재 대학교 교환학생. 체류 기간 약 1학기(4개월). 연령대 19~26세, 디지털 네이티브, 영어 사용자.

### 2.2 2차 타겟

- 워킹홀리데이 비자 소지자
- 단기 어학연수생

### 2.3 3차 타겟 (향후 확장)

- 한국 장기 체류 외국인
- 1년 이상 학위과정 유학생

### 2.4 시장 배경

- 한국 내 외국인 유학생 약 20만 명 돌파, 매년 증가 추세
- 3~12개월 체류 교환학생에 특화된 앱이 현재 부재
- 정보가 페이스북 그룹, 레딧, 블로그 등에 파편화되어 있음
- 단일 플랫폼으로 교환학생 생활 전반을 커버하는 기회

---

## 3. 수익 모델

### 3.1 MVP: 유료 다운로드

App Store 및 Google Play에서 $2~3 USD 유료 앱으로 출시합니다. MVP에서는 인앱결제 구현 복잡도를 피하기 위해 단순 유료 다운로드 모델을 채택합니다.

### 3.2 향후: B2B 화이트라벨

앱이 시장에서 검증된 후, 대학교에 공식 오리엔테이션/정착 도구로 화이트라벨 버전을 제공하는 B2B 모델을 추진합니다.

---

## 4. 온보딩 및 유저 플로우

### 4.1 인증 (개정 — ADR-0013, ADR-0014)

| 프로바이더 | 상태 | 비고 |
|---|---|---|
| **Apple Sign-In** | MVP 발효 | iOS 앱스토어 정책 필수. nonce + `OAuthProvider.credential('apple.com', token)` |
| **Google Sign-In** | **MVP 후속** (OAuth 클라이언트 발급 후) | `CLAUDE.md` NEVER #12로 placeholder 보호 중. ADR-0013에 활성화 plan 명시 |
| **익명 인증** | **명시적 폐기** | 4개월 artifact promise (병풍)와 충돌 → ADR-0014 |
| **이메일/패스워드** | 미지원 | 향후 검토 없음 |

#### 4.1.1 인증 실패 분기 (신설)

| 케이스 | 동작 |
|---|---|
| 사용자가 Apple 시트 취소 | 에러 표시 없음. sign-in 화면 유지 |
| `identityToken` 누락 | `showOperationError('sign in', 'No identity token')` |
| nonce 불일치 | `showOperationError('sign in', error)` |
| Firebase auth 네트워크 실패 | `showOperationError('sign in', error)` + 자동 재시도 안 함 (사용자 trigger) |
| Apple ID 잠금 | Apple SDK가 throw → `showOperationError` |
| (Google 활성화 후) `SIGN_IN_CANCELLED` | quiet 처리 |
| (Google 활성화 후) `PLAY_SERVICES_NOT_AVAILABLE` | 안내 alert + Settings deep-link |
| `ensureUserDocument()` Firestore write 실패 | Round 2 fix: try/catch 추가, Crashlytics 기록, user 상태 유지하여 사용자가 앱 내에서 재시도 가능 |

### 4.2 프로필 설정

인증 후 다음 정보를 입력합니다:

| 항목 | 입력 방식 | 세부사항 | 유효성 (4.2.1) |
| --- | --- | --- | --- |
| 이름 | 텍스트 입력 | 표시 이름 | 1~50자, trim |
| 대학교 | 드롭다운 / 검색 | MVP에서는 서울 소재 9개 대학교 (`src/data/universities.ts`) | 미선택 시 진행 불가 |
| 체류 유형 | 선택 | 교환학생 (1학기/2학기/1년) 또는 유학생 | enum 강제 |
| 주거 유형 | 선택 | 기숙사 또는 자취 | enum 강제 — `appliesTo` 미션 필터에 직결 (ADR-0010) |
| **(신규)** 도착일 | 캘린더 | `arrivalIso` | `validateDates` (§5.6) 통과 필수 |
| **(신규)** 출발일 | 캘린더 | `departureIso` | 도착일 > 출발일 거부, 도착일 1년 과거 / 출발일 2년 미래 거부 |

#### 4.2.1 유효성 검사 규칙 (신설)

`src/lib/validation.ts`의 `validateDates(arrivalIso, departureIso)`가 반환하는 에러 코드 = UI 메시지 매핑:

| 코드 | UI 메시지 |
|---|---|
| `arrival_required` | "Please select your arrival date." |
| `departure_required` | "Please select your departure date." |
| `arrival_invalid` | "Arrival date is invalid." |
| `departure_invalid` | "Departure date is invalid." |
| `arrival_after_departure` | "Arrival must be before departure." |
| `arrival_too_far_past` | "Arrival date is more than a year ago." |
| `departure_too_far_future` | "Departure date is more than two years away." |

### 4.3 시대 테마 선택

유저는 3개의 한국 역사 시대 테마 중 하나를 선택합니다. 이 선택은 앱 전체의 시각적 아이덴티티를 결정합니다:

| 시대 | 미술 양식 | 병풍 그림 | 시각적 정체성 |
| --- | --- | --- | --- |
| 신라 | 사신수 (四神獸) | 청룡, 주작, 백호, 현무 모티프 | 금동 질감, 경주 풍 패턴 |
| 고려 | 불화 (佛畫) | 관세음보살도 등 불교 회화 | 비색 청자 색감, 불교 문양 |
| 조선 | 궁중장식화 / 민화 | 궁중장식화 또는 민화 완성 | 한옥 질감, 수묵 느낌 |

시대 선택 후 별도 튜토리얼 없이 바로 1페이즈로 진입합니다. **시대는 언제든 More 탭에서 변경 가능**하며, 변경 시 완료한 미션 카운트는 보존, 병풍 PNG만 새 시대 자산으로 swap됨 (`CLAUDE.md` MUST #9).

### 4.4 온보딩 실패/중단 케이스 (신설)

| 상황 | 동작 |
|---|---|
| 사용자가 도착일 화면에서 앱 강제 종료 | 다음 부팅 시 `useProfile` snapshot으로 어디까지 입력되었는지 복원, 미입력 화면부터 재개 |
| Firestore 오프라인 중 프로필 저장 | MMKV 즉시 반영 + Firestore queue. 재연결 시 sync (ADR-0022 server-truth) |
| 사용자가 시대 화면에서 시대 선택 안 하고 종료 | Phase 1로 진입하되 era 미설정 상태 — 첫 화면에서 era 선택 prompt |
| Apple ID 잠금/제재 (재시도 불가능) | sign-in 화면에 "Try again later" + Google 후속 활성화 시 대체 경로 안내 |
| 사용자가 미성년 신호 (Apple Sign-In 응답에서 age class) | MVP 미처리 — V2.0에서 부모 동의 흐름 검토 |

### 4.5 Empty state 정책 (신설 — ADR-0027, `docs/EMPTY_STATES.md`)

신규 사용자가 처음 진입하는 모든 "0" 상태(미션 0개 완료, 버킷 0개, 갤러리 0장, 병풍 0%)는 K-Journey의 첫인상이다. 일관된 패턴이 없으면 화면마다 표류하므로, 모든 empty state는 다음 세 슬롯으로 고정된다.

1. **아이콘** (필수): Lucide 단일 글리프 48×48 pt를 화면 카테고리 색으로 tint. 갤러리·병풍 같은 브랜드 결정적 모먼트는 minhwa motif 사용. 일러스트레이션·사진·이모지 금지.
2. **메시지** (필수): 1줄 ≤ 9 단어의 사실 진술. 상태를 묘사하되 사용자를 비난하지 않음. 영어 first (ADR-0018).
3. **CTA** (선택): 최대 1개. 다음 액션이 화면 밖으로 나가야 한다면 생략. 두 개 금지.

**보이스 룰** (factual):
- ✅ "No missions completed yet" — 상태 진술
- ❌ "Oops, you haven't done anything!" — 사용자 비난
- ✅ "Your gallery starts when you complete your first mission" — 미래 상태 투영
- ❌ "Nothing to see here 😅" — 자기비하 + 이모지

**화면별 사양은 `docs/EMPTY_STATES.md`에 화면 단위로 명세** (home / bucket list / bucket detail / gallery / byeongpung / search / universities). 향후 공유 primitive `<EmptyState />` (`src/components/ui/`)로 수렴.

**측정**: PostHog `screen_empty_view` event — empty state가 뜬 화면이 5초 이상 무인터랙션이면 기록. D7/D30에서 empty state 잔여율을 모니터링해 카피·CTA 개선의 신호로 사용.

### 4.6 Onboarding aha-moment / first-launch tour (신설)

온보딩 마지막 단계(시대 선택 후) 사용자가 home에 진입하기 전, **첫 launch 1회**에 한해 짧은 brand reveal 카드를 표시한다. 목적: "왜 이 앱이 멋있는가"를 5초 안에 체감시켜 D1 잔존율을 높임.

| 슬롯 | 내용 |
|---|---|
| 화면 | Full-screen modal, hanji 배경, 중앙 정렬 |
| 시각 자료 | 선택한 era의 byeongpung **panel 1만** 점진적 reveal (clipPath circle 0→100%, 1.2s ease-in-out — `useReduceMotion()=true` 시 즉시 표시) |
| 헤드라인 | `Your K-Journey begins` (sentence case, 24pt `palette.meok`) |
| 본문 | `Complete missions over four months. Watch your byeongpung (병풍) reveal panel by panel.` |
| CTA | `See my missions` (single primary button, `palette.dancheong`) |

**Trigger 조건**: MMKV `tour:firstLaunch:shown !== true` AND 온보딩 완료 직후. CTA 탭 시 `tour:firstLaunch:shown=true` 영구 저장. 다시 표시 안 됨 (개발 mock의 `[Dev] Fresh onboarding` 버튼만 reset).

**측정**: PostHog `aha_moment_shown` (자동 발사) + `aha_moment_dismissed` (CTA 탭 시간 기록). 평균 dismiss time < 8초 목표.

**부분 입력 복원 메시지** (§4.4 cross-ref): 사용자가 dates 화면에서 강제 종료 후 재개 시, 시대 선택 화면 이전이라면 toast `Picking up where you left off.` (4초, dismissable). 이전 입력은 `useProfile` snapshot으로 자동 복원됨.

### 4.7 프로필·날짜·시대 수정 UX (신설)

온보딩 후 사용자는 Settings → Profile에서 다음을 수정할 수 있다 (ADR-0032, `docs/SETTINGS.md` §3 참조):

| 수정 | 영향 | 사용자 surface |
|---|---|---|
| 이름 / 대학교 / 주거 형태 | 즉시 반영, 화면 refresh | Toast `Profile updated.` (4초) |
| 도착일·출발일 | Phase / D-Day / 푸시 스케줄 재계산 | Confirm dialog `Update your journey dates?` body `Your phase, missions, and reminders will be recalculated.` Buttons `Cancel` / `Update`. 적용 후 toast `Dates updated. Reminders rescheduled.` Phase가 역행하면 (예: 출발일 연장으로 phase 3→2) 추가 modal `Phase changed` body `Your new dates put you in Phase ${newPhase}. Existing missions stay completed.` 표시. |
| 시대 (era) | Byeongpung PNG swap (CLAUDE.md MUST #9 — 진행도 보존) | Picker modal에 era 미리보기 (emblem + panel 1 thumbnail). 선택 후 CTA `Use this era`. 적용 후 byeongpung 즉시 swap. |

**검증·복구**:
- Date validation은 `validation.ts:validateDates`로 통과 (도착일 > 출발일 / 7일 미만 span 거절).
- 실패 시 T1 토스트 (`docs/ERROR_MESSAGES.md` `validation-arrival-after-departure`, `validation-departure-too-soon`).
- Firestore 쓰기 실패는 ADR-0012 `showOperationError` 거쳐 T2 modal.

**보이스 룰**: 모든 카피는 `docs/MICROCOPY.md` 따름 — sentence case · 영어 first · 비난 없음.

---

## 5. 페이즈 시스템

앱은 4단계 여정 모델로 운영됩니다. 페이즈 전환은 온보딩 시 입력한 날짜를 기반으로 **KST 자정 기준 자동 전환**됩니다 (ADR-0022). 이전 페이즈 콘텐츠는 전환 후에도 계속 접근 가능합니다.

### 5.1 페이즈 개요

| 페이즈 | 이름 | 시점 (KST 기준) | 핵심 포커스 |
| --- | --- | --- | --- |
| 1페이즈 | 입국 전 | `kstNow < arrival` | 준비 체크리스트, 짐 가이드, 필수 정보 |
| 2페이즈 | 첫 주 | `arrival ≤ kstNow ≤ arrival + 7d` | 정착 태스크, 필수 구매, 캠퍼스 오리엔테이션 |
| 3페이즈 | 거주 | `arrival + 8d ≤ kstNow ≤ depart - 21d` | 탐험 미션, 문화 체험, 여행 |
| 4페이즈 | 출국 전 | `depart - 20d ≤ kstNow ≤ departure` | 출국 준비, 작별 활동, 추억 정리 |

수동 override(`setPhaseOverride(p)`)가 있으면 자동 계산을 무시하고 override를 반환 (`CLAUDE.md` Phase computation contract).

### 5.2 1페이즈: 입국 전 (8~10개 미션)

- 짐 체크리스트 완료 (계절별)
- 기숙사 반입 금지 물품 확인 (학교별)
- 한국행 항공편 수하물 규정 확인
- 비자 및 필요 서류 준비
- 교환 대학 오리엔테이션 일정 확인
- 한국 날씨 확인 및 옷 준비
- 공항 → 학교 교통편 확인
- 비상연락처 저장
- 한국어 기본 인사말 3개 배우기
- 필수 한국 앱 다운로드 (카카오톡, 네이버 지도 등)

### 5.3 2페이즈: 첫 주 (10~12개 미션)

- 교통카드(T-money) 구매
- 유심 / eSIM 개통
- 외국인등록증 신청
- 은행 계좌 개설
- 기숙사 체크인 완료 (`appliesTo: 'dormitory'`)
- 캠퍼스 투어 및 주요 시설 파악
- 근처 마트 및 편의점 파악
- 분리수거 방법 익히기
- 배달 앱 설치 (배민 또는 쿠팡이츠)
- 학교 주변 맛집 첫 방문
- 한국인 친구 1명 만들기
- 캠퍼스까지 대중교통 노선 마스터
- (자취) 빨래방 위치 파악 (`appliesTo: 'off-campus'`)
- (자취) 공과금/관리비 납부 방법 확인 (`appliesTo: 'off-campus'`)

### 5.4 3페이즈: 거주 (20~25개 미션)

핵심 탐험 페이즈로, 1학기(4개월) 교환학생 기준으로 설계되었습니다. 4개 카테고리(§7.1 참조).

**음식 & 식도락:** 전통시장 방문(광장시장/남대문/통인시장), 길거리 음식(떡볶이/호떡/순대), K-Food 도전(번데기/산낙지), 삼겹살, 편의점 식사 조합, 전통 찻집.

**여행 & 액티비티:** 한강 피크닉 & 치맥, 서울 산 등산(북한산/관악산/인왕산), KTX 당일/주말 여행(부산/경주/전주/강릉), 한국 축제(보령 머드/진해 벚꽃/부산 불꽃), 찜질방, 노래방, PC방, 야시장/포장마차.

**문화 체험:** 한복 입고 궁궐 방문(경복궁/창덕궁), 국립중앙박물관, 개인 도장 만들기, 템플스테이, 한국 영화 극장 관람, K-pop/문화 공연.

**생활 정착:** 버스 환승 시스템 마스터, 한국어로 배달 주문, 한국 카페 문화(스터디 카페/테마 카페), 한국 의료 시스템(병원/약국), 집에서 한국 요리 만들기.

### 5.5 4페이즈: 출국 전 (5~7개 미션)

- 귀국국 면세 한도 및 세관 신고 확인
- 선물 리스트 작성 및 쇼핑
- 출국 짐 체크리스트 완료 (목적지국 수하물 규정)
- 기숙사 퇴실 절차 진행 (`appliesTo: 'dormitory'`)
- (자취) 임대 종료 / 보증금 환급 (`appliesTo: 'off-campus'`)
- 한국 친구들에게 작별 인사 (송별회)
- 마지막 한국 음식 먹기
- 앱 내 추억 타임라인 완성

### 5.6 날짜 엣지 케이스 (신설 — ADR-0022)

| 케이스 | 동작 |
|---|---|
| **도착일 == 출발일** | `validateDates` 통과, phase 계산 결과 phase 2 (first week within range). 사실상 "당일 여행" 사용자를 위한 허용. |
| **도착일 > 출발일** | `validateDates`에서 `arrival_after_departure` 반환 → 진행 차단 + 에러 메시지 |
| **도착일이 과거(이미 한국에 있음)** | `kstNow > arrival` → 자동으로 phase 2/3/4 진입. 사용자가 후행 등록한 케이스 지원 |
| **도착일이 1년 이상 과거** | `arrival_too_far_past` → 차단 (PRD MVP 범위 밖) |
| **출발일이 2년 이상 미래** | `departure_too_far_future` → 차단 (1년 유학생 V2 범위) |
| **출발일이 이미 지남 (negative D-Day)** | phase 4 유지, gallery prompt 노출 (§10.3) |
| **체류 기간 < 7일** | phase 2 영역 안에 phase 4 영역이 겹침 — `calcPhase`의 if 순서로 phase 2가 우선 |

### 5.7 타임존 정책 (신설 — ADR-0022)

- **KST(UTC+9) 단일 기준.** 사용자가 어디에 있든 phase 경계는 KST 자정에 전환.
- **DST 없음** (한국 표준시는 DST 미적용). 사용자가 DST 적용 지역에 있어도 KST 변환으로 보호.
- 구현: `src/lib/dates.ts`의 `kstNow()`, `toKstStartOfDay()`, `kstDifferenceInDays()`.
- 미션 완료 timestamp는 Firestore `serverTimestamp()` 사용 → 시계 변조 무력화.
- 시계 변조 감지: `src/lib/clockGuard.ts`가 ±2일 이상 점프 시 Crashlytics + telemetry 기록(UI 차단 없음).

---

## 6. 게이미피케이션: 병풍 시스템

### 6.1 핵심 컨셉

각 유저는 하나의 8폭 병풍을 보유합니다. 이 병풍은 유저의 전체 K-Journey를 시각적으로 표현하는 핵심 요소입니다. 미션(Have-To 및 Want-To)을 완료할 때마다 병풍의 폭이 하나씩 열리며, 선택한 시대 테마에 맞는 전통 한국 회화가 점점 드러납니다.

### 6.2 패널 언락 로직

총 약 50개의 Have-To 미션 기준, 각 패널은 약 6~7개의 미션 완료 시 열립니다 (Want-To 버킷 항목도 카운트 합산 — ADR-0011):

| 패널 | 언락 시점 (`total`) | 시각적 연출 |
| --- | --- | --- |
| 1폭 | total = 6 | 안개/먹물 번짐 효과에서 좌측 끝 그림이 드러남 |
| 2폭 | total = 12 | 두 번째 구간 공개 |
| 3폭 | total = 18 | 세 번째 구간, 그림의 서사가 형성되기 시작 |
| 4폭 | total = 24 | 중앙부, 핵심 이미지 가시화 |
| 5폭 | total = 30 | 중간 지점 통과, 그림 이야기 전개 |
| 6폭 | total = 36 | 세부 디테일 풍부해짐 |
| 7폭 | total = 42 | 거의 완성 단계 |
| 8폭 | total = 48 | 완성된 걸작 + 금색 낙관(도장) 추가 |

`total`은 `aggregateCompletions(missions, buckets)`로 계산 (ADR-0011, `src/lib/completions.ts`).

각 패널의 부분 reveal 공식 (CLAUDE.md MUST #11):
```
panelReveal(i) = clamp((total - i * 6) / 6, 0, 1)
```

### 6.3 시대별 병풍 그림

- **신라:** 사신수(청룡, 주작, 백호, 현무)가 8폭에 걸쳐 묘사, 경주 시대 금동 문양 배경
- **고려:** 불화(관세음보살도 또는 극락 장면)가 점진적으로 드러남, 비색 청자 색감
- **조선:** 궁중장식화 또는 민화(화조화, 책가도 등) 완성, 한옥 질감과 수묵 미학

24개 PNG 자산(3시대 × 8폭) — ADR-0008.

### 6.4 완성된 병풍 활용

- 고해상도 이미지로 폰 갤러리에 저장 (`saveByeongpungImage`)
- 휴대폰 잠금화면 배경으로 설정 (사용자 자체 작업)
- 프로필 사진으로 사용 (단일 폭 크롭) — V1.1+
- SNS 공유 (인스타그램 등에 파노라마 또는 카드 형식) — `shareByeongpungImage`
- 앱 내 갤러리에 보관 (출국 후에도 열람 가능)

### 6.5 패널 언락 1회성 보장 (신설 — ADR-0009)

`claimPanelUnlock(n)` 가드로 같은 패널이 두 번 발화되지 않음:
- MMKV `firedPanelUnlocks: number[]` 영구 기록.
- 미션 토글-back으로 동일 패널이 재조건 충족해도 false 반환 → 오버레이/이벤트/알림 모두 silent.
- dev-mock signOut 시 reset (ADR-0006).
- 다른 디바이스에서 같은 미션 완료 시: 서버 카운트는 동일하지만 *해당 디바이스의 MMKV*는 비어있으므로 신규 발화. **의도된 동작** — 패널 언락은 디바이스별 감각 경험.

### 6.6 미션 취소 시 카운트 흐름 (신설)

| 시퀀스 | 결과 |
|---|---|
| 미션 완료 → 패널 N 언락 발화 (true) | total = N×6, firedPanelUnlocks += N |
| 같은 미션 미완료(unmark) | total = N×6 − 1, panel reveal % 감소 |
| 다시 완료 | total = N×6, `claimPanelUnlock(N)` → false (이미 fired) → overlay/이벤트/알림 발화 안 함 |
| 다른 미션으로 N×6 회복 | 동일하게 false (panel N의 firedPanelUnlocks 항목 그대로) |

### 6.7 PNG 로드 실패 시 시각적 fallback (신설 — ADR-0008, Part E.6)

`src/components/byeongpung/PanelImage.tsx` (신규):
- `<Image source={...} onError={() => setFailed(true)} />`
- 실패 시 시대별 ink-color (`era.inkColor`) solid 배경으로 fallback.
- reveal % opacity는 fallback에도 동일 적용 → 사용자 입장에선 "단색 패널"로 인식되지만 진도는 계속.

---

## 7. 미션 시스템

### 7.1 Have-To 미션 (큐레이션)

K-Journey 팀이 사전에 큐레이션한 필수 미션입니다. 4개 카테고리로 구성됩니다:

| 카테고리 | 설명 | 미션 예시 |
| --- | --- | --- |
| 생활 정착 | 일상생활 정착을 위한 실용적 과제 | 교통카드 구매, 분리수거, 은행 계좌 개설 |
| 음식 & 식도락 | 한국 음식 문화 체험 | 산낙지 도전, 전통시장 방문, 삼겹살 |
| 여행 & 액티비티 | 탐험과 모험 활동 | 한강 피크닉, 등산, KTX 여행, 찜질방 |
| 문화 체험 | 깊은 문화 몰입 경험 | 한복+궁궐, 템플스테이, 도장 만들기 |

미션 완료는 완료 버튼 탭으로 처리됩니다. MVP에서는 사진 인증이 필요하지 않습니다.

`Mission` 타입과 `appliesTo` 필터 — `src/data/missions.ts` + ADR-0010.

### 7.2 Want-To 미션 (유저 생성 버킷리스트)

유저가 직접 테마를 정해 만드는 개인 버킷리스트입니다. 생성 과정:

- 유저가 새로운 버킷리스트 테마 생성 (6개 사전 템플릿 — `src/data/bucketTemplates.ts`)
- 자유 텍스트로 개별 항목 추가 (최대 30개)
- 테마에 맞는 민화 스타일 PNG가 자동 매칭
- 항목 완료 시 완료 비율에 따라 해당 그림이 점진적으로 완성

Want-To 미션 완료 또한 병풍 패널 언락에 반영됩니다 (`aggregateCompletions` — ADR-0011).

### 7.3 D-Day 카운터 & 우선순위 시스템

앱은 온보딩 시 입력한 출국일을 기반으로 잔여일을 계산합니다. **KST 자정 기준** (ADR-0022). Have-To 미션은 페이즈 관련성과 긴급도에 따라 자동으로 우선순위가 조정됩니다.

음수 D-Day(출발일 지남): "Departed N days ago" 표시 (§10.2).

### 7.4 알림 & 리마인더 (CLAUDE.md NEVER #15 — 행동 트리거만)

앱이 자동으로 푸시 알림을 발송합니다:

- D-Day 마일스톤 알림 (D-30, D-14, D-7) — KST 9am 발사 (자정 회피)
- 페이즈 전환 알림 (1→2, 2→3, 3→4)
- 병풍 패널 언락 시 축하 알림 (1회성, `claimPanelUnlock`)

**금지**: 일일/주간/마케팅 푸시. ADR-0015.

### 7.5 푸시 권한 라이프사이클 (신설)

| 상태 | 진입 조건 | UI 동작 |
|---|---|---|
| `undetermined` | 신규 사용자, 아직 prompt 안 함 | 온보딩 dates.tsx 완료 후 자동 prompt |
| `granted` | 사용자 허용 | `rescheduleAllNotifications` 호출 |
| `denied` | 사용자 거부 | 안내 toast + Settings deep-link 옵션 제공 |
| `denied → granted` (Settings에서) | 사용자가 OS 설정에서 허용 | `usePushPermissionWatcher`가 foreground 진입 시 감지 → 자동 reschedule |
| `granted → denied` (Settings에서) | 사용자가 OS 설정에서 회수 | `usePushPermissionWatcher` 감지 → 다음 prompt 자제 |
| 권한 변경 감지 못 함 | OS 권한 변경 후 앱 미실행 | 다음 cold start 시 `getPermissionState`로 동기화 |

### 7.6 알림 스케줄 엣지 케이스 (신설)

| 케이스 | 동작 |
|---|---|
| 도착/출발일 변경 | `rescheduleAllNotifications` 자동 호출 — 기존 알림 cancel 후 재스케줄 |
| `scheduleNotificationAsync` 실패 (OS 한계, 100개 초과) | catch → Crashlytics 기록, 사용자에게는 안내 안 함 (silent) |
| D-30 알림 발사일이 이미 과거 | skip — D-14, D-7부터 스케줄 |
| 출발일이 7일 이내 | D-30/14 skip, D-7만 (이미 지났으면 그것도 skip) |
| FCM 토큰 갱신 | `expo-notifications`가 자동 처리 (Expo가 백그라운드에서 갱신) |
| 알림 탭 → 앱 열림 | deep link 없음 (MVP), Home으로 진입 |

### 7.7 D-Day 마일스톤 KST 자정 발사 (신설 — ADR-0022)

알림은 `scheduleAtKstMidnight(date, daysBefore)`로 스케줄링:
- `daysBefore=30/14/7`
- `scheduleAtKstMidnight`은 KST 자정이 아니라 **KST 9:00 AM**에 발사 — 사용자 수면 방해 회피.
- 사용자가 시드니(UTC+11)에 있을 경우, 알림은 시드니 시간 11:00 AM에 도착 (KST 9 AM == 시드니 11 AM).

### 7.8 푸시 알림 카피 템플릿 (신설 — ADR-0029, `docs/PUSH_COPY.md`)

§7.4가 알림의 **시점**을 규정한다면, §7.8은 **무엇을 말하는지**를 규정한다. 모든 푸시 카피는 단일 카탈로그 (`src/lib/notifications/copy.ts`)에서 import하고, call site에서 inline 작성하지 않는다 (ADR-0029).

| 코드 | Title (≤ 30 chars) | Body (≤ 110 chars) | 발사 조건 |
|---|---|---|---|
| `dDay30` | `30 days to your K-Journey` | `Phase 1 missions are ready. Open to begin.` | `today + 30 === departure` AND 도착 전 |
| `dDay14` | `Two weeks to departure` | `Time to wrap up Phase 3. Open the journey.` | `today + 14 === departure` AND 도착 후 |
| `dDay7` | `One week left` | `Phase 4 awaits. Save what you don't want to forget.` | `today + 7 === departure` AND 도착 후 |
| `phase2Start` | `You've arrived` | `Phase 2 is unlocked. Your first week starts here.` | phase 1→2 전환 |
| `phase3Start` | `Settling in` | `Phase 3 missions are now in your home.` | phase 2→3 전환 |
| `phase4Start` | `Final stretch` | `Phase 4 — gather what you want to remember.` | phase 3→4 전환 |
| `panelUnlock(n)` | `Panel ${n} of 8 unlocked` | `Open the byeongpung to see your scroll grow.` | `claimPanelUnlock(n) === true` (ADR-0009) |

**보이스 룰**:
- 영어 only (lock-screen 문자 budget 보호 — 한글 괄호 미적용).
- 이모지 금지, urgency-scare 카피 금지, 시간대 인사 ("Good morning") 금지 — KST 9 AM이 사용자 위치마다 다른 시간으로 도착하기 때문.
- 사용자 위치별 KST 9 AM 도착 시각: 서울/도쿄 09:00, 시드니 11:00, 런던 00:00, 뉴욕 19:00 (전날), SF 16:00 (전날). MVP는 KST 고정 — 야간 수신 우려 사용자는 OS 설정에서 알림 OFF가 권고 회로. **V2** 백로그에 `notificationTime ∈ {KST 09:00 (default), local 09:00}` 사용자 선호도 옵션 등록 (§13.2).

**권한 priming UI**: OS 푸시 권한 prompt는 **무조건** priming 카드 거친 후에만 발사 (ADR-0029 Part B). priming 카드가 5개 milestone slot (D-30 / D-14 / D-7 / phase changes / panel unlocks) 을 명시적으로 enumerate해 신뢰 형성 — "We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever." PRD §1.2의 KPI `push_permission_state ≥ 60%` 달성을 위함.

전체 카탈로그·테스트 플랜·확장 절차는 `docs/PUSH_COPY.md` 참조.

---

## 8. 대학교별 맞춤 콘텐츠

유저가 온보딩 시 대학교를 선택하면, 해당 학교에 맞는 정보가 제공됩니다. MVP에서는 서울 소재 9개 대학교를 지원합니다 (`src/data/universities.ts`).

### 8.1 대학별 제공 데이터

- 기숙사 반입 금지 물품 목록 (학교별 정책)
- 기숙사 입퇴실 절차
- 캠퍼스 맵 및 주요 시설 위치
- 학교 주변 맛집 및 편의점 추천
- 캠퍼스 오가는 대중교통 노선

### 8.2 주거 유형별 콘텐츠 분기 (ADR-0010)

| 콘텐츠 영역 | 기숙사 | 자취 |
| --- | --- | --- |
| 1페이즈 짐 가이드 | 기숙사 반입 금지 물품 강조 | 자취 생활 필수템 안내 |
| 2페이즈 정착 | 기숙사 체크인, 와이파이, 열쇠 수령 | 임대 팁, 공과금, 빨래방 위치 |
| 4페이즈 출국 | 기숙사 퇴실 절차 | 임대 종료, 보증금 환급 |
| 상시 팁 | 기숙사 규칙, 공동생활 에티켓 | 마트 위치, 요리 기초, 쓰레기 배출 |

`missionsForHousing(housing)` 헬퍼가 `appliesTo` 미설정(=both) + `appliesTo` 일치 미션만 반환.

### 8.3 여정 중 주거 변경 시 미션 재계산 (신설)

| 시퀀스 | 결과 |
|---|---|
| 기숙사에서 자취로 변경 | `missionsForHousing('off-campus')` 새 리스트 적용. 이미 완료한 기숙사-전용 미션은 카운트에 *남음* (역사 보존). 새 자취-전용 미션이 To-do로 노출됨. |
| 분모 변경 | "X of Y" 표기에서 Y(`missionsForHousing(housing).length`)가 변경되므로 진도 % 가 일순간 변동 — 의도된 동작 |
| 패널 언락 임계치 재계산 | 임계치는 절대값(6/12/18/...). housing 변경은 영향 없음 |
| 잔존 dormitory 미션이 분모에서 빠짐 | 카운트는 보존 (사용자의 노력 인정), 분모만 변경 |

---

## 9. 긴급 상황 가이드

FAQ/리스트 형식으로 필수 긴급 정보를 제공하는 정적 참조 섹션입니다. **모든 페이즈, 모든 화면에서 상시 접근 가능** (`CLAUDE.md` MUST #9). Firestore Rules에서 `emergency/{id}`는 비로그인 read도 허용 (ADR-0021) — 친구의 휴대폰을 빌려 응급상황에 사용하는 시나리오 대응.

### 9.1 제공 내용

- 긴급 전화번호: 112 (경찰), 119 (소방/구급), 1345 (출입국/외국인 상담)
- 영어 진료 가능 병원/약국 안내
- 분실물 신고 절차
- 대사관/영사관 연락처
- 긴급 상황용 기본 한국어 표현

`src/data/emergency.ts` (정적 — V1.1+에서 Firestore로 이동 검토).

---

## 10. 출국 후 경험

### 10.1 갤러리 모드

유저의 출국일이 지나면(`kstNow > departure`), 갤러리 모드로의 전환을 **사용자가 수락**해야 발효 (`CLAUDE.md` NEVER #14):

- **완성된 병풍 갤러리:** 완성(또는 부분 완성) 그림 열람 및 재공유
- **추억 타임라인:** 완료한 미션의 날짜별 기록
- **SNS 공유:** 그림과 타임라인을 공유 가능한 이미지로 내보내기

커뮤니티 기능(멘토링, 동문 연결 등)은 V2.0에서 계획 중입니다.

### 10.2 음수 D-Day 표시 규칙 (신설)

| 케이스 | 표기 |
|---|---|
| `dday > 0` | "D-30", "D-7", "D-1" |
| `dday === 0` | "Today" |
| `dday < 0` | "Departed 5 days ago" (절댓값 사용) |

DDayBanner는 음수에서도 페이즈 4 컬러 유지 — 사용자가 출국 후에도 K-Journey와의 정서적 연결 유지.

### 10.3 갤러리 자동 전환 prompt 규칙 (신설)

`CLAUDE.md` NEVER #14에 따라 **자동 전환 금지**:

```
출국일 경과 감지 → JourneyCompletePrompt 컴포넌트 표시
"Your journey is complete — open your gallery?"
  [Open gallery]  [Stay in journey view]
```

- 사용자가 "Stay" 선택 시 MMKV `KEYS.galleryDismissed = true`. 다시는 prompt 안 함.
- "Open gallery" 선택 시 `/gallery`로 이동.
- prompt를 한 번 본 후에도 More 탭 → "View gallery" 진입 가능.

---

## 11. 기술 아키텍처

### 11.1 기술 스택 (전면 재작성 — ADR-0001~0005)

| 구성요소 | 기술 | 선정 이유 (ADR) |
| --- | --- | --- |
| 프론트엔드 | React Native 0.76 + Expo SDK 52 (managed) | [ADR-0001](../docs/adr/0001-react-native-expo-over-flutter.md) — Flutter 대비 결정 기록 |
| 언어 | TypeScript strict | 타입 안정성 + Expo Router 호환 |
| 라우팅 | Expo Router (file-based) | ADR-0001 |
| Firebase SDK | `@react-native-firebase/*` (modular) | [ADR-0003](../docs/adr/0003-firebase-rn-modular-sdk.md) — Firebase web SDK 금지 |
| 인증 | Apple Sign-In (주축) + Google 후속 | [ADR-0013](../docs/adr/0013-apple-primary-google-deferred.md), [ADR-0014](../docs/adr/0014-anonymous-auth-removed.md) — 익명 인증 폐기 |
| DB | Cloud Firestore + offline persistence | last-write-wins (`serverTimestamp`), transaction for counters |
| 로컬 캐시 | MMKV | [ADR-0002](../docs/adr/0002-mmkv-over-hive-for-cache.md), [ADR-0023](../docs/adr/0023-mmkv-key-versioning-migration.md) |
| 푸시 | Expo Notifications + FCM | [ADR-0015](../docs/adr/0015-behavior-triggered-push-only.md) — 행동 트리거만 |
| 분석 (주축) | PostHog (US region) | [ADR-0004](../docs/adr/0004-posthog-primary-analytics.md) |
| 분석 (보조) | Firebase Analytics | [ADR-0005](../docs/adr/0005-firebase-analytics-secondary.md) — App Store/Play Console 펀널 + Crashlytics 상관 |
| 크래시 | `@react-native-firebase/crashlytics` | PII 마스킹 — §11.5 |
| 애니메이션 | Reanimated 3 + react-native-svg | worklet 인라인 규칙 [ADR-0019](../docs/adr/0019-reanimated-worklet-inline-rule.md) |
| 폰트 | Pretendard + Noto Serif KR | [ADR-0018](../docs/adr/0018-english-first-korean-parenthetical.md) |
| 디자인 시스템 | inline RN styles + design tokens | [ADR-0016](../docs/adr/0016-no-css-framework-inline-styles.md), [ADR-0017](../docs/adr/0017-design-token-only-colors.md) |
| 테스트 | Jest + custom mocks | [ADR-0020](../docs/adr/0020-jest-with-rn-mocks.md) |

### 11.2 오프라인 지원 (재작성)

| 시나리오 | 동작 | 충돌 정책 |
|---|---|---|
| 미션 완료 (오프라인) | MMKV 즉시 + Firestore offline queue | last-write-wins (`serverTimestamp` 우선) |
| 미션 완료 (재연결 시) | queue flush → snapshot 도착 → MMKV 갱신 | server-truth |
| 동시 디바이스 동일 미션 완료 | 둘 다 `set({completedAtIso: serverTimestamp()}, merge:true)` → idempotent | 두 번째 쓰기가 timestamp만 덮어씀 |
| 프로필 업데이트 (오프라인) | MMKV 즉시 + queue | last-write-wins |
| 유저 sign-out 중 큐 잔존 | flush 시도 후 sign-out. 다음 sign-in에서 동일 UID면 자동 재flush, 다른 UID면 폐기 (Round 2 후속: `clearOrphanQueueOnUidChange`) | UID 우선 |
| 시계 변조 후 미션 완료 | `serverTimestamp` 사용 → 가짜 D-Day 회피 | server-truth (ADR-0022) |
| MMKV 캐시 손상 | `getJson` returns null → DEV_MOCK fallback 또는 빈 상태 | 마이그레이션 러너가 backup→reset (ADR-0023) |
| Firestore Rules 거부 | 큐 entry permission-denied → Crashlytics 기록 | (Round 2 후속: 큐 에러 구독 + `showOperationError`) |

### 11.3 플랫폼 요구사항

- **iOS:** App Store 배포, 최소 iOS 15+
- **Android:** Google Play Store 배포, 최소 Android 10+
- **언어:** MVP는 영어만 지원 (§11.7)
- 양 플랫폼 동시 출시 (Apple 우선; Android는 Google Sign-In 활성화 후 — ADR-0013)

### 11.4 에러 핸들링 컨트랙트 (신설 — ADR-0012, 확장 — ADR-0028)

**기반 컨트랙트** (ADR-0012):
- **모든 async mutator는 `try/catch` 필수.** 실패 시 `showOperationError(action, e)` 호출 → Crashlytics 기록 + 사용자 surface. (`CLAUDE.md` MUST #17)
- **Silent 실패 금지**: empty catch (`catch {}`) 0건 목표. 의도적 무시는 *"intentional swallow: reason"* 주석 필수.
- **Crashlytics 기록 규칙**: `recordError(getCrashlytics(), err)`. PII 사전 마스킹 (§11.5).

**4-tier 결정 트리** (ADR-0028 — 기존 단일 Alert 패턴 확장):

| Tier | Trigger | 사용자 surface | 재시도 affordance | 예시 |
|---|---|---|---|---|
| **T1 — Toast** | 일회성·idempotent | 하단 토스트 (4–6초 + Retry 인라인 버튼) | 한 탭으로 같은 작업 재시도 | network offline, image-load-fail, quota transient |
| **T2 — Modal** | 데이터 손실 위험 / 다단계 | `Alert.alert` (`Try again` primary + `Discard` destructive) | 입력 보존된 채 재시도 | 버킷 생성+사진 업로드, 프로필 다중 필드 저장 |
| **T3 — Settings deep-link** | 권한 / OS 설정 필요 | `Alert.alert` (`Open Settings` + `Not now`) | OS 설정 진입 후 foreground watcher가 자동 재개 (ADR-0015 Part E.7) | camera/photos/notifications 권한 거부 |
| **T4 — App-level banner** | 시스템 outage / auth expired / clock-jump | `app/_layout.tsx`의 sticky banner | 원인별 액션 (sign-in / clock fix / wait) | auth-expired, clock-jump, server-side incident |

**에러 카피 카탈로그** (`docs/ERROR_MESSAGES.md`):
- 모든 사용자 향 카피는 `docs/ERROR_MESSAGES.md`의 마스터 표에서 가져옴. `showOperationError`는 `error.code` (또는 Firebase code 추론)로 카탈로그 row를 lookup하고, row의 `tier`에 따라 라우팅.
- 카탈로그는 9개 카테고리 (network · auth · firestore-saves · firestore-reads · validation · permissions · time/clock · media · system) 약 30개 코드를 포괄.
- 카피 보이스 룰은 `docs/MICROCOPY.md` §2 (factual · 비난 금지 · jargon 금지 · 이모지 금지 · urgency-scare 금지) 준수.

**기타 정책**:
- **Render 에러**: root `ErrorBoundary` + route-group별 `ErrorBoundary` (Round 2 완료).
- **권한 거부**: T3 라우팅 — 강제 종료 / blocking modal 금지.
- **네트워크 끊김**: 캐시 우선 표시 + T1 토스트 + Retry 버튼. 사용자 trigger가 기본, MMKV optimistic이 백업.
- **Test gate**: `__tests__/errorAlert.test.ts` — 카탈로그 모든 코드가 선언된 tier로 라우팅됨을 검증. `__tests__/errorCodes.test.ts` — 코드에서 참조되는 모든 에러 코드가 카탈로그에 문서화됨을 검증 (drift 방지).

### 11.5 보안 & 개인정보 (신설 — ADR-0021, `docs/SECURITY.md`)

| 항목 | 규칙 |
|---|---|
| Firestore Rules | 본인 `users/{uid}/**` 만 read/write. 공용은 read-only. 익명 reject. 파일: `firestore.rules` |
| Storage Rules | (V1.1) 본인 `users/{uid}/exports/{file}` 만 write |
| Crashlytics PII | `setUserId(uid)` 만 허용. displayName/email/좌표 금지 |
| PostHog PII | `distinctId = uid`. super-properties는 era/phase/university만. 메시지 본문 금지 |
| Secrets | `.env`, `GoogleService-Info.plist`, `google-services.json` 커밋 금지 (`CLAUDE.md` NEVER #16) |
| Prod 키 주입 | EAS Secrets |
| 비밀 키 회전 | 분기마다 Firebase API key 회전 (수동, `docs/OPERATIONS.md`) |

### 11.6 접근성 (신설 — ADR-0025, WCAG 2.1 AA 목표; 확장 v1.2)

| 항목 | 목표 | 검증 |
|---|---|---|
| 색상 대비 | 4.5:1 (본문), 3:1 (large) | DESIGN.md 토큰 검수 |
| 터치 타겟 | ≥ 44×44 pt | 모든 `<Pressable>` 검수 |
| 스크린 리더 | `accessibilityLabel` + `accessibilityRole` 의무 | VoiceOver QA (시나리오 5건, `docs/ACCESSIBILITY.md` §7) |
| Dynamic Type | iOS 시스템 텍스트 스케일 ±2 단계까지 무파괴 | 시뮬레이터 시각 회귀 |
| Reduce Motion | `useReduceMotion()` true → 미션 완료 4-stage choreography를 단일 cross-fade로 폴백 (아래 §11.6.1) | `AccessibilityInfo.isReduceMotionEnabled()` |
| Empty state a11y | `<EmptyState />`의 메시지가 `accessibilityLabel`로 첫 announcement (ADR-0027) | VoiceOver QA |
| Error surface a11y | T1 toast / T2 modal: `accessibilityLiveRegion="assertive"`. T4 banner: `accessibilityRole="alert"` (ADR-0028) | VoiceOver QA |
| 색맹 | 카테고리는 색 + 아이콘 동시 사용 | 매트릭스 검수 |
| Focus (외장 키보드) | iPadOS fallback | 검수 |

#### 11.6.1 Reduce Motion 폴백 명세 (확장 v1.2)

`useReduceMotion()` true인 경우, 아래 애니메이션이 정적 또는 짧은 cross-fade로 대체된다.

| 애니메이션 | Default (motion on) | Reduce Motion (motion off) |
|---|---|---|
| 미션 완료 4-stage choreography | cardSink (400ms) → inkRingOut (120ms) → panelReveal (800ms) → fadeUpIn (1000ms), 총 ~2.4s | 250ms cross-fade: 미션 카드가 사라지고 "Panel N unlocked" 텍스트가 페이드인. 총 ~250ms. (ACCESSIBILITY.md §6과 일치) |
| Empty state 등장 | 200ms ease-out fade | 즉시 표시 (no fade) |
| Phase tab 전환 | 300ms ease-in-out | 즉시 전환 |
| Toast 슬라이드인 | 200ms slide + fade | fade only (slide 생략) |
| Byeongpung panel reveal | 800ms clipPath circle | 즉시 reveal |

#### 11.6.2 VoiceOver expected announcements (신설 v1.2)

핵심 플로우에서 VoiceOver가 읽는 문장 — 회귀 검증 기준선.

| 화면 / 액션 | 기대 announcement |
|---|---|
| Home 진입 (mission 0개) | "Your journey starts here. Missions are listed below." (empty state label, ADR-0027) |
| 미션 카드 포커스 | `${missionTitle}. ${categoryName} category. Button.` |
| 미션 완료 탭 후 (motion on) | (4-stage 동안 VoiceOver 침묵) → stage 4의 `Panel N unlocked` 텍스트가 `accessibilityLiveRegion="polite"`로 announce |
| 미션 완료 탭 후 (motion off) | cross-fade와 함께 `Panel N unlocked` announce — 동일 문구 |
| 패널 언락 overlay | overlay 자체는 `accessibilityViewIsModal=true`, 내용은 `Panel N of 8 unlocked. Open the byeongpung to see your scroll grow.` |
| ByeongpungStrip | `Byeongpung — ${revealedPanels} of 8 panels revealed.` |
| DDayBanner (양수) | `${dday} days until departure.` |
| DDayBanner (음수, 출국 후) | `Departed ${abs(dday)} days ago.` |
| 에러 toast (T1) | (assertive) — `${body}. Retry button.` |
| 에러 modal (T2) | `${title}. ${body}. Try again button. Discard button.` |
| Settings deep-link (T3) | `${title}. ${body}. Open Settings button. Not now button.` |
| App-level banner (T4) | `${title}. ${primaryCta} button.` (role=alert) |

상세 컴포넌트별 체크리스트는 `docs/ACCESSIBILITY.md` §2를 참조.

### 11.7 i18n & 타임존 (신설 — ADR-0018, ADR-0022)

- **MVP 영어 only.** 한국어는 고유명사 괄호 규칙 (`Try Tteokbokki (떡볶이)`).
- **시스템 로케일 fallback**: 비영어 로케일이어도 영어 strings 그대로. RTL 미지원.
- **타임존: KST 고정** (ADR-0022). 모든 phase 계산·D-Day·notification 스케줄은 KST 자정 기준.
  - 구현: `src/lib/dates.ts`의 `toKstStartOfDay(date)`, `kstNow()` 헬퍼.
  - Firestore 저장은 `serverTimestamp()` + ISO string.
- **DST**: 한국 미적용. 사용자가 DST 적용 국가에서 앱 실행 시에도 KST 기준 변환 → 영향 없음.

### 11.8 성능 예산 & 쿼터 (신설)

| 지표 | 예산 | 측정 |
|---|---|---|
| 콜드스타트 (iPhone 13, Wi-Fi) | ≤ 3.0s | Firebase Performance |
| JS 번들 (release) | ≤ 4.5 MB (gz) | EAS build report |
| 메모리 (idle) | ≤ 250 MB | Xcode Instruments |
| 첫 페인트 | ≤ 1.0s | Reanimated frames |
| Firestore reads/MAU | ≤ 500 | Firebase usage |
| Storage egress/MAU | ≤ 5 MB | Firebase usage |
| FCM 발송/MAU | ≤ 12 | scheduler |
| Crashlytics crash-free 사용자 | ≥ 99.5% | Firebase Console |

알림 임계치: crash-free 99% 이탈 → 이메일 alert. Firestore reads/유저 1000 초과 → 이메일 alert.

### 11.9 빌드 & 배포 (신설 — ADR-0024, ADR-0026)

| Env | Bundle ID | Firebase | PostHog | EAS 채널 |
|---|---|---|---|---|
| dev | `com.kjourney.app.dev` | `k-journey` | `k-journey-dev` | internal |
| staging | `com.kjourney.app.staging` | `k-journey-staging` (신설) | `k-journey-staging` (신설) | preview |
| prod | `com.kjourney.app` | `k-journey-prod` (신설) | `k-journey-prod` (신설) | production |

- **버전 정책**: semver `MAJOR.MINOR.PATCH`. `buildNumber`/`versionCode`는 EAS 자동 증가.
- **OTA 업데이트**: MVP 미사용. V1.1에서 Expo Updates 검토 (opt-in per release).
- **출시 채널**: TestFlight (staging) → 내부 테스트 → 외부 베타 (prod) → 정식.
- 자세한 절차: `docs/RELEASE.md`.

### 11.10 모니터링 & 운영 (신설)

- 일일/주간 Firebase 사용량 알림 활성화
- Crashlytics velocity alert (crash-free 99% 이탈 시 이메일)
- PostHog funnel weekly review (onboarding completion, mission completion)
- Release checklist (`docs/RELEASE.md`)
- Incident playbook (`docs/INCIDENT_RESPONSE.md`)

### 11.11 Settings 화면 아키텍처 (신설 — ADR-0032, `docs/SETTINGS.md`)

More 탭 (gear icon) → Settings 단일 화면. 5개 카테고리 (`SectionList`):

1. **Notifications** — D-30 / D-14 / D-7 / phase / panel-unlock 5개 토글 (ADR-0029 카탈로그와 1:1) + OS 권한 상태 표시. 권한 미허가 시 토글 disabled + "Open Settings" 링크 (T3, ADR-0028).
2. **Era** — Joseon / Silla / Goryeo picker. Byeongpung 미리보기 thumbnail. 적용 시 byeongpung swap, 진행도 보존 (CLAUDE.md MUST #9).
3. **Profile** — 이름 / 대학교 / 주거 / 도착일 / 출발일. 날짜 변경 시 confirm dialog + phase 재계산 (§4.7).
4. **Account** — Sign out / Export my data / Delete account. (ADR-0033 — GDPR/PIPA 준수 필수.)
5. **About** — 버전 / 빌드(dev) / Support 메일 / 개인정보처리방침 / 이용약관. Dev 빌드는 `[Dev] Fresh onboarding`, `[Dev] Skip auth` 추가.

**Bottom tab bar는 4개 유지** (Settings는 More 안에 — 브랜드 네비게이션 보호). 화면 단위 사양은 `docs/SETTINGS.md`. 두 탭 (More + gear) 으로 도달 — App Store 리뷰 가이드라인 5.1.1(v) 충족.

### 11.12 Account management & GDPR (신설 — ADR-0033, `docs/SECURITY.md`)

GDPR Article 17 (right of erasure) + Article 20 (data portability) + 한국 개인정보보호법 §36 (삭제) + §38 (이전) 강제. App Store 5.1.1(v) + Google Play 정책 강제.

**계정 삭제** (Settings → Account → Delete account):
- 2단계 confirm: 첫 modal `Delete your K-Journey account?` (30일 grace 안내) → 둘째 modal `One last check.` (이메일 복구 링크 발송 안내).
- Firestore `users/{uid}/_meta.deletionRequestedAt = serverTimestamp()` 기록 (soft delete) → 즉시 sign-out.
- Cloud Function reaper: 매일 KST 04:00 실행. `deletionRequestedAt < now - 30 days`인 사용자의 `users/{uid}/**` + Storage `users/{uid}/**` + Firebase Auth user를 영구 삭제. 감사 로그 `_admin/deletionLog/{ulid}`에 uid + 시각만 (PII 없음).
- **복구**: 30일 내 같은 Apple ID 재로그인 → modal `Welcome back. Your account is scheduled for deletion in N days.` → "Cancel deletion" 탭 시 `_meta.deletionRequestedAt` 클리어, toast `Account restored.`

**데이터 export** (Settings → Account → Export my data):
- 즉시 queue. Cloud Function `generateExport` 실행 → `profile.json` + `missions.json` + `buckets.json` + `photos/` + `byeongpung_current.png` ZIP 생성 → Storage signed URL (7일 만료) → Apple ID 이메일 발송 (Firebase Extensions "Trigger Email" + SendGrid).
- 24시간 throttle: 재요청 시 T2 modal `Export already queued`.
- 감사 로그 `_admin/exportLog/{ulid}`에 uid + 시각 + bytes만.

**Firestore Rules** (ADR-0021 확장): soft-delete 상태 사용자는 본인 데이터 read 허용 (복구 화면 표시용), `_meta.deletionRequestedAt` 외 write 차단. `_admin/**`은 클라이언트 read 전면 차단.

### 11.13 사진·미디어·햅틱·오프라인 정책 묶음 (신설 — ADR-0030, ADR-0031, ADR-0034)

3개 ADR을 PRD에서 한 데 묶어 pointer 형태로 명시.

**햅틱·사운드** (ADR-0030, `src/lib/haptics.ts`):
- 햅틱 발사는 정확히 3개 모먼트만 — panel unlock (`Success`), mission complete stage 2 (`Light`), destructive confirm (`Warning`).
- 사운드는 MVP 미사용 (브랜드 calm). V2에서 단일 ink-brush 사운드 검토.
- `useReduceMotion()=true` 시 햅틱 다운그레이드 (mission complete → 무, panel unlock → Light, destructive → 유지).

**오프라인 가시화** (ADR-0031, `src/components/ui/NetworkIndicator.tsx`):
- `NetInfo.isConnected` false 전환 시: T1 toast `No connection. Your work is saved on this device.` + 헤더 우상단 작은 dot (`palette.ash`, 4px).
- `true`로 복원 + 대기 중 sync가 있었으면: T1 toast `Synced.` (1회). 평소 복원에는 toast 없음.
- Sync conflict는 `last-write-wins` (ADR-0022 server-truth) — 사용자에게 silent. 단, bucket count 감소가 감지되면 T1 toast `Updated from another device.`
- Optimistic UI 보존 — per-mission "pending" 배지 없음.

**사진 업로드 파이프라인** (ADR-0034, `src/lib/photoUpload.ts`):
- 클라이언트 압축: 1920px 장변, JPEG quality 0.85, sRGB.
- EXIF: GPS 좌표 strip (PII), 타임스탬프·카메라 정보 보존.
- Storage 경로: `users/{uid}/photos/{missionId}/{ulid}.jpg`. Storage Rules 2MB cap + JPEG only.
- Moderation: MVP 자체 신고 only (long-press → support 연락 — `_admin/contentReports/{ulid}` 기록). Cloud Vision SafeSearch는 V2 (sharing-public 시점).
- 업로드 실패 시 T2 modal `Couldn't upload photo` (`docs/ERROR_MESSAGES.md` `image-upload-fail` row) + `Try again` / `Skip photo`. 미션 완료는 사진과 분리 — 사진 실패해도 미션 카운트 유지.

---

## 12. 콘텐츠 관리

### 12.1 콘텐츠 소싱

MVP에서는 모든 콘텐츠를 K-Journey 팀이 직접 큐레이션합니다. 외부 API 연동은 향후 버전에서 고려합니다.

### 12.2 대학교 데이터 관리

대학별 정보는 수동으로 수집하여 Firestore에 저장합니다 (MVP에서는 `src/data/universities.ts`에 정적 임베드). 향후 Firebase Console을 통해 콘텐츠 팀이 직접 업데이트할 수 있도록 Firestore 컬렉션으로 이전 (V1.1).

### 12.3 콘텐츠 검수 주기 (신설)

- **분기별 (3개월)** Have-To 미션 검토 — 매장 폐업, 정보 노후화 체크
- **분기별** 긴급 가이드 전화번호 검증
- **연 1회** 대학교 데이터 동기화 (기숙사 정책 변경 등)
- **수동 신고**: V2 (UGC) 도입 시까지는 사용자 이메일/스토어 리뷰 채널

---

## 13. MVP 범위 및 제외 사항

### 13.1 MVP 포함 기능

- 4단계 페이즈 여정 시스템 (자동 전환, KST 기준)
- Have-To 미션 (큐레이션, 약 50개, housing 분기)
- Want-To 버킷리스트 시스템 (6개 사전 템플릿)
- 8폭 병풍 게이미피케이션 (3개 시대 테마, 24개 PNG)
- 대학교별 맞춤 콘텐츠 (서울 9개 대학교)
- 주거 유형별 콘텐츠 분기
- D-Day 카운터 및 자동 미션 우선순위 조정
- 행동 트리거 푸시 알림 (D-30/14/7, phase 전환, 패널 언락)
- 긴급 상황 가이드 (오프라인 + 비로그인 접근)
- 출국 후 갤러리 및 타임라인
- SNS 공유 (병풍 그림 PNG 캡처)
- 필수 콘텐츠 오프라인 지원 (MMKV + Firestore offline queue)
- 애플 인증 (Google 후속)
- Crashlytics + PostHog 통합
- 유료 다운로드 ($2~3 USD)

### 13.2 V2.0 계획 기능 (MVP 미포함)

- 소셜/커뮤니티 기능
- 다국어 지원
- 서울 외 지역 대학교 지원
- 1년 유학생 콘텐츠 확장
- B2B 대학교 화이트라벨
- 유저 생성 콘텐츠(UGC) 및 리뷰
- 외부 API 연동
- 출국 후 동문 멘토링 시스템
- OTA 업데이트 (Expo Updates)
- 다크 모드 — **MVP 명시적 reject (ADR-0035)**. `userInterfaceStyle: 'light'` 강제. V2.0에서 ink-night variant 검토 (obangsaek inverse + hwanggeum dark + 24개 byeongpung panel 재페인팅 + WCAG AA 재검증 후).
- 4번째 시대 (`CLAUDE.md` NEVER #9)

---

## 14. 리스크 및 대응 방안 (확장)

| 리스크 | 영향도 | 대응 방안 |
| --- | --- | --- |
| **(기존)** 유료 모델로 인한 초기 다운로드 저조 | 높음 | 교환학생 커뮤니티 타겟 SNS 마케팅 강화 |
| **(기존)** 콘텐츠 노후화 | 중간 | 분기별 검수 (§12.3); V2 신고 기능 |
| **(기존)** 제한된 대학교 커버리지 | 중간 | 서울 9개로 시작; 수요 기반 확장 |
| **(기존)** 병풍 아트워크 제작 비용/시간 | 높음 → **해결** | 35 PNG 생성 완료 (2026-05-11) |
| **(기존)** 오프라인 동기화 충돌 | 낮음 | Firestore offline + last-write-wins (`serverTimestamp`) |
| **(신규)** Firebase 쿼터 초과 | 중 | 일일/주간 사용량 알림, blaze plan 한도, 무료 한도 도달 시 graceful degradation (캐시 우선) |
| **(신규)** 푸시 권한 거부율 높음 | 높음 | 권한 요청 타이밍 최적화(D-30 직전), 거부 후 Settings deep-link |
| **(신규)** 시뮬레이터-only QA의 실기기 회귀 | 중 | 외부 베타 전 실기기 매뉴얼 QA 체크리스트 |
| **(신규)** Apple Sign-In 거부/취소 시 fallback 부재 | 중 | Google Sign-In 활성화 (ADR-0013), 그 전까지 "다시 시도" 화면 |
| **(신규)** 시계 변조로 D-Day 조작 | 낮음 | `serverTimestamp` 사용 (ADR-0022) |
| **(신규)** Reanimated worklet 크래시 (factory closure) | 중 | 인라인 규칙 강제 (ADR-0019), 코드 리뷰 체크리스트 |
| **(신규)** PNG 로드 실패 (저용량 디바이스) | 낮음 | `<Image onError>` → ink-color fallback (ADR-0008) |
| **(신규)** 외부 폰트 로드 실패 | 낮음 | 시스템 폰트 fallback (Pretendard → SF Pro / Roboto) |
| **(신규)** 첫 외부 베타에서 prod Firebase 미준비 | 높음 → **차단** | ADR-0024 환경 분리 필수. Prod Firebase 생성이 외부 빌드 직전 필수 조건 |
| **(신규)** Firestore Rules 누락으로 데이터 노출 | 높음 | `firestore.rules` 작성 + emulator 단위 테스트 (ADR-0021) |
| **(신규)** Crashlytics에 PII 유출 | 중 | `setUserId(uid)`만 허용, 코드 리뷰 체크리스트 |

---

## 15. 개발 로드맵

| 단계 | 기간 | 상태 | 산출물 |
| --- | --- | --- | --- |
| 컨셉 확정 | 완료 (2026-04) | ✅ | PRD v1.0, 기능 정의 |
| 기능명세서 & 플로우차트 | 완료 (2026-04) | ✅ | 상세 기능명세서, 유저 플로우 |
| 와이어프레임 & UI 디자인 | 완료 (2026-04) | ✅ | DESIGN.md, 시대 테마 목업 |
| Phase A 개발 (코어 기능) | 완료 (2026-04~05) | ✅ | 12/14 must-have features |
| Phase B 개발 (버킷 + 공유 + housing) | 완료 (2026-05-05) | ✅ | 14/14, 52 tests green |
| Phase B QA pass | 완료 (2026-05-06) | ✅ | 7/7 sim 시나리오 통과 |
| 아트워크 제작 | 완료 (2026-05-08~11) | ✅ | 35 PNG (35/35 통합) |
| **Round 2 리뷰 (이 문서)** | 완료 (2026-05-13) | ✅ | PRD v1.1, 26 ADR, architecture, 11 docs, firestore.rules |
| **Round 2 코드 보강** (Part E~J) | 진행 중 | 🚧 | KST/validation/a11y/PostHog wiring/Google sign-in/env 분리 |
| Prod Firebase 프로젝트 생성 | 미시작 | ⏳ | k-journey-staging, k-journey-prod |
| 외부 베타 (TestFlight) | 미시작 | ⏳ | Staging 채널 |
| 실기기 QA | 미시작 | ⏳ | `docs/TESTING.md` 매뉴얼 체크리스트 |
| 출시 | 목표 2026년 가을학기 | ⏳ | App Store + Google Play |

---

## 16. 이벤트 분석 스키마 (신설)

`KJEvent` union (`src/lib/posthog.ts`) — 모든 PostHog 이벤트의 단일 진실 원천:

| 이벤트 | 발화 지점 | 페이로드 | 필수 | 금지 |
|---|---|---|---|---|
| `sign_in` | useAuth onAuthStateChanged(user!=null) | `{ provider: 'apple'│'google'│'devmock' }` | provider | email, name |
| `sign_out` | useAuth signOut | `{}` | — | — |
| `onboarding_step_complete` | 각 onboarding screen submit | `{ step: 'dates'│'profile_0'│'profile_1'│'profile_2'│'profile_3'│'profile_done' }` | step | 입력값 raw |
| `onboarding_complete` | era.tsx 완료 후 router.replace | `{ era, university, housing }` | era (나머지는 null 가능) | name |
| `mission_complete` | mission/[id].tsx markComplete 성공 | `{ missionId, phase, category }` | 모두 | — |
| `mission_uncomplete` | mission/[id].tsx unmark | `{ missionId }` | missionId | — |
| `panel_unlock` | mission/[id] + bucket/[id] (claimPanelUnlock true) | `{ panelNumber, source: 'mission'│'bucket' }` | 모두 | — |
| `phase_transition` | useJourneyMilestones (감지) | `{ from, to }` | 모두 | — |
| `phase_manual_override` | Home.tsx phase tab tap | `{ from, to }` (from=계산된 phase, to=선택 phase) | 모두 | — |
| `bucket_create` | bucket/new.tsx submit 성공 | `{ bucketId, templateKey, maxItems, initialItemCount }` | 모두 | items text |
| `bucket_item_complete` | bucket/[id].tsx toggle 성공 | `{ bucketId, itemId }` | 모두 | item text |
| `era_switch` | More 탭 또는 era.tsx 편집 submit | `{ from, to }` | 모두 | — |
| `dday_milestone_view` | useJourneyMilestones 첫 임계 도달 (MMKV-dedupe) | `{ milestone, daysLeft }` | 모두 | — |
| `emergency_open` | emergency.tsx mount | `{}` | — | — |
| `gallery_open` | gallery.tsx mount | `{ completedTotal }` | completedTotal | — |
| `byeongpung_share` | byeongpung 탭 또는 gallery share 성공 | `{ source: 'byeongpung_tab'│'gallery', completedPanels }` | 모두 | — |
| `byeongpung_save_image` | byeongpung 탭 save 성공 | `{ completedPanels }` | completedPanels | — |

**중복 발화 방지**: `trackOnce(eventName, dedupeKey)` 헬퍼 (Round 2 Part F). 같은 dedupeKey는 세션 내 1회만 발화.

자세한 스키마: `docs/ANALYTICS_SCHEMA.md`.

---

## 17. 기능별 엣지 케이스 매트릭스 (신설)

기능 × 실패-모드. 각 셀에 동작 정의 + ADR/코드 포인터.

| 기능 ↓ / 실패 모드 → | 네트워크 끊김 | 권한 거부 | 잘못된 입력 | 시계 변조 | 캐시 손상 | 동시 디바이스 |
|---|---|---|---|---|---|---|
| **미션 완료** | 큐잉 (MMKV+Firestore offline) | — | — | server-timestamp | MMKV null → DEV_MOCK | idempotent merge |
| **D-Day 계산** | KST 캐시 사용 | — | `arrival>departure` 차단 | server-truth 우선 | "—" 표시 | — |
| **패널 언락** | 큐잉 + 로컬 firedPanelUnlocks | 알림 못 보냄, 오버레이 정상 | — | — | reset → 재발화 (의도) | 디바이스별 발화 |
| **푸시 알림 스케줄** | 재연결 시 reschedule | no-op + toast | — | KST 변환으로 보호 | 재계산 회복 | — |
| **Apple Sign-In** | "Try again later" | — | nonce 실패 → error | — | — | 마지막 디바이스 우선 |
| **이미지 공유** | — | 권한 재요청 + Settings deep-link | — | — | — | — |
| **시대 변경** | 캐시 즉시 + 큐 | — | — | — | — | — |
| **갤러리 열기** | 캐시 우선 | — | — | — | — | — |
| **Phase override** | MMKV 즉시 | — | invalid → ignore | — | invalid → null | — |
| **프로필 업데이트** | MMKV + 큐 | — | validate 통과 필수 | — | — | last-write-wins |
| **버킷 항목 토글** | MMKV + 큐 | — | — | server-timestamp | — | idempotent merge |
| **온보딩** | 부분 입력 복원 | 푸시 거부해도 진행 | validate 통과 필수 | — | 처음부터 | — |
| **PNG 렌더** | — | — | — | — | `onError` ink fallback | — |
| **Crashlytics 기록** | 큐잉 | — | — | — | — | — |
| **emergency 읽기** | 캐시 우선 | (anonymous OK per ADR-0021) | — | — | 정적 데이터 | — |
| **PostHog 트래킹** | 큐잉 (PostHog SDK 자체 큐) | — | — | — | — | — |

자세한 동작과 코드 포인터는 `docs/EDGE_CASES.md`.

---

## 18. 변경 이력 (신설)

### v1.2 (2026-05-14) — UX 레이어 신설 (Wave 1 morning + Wave 2 evening)

**Why:** v1.1이 기술/아키텍처 커버리지를 닫았지만, 사용자가 실제로 보고 만지는 UX 레이어가 미명세였음. UX-focused 1차 리뷰에서 28개 갭, 사용자 verdict 후 2차 리뷰에서 추가 영역 (Settings·Account·Onboarding aha-moment·Photo·Haptics·Offline·Dark mode·architect follow-up) 발견. 두 차례에 걸쳐 닫음.

#### Wave 1 (morning — 카피 일관성 레이어)

| 변경 | 위치 |
|---|---|
| §4.5 Empty state 정책 신설 (icon + 1-line + optional CTA) | §4 |
| §7.8 푸시 알림 카피 템플릿 신설 (5종 + 권한 priming) | §7 |
| §11.4 4-tier 결정 트리 (T1 toast / T2 modal / T3 settings / T4 banner) + 에러 카피 카탈로그 | §11 |
| §11.6.1 Reduce Motion 폴백 명세 (애니메이션 5종 → cross-fade/즉시 표시; 250ms 통일) | §11 |
| §11.6.2 VoiceOver expected announcements (12개 시나리오 회귀 기준선) | §11 |
| 신규 ADR-0027 Empty state pattern | `docs/adr/0027-empty-state-pattern.md` |
| 신규 ADR-0028 Error recovery & retry strategy | `docs/adr/0028-error-recovery-retry-strategy.md` |
| 신규 ADR-0029 Push copy library & priming | `docs/adr/0029-push-copy-library-and-priming.md` |
| 신규 docs/MICROCOPY.md (보이스/톤·길이 budget·템플릿) | `docs/MICROCOPY.md` |
| 신규 docs/ERROR_MESSAGES.md (마스터 카피 카탈로그 약 30개 코드) | `docs/ERROR_MESSAGES.md` |
| 신규 docs/EMPTY_STATES.md (화면별 empty state 사양 12건) | `docs/EMPTY_STATES.md` |
| 신규 docs/PUSH_COPY.md (푸시 카피 카탈로그 7개 unique 문자열) | `docs/PUSH_COPY.md` |
| DESIGN.md §14 State variants 카피 톤 예시 확장 | `DESIGN.md` |
| DESIGN.md §16 Microcopy & voice guidelines 신설 | `DESIGN.md` |

#### Wave 2 (evening — 화면 + 정책 결정 레이어)

| 변경 | 위치 |
|---|---|
| Architect follow-up 7건 fix (§17→§16 changelog 오기, D-14 priming 누락, "5 categories" 카운트, 200ms→250ms cross-fade, ADR-0028/0029 Migration plan 신설) | 다수 |
| §4.6 Onboarding aha-moment / first-launch tour 신설 | §4 |
| §4.7 프로필·날짜·시대 수정 UX 신설 | §4 |
| §11.11 Settings 화면 아키텍처 신설 | §11 |
| §11.12 Account management & GDPR 신설 | §11 |
| §11.13 사진·미디어·햅틱·오프라인 정책 묶음 신설 | §11 |
| §13.2 다크 모드 항목을 ADR-0035 명시적 reject로 업데이트 | §13 |
| 신규 ADR-0030 Haptics & sound feedback policy | `docs/adr/0030-haptics-and-sound-feedback.md` |
| 신규 ADR-0031 Offline state visibility & sync conflict | `docs/adr/0031-offline-state-visibility.md` |
| 신규 ADR-0032 Settings screen architecture | `docs/adr/0032-settings-screen-architecture.md` |
| 신규 ADR-0033 Account deletion & data export (GDPR/PIPA) | `docs/adr/0033-account-deletion-and-export.md` |
| 신규 ADR-0034 Photo upload pipeline | `docs/adr/0034-photo-upload-pipeline.md` |
| 신규 ADR-0035 Dark mode explicit rejection | `docs/adr/0035-dark-mode-explicit-rejection.md` |
| 신규 docs/SETTINGS.md (Settings 화면 master spec — 5 카테고리 × 행 단위 표) | `docs/SETTINGS.md` |
| DESIGN.md §17 Settings pattern 신설 | `DESIGN.md` |
| DESIGN.md §18 Account management pattern 신설 | `DESIGN.md` |
| DESIGN.md §19 Permission primer (universal) 신설 | `DESIGN.md` |
| DESIGN.md §20 Photo & sharing guidelines 신설 | `DESIGN.md` |
| DESIGN.md §21 Offline & sync conflict visuals 신설 | `DESIGN.md` |
| ANALYTICS_SCHEMA.md UX KPI 섹션 신설 (~10건 신규 이벤트 + threshold) | `docs/ANALYTICS_SCHEMA.md` |
| TESTING.md Usability checklist 섹션 신설 (15개 manual scenario) | `docs/TESTING.md` |
| INCIDENT_RESPONSE.md User notification templates 섹션 신설 | `docs/INCIDENT_RESPONSE.md` |
| ADR-0008 / ADR-0023 / ADR-0024 Consequences 보강 | `docs/adr/` |
| ADR README 인덱스에 "UX layer (Round 2.5 — 2026-05-14)" 카테고리에 ADR-0030~0035 추가 (총 35 ADR) | `docs/adr/README.md` |
| CLAUDE.md Source-of-truth 표 업데이트 (SETTINGS.md 추가, ADR 카운트 35) | `CLAUDE.md` |

**보류 (v1.3 또는 출시 후 30일 내 재평가):** 재참여 캠페인, App Store rating prompt, In-app feedback channel, Sharing payload ADR 격상, DATA_FLOW.md user-feedback row, MONITORING.md UX-specific alerts, Multi-language hint, 저사양 자동 다운그레이드.

### v1.1 (2026-05-13) — Tech alignment & coverage of error/edge cases

**Why:** v1.0이 Flutter 기반으로 작성된 이후 코드는 React Native로 피벗했고, 26개의 비명시 결정이 누적되어 PRD가 더 이상 진실의 원천이 아니게 됨. Round 2 리뷰에서 갭을 모두 닫음.

| 변경 | 위치 |
|---|---|
| §1.3 Glossary 신설 | §1.3 |
| §4.1 인증 — Apple 주축, Google 후속, 익명 폐기 명시 + 실패 분기 표 (§4.1.1) | §4 |
| §4.2.1 프로필 유효성 검사 규칙 표 | §4 |
| §4.4 온보딩 실패/중단 케이스 | §4 |
| §5.6 날짜 엣지 케이스 | §5 |
| §5.7 타임존 정책 (KST 단일 기준) | §5 |
| §6.5 패널 언락 1회성 보장 | §6 |
| §6.6 미션 취소 시 카운트 흐름 | §6 |
| §6.7 PNG 로드 실패 fallback | §6 |
| §7.5 푸시 권한 라이프사이클 | §7 |
| §7.6 알림 스케줄 엣지 케이스 | §7 |
| §7.7 D-Day 마일스톤 KST 자정 발사 | §7 |
| §8.3 여정 중 주거 변경 시 미션 재계산 | §8 |
| §10.2 음수 D-Day 표시 규칙 | §10 |
| §10.3 갤러리 자동 전환 prompt 규칙 | §10 |
| §11 전면 재작성 (RN+Expo+TS+MMKV+PostHog+...) | §11 |
| §11.4 에러 핸들링 컨트랙트 신설 | §11 |
| §11.5 보안 & 개인정보 신설 | §11 |
| §11.6 접근성 신설 (WCAG 2.1 AA) | §11 |
| §11.7 i18n & 타임존 신설 | §11 |
| §11.8 성능 예산 & 쿼터 신설 | §11 |
| §11.9 빌드 & 배포 신설 (dev/staging/prod) | §11 |
| §11.10 모니터링 & 운영 신설 | §11 |
| §12.3 콘텐츠 검수 주기 신설 | §12 |
| §14 리스크 8건 추가 | §14 |
| §15 로드맵 — Phase B 완료, Round 2 반영 | §15 |
| §16 이벤트 분석 스키마 신설 (canonical) | §16 |
| §17 엣지 케이스 매트릭스 신설 | §17 |
| §18 변경 이력 신설 | §18 |

### v1.0 (2026-04) — Initial draft
역사 보존. [`K-Journey_PRD_v1_0_KR.md`](K-Journey_PRD_v1_0_KR.md)에서 참조 가능.

---

*문서 끝 — v1.2*
