# Step 7 content audit log

Audit date: 2026-07-27 (KST)

Scope: the four administrative tasks that appear in the P0 slice, plus the five
priority universities named by the step. The 50-item cultural mission catalog is
excluded because `MEM-01` is `Won't` under `DEC-024`.

## Audit results

| Item | Decision | Evidence URL | Checked on |
|---|---|---|---|
| Residence registration — 90-day rule | 수정 | https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031823049 | 2026-07-27 |
| Residence registration — card fee | 수정 | https://www.immigration.go.kr/bbs/immigration/47/590299/artclView.do | 2026-07-27 |
| Residence registration — conflicting route values | 유지 | https://www.immigration.go.kr/bbs/immigration/47/590299/artclView.do; university and application-route values remain listed separately in `TASK_METADATA` | 2026-07-27 |
| Housing proof — four housing paths | 유지 | https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133 | 2026-07-27 |
| Housing proof — third-party address match | 유지 | https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133 | 2026-07-27 |
| Housing proof — registered business accommodation | 유지 | https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133 | 2026-07-27 |
| Housing proof — photo specification and no photo reuse | 유지 | https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133 | 2026-07-27 |
| Group registration — under-one-month limitation | 유지 | https://git.yonsei.ac.kr/git/news/academic.do?mode=download&articleNo=103946&attachNo=88133 | 2026-07-27 |
| Departure order — deposit/account order | 참고정보 | 공개 원문 미확인. 최종 확인처: the university international office | 2026-07-27 (미확인) |
| NHIS exclusion basis | 수정 | https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000240492&chrClsCd=010201; https://www.nhis.or.kr/english/wbheaa02900m01.do | 2026-07-27 |
| Chung-Ang University | 수정 — 확인분 | https://oia.cau.ac.kr/cauoia/exchange/visa.do | 2026-07-27 |
| Seoul National University | 수정 — 확인분 | https://oga.snu.ac.kr/residence-card | 2026-07-27 |
| Yonsei University | 수정 — 확인분 | https://gosc.yonsei.ac.kr/gosc/visa/maintaining.do | 2026-07-27 |
| Korea University | 수정 — 확인분 | https://gsc.korea.ac.kr/gsc/ExchangeVisitingProgram/Visa_Immigration/Visa/Visa.do | 2026-07-27 |
| Hanyang University | 수정 — 확인분 | https://oia.hanyang.ac.kr/visa | 2026-07-27 |
| Sungkyunkwan University | 참고정보 — 최신성 미확인 | 공개 원문 미확인. 최종 확인처: Sungkyunkwan University international office | 2026-07-27 (미확인) |
| Ewha Womans University | 참고정보 — 최신성 미확인 | 공개 원문 미확인. 최종 확인처: Ewha Womans University international office | 2026-07-27 (미확인) |
| Sogang University | 참고정보 — 최신성 미확인 | 공개 원문 미확인. 최종 확인처: Sogang University international office | 2026-07-27 (미확인) |
| Hankuk University of Foreign Studies | 참고정보 — 최신성 미확인 | 공개 원문 미확인. 최종 확인처: Hankuk University of Foreign Studies international office | 2026-07-27 (미확인) |

## Corrections kept in the product content

- NHIS exclusion is based on qualifying medical coverage under foreign law,
  foreign insurance, or an employer contract. A stay shorter than six months is
  not, by itself, an exclusion rule.
- Registered business accommodation remains a valid housing path. The provider's
  cooperation is a dependency; it is not described as impossible.
- Third-party housing proof remains conditional: two documents may be enough when
  the provider ID address matches the proof address; the lease copy is added when
  the addresses differ.
- The source wording for residence changes during card issuance and the
  under-one-month group-registration limitation remains visible. No unsupported
  conversion of "one month" into a universal 30-day rule was added.
- Residence-card fees remain separate values: 30,000 won, 34,000 won, 35,000 won,
  and 40,000 won. The 35,000-won Ministry of Justice value is not used to erase
  route-specific amounts.

## Not done + why

| Not done | Why |
|---|---|
| Institution phone calls, email, or other direct inquiries | Explicitly prohibited by the step's unverified-value policy. |
| Audit of `src/data/missions.ts` cultural missions | `MEM-01` is `Won't` under `DEC-024`; the file is preserved and not treated as current administrative content. |
| Deletion of legacy screens, ADRs, assets, or catalog records | The project rules require preserving them and marking scope/status instead. |
| Changes to pm-job documents | The step requires recording `SPEC-GAP`/`SPEC-DEFECT` findings in this ledger only. |
| New tests | Test authoring is explicitly assigned to Step 8; existing tests were run for this step. |
| Full current verification of the four non-priority universities | The step only authorizes five priority universities; the other four are separated as `latest_unverified`. |
| Full verification of campus lifestyle, dorm, food, and transit prose for the five priority universities | The current official sources verified the institutional guidance boundary. A field-by-field campus-content review needs a separate scope and is not presented as complete here. |
