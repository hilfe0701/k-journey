# Step 8 known issues

Date: 2026-07-27 (KST)

| Severity | Issue | Status / reason |
|---|---|---|
| Medium | Manual browser QA is incomplete for onboarding, home, task detail, relaunch, responsive layout, and screen-reader interaction. | Not run — the sandbox cannot judge browser interactions; browser lane required. |
| Medium | `REQ-SFR-002` full pre-departure model is not delivered. | Current slice contains only the departure-order task; the nine-task/three-prerequisite model is outside this step. |
| Medium | `REQ-SFR-007` independent immigration appointment task is absent. | Not implemented in the current four-task slice. |
| Medium | `REQ-SFR-009` independent dormitory application deadline task is absent. | Not implemented in the current four-task slice. |
| Medium | `REQ-SFR-012` / `SET-05` data export is absent. | No new feature was added in Step 8; export remains a separate scope item. |
| Low | `REQ-QUR-001` 50-item cultural mission audit is not performed. | `MEM-01` is `Won't` under `DEC-024`; Step 7 covered only the administrative slice. |
| Low | `REQ-TER-003` full offline/relaunch manual matrix is not executed. | Offline/reconnect was deleted by confirmed `DEC-026` deletions; relaunch still needs the browser lane. |
| Low | The full `TC` inventory (156 cases) is not automated in this step. | Step 8 requires the current slice first; only the seven applicable automatic-test categories were executed. Count corrected 2026-07-27: `TC-160` was split by cause into `TC-160` / `TC-161` (`44` §2.1 ★1), so the inventory is 156, not 155. |
| Low | `save_failed` / `E8` and `TC-160` / `TC-161` are not implemented or used as a basis. | Only `DEC-026` deletions are confirmed; additions remain isolated. The 2026-07-27 cause split (`storage_full` / `write_permission_denied`) stays isolated on the same grounds. |
| Low | I02 migration is not implemented. | Explicitly out of scope with zero real users; no migration behavior is claimed. |
| Info | `npm audit` findings from I01 (38 total: 3 critical, 29 high) are not fixed in this step. | Explicitly record-only scope; no dependency remediation performed. |
| Info | Real-device performance numbers for `REQ-PER-001`–`003` are not established. | The nonfunctional source leaves the measurement device unresolved; no device lane is available here. |
| Info | Store submission/deployment and late-August user interviews were not performed. | Explicitly outside this step and recorded here rather than implied complete. |

## Resolved after step 8 (2026-07-27)

| Item | What changed |
|---|---|
| `TC-156`–`TC-159` (`INV-1`–`INV-4`) had IDs in a comment but no verification behind them. | Fixed under `DEC-034`. Each is now an independent test driving a **1,200-profile combination sweep** (housing 5 × contract holder 6 × visa 5 × stay days 8) through two rule evaluators. `jest` **187 → 191**, 20 suites. The sweep immediately caught a wrong status literal — the code was written as `permanent_block` in the test while the real value is **`locked_permanent`**. Raised by `47` §2.2 ★12: *"ID 대조는 「있다」까지 보고 「무엇을 하는가」는 보지 않는다."* |
| Native-target gaps were unmeasured, not merely empty. | `.work/web-gap.md` created under `DEC-033`, satisfying `DEC-029` verification ④. Four modules logged with the `REQ`/`POL` each leaves uncovered. **The ledger does not close the gaps — it states their size**, and separates *target* gaps (notifications, media library, crashlytics) from the *configuration* gap (PostHog), which no native target would fix. |
| `DEC-028` verification ④ (scope-drift check) had no enforcement point. | `scripts/execute.py` now records `git diff --name-only` into `index.json` as `changed_files` at step end, before the commit clears it. **This records evidence; it does not block** — "이 step이 하지 않는 것" is prose and cannot be machine-compared to a file list. |

No issue in this list is silently treated as release approval.
