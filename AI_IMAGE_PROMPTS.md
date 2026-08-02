# K-Journey AI 이미지 생성 브리프

> **2026-08-02 상태:** 이 문서는 현재 35개 자산이 만들어진 과거 제작 브리프다.
> 다음 아트 패스는 패널 24장을 독립 생성하지 않고 시대별 연속 원화 1장을 먼저
> 승인한 뒤 8폭으로 분할한다. 현재 규격·검수·출처 기록은
> `docs/BYEONGPUNG_ART_DIRECTION.md`가 우선한다. 기존 프롬프트의 독립 포스터 방식과
> 실제 토큰과 다른 색상 값은 새 생성의 기준으로 사용하지 않는다.

이 문서는 K-Journey 앱에 들어갈 35장의 PNG를 **Gemini** (Imagen 3 백엔드)로 생성하기 위한 작업 지시서입니다. 임선균·정진우·최민희 3인 분담.

---

## 0. 한 줄 요약

| 묶음 | 장수 | 무엇 |
|---|---:|---|
| A. 앱 아이덴티티 | 5 | 앱 아이콘, 스플래시, 적응형 아이콘, favicon, 알림 아이콘 |
| B. 병풍 패널 (3시대 × 8모티프) | 24 | 시대별 8폭 병풍 한 폭씩 |
| C. 버킷 템플릿 (민화 6종) | 6 | 사용자 버킷 그림 |
| **합계** | **35** | |

---

## 1. 확정된 결정사항

| 항목 | 결정 |
|---|---|
| 도구 | Gemini (Imagen 3) — PNG만 출력 |
| 병풍 스타일 | 전통 민화 (붓선 굵기 변화, 면 채색) |
| 병풍 구성 | **풀페인팅** — 패널 바탕색 + 텍스처 + 모티프 한 장에 베이크 |
| 시대별 변주 | 시대마다 다르게 (24장) |
| 버킷 템플릿 시대 | 시대 무관 (6장 단일 세트, 조선 민화풍 통일) |
| 앱 아이콘 컨셉 | 도장(印) 사각 + 흰색 K 전서체 |
| 도장 바탕색 | 단청적색 #C5302A |
| 도장 글자색 | 흰색 #FFFFFF |
| 스플래시 | 도장 로고 중앙 키워서, 한지색 #FDFAF3 배경 |
| 기능 아이콘 | Lucide 유지 (이번 작업 범위 밖) |
| 파일명 규칙 | 코드 속 최종 경로 그대로 (예: `byeongpung_joseon_peony.png`) |
| 분담 방식 | 물량 균등 + 섞어서 |

---

## 2. 공통 스타일 가이드 — **모든 프롬프트가 따라야 함**

### 2.1 색 팔레트 (디자인 토큰)

**브랜드 핵심**
- 단청적색 dancheong: `#C5302A`
- 단청 진홍 dancheongDeep: `#9B1F1B`
- 황금 hwanggeum: `#D4A82E` (또는 `#E0B844`)
- 청 cheong: `#1B4F8C`
- 옥색 jade: `#3A7D6A`
- 연꽃 lotus: `#E89B9B`
- 먹색 meok: `#2C2416`
- 한지 hanji: `#FDFAF3`
- 회 ash: `#9B9389`

**시대별 패널 배경색 (B 24장에서 사용)**
- 조선 panel.bg: `#F5E8C8` (따뜻한 한지 누런빛)
- 신라 panel.bg: `#F0E0A0` (금빛이 도는 상아색)
- 고려 panel.bg: `#D8E8D0` (연한 청자녹)

### 2.2 시대별 비주얼 앵커

#### 조선 (Joseon, 1392–1897)
- **시기 명시**: late Joseon dynasty (19th century)
- **장르**: folk painting tradition (민화) — **NOT** court painting
- **참고 작품**: 호작도, 책가도, 화조도, 문자도
- **테크닉**: bold black ink outlines (varied 2–4px stroke), flat saturated mineral pigments, no Western perspective, slight stylization with naive charm
- **주요 색**: vermilion #C5302A, deep yellow #D4A82E, indigo #1B4F8C, jade #3A7D6A, ink #2C2416
- **종이**: aged hanji #F5E8C8, faint horizontal fiber grain

#### 신라 (Silla, 676–935)
- **시기 명시**: Unified Silla period (7th–9th century)
- **장르**: court refinement + Four Symbols (사신수) imagery + Gyeongju goldsmithing motifs
- **참고**: 안압지 유물, 금관 ornament, 사신수, 신라 와당
- **테크닉**: refined symmetrical composition, geometric decorative borders, gold-leaf accents, fine hairline detail mixed with bold motif
- **주요 색**: gold #D4A840 / #E0B844, vermilion #C5302A / #E8563A, deep blue #1B4F8C / #3D9BE8, ivory #E8E8E8 / #C8C8C8, ink #2C2416
- **종이/비단**: gold-tinted ground #F0E0A0, faint silk weave texture

#### 고려 (Goryeo, 918–1392)
- **시기 명시**: Goryeo dynasty (10th–14th century)
- **장르**: Buddhist painting (불화) refinement + celadon ceramic incised motifs (청자상감)
- **참고**: 수월관음도, 청자상감 운학문, 팔만대장경, 고려 불화
- **테크닉**: muted contemplative palette, subtle gradations, refined linework, Buddhist iconographic stillness
- **주요 색**: celadon green #3A7D6A / #5A9A6A, jade #5A9A6A, deep blue #2A5AAA, soft gold accent #C8A030, ivory white, ink
- **바탕**: pale celadon ground #D8E8D0, faint cloud-and-crane incision texture

### 2.3 모든 병풍 패널 공통 사양

- **비율**: 1:3.4 portrait (실제 8폭 병풍 한 폭의 비율)
- **출력 크기**: 600 × 2040 픽셀
- **구도**: 한 폭의 세로 패널을 정면에서 본 모습. 패널 가장자리 frame은 그리지 않음 (코드가 borderRadius로 처리)
- **종이/비단 텍스처**: 미세하게 가시적
- **모티프 위치**: 패널 가운데 영역에 중심 모티프, 위·아래로 자연스러운 여백
- **밀도**: 너무 비어있지 않게, 모티프가 panel 내 약 60~75% 차지

### 2.4 모든 버킷 템플릿 공통 사양

- **비율**: 1:1 square
- **출력 크기**: 1024 × 1024 픽셀
- **스타일**: Joseon 19th century 민화 (조선 민화 통일)
- **배경**: hanji #FDFAF3 또는 매우 연한 색조 ground (모티프와 어울리는 톤)
- **구도**: 모티프 한 개를 정사각형 캔버스 정중앙에, 약 70~80% 영역 차지
- **컬러풀**: 면 채색으로 풍부한 색

### 2.5 모든 프롬프트가 반드시 포함해야 하는 부정 큐 (Negative cues)

```
DO NOT include: any text, Chinese characters, Korean Hangul characters,
signatures, seals, watermarks, modern design effects (gradients, glow,
drop shadows, glassmorphism, lens flares, bokeh), photographic realism,
Western single-point perspective, AI watermarks, frame borders around
the artwork, white margins or empty borders.
```

(앱 아이콘 A1·A2·A3은 의도된 K 전서체 letterform이므로 "any text" 부분만 빼고 나머지 그대로)

---

## 3. 분담 요약

| 담당자 | 장수 | 묶음 |
|---|---:|---|
| **임선균** | **12** | A1, A2 + 조선 3, 신라 3, 고려 2 + 버킷 2 |
| **정진우** | **12** | A3, A5 + 조선 3, 신라 3, 고려 2 + 버킷 2 |
| **최민희** | **11** | A4 + 조선 2, 신라 2, 고려 4 + 버킷 2 |

각자 모든 8개 모티프를 한 번씩 (다른 시대로) 그리게 됨 → 모티프 일관성 검수 시 3명이 서로 비교 가능.

### 3.1 임선균 (12장)

| # | 파일명 | 묶음 |
|---|---|---|
| 1 | `icon.png` | A. 앱 아이덴티티 |
| 2 | `splash.png` | A. 앱 아이덴티티 |
| 3 | `byeongpung_joseon_peony.png` | B. 병풍 |
| 4 | `byeongpung_joseon_tiger.png` | B. 병풍 |
| 5 | `byeongpung_joseon_sun.png` | B. 병풍 |
| 6 | `byeongpung_silla_crane.png` | B. 병풍 |
| 7 | `byeongpung_silla_mountain.png` | B. 병풍 |
| 8 | `byeongpung_silla_lotus.png` | B. 병풍 |
| 9 | `byeongpung_goryeo_wave.png` | B. 병풍 |
| 10 | `byeongpung_goryeo_chaekgeori.png` | B. 병풍 |
| 11 | `bucket_peony.png` | C. 버킷 |
| 12 | `bucket_lotus.png` | C. 버킷 |

### 3.2 정진우 (12장)

| # | 파일명 | 묶음 |
|---|---|---|
| 1 | `adaptive-icon.png` | A. 앱 아이덴티티 |
| 2 | `notification-icon.png` | A. 앱 아이덴티티 |
| 3 | `byeongpung_joseon_crane.png` | B. 병풍 |
| 4 | `byeongpung_joseon_mountain.png` | B. 병풍 |
| 5 | `byeongpung_joseon_chaekgeori.png` | B. 병풍 |
| 6 | `byeongpung_silla_tiger.png` | B. 병풍 |
| 7 | `byeongpung_silla_sun.png` | B. 병풍 |
| 8 | `byeongpung_silla_wave.png` | B. 병풍 |
| 9 | `byeongpung_goryeo_peony.png` | B. 병풍 |
| 10 | `byeongpung_goryeo_lotus.png` | B. 병풍 |
| 11 | `bucket_tiger.png` | C. 버킷 |
| 12 | `bucket_chaekgeori.png` | C. 버킷 |

### 3.3 최민희 (11장)

| # | 파일명 | 묶음 |
|---|---|---|
| 1 | `favicon.png` | A. 앱 아이덴티티 |
| 2 | `byeongpung_joseon_lotus.png` | B. 병풍 |
| 3 | `byeongpung_joseon_wave.png` | B. 병풍 |
| 4 | `byeongpung_silla_peony.png` | B. 병풍 |
| 5 | `byeongpung_silla_chaekgeori.png` | B. 병풍 |
| 6 | `byeongpung_goryeo_crane.png` | B. 병풍 |
| 7 | `byeongpung_goryeo_tiger.png` | B. 병풍 |
| 8 | `byeongpung_goryeo_mountain.png` | B. 병풍 |
| 9 | `byeongpung_goryeo_sun.png` | B. 병풍 |
| 10 | `bucket_crane.png` | C. 버킷 |
| 11 | `bucket_sansuhwa.png` | C. 버킷 |

