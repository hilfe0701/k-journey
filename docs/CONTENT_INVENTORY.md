# Content inventory — K-Journey에 들어가야 할 실제 정보 목록

> 작성일 2026-08-04 · 대상 브랜치 `v2-conditional-orchestration`
> 이 문서는 **무엇이 앱에 들어가야 하는가**의 전수 목록이고, 각 항목이 지금 실제 정보인지 미검증인지를 기록한다.
> 규범(어떻게 검증할 것인가)은 `docs/CONTENT_GOVERNANCE.md`가 소유한다. 이 문서는 그 규범의 **원장(ledger)** 이다.
> 제품 범위의 최종 권위는 `reference/K-Journey_PRD_v2_0_KR.md`와 `DEC-040`.

---

## 0. 한 장 요약

| 콘텐츠 표면 | 항목 수 | 출처 메타데이터 스키마 | 실제 검증됨 | 등급 |
|---|---:|---|---|---|
| 행정 태스크 (Essentials) | 15 | 있음 (`TaskSourceMetadata`) | 12/15 | A |
| 문화 미션 (Culture) | 55 | **없음** | 0/55 | B·C (일부 A 혼입) |
| 대학 레코드 | 9 | 있음 (`UniversityVerification`) | 5/9, 단 비자 항목만 | B |
| 긴급 정보 | 5 섹션 / 25 항목 | **없음** | 0/25 | **A** |
| 온보딩 조건 축 | 12축 / 선택지 26개 | 해당 없음 (사용자 입력) | — | — |
| Want-to 템플릿 | 6 | 해당 없음 (문화 해설) | — | C |
| 병풍 아트 | 3 시대 × 8 패널 = 24 | 해당 없음 (자체 제작) | 자산 존재 | — |

**핵심 결론 3가지**

1. **행정 트랙만 원장을 갖고 있다.** `taskState.ts` / `departureTasks.ts` / `immigrationAppointment.ts` / `dormitoryApplication.ts`는 `sourceUrl`·`checkedAt`·`finalAuthority`·`volatility`·`conflictValues`를 실제로 들고 다닌다. 이 구조가 나머지 표면에 적용되어야 할 표준이다.
2. **문화 미션 55개와 긴급 정보 25개 항목은 출처 필드 자체가 없다.** 그런데 이 안에 원화 금액 25건, 응급 전화번호 5건, 병원·대사관 전화번호 9건이 들어 있다. 형식상 "실제 정보"처럼 보이지만 **추적 불가능**하므로 현재로서는 검증되지 않은 정보로 취급해야 한다.
3. **대학 레코드의 검증은 비자 안내 URL 하나에만 걸려 있다.** `nearbyEats`, `transitRoutes`, `dorm.curfew`, `dorm.laundry` 요금은 `verification` 블록이 커버하지 않는다. 실제로 가장 "더미로 의심되는" 구간이 여기다 (§3.3).

---

## 1. 행정 태스크 — Essentials (15개)

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
| 6 | `departure-order` | Departure order | `taskState.ts` | **`UNCONFIRMED_SOURCE`** ❌ |
| 7 | `G1` 잔여 | Return your residence card | `departureTasks.ts` | 출입국관리법 §37(1) ✅ |
| 8 | `G2` | Cancel your mobile contract | `departureTasks.ts` | 찾기쉬운 생활법령 ✅ |
| 9 | `G3` | Receive your dormitory deposit refund | `departureTasks.ts` | **미확인** ❌ |
| 10 | `G4` | Decide what to do with your bank account | `departureTasks.ts` | Fulbright/SUNY Korea ⚠️ 2차 출처 |
| 11 | `G5` | Switch health-insurance billing to electronic | `departureTasks.ts` | NHIS 외국인 안내 ✅ |
| 12 | `G6` | Request your transcript | `departureTasks.ts` | **미확인** ❌ |
| 13 | `G7` | Stop transit-card auto-charge | `departureTasks.ts` | ⚠️ |
| 14 | `G8` | Cancel internet and utilities | `departureTasks.ts` | ⚠️ |
| 15 | `G9` | Get an entry and exit record certificate | `departureTasks.ts` | ⚠️ |

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
- [ ] **`departure-order` 태스크의 1차 출처** — 현재 `UNCONFIRMED_SOURCE`. 은행 계좌 폐쇄와 보증금 환급의 선후 충돌은 이미 코드가 두 결과를 병기하도록 처리했으나, 출처가 비어 있다.
- [ ] **기숙사 보증금 환급(G3) 대학별 실제 절차** — 9개 대학 각각의 기숙사 사무실 페이지.
- [ ] **성적증명서(G6) 발급 경로** — 대학별 + 해외 발송 가능 여부.
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

