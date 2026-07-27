# Step 5 — 태스크 상세 · 선행조건 · 차단 사유 (`TASK-00` ~ `TASK-04`)

## 화면 — 정본은 `.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`

| 화면 ID | 이름 | 연결 `REQ` |
|---|---|---|
| `TASK-00` | Task Detail (Page) | `REQ-QUR-001` · `REQ-PER-003` · `REQ-INR-003` |
| `TASK-01` | Why this task · Prerequisites · 상태 | **`REQ-SFR-001`** · `REQ-SFR-002` · `REQ-DAR-002` · `REQ-SFR-007` · `REQ-SFR-009` · `REQ-SFR-010` |
| `TASK-02` | Required documents · Document specs | **`REQ-SFR-001`** · `REQ-SFR-008` |
| `TASK-03` | Official source · Final authority · Conflict warning | **`REQ-DAR-002`** — ⛔ **step 6이다** |
| `TASK-04` | Task order choice (Popup) | **`REQ-SFR-002`** |

## 작업

1. **`TASK-01` — 「왜 이 태스크인가」**를 조건 축으로 설명한다.
   「당신은 `타인·법인 계약`이라 제공자 확인서가 필요하다」처럼 **판정 근거를 문장으로** 보여준다.
2. **선행조건과 차단 사유** — `dependsOn`이 무엇이고 지금 무엇이 막고 있는지(`REQ-SFR-003`).
   차단이 풀리는 조건도 함께 적는다.
3. **`TASK-02` 거주 증빙 서류** — 주거 4종 × 조건부 서류로 분해(`REQ-SFR-001`, 등급 **A**).
   항목마다 **`요청 대상자`**를 표시한다. 중첩 조건이 있다.
   - **타인 명의는 3종 고정이 아니다** — 제공자 신분증 주소 = 확인서 주소면 **제공자 계약서 사본 불필요**
   - **사업자등록 숙소**는 확인서 + **사업자등록증** + **당월 임대료 영수증**
4. **`REQ-SFR-008` 서류 규격** — 사진 규격 + **재사용 금지 · 최소 2주 지연 경고**.
5. **상태 전이** — 완료 / 완료 취소 / `not_applicable` 전환. **낙관적 UI를 쓰되 로컬 저장 실패 시 완료 표시가 남으면 안 된다.**
6. **`TASK-04` 선택형 카드** — `출국 전` 과업 순서 G3↔G4(`REQ-SFR-002`).
7. **오류 문구는 `docs/ERROR_MESSAGES.md`의 T1~T4 층위**를 따른다.
   ⛔ `auth-*` · `network-offline-recovered` · `bucket-conflict` 행은 **걷어냈다. 쓰지 마라.**
   ⛔ `save_failed`·`E8` 문구는 **미확정이다. 추가하지 마라.**

## AC

```bash
npm run typecheck && npm run lint && npm test
```

- [ ] 홈의 태스크 카드를 누르면 **`TASK-00` 상세가 열린다**
- [ ] 상세에 **「왜 이 태스크인가」가 조건 축 값으로** 쓰여 있다
- [ ] `Blocked` 태스크의 상세에 **차단 사유 + 풀리는 조건**이 있다
- [ ] `contractHolder = 타인·법인`으로 온보딩하면 `TASK-02`에 **제공자 관련 서류 항목**이 나오고,
      `본인`이면 나오지 않는다 (조건부 분해가 실제로 동작하는지)
- [ ] **완료 → 완료 취소 → 다시 완료**가 되고 홈의 묶음이 따라 바뀐다
- [ ] `jest` 전건 통과
- [ ] **`npx expo export --platform web`이 성공한다** — `DEC-029` 검증 ③-a(executor 몫 · 번들 성립). ⚠️ **번들 성공 ≠ 실행이다**: 브라우저 콘솔 error 0건은 ③-b(브라우저 레인)가 step 6·8 종료 시 잰다

## ⛔ 이 step이 하지 않는 것

- **`TASK-03` 출처·확인일·충돌 경고** — step 6이다
- **미션 콘텐츠 값의 정확성** — step 7이다. **틀린 값이 보여도 이 step에서 고치지 마라**
- **`save_failed` 상태 신설** — `DEC-026` **미확정분**이다
- **오프라인 큐·재연결 처리** — `DEC-026` 삭제분으로 걷어냈다
- **접근성 전수 점검** — step 8이다
