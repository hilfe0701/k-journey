# Step 8 QA report

Date: 2026-07-27 (KST)

Scope: the current P0 administrative-task slice. This report does not claim store release, device QA, or browser-lane completion.

## AC command results

```text
npm ci                                  PASS (1492 packages installed; first attempt hit node_modules ENOTEMPTY, retry passed)
npm run check                           PASS
npx jest --listTests | wc -l            19
npm test 2>&1 | grep -E ...             Test Suites: 19 passed, 19 total
                                         Tests:       182 passed, 182 total
npx expo export --platform web          PASS (Exported: dist)
```

The web export printed expected warnings for missing local Firebase config files (`google-services.json` and `GoogleService-Info.plist`); those files are gitignored and were not created.

The required source-ID measurement command produced this exact output:

```text
REQ-[A-Z]{3}-[0-9]{3} :       24
POL-[0-9]{3} :        8
TC-[0-9]{3} :       41
ONB-[0-9]{2} :        7
HOME-[0-9]{2} :        5
TASK-[0-9]{2} :        5
```

All six required ID families are non-zero. The counts are unique IDs present in `app/` and `src/`, not test counts.

The 182 tests are 36 above the I01 baseline of 146. Step 8 did not add a new behavior test; it attached traceability IDs to the existing slice coverage and executed it.

## Automated slice

| Area | Result | Evidence |
|---|---|---|
| Profile condition combinations | Pass | `src/lib/__tests__/conditionRules.test.ts` — `REQ-TER-001`, `TC-156`–`TC-159`; housing matrix `TC-001`, `TC-003`, `TC-005`, `TC-101`. |
| Task exposure, blocking, and release | Pass | `src/lib/__tests__/taskState.test.ts` — `TC-011`, `TC-016`, `TC-144`, `TC-149`, `TC-151`. |
| Date-based phase transition | Pass | `src/hooks/__tests__/usePhase.test.ts` — `TC-021`–`TC-025`; KST boundary logic. |
| Recalculation after profile change | Pass | `src/lib/__tests__/taskState.test.ts` — `TC-112`, `TC-152`; completed timestamp is retained while review is requested. |
| Completion-state preservation | Pass | `src/lib/__tests__/taskState.test.ts` — `TC-146`, `TC-148`, `TC-152`; local progress persistence test also covers axis values. |
| Official-source required fields | Pass | `src/lib/__tests__/taskState.test.ts` — `TC-125`; all task metadata keys are asserted. |
| Old-source review warning | Pass | `src/lib/__tests__/taskState.test.ts` — `TC-129`; due and unknown review dates are distinguished in KST. |
| Existing-data migration | Not done — I02 is explicitly out of scope because there are zero real users. | No migration test was added or claimed. |

## Manual QA checklist

The environment cannot judge interactions that require pressing the app in a browser. Those rows are deliberately recorded as **미실시 — 브라우저 레인**, never as Pass.

| 항목 | Pass/Fail | 재현 절차 | 스크린샷 경로 |
|---|---|---|---|
| 최초 온보딩 중단 · 재개 | 미실시 — 브라우저 레인 | 새 실행 → ONB-04에서 종료 → 재실행 | 없음 — 브라우저 레인 |
| 교환/방문 · D-2-6/D-2-8/미확인 | 미실시 — 브라우저 레인 | ONB-03에서 각 선택값 저장 후 HOME-00 진입 | 없음 — 브라우저 레인 |
| 기숙사 / 본인 계약 / 타인 계약 / 무계약 / 사업자등록 숙소 | 미실시 — 브라우저 레인 | ONB-04에서 다섯 조합 선택 후 HOME-04~06 확인 | 없음 — 브라우저 레인 |
| 입국 전 / 첫 주 / 체류 / 출국 전 | 미실시 — 브라우저 레인 | ONB-07 날짜를 phase 경계 전후로 바꿔 HOME-01 확인 | 없음 — 브라우저 레인 |
| 차단 태스크 해제 | 미실시 — 브라우저 레인 | 선행 태스크 완료 → 하류 태스크 재진입 | 없음 — 브라우저 레인 |
| 완료 취소 · `not_applicable` 전환 | 미실시 — 브라우저 레인 | TASK-00 완료/해제 및 조건 변경 후 HOME-06 확인 | 없음 — 브라우저 레인 |
| 날짜 · 주거 변경 후 재계산 | 미실시 — 브라우저 레인 | ONB-04 또는 ONB-07 값 변경 후 HOME-00 재진입 | 없음 — 브라우저 레인 |
| 공식 링크 실패 | 미실시 — 브라우저 레인 | TASK-03 공식 URL 선택 → 실패 조건에서 URL 복사 가능 여부 확인 | 없음 — 브라우저 레인 |
| 작은 화면 · 큰 글자 · 스크린리더 | 미실시 — 브라우저 레인 | HOME-00/TASK-00을 작은 viewport·확대 글꼴·스크린리더로 순회 | 없음 — 브라우저 레인 |
| 앱 재실행 | 미실시 — 브라우저 레인 | 온보딩 중간 또는 HOME-00에서 종료 후 재실행 | 없음 — 브라우저 레인 |
| 오프라인 · 재연결 | Not done — `DEC-026` 삭제분으로 경로가 없음 | 해당 시나리오를 실행하지 않음 | 없음 — 삭제된 경로 |

## Evidence boundary

- Automated tests are code evidence, not a substitute for the manual browser lane.
- No store submission, deployment, user interview, or real-device accessibility/performance approval was performed.
