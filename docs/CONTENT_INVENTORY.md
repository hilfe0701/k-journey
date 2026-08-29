# Content inventory — K-Journey에 들어가야 할 실제 정보 목록

> 작성일 2026-08-04 · **P0 반영 2026-08-04 · P1/P2 반영 2026-08-29** · 대상 브랜치 `v2-conditional-orchestration`
> 이 문서는 **무엇이 앱에 들어가야 하는가**의 전수 목록이고, 각 항목이 지금 실제 정보인지 미검증인지를 기록한다.
> 규범(어떻게 검증할 것인가)은 `docs/CONTENT_GOVERNANCE.md`가 소유한다. 이 문서는 그 규범의 **원장(ledger)** 이다.
> 제품 범위의 최종 권위는 `reference/K-Journey_PRD_v2_0_KR.md`와 `DEC-040`.

---

## 0. 한 장 요약

| 콘텐츠 표면 | 항목 수 | 출처 메타데이터 스키마 | 실제 검증됨 | 등급 |
|---|---:|---|---|---|
| 행정 태스크 (Essentials) | 18 | 있음 (`TaskSourceMetadata`) | 15/18 | A |
| 문화 미션 (Culture) | 55 | 있음 (`ContentEvidence`) | 5/55 fully verified; remaining states explicit | B·C (일부 A 혼입) |
| 대학 레코드 | 9 | 있음 (`UniversityVerification` + 블록별 `contentEvidence`) | 9/9 주소·교통 확인, 기숙사·상권 불확실성 명시 | B |
| 긴급 정보 | 5 섹션 / 25 항목 | 있음 (`ContentEvidence`) | 25/25 verified | **A** |
| 온보딩 조건 축 | 12축 / 선택지 26개 | 해당 없음 (사용자 입력) | — | — |
| Want-to 템플릿 | 6 | 해당 없음 (문화 해설) | — | C |
| 병풍 아트 | 3 시대 × 8 패널 = 24 | 해당 없음 (자체 제작) | 자산 존재 | — |

**핵심 결론 3가지**

1. **모든 주요 콘텐츠 표면이 출처 메타데이터를 갖는다.** 행정 트랙은 `sourceUrl`·`checkedAt`·`finalAuthority`·`volatility`·`conflictValues`를, 문화 미션·긴급 정보는 `ContentEvidence`를, 대학 레코드는 블록별 `contentEvidence`를 실제로 들고 다닌다.
2. ~~**문화 미션 55개와 긴급 정보 25개 항목은 출처 필드 자체가 없다.**~~ → **긴급 정보와 문화 미션 모두 해소됨(P0-1/P2-8).** 미션 55개와 긴급 정보 25개 전부가 `ContentEvidence`를 들고 다니고, 화면이 출처·확인일·최종 권위를 항목마다 렌더한다. 미확인 값은 `needs_review` 또는 `unknown`으로 표시한다.
3. **대학 레코드는 비자 안내와 캠퍼스 블록 증거를 분리한다.** `contentEvidence`가 주소·기숙사·교통·상권에 각각 붙고, 공식 확인이 안 된 기숙사 세부사항과 상권 라벨은 `needs_review`로 표시한다 (§3.3).

---

## 1. 행정 태스크 — Essentials (18개)

조건부 체크리스트. `usePhase` + `conditionRules.ts`가 프로필 12개 축을 보고 노출을 결정한다.
**문화 완료 총합에 절대 기여하지 않는다** (CLAUDE.md MUST 8).

### 1.1 태스크 목록

| # | taskId | 제목 | 정의 위치 | 출처 상태 |
|---|---|---|---|---|
| 1 | `dormitory-application` | Apply for dormitory housing | `dormitoryApplication.ts` | 대학별, `high` volatility |
| 2 | `immigration-appointment` | Book your immigration appointment | `immigrationAppointment.ts` | HiKorea 방문예약 ✅ |
| 3 | `residence-registration` | Residence registration | `taskState.ts` | 법무부 수수료 고시 ✅ |
| 4 | `housing-proof` | Housing proof | `taskState.ts` | 연세대 GIT 안내 ⚠️ 단일 대학 출처 |
| 5 | `group-registration` | Group registration | `taskState.ts` | 대학 국제처 일반 ⚠️ |
| 6 | `departure-order` | Departure order | `taskState.ts` | 양측 출처 병기 ✅ (1차 아님을 라벨에 명시) |
| 7 | `G1` 잔여 | Return your residence card | `departureTasks.ts` | 출입국관리법 §37(1) ✅ |
| 8 | `G2` | Cancel your mobile contract | `departureTasks.ts` | 찾기쉬운 생활법령 ✅ |
| 9 | `G3` | Receive your dormitory deposit refund | `departureTasks.ts` | 의도적 공백 ✅ (전국 규정 없음을 `conflictNote`에 기록) |
| 10 | `G4` | Decide what to do with your bank account | `departureTasks.ts` | Fulbright/SUNY Korea ⚠️ 2차 출처 |
| 11 | `G5` | Switch health-insurance billing to electronic | `departureTasks.ts` | NHIS 외국인 안내 ✅ |
| 12 | `G6` | Request your transcript | `departureTasks.ts` | 정부24 교육부 증명 서비스 ✅ |
| 13 | `G7` | Stop transit-card auto-charge | `departureTasks.ts` | ⚠️ |
| 14 | `G8` | Cancel internet and utilities | `departureTasks.ts` | ⚠️ |
| 15 | `G9` | Get an entry and exit record certificate | `departureTasks.ts` | ⚠️ |
| 16 | `immigration-jurisdiction` | Find your responsible immigration office | `admin.ts` | 출입국 관할표 + 주소 미확정 시 `review_required` |
| 17 | `part-time-work-permission` | Check part-time work permission | `admin.ts` | 허가 필요성 확인, 세부요건 `needs_review` |
| 18 | `health-insurance-enrollment` | Check health-insurance enrollment | `admin.ts` | NHIS 가입·감면·면제 심사 경로 |

### 1.2 이 트랙에 실제로 들어가야 하는 정보

각 태스크마다 아래 8개 필드가 **전부** 채워져야 한다. 현재 `TaskSourceMetadata`가 이미 이 모양이다.

```ts
{
  sourceUrl,        // 1차 공식 출처 (정부·대학·사업자 본인)
  sourceLabel,      // 사람이 읽는 출처 이름
  checkedAt,        // YYYY-MM-DD, 실제로 열어본 날
  reviewAfter,      // 재검증 기한 (Class A = 30일)
  finalAuthority,   // 앱이 틀렸을 때 사용자가 물어볼 대상
  conflictNote,     // 출처끼리 다를 때의 설명
  conflictValues,   // 서로 다른 값들을 전부 병기 (예: ARC 수수료)
  volatility,       // low | high | unknown
  owner,            // 이 클레임의 사내 담당자 — 현재 전부 '미확인'
}
```

### 1.3 확보해야 할 실제 값 (수집 워크시트)

- [ ] **외국인등록증(ARC) 수수료** — 현재 `conflictValues`에 3개 값이 병기되어 있고 `40,000 won`이 HiKorea 경로로 잡혀 있다. 법무부 고시 원문에서 **현재 유효한 단일 금액과 발급 경로별 차액**을 재확인.
- [ ] **체류지 변경신고 기한** — 현재 코드에 일수가 하드코딩되어 있는지 `conditionRules.ts`의 `DueRule` 전수 확인 후, 출입국관리법 시행령 원문 대조.
- [ ] **HiKorea 방문예약 오픈 시점·슬롯 주기** — 앱이 "예약이 희소 자원"이라는 전제로 순서를 잡고 있으므로(REQ-SFR-007), 이 전제의 근거를 문서화.
- [x] **`departure-order` 태스크의 1차 출처** (2026-08-04) — 1차 출처는 **존재하지 않는 것으로 확정**했다. 이 태스크는 사실 주장이 아니라 서로 다른 두 기관에 걸린 선후 결정이므로, `conflictValues`에 양측(은행 측 = Fulbright 기관 안내, 기숙사 측 = 각 사 내규)을 병기하고 `sourceLabel`에 "not a primary authority"를 명시했다. 빈 URL 상태는 제거됐다.
- [x] **기숙사 보증금 환급(G3) 대학별 실제 절차** (2026-08-04) — **전국 단위 규정이 없음**을 확인했다(각 대학 생활관 내규가 지배). 따라서 출처는 의도적으로 비워 두되 `conflictNote`에 그 이유를 적었고, **시점을 단정하던 summary를 제거**했다. 대학별 기숙사 페이지 9건은 §3.4의 블록별 evidence로 연결했다.
- [x] **성적증명서(G6) 발급 경로** (2026-08-04) — 정부24의 교육부 「대학교 성적 증명」 서비스로 1차 출처 확보. 해외 발송·전자증명 가능 여부는 대학별이므로 `conflictNote`에 남기고 최종 권위를 각 대학 학적팀으로 지정.
- [ ] **NHIS 1577-1000** 및 외국어 서비스 내선(현재 "press 7") 현행 확인.
- [ ] **통신 3사 해지 절차** — 현재 생활법령 일반론. SKT/KT/LGU+ 각사 외국인 해지 페이지 3건 필요.
- [ ] **9개 대학 × 기숙사 신청 일정** — `dormitoryApplication.ts`가 `volatility: high`로 이미 표시. 학기마다 갱신되는 값이므로 **앱에 상수로 박으면 안 되는 후보**.

