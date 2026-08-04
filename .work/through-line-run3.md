# Through-line judgment — run 3 (unimplemented requirements)

Date: 2026-07-28 (KST) · Lane: browser (Chrome, `expo start --web`, localhost:8081)
Scope: `REQ-SFR-002`, `REQ-SFR-007`, `REQ-SFR-009`, `REQ-SFR-012` and the four
code defects in `46-k-journey-implementation-result-2026-07-27.md` §6.1.

## Verdict

**Established.** Every requirement in scope was exercised in a running browser,
not inferred from a passing build.

Profile used: Chung-Ang · exchange · D-2-6 · dormitory · no contract · 120 days ·
Germany · home insurance yes · arrival 2026-07-01 · departure 2026-08-10.
That places the journey in **phase 4 (Pre-departure)**, which is what makes the
nine departure tasks visible.

| Checked | Result |
|---|---|
| Onboarding `ONB-02`→`ONB-08` → journey home | reached, no white screen |
| `REQ-SFR-002` nine departure tasks | all rendered, each with its timing label |
| `REQ-SFR-002` AC2 · AC5 residence-card return | departure-type choice shown; unanswered state is `review_required` with HiKorea named; the three Article 37(1) exceptions are listed verbatim with the law.go.kr link |
| `REQ-SFR-002` AC5 conditional branch | selecting "Leaving temporarily" reveals the re-entry-exception question, and the selection persists across re-render |
| `REQ-SFR-007` AC1 | Housing proof is `BLOCKED` — "Book the immigration appointment before preparing the documents" / "Opens when: The immigration appointment is marked as booked" |
| `REQ-SFR-009` AC4 | Dormitory application is `BLOCKED` with "No official dormitory application deadline was confirmed for this university", the Chung-Ang office named, and **no borrowed date** |
| `REQ-SFR-012` / `SET-05` | Settings → Your data → Export your data renders 10 condition groups with real values and `Not confirmed (미확인)` where unconfirmed |
| Defect B | onboarding completion no longer says "Complete missions over four months / byeongpung" |
| Defect C | tab bar is Journey + More only |
| Defect D | More tab responds; header shows "Chung-Ang · Dormitory" |
| Browser console errors | **0** after a full reload |

## ★ What only the browser caught

**A phantom `index 2` tab was shipping the v1 legacy home.**

`typecheck` (exit 0), `lint` (0 errors), `jest` (219/219), and `expo export`
(exit 0) all passed while the tab bar rendered a third tab named **`index 2`**.
It was `app/(tabs)/index 2.tsx` — an untracked Finder duplicate of the
pre-step-1 home, carrying `ByeongpungStrip`, `MissionCard`, and
`missionsForHousing`. expo-router treats any file in `app/` as a route, so
hiding `byeongpung` and `wantto` from the tab bar did not hide this one.

The file was never committed (`git log` for it is empty), so no history is lost.
It was **moved, not deleted**, to `.work/legacy-v1-home.index-2.tsx.bak`.

This is the third member of the same family found in one session — the other two
are the 24 empty `node_modules/@types/* 2` directories that broke `tsc`, and the
`lucide-react-native/dist` duplicate that made `npm ci` fail with `ENOTEMPTY`.
**Finder duplication is an environment hazard this repo is exposed to, and one of
its three forms reached the shipped UI.**

## Limits of this judgment

- **Web only.** iOS and Android remain unrunnable here (`DEC-029` facts ②③): no
  Xcode, no simulators, no Android SDK.
- **Accessibility is not judged.** `TC-120`–`TC-124` still have no automated
  coverage; a screen-reader pass was not run.
- **The confirmed-deadline path for `REQ-SFR-009` was exercised in tests, not in
  the browser** — every shipped deadline record is empty, so the browser can only
  show the unconfirmed path. That is the honest shipped state, not a gap in the
  test.
- Delivery of the export (`Share.share`) was not triggered in the browser; the
  success and failure branches are covered by `TC-058`/`TC-059` in jest.
