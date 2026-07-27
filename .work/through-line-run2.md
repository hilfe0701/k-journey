# 관통 판정 2차 — 성립

- 판정일: 2026-07-27 (KST)
- 판정 레인: 브라우저 (Claude Opus 5)
- 대상: `dist` 정적 서빙 (`expo export --platform web`)
- 근거 결정: `DEC-029`(실행 타깃 = 웹)
- 1차 결과: **미성립**(`through-line-run1.md`). **그 문서를 덮어쓰지 않았다.**

## 결과

**관통 성립. 끊긴 곳 없음.**

```
ONB-02 University → ONB-03 Program/Visa → ONB-04 Housing/Contract
→ ONB-05 Stay length → ONB-06 Nationality/Insurance → ONB-07 Dates
→ ONB-08 Era → HOME-00 Journey home → TASK 상세 → 완료 → 홈 반영
```

## 1차와 2차 사이에 고친 것

| # | 결함 | 수정 |
|---|---|---|
| 1 | 온보딩 8화면 중 **6화면이 입력을 기록하지 못함** | `useProfile`이 매 렌더 새 객체를 만들어 `useEffect`가 선택을 되돌렸다. `useMemo`로 참조 안정화 (`src/hooks/useProfile.ts`, +20/−6) |
| 2 | `ONB-07`에서 날짜 선택 시 **앱 크래시**(`RangeError: Invalid time value`) | `typeof x === 'string'` 가드가 `UNKNOWN`(`'unknown'`)을 통과시켜 `parseISO`에 넘겼다. `isRealDate()` 도입 (`app/(onboarding)/dates.tsx`) |
| 2-b | 같은 파일 달력 마킹 루프가 **조용히 아무것도 안 함** | Invalid Date 비교가 항상 `false`라 죽지 않고 틀렸다. 같은 가드로 교체 |

회귀 테스트 `src/lib/__tests__/unknownDateGuard.test.ts` 신설 (5건).

## 확인한 것 — 검증 시나리오

입력: 연세대 · 교환학생 · `D-2-6` · Private lease · 본인 명의 · **20일** · Canada · 보험 없음 · 입국 `2026-07-15`

| 항목 | 관찰 | 대응 |
|---|---|---|
| 단계 판정 | `Phase 3 Living` (입국 7/15, 오늘 7/27) | 날짜 기반 단계 전환 |
| 입국일+90일 | **`D-78` · Oct 13, 2026 · ON TRACK** | `REQ-SFR-005` — 7/15+90=10/13, 정확 |
| 차단 | Group registration **BLOCKED** — 「Yonsei University guidance excludes stays shorter than one month」 + 대안(HiKorea) + 출처 URL | **`REQ-SFR-011`·`DEC-021`** |
| 차단의 성격 | 「This is an eligibility block. Completing another task will not remove it.」 | 자격 차단 ↔ 선행조건 차단 구분 |
| 해당 없음 | Residence registration **NOT APPLICABLE** — 「Short stays of 90 days or fewer...」 + 출처 URL. **사라지지 않고 남아 있다** | **`REQ-SFR-004`** |
| 판정 근거 노출 | 태스크 상세 「Why this task」에 판정에 쓰인 조건 축(Total stay length 20 · University yonsei)을 그대로 표시 | 조건부 오케스트레이션의 설명책임 |

**조건 변경 후 재계산** — 체류를 **20일 → 120일**로 바꿔 재입력:

| 항목 | 20일 | 120일 |
|---|---|---|
| Residence registration | `NOT APPLICABLE` | **`AVAILABLE`** |
| Available 태스크 | 0건 | 1건 → 완료 후 2건 |

- 완료 표시 → 버튼이 「Mark complete」 → **「Mark as not done」**(되돌리기 가능)
- 홈 반영: Residence registration **`COMPLETED`**
- **선행조건 해제**: Housing proof가 **`AVAILABLE`로 새로 열림**
- 출처 블록: 출처명 · 공식 링크 · **Checked on Jul 27, 2026** · Final authority · Volatility
- **`Review after: Not confirmed (미확인)`** — 모르는 값을 지어내지 않았다 (`15-...unverified-value-policy`)
- **「Guidance differs」 — 수수료 30,000 / 34,000 / 35,000원을 한 값으로 뭉개지 않고 출처별 URL·확인일과 함께 전부 보존** (`pm-evidence-gate`)
- 진행 지점 복원: 새로고침 시 `/dates`로 재개

## 남은 결함 — 고치지 않았다

| # | 결함 | 비고 |
|---|---|---|
| A | **「Your 20 stay」·「Your 120 stay」 — 단위 누락** | 「20-day stay」여야 한다. 태스크 상세 「Why this task」 |
| B | 온보딩 완료 화면 문구가 **구 제품 개념**(「Complete missions over four months」·병풍) | `DEC-024`가 `Won't`로 둔 범위 밖 legacy |
| C | 하단 탭에 `Byeongpung`·`Want to` 잔존 | 같음 |
| D | `More` 탭이 클릭에 반응하지 않음 | 재현 1회. 추가 확인 필요 |

## 한계 — 명시한다

- ⛔ **작성과 검증이 같은 레인이다.** 결함 2건을 이 세션이 찾고 이 세션이 고치고 이 세션이 재판정했다.
  `34-k-journey-role-review-2026-07-25.md` §0.2와 같은 방식으로 한계를 남긴다. **별도 레인의 재확인이 필요하다.**
- **웹 타깃 결과다.** iOS·Android에서 성립한다는 증거가 아니다 (`DEC-029` 반례 ①).
- 정적 서빙이라 하위 경로 직접 접근(`/settings`)은 404다 — **서버 설정이고 앱 결함이 아니다.**
- 분석 이벤트는 `disabled` 상태다 — `DEC-027`의 규칙을 실행으로 검증하지 못했다.