---

## 2. 문화 미션 — Culture (55개)

`src/data/missions.ts`. 4 페이즈 × 4 카테고리. 완료 6개당 병풍 1폭, 48개면 8폭 전부.

### 2.1 분포 (테스트로 고정되어 있음)

| 페이즈 | 개수 | 카테고리 | 개수 |
|---|---:|---|---:|
| 1 · Pre-arrival | 9 | settle | 29 |
| 2 · First week | 14 | food | 9 |
| 3 · Living | 25 | culture | 9 |
| 4 · Pre-departure | 7 | activity | 8 |
| **합계** | **55** | | **55** |

부가 필드: `mapHint` 12건, `titleKo` 10건, `appliesTo` (dormitory/off-campus 분기) 일부.

### 2.2 구조적 갭 — 가장 큰 문제

`Mission` 인터페이스에는 이제 `completeWhen`, `evidence`, `owner`가 필수다. 55개 원장은 [`MISSION_SOURCE_LEDGER.md`](./MISSION_SOURCE_LEDGER.md)가 소유한다.

화면은 각 카드에 확인일·검증 상태·최종 권위·담당 역할·출처 링크를 표시하고, `needs_review`·`unknown`은 확인 전 사용하지 말 것을 명시한다.

행정성 내용은 여전히 문화 미션과 Essentials가 중복되지 않도록 검토한다. `p1_visa`, `p2_arc`, `p2_bank`는 행정 태스크로 연결되는 안내이며, 미션 카드에는 출처 상태와 최종 권위를 함께 표시한다.

### 2.3 검증 없이 박혀 있는 구체 수치 — 전수 목록 (원화 25건)

| 위치 | 값 | 무엇에 대한 | 클래스 |
|---|---|---|---|
> **2026-08-06 갱신.** 아래 표는 원장 작성 시점의 목록이다. B 등급 8건 중 4건이 이 날 처리됐고, 그 결과는 §2.6에 있다.
> 표의 `:553`은 「고궁 입장 추정」이 아니라 **한복 헤어 스타일링 가격**(사설 대여점, C 등급)이었다. 원장 작성 시의 오분류이므로 정정한다. 고궁 입장료는 애초에 앱에 없었다.

| `missions.ts:78` | ₩30,000–50,000 | 다이소 침구 세트 | C |
| `:79` | ₩60,000 | 기본 주방용품 | C |
| `:92` | ₩9,500 | AREX 직통열차 | **B — 운임은 공시값** |
| `:93` | ₩17,000 | KAL 리무진 | **B** |
| `:94` | ₩60,000–80,000 | 인천공항 택시 | C |
| `:162` | 미정 | T-money 카드 | **B — 판매처·상품별 가격, needs_review** |
| `:174` | ₩30,000–55,000 | SIM/eSIM | B |
| `:232` | ₩25,000–35,000 | (기숙사/주거 관련) | C |
| `:245` | ₩2,000 / ₩4,000–6,000 | 코인 세탁 | C |
| `:301` | ₩12,000 / ₩2,000–5,000 | 배달 | C |
| `:310` | ₩7,000–12,000 | 캠퍼스 식당 | C |
| `:368` | ₩4,000 | 길거리 음식 | C |
| `:466` | 미정 | KTX 당일치기 | **B — 열차·좌석·날짜별 조회, needs_review** |
| `:508` | ₩1,000 | 노래방 | C |
| `:519` | ₩1,500 | PC방 | C |
| `:551` | ₩15,000–25,000 | 한복 대여 | C |
| `:553` | ₩5,000 | (고궁 입장 추정) | **B — 공시 요금** |
| `:565` | ₩5,000–13,000 | 국립중앙박물관 관련 | **B** |
| `:580` | ₩20,000–80,000 | 도장 각인 | C |
| `:661` | ₩3,000–5,000 | 스터디카페 | C |
| `:663` | ₩6,000 | 스터디카페 | C |
| `:675` | 미정 | 약국·의원 | **B — 고시·보험 유형별 확인, needs_review** |
| `:717` | ₩8,000–15,000 | 선물 | C |
| `universities.ts` | 미정 | 각 대학 세탁요금 | B — 기숙사별 현장 공지 확인 |

→ **B 등급 8건(AREX, KAL 리무진, T-money, KTX, 고궁, 박물관, 진료비, 세탁요금)은 운영자 공시·조회 페이지로 대조했다.** 조회 조건에 따라 확정할 수 없는 T-money·KTX·진료비·대학 세탁요금은 앱에서 금액을 제거하고 `needs_review`로 남겼다.
→ C 등급은 "가격은 변동될 수 있음" 고지와 함께 편집 가이드로 명시 라벨링하면 유지 가능하다.

### 2.4 미션 트랙에 확보해야 할 실제 정보

- [x] **55개 전부에 대한 source ledger 생성** (2026-08-29) — [`docs/MISSION_SOURCE_LEDGER.md`](./MISSION_SOURCE_LEDGER.md)에 55개 ID, 확인일, 등급, 검증 상태, 최종 권위를 기록했다. `needs_review`·`unknown`은 의도적으로 남겼다.
- [x] **`Mission` 인터페이스에 `evidence: ContentEvidence` 추가** (2026-08-29) — `src/lib/contentEvidence.ts`의 타입을 재사용하고, 출처 미확인은 `unknown` + 빈 URL로 표현한다.
- [x] **행정성 미션 3건 재분류** (2026-08-04) — 재분류가 아니라 **주장 철회**로 처리했다. 실제로 발견된 모순 3건은 §2.5에 기록. 미션은 문화 카탈로그에 남되 행정 사실을 더 이상 주장하지 않고 Essentials로 넘긴다. 회귀 테스트는 `src/data/__tests__/missions.test.ts`.
- [x] **운영자 공시 요금 8건** 링크 + `checkedAt` 확보 (§2.3의 B 등급) (2026-08-29) — 확정할 수 없는 금액은 제거하고 `needs_review`로 남겼다.
- [ ] **`mapHint` 12건** — PRD상 라이브 내비게이션이나 영업시간 보장이 아님을 이미 규정. 각 hint가 실존 장소를 정확히 지시하는지만 확인.
- [ ] **공휴일·계절 의존 미션** — 축제(`Attend a Korean festival`), 한강 치맥, 등산은 시기 의존적. 연 단위 갱신 대상으로 표시.

### 2.5 행정성 미션 3건 — 실제로 발견된 모순 (2026-08-04 해소)

§9 P0-3의 결과다. "어긋날 수 있다"가 아니라 **실제로 어긋나 있었다.**

| # | 미션이 하던 말 | 소스 트랙이 하는 말 | 판정 |
|---|---|---|---|
| 1 | `p2_arc`: "Required if you stay over 90 days." | `evaluateResidenceRegistration`은 체류일수 **그리고** 체류자격을 함께 보고, `visa_free`는 체류가 90일을 넘어도 `not_applicable`로 판정한다 | **직접 모순.** 비자면제 장기 체류자에게 두 화면이 반대를 말하고 있었다 |
| 2 | `p2_arc`: "slots fill up weeks in advance." | `APPOINTMENT_LEAD_TIME_DAYS`는 영구 `unknown`이고, 모듈 주석이 "틀린 숫자는 안내처럼 행동된다"는 이유로 추정을 금지한다 | **직접 모순.** 금지해 둔 추정치를 미션이 공급하고 있었다 |
| 3 | `p1_visa`: "Most exchange students need a D-2 student visa." + "Apply at the consulate ... not on arrival." | 앱은 `visaTypeOrStatus`를 **묻고** 추론하지 않으며(MUST 7), 선택지에 `visa_free`가 있다 | **설계 위반.** 앱이 추론하지 않기로 한 사실을 미션이 단정 |

추가로 출처 없는 Class A 주장 3건을 제거했다 — `p2_bank`의 준비물 목록(`You need: ARC, passport, ...`)과 당일 발급 보증, `p1_visa`의 "두 부씩 복사" 요구.
`p2_arc`의 `mapHint`(목동 서울출입국)도 제거했다. 관할은 주소지를 따르는데 전체 사용자에게 한 곳을 지정하고 있었다(§11.1③).

**남은 것:** 이 3건의 행정 주장은 철회된 상태다. 이제 모든 미션에 출처 메타데이터가 있으며, 출처를 찾지 못한 카드는 `unknown`으로 원장에 남긴다.

### 2.6 공시 요금 8건 — 실제로 확인한 것 (2026-08-29)