`Mission` 인터페이스에는 **출처 필드가 하나도 없다.**

```ts
export interface Mission {
  id; phase; category; titleEn; titleKo?; summary;
  tips: string[];   // ← 여기에 금액·소요시간·규정이 전부 들어 있는데 출처가 없다
  mapHint?; icon; appliesTo?;
}
```

`CONTENT_GOVERNANCE.md`도 이 사실을 인정한다 — *"현재 정적 문화 카탈로그는 이 스키마 이전에 작성되었다."*
그런데 **미션 tips 안에 Class A 정보가 섞여 있다**: `p1_visa`(D-2 비자, 영사관 절차), `p2_arc`(외국인등록증), `p2_bank`(은행 계좌 개설). 이 세 개는 문화 미션이 아니라 행정 정보다.

### 2.3 검증 없이 박혀 있는 구체 수치 — 전수 목록 (원화 25건)

| 위치 | 값 | 무엇에 대한 | 클래스 |
|---|---|---|---|
| `missions.ts:78` | ₩30,000–50,000 | 다이소 침구 세트 | C |
| `:79` | ₩60,000 | 기본 주방용품 | C |
| `:92` | ₩9,500 | AREX 직통열차 | **B — 운임은 공시값** |
| `:93` | ₩17,000 | KAL 리무진 | **B** |
| `:94` | ₩60,000–80,000 | 인천공항 택시 | C |
| `:162` | ₩4,000 | T-money 카드 | **B** |
| `:174` | ₩30,000–55,000 | SIM/eSIM | B |
| `:232` | ₩25,000–35,000 | (기숙사/주거 관련) | C |
| `:245` | ₩2,000 / ₩4,000–6,000 | 코인 세탁 | C |
| `:301` | ₩12,000 / ₩2,000–5,000 | 배달 | C |
| `:310` | ₩7,000–12,000 | 캠퍼스 식당 | C |
| `:368` | ₩4,000 | 길거리 음식 | C |
| `:466` | ₩60,000 | KTX 당일치기 | **B — 공시 운임** |
| `:508` | ₩1,000 | 노래방 | C |
| `:519` | ₩1,500 | PC방 | C |
| `:551` | ₩15,000–25,000 | 한복 대여 | C |
| `:553` | ₩5,000 | (고궁 입장 추정) | **B — 공시 요금** |
| `:565` | ₩5,000–13,000 | 국립중앙박물관 관련 | **B** |
| `:580` | ₩20,000–80,000 | 도장 각인 | C |
| `:661` | ₩3,000–5,000 | 스터디카페 | C |
| `:663` | ₩6,000 | 스터디카페 | C |
| `:675` | ₩4,000–10,000 | 약국·의원 | **B — 진료비는 규정값** |
| `:717` | ₩8,000–15,000 | 선물 | C |
| `universities.ts:66,129,160,221,251,312` | ₩500–1,500 | 각 대학 코인세탁 요금 | B |

→ **B 등급 8건(AREX, KAL 리무진, T-money, KTX, 고궁, 박물관, 진료비, 세탁요금)은 운영자 공시 페이지에서 즉시 확인 가능**하고 확인해야 한다.
→ C 등급은 "가격은 변동될 수 있음" 고지와 함께 편집 가이드로 명시 라벨링하면 유지 가능하다.

### 2.4 미션 트랙에 확보해야 할 실제 정보

- [ ] **55개 전부에 대한 source ledger 생성** — `CONTENT_GOVERNANCE.md`의 비인터뷰 검증 백로그 1번 항목. 이게 미완료 상태다.
- [ ] **`Mission` 인터페이스에 `evidence?: ContentEvidence` 추가** — 거버넌스 문서가 이미 타입을 정의해 뒀다. 코드에는 없다.
- [ ] **행정성 미션 3건 재분류** — `p1_visa` / `p2_arc` / `p2_bank`는 Essentials 트랙의 조건부 규칙과 사실이 어긋날 수 있다. 두 트랙이 같은 사실을 다르게 말하면 안 된다.
- [ ] **운영자 공시 요금 8건** 링크 + `checkedAt` 확보 (§2.3의 B 등급).
- [ ] **`mapHint` 12건** — PRD상 라이브 내비게이션이나 영업시간 보장이 아님을 이미 규정. 각 hint가 실존 장소를 정확히 지시하는지만 확인.
- [ ] **공휴일·계절 의존 미션** — 축제(`Attend a Korean festival`), 한강 치맥, 등산은 시기 의존적. 연 단위 갱신 대상으로 표시.

