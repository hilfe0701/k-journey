검수 레인: gpt-5.6-sol · high · 실행 Mon Jul 27 02:33:25 KST 2026

# 대조 산출물 검수

검수 대상은 `.work/adr-dec-raw.md`다. 이 문서는 대조 산출물을 고치지 않고, 원 지시와 원문에 대어 지적만 남긴다.

근거 표의 축약 경로 `31…md`, `28…md`, `19…md`는 각각
`.work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md`,
`.work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md`,
`.work/pmjob/k-journey/19-k-journey-f03-ia-screen-inventory-2026-07-25.md`를 뜻한다.

## §0 재집계 — 검수자 명령과 결과

```text
검수자 재집계:
  ADR 개수: find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -print | sort | wc -l → 35
             | 산출물 기재: 35 | 일치
  DEC 개수: (rg -o '^### `DEC-[0-9]{3}`' .work/pmjob/k-journey/31-k-journey-decision-log-2026-07-25.md;
             rg -o '^\| 1 \| `DEC-ID` \| `DEC-[0-9]{3}`' .work/pmjob/k-journey/28-k-journey-service-policy-2026-07-25.md)
             | rg -o 'DEC-[0-9]{3}' | sort -u | wc -l → 27
             | 산출물 기재: 27 | 일치
  §1 표 행 수: rg -c '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw.md → 35
                | 산출물 기재: 35 | 일치
```

- `docs/adr/`의 비-ADR 파일은 `README.md`, `template.md` 2개다. 위 ADR 명령은 둘을 제외한다.
- DEC 정의는 원본 B의 제목 `DEC-002`~`DEC-027` 26건과, B가 재사용한다고 명시한 정책서의 `DEC-001` 1건이다.
- 판정 분포 재집계 명령:

```text
rg '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw.md |
awk -F'|' '{gsub(/^ +| +$/,"",$4); c[$4]++} END {for (k in c) print k, c[k]}' | sort

→ 뒤집힘 7
  보강 13
  불명 1
  유효 14
→ 합계 35 = ADR 35
```

- 집합 대조:

```text
comm -3 \
  <(find docs/adr -maxdepth 1 -type f -name '[0-9][0-9][0-9][0-9]-*.md' -exec basename {} \; |
    sed -E 's/^([0-9]{4}).*/ADR-\1/' | sort) \
  <(rg '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw.md |
    sed -E 's/^\| (ADR-[0-9]{4}).*/\1/' | sort)
→ 출력 없음

rg '^\| ADR-[0-9]{4} \|' .work/adr-dec-raw.md |
sed -E 's/^\| (ADR-[0-9]{4}).*/\1/' | sort | uniq -d
→ 출력 없음
```

따라서 ADR 누락 0건, 표에만 있는 ID 0건, 중복 ID 0건이다.

## §1 지적 목록