---

## 4. Gemini 사용 팁 (작업 시작 전 필독)

1. **프롬프트는 영어로 작성됨** — 미네랄 안료(mineral pigment), 시대(Joseon dynasty)와 같은 미술 용어는 영문 프롬프트가 더 정확하게 작동.
2. **한 번에 한 장씩** — Gemini는 보통 한 번에 4장 정도 변형을 생성. 그 중 가장 가까운 것 선택 후 추가 지시로 보정.
3. **비율 강제 명시** — Gemini는 정확한 픽셀 사이즈를 보장하지 않음. 결과물이 비율이 틀리면 후처리에서 크롭/리사이즈 필요. 프롬프트 끝에 항상 `Aspect ratio: 1:3.4 portrait` 또는 `1:1 square` 명시.
4. **가급적 첫 결과를 받아 reference로 두번째 변형 요청** — "in the same painting style as the previous image, but ..." 식으로 시리즈 일관성 확보.
5. **마음에 안 들면 일부만 수정** — "make the peony petals more vermilion red", "add more aged texture to the background" 같이 자연어 지시 가능.
6. **불필요 텍스트 끼어들면 다시 요청** — Gemini가 자꾸 한자/한글 글자를 그려 넣는 경우 negative cue를 강조하여 재시도.
7. **하나의 모티프는 같은 사람이 3개 시대를 그리지 않음** — 시대별 일관성을 위해 각자가 같은 모티프를 보고 비교할 수 있게 분배함. 작업하다가 다른 시대 같은 모티프 본인이 안 한다고 답답하면 다른 담당자에게 슬랙으로 reference 공유 요청.
8. **출력 후 압축 X** — 원본 PNG 그대로 제출. 코드에 들어갈 때 또 압축됨.

---

## 5. 임선균 담당 프롬프트 (12장)

---