§9 P1-6이다. 기존 값 중 확인 가능한 것은 공식 출처로 갱신했고, 현재 조회 화면에서 확정할 수 없는 값은 제거해 `needs_review` 메타데이터와 최종 권위만 남겼다.

| 항목 | 앱이 하던 말 | 확인 결과 | 조치 |
|---|---|---|---|
| AREX 직통 | ₩9,500 | ₩9,500은 **2023년 10월 이전 성인 운임**이다. 그 뒤 두 번 올랐고 현재 ₩9,500은 **어린이·경로 운임**이다 | 금액 제거. 43분 소요와 "공항 창구에서 현재 운임 확인"으로 대체 |
| 공항 리무진 | ₩17,000, "대부분의 주요 대학 근처에 내려준다" | 운영사 요금표는 **성인 ₩18,000 / 어린이 ₩12,000**. 노선은 호텔·도심 기준이고 대학 정문에 선다는 기술은 어디에도 없다 | 금액 갱신 + 대학 관련 주장 철회 |
| 국립중앙박물관 | 특별전 ₩5,000–13,000 | 상설전시관·어린이박물관 **무료**는 맞다. 특별전은 **전시별 개별 책정**이고 박물관이 통합 가격대를 공시하지 않는다 | 가격대 제거. 무료 범위를 정확히 서술 |
| 고궁 (한복) | "5대 궁 전부 입장료 면제" | 한복 착용자 무료는 맞다. 다만 궁능유적본부가 관리·공시하는 대상은 **경복궁·창덕궁·창경궁·덕수궁·종묘**다 | 출처가 열거하는 대로 이름을 나열 |
| 진료비 | 건강보험 적용 시 ₩4,000–10,000 | 진찰료는 **보건복지부 고시로 전국 단일**이고 매년 1월 개정된다(고시 제2025-186호, 2026-01-01 시행). 그러나 **금액은 고시 본문이 아니라 첨부 파일에** 있어 이번에 열지 못했다 | 금액 제거. "전국 단일 고시가·의원이 본인부담 최저"라는 구조만 서술 |
| T-money 카드 | ₩4,000 | 서울시 공식 관광 안내는 구매처를 안내하지만 현재 일반 카드 가격을 확정하지 않는다 | 금액 제거. 판매처·상품별 현재 가격 확인 문구 + `needs_review` |
| KTX 서울–부산 | ₩60,000 | 코레일 공식 조회는 열차·좌석·날짜를 입력해야 운임을 반환한다 | 금액 제거. 실시간 KORAIL 조회 문구 + `needs_review` |
| 대학 기숙사 세탁 요금 | ₩500–1,500 | 대학별 공식 자료는 시설을 확인하지만 건물·시기별 가격을 통합 공시하지 않는다 | 금액 제거. 기계/생활관 현장 확인 문구 + 대학별 `needs_review` |

회귀 테스트는 `src/data/__tests__/missions.test.ts`. 제거한 4개 값이 되돌아오면 실패한다.

> **판정 기준.** 값을 못 찾았을 때 그럴듯한 값으로 바꾸지 않는다. AREX·리무진·박물관·고궁은 공식 공시와 대조해 갱신했고, T-money·KTX·세탁요금·진료비는 금액을 제거하고 공식 조회처와 `needs_review` 상태를 남겼다.

---

## 3. 대학 레코드 (9개)

`src/data/universities.ts`. MVP 지원 서울 소재 9개교. 각 레코드는 비자 `verification`과 주소·기숙사·교통·상권별 `contentEvidence`를 분리한다.

### 3.1 대상 대학

| id | 대학 | 캠퍼스 | verification |
|---|---|---|---|
| `cau` | Chung-Ang University (중앙대학교) | 흑석 | `verified` |
| `yonsei` | Yonsei University (연세대학교) | 신촌 | `verified` |
| `korea` | Korea University (고려대학교) | 안암 | `verified` |
| `snu` | Seoul National University (서울대학교) | 관악 | `verified` |
| `skku` | Sungkyunkwan University (성균관대학교) | 혜화 | `verified` (2026-08-06) |
| `hanyang` | Hanyang University (한양대학교) | 왕십리 | `verified` |
| `ewha` | Ewha Womans University (이화여자대학교) | 이대 | `verified` (2026-08-29) |
| `sogang` | Sogang University (서강대학교) | 신촌 | `verified` (2026-08-06) |
| `hufs` | Hankuk University of Foreign Studies (한국외국어대학교) | 이문 | `verified` (2026-08-06) |

**2026-08-29 갱신.** 비어 있던 `sourceUrl`을 각 대학 국제처 공식 페이지로 채우고, 주소·기숙사·교통·상권 블록에도 출처와 확인일을 붙였다.

- `skku` — Office of International Student Services (02-760-0020). 비자·출입국 담당 부서가 명시된 공식 페이지.
- `sogang` — 국제학생팀 (02-705-8118). 사이트가 **학생 비자/체류**와 **외국인등록** 섹션을 직접 갖고 있다.
- `hufs` — 외국인유학생종합지원센터 (02-2173-2066). 외국인등록 안내에 **주소 변경 15일 내 신고 의무**가 명시되어 있다(§1.3 항목과 연결되나 1차 출처는 출입국관리법이다).
- `ewha` — 국제학생팀 공식 사이트와 비자·체류·기숙사 섹션을 2026-08-29에 열어 확인했다. 상태를 `verified`로 갱신했다.

> `verification`은 국제처/비자 안내의 확인 상태이고, 주소·기숙사·교통·상권 블록은 `contentEvidence`가 각각 보증한다. `needs_review` 블록은 화면에서 최신 공지 확인을 요구한다.

### 3.2 레코드당 필드

`address` · `campusArea` · `nearestStation` · `dorm{prohibited, checkin, curfew, laundry}` · `offCampusArea[]` · `nearbyEats[]` · `transitRoutes[]` · `verification` · `contentEvidence{address,dorm,transit,nearbyEats}`

### 3.3 ⚠️ 가장 검증이 약한 구간

**기존의 비자 URL 하나짜리 검증을 블록별 검증으로 분리했다.** 아래 원칙을 적용했다:

- `nearbyEats` — 개별 점포를 모두 제거하고 대학가·시장·상권 단위 라벨로 전환했다. 점포 영업 여부를 보장하지 않으므로 `needs_review`다.
- `transitRoutes` — 공식 캠퍼스 길 안내에서 확인한 역·출구·버스만 유지하고, 배차·도보 시간은 제거하거나 실시간 경로 확인으로 일반화했다.
- `dorm.curfew` / `dorm.checkin` — 공식 생활관이 확인한 건물·시설만 유지하고, 건물·학기별 규정은 `needs_review`로 표시했다.
- `dorm.laundry` 요금 — 9개교 모두 고정 요금을 제거했다. 현장 기계/생활관 공지가 최종 권위다.
- `dorm.prohibited` — 특정 목록을 단정하지 않고 현재 생활관 규정 확인 문구로 일반화했다.

### 3.4 대학 트랙에 확보해야 할 실제 정보

대학 1개당 아래를 채워야 하며, **9개 × 6블록 = 54건**이다.

- [x] 공식 주소 (대학 홈페이지 오시는 길) — 9건, `contentEvidence.address`
- [x] 기숙사 공식 페이지 확인 — 9건, 미확인 세부사항은 `needs_review`로 일반화
- [x] 국제처(International Office) 연락처와 **최종 권위 명시** — 9건, 각 블록의 `finalAuthority`에 반영
- [x] 교통 경로: 공식 확인 역·출구·버스만 유지 — 9건, `contentEvidence.transit`
  - 버스 노선은 서울시 대중교통 공시 데이터로 대조
- [ ] 기숙사 신청 일정 (`volatility: high`) — 9건, **매 학기 갱신 필요**
- [x] `nearbyEats` 처리 결정 — 개별 점포를 상권·지역 단위로 전환하고 `needs_review`를 부착했다.
  1. 각 상점의 실존·영업 확인 후 `checkedAt` 부여 (유지비 최고)
  2. 개별 상점명을 지우고 **상권/골목 단위**로 전환 (예: "혜화 떡볶이 골목", "왕십리 곱창골목") — 상권은 상점보다 훨씬 안정적
  3. 필드 제거
  → **2안 적용.** 상권은 점포보다 안정적이지만 추천·영업을 보장하지 않으므로 방문 전 최신 지도를 확인한다.

---

## 4. 긴급 정보 (5 섹션 / 25 항목)

`src/data/emergency.ts`. MMKV로 오프라인 캐시. **안전 정보이므로 실질적으로 Class A.**
**2026-08-04 전수 검증 완료(P0-1).** 25개 항목 전부가 `ContentEvidence`(`src/lib/contentEvidence.ts`)를 들고 다니고, `app/emergency.tsx`가 항목마다 출처 링크·확인일·최종 권위를 렌더한다(MUST 12).

### 4.1 섹션 구성 (검증 후)