| # | 항목(①~⑥) | 대상 ADR/DEC | 지적 | 근거(원문 인용 + 파일:위치) | 심각도 |
|---|---|---|---|---|---|
| 1 | ① | DEC 전건 | 숫자 27은 맞지만 산출물의 주 집계 명령 `rg -o 'DEC-[0-9]{3}' … \| sort -u`는 **정의가 아니라 언급**을 센다. 다른 DEC를 예시로만 언급해도 개수가 늘 수 있다. 산출물은 뒤에서 제목 26건과 외부 정의 `DEC-001`을 설명해 결과를 보완했으므로 현재 숫자 오류는 아니다. | 원본 B는 “`DEC-001` 재사용 1”이라고 적고(`31…md:6`), “신규 26 = `DEC-002`~`DEC-027`”이라고 정의한다(`31…md:652`). 실제 제목 집계는 26, 정책서의 `DEC-ID` 정의는 1이다(`28…md:33`). | 참고 |
| 2 | ③ | ADR-0008 / DEC-024 | 병풍 화면이 이번 구현 범위 밖인데 PNG 24장 구현 결정을 `유효`로 두었다. 그대로 구현하면 `Won't` 기능에 자산·번들·화면 코드를 투입한다. | ADR: “**Chosen:** 24 PNGs, one per (era, panel) pair…” (`docs/adr/0008-byeongpung-png-not-svg.md:30`). DEC: “MoSCoW **`Won't`**… **「이번 범위 밖 — 구현하지 않는다」**” (`31…md:477`), 대상 `MEM-02 Byeongpung` (`19…md:193`). | 차단 |
| 3 | ③ | ADR-0009 / DEC-024 | `claimPanelUnlock`은 병풍 패널·문화 미션 완료를 전제로 한다. 병풍과 문화 미션이 모두 `Won't`인데 `유효`로 두었다. | ADR: “Callers fire the overlay + telemetry + notification only on `true`.” (`docs/adr/0009-single-fire-panel-unlock.md:33`). DEC-024 대상은 `MEM-01`~`MEM-03`이고(`31…md:468`), `MEM-01 Cultural missions`와 `MEM-02 Byeongpung`은 구현 범위 밖이다(`19…md:192-193`). | 차단 |
| 4 | ③ | ADR-0010 / DEC-003·018 | 2값 `appliesTo`를 4종 주거 × `contractHolder` 규칙의 “보강”으로 볼 수 없다. 기존 타입은 새 분기 입력을 표현하지 못하므로 교체 대상이다. | ADR: “`appliesTo?: 'dormitory' \| 'off-campus'`” (`docs/adr/0010-housing-applies-to-tagging.md:28`). DEC-003: “규칙 계층이 조합을 판정해 **서류 목록 + 항목별 `요청 대상자`**를 반환” (`31…md:142`). DEC-018: “**원문의 4종 분류를 그대로 따른다**” (`31…md:356`). | 차단 |
| 5 | ③ | ADR-0011 / DEC-024 | 집계 함수의 세 소비자와 두 입력 축이 모두 구 Memory 제품 구조다. 문화 미션·병풍·갤러리가 `Won't`인데 `유효`로 두었다. | ADR: “Returns `{ missionCount, bucketItemCount, total }`” 및 병풍·갤러리 소비자 (`docs/adr/0011-single-source-completion-aggregation.md:31-35`). DEC: `MEM-01`~`MEM-03`은 “**이번 구현 범위 밖**” (`31…md:477`; `19…md:192-194`). | 차단 |
| 6 | ③ | ADR-0030 / DEC-024·001 | “정확히 3곳”이라는 정책 중 panel unlock·mission complete는 `Won't` 기능이고, Sign out은 로그인 없음과 충돌한다. 일부 일반 원칙이 남아도 현재 3-moment 계약을 그대로 구현할 수 없으므로 `유효`가 아니다. | ADR: “Haptics fire at exactly **three moments**” (`docs/adr/0030-haptics-and-sound-feedback.md:36`), 세 순간은 panel unlock / mission complete / Delete bucket·Sign out·Remove photo (`:40-44`). DEC-024는 Memory 3화면을 구현하지 않고(`31…md:468,477`), DEC-001은 “**로그인을 두지 않는다**” (`28…md:39`). | 차단 |
| 7 | ④ | ADR-0031 / DEC-026 | `뒤집힘` 판정 자체는 맞지만 표의 ADR 인용은 원문에 없는 합성문이다. `grep`으로 그대로 찾을 수 없다. DEC 인용도 중간 문구를 `…`로 바꾼 축약문이라 “그대로 옮김” 조건을 충족하지 않는다. 표본 12행 중 1행에서 양쪽 셀의 완전 일치가 깨졌다. | 산출물: “`disconnected → connected` **with pending writes**: T1 toast `Synced.`” (`.work/adr-dec-raw.md:54`). 실제 ADR: “When `NetInfo.isConnected` transitions from `false → true`” 뒤에 “if there were ≥ 1 pending writes… `Synced.`”가 따로 있다(`docs/adr/0031-offline-state-visibility.md:49-52`). 실제 DEC의 한 행에는 삭제 상태와 전이 사이에 수량 설명이 존재한다(`31…md:550`). | 차단 |
| 8 | ⑤ | ADR-0034 / DEC-001·022·024 | `불명`은 해소 가능하다. 이 ADR은 계정 UID 기반 Firebase Storage, 문화 미션 사진, 갤러리·병풍을 전제로 한다. 로그인·사용자 원격 데이터가 없고 해당 화면들이 `Won't`이므로 `뒤집힘`이다. DEC-013의 “서류 사진 규격/재사용 경고”는 사용자가 사진을 업로드한다는 결정이 아니다. | ADR: “Storage path: `users/{uid}/photos/{missionId}/{ulid}.jpg`” (`docs/adr/0034-photo-upload-pipeline.md:71`), “Photos are the connective tissue of the gallery… and … byeongpung” (`:10`). DEC-001: “조건 축·태스크 상태는 **기기 로컬에만**” (`28…md:39`). DEC-022: “조건 축·태스크 상태의 **원본은 올라가지 않는다**” (`31…md:431`). DEC-024 대상에 Cultural missions·Byeongpung·Gallery가 모두 포함된다(`19…md:192-194`). | 차단 |
| 9 | ⑥ | CLAUDE.md 제안 248–250 | App Store/Play Store **개발자 계정 존재 여부와 환경별 bundle ID**를 `DEC-001`·`POL-012` 때문에 `미확인`으로 바꾸자는 제안은 §1 판정에서 나오지 않는다. 두 결정은 사용자 로그인/데이터 고지에 관한 것이지 스토어 개발자 계정 보유나 bundle ID 전략의 근거가 아니다. | 실제 현재 줄은 “App Store / Play Store developer accounts — exist already? Different bundle IDs per environment…” (`CLAUDE.md:248-250`). 산출물 제안은 이를 “계정/스토어 상태를 DEC-001·POL-012와 대조”하도록 바꾼다(`.work/adr-dec-raw.md:158`). §1에는 개발자 계정·bundle ID 판정이 없다. | 보강 |