### 5.1 `icon.png` — 앱 아이콘

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/images/icon.png`
- **컨셉**: 단청적색 사각 도장 + 흰색 K 전서체 글자

#### 프롬프트 (Gemini에 그대로 붙여넣기)

> Square Korean traditional ink-stamp seal artwork at 1024×1024 pixels.
> The seal is a solid vermilion red square (#C5302A — Korean dancheong red)
> filling the entire canvas with no rounded corners and no white margin.
> Subtle aged texture suggesting the seal has been pressed onto paper many
> times: very faint horizontal grain, micro-cracks at the edges, slight ink
> density variation toward the corners. In the absolute center, a single
> white letter "K" rendered in Korean ancient seal-script style (전서체 /
> 篆書) — angular, geometric, balanced strokes resembling characters carved
> into a stone seal. The K's vertical line is thick (approximately 12% of
> canvas width), the upper diagonal angles down-right at about 35°, the
> lower diagonal mirrors it angling up-right; both diagonals meet the
> vertical at the same midpoint creating a tight rotationally-balanced
> form. White color is pure (#FFFFFF). The K occupies roughly 55% of the
> canvas height, vertically and horizontally centered. A thin white border
> frame, 8px thick, sits 60px inset from the canvas edge — this frame is
> slightly broken at irregular spots to suggest hand-carving. Overall feel:
> dignified, ancient, hand-stamped, weighty, weighty enough to be a state
> seal. Flat color rendering — no gradients, no glow, no drop shadow, no
> embossing, no shine. The composition reads instantly even at thumbnail
> size (40×40 pixels).
>
> DO NOT include: any text other than the centered K, any Hangul or
> Chinese characters, photographic elements, modern design effects
> (gradients, glassmorphism, glow, drop shadows), logos, watermarks,
> signatures, rounded outer corners, transparent areas.
>
> Aspect ratio: 1:1 square. Solid #C5302A background fills entire canvas.

#### 검수 체크리스트

- [ ] 정확히 1024×1024 PNG (다른 비율로 나오면 재생성)
- [ ] 배경 단청적색이 캔버스 전체를 덮음 (모서리 둥글지 않음)
- [ ] K 글자가 흰색 #FFFFFF, 전서체 느낌의 각진 형태
- [ ] K가 캔버스 중심에 위치, 상하좌우 여백 균일
- [ ] 한자/한글 같은 다른 글자 없음
- [ ] 그라디언트·반사·드롭섀도우 없음
- [ ] 40×40 썸네일로 축소해도 K가 식별됨

---

### 5.2 `splash.png` — OS 콜드스타트 스플래시

- **출력**: 1242 × 2436 PNG, 9:17.6 portrait (iPhone X 해상도)
- **저장 경로**: `assets/images/splash.png`
- **컨셉**: 한지색 배경 중앙에 도장 로고 키워서 (icon.png를 큰 사이즈로 중앙 배치한 느낌)

#### 프롬프트

> Vertical portrait splash screen artwork at 1242×2436 pixels for a Korean
> mobile app. The background is a solid warm hanji paper color (#FDFAF3 —
> Korean mulberry paper) covering the entire canvas, with very subtle
> horizontal fiber grain texture barely visible. In the center of the
> canvas, vertically centered, a square Korean traditional ink-stamp seal
> occupies approximately 35% of the canvas width (about 435×435 pixels).
> The seal is a solid vermilion red square (#C5302A — Korean dancheong
> red) with subtle aged texture, micro-cracks at the edges, slight ink
> density variation. In the center of the seal, a single white letter "K"
> in Korean ancient seal-script style (전서체) — angular, geometric,
> balanced strokes resembling characters carved into a stone seal. The K
> is pure white #FFFFFF, occupying about 55% of the seal's height. A
> thin white inset border frame on the seal, 8px thick, slightly broken
> at irregular spots. The seal sits roughly at vertical midpoint of the
> canvas (slight optical adjustment upward by 5% to account for visual
> weight). Top half above the seal is empty hanji background. Bottom half
> below the seal is also empty hanji background — no text, no wordmark,
> no decorations. Pure minimalist composition.
>
> DO NOT include: any text, any wordmark, any Hangul or Chinese
> characters, any subtitle, any URL, any logos other than the central
> seal, photographic elements, modern design effects (gradients, glow,
> drop shadows), watermarks, signatures, splash screen UI elements
> (loading bars, dots), Apple/Google logos.
>
> Aspect ratio: 1242:2436 (≈ 9:17.6 portrait). Solid #FDFAF3 background
> covers entire canvas except the centered red seal. The red seal must
> NOT touch the canvas edges; ample hanji margin on all four sides.

#### 검수 체크리스트

- [ ] 정확히 1242×2436 (잘못 나오면 캔버스 사이즈 명시 재시도)
- [ ] 한지색 배경 (#FDFAF3) 캔버스 가득
- [ ] 도장 로고가 화면 중심부 위쪽 살짝 (vertical 50% 보다 약간 위)
- [ ] 도장 크기 캔버스 너비의 30~38%
- [ ] K-Journey 워드마크 등 텍스트 절대 없음
- [ ] icon.png과 도장 디자인이 완전히 동일 (재현성)

---

### 5.3 `byeongpung_joseon_peony.png` — 조선 모란

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **저장 경로**: `assets/byeongpung/joseon_peony.png` (또는 코드 통합 시 결정)
- **시대**: 조선 19세기 민화
- **모티프**: 모란 (Peony) — 부귀, 만개

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍 / byeongpung)
> in the late Joseon dynasty (19th century) folk painting (민화) tradition.
> Vertical portrait composition with aspect ratio 1:3.4, output at 600×2040
> pixels.
>
> Background fills the entire canvas: aged hanji paper in warm pale yellow
> #F5E8C8, with very subtle horizontal mulberry fiber grain texture,
> slightly mottled, the texture of handmade Korean paper after a century
> of aging. No frame, no border, no margin — the painting extends edge to
> edge.
>
> Foreground: a flowering peony plant (모란) in full bloom, occupying the
> central 65% of the panel height. Three large open peony blossoms at
> varied heights — one near the top, one in the middle, one in the
> lower-middle. Each blossom is rendered with: bold uneven black ink
> outlines (varied stroke 2–4 pixels), bright vermilion #C5302A petals
> filled in flat color blocks, deep yellow #D4A82E pistil centers with
> small dotted detail. Six lush green leaves #3A7D6A surround the
> blossoms, drawn with bold dark green ink outlines and lighter green
> fill — leaves overlap naturally with stem branches in dark ink #2C2416.
> The plant grows from stylized rocky soil at the panel base, roots
> implied by ink wash. Two small folk-style butterflies in dark ink with
> minimal vermilion accent flutter near the upper blossoms (very small,
> stylized, naive).
>
> Style: Joseon-dynasty 화조도 (flower-and-bird painting) folk tradition —
> bold lines, flat saturated mineral pigments, no Western perspective, no
> shading, deliberate naive charm, slight asymmetry. Mineral pigment
> texture visible in the color fills, with slightly uneven coverage and
> hint of brush stroke direction.
>
> DO NOT include: any text, Chinese or Korean characters, any signatures
> or seals, watermarks, modern color gradations, photographic realism,
> Western painting techniques (no shadows, no perspective, no gradients),
> any frame borders around the artwork, white margins, transparent areas,
> AI watermarks.
>
> Aspect ratio: 1:3.4 portrait. Solid painted panel — the entire canvas is
> the painting itself.

---

### 5.4 `byeongpung_joseon_tiger.png` — 조선 호랑이

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 호랑이 (Tiger) — 용기, 보호. 조선 민화의 대표인 까치호랑이/호작도 풍

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition. Vertical
> portrait composition, aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber grain,
> slightly mottled, century-aged texture. No frame, edge-to-edge.
>
> Foreground: a single Korean folk-style tiger (호작도 tradition — magpie
> and tiger painting) standing in three-quarter view, body curving
> diagonally up the panel from lower-right to upper-left. The tiger has a
> distinctly cartoonish folk-art face — wide round eyes, a slightly
> bewildered or comically dignified expression, exaggerated whiskers,
> stylized fangs visible. The body is rendered with: bold black ink
> outlines (stroke 2–5 pixels, varied), warm yellow-orange fur fill
> #D4A82E with bold ink stripes #2C2416 in the characteristic minhwa
> pattern (alternating thick and thin), white belly highlight, red mouth
> #C5302A with small visible tongue. Body proportions are intentionally
> slightly off — bigger head, shorter legs, characteristic of Joseon folk
> tigers (NOT realistic anatomy). The tiger sits on a stylized rocky
> outcrop with minimal ink wash. In the upper-left third of the panel,
> two small black-and-white magpies (까치) perched on a stylized pine
> branch, painted in flat ink with minimal color, looking down at the
> tiger — they are the "wise messengers" looking at the "powerful but
> foolish" tiger, classic 호작도 narrative.
>
> Style: late Joseon 민화 호작도 — bold lines, flat saturated mineral
> pigments, no perspective, no shadows, deliberate naive proportions,
> slight humor in tiger's expression. Mineral pigment unevenness visible
> in fills.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, modern realism, photographic detail, Western perspective,
> shadows, gradients, frame borders, white margins, transparent areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.5 `byeongpung_joseon_sun.png` — 조선 해

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 해 (Sun) — 새 시작. 조선 민화의 일월오봉도 일부 또는 단독 해

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition. Vertical
> portrait composition, aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber grain.
> Edge to edge.
>
> Foreground: a stylized sun motif inspired by 일월오봉도 (Five-Peaks-Sun
> -and-Moon Painting) but isolated to just the sun. In the upper-third
> area of the panel, a large round red sun #C5302A occupies about 40% of
> the panel width, drawn with a bold black ink outline (stroke 3–5
> pixels). The sun is filled with flat vermilion red, with very subtle
> mineral pigment unevenness. Below and around the sun, stylized clouds
> in flat #D4A82E gold/yellow with bold ink outlines, drawn in
> characteristic minhwa cloud-scroll patterns (영지 / 여의 cloud forms —
> each cloud is a distinctive curling/spiraling shape, stylized like
> traditional Korean architectural cloud motifs). The cloud band wraps
> across the middle of the panel. In the lower-third, three small
> stylized mountain peaks #1B4F8C (deep indigo) with bold ink outlines,
> arranged in a row — their tops just below the cloud band. Below the
> mountains, stylized waves in indigo and white at the panel base,
> abstracted into the characteristic 영조 wave-pattern of Joseon folk art.
>
> Style: late Joseon 민화 일월도 tradition — flat color blocks, bold
> outlines, hierarchical cosmic composition (sun > clouds > mountains >
> water), no realism, naive symbolism. Mineral pigment texture visible.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, photographic realism, gradients, glow, halos, lens flare,
> shadows, modern art styles, frame borders, white margins, transparent
> areas, the moon (this panel is sun-only).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.6 `byeongpung_silla_crane.png` — 신라 학/봉황

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기, 사신수 + 금장식 톤
- **모티프**: 학(Crane) → 신라식으로는 봉황/길조 새

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the Unified
> Silla period (7th–9th century) court art tradition with goldsmithing
> ornamental motifs. Vertical portrait composition, aspect ratio 1:3.4,
> output at 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with very faint silk weave
> texture, slightly aged, edge to edge.
>
> Foreground: a single auspicious bird inspired by Silla ornamental
> phoenix/crane imagery (봉황 / 학 fused into Silla style). The bird is
> rendered with the geometric symmetry and decorative elaboration
> characteristic of Silla goldsmithing ornament — like a figure on a
> Silla gold crown or a roof-tile end-cap (와당). The crane's body is
> centered, head turned in profile to the right, neck arched gracefully.
> The body is filled with rich gold #D4A840 / #E0B844 with delicate
> patterned interior detail (small repeating geometric scale patterns
> like Silla ornament). Wings are extended ornamentally to either side,
> each wing painted as stylized layered feathers in gold and ivory
> #E8E8E8 with deep blue #1B4F8C tips, bold ink outlines. Tail feathers
> trail downward in elegant curls in alternating gold and vermilion
> #C5302A. Eyes are small and refined, with a tiny ink dot. Around the
> bird, decorative ornament — small repeating cloud-and-flame motifs in
> deep blue and gold, arranged symmetrically left-and-right. At the panel
> base, a stylized Silla pedestal or rocky outcrop in deep blue and ivory
> with fine ink lines.
>
> Style: Unified Silla court ornamentation — refined symmetrical
> composition, geometric decorative borders, gold-leaf accents, fine
> hairline detail mixed with bold motif silhouette. NOT folk painting,
> NOT Joseon — distinctly Silla refinement.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, modern realism, photographic detail, modern gradients, glow
> effects, frame borders, white margins, transparent areas, Joseon-style
> bold naive linework, peony flowers (this panel is crane only).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.7 `byeongpung_silla_mountain.png` — 신라 토함산/산

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기
- **모티프**: 산 (Mountain) → 신라의 영험한 산 (토함산/남산), 사신수 백호 활동지

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the Unified
> Silla period (7th–9th century) court tradition with sacred mountain
> imagery. Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture, edge to edge.
>
> Foreground: stylized stacked sacred mountains inspired by Silla
> Buddhist landscape and the spiritual peaks of Gyeongju (Toham-san,
> Nam-san). Three to four overlapping mountain ranges arranged
> vertically — closer mountains at the bottom of the panel in deeper
> tones, distant peaks at the top in lighter tones. Mountains are
> rendered with: bold black ink outlines (stroke 2–4 pixels), filled
> with deep blue #1B4F8C / #3D9BE8 (closer ranges) and lighter ivory
> #C8C8C8 (distant peaks), with refined gold #D4A840 accent strokes
> highlighting ridge lines (suggesting sun catching the mountain
> tops — a refined Silla touch). On the lower-mid mountain range, a
> small stylized stone pagoda (석탑) in ivory with ink detail (3 tiers,
> classic Silla pagoda silhouette). Near the peak of the topmost
> mountain, a small white cloud band in pure ivory with delicate ink
> outline. At the panel base, a stylized stream/water in deep blue with
> Silla-style geometric wave pattern, with small refined gold accents.
>
> Style: Unified Silla court refinement — symmetrical, hieratic,
> geometric, gold-accented. Mountains have decorative regularity (NOT
> the wild expressive mountains of Joseon 산수화). Refined linework
> mixed with bold mountain silhouettes.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, photographic realism, atmospheric haze, modern gradients,
> glow, lens flare, frame borders, white margins, transparent areas,
> Joseon-style ink-wash mountains, water reflections.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.8 `byeongpung_silla_lotus.png` — 신라 보상화/연꽃

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기
- **모티프**: 연꽃 (Lotus) → 신라식 보상화(寶相華) — 연꽃을 모티프로 한 장식적 변형

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the Unified
> Silla period (7th–9th century) court ornamental tradition, featuring
> 보상화 (boasanghwa — the Silla decorative variation of the lotus).
> Vertical portrait composition, aspect ratio 1:3.4, output at 600×2040
> pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture, edge to edge.
>
> Foreground: a large symmetrical 보상화 (Silla decorative lotus) motif
> centered on the panel, occupying about 70% of panel height. The
> motif is a stylized lotus rosette — perfectly bilaterally symmetrical,
> with multiple tiers of layered petals radiating from a central core.
> The petals are organized in three concentric rings: inner small petals
> in vermilion #C5302A, middle ring of larger petals in gold #D4A840 /
> #E0B844, outer ring of long pointed petals in deep blue #1B4F8C. Each
> petal has a bold black ink outline (stroke 2–3 pixels) with delicate
> internal vein detail in fine ink lines. The center of the rosette is a
> small ivory #E8E8E8 disc with tiny gold dots arranged in geometric
> pattern. Around the rosette, four small repeating ornamental scrolls
> in deep blue and gold extend at the cardinal points (top, bottom,
> left, right of the rosette). Above and below the central rosette,
> stylized cloud-and-flame motifs (운기문) in gold and blue
> arranged symmetrically. The entire composition has the refined
> hierarchical regularity of Silla architectural ornament — like a
> ceiling medallion or a roof-tile face.
>
> Style: Unified Silla decorative ornament — strict bilateral symmetry,
> geometric refinement, gold-leaf accents, fine repeating patterns.
> Looks like it could be carved on a temple ceiling or tile.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, naive folk-art looseness (this is highly refined),
> photographic realism, modern gradients, glow effects, frame borders,
> white margins, transparent areas, asymmetrical composition, Joseon-style
> loose brushwork.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.9 `byeongpung_goryeo_wave.png` — 고려 청자 음각 물결

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 청자상감 + 불화
- **모티프**: 물결 (Wave) → 고려청자의 음각 물결 패턴 + 흐름

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the Goryeo
> dynasty (10th–14th century) tradition, evoking the incised wave motifs
> of Goryeo celadon ceramics (청자상감). Vertical portrait composition,
> aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with very faint translucent
> incision-like texture, suggesting glazed celadon surface. Edge to edge.
>
> Foreground: stacked horizontal bands of stylized waves filling the
> entire panel, vertically. The waves are rendered as the characteristic
> rhythmic wave-curl pattern seen on Goryeo celadon — each wave is a
> rounded crest with a small recursive curl on its top, like the
> signature 파도무늬 of Korean ceramic incision. The waves are drawn with:
> fine refined ink lines (stroke 1.5–2.5 pixels, more delicate than
> Joseon), filled with celadon green tones #3A7D6A / #5A9A6A in flat
> areas with subtle tonal variation between bands. Every third or fourth
> band has small inlaid white cranes or fish silhouettes #FAFAF0 set into
> the wave (a nod to 청자상감 inlaid technique — small ivory shapes
> embedded in the green). Subtle gold #C8A030 accent lines highlight
> wave crests sparingly. The composition has rhythmic repetition with
> slight variation per band — not mechanical, but contemplative.
>
> Style: Goryeo Buddhist refinement + celadon ceramic aesthetic — muted
> palette, subtle gradations, refined linework, contemplative
> repetition. NOT bold like Joseon, NOT geometric-symmetrical like Silla.
> Distinctly Goryeo's quiet elegance.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, photographic realism, modern gradients, glow, frame
> borders, white margins, transparent areas, vibrant saturated colors
> (Goryeo palette is muted), Joseon-style folk crudeness, Silla-style
> rigid symmetry. The waves should feel like flowing water frozen in
> celadon glaze.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.10 `byeongpung_goryeo_chaekgeori.png` — 고려 팔만대장경/경판

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기
- **모티프**: 책가도 (Chaekgeori) → 고려식으로는 팔만대장경 경판/불경 두루마리

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the Goryeo
> dynasty (10th–14th century) Buddhist tradition, featuring stacked
> wooden printing blocks (경판) and Buddhist scrolls reminiscent of the
> Tripitaka Koreana (팔만대장경). Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with faint texture, edge to
> edge.
>
> Foreground: a vertical arrangement of Buddhist scholarly objects
> stacked from bottom to top, each layer slightly offset for visual
> rhythm. From bottom: (1) a stack of three or four wooden printing
> blocks (Tripitaka 경판) lying horizontally, rendered in muted brown
> #6B5530 with refined ink-line carved-text indication (very abstracted,
> just suggested as horizontal striations, NOT actual readable text),
> ends bound in dark wood; (2) above the blocks, a closed scroll
> wrapped in ivory silk #FAFAF0 with refined celadon green ribbon ties;
> (3) a partially unrolled scroll showing implied columns of Buddhist
> imagery (very abstracted vertical lines suggesting text — NOT actual
> characters, just rhythmic marks), with celadon ribbons trailing; (4)
> at the very top, a small Buddhist altar bell (범종) or incense burner
> (향로) in muted bronze #C8A030 with delicate Goryeo-style relief
> patterns. Each item has subtle drop-shadow-free ink outlines. Slight
> gradations within each color suggest the soft light of a temple
> interior. Around the stacked items, very subtle celadon cloud motifs
> in lighter green tone.
>
> Style: Goryeo Buddhist scholarly aesthetic — quiet, contemplative,
> muted celadon-and-gold palette, refined linework. NOT the colorful
> packed bookshelves of Joseon 책가도. This is monastic study, not
> aristocratic display.
>
> DO NOT include: any text, Chinese/Korean characters, actual readable
> sutras, signatures, seals, watermarks, photographic realism, modern
> gradients, glow, frame borders, white margins, transparent areas,
> Joseon-style bright colors, Western perspective.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 5.11 `bucket_peony.png` — 모란 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/peony.png`
- **컨셉**: 조선 민화 모란 — "부귀, 만개, 청춘". 카페/패션/뷰티 버킷에 매칭

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting peony flowers
> (모란). Output at 1024×1024 pixels, 1:1 square aspect ratio.
>
> Background fills the entire canvas: warm hanji paper #FDFAF3 with very
> subtle horizontal mulberry fiber grain texture, slightly mottled,
> aged. No frame, edge to edge.
>
> Foreground: a flourishing peony plant centered in the canvas, occupying
> about 75% of the canvas. Five large open peony blossoms arranged in a
> triangular bouquet composition — two large blossoms in the upper third,
> two in the middle, one in the lower-middle. Each blossom rendered with
> bold uneven black ink outlines (stroke 2–4 pixels), bright vermilion
> #C5302A petals filled in flat color, deep yellow #D4A82E pistil
> centers. Eight to ten lush green leaves #3A7D6A surrounding the
> blossoms, with bold dark green ink outlines and lighter green fill.
> Stems and branches in dark ink #2C2416 weave naturally between the
> blossoms. Subtle additional details: one small folk-style butterfly
> in dark ink with vermilion accent fluttering near the upper-right
> blossom; small dewdrop highlights on petals (just tiny ivory dots).
> The composition is centered and self-contained — could work as a
> standalone art piece.
>
> Style: Joseon 화조도 folk tradition — flat saturated mineral pigments,
> bold lines, no perspective, naive charm, slight asymmetry.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, modern gradients, photographic realism, Western
> perspective, shadows, frame borders, white margins beyond the
> hanji background, transparent areas.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

