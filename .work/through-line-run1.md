# 관통 판정 1차 — 미성립

- 판정일: 2026-07-27 (KST)
- 판정 레인: 브라우저 (Claude Opus 5) · 작성 레인: codex (step 1~8)
- 대상: `dist` 정적 서빙 (`expo export --platform web`, 커밋 68e7c48 시점)
- 근거 결정: `DEC-029`(실행 타깃 = 웹)

## 결과

**관통 미성립. 막힌 지점 = `ONB-03` Program/Visa.**

경로: `ONB-02` University ✅ → `ONB-03` Program/Visa ❌ (여기서 막힘)
→ `ONB-04`~`ONB-08` · `HOME-00` · `TASK-00` 도달 못 함.

## 관찰

`localStorage`(웹 MMKV 백엔드) 실측:

```
k-journey\profile:cache:v1 = {"university":"yonsei","universityId":"yonsei",
  "programType":"unknown","visaTypeOrStatus":"unknown",
  "housingType":"unknown","contractHolder":"unknown","totalStayDays":"unknown",
  "nationality":"unknown", ...}
k-journey\onboarding:progress:v1 = {"currentRoute":"housing"}
```

- `ONB-02`는 `universityId: "yonsei"`로 **정상 저장**됐다.
- `ONB-03`·`ONB-04`는 선택해도 값이 `unknown`에서 바뀌지 않는다.
  라디오를 좌표로도, 접근성 `ref`로도 눌렀으나 선택 표시가 이동하지 않는다.
- 진행 지점 저장(`onboarding:progress:v1`)은 정상 동작한다.
- 브라우저 콘솔 error 0건. 예외가 아니라 **상태가 즉시 되돌려지는** 형태다.

## 원인

`useProfile()`이 `JSON.parse(raw)`로 **매 렌더 새 객체**를 만든다.
그 객체가 `useEffect` 의존성 배열에 들어간 화면은 effect가 매 렌더 실행되어
방금 고른 로컬 상태를 저장값(`unknown`)으로 덮어쓴다.

| 화면 | 의존성 | 결과 |
|---|---|---|
| `university.tsx` | `[profile?.universityId]` — 원시값 | ✅ 동작 |
| `program.tsx` | `[profile, ...]` — 객체 | ❌ |
| `housing.tsx` | `[profile, ...]` | ❌ |
| `stay-length.tsx` | `[profile, ...]` | ❌ |
| `nationality.tsx` | `[profile, ...]` | ❌ |
| `dates.tsx` | `[profile, ...]` | ❌ |
| `era.tsx` | `[profile, ...]` | ❌ |

**8화면 중 6화면이 입력을 기록하지 못한다.**

## 왜 자동 검사가 못 잡았나

이 시점의 상태는 다음을 **전부 통과**하고 있었다:

- `npm run typecheck` 통과
- `npm run lint` 0 errors
- `jest` **19 suites / 182 tests** 전건 통과
- `expo export --platform web` 성공

`jest` 182건은 순수 함수(규칙 엔진·상태 전이)를 덮고 있고,
**렌더 루프의 참조 동일성은 덮지 않는다.** 번들 성공도 실행의 증거가 아니다.

`DEC-029` 사실 ⑤(「정적 검사 3종이 전부 통과하는데 앱은 흰 화면이었다」)와
**같은 종류의 사건이 한 번 더 일어났다.** 그때는 부팅이, 이번에는 입력이었다.

## 한계

- 이 문서는 **판정만** 담는다. 수정 후 결과는 `through-line-run2.md`에 따로 적는다.
  **1차 결과를 덮어쓰지 않는다** — 덮어쓰면 이 판정이 만들어낸 측정치가 사라진다.