---

## 3. 대학 레코드 (9개)

`src/data/universities.ts`. MVP 지원 서울 소재 9개교.

### 3.1 대상 대학

| id | 대학 | 캠퍼스 | verification |
|---|---|---|---|
| `cau` | Chung-Ang University (중앙대학교) | 흑석 | `verified` |
| `yonsei` | Yonsei University (연세대학교) | 신촌 | `verified` |
| `korea` | Korea University (고려대학교) | 안암 | `verified` |
| `snu` | Seoul National University (서울대학교) | 관악 | `verified` |
| `skku` | Sungkyunkwan University (성균관대학교) | 혜화 | **`latest_unverified`** |
| `hanyang` | Hanyang University (한양대학교) | 왕십리 | `verified` |
| `ewha` | Ewha Womans University (이화여자대학교) | 이대 | **`latest_unverified`** |
| `sogang` | Sogang University (서강대학교) | 신촌 | **`latest_unverified`** |
| `hufs` | Hankuk University of Foreign Studies (한국외국어대학교) | 이문 | **`latest_unverified`** |

### 3.2 레코드당 필드

`address` · `campusArea` · `nearestStation` · `dorm{prohibited, checkin, curfew, laundry}` · `offCampusArea[]` · `nearbyEats[]` · `transitRoutes[]` · `verification`

### 3.3 ⚠️ 가장 검증이 약한 구간

**`verification` 블록은 각 대학의 *비자 안내 URL* 하나만 가리킨다.** 즉 `verified` 표시가 붙어 있어도 그것이 보증하는 것은 비자/체류 안내 페이지를 열어봤다는 사실뿐이다. 아래 필드는 **어떤 출처도 붙어 있지 않다**:

- `nearbyEats` — 예: `Cafe Tap Public`, `Cafe 906`, `Café Ona`, `Seongsu Federation`, `Cafe Wholestreet`, `Aedo Bunsik`. **실존 여부와 현재 영업 여부가 확인되지 않았다.** 개별 상점은 폐업률이 높아 앱에 상수로 박기에 가장 부적합한 데이터다.
- `transitRoutes` — 버스 번호(7611, 7017, 5712, 동작01), 출구 번호, 도보 시간. 노선은 실제로 개편된다.
- `dorm.curfew` / `dorm.checkin` — 건물명(블루미르홀 308·309관, SK Global House), 프론트 운영시간, 통금 시각.
- `dorm.laundry` 요금 — 6개 대학에 ₩500~₩1,500이 박혀 있다.
- `dorm.prohibited` — 대학별 금지 물품 목록.

### 3.4 대학 트랙에 확보해야 할 실제 정보

대학 1개당 아래를 채워야 하며, **9개 × 6블록 = 54건**이다.

- [ ] 공식 주소 (대학 홈페이지 오시는 길) — 9건
- [ ] 기숙사 공식 페이지: 건물명 / 체크인 절차·시간 / 통금 / 세탁 요금 / 금지 물품 — 9건
- [ ] 국제처(International Office) 연락처와 **최종 권위 명시** — 9건
- [ ] 교통 경로: 지하철 역·출구, 셔틀 유무와 배차, 실제 정차 버스 노선 — 9건
  - 버스 노선은 서울시 대중교통 공시 데이터로 대조
- [ ] 기숙사 신청 일정 (`volatility: high`) — 9건, **매 학기 갱신 필요**
- [ ] `nearbyEats` 처리 결정 — 아래 3안 중 택1이 필요하다:
  1. 각 상점의 실존·영업 확인 후 `checkedAt` 부여 (유지비 최고)
  2. 개별 상점명을 지우고 **상권/골목 단위**로 전환 (예: "혜화 떡볶이 골목", "왕십리 곱창골목") — 상권은 상점보다 훨씬 안정적
  3. 필드 제거
  → **2안 권장.** 이미 `Hyehwa Tteok-bokki Alley`, `Wangsimni Gopchang Alley`, `Sillim Sundae Town`, `Ewha Ramyun Alley`, `Hoegi Galbi Alley` 5건이 이미 상권 단위다. 나머지를 여기에 맞추면 실제 정보이면서 썩지 않는다.

---

## 4. 긴급 정보 (5 섹션 / 25 항목)

`src/data/emergency.ts`. MMKV로 오프라인 캐시. **안전 정보이므로 실질적으로 Class A**인데 출처 메타데이터가 없다.

### 4.1 섹션 구성