### 5.12 `bucket_lotus.png` — 연꽃 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/lotus.png`
- **컨셉**: 조선 민화 연꽃 — "정화, 재생, 평정". 셀프케어/저널링/학습 버킷

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting lotus flowers
> (연꽃). Output at 1024×1024 pixels, 1:1 square aspect ratio.
>
> Background: warm hanji paper #FDFAF3 with subtle horizontal grain.
> Edge to edge.
>
> Foreground: a serene lotus pond scene centered on the canvas. Three
> large open lotus blossoms emerge from a calm pond surface — one large
> blossom in the upper third (fully open, facing slight three-quarter),
> one in the middle (in profile), one in the lower-middle (just
> opening). Each blossom rendered with bold black ink outlines, soft
> pink-rose petals #E89B9B filled flat with subtle deeper rose
> #C5708F at petal tips, golden yellow #D4A82E central seed-pod with
> small ink-dotted stamens. Three large round lotus leaves #3A7D6A in
> flat green with bold ink outlines and visible radial vein lines float
> between the blossoms, with edges slightly curling upward. Tall stems
> and stalks #5A9A6A rise vertically connecting blossoms and leaves.
> At the pond surface (lower 15% of canvas), stylized water ripples in
> deep blue #1B4F8C with bold ink lines in characteristic minhwa wave
> pattern. One small black-and-white folk-style fish or duck silhouette
> at the water level for narrative interest (very small, stylized).
>
> Style: Joseon 화조도 folk tradition — flat saturated mineral
> pigments, bold lines, no perspective, naive serenity. The lotus is
> a Buddhist purity symbol — composition feels calm and balanced.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, modern gradients, photographic realism, frame borders,
> white margins beyond the hanji ground, transparent areas, Western
> shadows or perspective.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

## 6. 정진우 담당 프롬프트 (12장)

---

