# Step 4 — 여정 홈 상태 구분 (`HOME-00` ~ `HOME-07`)

**이 재설계의 핵심 화면이다.** step 2의 규칙 엔진이 판정한 결과를 사용자가 처음 보는 곳이다.

## 화면 — 정본은 `.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`

| 화면 ID | 이름 | 연결 `REQ` | 연결 `POL` |
|---|---|---|---|
| `HOME-00` | Journey Home (Page) | `REQ-QUR-001` · `REQ-PER-003` · `REQ-INR-003` | `POL-001` · `POL-007` |
| `HOME-01` | Current phase | `REQ-PER-001` · `REQ-PER-002` | `POL-001` · `POL-003` |
| `HOME-02` | Registration deadline | **`REQ-SFR-005`** · `REQ-INR-002` · `REQ-COR-002` | `POL-009` |
| `HOME-03` | Departure lock warning | **`REQ-SFR-006`** · `REQ-SFR-002` | `POL-004` · `POL-006` · `POL-009` |
| `HOME-04` | Available tasks | **`REQ-SFR-003`** | `POL-004` · `POL-006` |
| `HOME-05` | Blocked tasks | **`REQ-SFR-003`** · **`REQ-SFR-011`** | `POL-004` · `POL-006` |
| `HOME-06` | Not applicable tasks | **`REQ-SFR-004`** · `REQ-DAR-004` | `POL-005` |
| `HOME-07` | Closing checklist | **`REQ-SFR-002`** | `POL-004` · `POL-006` |

## 작업

1. **`Available` / `Blocked` / `Not applicable`을 시각적으로 분리**한다 — `REQ-SFR-003`.
   이것이 「모두 지금 할 수 있는 것처럼 보여주던」 기존 구조를 바꾸는 지점이다(`DEC-007`).
2. **`Blocked`에는 차단 사유를 카드에서 바로 보여준다** — 「왜 못 하는지」를 상세로 들어가야 알게 만들지 마라.
3. **`Not applicable`은 숨기지 않는다** — 사유 + 공식 근거를 함께 표시(`DEC-008` · `POL-005`).
4. **`HOME-02` 절대 기한** — `입국일 + 90일`. 여유 / 임박(`D-14`) / 초과 3상태(`REQ-SFR-005`, 등급 **A**).
5. **`HOME-03` 출국 잠금 경고** — 단수사증 + RC 미수령이면 **상시 노출**(`REQ-SFR-006`, 등급 **A**).
6. **`HOME-01` 기준일 불명 상태**를 만든다 — `arrivalDate`가 「미확인」일 때 단계를 추정하지 마라.
7. **`HOME-07`은 단계 05의 진입점이다** — 새 영역(`RET-*`)을 만들지 마라(`DEC-023`).
8. 빈 상태는 `docs/EMPTY_STATES.md`의 **일반 3-slot 계약**만 쓴다. **§§5–7은 legacy다.**

## AC

```bash
npm run typecheck && npm run lint && npm test
```

- [ ] 홈에서 **`Available` / `Blocked` / `Not applicable` 세 묶음이 눈으로 구분**된다
- [ ] `Blocked` 카드에 **차단 사유 문장**이 보인다
- [ ] `Not applicable` 카드에 **사유 + 근거**가 보인다 (숨기지 않는다)
- [ ] `arrivalDate`를 「미확인」으로 온보딩하면 `HOME-01`이 **「기준일 불명」**을 표시하고 단계를 추정하지 않는다
- [ ] `arrivalDate`를 넣으면 `HOME-02`에 **`입국일 + 90일`** 날짜가 실제로 계산돼 나온다
- [ ] 온보딩 조건을 바꾸면 홈의 태스크 묶음이 **재계산**된다
- [ ] `jest` 전건 통과
- [ ] **`npx expo export --platform web`이 성공한다** — `DEC-029` 검증 ③-a(executor 몫 · 번들 성립). ⚠️ **번들 성공 ≠ 실행이다**: 브라우저 콘솔 error 0건은 ③-b(브라우저 레인)가 step 6·8 종료 시 잰다

## ⛔ 이 step이 하지 않는 것

- **태스크 상세 화면(`TASK-*`)** — step 5다. 카드까지만 만든다
- **출처·확인일·충돌 경고** — step 6이다
- **미션 콘텐츠 값 수정** — step 7이다
- **`MEM-01` 문화 미션 · `MEM-02` 병풍 · `MEM-03` 갤러리** — `DEC-024`가 `Won't`로 뒀다.
  **기존 화면 파일을 지우지도 말고 홈에 연결하지도 마라**
- **푸시 알림** — 범위 밖
