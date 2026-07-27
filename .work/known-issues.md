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
| Low | The full `TC` inventory (155 cases) is not automated in this step. | Step 8 requires the current slice first; only the seven applicable automatic-test categories were executed. |
| Low | `save_failed` / `E8` and `TC-160` are not implemented or used as a basis. | Only `DEC-026` deletions are confirmed; additions remain isolated. |
| Low | I02 migration is not implemented. | Explicitly out of scope with zero real users; no migration behavior is claimed. |
| Info | `npm audit` findings from I01 (38 total: 3 critical, 29 high) are not fixed in this step. | Explicitly record-only scope; no dependency remediation performed. |
| Info | Real-device performance numbers for `REQ-PER-001`–`003` are not established. | The nonfunctional source leaves the measurement device unresolved; no device lane is available here. |
| Info | Store submission/deployment and late-August user interviews were not performed. | Explicitly outside this step and recorded here rather than implied complete. |

No issue in this list is silently treated as release approval.