### 6.1 `adaptive-icon.png` — 안드로이드 적응형 아이콘 전경

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/images/adaptive-icon.png`
- **컨셉**: icon.png과 동일한 도장 로고. 단, 안쪽 432×432 안전 영역에만 그래픽이 들어가야 안드로이드가 잘라도 K가 살아남음.

#### 프롬프트

> Square Korean traditional ink-stamp seal artwork at 1024×1024 pixels.
> The seal is a solid vermilion red square (#C5302A — Korean dancheong
> red) with subtle aged texture, micro-cracks at edges, slight ink
> density variation. CRITICAL CONSTRAINT: the entire seal artwork —
> including the background red square AND the centered K letter AND
> the inset border frame — MUST fit within the central 432×432-pixel
> safe zone of the canvas (a centered square that occupies the middle
> ~42% of the 1024 canvas). The outer 296 pixels on each side of the
> canvas are PURE TRANSPARENT (no graphics, no color), so the Android
> OS can crop the icon into circles, squircles, or other shapes
> without truncating the K.
>
> Inside the 432×432 safe zone:
> - Solid vermilion red #C5302A fills the entire safe zone area.
> - Centered white letter "K" in Korean ancient seal-script style
>   (전서체) — angular, geometric, balanced strokes. The K's vertical
>   line is thick (about 12% of safe zone width), upper diagonal
>   angles down-right at 35°, lower diagonal mirrors. White color
>   pure #FFFFFF. K occupies about 55% of safe zone height,
>   horizontally and vertically centered within safe zone.
> - Thin white border frame, 6px thick, sits 25px inside the safe
>   zone edge — slightly broken at irregular spots.
>
> Outside the 432×432 safe zone, the canvas is FULLY TRANSPARENT
> (alpha = 0). NO bleed of red, no shadow, no glow extends beyond
> safe zone.
>
> Style: matches the icon.png exactly. Hand-stamped, ancient,
> dignified. Flat color rendering — no gradients, no glow, no drop
> shadow, no embossing.
>
> DO NOT include: any text other than the centered K, any Hangul or
> Chinese characters, photographic elements, modern design effects,
> watermarks, signatures, any graphics extending outside the
> 432×432 safe zone, opaque background outside the safe zone (the
> outer area must be transparent).
>
> Aspect ratio: 1:1 square. Output: 1024×1024 PNG with transparent
> outer area, opaque red square in the center 432×432 safe zone.

#### ⚠️ 주의사항

- Gemini는 transparent PNG를 직접 만들기 어려워할 수 있습니다. 결과가 흰색 또는 다른 색 배경으로 나오면, 그 결과를 기반으로 후처리(Photoshop/Pixelmator)로 외곽을 transparent 처리하거나, 처음부터 "외곽은 흰색 #FFFFFF로 채우고 중앙에 432×432 빨간 도장" 식으로 받아서 후처리하는 게 빠를 수 있음.
- 만약 Gemini가 transparent 영역을 거부하면: 외곽을 한지색 #FDFAF3으로 채우고, 후처리에서 한지색 → 투명 변환.

---

### 6.2 `notification-icon.png` — 안드로이드 알림 아이콘

- **출력**: 96 × 96 PNG (생성 시 512×512로 받고 리사이즈 권장)
- **저장 경로**: `assets/images/notification-icon.png`
- **제약**: 안드로이드는 다른 색이 있으면 흰색으로 강제 변환 → **흰색 실루엣 + 투명 배경** 필수

#### 프롬프트

> A single white silhouette icon at 512×512 pixels for an Android
> notification status bar. The icon must be PURE WHITE #FFFFFF on a
> FULLY TRANSPARENT background — no other colors are permitted, only
> white pixels and transparent pixels.
>
> The silhouette depicts a stylized Korean traditional ink-stamp seal
> (도장 / 印): a solid white square outline with a centered white
> letter "K" inside, where the K is rendered in Korean ancient
> seal-script style (전서체) — angular, geometric, simplified for
> tiny rendering. The square outline is approximately 8% of canvas
> width thick. The K inside is solid white, occupying about 50% of
> the square's interior height. Everything OUTSIDE the square outline
> AND between the square outline and the K is transparent.
>
> Composition: the white seal silhouette occupies the central 80% of
> the 512×512 canvas, with even transparent margin on all sides. The
> design must remain legible when scaled down to 24×24 pixels (the
> actual notification rendering size).
>
> Pure 2-color (white + transparent) — NO grayscale anti-aliasing
> values, NO partial-alpha pixels, NO smooth gradients. Hard
> binary edges. Think of it as an icon that will be displayed at 24px
> on a colored Android status bar.
>
> DO NOT include: any color other than white, any opaque background,
> any Hangul or Chinese characters, photographic elements, gradients,
> shadows, glow, embossing, drop shadow, multiple shades of gray, anti
> aliased soft edges (binary alpha only).
>
> Aspect ratio: 1:1 square. Output: PNG with transparent background,
> only white pixels. Designed to scale clearly down to 24×24 px.

#### ⚠️ 주의사항

- Gemini가 binary alpha (이진 투명도)를 잘 못 만들면, 생성 후 이미지 에디터에서 "Color Range" 또는 "Magic Wand"로 흰색 외 영역 모두 transparent 변환. 흰색 픽셀에 anti-aliasing이 살짝 있어도 OK (안드로이드가 처리함).
- 결과를 96×96으로 리사이즈하기 전 24×24로 임시 축소해서 식별 가능한지 검수.

---

### 6.3 `byeongpung_joseon_crane.png` — 조선 학

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 학 (Crane) — 장수, 평화. 조선 민화의 송학도(松鶴圖) 풍

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition.
> Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber
> grain. Edge to edge.
>
> Foreground: a Korean folk-style 송학도 (pine and crane painting). On
> the right side of the panel, a tall stylized pine tree (소나무)
> rises vertically from the lower-third upward to the top, with
> characteristically gnarled trunk in dark ink #2C2416 and irregular
> branches. Pine needles are rendered as bold radial green tufts
> #3A7D6A with bold ink outlines, in the simplified minhwa style.
> Standing in the lower-third on a stylized rock, one large white
> crane (학) — body in profile facing left, neck arched gracefully
> upward, one leg lifted in classic crane posture. Crane body is
> ivory white #FAFAF0 with bold black ink outlines (stroke 2–4
> pixels), distinctive black tail feathers, deep red #C5302A crown
> patch on top of head, long black legs and beak. The crane's eye
> is a small black ink dot. A second smaller crane in flight in the
> upper-left third, simplified silhouette. At the panel base,
> stylized rocks in deep blue #1B4F8C with bold ink outlines, and a
> small patch of stylized 영지 (sacred mushroom — symbol of longevity)
> in red and gold near the rocks.
>
> Style: late Joseon 민화 송학도 — bold lines, flat saturated mineral
> pigments, no perspective, naive charm. The crane stands with the
> serene dignity of folk-painted longevity symbols.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, photographic realism, modern gradients, frame borders,
> white margins, transparent areas, Western shadows.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.4 `byeongpung_joseon_mountain.png` — 조선 산수화

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 산 (Mountain) — 조선 민화의 산수화/일월오봉도 풍

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition,
> featuring stylized mountains in the popular folk landscape style.
> Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber
> grain. Edge to edge.
>
> Foreground: stacked stylized mountain peaks filling the panel
> vertically, in the playful folk-style (NOT the refined court style).
> Five distinct mountain peaks arranged in overlapping ranges from
> bottom to top — each peak rendered with bold black ink outlines
> (stroke 3–5 pixels), filled with flat colors: vermilion #C5302A on
> two prominent peaks, deep blue #1B4F8C on two peaks, and one
> central peak in jade green #3A7D6A. The peaks have a slightly
> exaggerated, almost cartoonish triangular silhouette typical of
> Joseon folk landscapes. White cloud bands #FAFAF0 wrap between the
> mountain ranges in stylized cloud-scroll patterns with bold ink
> outlines. At the lower-third, a winding path through pine trees
> (small dark ink with green tufts), and a tiny folk-style traveler
> figure walking on the path (very small, just suggested, ink-only
> stick figure with hat). Sun in the upper-third as small red disc.
> At the panel base, water with characteristic minhwa wave-pattern
> in indigo and white.
>
> Style: late Joseon 민화 mountain landscape — flat saturated colors,
> bold cartoon-like outlines, hierarchical composition (far peaks at
> top, near peaks and traveler at bottom), naive charm.
>
> DO NOT include: any text, Chinese/Korean characters, signatures, seals,
> watermarks, photographic realism, atmospheric haze, modern gradients,
> Western perspective, frame borders, white margins, transparent
> areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.5 `byeongpung_joseon_chaekgeori.png` — 조선 책가도

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 책가도 (Chaekgeori) — 조선 후기 학문/호기심 상징의 정수

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition,
> featuring 책가도 (chaekgeori — scholar's bookshelf still life).
> Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber
> grain. Edge to edge.
>
> Foreground: a stylized vertical bookshelf (책가) divided into four
> open compartments stacked vertically (top to bottom). Each
> compartment frame is rendered in dark ink #2C2416 with bold
> outlines (stroke 3–5 pixels), in the characteristic minhwa
> "isometric folk perspective" — sides slightly visible but flattened,
> not realistic perspective. Inside each compartment, a folk
> assemblage of scholarly objects:
> - **Top shelf**: a stack of three thread-bound Korean books (책)
>   with vermilion #C5302A and indigo #1B4F8C covers and ivory
>   pages, plus a brush-holder (필통) with two brushes.
> - **Second shelf**: a porcelain vase #FAFAF0 with bold ink
>   outline holding three peony blossoms in vermilion and gold,
>   alongside a small folded fan with painted detail.
> - **Third shelf**: three more book stacks with colorful covers
>   (yellow #D4A82E, green #3A7D6A, red), an ink stone (벼루) in
>   dark ink, and a small stack of letters tied with red string.
> - **Bottom shelf**: a large blue-and-white porcelain jar #1B4F8C
>   on white #FAFAF0 with stylized cloud patterns, a brass
>   incense burner #D4A82E with delicate detail, and a single ripe
>   peach (수복도 longevity symbol) in pink and green.
>
> All objects rendered with bold ink outlines and flat saturated
> mineral pigment fills, in the characteristic minhwa stacked-still-life
> style. The composition is densely packed but each object readable.
>
> Style: late Joseon 민화 책가도 — flat folk perspective, bold lines,
> bright saturated colors, dense playful arrangement, scholarly pride
> meets folk art.
>
> DO NOT include: any text, Chinese/Korean characters on book covers
> or letters (just abstracted color), signatures, seals, watermarks,
> photographic realism, Western single-point perspective, modern
> gradients, frame borders outside the bookshelf, white margins,
> transparent areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.6 `byeongpung_silla_tiger.png` — 신라 백호 (사신수)

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기, 사신수
- **모티프**: 호랑이 → 신라 사신수의 백호 (white tiger, 서방 수호)

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Unified Silla period (7th–9th century) tradition, featuring the
> White Tiger of the Four Symbols (백호 / Baekho — Western Guardian
> of the 사신수). Vertical portrait composition, aspect ratio 1:3.4,
> output at 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture. Edge to edge.
>
> Foreground: a fierce, stylized white tiger in the dynamic motion
> typical of Silla Four-Symbols guardian imagery — body twisted in
> profile, head turned forward to face the viewer, mouth open in a
> roar revealing fangs, claws extended. The tiger's body fills the
> central 70% of the panel vertically. Body is ivory white #FAFAF0
> with refined ink stripes #2C2416 (much finer and more decorative
> than Joseon — the Silla baekho is geometric and ornamental, not
> folk). Stripes have a regular flowing pattern. Eyes are vivid green
> #3A7D6A or amber #D4A840 with black pupils. Mouth and tongue in
> deep vermilion #C5302A. Around the tiger, swirling cloud-and-flame
> motifs (운기문) in deep blue #1B4F8C and gold #D4A840 — the tiger
> emerges from these stylized energy clouds, suggesting its
> supernatural guardian power. Small gold stars or constellation
> dots in the upper-third (the white tiger represents the western
> autumn sky in Sino-Korean cosmology). At the panel base, a
> stylized mountain ridge in deep blue and ivory in geometric form.
>
> Style: Unified Silla Four-Symbols tradition — refined geometric
> ornament, dynamic motion, gold-leaf accents, supernatural energy.
> The tiger is a dignified guardian deity, NOT a folk-cartoon animal.
> Hieratic, balanced, ornamental.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Joseon-style folk
> cartoon proportions, naive humor, modern gradients, glow halo,
> frame borders, white margins, transparent areas, magpies (this is
> Silla, not Joseon 호작도).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.7 `byeongpung_silla_sun.png` — 신라 일월 (금관 장식)

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기
- **모티프**: 해 (Sun) → 신라 금관/장식의 태양 모티프

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Unified Silla period (7th–9th century) tradition, featuring an
> ornamental sun motif inspired by Silla gold crown decorations
> (금관) and royal regalia. Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture. Edge to edge.
>
> Foreground: a large, perfectly symmetrical sun emblem centered in
> the upper-third of the panel. The sun is a deep vermilion #C5302A
> central disc occupying about 40% of panel width, with bold gold
> #D4A840 / #E0B844 ornamental rays radiating outward in a precise
> geometric starburst pattern — 12 main rays of varied length, each
> ending in a stylized flame-curl or comma-shaped curl
> characteristic of Silla goldsmithing (suggesting both sun rays
> and the curling forms on Silla crowns). Within the central red
> disc, fine ink filigree pattern of geometric diamonds and dots in
> the manner of Silla gold-leaf engraving. Below the sun, suspended
> ornamental dangles (drooping curl-and-disc forms in gold) like the
> dangles on a Silla gold crown — three vertical chains of small gold
> discs and curls extending downward into the middle of the panel,
> arranged symmetrically. At the panel base, two facing 사신수
> guardians in miniature (left: small blue dragon silhouette,
> right: small red phoenix silhouette) — abstract stylized profile
> shapes flanking a central altar suggested by simple gold and ivory
> geometric forms.
>
> Style: Unified Silla regal ornamentation — strict bilateral
> symmetry, gold-leaf opulence, geometric refinement, hieratic
> composition. Looks like it could be the face of a royal tomb
> ornament.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, naturalistic sun rays,
> modern gradients, glow halos, lens flare, frame borders, white
> margins, transparent areas, Joseon-style flat folk sun, the moon
> (sun-only this panel).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.8 `byeongpung_silla_wave.png` — 신라 청룡 (사신수) 물결

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기, 사신수
- **모티프**: 물결 → 신라 청룡 (Blue Dragon, 동방 수호) 위에 흐르는 물결

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Unified Silla period (7th–9th century) tradition, featuring the
> Blue Dragon of the Four Symbols (청룡 / Cheongnyong — Eastern
> Guardian of the 사신수) amid swirling water motifs. Vertical
> portrait composition, aspect ratio 1:3.4, output at 600×2040
> pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture. Edge to edge.
>
> Foreground: a long sinuous Silla-style dragon (청룡) coiling
> vertically through the panel, body weaving from lower-right
> upward to upper-left, then back to right, then up — three coils
> visible. The dragon's body is rendered in deep blue #1B4F8C /
> #3D9BE8 with refined ornamental scales (each scale outlined in
> ink, with subtle gold #D4A840 highlights), four short legs with
> claws, mane in flowing gold flame-curls along the back, whiskers
> trailing from mouth. The dragon's head emerges in the upper-third,
> roaring sideways, eyes in vivid green #3A7D6A. Around the dragon's
> body, swirling water and cloud-flame motifs (운기문) in lighter
> blue and gold — these abstract spirals fill the spaces between
> the dragon's coils, creating a sense of the dragon emerging from
> primordial waters. At the panel base, geometric Silla wave
> patterns (wave forms more rigid and ornamental than Joseon) in
> deep blue and ivory. Small gold cosmic dots in the upper area
> (eastern springtime sky).
>
> Style: Unified Silla Four-Symbols guardian — refined geometric
> ornament, dynamic motion, gold-leaf accents, supernatural
> energy. Hieratic and ornamental, NOT folk-cartoon.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Joseon-style folk
> cartoon, modern gradients, glow, frame borders, white margins,
> transparent areas, water reflections, Western dragon (this is a
> Korean ornamental sky-dragon, not a Western fire-breathing
> dragon).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.9 `byeongpung_goryeo_peony.png` — 고려 청자상감 모란

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 청자상감
- **모티프**: 모란 → 고려청자 상감의 모란문 (귀족 미감)

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) tradition, evoking the inlaid
> peony motifs of Goryeo celadon ceramics (청자상감 모란문).
> Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with very faint
> translucent texture suggesting glazed celadon surface, edge to
> edge.
>
> Foreground: a refined, contemplative composition of stylized
> peony blossoms and leaves in the manner of Goryeo celadon
> 상감 (inlay) — where designs are carved into the celadon and
> filled with white or black slip before glazing. Three peony
> blossoms arranged vertically (top, middle, lower-middle), each
> rendered as a refined silhouette with white #FAFAF0 inlay petals
> outlined in dark ink #2C2416, central pistils in soft gold
> #C8A030. Between the blossoms, elegant curling stems and leaves
> rendered as fine ink-outlined silhouettes filled with deeper
> celadon green #3A7D6A. The composition has a calm, balanced
> rhythm with deliberate negative space — much more restrained than
> Joseon's lush busyness. Decorative scrolling vine borders
> running vertically along the left and right edges (subtle, just
> suggesting a celadon vase's surface decoration). The overall
> palette is muted and aristocratic: celadon greens, ivory whites,
> soft gold accents, with sparing touches of pale rose #E89B9B in
> petal tips.
>
> Style: Goryeo celadon inlay aesthetic — muted contemplative
> palette, refined linework, deliberate negative space, aristocratic
> elegance. NOT the bold flat folk peonies of Joseon. This peony
> belongs on a 12th-century ceremonial celadon vessel.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Joseon-style bold folk
> outlines, vibrant Joseon vermilion, modern gradients, frame
> borders, white margins, transparent areas, Western perspective,
> shadows.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.10 `byeongpung_goryeo_lotus.png` — 고려 불화 연화좌

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 불화
- **모티프**: 연꽃 → 고려 불화의 연화좌 (lotus throne, 정토 / 깨달음)

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) Buddhist painting (불화)
> tradition, featuring a lotus throne (연화좌) and lotus blossoms.
> Vertical portrait composition, aspect ratio 1:3.4, output at
> 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with subtle texture, edge
> to edge.
>
> Foreground: a serene composition centered on a large stylized
> lotus throne in the lower-third of the panel — a multi-tiered
> open lotus with layered petals radiating outward, rendered with
> refined ink linework (stroke 1.5–2.5 pixels, much finer than
> Joseon) and filled with soft pink-rose #E89B9B graduating to
> ivory #FAFAF0 at petal tips, with subtle gold #C8A030 vein
> highlights. The throne's central core is a small ivory disc with
> golden filigree dots. Above the throne, three rising lotus
> stalks in muted celadon green #5A9A6A, each bearing a closed
> bud or partially-opened blossom — buds in soft pink, leaves in
> celadon green with refined ink veins. In the upper third, a
> stylized Buddhist halo or 광배 — two concentric circles in soft
> gold filigree pattern (very abstract, just suggesting the
> presence of a Buddha or Bodhisattva, but NOT actually depicting
> any figure). Around the throne and stalks, soft cloud motifs in
> lighter celadon green and ivory, very subtle. The overall feel is
> contemplative, sacred, restrained — unlike the festive folk
> lotus of Joseon.
>
> Style: Goryeo Buddhist painting (불화) refinement — muted palette,
> refined linework, contemplative stillness, sacred symbolism. The
> empty space matters as much as the painted forms.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, actual Buddha figures (just the empty throne
> and halo), photographic realism, Joseon-style bold folk lotus,
> vibrant saturated colors, modern gradients, glow effects, frame
> borders, white margins, transparent areas, water at the base
> (this is a sacred throne in a celadon void, not a pond).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 6.11 `bucket_tiger.png` — 호랑이 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/tiger.png`
- **컨셉**: 조선 민화 호작도 — "용기, 보호, 대담". 모험/익스트림/하이킹 버킷

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting a 호작도
> (magpie-and-tiger). Output at 1024×1024 pixels, 1:1 square aspect
> ratio.
>
> Background: warm hanji paper #FDFAF3 with subtle horizontal grain.
> Edge to edge.
>
> Foreground: a single Korean folk-style tiger centered in the canvas,
> in three-quarter view, body and head facing the viewer. The tiger
> has the characteristically charming, slightly bewildered minhwa
> expression — wide round eyes, exaggerated whiskers, comically
> dignified frown, fangs slightly showing. Body rendered with bold
> uneven black ink outlines (stroke 2–4 pixels), warm yellow-orange
> fur fill #D4A82E with bold ink stripes #2C2416 in alternating thick
> -thin pattern, white belly highlight, red tongue and mouth #C5302A.
> Body proportions intentionally stylized — bigger head, shorter
> legs. The tiger sits on a stylized rocky outcrop with minimal ink
> wash. In the upper-right corner, a small black-and-white magpie
> (까치) perched on a stylized pine branch, looking down at the
> tiger — a classic 호작도 narrative pairing. Behind the tiger,
> small green pine needles tufts in flat #3A7D6A with bold outlines.
>
> Style: late Joseon 민화 호작도 — flat saturated mineral pigments,
> bold lines, no perspective, naive charm with subtle humor. The
> tiger is mighty but the magpie carries the wisdom — a classic
> folk subversion.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, modern gradients, photographic realism, frame
> borders, white margins beyond the hanji ground, transparent areas,
> realistic tiger anatomy.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