| 섹션 | 항목 수 | 1차 출처 | 상태 |
|---|---:|---|---|
| `phones` | 5 | 경찰청 · 소방청 · 법무부 · 한국관광공사 · 120다산콜재단 | 5/5 verified |
| `medical` | 4 | 세브란스 · 서울아산 · 삼성서울 각 공식 영문 페이지 · 대한약사회 | 4/4 verified |
| `lost` | 4 | 경찰청 LOST112 · 외교부 · 서울교통공사 · 서울시 | 4/4 verified |
| `phrases` | 5 | 국립국어원 로마자 표기법 | 5/5 editorial (Class C) |
| `embassies` | 7 | 외교부 주한공관주소록 + 각 공관 | 7/7 verified (2026-08-06) |

### 4.2 검증에서 실제로 틀렸던 것 — 4건 정정

| # | 기존 | 실제 | 출처 |
|---|---|---|---|
| 1 | 지하철 유실물 "1–4호선 시청역, 5–8호선 왕십리역" (2곳) | **4곳**이고 분담이 다르다 — 1·2호선 02-6110-1122 / 3·4호선 02-6110-3344 / 5·8호선 02-6311-6765 / 6·7호선 02-6311-6766, 평일 09:00–18:00 | 서울교통공사 |
| 2 | 1345 운영시간 없음 | **평일 09:00–22:00**, 18:00 이후는 한국어·영어·중국어만. 야간 회선이 아니다 | 법무부 |
| 3 | 1330 "24/7 multilingual" (뭉뚱그림) | 한/영/일/중만 24시간. 러시아어·베트남어·태국어·말레이인도네시아어는 **08:00–19:00** | 한국관광공사 |
| 4 | 미국대사관 "After-hours: 02-397-4000" | 당직은 **대표번호 02-397-4114와 동일**. 별도 야간번호는 공표되지 않는다 | 주한미국대사관 |

**썩는 데이터 2건 교체** (§10 유지 규칙)
- 24시간 약국: "강남역 12번 출구 Open Pharmacy" 개별 점포 → **대한약사회 휴일지킴이약국 조회**(지역·날짜·시간 검색). 점포는 닫지만 조회처는 닫지 않는다.
- 택시 분실: "1330에 전화" → **서울시 대중교통 분실물센터**(시내버스·마을버스·법인/개인택시 통합).

**주장 철회 1건** — LOST112 "(English available)". 영어 지원을 1차 확인하지 못해 삭제하고, "사이트는 한국어이며 1330이 통역한다"로 바꿨다.

### 4.3 남은 것

- [x] **`EmergencySection`에 출처 필드 추가** (2026-08-04) — P2 항목 9였으나 P0-1이 요구하므로 앞당겨 처리. `ContentEvidence`는 §2.4의 미션 `evidence` 필드와 **같은 타입**이라 P2 항목 8이 이 모듈을 재사용한다.
- [x] **국가별 대사관 확장 여부 결정** (2026-08-04) — 6개국을 늘리는 대신 **외교부 주한공관주소록을 섹션 첫 항목으로** 올렸다. 전 공관을 영문으로 담고 있어 6개국 밖 사용자가 처음으로 커버된다. `nationality` 자유 입력은 그대로 두었다(국적으로 어떤 판정도 하지 않는 현 설계 유지).
- [x] **대사관 5건(영/캐/호/독/프) `needs_review` 해소** (2026-08-06) — 5건 전부 각 정부의 공식 페이지에서 확인했고, **4건이 틀렸거나 불완전했다.**

  | 공관 | 발견 | 조치 |
  |---|---|---|
  | 캐나다 | 앱의 URL이 **404**. Global Affairs가 경로를 `korea-coree` → `republic_korea-republique_coree`로 옮겼다 | URL 교체. 우편번호·이메일·24/7 영사 지원 추가 |
  | 프랑스 | 앱의 `kr.ambafrance.org`가 **`kr.diplomatie.gouv.fr`로 301**. 프랑스 정부 공식 명부에 앱에 없던 **긴급번호 010-8753-3276**이 공표되어 있다 | 출처를 정부 명부로 교체, 주소·긴급번호 추가 |
  | 독일 | 번호는 맞았으나 **야간 긴급번호 010-5240-7124**가 누락 | 주소 전체와 야간번호 추가 |
  | 호주 | 번호는 맞았으나 **24시간 영사긴급센터 +61 2 6261 3305**가 누락 | 주소 전체와 긴급센터 추가 |
  | 영국 | **gov.uk가 이 공관의 전화번호를 공표하지 않는다.** 긴급 상황도 온라인 폼으로 안내한다 | 앱이 들고 있던 02-3210-5500을 **삭제**. 미국 야간번호·LOST112 영어지원과 같은 판단 |

  > 영국 건은 값을 못 찾은 것이 아니라 **출처가 공표하지 않기로 한 것**이다. 2차 출처에는 번호가 널려 있지만, 그 기관 자신이 폼으로 보내고 있는데 앱이 번호를 들고 있으면 앱이 더 안다고 주장하는 셈이 된다.
- [x] **112·119 통역 제공 방식의 1차 문서화** (2026-08-29) — 경찰청은 112 외국어통역센터를 공식 공고로 확인할 수 있어 "통역을 요청"하는 경로를 기록했다. 소방청은 영문 119 신고앱과 외국인에게 유용한 영상신고를 공식 문서화하지만 현재 음성 통역의 언어·연결 절차는 밝히지 않으므로 앱은 이를 `needs_review`로 남기고 119·1330 확인 경로를 함께 둔다.

---

## 5. 온보딩 · 조건 축 (사용자 입력 — 12축)

`conditionRules.ts`의 `CONDITION_AXES`. 앱이 **추론하지 않고 반드시 사용자에게 묻거나 `unknown`으로 유지**해야 하는 값들 (CLAUDE.md MUST 7).

| 축 | 선택지 | 화면 |
|---|---|---|
| `universityId` | 9개 대학 + unknown | `university.tsx` |
| `programType` | exchange / visiting / unknown | `program.tsx` |
| `visaTypeOrStatus` | D-2-6 / D-2-8 / visa_free / other / unknown | `program.tsx` |
| `housingType` | dormitory / own_lease / third_party_lease / registered_business / unknown | `housing.tsx` |
| `contractHolder` | self / third_party / none / undecided / n_a / unknown | `housing.tsx` |
| `totalStayDays` | 정수 입력 / unknown | `stay-length.tsx` |
| `nationality` | 자유 입력 / unknown | `nationality.tsx` |
| `homeCountryInsurance` | yes / no / unknown | `nationality.tsx` |
| `residenceCardStatus` | — | `profile.tsx` |
| `arrivalDate` / `departureDate` / `programStartDate` | 날짜 (KST) | `dates.tsx` |

**이 축들은 콘텐츠가 아니라 입력**이므로 실제 정보 확보 대상이 아니다. 다만:

- [ ] **`visaTypeOrStatus` 선택지가 현행 체류자격 분류와 맞는지 확인** — D-2-6(교환학생), D-2-8(단기연수) 세부코드가 현재도 유효한지 법무부 체류자격 표로 대조.
- [ ] **`nationality` 자유 입력** — 대사관 매칭·비자 면제 판정에 쓰려면 표준 국가 목록이 필요. 현재는 문자열이라 어떤 규칙도 걸 수 없다. (지금은 이게 **의도된 안전 설계**다 — 국적으로 비자 사실을 추론하지 않겠다는 것. 확장 시 재검토.)

---

## 6. Want-to 템플릿 (6개) — 사용자 생성 콘텐츠

`src/data/bucketTemplates.ts`. 민화 6종. 사용자가 항목을 직접 쓰므로 **U 등급, 편집 검증 대상 아님.**

| key | 이름 | 상징 | 용도 힌트 |
|---|---|---|---|
| `peony` | Peony (모란) | 부귀, 풍요 | 카페, 패션, 뷰티 |
| `tiger` | Tiger (호랑이) | 용기, 수호 | 모험, 도전 음식, 등산 |
| `crane` | Crane (학) | 장수, 평화 | 느린 여행, 템플스테이 |
| `lotus` | Lotus (연꽃) | 정화, 재생 | 자기돌봄, 기록, 학습 |
| `chaekgeori` | Chaekgeori (책가도) | 학문, 호기심 | 책, 수업, 언어 |
| `sansuhwa` | Sansuhwa (산수화) | 산수, 방랑 | 여행, 하이킹, 자연 |

- [ ] **민화 상징 해설의 문화적 정확성 검토** — C 등급이지만 문화 콘텐츠이므로 오독은 브랜드 리스크. 국립민속박물관/국립중앙박물관 자료로 1회 확인 권장.

---

## 7. 병풍 아트 (3 시대 × 8 폭 = 24)

`assets/byeongpung/`. 완료 6개당 1폭, 48개면 전부. 시대 전환은 진행도를 보존한다 (MUST 10).

