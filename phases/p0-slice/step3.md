# Step 3 — 온보딩 조건 입력 (`ONB-02` ~ `ONB-08`)

원안 `I05`의 첫 조각이다. **step 2의 조건 축을 사용자가 실제로 채울 수 있게 만든다.**

## 화면 — 정본은 `.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`

| 화면 ID | 이름 | 확정하는 축 | 연결 `REQ` |
|---|---|---|---|
| `ONB-01` | Sign in / Dev entry | — | ⛔ **도달 불가**(step 1). 만들지 마라 |
| `ONB-02` | University | `universityId` | `POL-003` |
| `ONB-03` | Program / Visa | `programType` · `visaTypeOrStatus` | `REQ-P0-02`는 **보류** — 구조만, 분기값은 비운다 |
| `ONB-04` | Housing / Contract holder | `housingType` · `contractHolder` | **`REQ-DAR-001`** · `REQ-DAR-005` |
| `ONB-05` | Stay length | `totalStayDays` | **`REQ-DAR-003`** · `REQ-QUR-002` |
| `ONB-06` | Nationality / Home insurance | `nationality` · `homeCountryInsurance` | **`REQ-DAR-004`** |
| `ONB-07` | Arrival / Departure dates | `arrivalDate` · `departureDate` · `programStartDate` | **`REQ-SFR-005`**(기준일 입력) |
| `ONB-08` | Optional era choice | — | 건너뛰기 가능 |

## 작업

1. `ONB-02`~`ONB-08`을 **순서대로 진행하는 플로우**로 만든다. 각 화면은 이전 화면 완료가 진입 조건이다.
2. **모든 축에 「미확인 / 모름」 선택지를 둔다** — `POL-003`. 강제로 채우게 만들지 마라.
3. **`ONB-05` 라벨을 다시 쓴다** — `REQ-QUR-002`. 기존 `stay type` 라벨은 의미가 모호하다.
4. **중단·재개** — 온보딩 중간에 앱을 닫았다 열면 **그 지점부터** 이어진다(`22` `UF01`).
5. **빈 상태·오류 상태**는 `docs/EMPTY_STATES.md`의 **일반 3-slot 계약**을 따른다.
   ⛔ **§§5–7(gallery · byeongpung)은 legacy다 — 쓰지 마라.**

## AC

```bash
npm run typecheck && npm run lint && npm test
```

- [ ] `npx expo start --web`에서 **앱 시작 → `ONB-02` → … → `ONB-08` → 홈**이 끊김 없이 진행된다
- [ ] 각 축에 **「미확인」을 고를 수 있고**, 고른 뒤에도 다음으로 넘어간다
- [ ] 온보딩 중간에 새로고침하면 **그 지점부터** 재개된다
- [ ] 입력한 10종 축이 **step 2의 `UserProfile`에 실제로 저장**된다(로컬)
- [ ] `jest` 전건 통과

## ⛔ 이 step이 하지 않는 것

- **`ONB-01` sign-in 화면** — step 1이 도달 불가로 만들었다
- **홈 화면의 상태 구분** — step 4다. 여기서는 홈에 도달하기만 하면 된다
- **태스크 상세** — step 5다
- **`REQ-P0-02` 방문학생 분기값** — **확인 불가**로 보류된 값이다(`15`가 기관 문의를 막는다).
  구조는 만들고 **값은 비운다**. 지어내면 `AGENTS.md` §5 위반이다
- **디자인 토큰·컴포넌트 시스템 재작성** — 기존 것을 쓴다
