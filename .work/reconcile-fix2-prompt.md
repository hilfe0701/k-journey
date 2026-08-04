# 과업 — 대조 산출물 교정 2차 (아주 좁은 범위)

`.work/adr-dec-raw-v2.md`는 네가 만든 교정본이다.
`.work/adr-dec-review-v2.md`는 검수 레인의 2차 판정이고, **조건부 가능**이었다.

**최종 4개 조건만 반영한다.** 다른 것은 손대지 마라.

출력은 **`.work/adr-dec-raw-v3.md`** — 새 파일이다.
**`v1`·`v2`·검수본 2종을 고치지 마라.** 코드·`docs/`·`CLAUDE.md`도 한 줄도 고치지 마라.
`v3`는 `v2`의 전체 구조(§0~§7)를 그대로 갖는 **완전한 문서**여야 한다.

> ⛔ **검수 판정을 다시 논하지 마라.** 아래 4건은 제3자가 원문에서 전건 확인을 마쳤다.
> 이의는 §6에 적되 표는 검수대로 바꾼다.

---

## 조건 1 — `ADR-0010`의 근거를 바꾼다 (판정은 그대로 `뒤집힘`)

**검수가 자기 v1 지적을 철회했다.** `ADR-0010`이 `뒤집힘`인 것은 맞지만 **이유가 틀렸다.**

- ❌ 틀린 근거: 「`DEC-003`·`DEC-018`의 4종 주거 × 계약 명의 규칙이 2값 union을 교체한다」
- ✅ 맞는 근거: **`DEC-024`가 `MEM-01 Cultural missions`를 `Won't`로 뒀다**

`ADR-0010`의 `appliesTo`는 **문화 미션 카탈로그 50건의 필터**다. **행정 서류 규칙이 아니다.**
확인된 원문:
- 「Some Have-To missions only make sense for one population」·홈 분모 「X of 50 done」
  (`docs/adr/0010-housing-applies-to-tagging.md:10-12`)
- `src/data/missions.ts` = 「50 curated missions across 4 phases × 4 categories」,
  `MissionCategory = 'settle' | 'food' | 'activity' | 'culture'` (`:1-13`)
- `MEM-01 Cultural missions` = 「**없음 — `Won't`(범위 밖)** `DEC-024`」
  (`.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md:192`)

**할 일:**
1. §1 표의 `ADR-0010` 행 「충돌/관련 DEC」를 **`DEC-024`**로 바꾼다 (`DEC-003`·`DEC-018` 제거).
2. §2 `ADR-0010` 상세를 **`MEM-01` 범위 격리**로 다시 쓴다. 「2값을 4종으로 교체하라」는 **삭제한다.**
3. §4의 **`CLAUDE.md:94-98`에 4종 주거 × 명의 규칙을 이식하라는 제안을 제거한다.**
   신 행정 서류 모델(`DEC-003`·`DEC-018`)은 **별개 사안**이다 — 이 대조표가 결정할 것이 아니다.

## 조건 2 — `ADR-0007`을 `유효 → 불명`으로 내린다

`ADR-0007`(cold-start splash handler ref)의 존재 이유가 **둘 다 사라진 전제** 위에 있다:
- 선택 위치가 **`AuthGate`**다 (`docs/adr/0007-cold-start-splash-handler-ref.md:22,28`) → `DEC-001`이 로그인을 없앤다
- splash가 하는 일이 **「era theme 초기화 + 병풍 패널별 opacity 계산」**이다 (`:12`) → `DEC-024`가 `MEM-02`를 `Won't`로 둔다

**「해당 DEC 없음 + `유효`」가 아니다.** 병풍·`AuthGate`와 무관하게 cold-start splash가 필요한지는
**신 설계에 근거가 없다** → **`불명`**이다.
`불명` 칸에 원 지시대로 **「무엇을 더 봐야 판정할 수 있는지」**를 적어라.

**새 분포는 `뒤집힘 13 · 유효 9 · 보강 12 · 불명 1 = 35`다. 명령으로 다시 세서 §0에 적어라.**

> ⚠️ macOS에서 `sort | uniq -c`로 한글을 세지 마라 — 로케일 대조가 서로 다른 한글을 병합한다.
> `LC_ALL=C`를 붙이거나 `awk` 연관배열로 세라. **합계가 35인지 확인해라.**