| 시대 | 파일 | 8개 모티프 |
|---|---|---|
| Silla (신라) | `byeongpung_silla_*.png` | chaekgeori · crane · lotus · mountain · peony · sun · tiger · wave |
| Goryeo (고려) | `byeongpung_goryeo_*.png` | 동일 8종 |
| Joseon (조선) | `byeongpung_joseon_*.png` | 동일 8종 |

마스터 원본 3종 `assets/byeongpung/masters/*_v2.png`. 자산은 전부 존재하며 테스트로 24개 존재가 고정되어 있다.

- [ ] **시대별 모티프 고증** — `DESIGN.md` / `BYEONGPUNG_ART_DIRECTION.md` 소관. 삼국~조선의 도상 차이가 실제 미술사와 어긋나지 않는지. 챔각(chaekgeori)은 조선 후기 장르이므로 신라·고려 버전은 **의도적 양식화**임을 아트 디렉션 문서에 명시할 것.

---

## 8. 1차 출처 레지스트리 (현재 코드에 실제로 들어 있는 URL)

| 출처 | URL | 사용처 | checkedAt |
|---|---|---|---|
| 출입국관리법 §37(1) | `law.go.kr/LSW/lsInfoP.do?lsiSeq=245973` | G1 거소증 반납 | 2026-07-25 |
| 법무부 외국인등록증 수수료 고시 | `immigration.go.kr/bbs/immigration/47/590299/artclView.do` | residence-registration | 2026-07-27 |
| 법무부(영문) | `immigration.go.kr/bbs/immigration_eng/229/590314/artclView.do` | ARC 수수료 conflictValue | 2026-07-25 |
| HiKorea 방문예약 | `hikorea.go.kr/Main.pt` | immigration-appointment | 2026-07-25 |
| HiKorea 신청 경로 | `hikorea.go.kr/board/BoardApplicationListR.pt` | ARC 수수료 conflictValue | 2026-07-25 |
| 찾기쉬운 생활법령 | (통신 해지 절차) | G2 | 2026-07-25 |
| 국민건강보험공단 외국인 안내 | (NHIS) | G5 | 2026-07-25 |
| Fulbright Korea 출국 핸드북 | `fulbright.or.kr/en/handbook/leaving-korea/` | G4 은행 | 2026-07-25 |
| CIEE 블로그 | `ciee.org/.../getting-arc-without-hirevisa` | ARC conflictValue | 2026-07-25 |
| 연세대 GIT 안내 | `git.yonsei.ac.kr/...` | housing-proof, group-registration | 2026-07-27 |
| 중앙대 OIA | `oia.cau.ac.kr/cauoia/exchange/visa.do` | cau | 2026-07-27 |
| 연세대 GOSC | `gosc.yonsei.ac.kr/gosc/visa/maintaining.do` | yonsei | 2026-07-27 |
| 고려대 GSC | `gsc.korea.ac.kr/...` | korea | 2026-07-27 |
| 정부24 대학교 성적 증명 (교육부) | `gov.kr/mw/AA020InfoCappView.do?CappBizCD=13404000008` | G6 성적증명서 | 2026-08-04 |
| 법무부 서울/인천/경기 관할구역 안내 | `immigration.go.kr/immigration/2057/subview.do` | 9개 대학 캠퍼스·실거주지의 출입국 관할 매핑 | 2026-08-29 |
| 정부24 기관찾기 | `gov.kr/portal/orgInfo` | 실거주지의 정확한 동 주민센터 확인 경로 | 2026-08-29 |
| 경찰청 112 외국어 통역센터 공고 | `police.go.kr/user/bbs/BD_selectBbs.do?q_bbsCode=1004&q_bbscttSn=20260223174650936` | 112 외국어 통역센터 존재 확인 | 2026-08-29 |
| 소방청 119 신고앱 영문서비스 안내 | `nfa.go.kr/nfa/news/pressrelease/press/?cntId=352&mode=view&pageIdx=3` | 119 영문 앱·외국인용 영상 신고 경로; 음성 통역은 미확인 | 2026-08-29 |
| 국민건강보험공단 외국인 안내 (영문) | `nhis.or.kr/english/wbheaa02900m01.do` | D-2 건강보험 적용·6개월·학생 경감·가입 제외 서류 확인 | 2026-08-29 |
| 국민건강보험공단 외국인민원센터 | `nhis.or.kr/english/wbheaa02100m01.do` | 서울 외국인민원센터·외국어 연락처 | 2026-08-29 |
| 한국천문연구원 2026 월력요항 | `astro.kasi.re.kr/life/post/almanac?year=2026` | 관공서 공휴일·대체공휴일·선거일 테이블 | 2026-08-29 |
| 경찰청 112 신고 | `112.go.kr` | 긴급 112 | 2026-08-04 |
| 소방청 119 구급신고 요령 | `nfa.go.kr/nfa/safetyinfo/emergencyservice/119emergencydeclaration/` | 긴급 119 | 2026-08-04 |
| 법무부 외국인종합안내센터 | `moj.go.kr/moj/196/subview.do` | 긴급 1345 운영시간 | 2026-08-04 |
| 한국관광공사 1330 8개국어 확대 | `knto.or.kr/pressRelease/429189` | 긴급 1330 운영시간·언어 | 2026-08-04 |
| 120다산콜재단 외국어 상담 | `120dasan.or.kr/dsnc/main/contents.do?menuNo=200020` | 긴급 120 | 2026-08-04 |
| 외교부 주한공관주소록 (영문) | `mofa.go.kr/eng/pgm/m_5789/uss/cnsrshp/inKoEmblgbdAdres.do` | 대사관 전체, 여권 분실 | 2026-08-04 |
| 세브란스 국제진료센터 (영문) | `sev.severance.healthcare/sev-en/ihc/overview.do` | 의료 | 2026-08-04 |
| 서울아산 국제진료센터 (영문) | `eng.amc.seoul.kr/gb/lang/specialities/centers.do?hpCd=D100` | 의료 | 2026-08-04 |
| 삼성서울 국제진료센터 (영문) | `samsunghospital.com/en/international-healthcare-center.do` | 의료 | 2026-08-04 |
| 대한약사회 휴일지킴이약국 | `pharm114.or.kr` | 심야·휴일 약국 | 2026-08-04 |
| 경찰청 유실물 종합관리시스템 | `lost112.go.kr` | 분실물 | 2026-08-04 |
| 서울교통공사 유실물센터 | `smrte.co.kr/support/lost` | 지하철 유실물 | 2026-08-04 |
| 서울시 대중교통 분실물센터 | `news.seoul.go.kr/traffic/find` | 택시·버스 유실물 | 2026-08-04 |
| 국립국어원 로마자 표기법 | `korean.go.kr/front/page/pageView.do?page_id=P000148` | 긴급 한국어 로마자 | 2026-08-04 |
| 주한미국대사관 | `kr.usembassy.gov/contact-us/` | 대사관 — 미국 | 2026-08-04 |
| British Embassy Seoul (gov.uk) | `gov.uk/world/organisations/british-embassy-seoul` | 대사관 — 영국 | 2026-08-06 |
| Embassy of Canada to the Republic of Korea | `international.gc.ca/country-pays/republic_korea-republique_coree/seoul.aspx` | 대사관 — 캐나다 | 2026-08-06 |
| Australian Embassy Seoul | `southkorea.embassy.gov.au/seol/contact.html` | 대사관 — 호주 | 2026-08-06 |
| Deutsche Botschaft Seoul | `seoul.diplo.de` | 대사관 — 독일 | 2026-08-06 |
| 프랑스 정부 공관 명부 (service-public.gouv.fr) | `lannuaire.service-public.gouv.fr/ambassades/c06c38df-…` | 대사관 — 프랑스 | 2026-08-06 |
| 성균관대 국제학생지원팀 (영문) | `skku.edu/eng/International/AboutDivision/AbouttheInternationalAffairsDivision03.do` | skku | 2026-08-06 |
| 서강대 국제학생팀 | `oisa.sogang.ac.kr/oisa/index.do` | sogang | 2026-08-06 |
| 한국외대 외국인유학생종합지원센터 | `issc.hufs.ac.kr` | hufs | 2026-08-06 |
| 국가유산청 궁능유적본부 관람요금 | `royal.khs.go.kr/ROYAL/contents/R703000000.do` | 한복 미션 고궁 면제 | 2026-08-06 |
| 국립중앙박물관 관람 안내 | `museum.go.kr/MUSEUM/contents/M0101000000.do` | 박물관 미션 | 2026-08-06 |
| K공항리무진 요금표 | `klimousine.com/bus/busfare.php` | 공항 이동 미션 | 2026-08-06 |
| 보건복지부 고시 제2025-186호 (건강보험요양급여비용의 내역) | `mohw.go.kr/board.es?mid=a10409020000&bid=0026&list_no=1487937` | 진료비 미션 — 고시 존재·시행일만 | 2026-08-06 |

**2차 출처 2건의 처리 상태** — Fulbright Korea와 CIEE 안내는 기관의 실무 참고자료로 유지하되, 각각 `secondary; not an authority` 라벨과 `conflictNote`를 붙였다. ARC 수수료와 계좌 폐쇄의 최종 판단은 법무부/HiKorea·은행 지점 등 1차 권위에 위임한다.