| 섹션 | 항목 수 | 내용 |
|---|---:|---|
| `phones` | 5 | 112 경찰 / 119 소방·구급 / 1345 출입국 / 1330 관광공사 / 120 서울시 |
| `medical` | 4 | 세브란스 국제진료센터 02-2228-5800 · 서울아산 02-3010-5001 · 삼성서울 02-3410-0200 · 24시 약국 |
| `lost` | 4 | lost112.go.kr · 여권 분실 · 지하철 유실물(시청역 1–4호선, 왕십리역 5–8호선) · 택시 분실 |
| `phrases` | 5 | 도와주세요 / 응급실이 어디예요 / 아파요 / 경찰을 불러주세요 / 저는 외국인이에요 |
| `embassies` | 7 | 미국 02-397-4114 · 영국 02-3210-5500 · 캐나다 02-3783-6000 · 호주 02-2003-0100 · 독일 02-748-4114 · 프랑스 02-3149-4300 · 기타 안내 |

### 4.2 확보해야 할 실제 정보

- [ ] **긴급번호 5건** — 112·119·1345·1330·120은 안정적이나, "영어 가능"·"다국어" 주장과 운영시간은 각 기관 공식 페이지로 확인.
- [ ] **병원 전화번호 3건 + 국제진료센터 위치/예약정책** — 이미 세브란스 항목은 "현재 위치와 예약 정책을 확인하라"고 회피 표현을 쓰고 있다. 나머지 2개도 같은 처리 또는 실제 확인 필요.
- [ ] **24시간 약국** — "강남역 12번 출구 Open Pharmacy"는 개별 점포. §3.4와 같은 문제. 상시 운영 약국 검색 방법(휴일지킴이약국 등 공식 조회처) 안내로 전환 권장.
- [ ] **대사관 6건** — 각 대사관 공식 사이트에서 대표번호·긴급번호·주소 재확인. 대사관 이전은 실제로 발생한다.
- [ ] **지하철 유실물 센터 위치** — 서울교통공사 공식 페이지 확인.
- [ ] **`EmergencySection`에 출처 필드 추가** — 최소 `sourceUrl` + `checkedAt` + `finalAuthority`.
- [ ] **국가별 대사관 확장 여부 결정** — 현재 6개국. `nationality` 축은 자유 입력이므로 대부분의 사용자가 자기 대사관을 못 찾는다.

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

**⚠️ 2차 출처 의존 2건** — Fulbright Korea, CIEE 블로그는 기관 안내이지 1차 권위가 아니다. Class A 판단(은행 계좌 폐쇄 시점, ARC 수수료)에 쓰이고 있으므로 1차 출처로 교체하거나, 앱 UI에서 명시적으로 "참고 안내" 등급을 표시해야 한다.

**최종 권위(finalAuthority) 지정 현황** — HiKorea / 출입국 1345 / NHIS 1577-1000 / 각 대학 국제처 / 각 통신사 / 각 은행 지점. 이 부분은 잘 되어 있다.

---

## 9. 우선순위 — 실제 정보 확보 순서

이 순서는 **틀렸을 때의 피해 크기**로 정렬했다.

### P0 — 릴리스 전 필수

1. **긴급 정보 25개 항목 전수 검증 + 출처 필드 추가** (§4). 안전 정보가 출처 없이 오프라인 캐시된다는 것이 현재 가장 큰 리스크.
2. **`departure-order`, G3, G6의 `UNCONFIRMED_SOURCE` 해소** (§1.3). 미확인 상태로 사용자에게 행정 지시를 내리고 있다.
3. **미션 3건(`p1_visa`, `p2_arc`, `p2_bank`)의 행정 사실을 Essentials 트랙과 대조** (§2.4). 같은 앱이 같은 사실을 두 곳에서 다르게 말하면 안 된다.

### P1 — 신뢰도 직결

4. **대학 9개 × 기숙사·교통 블록 재확인** (§3.4), `latest_unverified` 4개교 우선.
5. **`nearbyEats` 상권 단위 전환** (§3.4 2안).
6. **운영자 공시 요금 8건 확인** (§2.3 B 등급) — AREX, KAL 리무진, T-money, KTX, 고궁, 박물관, 진료비, 세탁요금.
7. **2차 출처 2건(Fulbright, CIEE) 1차 교체** (§8).

### P2 — 구조 정비

8. **`Mission`에 `evidence` 필드 추가**, 55건 source ledger 생성 (§2.4).
9. **`EmergencySection`에 출처 필드 추가** (§4.2).
10. **`owner` 필드 실제 담당자 지정** — 현재 전부 `'Not confirmed (미확인)'`.
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

`grep`으로 확인: `part-time` / `work permit` / `시간제` **코드에 0건.**

