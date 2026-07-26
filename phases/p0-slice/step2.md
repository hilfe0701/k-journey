# Step 2 — 조건 축 타입과 규칙·상태 엔진

원안 `I03`의 슬라이스 몫이다. **UI와 분리해서 만들고, 조합별 단위 테스트를 먼저 쓴다.**

## 근거 — 정본

- 조건 축 10종: `.work/pmjob/k-journey/26-k-journey-glossary-2026-07-25.md` §2.7
- 규칙 흐름: `.work/pmjob/k-journey/20-k-journey-f05-condition-rule-flow-2026-07-25.md`
- 상태 모델: `.work/pmjob/k-journey/21-k-journey-f06-task-state-diagram-2026-07-25.md`
- 요구사항: `.work/pmjob/k-journey/27-k-journey-requirements-spec-2026-07-25.md`
- 정책: `.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md`

## 조건 축 10종 — 이 이름 그대로 쓴다

| 축 | 값 |
|---|---|
| `universityId` | 대학 코드 |
| `programType` | 교환학생 / 방문학생 |
| `visaTypeOrStatus` | `D-2-6` / `D-2-8` / 무비자 / **미확인** |
| `housingType` | 기숙사 / 일반주택 / 셰어하우스 / **등록 사업장** (`REQ-DAR-005`) |
| `contractHolder` | 본인 / 타인·법인 / 무계약 / 미정 / 해당없음 (`REQ-DAR-001`) |
| `totalStayDays` | 일 단위 정수 (`REQ-DAR-003`) |
| `nationality` | — |
| `homeCountryInsurance` | 보유 / 미보유 / **미확인** (`REQ-DAR-004`) |
| `residenceCardStatus` | 미신청 / 신청중 / 발급 / 반려 / 해당없음 |
| `arrivalDate` · `departureDate` · `programStartDate` | 날짜 |

**「미확인」은 값이다.** 기본값으로 채우거나 `null`로 뭉개지 마라 — `POL-003`.

## 작업

1. **`UserProfile`에 조건 축 10종을 추가**한다. 「미확인」을 표현할 수 있는 타입이어야 한다.
2. **`appliesWhen` 평가 함수를 UI와 분리**해 순수 함수로 만든다.
3. **`dependsOn` 선행관계와 차단 사유**를 계산한다 — `REQ-SFR-003`.
4. **태스크 상태 축 1** 7종과 **축 2**(오류) — `DEC-020` · `DEC-026` **삭제 반영 후** 상태 3종·전이 `E1`·`E7`.
5. **조건 변경 시 재평가** — 날짜·주거·비자가 바뀌면 태스크 집합을 다시 판정한다.
6. **`not_applicable`은 숨기지 않는다** — 사유와 공식 근거를 함께 반환한다(`REQ-SFR-004` · `POL-005`).
7. **판정 규칙 2건은 값이 정해져 있다**:
   - `REQ-SFR-011` — `totalStayDays < 28`만 **확정 차단**, 그 위는 **`review_required`**(`DEC-021`).
     **`< 30`이 아니다.** 원문의 「1개월」은 **숙소 거주 기간**이고 축이 다르다
   - `REQ-SFR-005` — `입국일 + 90일` 절대 기한(등급 **A**)

## AC

```bash
npm run typecheck && npm run lint && npm test
grep -rn "totalStayDays *< *30\|totalStayDays *>= *30" src/    # 0건이어야 한다
```

- [ ] 조건 축 10종이 타입에 있고 각 축이 **「미확인」을 표현할 수 있다**
- [ ] `appliesWhen` 평가가 **React 컴포넌트를 import하지 않는다**(UI 분리 확인)
- [ ] **조합별 단위 테스트가 있다** — 최소: 주거 4종 × 계약명의 5종, 비자 4종, `totalStayDays` 경계(27/28/29/90/91)
- [ ] `28` 경계 테스트가 있고 `30` 경계 테스트가 **없다**(`DEC-021`)
- [ ] `not_applicable` 판정이 **사유 문자열을 함께 반환**한다
- [ ] 새 테스트 포함 `jest` 전건 통과

## ⛔ 이 step이 하지 않는 것

- **화면·컴포넌트** — step 3~5다. 이 step은 `src/` 로직만 건드린다
- **출처·확인일 모델** — step 6이다
- **미션 콘텐츠 값 수정** — step 7이다. 지금 값이 틀려 보여도 **고치지 마라**
- **`I02` 마이그레이션 코드** — 실사용자 0명이라 근거가 없다. **기본값 정책만** 코드 주석으로 남긴다
- **분석 이벤트 payload** — `DEC-027`이 **미확정**이다. sink 배선도 이 step 범위가 아니다