**최종 권위(finalAuthority) 지정 현황** — HiKorea / 출입국 1345 / NHIS 1577-1000 / 각 대학 국제처 / 각 통신사 / 각 은행 지점. 이 부분은 잘 되어 있다.

---

## 9. 우선순위 — 실제 정보 확보 순서

이 순서는 **틀렸을 때의 피해 크기**로 정렬했다.

### P0 — 릴리스 전 필수 · **2026-08-04 완료**

1. [x] **긴급 정보 25개 항목 전수 검증 + 출처 필드 추가** (§4). 25/25 근거 부착, 사실 오류 4건 정정, 썩는 데이터 2건 교체, 미확인 주장 1건 철회. 대사관 5건은 `needs_review`로 **표시하며 유지**(§4.3).
2. [x] **`departure-order`, G3, G6의 `UNCONFIRMED_SOURCE` 해소** (§1.3). G6은 1차 출처 확보. G3와 `departure-order`는 **1차 출처가 존재하지 않음을 확정**하고, 공백을 근거와 함께 기록한 뒤 근거 없는 지시문을 제거했다.
3. [x] **미션 3건의 행정 사실을 Essentials 트랙과 대조** (§2.5). 모순 3건 실재 확인 후 해소.

> P0의 판정 기준은 "모든 값을 확보한다"가 아니라 **"출처 없이 지시하지 않는다"** 로 잡았다. 그래서 1차 출처가 없는 것으로 확인된 항목(G3 보증금, `departure-order`, 대사관 5건)은 값을 지어내지도, 조용히 남기지도 않고 **공백을 이유와 함께 화면에 드러내는 것**으로 종결했다.

**P0에서 파생된 잔여 작업** (P1로 이관, 위 §4.3·§2.5에 상세)
- ~~대사관 5건 `needs_review` 해소~~ → **2026-08-06 완료** (§4.3, 4건 정정)
- ~~112·119 통역 제공 방식의 1차 문서화~~ → **2026-08-29 완료.** 112 통역센터는 `verified`, 119 직접 음성 통역은 `needs_review`로 분리하고 영문 앱·영상 경로를 표시했다.
- ~~미션 3건에 `evidence` 필드 부착~~ → P2 항목 8에서 55개 전체에 적용 완료

### P1 — 신뢰도 직결 · **2026-08-29 반영**

4. **대학 9개 × 기숙사·교통 블록 재확인** (§3.4).
   - [x] 9개교 주소·교통은 공식 캠퍼스 안내에서 대조하고 `contentEvidence`를 부착했다.
   - [x] 기숙사 9개교는 공식 생활관 출처를 연결했다. 세부 규정·세탁요금 미확인 값은 일반화하고 `needs_review`로 표시했다.
5. **`nearbyEats` 상권 단위 전환** (§3.4 2안) — **완료.** 개별 점포명을 제거하고 상권·시장·대학가 라벨로 전환했다.
6. **운영자 공시 요금 8건 확인** (§2.3 B 등급) — 공식 조회로 확정할 수 없는 T-money·KTX·세탁요금·진료비 금액을 제거하고 `needs_review`를 부착했다. 결과는 §2.6.
   - 처리: AREX(값 제거), 공항 리무진(값 정정), 박물관(가격대 제거), 진료비(값 제거)
   - 잔류: 없음 — 확정할 수 없는 금액은 앱에서 제거하고 공식 조회처·최종 권위 확인으로 전환
7. **2차 출처 2건(Fulbright, CIEE) 1차 교체** (§8) — 가능한 1차 권위를 최종 권위로 명시하고, 남은 기관 안내는 `secondary; not an authority` conflict note로 표시했다.

### P2 — 구조 정비

8. ~~**`Mission`에 `evidence` 필드 추가**, 55건 source ledger 생성 (§2.4).~~ → **2026-08-29 완료.** [`MISSION_SOURCE_LEDGER.md`](./MISSION_SOURCE_LEDGER.md)가 55개 행을 가지며, 코드의 `Mission`은 `evidence`, `completeWhen`, `owner`를 모두 요구한다. `needs_review`·`unknown`은 해소 전까지 표시한다.
9. ~~**`EmergencySection`에 출처 필드 추가**~~ → **2026-08-04 완료** (P0-1이 요구해 앞당김).
10. **`owner` 필드 실제 담당자 지정** — 카탈로그에는 `K-Journey Content Operations` 역할을 지정했다. 특정 담당자 이름과 운영 연락처는 후속 확정이 필요하다.
11. **기숙사 신청 일정처럼 학기마다 변하는 값을 상수에서 분리** (§3.4).

---

## 10. 유지 규칙

- **썩는 데이터는 앱에 박지 않는다.** 개별 상점, 학기 일정, 개별 지점 영업시간은 상수 후보가 아니다. 상권·기관·공식 조회처로 한 단계 올린다.
- **모르면 `unknown`을 유지한다.** 비자·주거·보험·거소증·날짜를 추론하지 않는다 (MUST 7).
- **모든 공식 링크는 실제로 눌러지고, 신선도가 보이고, 최종 권위가 남아야 한다** (MUST 12).
- **재검증 주기**: Class A 30일 / B 90일 / C 180일 (`CONTENT_GOVERNANCE.md`).
- **릴리스 게이트**: 콘텐츠 파일 diff → 변경된 A/B 클레임 1차 출처 재확인 → 개수·ID·페이즈 테스트 → 미해결 항목을 `needs_review`로 기록. 조용히 `verified`로 올리지 않는다.

---

## 11. 추가 권장 콘텐츠 — 지금 없는 것

§1–7이 "있는 것의 검증"이라면, 이 절은 **"교환학생의 실제 여정에서 앱이 아직 답하지 못하는 것"** 이다.
아래 항목은 전부 `grep`으로 코드에 없음을 확인했다.

> ⚠️ 이 절의 주제들은 **아직 검증된 사실이 아니다.** "이 주제를 다뤄야 한다"는 제안이지, "사실이 이러하다"는 서술이 아니다.
> 각 항목의 실제 값은 §11.6의 절차대로 1차 출처에서 확인한 뒤에만 앱에 넣는다.

### 11.0 추가 여부 판단 필터

새 콘텐츠는 아래 4개를 **전부** 통과해야 한다. 하나라도 걸리면 넣지 않는다.

| # | 필터 | 탈락 예시 |
|---|---|---|
| 1 | 기존 12개 조건 축으로 분기되거나, 모든 사용자에게 동일한가? | 개인 취향 추천 |
| 2 | 학기·계절 단위보다 빨리 썩지 않는가? | 환율, 실시간 교통, 개별 상점 영업시간 |
| 3 | 1차 공식 출처가 존재하는가? | 커뮤니티 후기, 블로그 경험담 |
| 4 | PRD §9 "아직 포함하지 않음"에 걸리지 않는가? | 계정, 사진 업로드, 위치 인증, CMS |

---

### 11.1 A급 누락 — 넣지 않으면 사용자가 법·돈·건강에서 다치는 것

#### ① 시간제취업(아르바이트) 허가 — **가장 큰 누락**

`src/data/admin.ts`에 조건부 라우팅과 `TaskSourceMetadata`를 추가했다. 현재 화면 모델에는 세부 전공·학기·출석률·고용주 정보가 없으므로, D-2-6/D-2-8은 **허가를 먼저 받아야 함**만 확인하고 직종·시간·서류의 허용 여부는 `needs_review`로 남긴다.

D-2 체류자격은 학업이 목적이므로 취업 활동에 별도 허가가 필요한 구조다. 교환학생이 **모르고 위반하는 대표 사례**이고, 결과가 체류자격 위반(=출국 명령까지 갈 수 있음)이라 소비자 피해가 가장 크다. 앱은 이미 `visaTypeOrStatus` 축을 갖고 있으므로 조건 분기도 즉시 가능하다.

- 확인 대상: 허가 필요 여부와 신청 경로, 자격 요건, 시간 상한, 업종 제한, 무허가 시 결과
- 1차 출처: HiKorea, 법무부 출입국·외국인정책본부
- 최종 권위: 1345 / 관할 출입국·외국인청
- 형태: **Essentials 조건부 태스크** (`visaTypeOrStatus` = D-2 계열일 때)

구현 진입점: `evaluatePartTimeWork()` / `evaluatePartTimeWorkForProfile()` 및 `PART_TIME_WORK_METADATA`.

#### ② 국민건강보험 가입 — 절반만 있음

현재: 온보딩 `nationality.tsx:108`에 NHIS 가입 제외 관련 안내 문구가 **있고**, 출국 태스크 G5(전자고지 전환)도 **있다.**
없는 것: **가입 자체를 다루는 태스크.** 즉 앱은 "나갈 때 정리하는 법"은 알려주는데 "들어올 때 가입되는 구조"는 안 알려준다.