## §2 판정 뒤집기 제안

### ADR-0008: `유효 → 뒤집힘`

- ADR 원문: “**Chosen:** 24 PNGs, one per (era, panel) pair, each baked with its era's colour and motif.” (`docs/adr/0008-byeongpung-png-not-svg.md:30`)
- DEC 원문: “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31-k-journey-decision-log-2026-07-25.md:468`) / “MoSCoW **`Won't`**… **「이번 범위 밖 — 구현하지 않는다」**” (`:477`)
- 연결 원문: `MEM-02`는 “Byeongpung”이다 (`19-k-journey-f03-ia-screen-inventory-2026-07-25.md:193`).

### ADR-0009: `유효 → 뒤집힘`

- ADR 원문: “Callers fire the overlay + telemetry + notification only on `true`.” (`docs/adr/0009-single-fire-panel-unlock.md:33`)
- DEC 원문: “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31…md:468`) / “**이번 범위 밖 — 구현하지 않는다**” (`:477`)
- 연결 원문: `MEM-01`은 Cultural missions, `MEM-02`는 Byeongpung이다 (`19…md:192-193`). 이 둘이 없으면 panel unlock의 발동원과 결과 화면이 모두 없다.

### ADR-0010: `보강 → 뒤집힘`

- ADR 원문: “**Chosen:** `appliesTo?: 'dormitory' | 'off-campus'` field.” (`docs/adr/0010-housing-applies-to-tagging.md:28`)
- DEC 원문: “규칙 계층이 조합을 판정해 **서류 목록 + 항목별 `요청 대상자`**를 반환한다.” (`31…md:142`) / “독립 범주로 추가한다. **원문의 4종 분류를 그대로 따른다**” (`:356`)
- 새 결정은 기존 2값 union을 구체화하는 것이 아니라, 4종 주거와 계약 명의의 조합 규칙으로 대체한다.

### ADR-0011: `유효 → 뒤집힘`

- ADR 원문: “Returns `{ missionCount, bucketItemCount, total }`.” (`docs/adr/0011-single-source-completion-aggregation.md:31`)
- DEC 원문: “대상은 **`SUP-01` · `MEM-01` · `MEM-02` · `MEM-03`**.” (`31…md:468`) / “**이번 범위 밖 — 구현하지 않는다**” (`:477`)
- 연결 원문: Cultural missions·Byeongpung·Gallery 세 화면이 모두 `Won't`이다 (`19…md:192-194`). 기존 집계의 입력과 소비자가 신 구현 범위에 남지 않는다.

### ADR-0030: `유효 → 뒤집힘`

- ADR 원문: “**Chosen:** Haptics fire at exactly **three moments**” (`docs/adr/0030-haptics-and-sound-feedback.md:36`), 즉 Panel unlock / Mission complete / Delete bucket·Sign out·Remove photo (`:40-44`).
- DEC 원문: “**`MEM-01` · `MEM-02` · `MEM-03`**”은 대상이고(`31…md:468`), “**이번 범위 밖 — 구현하지 않는다**” (`:477`). 또한 “**로그인을 두지 않는다**” (`28-k-journey-service-policy-2026-07-25.md:39`).
- 따라서 “정확히 세 순간”이라는 계약은 그대로 성립하지 않는다. 새 제품의 촉각 피드백 정책을 다시 결정해야 한다.

이 다섯 건을 반영하면 §1 분포는 우선 `뒤집힘 12 · 유효 10 · 보강 12 · 불명 1`이 된다. 여기에 §1 지적 #8의 `ADR-0034 불명 → 뒤집힘`까지 반영하면 `뒤집힘 13 · 유효 10 · 보강 12 · 불명 0`, 합계 35다.

## §3 통과한 것