D-2 체류자격은 학업이 목적이므로 취업 활동에 별도 허가가 필요한 구조다. 교환학생이 **모르고 위반하는 대표 사례**이고, 결과가 체류자격 위반(=출국 명령까지 갈 수 있음)이라 소비자 피해가 가장 크다. 앱은 이미 `visaTypeOrStatus` 축을 갖고 있으므로 조건 분기도 즉시 가능하다.

- 확인 대상: 허가 필요 여부와 신청 경로, 자격 요건, 시간 상한, 업종 제한, 무허가 시 결과
- 1차 출처: HiKorea, 법무부 출입국·외국인정책본부
- 최종 권위: 1345 / 관할 출입국·외국인청
- 형태: **Essentials 조건부 태스크** (`visaTypeOrStatus` = D-2 계열일 때)

#### ② 국민건강보험 가입 — 절반만 있음

현재: 온보딩 `nationality.tsx:108`에 NHIS 가입 제외 관련 안내 문구가 **있고**, 출국 태스크 G5(전자고지 전환)도 **있다.**
없는 것: **가입 자체를 다루는 태스크.** 즉 앱은 "나갈 때 정리하는 법"은 알려주는데 "들어올 때 가입되는 구조"는 안 알려준다.

- 이미 `homeCountryInsurance` 축을 받고 있는데 이 축이 연결되는 태스크가 없다 → **축은 있고 콘텐츠가 없는 상태**
- 확인 대상: 유학생 가입 시점·요건, 보험료 산정, 본국 보험으로 인한 제외 요건과 필요 서류
- 1차 출처: 국민건강보험공단
- 최종 권위: NHIS 1577-1000

#### ③ 관할 출입국·민원 기관 매핑 — 정적이고 확실한 실제 정보

현재 `missions.ts:194`에 `mapHint: 'Seoul Immigration Office, Mok-dong (목동)'` 하나가 **전체 사용자에게 동일하게** 나간다. 그런데 관할 기관은 **주소지에 따라 다르다.**

- 9개 대학 캠퍼스 소재지 → 관할 출입국·외국인청/사무소 매핑 (9건)
- 기숙사 거주자와 교외 거주자의 관할이 다를 수 있음 → `housingType` 축으로 분기
- 체류지 신고에 필요한 주민센터도 동일 구조
- **썩지 않고, 공식 출처가 명확하고, 이미 있는 축으로 분기된다** → 필터 4개 전부 통과. 우선순위 높음.

#### ④ 공휴일·기관 휴무 캘린더 — 행정 타이밍의 숨은 변수

`holiday` / `공휴일` / `Chuseok` **코드에 0건** (`working-holiday` 라벨 오탐만 있음).

앱은 `arrivalDate` / `programStartDate` / `departureDate`를 받아 `usePhase`로 시기를 계산하고 태스크 기한을 안내한다. 그런데 **설·추석 연휴에는 출입국·은행·주민센터가 닫는다.** 지금 구조는 연휴 한복판에 "이번 주에 방문하세요"를 띄울 수 있다.

- 확보: 연 단위 관공서 휴무일 (공공데이터포털 특일 정보 등 공식 출처)
- 적용: `DueRule` 계산 시 휴무일 회피, 연휴 직전 "이번 주 안에 처리" 경고
- 형태: **콘텐츠가 아니라 날짜 로직의 입력값.** `src/lib/dates.ts` 옆에 정적 테이블
- 부수 효과: 문화 미션의 명절 체험(설·추석·연등회 등)도 이 테이블로 시기 노출 가능

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
- 제안: `Mission`에 `completeWhen: string` 필드 추가 → 55건 개별 작성. §2.4의 `evidence` 필드 추가와 **같은 작업에 묶어서 하면 파일을 한 번만 건드린다.**

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
| **N0** | ③ 관할 기관 매핑, ④ 공휴일 테이블 | §9 P0 완료 후. 둘 다 정적·공식출처·기존 축 활용이라 위험이 가장 낮다 |
| **N1** | ① 시간제취업허가, ② 건강보험 가입 | 행정 트랙의 `TaskSourceMetadata` 구조를 그대로 사용. A급이므로 전문가 데스크 리뷰 필요 |
| **N2** | ⑩ `completeWhen` + `evidence` 필드, ⑪ Want-to 시드 | §2.4 작업과 **동일 커밋 묶음**으로 |
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
| `src/components/byeongpung/motifs.tsx` | 병풍 24 패널 매핑 |
| `assets/byeongpung/` · `assets/bucket-templates/` | 아트 자산 |