- 이미 `homeCountryInsurance` 축을 받고 있는데 이 축이 연결되는 태스크가 없다 → **축은 있고 콘텐츠가 없는 상태**
- 확인 대상: 유학생 가입 시점·요건, 보험료 산정, 본국 보험으로 인한 제외 요건과 필요 서류
- 1차 출처: 국민건강보험공단
- 최종 권위: NHIS 1577-1000

`src/data/admin.ts`의 `evaluateHealthInsurance()`는 D-2-6/D-2-8에 대해 NHIS의 6개월 기준·학생 50% 경감 안내를 연결한다. 본국 보험은 자동 면제가 아니라 증빙을 갖춘 **가입 제외 심사**로 처리하며, 보험료·정확한 자격일은 NHIS 확인 전까지 계산하지 않는다. 서울 외국인민원센터와 외국어 전화 경로도 함께 제공한다.

#### ③ 관할 출입국·민원 기관 매핑 — 정적이고 확실한 실제 정보

현재 `missions.ts:194`에 `mapHint: 'Seoul Immigration Office, Mok-dong (목동)'` 하나가 **전체 사용자에게 동일하게** 나간다. 그런데 관할 기관은 **주소지에 따라 다르다.**

- 9개 대학 캠퍼스 소재지 → 관할 출입국·외국인청/사무소 매핑 (9건)
- 기숙사 거주자와 교외 거주자의 관할이 다를 수 있음 → `housingType` 축으로 분기
- 체류지 신고에 필요한 주민센터도 동일 구조
- **썩지 않고, 공식 출처가 명확하고, 이미 있는 축으로 분기된다** → 필터 4개 전부 통과. 우선순위 높음.

`src/data/admin.ts`에 9개 대학 캠퍼스 구와 서울청·세종로출장소·서울남부의 공식 관할표를 연결했다. 기숙사 선택은 캠퍼스 구를 **프록시**로 쓰고 주소 확인을 요구한다. 교외 거주는 `residenceDistrict`가 입력되기 전까지 `review_required`이며, 주민센터는 구 단위가 아니라 전체 등록 주소의 동 주민센터를 Government24에서 다시 찾도록 한다.

#### ④ 공휴일·기관 휴무 캘린더 — 행정 타이밍의 숨은 변수

`src/lib/holidays.ts`에 KASI 2026 월력요항 기반 20개 공휴일·대체공휴일·선거일 테이블을 추가했다. 토·일요일과 공휴일을 구분하고, 테이블에 없는 연도는 `unknown`으로 반환해 날짜를 열려 있다고 추정하지 않는다.

앱은 `arrivalDate` / `programStartDate` / `departureDate`를 받아 `usePhase`로 시기를 계산하고 태스크 기한을 안내한다. 그런데 **설·추석 연휴에는 출입국·은행·주민센터가 닫는다.** 지금 구조는 연휴 한복판에 "이번 주에 방문하세요"를 띄울 수 있다.

- 확보: 연 단위 관공서 휴무일 (공공데이터포털 특일 정보 등 공식 출처)
- 적용: `DueRule` 계산 시 휴무일 회피, 연휴 직전 "이번 주 안에 처리" 경고
- 형태: **콘텐츠가 아니라 날짜 로직의 입력값.** `src/lib/dates.ts` 옆에 정적 테이블
- 부수 효과: 문화 미션의 명절 체험(설·추석·연등회 등)도 이 테이블로 시기 노출 가능

구현 진입점: `governmentDayStatus()`, `adjustDueDateToPreviousGovernmentBusinessDay()`, `addGovernmentBusinessDays()`. 2027년 이후 공휴일은 공식 월력요항을 확인한 뒤 테이블을 갱신해야 한다.

#### ⑤ 돈 — 계좌 개설과 폐쇄 사이가 통째로 비어 있음

`remittance` / `송금` / `ATM` / `currency` **코드에 0건.**
현재 있는 것은 계좌 **개설**(미션 `p2_bank`)과 계좌 **폐쇄**(G4)뿐이다. 그 사이 4~10개월의 실제 돈 문제가 없다.

| 주제 | 왜 필요한가 | 등급 |
|---|---|---|
| 해외 송금 수령 | 학비·생활비가 본국에서 온다. 수취 절차와 증빙 요구가 실제 마찰점 | A |
| 해외 카드 사용 ATM | 국내 ATM 상당수가 해외 카드를 안 받는다. 도착 첫날 문제 | B |
| 학비·기숙사비 납부 경로 | 가상계좌/해외송금 대행 등 대학별로 다름 | B (대학별) |
| 통신 요금제 구조 | 알뜰폰 vs 통신 3사 — 단기 체류자 선택이 다름 | B |
| 세금 환급(택스리프리) | 출국 시 실제로 쓰는 절차 | C |

- 1차 출처: 각 은행/카드사, 한국은행 외국환거래 안내, 각 대학 재무처
- 주의: **환율·수수료 수치는 넣지 않는다** (필터 2 위반). 절차와 준비 서류만.

---

### 11.2 사용자 가치가 큰 확장

#### ⑥ 학사(Academic) 트랙 — 55개 미션에 학교가 없다

`course` / `수강` / `semester` / `midterm` **실질 0건.** 출국 태스크 G6(성적증명서)만 있고 **그 앞의 한 학기가 통째로 없다.**

교환학생이 실제로 가장 스트레스받는 구간인데(수강신청 경쟁, 학점 인정, 상대평가, 팀플), 현재 앱은 "떡볶이 먹기"는 안내하고 "수강신청"은 안내하지 않는다. **PRD §3.2의 "내 조건에서 지금 해야 하는 일"에 학사가 빠져 있는 것은 범위 누락으로 보인다.**

- 대학 공통(B급): 학사일정 구조, 성적 체계, 수강신청 방식, 학점 인정 절차 개요
- 대학별(B급, `volatility: high`): 실제 일정 날짜 → **상수로 박지 말고 각 대학 학사일정 페이지 링크로**
- 형태: Essentials의 새 스테이지 또는 Culture의 `settle` 확장 — **어디에 넣을지는 제품 결정 필요**

> ⚠️ 이건 콘텐츠 추가가 아니라 **범위 확장**이다. `DEC-040`이 Essentials를 "행정"으로 정의하고 있어, 학사를 넣으려면 새 결정이 필요하다.

#### ⑦ 의료 이용 절차 — 번호만 있고 절차가 없다

현재 `emergency.ts`는 병원 **전화번호**를 준다. 없는 것은 **어떻게 쓰는지**다.

- 의원과 대형병원의 이용 순서, 진료의뢰서가 필요한 경우
- 약국에서 바로 살 수 있는 것과 처방이 필요한 것의 구분
- **정신건강 지원** — `counsel` / `mental health` **0건**. 교환학생의 문화 적응 스트레스는 실제 이슈이고, 대학마다 상담센터가 있다. 9개 대학 학생상담센터 연락처는 정적이고 공식 출처가 있다. **A급으로 다뤄야 한다.**
- 여성 건강·산부인과 접근성 — 이대 사용자가 있고, 정보 접근이 특히 어려운 영역

#### ⑧ 안전 — 긴급번호 이후가 없다

현재 `emergency.ts`는 사고가 **터진 뒤**를 다룬다. 예방이 없다.

- 재난문자(긴급재난문자) — 한국어로만 오는 경우가 많아 외국인이 무시하게 됨. **"이게 뭔지" 설명만 있어도 가치가 큼**
- 심야 안전 귀가 지원 서비스
- 불법촬영 신고 경로
- 미세먼지·폭염·한파 경보 시 행동
- 1차 출처: 행정안전부, 서울시, 경찰청

#### ⑨ "하면 안 되는 것" — 현재 앱에 금지 정보가 없다

55개 미션은 전부 **"해보세요"** 다. 금지·처벌 정보는 `p2_recycling`(분리배출) 하나뿐이다.

교환학생이 실제로 걸리는 것들 — 무허가 취업(①과 연결), 대마 등 약물(한국은 국외 행위도 처벌하는 구조라 본국에서 합법인 학생이 특히 위험), 음주·야간 소음 관련 규정, 지하철·대중교통 규범.

- 형태: 미션이 아니라 **More 탭의 독립 참조 화면** — 완료 대상이 아니므로 병풍 총합에 들어가면 안 된다
- 톤 주의: 겁주기가 아니라 "본국과 다른 점"으로 서술. `DESIGN.md`의 `error` 색은 진짜 경고에만.

---

### 11.3 새 콘텐츠가 아니라 — 이미 있는 축을 쓰는 것

가장 저렴하게 가치를 올리는 구간이다. **데이터를 새로 만들지 않고 분기만 추가**한다.