### 6.12 `bucket_chaekgeori.png` — 책가도 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/chaekgeori.png`
- **컨셉**: 조선 민화 책가도 — "학문, 호기심, 공부". 책/수업/언어 버킷

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting 책가도
> (chaekgeori — scholar's bookshelf still life). Output at 1024×1024
> pixels, 1:1 square aspect ratio.
>
> Background: warm hanji paper #FDFAF3 with subtle horizontal grain.
> Edge to edge.
>
> Foreground: a stylized bookshelf with four open compartments
> arranged in a 2×2 grid, occupying about 80% of the canvas. Each
> compartment frame is rendered in dark ink #2C2416 with bold
> outlines (stroke 3–5 pixels), in the characteristic minhwa
> "isometric folk perspective" — slightly tilted, sides barely
> visible, deliberately flattened. Inside each compartment:
> - **Top-left**: stack of three thread-bound Korean books with
>   vermilion #C5302A, indigo #1B4F8C, and yellow #D4A82E covers,
>   plus a brush-holder with two brushes.
> - **Top-right**: a porcelain vase #FAFAF0 with stylized blue cloud
>   patterns holding three peony blossoms in vermilion and gold.
> - **Bottom-left**: an ink stone (벼루) in dark ink, a small stack
>   of letters tied with red string, and a folded fan with painted
>   detail.
> - **Bottom-right**: a brass incense burner #D4A82E with delicate
>   relief detail, and a single ripe peach (수복도 longevity symbol)
>   in pink and green leaves.
>
> All objects rendered with bold ink outlines and flat saturated
> mineral pigment fills.
>
> Style: late Joseon 민화 책가도 — flat folk perspective, bold lines,
> bright saturated colors, dense playful arrangement.
>
> DO NOT include: any text or readable Korean/Chinese characters on
> book covers (just abstracted color blocks), signatures, seals,
> watermarks, photographic realism, Western single-point perspective,
> modern gradients, frame borders outside the bookshelf, white
> margins beyond the hanji ground, transparent areas.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

## 7. 최민희 담당 프롬프트 (11장)

---

### 7.1 `favicon.png` — 웹 favicon

- **출력**: 48 × 48 PNG (생성 시 512×512로 받고 리사이즈)
- **저장 경로**: `assets/images/favicon.png`
- **컨셉**: icon.png을 작은 사이즈에서도 식별 가능하게 단순화한 버전. 도장 + 흰 K.

#### 프롬프트

> Square Korean traditional ink-stamp seal artwork at 512×512 pixels,
> designed to remain legible when scaled down to 16×16 pixels (a web
> browser favicon). The seal is a solid vermilion red square (#C5302A)
> filling the entire canvas with no rounded corners, no white margin.
> Texture is much simpler than the full app icon — minimal aging, just
> a slightly mottled red, no micro-cracks. In the absolute center, a
> single white letter "K" in a SIMPLIFIED Korean ancient seal-script
> style (전서체). The K has thicker, simpler strokes than the full
> icon — vertical line about 18% of canvas width thick (chunkier for
> small-size legibility), upper diagonal angles down-right, lower
> diagonal mirrors. White color pure #FFFFFF. K occupies about 60% of
> canvas height, vertically and horizontally centered. NO inset border
> frame on the seal — the favicon design is simplified without the
> border. Pure flat color rendering — no gradients, no glow, no drop
> shadow, no embossing, no anti-aliased softness beyond what the
> rasterizer adds.
>
> The composition must remain instantly readable at 16×16 px (browser
> tab thumbnail). Test by mentally squinting: the red square + white K
> silhouette should be the clear takeaway.
>
> DO NOT include: any text other than the centered K, any Hangul or
> Chinese characters, photographic elements, modern design effects,
> watermarks, signatures, rounded outer corners, transparent areas,
> the inset border frame (omitted in favicon for clarity), aging
> texture or micro-cracks (favicon is cleaner than icon.png).
>
> Aspect ratio: 1:1 square. Solid #C5302A background covers entire
> canvas. Output: 512×512 PNG (resize to 48×48 after).

#### 검수 체크리스트

- [ ] 16×16 썸네일로 축소해도 K 식별 가능 (Photoshop/Pixelmator에서 미리 확인)
- [ ] 단순화: icon.png의 inset border와 micro-crack 제거
- [ ] K 글자 stroke가 icon.png보다 더 굵음 (작은 사이즈 가독성)

---

### 7.2 `byeongpung_joseon_lotus.png` — 조선 연꽃

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 연꽃 (Lotus) — 정화, 재생

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the late
> Joseon dynasty (19th century) folk painting (민화) tradition,
> featuring a lotus pond scene. Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber
> grain. Edge to edge.
>
> Foreground: a serene lotus pond scene filling the panel. Three
> large open lotus blossoms emerge from a calm pond — one in the
> upper-third (in three-quarter view), one in the middle (in
> profile), one in the lower-middle (just opening, half-closed).
> Each blossom rendered with bold black ink outlines (stroke 2–4
> pixels), soft pink-rose petals #E89B9B filled flat with subtle
> deeper rose #C5708F at petal tips, golden yellow #D4A82E
> central seed-pod with small ink-dotted stamens. Three large round
> lotus leaves #3A7D6A in flat green with bold ink outlines and
> visible radial vein lines float between the blossoms, edges
> slightly curling upward in the playful folk style. Tall stems
> #5A9A6A rise vertically connecting blossoms and leaves. At the
> pond surface (lower 25% of panel), stylized water with deep blue
> #1B4F8C bold ink wave-pattern. One small black-and-white folk
> -style fish swimming near the lower-left, and a tiny dragonfly in
> dark ink hovering near the upper blossom (very small accents).
>
> Style: late Joseon 민화 화조도 lotus pond — flat saturated colors,
> bold outlines, naive charm, slight stylization. The lotus
> symbolizes purity rising from mud — composition feels balanced
> and contemplative but with folk-art liveliness.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, modern gradients, Western
> shadows or perspective, frame borders, white margins, transparent
> areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.3 `byeongpung_joseon_wave.png` — 조선 물결

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 조선 19세기 민화
- **모티프**: 물결 (Wave) — 흐름. 조선 민화 영조파/갈매기 풍

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> late Joseon dynasty (19th century) folk painting (민화) tradition,
> featuring stylized waves and water patterns. Vertical portrait
> composition, aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: aged hanji paper #F5E8C8 with subtle horizontal fiber
> grain. Edge to edge.
>
> Foreground: rhythmic stacked horizontal bands of stylized ocean
> waves filling the entire panel vertically, in characteristic
> Joseon folk wave-pattern (영조파). Each wave band consists of
> rounded crests with a small recursive curl on top — the
> signature 파도무늬. Waves rendered with: bold uneven black ink
> outlines (stroke 2–4 pixels, livelier than Goryeo), filled with
> alternating deep blue #1B4F8C and lighter blue #3D9BE8, with
> ivory white #FAFAF0 highlights at wave crests. Some waves have
> small spray dots in white. In the lower-third, two stylized
> fish (잉어/carp — symbol of perseverance) jumping out of the
> waves — bodies in flat orange-gold #D4A82E with bold ink outlines,
> scales suggested by simple repeating ink curves, eyes wide and
> determined in the folk style. In the upper-third, three small
> birds (갈매기/seagulls or 학) in flight, simplified ink
> silhouettes against the wave bands. At the very top of the
> panel, a small red sun #C5302A on the horizon between cloud bands
> in flat ivory.
>
> Style: late Joseon 민화 wave-and-fish — flat saturated colors,
> bold rhythmic outlines, folk vitality and movement.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, modern gradients, water
> reflections (folk waves are stylized, not realistic), frame
> borders, white margins, transparent areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.4 `byeongpung_silla_peony.png` — 신라 보상화 모란

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기
- **모티프**: 모란 → 신라 보상화/장식문양화의 모란 변형

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Unified Silla period (7th–9th century) court ornamental tradition,
> featuring decorative peony motifs in the manner of Silla
> 보상화/장식문양 (decorative ornament where flowers are stylized
> into geometric medallions). Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture. Edge to edge.
>
> Foreground: a vertical arrangement of three large peony medallions
> stacked top-to-bottom, each a perfectly bilaterally symmetrical
> circular ornamental rosette. Each medallion is a stylized peony
> rendered with: bold black ink outlines, central petals in
> vermilion #C5302A with refined gold #D4A840 detail, surrounding
> petals in deep blue #1B4F8C, outer ring of pointed petals in
> ivory #E8E8E8, all radiating from a small gold central disc with
> tiny dots arranged in geometric pattern. Each medallion is about
> 80% of the panel width, with regular spacing between. Connecting
> the three medallions vertically, decorative scrolling vine motifs
> in deep blue and gold extend from medallion to medallion (운초문
> -style scrolls). At top and bottom of the panel, small ornamental
> bands with repeating geometric flower motifs in gold and ivory.
>
> Style: Unified Silla decorative court ornament — strict bilateral
> symmetry, geometric refinement, gold-leaf opulence, hieratic
> rhythm. NOT folk-loose, NOT painterly — this is architectural
> ornament. Looks like it could be carved on temple ceiling
> coffers.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, naive folk-art looseness, photographic realism,
> Joseon-style asymmetric composition, modern gradients, frame
> borders, white margins, transparent areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.5 `byeongpung_silla_chaekgeori.png` — 신라 화엄경 두루마리

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 통일신라 7~9세기
- **모티프**: 책가도 → 신라식으로는 화엄경 두루마리/사경

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Unified Silla period (7th–9th century) tradition, featuring stacked
> Buddhist sutra scrolls (화엄경 두루마리) and ornamental scholarly
> objects in the refined Silla style. Vertical portrait composition,
> aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: gold-tinted ivory ground #F0E0A0 with faint silk weave
> texture. Edge to edge.
>
> Foreground: a vertical arrangement of Silla Buddhist scholarly
> objects, each rendered with the geometric refinement of Silla
> ornamental art. From bottom to top: (1) a row of three closed
> scrolls wrapped in deep vermilion #C5302A silk with gold #D4A840
> ribbons and intricate geometric tassels, lying horizontally; (2) a
> partially open scroll with abstracted geometric vertical marks
> (suggesting Buddhist text but NOT actual readable characters),
> ribbon trailing; (3) a Silla-style bronze ritual ewer (주전자) in
> gold and bronze #D4A840 / #C8A030 with intricate relief
> patterns — a graceful spouted vessel; (4) at the very top, a
> Silla bronze ritual bell with delicate raised geometric ornament
> in gold and ivory, with two small ornamental bosses. Around the
> objects, small repeating ornamental cloud-and-flame motifs in gold
> and deep blue extend across the panel sides. Subtle gold filigree
> dots and stars in the upper area.
>
> Style: Unified Silla refined court ornament — geometric precision,
> gold-leaf opulence, Buddhist sacred quality. Each object is
> drawn with hieratic regularity, NOT the playful clutter of
> Joseon 책가도. Empty space is intentional.
>
> DO NOT include: any text, Chinese/Korean characters, actual
> readable sutras, signatures, seals, watermarks, photographic
> realism, Joseon-style colorful clutter, modern gradients, frame
> borders, white margins, transparent areas, Western single-point
> perspective.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.6 `byeongpung_goryeo_crane.png` — 고려 청자 운학문

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 청자상감
- **모티프**: 학 → 고려청자의 대표 무늬 운학문 (cloud-and-crane pattern)

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) tradition, evoking the
> celebrated 운학문 (cloud-and-crane pattern) of Goryeo celadon
> ceramics (청자상감 운학문 — the pattern made famous by 12th-
> century 매병 vases). Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with very faint
> translucent texture suggesting glazed celadon, edge to edge.
>
> Foreground: a rhythmic vertical pattern of cranes in flight
> alternating with stylized cloud motifs, in the inlaid (상감)
> style. Six cranes total arranged in three pairs — each pair
> facing each other, wings extended in flight, body silhouettes
> in white inlay #FAFAF0 with refined ink outline detail (stroke
> 1–2 pixels, very fine), beaks and legs in dark ink #2C2416,
> small red crown patches on heads in soft vermilion #C5302A
> (subtle, not bright). Between the crane pairs, stylized
> 영지 / 여의 cloud motifs — each cloud is a curling abstract
> swirl rendered as white inlay with fine ink outline, sometimes
> with soft gold #C8A030 accent dots. Subtle decorative borders
> on the left and right panel edges in fine ink scrollwork. The
> cranes have a sense of soaring weightlessness, suggesting
> immortality (학 = longevity in Korean Buddhist symbolism).
>
> Style: Goryeo celadon inlay aesthetic — muted contemplative
> palette, refined linework, deliberate negative space, the
> serene weightlessness of celadon ware. NOT bold Joseon outlines,
> NOT geometric Silla symmetry. This is the quiet poetry of
> Goryeo aristocratic taste.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Joseon-style bold
> outlines, vibrant saturated colors, modern gradients, glow
> effects, frame borders, white margins, transparent areas,
> Western perspective, ground or landscape (cranes are floating
> in celadon void).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.7 `byeongpung_goryeo_tiger.png` — 고려 산신도 호랑이

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 불화 + 산신도
- **모티프**: 호랑이 → 고려 산신도 (mountain spirit painting)에 등장하는 호랑이

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) Buddhist tradition, evoking
> the 산신도 (mountain spirit painting) where a tiger appears as
> the mountain god's companion. Vertical portrait composition,
> aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with subtle texture, edge
> to edge.
>
> Foreground: a refined, contemplative tiger rendered in the muted
> Goryeo Buddhist palette. The tiger sits in a calm, dignified pose
> in the lower-middle area of the panel, body in profile, head
> turned forward to face the viewer with serene wisdom (NOT the
> comical Joseon expression, NOT the fierce Silla guardian — this
> is the contemplative mountain spirit's tiger). Body is rendered
> with refined ink linework (stroke 1.5–2.5 pixels, much finer than
> Joseon), warm muted gold-bronze fur #C8A030 with delicate ink
> stripes that flow like brushwork (more painterly, less geometric
> than Silla), white belly highlight, ink-detailed face with calm
> expression. Eyes are jade green #5A9A6A with serene depth. Above
> the tiger, a stylized mountain peak in muted celadon green and
> deep blue #2A5AAA, suggesting the mountain spirit's domain. To
> the upper-right, soft pine-tree silhouettes in muted greens.
> Subtle clouds in lighter celadon swirling around the tiger
> suggest its mystical aura. At the panel base, a small flowing
> stream in deep celadon with ink lines.
>
> Style: Goryeo Buddhist refinement applied to a folk subject —
> muted palette, refined linework, contemplative dignity. The
> tiger feels sacred, like a guardian deity of the mountain rather
> than a folk-cartoon character.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Joseon-style bold folk
> outlines or comical face, Silla-style hieratic ornament, modern
> gradients, frame borders, white margins, transparent areas,
> magpies (this is Goryeo mountain spirit, not Joseon 호작도), the
> mountain spirit (sage) figure himself (just the tiger).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.8 `byeongpung_goryeo_mountain.png` — 고려 수월관음도 산

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 불화
- **모티프**: 산 → 고려 수월관음도의 영지/관음 영지의 산

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) Buddhist painting (불화)
> tradition, evoking the misty mountain landscape of
> 수월관음도 (Water-Moon Avalokiteshvara — a celebrated Goryeo
> Buddhist painting subject). Vertical portrait composition, aspect
> ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with subtle texture, edge
> to edge.
>
> Foreground: stacked misty mountains rising in the contemplative
> Buddhist landscape style. Four overlapping mountain ranges arranged
> vertically — closer mountains in the lower-third in deeper celadon
> green #3A7D6A, distant peaks in the upper-third in pale celadon
> #B0C8A8 / ivory. Mountains rendered with refined ink linework
> (stroke 1.5–2.5 pixels), soft graduated celadon fills (very subtle
> tonal variation, NOT flat blocks). On the lower-mid mountain,
> a small stylized Buddhist hermitage (암자) in muted gold and ivory
> with refined ink detail. Soft mist bands in lighter celadon and
> ivory wrap between the mountain ranges. In the upper third,
> partly hidden behind a peak, a stylized full moon in soft ivory
> #FAFAF0 (the "water-moon" reference of the painting tradition).
> Below the lowest mountain at the panel base, a still pool of water
> in deep celadon with tiny ink lines suggesting the moon's
> reflection. A few small clouds drift across the middle peaks in
> very subtle ivory and gold.
>
> Style: Goryeo Buddhist landscape — muted contemplative palette,
> refined linework, atmospheric mist, sacred stillness. NOT the
> bold flat Joseon mountains, NOT the rigid geometric Silla
> mountains. This is the quiet meditative landscape of Goryeo
> Buddhism.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, Western linear
> perspective, modern gradients (subtle tonal grades only), glow
> effects, frame borders, white margins, transparent areas,
> Avalokiteshvara figure (just the landscape).
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.9 `byeongpung_goryeo_sun.png` — 고려 불광 (광배)