- **집계와 누락 검사:** ADR 35, DEC 27, 표 35행, 분포 합 35가 맞다. ADR ID 집합 차이와 중복은 모두 0건이다.
- **기존 `뒤집힘` 7건의 판정 방향:** ADR-0006, 0013, 0014, 0021, 0031, 0032, 0033은 원문상 신 결정과 충돌한다. ADR-0031은 인용 방식 결함이 있지만 `뒤집힘` 결론 자체는 맞다.
- **지정 분석 문서 충돌:** `docs/ANALYTICS_SCHEMA.md`의 `sign_in`, `{ era, university, housing }`, `university` super-property(`:20,28,131`)는 DEC-001 및 DEC-027/POL-001과 충돌한다는 산출물 결론이 맞다.
- **지정 동기화 문서 충돌:** `DESIGN.md` §21의 `pending writes`, `Synced.`, `eventual consistency`, `Updated from another device.`(`:685,700,707,712`)는 DEC-026의 원격 동기화 상태·전이 삭제와 충돌한다는 결론이 맞다.
- **지정 스토어 고지 충돌:** `PLAY_DATA_SAFETY.md`의 collect=yes, Email/Name/User IDs(`:10,22-24`)와 `STORE_LISTING.md`의 account-bound progress/sign-in required(`:48,83`)가 DEC-001·POL-012와 맞지 않는다는 결론이 맞다.
- **상태 모델 표본:** ADR-0012의 단일 오류 진입점과 ADR-0028의 오류별 복구 surface 자체는 DEC-020의 별도 오류 축과 병행할 수 있다. 단, 배지 상태·로컬 저장 실패 문구를 연결해야 하므로 산출물의 `보강` 판정은 수용 가능하다.
- **인용 표본 중 통과 11행:** `뒤집힘` 7행 전건과 비-뒤집힘 5행을 검사했다. 비-뒤집힘 표본은 아래 명령으로 고정 seed 추출한 ADR-0004, 0008, 0009, 0010, 0018이다. ADR-0031을 제외한 11행에서는 표에 제시된 ADR·DEC 핵심 문구를 `rg -nF`로 원문에서 확인했다.

```text
ruby -e 'ids=STDIN.each_line.map{|l| m=l.match(/^\| (ADR-\d{4}) \|.*\| (유효|보강|불명) \|/); m && m[1]}.compact;
puts ids.sample(5, random: Random.new(20260727)).sort' < .work/adr-dec-raw.md
```

- **CLAUDE.md 제안의 대부분:** 결정 우선순위, legacy PRD 표시, 인증·원격 사용자 저장 제거, Settings/account 문구 정정 제안은 §1의 ADR-0003·0013·0014·0021·0031·0032·0033 판정에 근거한다. §1 지적 #9의 248–250 제안만 예외다.

## §4 검수의 한계

- 인용 실재 검사는 지시대로 `뒤집힘` 7행 전건과 고정 seed 무작위 5행, 합계 12행만 했다. 나머지 23행의 양쪽 인용을 전건 검사했다고 주장하지 않는다.
- 위험 방향 후보 ADR 13건(0004, 0005, 0008, 0009, 0010, 0011, 0012, 0015, 0028, 0029, 0030, 0031, 0034)의 원문을 열어 보았다. 모든 ADR 35건을 처음부터 끝까지 정독한 것은 아니다.
- 코드 영향 열의 모든 경로가 실제 호출 관계인지 전건 추적하지 않았다. 이번 검수는 문서 판정과 인용 검증이 범위이며 코드는 수정하지 않았다.
- DEC-026·DEC-027은 원본 자체가 `V5` 미충족·미확정이라고 명시한다(`31…md:576-580,604-614`). 따라서 그 둘에 기대는 구현은 이 검수의 판정 수정만으로 승인될 수 없다.
- `DEC-024`는 화면을 삭제하지 않고 `Won't`로 남긴다. 여기서 `뒤집힘`은 ADR 파일 삭제를 뜻하지 않는다. **현재 구현 근거로 사용하면 안 된다**는 뜻이다.

## 최종 답

**불가(사유).**

이 대조 결과를 근거로 저장소 `CLAUDE.md`를 고치고 구현에 들어가면 안 된다. 구현 범위 밖 기능을 `유효`·`보강`으로 둔 위험 방향 오판 5건, 판정 가능한 ADR을 `불명`으로 둔 1건, `뒤집힘` 원문 인용 비실재 1건이 있다. 또한 DEC-026·027은 원본에서 아직 확정되지 않았다.

진입 전 최소 조건은 다음과 같다.

1. ADR-0008·0009·0010·0011·0030을 `뒤집힘`으로 재분류하고, ADR-0034의 `불명`을 해소한다.
2. 판정 분포와 §2·§3·§4 파급 제안을 새 분포로 다시 계산한다.
3. ADR-0031의 양쪽 인용을 실제 원문으로 교체하고, 남은 23행 인용도 전건 `grep` 검증한다.
4. CLAUDE.md 248–250 제안처럼 §1 밖 근거로 만든 수정을 제거하거나 별도 결정 근거를 붙인다.
5. DEC-026·DEC-027의 승인 상태를 해결한 뒤 그 두 결정에 기대는 구현 범위를 확정한다.

**기각 0건이 아니다.** 위험 방향 후보 ADR 13건을 실제로 열어 보았고, 그중 5건을 `유효/보강 → 뒤집힘`, 1건을 `불명 → 뒤집힘` 지적으로 채택했다. 인용은 12행을 실제 검사해 1행을 기각했다.