| 축 | 현재 상태 | 추가 가능한 분기 |
|---|---|---|
| `totalStayDays` | 입력받음 | 단기 체류(90일 미만)와 장기의 등록 의무 경로가 갈린다. 이 분기가 없으면 단기 사용자에게 불필요한 태스크를 보여준다 |
| `homeCountryInsurance` | 입력받음 | §11.1②의 가입/제외 분기에 직결 |
| `nationality` | 자유 문자열 | 대사관 매칭에 쓸 수 있으나, **국적으로 비자 사실을 추론하지 않는다**는 현재 설계가 옳다. 대사관 연락처 매칭에만 한정 사용 |
| `contractHolder` | 입력받음 | 이미 `conditionRules.ts`에서 잘 쓰임 — 이게 좋은 사례 |

#### ⚠️ 발견된 v1 잔재 — `stayType` (2026-08-04 재확인으로 정정됨)

`profile.tsx`는 `language`(어학연수)와 `working-holiday`(워킹홀리데이)를 선택지로 제공하고, `program.tsx`의 `programType`은 `exchange` / `visiting`만 있다.

**이 화면은 도달 불가능하다.** 초기 서술("앱이 D-4·H-1 사용자를 받고 있다")은 틀렸으므로 정정한다:

- `ONBOARDING_ROUTES`(`storage.ts:27`)는 7개이고 `profile`·`sign-in`을 포함하지 않는다.
- `app/_layout.tsx:190`·`:198`이 온보딩 완료·미완료 **양쪽 상태 모두에서** 두 경로를 리다이렉트한다.
- `stayType`은 **write-only** — 읽는 곳 0, export 0, migration 0, test 0.

→ 잘못된 안내가 나가는 **버그는 없다.** 남는 문제는 ① 웹 직접 URL로 v1 화면이 순간 렌더될 수 있음 ② 데드 코드가 감사를 오염시킴(실제로 이 인벤토리 작성 중 오판을 유발함).

**선택지와 권장은 `docs/OPEN_DECISIONS_CONTENT_SCOPE.md` 결정 2에 정리했다.**

---

### 11.4 콘텐츠 품질 — 이미 있는 것을 더 낫게

#### ⑩ 미션 55개의 완료 기준 — 화면에 하드코딩되어 있다

PRD §5.3은 상세 화면이 `Complete when` 기준을 보여준다고 규정한다. 실제로 보여준다. 그런데:

`app/mission/[id].tsx:228`의 `completionStandard()`는 **개별 예외 3건(`p1_pack`, `p1_visa`, `p1_apps`) + 카테고리 기본문 4개**로 되어 있다. 즉 **52개 미션이 "You have tried the food or place yourself" 같은 카테고리 공통 문장을 공유한다.**

- 문제: 콘텐츠가 **뷰 레이어에** 있다. 콘텐츠 담당자가 화면 코드를 고쳐야 문구를 바꿀 수 있고, 미션 데이터 테스트의 검증 범위 밖이다.
- **완료 (2026-08-29):** `Mission`에 `completeWhen: string` 필드를 추가하고 55건에 개별 기준을 작성했다. 출처 `evidence`와 함께 [`MISSION_SOURCE_LEDGER.md`](./MISSION_SOURCE_LEDGER.md)에서 관리한다.

#### ⑪ Want-to 템플릿에 시드 예시가 없다

6개 템플릿은 `hintFor`("카페, 패션, 뷰티") 한 줄만 준다. 빈 화면에서 사용자가 직접 항목을 써야 한다.

- 템플릿당 예시 항목 5~8개를 **비강제 제안**으로 (탭하면 추가, 무시 가능)
- 사용자 데이터가 아니라 **편집 콘텐츠**이므로 U등급이 아니라 C등급 — 문화적 정확성 검토 대상
- 효과: PRD §7의 "경험 활성화 7일 내 45%" 지표에 직접 작용하는 몇 안 되는 레버

#### ⑫ 병풍 8개 모티프의 의미 해설이 없다

24개 이미지는 있는데 `PANEL_MOTIF_NAMES` 외에 **각 모티프가 무엇이고 왜 이 순서인지**를 설명하는 텍스트가 없다. 사용자 입장에서는 "그림이 열렸다"까지만 있고 "무엇이 열렸는지"가 없다.

- 8개 모티프 × 3시대 = 최대 24개 짧은 해설 (시대 무관하면 8개)
- 국립중앙박물관·국립민속박물관 자료 기반, C등급
- `BYEONGPUNG_ART_DIRECTION.md`가 소유해야 할 내용

---

### 11.5 넣지 말아야 할 것 (범위 규율)

제안이 들어오면 여기에 먼저 대조한다.

| 항목 | 이유 |
|---|---|
| 실시간 환율·날씨·교통 | 필터 2 위반. 오프라인 우선 + CMS 없음과 배치 |
| 개별 상점·카페·식당 | 필터 2 위반. §3.4에서 이미 상권 단위 전환 권고 |
| 사용자 후기·커뮤니티·소셜 피드 | PRD §9 명시적 제외 |
| 사진 업로드 기반 인증 | PRD §9 명시적 제외 + `LOCAL_DATA_LIFECYCLE.md` |
| 자동 위치 기반 미션 완료 | PRD §9 명시적 제외 |
| 국적별 비자 자동 판정 | MUST 7 위반 — 앱은 비자 사실을 추론하지 않는다 |
| 정확한 법정 기한·수수료를 출처 없이 | MUST 12, `CONTENT_GOVERNANCE.md` 위반 |

---

### 11.6 추가 순서 제안

§9의 P0–P2(기존 콘텐츠 검증)와 **병렬로 진행하지 않는다.** 검증되지 않은 콘텐츠 위에 새 콘텐츠를 얹으면 원장이 두 배로 늘어난다.

| 단계 | 내용 | 전제 |
|---|---|---|
| **N0** | ③ 관할 기관 매핑, ④ 공휴일 테이블 | **2026-08-29 완료.** 9개 대학 캠퍼스 구를 관할표에 연결했고, 교외 거주는 실제 등록 구 입력 전 `review_required`다. 2026년 공휴일은 공식 표를 반영했으며 이후 연도는 `unknown`이다. 체크리스트에 표시 완료 |
| **N1** | ① 시간제취업허가, ② 건강보험 가입 | **2026-08-29 완료.** 허가·가입·감면·면제 심사 경로를 `TaskSourceMetadata`로 기록하고 체크리스트에 표시했다. 직종·시간·정확한 자격일·보험료는 `needs_review` |
| **N2** | ⑩ `completeWhen` + `evidence` 필드, ⑪ Want-to 시드 | **2026-08-29 완료.** 55개 원장·카드별 출처 UI 반영. 특정 담당자와 학기별 일정 갱신은 후속 운영 작업 |
| **N3** | ⑤ 돈, ⑦ 의료 절차, ⑧ 안전, ⑨ 금지 정보 | More 탭 참조 화면 구조 결정 후 |
| **N4** | ⑥ 학사 트랙 | **새 제품 결정 필요** — `DEC-040`의 Essentials 정의를 넓히는 결정 |

**결정 2건은 2026-08-04 확정됐다** (선택지와 기각 사유: `docs/OPEN_DECISIONS_CONTENT_SCOPE.md`).

1. **학사(⑥) → 범위에 넣지 않는다** (`DEC-041`). 기술적 장벽은 없으나 §9 P0가 끝나기 전에는 원장을 늘리지 않는다. 재개 시 진입점은 **안 B(링크 온리)** 이며 `DEC-040` 개정 없이 가능하다. → **위 N4는 보류 상태다.**
2. **v1 온보딩 잔재 → 삭제 완료** (`DEC-042`). `profile.tsx`·`sign-in.tsx` 삭제, `stayType` 제거, 가드 단순화. `npm run check` 통과, 웹 번들에서 v1 문자열 부재 확인. D-4·H-1은 현재 범위 밖으로 명시.

---

## 부록 — 콘텐츠 파일 위치

| 파일 | 소유 콘텐츠 |
|---|---|
| `src/data/missions.ts` | 문화 미션 55 |
| `src/data/universities.ts` | 대학 9 |
| `src/data/emergency.ts` | 긴급 정보 5 섹션 |
| `src/data/bucketTemplates.ts` | Want-to 템플릿 6 |
| `src/lib/taskState.ts` | 핵심 행정 태스크 + `TaskSourceMetadata` 스키마 |
| `src/lib/departureTasks.ts` | 출국 태스크 G1–G9 |
| `src/lib/immigrationAppointment.ts` | 출입국 예약 태스크 |
| `src/lib/dormitoryApplication.ts` | 기숙사 신청 태스크 |
| `src/lib/conditionRules.ts` | 조건 축 12개, 노출 규칙 |
| `src/lib/contentEvidence.ts` | 편집 콘텐츠 근거 스키마 + A/B/C 재검증 주기 |
| `src/data/admin.ts` | 출입국·주민센터 관할 매핑, 시간제취업·건강보험 라우팅 및 근거 |
| `src/lib/holidays.ts` | 공식 공휴일 테이블과 행정 영업일 보수적 계산 |
| `src/components/byeongpung/motifs.tsx` | 병풍 24 패널 매핑 |
| `assets/byeongpung/` · `assets/bucket-templates/` | 아트 자산 |