## 조건 3 — §7의 `DEC-026` 경계를 정정한다 ★ 가장 중요

v2 §7은 「기존 sync visual도 새 `E8`도 구현 기준으로 확정하지 않는다」로 적었다. **과잉 격리다.**

`44`의 판정은 **「삭제는 유지하고, 신설분은 확정하지 않는다」**다:
- 「**판정 — 삭제는 유지하고, 신설분은 확정하지 않는다.** 지운 5종에 대한 지적은 **전부 충족**이고 되돌릴 이유가 없다」
  (`.work/pmjob/k-journey/44-k-journey-role-review-unscored-dec-2026-07-27.md:149-152`)
- 「**삭제 5종은 유지한다** — … R02의 「오프라인 완료가 덮이면 안 된다」(**기각 불가**·등급 **A**)는 **삭제가 구조적으로 충족**시킨다」
  (`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md:577`)

**즉 삭제를 유보하면 등급 A·기각 불가 지적이 그대로 남는다.**

§7의 `DEC-026` 행을 **둘로 쪼개라**:
| 부분 | 상태 | 이번 구현 |
|---|---|---|
| **삭제** — `save_pending`·`sync_conflict` 상태와 `E2`~`E6` 전이 | **확정 (유지)** | **적용한다.** 원격 sync visual·상태를 걷어낸다 |
| **신설** — `save_failed` 상태·`E8` 전이 | **미확정** | **격리한다.** 별도 세션 확정 전까지 구현 기준으로 고정하지 않는다 |

§2의 `ADR-0031` 상세도 이 경계에 맞춰 고쳐라 — 「전부 격리」로 읽히면 안 된다.

## 조건 4 — `ADR-0034` 경로 구분 · 되돌릴 조건 보완

**4-a.** §2 `ADR-0034` 상세의 「근거가 된 코드」에서 **실재와 부재를 구분**해라.
- `src/lib/share.ts`는 **사진 업로드 코드가 아니다** — 「Capture-and-share helpers for the byeongpung gallery」로
  `captureRef` + `Sharing.shareAsync`를 쓴다 (`src/lib/share.ts:1-6`). **오귀속이다.**
- ADR이 실제 target으로 지목한 `src/lib/photoUpload.ts` · `src/components/photo/PhotoCaptureButton.tsx` ·
  `src/components/photo/PhotoUploadProgress.tsx` · `storage.rules`는 **현재 4개 다 없다**
  (ADR 스스로 「**no photo upload code today**」라고 적었다 · `docs/adr/0034-photo-upload-pipeline.md:171,173-186`).
- **「ADR이 지목한 target(부재)」과 「실재하는 인접 코드」를 다른 줄로 적어라.**

**4-b.** `ADR-0030`·`ADR-0034`의 **되돌릴 조건**이 `DEC-024` 필드 10만 적고 있다. **불완전하다.**
`DEC-024`가 되돌아가면 Memory 범위만 다시 열린다 — `ADR-0030`의 **Sign out**과 `ADR-0034`의 **`users/{uid}` 서버 업로드**는 되살아나지 않는다.
- `ADR-0030`: `DEC-001`의 되돌릴 조건(이력 소실 상위 3위 · 기기 교체 · `MET-006` export 실행률)도 **함께 필요**하다고 적어라
  (`.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md:42`)
- `ADR-0034`: `DEC-022`의 서버 범위 되돌릴 조건도 **함께 필요**하다고 적어라
  (`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md:434`)

---

## 손대지 않는 것

검수 §2가 통과시킨 것은 **그대로 둬라.** 특히:
- `ADR-0008`·`0009`·`0011`의 상세와 되돌릴 조건 — 검수가 「직접 맞는다」로 통과시켰다
- `해당 DEC 없음` 10행 중 **`ADR-0007`을 뺀 9행** — 검수가 `유효`를 수용했다
- §3 `docs/` 파급 — 검수가 고유 문서 5개를 열어 확인했다
- 인용 70셀 — 제3자가 전건 검증했다. **다시 찾지 마라**

## §6 이의

동의하지 않는 것이 있으면 적되 표는 검수대로 둔다. 없으면 **「이의 없음」**이라고 적어라.
**없는 이의를 지어내지 마라.**

## 마지막

끝나면 §0 집계를 **명령으로 다시 세서** 표 행 수·합계가 맞는지 확인해라.