- **출력**: 600 × 2040 PNG, 1:3.4 portrait
- **시대**: 고려 10~14세기, 불화
- **모티프**: 해 → 고려 불화의 불광 (Buddha's halo / 광배), 깨달음의 빛

#### 프롬프트

> A single panel of an 8-fold Korean folding screen (병풍) in the
> Goryeo dynasty (10th–14th century) Buddhist painting (불화)
> tradition, featuring a 광배 (Buddhist halo / mandorla) representing
> the radiant light of enlightenment. Vertical portrait composition,
> aspect ratio 1:3.4, output at 600×2040 pixels.
>
> Background: pale celadon ground #D8E8D0 with subtle texture, edge
> to edge.
>
> Foreground: a large, sacred Buddhist halo composition centered in
> the upper-middle area of the panel. Three concentric circular
> halos: the innermost a small golden disc #D4A840 / #C8A030 with
> fine ornamental relief (suggesting the Buddha's head — but no
> figure shown); around it, a middle ring of soft pink-rose #E89B9B
> light with refined ink filigree pattern of small lotus petals; the
> outer ring is the largest mandorla — a tall almond-shaped halo
> rising vertically with curling flame motifs (화염문) in muted gold
> and soft red, reaching from the center upward toward the panel
> top. Inside the mandorla, fine gold filigree patterns of small
> lotuses, clouds, and abstract sacred geometry — all drawn with
> refined hairline ink work and soft gold accents. Surrounding the
> halo composition, soft celadon clouds in muted greens and ivory
> suggest the sacred atmosphere. At the panel base, a stylized lotus
> throne pedestal in soft pink and ivory with refined ink — empty,
> as if the Buddha has just departed leaving only light. The overall
> palette is muted, sacred, contemplative.
>
> Style: Goryeo Buddhist 불화 — refined hairline linework, gold-leaf
> filigree, muted graduated palette, sacred symbolism. The empty
> throne and the radiant halo together express Buddhist absence-as-
> presence.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, the Buddha figure himself (just the halo and
> empty throne), photographic realism, modern gradients, lens flare,
> Western glow effects, frame borders, white margins, transparent
> areas.
>
> Aspect ratio: 1:3.4 portrait. Full painted panel edge to edge.

---

### 7.10 `bucket_crane.png` — 학 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/crane.png`
- **컨셉**: 조선 민화 송학도 — "장수, 평화, 느린 우아함". 슬로우 트래블/사찰 스테이 버킷

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting a 송학도 (pine
> -and-crane painting). Output at 1024×1024 pixels, 1:1 square aspect
> ratio.
>
> Background: warm hanji paper #FDFAF3 with subtle horizontal grain.
> Edge to edge.
>
> Foreground: a serene composition centered on a single white crane
> standing on a stylized rock, with a tall pine tree on the right.
> The crane (학) is in profile facing left, neck arched gracefully,
> one leg lifted in classic crane posture. Body rendered with bold
> ink outlines, pure ivory white #FAFAF0 fill, distinctive black
> tail feathers, deep red #C5302A crown patch on top of head, long
> black legs and beak. The eye is a small black ink dot. To the
> right of the crane, a tall stylized pine (소나무) — gnarled trunk
> in dark ink #2C2416, irregular branches, pine needles as bold
> radial green tufts #3A7D6A with bold outlines. Below the crane,
> stylized rocks in deep blue #1B4F8C with bold ink outlines, with
> a small patch of 영지 (sacred mushroom) in red and gold near the
> rocks (longevity symbol). In the upper-left, a second smaller
> crane in flight in simplified silhouette. At the very base,
> stylized water with characteristic minhwa wave-pattern in indigo.
>
> Style: late Joseon 민화 송학도 — flat saturated mineral pigments,
> bold lines, no perspective, naive serene charm. The crane stands
> with the gentle dignity of folk-painted longevity.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, modern gradients, photographic realism, frame
> borders, white margins beyond the hanji ground, transparent
> areas, Western shadows.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

### 7.11 `bucket_sansuhwa.png` — 산수화 버킷 템플릿

- **출력**: 1024 × 1024 PNG, 1:1 square
- **저장 경로**: `assets/bucket-templates/sansuhwa.png`
- **컨셉**: 조선 민화 산수화 — "방랑, 자연, 길". 여행/등산/자연 버킷

#### 프롬프트

> Square Korean traditional folk painting (민화) artwork in the late
> Joseon dynasty (19th century) tradition, depicting a folk
> 산수화 (mountain-and-water landscape). Output at 1024×1024 pixels,
> 1:1 square aspect ratio.
>
> Background: warm hanji paper #FDFAF3 with subtle horizontal grain.
> Edge to edge.
>
> Foreground: a folk-style mountain landscape composition. Three
> overlapping mountain peaks arranged from bottom to top — closer
> peak in the lower-third in deep blue #1B4F8C, middle peak in
> jade green #3A7D6A, distant peak at top in vermilion #C5302A
> (the playful folk choice of bright peak colors). Each peak rendered
> with bold black ink outlines (stroke 3–5 pixels) and flat
> saturated fills, with cartoonishly triangular silhouettes typical
> of Joseon folk landscapes. White cloud bands #FAFAF0 wrap between
> the mountain ranges with bold ink scroll-pattern outlines. In the
> mid-section, a winding path through stylized pine trees (small
> dark ink with green tufts), and a tiny folk traveler figure
> walking on the path with a wooden staff and conical hat (very
> small, just suggested as ink silhouette with minimal color). At
> the lower-third, a flowing stream with characteristic minhwa
> wave-pattern in deep blue and white. Sun in the upper-right
> corner as small red disc with gold rays. Two small flying birds
> in dark ink near the upper peaks.
>
> Style: late Joseon 민화 산수 — flat saturated colors, bold cartoon
> -like outlines, hierarchical naive composition (far peaks at top,
> traveler at bottom), folk-art liveliness. The composition tells a
> story of travel and discovery.
>
> DO NOT include: any text, Chinese/Korean characters, signatures,
> seals, watermarks, photographic realism, atmospheric haze, modern
> gradients, Western perspective, frame borders, white margins
> beyond the hanji ground, transparent areas.
>
> Aspect ratio: 1:1 square. Full painted canvas edge to edge.

---

## 8. 검수 체크리스트 (전체 35장 공통)

각 이미지 제출 전 다음 항목을 본인이 먼저 검수:

### 기본 사양
- [ ] 파일명이 정확함 (코드 경로 그대로, 띄어쓰기 없음, 소문자)
- [ ] 출력 사이즈가 사양대로 (필요시 후처리 리사이즈)
- [ ] 비율이 정확함 (병풍 1:3.4, 버킷 1:1, 아이콘 1:1, 스플래시 1242:2436)
- [ ] PNG 포맷 (JPEG 아님)
- [ ] 알림 아이콘 외에는 transparent 영역 없음 (적응형 아이콘만 외곽 transparent)

### 스타일 일관성
- [ ] 시대 비주얼 앵커가 명확히 살아있음
  - 조선 = 굵은 검은 윤곽 + 진한 광물 안료 + 한지 누런빛
  - 신라 = 금장식 + 기하학적 대칭 + 사신수 다이내믹
  - 고려 = 청자녹 + 섬세한 선 + 명상적 여백
- [ ] 색 팔레트가 §2.1에서 벗어나지 않음 (없는 색 추가 X)
- [ ] 모티프가 명확하게 식별됨 (예: peony는 모란이라고 알아볼 수 있어야)

### 부정 큐 위반 없음
- [ ] 글자/한자/한글 들어가지 않음 (앱 아이콘의 K 제외)
- [ ] AI 워터마크 또는 서명 없음
- [ ] 그라디언트, 글로우, 드롭섀도우, 글래스모피즘 없음
- [ ] 사진처럼 보이는 사실주의 효과 없음
- [ ] 캔버스 외곽 흰 여백 없음 (병풍/버킷)

### 파일 제출
- [ ] 파일을 PNG 압축 또는 변환 없이 원본 그대로 제출
- [ ] 시도한 변형들 중 가장 좋은 1장만 최종 제출 (베리에이션 모음 X)

---

## 9. 파일 제출 안내

- 제출 위치: 프로젝트 루트의 `assets/incoming/` 폴더 (생성됨)
- 파일명은 **반드시** 위 표대로 (예: `byeongpung_joseon_peony.png`)
- 동시 제출 시도 시 파일명 충돌 없도록 본인 담당분만 올림
- 제출 완료되면 슬랙 #k-journey-design 채널에 알림

---

## 10. 후속 코드 작업 (개발자가 진행, 디자인 팀원은 신경 X)

이 35장이 모이면 다음 코드 작업이 따릅니다:

1. `src/components/byeongpung/motifs.tsx` — SVG 컴포넌트 → PNG `<Image>` 컴포넌트로 교체
2. `ByeongpungStrip.tsx`, `gallery.tsx` — 패널 렌더링 로직 단순화 (배경색/텍스처 baked-in이라 코드는 PNG만 보여주면 됨)
3. `app.json` — `icon`, `splash`, `adaptiveIcon`, `notification.icon` 필드 추가
4. `assets/images/` 디렉터리 정리 (현재 무드보드 6장은 별도 폴더로 이동)
5. `npm run check` 통과 확인
6. EAS Build로 실제 빌드 후 시뮬레이터에서 시각 검증

---

**문의/피드백**: 시대 스타일이 헷갈릴 때는 §2.2 비주얼 앵커를 다시 읽어보고, 그래도 모호하면 슬랙으로 reference 이미지(예: 국립중앙박물관 소장품) 링크 공유 후 진행.
