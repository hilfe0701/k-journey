# K-Journey Design System

> **2026-08-02 current-use note:** visual tokens and brand principles remain active, but
> account management, server photo upload, and remote sync/conflict sections are historical.
> The current product has `Journey: Essentials / Culture`, Byeongpung, Want to, and More;
> user state is local. Use `reference/K-Journey_PRD_v2_0_KR.md`,
> `docs/JOURNEY_INTEGRATION_SPEC.md`, and `docs/BYEONGPUNG_ART_DIRECTION.md` for integrated
> layout and artwork contracts. They take precedence where this older document conflicts.

> A pocket-sized cultural curator for foreign exchange students in Seoul.
> Visual language rooted in **한국 전통 회화 (Korean Traditional Painting)** —
> minhwa folk art, obangsaek five colors, and the slow unfolding of a scroll painting.

This document is the single source of truth for K-Journey's visual system.
All values map 1:1 to `design-tokens.ts` at the project root and to era-specific
variants in `src/theme/eras.ts`.

---

## 1. Brand essence

K-Journey is a **journal you live through**, not a marketplace you transact in.
The interface should feel like a folding screen (병풍) being slowly unfolded over
four months — calm, deliberate, reverent.

**Tone**

- Warm authority — a knowledgeable cultural guide, not a tech company
- Bilingual-aware — English first, Korean proper nouns in parentheses: `Try Tteokbokki (떡볶이)`
- Reverent but accessible — honors tradition without being stuffy
- Minimal copy — let imagery and the byeongpung carry emotional weight
- No emoji — minhwa motifs replace decorative emoji

**Anti-patterns to reject**

- Gradient backgrounds (the only gradient is the brand wordmark)
- Glass morphism, frosted blur effects
- Bouncing springs, gratuitous parallax
- All-caps anywhere except small badge labels (11–12px)
- Generic stock photography overlaid with text

---

## 2. Color tokens — 오방색 (Obangsaek)

The five directional colors of Korean tradition form the entire palette. Each
hex value below is final and has no alternates.

### 2.1 Five directional colors

| Direction | Element | Token | Hex | Use |
|---|---|---|---|---|
| 적 South / Fire | Red | `dancheong` | `#C5302A` | Primary CTA, brand action |
| 적 South / Fire | Deep red | `dancheongDeep` | `#8B1A14` | CTA pressed state |
| 적 South / Fire | Light red | `dancheongLight` | `#F2D5D3` | Subtle red fills |
| 청 East / Wood | Royal blue | `cheong` | `#1A3A7A` | Secondary actions, links |
| 청 East / Wood | Mid blue | `cheongMid` | `#2A5298` | Badges |
| 청 East / Wood | Light blue | `cheongLight` | `#D0DBF2` | Tinted backgrounds |
| 황 Center / Earth | Imperial gold | `hwanggeum` | `#C4952A` | Accent, byeongpung borders |
| 황 Center / Earth | Deep gold | `hwanggeumDeep` | `#9A7120` | Gold pressed |
| 황 Center / Earth | Light gold | `hwanggeumLight` | `#F5E8C4` | Soft gold tint |
| 백 West / Metal | Hanji white | `hanji` | `#FDFAF3` | Primary page background |
| 백 West / Metal | Warm parchment | `hwangto` | `#F0E6CE` | Subsurface, footers |
| 백 West / Metal | Mid parchment | `hwangtoDeep` | `#E8D9BB` | Deeper parchment |
| 흑 North / Water | Ink black | `meok` | `#2C2416` | Primary text (never #000) |
| 흑 North / Water | Mid ink | `meokMid` | `#4A3F30` | Secondary headings |
| 흑 North / Water | Warm gray | `ash` | `#6E6458` | Secondary text |

### 2.2 Extended traditional palette

| Token | Hex | Symbolism |
|---|---|---|
| `jade` | `#3D6B3A` | 청록 — pine, longevity, activity |
| `jadeLight` | `#CBE0CA` | Jade tint |
| `lotus` | `#D4758A` | 연꽃 — purity, spring blossom, culture |
| `lotusLight` | `#F5D8DF` | Lotus tint |
| `stone` | `#9E9080` | Tertiary text, placeholders |
| `hairline` | `#DDD5C4` | 1px borders, dividers |
| `cloud` | `#F5EFE3` | Hover backgrounds |

### 2.3 Semantic roles

| Role | Token | Default value |
|---|---|---|
| Page background | `bg.primary` | `hanji` |
| Subsurface | `bg.secondary` | `hwangto` |
| Hover/subtle fill | `bg.tertiary` | `cloud` |
| Dark surface | `bg.inverse` | `meok` |
| Body text | `fg.primary` | `meok` |
| Secondary text | `fg.secondary` | `ash` |
| Muted/placeholder | `fg.tertiary` | `stone` |
| Inverse text | `fg.inverse` | `hanji` |
| CTA emphasis | `fg.accent` | `dancheong` |
| Link | `fg.link` | `cheong` |
| Border | `border.hairline` | `hairline` |
| Focus ring | `border.focus` | `meok` |
| CTA bg | `cta.bg` | `dancheong` |
| CTA bg pressed | `cta.bgPressed` | `dancheongDeep` |
| CTA text | `cta.text` | `hanji` |

### 2.4 Phase colors

The four-phase journey (입국전 / 첫주 / 거주 / 출국전) is color-coded:

| Phase | Name | Token | Color |
|---|---|---|---|
| 1 | Pre-arrival | `phase.preArrival` | `cheong` `#1A3A7A` |
| 2 | First week | `phase.firstWeek` | `hwanggeum` `#C4952A` |
| 3 | Living | `phase.living` | `jade` `#3D6B3A` |
| 4 | Pre-departure | `phase.preDeparture` | `dancheong` `#C5302A` |

### 2.5 Mission category colors

| Category | Korean | Token | Color |
|---|---|---|---|
| Settle in | 생활 정착 | `category.settle` | `cheong` `#1A3A7A` |
| Food | 음식 & 식도락 | `category.food` | `dancheong` `#C5302A` |
| Activity | 여행 & 액티비티 | `category.activity` | `jade` `#3D6B3A` |
| Culture | 문화 체험 | `category.culture` | `hwanggeum` `#C4952A` |

### 2.6 Era themes

Three era variants override `primary`, `accent`, `bgTint`, `panelBg`, and the
`panelColors[8]` array. All other tokens stay constant.

| Token | Joseon (조선) | Silla (신라) | Goryeo (고려) |
|---|---|---|---|
| `primary` | `#C5302A` (dancheong) | `#C4952A` (hwanggeum) | `#1A3A7A` (cheong) |
| `accent` | `#C4952A` (hwanggeum) | `#C5302A` (dancheong) | `#3D6B3A` (jade) |
| `secondary` | `#1A3A7A` | `#1A3A7A` | `#C4952A` |
| `bgTint` | `#FDFAF3` (neutral hanji) | `#FDF8EE` (warm) | `#F5F8F3` (cool) |
| `panelBg` | `#F5E8C8` | `#F0E0A0` | `#D8E8D0` |

`panelColors[8]` arrays — see `src/theme/eras.ts`.

---

## 3. Typography

Two families. No third.

### 3.1 Family stack

```ts
display: 'NotoSerifKR', 'Apple SD Gothic Neo', Georgia, serif
ui:      'Pretendard', 'Apple SD Gothic Neo', -apple-system, sans-serif
```

- **NotoSerifKR** — display headings, calligraphic weight (loaded via `expo-font` from Google Fonts)
- **Pretendard** — UI, body, buttons (bundled in `assets/fonts/PretendardVariable.ttf`, ~6.4 MB)

### 3.2 Type scale

| Role | Size | Weight | Family | Letter-spacing | Line-height |
|---|---|---|---|---|---|
| Hero | 56 | 700 | display | -0.03em | 1.15 |
| Display | 40 | 700 | display | -0.03em | 1.15 |
| H1 | 32 | 700 | display | -0.02em | 1.25 |
| H2 | 28 | 700 | display | -0.02em | 1.25 |
| H3 | 22 | 600 | display | -0.02em | 1.25 |
| H4 | 20 | 600 | ui | 0 | 1.25 |
| Lead | 18 | 500 | ui | 0 | 1.6 |
| Body | 16 | 500 | ui | 0 | 1.6 |
| Small | 14 | 500 | ui | 0 | 1.4 |
| XS | 12 | 500 | ui | 0 | 1.4 |
| Micro | 11 | 700 | ui | +0.04em | 1 (uppercase, badges only) |

**Body weight is 500.** Never 400. This rule comes from the Airbnb Cereal
philosophy and applies to all body and UI copy.

### 3.3 Korean rendering

- Korean glyphs in body copy mix naturally with Latin — no special markup.
- Korean proper nouns inside parentheses are visually de-emphasized but never restyled:
  `Try Tteokbokki (떡볶이)` — no italics, no smaller font, no color change.

---

## 4. Spacing — 8px base

Scale: `4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96`

Tokens: `space[1..6]`, `space[8]`, `space[12]`, `space[16]`, `space[20]`, `space[24]`.

---

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `sm` | 4 | Inline tags, small chips |
| `md` | 8 | Text buttons, form inputs |
| `card` | 12 | Listing card images, mission cards |
| `lg` | 20 | Large images, modals, primary pills |
| `pill` | 28 | Search bar pill |
| `full` | 9999 | Avatars, circular icon buttons |

---

## 6. Elevation

Always warm-ink shadows — never neutral gray.

| Level | Shadow | Use |
|---|---|---|
| 0 | `none` | Listing cards, body text |
| 1 | `rgba(44,36,22,0.06) 0 2px 8px` | Hover lift |
| 2 | `rgba(44,36,22,0.04) 0 0 0 1px, rgba(44,36,22,0.08) 0 4px 12px` | Modals, booking-style panels |
| 3 | `rgba(44,36,22,0.04) 0 0 0 1px, rgba(44,36,22,0.06) 0 4px 8px, rgba(44,36,22,0.12) 0 8px 24px` | Floating overlays |
| Focus | `0 0 0 2px #2C2416` | Focused inputs, active buttons |

---

## 7. Motion

Subtle, unhurried — like unrolling a scroll painting.

- Hover/press state: `200ms ease-out`
- Panel/screen transitions: `300ms ease-in-out`
- No spring physics. No bounce. No overshoot.
- Listing card hover: `translateY(-2px)` with elevation step from 0 to 1

### 7.1 Mission completion choreography

The single hero animation in K-Journey. Four stages, total ~2.4s.

| Stage | Time | What happens |
|---|---|---|
| 1. cardSink | 0–400ms | Mission card scales `1 → 0.92`, opacity `1 → 0`, translates `Y +20` |
| 2. inkRingOut | 400–520ms | Four concentric circles ripple outward at 120ms stagger |
| 3. panelReveal | 400–1200ms | clipPath circle expands from 0 to 200% with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, byeongpung panel art behind it gradually surfaces |
| 4. fadeUpIn | 1200–2200ms | "Byeongpung panel N unlocked" text fades in from below |

When no new panel unlocks, stage 4 says "Mission complete."

### 7.2 Byeongpung panel reveal logic

`panelReveal(i) = clamp((completedCount - i*6) / 6, 0, 1)` — each panel needs ~6 missions.
Reveal effect: clipPath circle grows + opacity 0→1 over 800ms.

---

## 8. Iconography

- **Primary set:** Lucide outlines, 1.5px stroke, rounded caps. Use `lucide-react-native`.
- **Decorative set:** minhwa motif SVGs (peony, crane, tiger, lotus, chaekgeori, sansuhwa) — only as illustration, never as functional icons.
- Avoid: filled icons, Material/Heroicons, emoji, heavy-weight sets.

---

## 9. Imagery

- **Aspect ratios:** 4:3 listing-style, 3:2 hero, 1:1 avatars
- **Corner radius:** 12 on cards, 20 on hero frames, 9999 (full) on avatars
- **Photography subjects:** hanok architecture, traditional crafts, markets, ceremonies, seasonal nature
- **Don't:** overlay text on photos, no gradient scrims, no parallax

---

## 10. Component primitives

The full component library lives in `src/components/ui/`. Below is the contract.

### Button

| Variant | Background | Text | Border |
|---|---|---|---|
| `primary` | `cta.bg` | `cta.text` | none |
| `secondary` | `bg.primary` | `fg.primary` | 1px `border.hairline` |
| `ghost` | transparent | `fg.accent` | none |

All buttons: radius `md` (8) for normal, `pill` (28) for search-style. Press: scale `0.97` + 200ms.

### IconButton

The only way to build an icon-only control. Never hand-roll a `Pressable` around a bare glyph.

- Target: 44×44 minimum as a real box (`MIN_TARGET`), independent of glyph size
- `accessibilityLabel` is **required by the type** — an icon carries no name
- Tones: `default` (`meok`), `inverse` (`hanji`, for dark headers), `accent` (`dancheong`)
- `surface` draws the filled circular `cloud` backing used in screen headers
- Disabled: 0.4 opacity **plus** `disabledReason`, which is announced as the hint
- Pressed: 0.6 opacity, so one rule reads on both light and dark surfaces

### MissionCard

- Height: 76px
- Layout: 44×44 icon square (radius 12, bg = category color @ 0.12 opacity), title (Body 16/600), subtitle (Small 14/500 ash), trailing chevron or check
- Pressed: bg shifts to `cloud`
- Completed: title gets `meokMid`, check icon in `jade`

### Input

- Height: 52px
- Radius: `md` (8)
- Border: 1px `hairline`, focus 2px `meok`
- Placeholder: `stone`
- Body 16/500

### BottomNav

- Height: 64px **+ `insets.bottom`**, folded in explicitly. `tabBarStyle` merges last inside `BottomTabBar`, after its own `paddingBottom: insets.bottom`, so a literal height replaces the safe-area inset instead of adding to it.
- Background: `hanji` with 1px top border `hairline`
- 4 slots — each: icon + 11px label, active = theme `primary`

---

## 11. Voice and copy rules

- Sentence case for UI labels and body
- Korean text: natural capitalization
- Section headings: never ALL-CAPS (exception: micro-badges 11–12px)
- Emoji: never

### Examples

✅ `Begin today's journey`
✅ `Authentic hanok stays near Gyeongbokgung`
✅ `D-47 days until departure`
✅ `Try Tteokbokki (떡볶이)`

❌ `BOOK NOW!!!`
❌ `🎉 Amazing experiences await!`
❌ `Discover KOREA!`

---

## 12. Implementation pointers

- Tokens: `/design-tokens.ts` (project root)
- Era variants: `/src/theme/eras.ts`
- Theme provider: `/src/theme/ThemeProvider.tsx`
- Component primitives: `/src/components/ui/`
- Byeongpung PNG panels (full paintings, era-specific): `/assets/byeongpung/{era}/panel-{n}.png` (ADR-0008)
- Bucket template PNGs: `/assets/bucket-templates/bucket_{template}.png`
- Brand imagery: `/assets/images/`
- Pretendard variable font: `/assets/fonts/PretendardVariable.ttf`

---

## 13. Accessibility

K-Journey commits to **WCAG 2.1 AA** (ADR-0025). Implementation contract:

### 13.1 Per-component contract

Every interactive element MUST set:

* `accessibilityLabel` — what it is (e.g. "Sign in with Apple")
* `accessibilityRole` — `button`, `tab`, `radio`, `checkbox`, `link`, `summary`, etc.
* state — `{...a11yState({ disabled, busy, selected, checked, expanded })}` as applicable
* `accessibilityHint` — optional; only when the action is non-obvious

Use `a11yState()` from `src/lib/a11y.ts` rather than a bare `accessibilityState` prop. React Native Web's `Pressable` ignores `accessibilityState`, so the bare prop announces nothing at all on web; the helper emits the `aria-*` equivalents alongside it.

The shared primitives `Button`, `IconButton`, and `Card` emit these from props (see `src/components/ui/`). New components MUST follow the same pattern. `docs/ACCESSIBILITY.md` keeps the per-component checklist.

### 13.2 Touch targets

iOS HIG floor: **≥ 44 × 44 pt**, as a real box — `minWidth`/`minHeight` or explicit size.

Do **not** use `hitSlop` to reach the floor. It does not exist in React Native Web, so a 24pt icon with `hitSlop={8}` is a compliant 40pt target on device and a 24pt target in a browser. `hitSlop` is fine as extra forgiveness on top of a box that already measures 44.

For icon-only controls use `IconButton` (see below), which owns the box.

### 13.3 Color contrast

* Body text on background: **≥ 4.5:1**
* Large text (18 pt regular / 14 pt bold): **≥ 3:1**
* UI chrome and 1.5 px iconography: **≥ 3:1**

Token pairs are vetted in §2 (Color tokens). Any new token MUST be checked against `semantic.bg.canvas`, `semantic.bg.surface`, and each era palette before use.

### 13.4 Dynamic Type / Font Scale

`allowFontScaling=true` is the default for all text **except** `<Badge>` micro-labels (which break a 12 px design at +2 steps). The system text scale must be supported up to **± 2 steps** without layout truncation.

### 13.5 Reduce Motion

Subscribe via `useReduceMotion()` (`src/lib/a11y.ts`). When true:

* `MissionCompleteOverlay` swaps the 4-stage choreography for a **250 ms cross-fade** (mission card fades out and `Panel N unlocked` text fades in simultaneously — total ~250 ms vs. ~2400 ms). Matches PRD §11.6.1, ACCESSIBILITY.md §6, and TESTING.md §9.2.
* Byeongpung era-switch panel reveal becomes an instant opacity swap rather than the clipPath circle expansion.
* `Card` press-feedback drops the 0.97 scale and uses opacity 0.8 only.

### 13.6 Screen reader signals

* Decorative imagery: `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` (e.g. byeongpung panels — the strip carries the summary label, individual panels stay decorative).
* Modal overlays: `accessibilityViewIsModal` so VoiceOver does not leak focus to elements behind.
* Live-updating text (panel unlock announcement): `accessibilityLiveRegion="polite"`.
* Korean parenthetical labels (ADR-0018) are included verbatim in the screen-reader label so users hear both forms — useful for taxi-driver / shop-counter conversations.

---

## 14. State variants (loading · empty · error)

Components should design for **four** visible states, not just the happy path. Voice rules for every copy string in this section: see §16. Authority on empty state: [ADR-0027](docs/adr/0027-empty-state-pattern.md). Authority on error recovery: [ADR-0028](docs/adr/0028-error-recovery-retry-strategy.md). Per-screen empty state catalog: `docs/EMPTY_STATES.md`. Per-code error catalog: `docs/ERROR_MESSAGES.md`.

### 14.1 Loading
* Initial paint: render the structural skeleton with the same shape and spacing as the loaded state, but in `palette.cloud` / `palette.hairline`.
* Inline busy state: `ActivityIndicator` in the destination color (e.g. inside `Button` when `loading={true}`).
* No spinners on tab switch — assume content paints from MMKV cache fast enough.
* Copy budget per wait length:
  * < 200 ms → no copy (skeleton only).
  * 200 ms – 2 s → skeleton only.
  * 2 s – 5 s → skeleton + small inline text. ✅ "Loading missions" — no ellipsis (VoiceOver pronunciation).
  * \> 5 s → inline text + reassurance. ✅ "Still loading. This sometimes takes a moment on slow networks."
  * \> 30 s → treat as failure → T1 toast (§14.3).
* Anti-patterns: ❌ "Please wait…" ❌ "Just a moment…" ❌ "Hang on…" — patronizing.

### 14.2 Empty
* **Three slots, fixed order:** icon (48×48 pt, Lucide or minhwa) + 1-line factual message (≤ 9 words) + optional single CTA. No second CTA. Per [ADR-0027](docs/adr/0027-empty-state-pattern.md).
* Icon tint: screen's category color (`categoryColors`) or `palette.ash` for neutral. Never `dancheong` red — red is reserved for action confirmation.
* Sit at vertical 33 % of the available space, not dead center. 64 pt top safe-area gap, 48 pt bottom gap.
* Copy tone — projective, never blame:
  * ✅ "No missions completed yet" — describes state.
  * ✅ "Your gallery starts when you complete your first mission" — projects future.
  * ❌ "Oops, you haven't done anything!" — blames the user.
  * ❌ "Nothing to see here 😅" — self-deprecating + emoji (CLAUDE.md NEVER #3).
* a11y: empty-state message is the screen's first VoiceOver announcement when zero data is present.
* Per-screen catalog (home / bucket / gallery / byeongpung / search / universities) → `docs/EMPTY_STATES.md`.

### 14.3 Error (recoverable) — 4-tier surfaces

`showOperationError(action, err)` (`src/lib/errorAlert.ts`) is the single entry point (ADR-0012). It routes to one of four UI tiers based on the error code, per [ADR-0028](docs/adr/0028-error-recovery-retry-strategy.md). Master copy table: `docs/ERROR_MESSAGES.md`.

| Tier | Surface | When to use | Retry affordance | Example copy |
|---|---|---|---|---|
| **T1 Toast** | Bottom toast, 4–6 s, dismissable, with inline `Retry` button | Transient, idempotent, single-step | One-tap retry of the same op | `No connection. Your work is saved on this device.` |
| **T2 Modal** | `Alert.alert()`, two-button — `Try again` (primary) + `Discard` (destructive) | Data-loss risk, multi-step, photo upload | Retry preserves user input | Title: `Couldn't save` · Body: `Something went wrong saving your change.` |
| **T3 Settings deep-link** | `Alert.alert()` — `Open Settings` (primary) + `Not now` | Permission/config required | OS settings → flip toggle → app foregrounds → auto-resume | Title: `Photos access needed` · Body: `Allow photos access to attach a photo to this mission.` |
| **T4 App-level banner** | Sticky banner in `app/_layout.tsx`, single CTA | System outage, auth-expired, clock-jump | Action depends on cause | Title: `Signed out` · Body: `Your sign-in session ended. Sign in to continue.` |

Voice rules for all four tiers:
* Factual, never blaming. ✅ "Couldn't reach the network." ❌ "Your connection failed."
* No tech jargon — never "Firestore", "JWT", "WebSocket".
* No emoji, no urgency-scare ("Don't miss out!"), no apology spirals ("So sorry, please forgive…").
* a11y: T1/T2 use `accessibilityLiveRegion="assertive"`. T4 banner uses `accessibilityRole="alert"`.

### 14.4 Error (fatal / route-level)
* `ErrorBoundary` in `app/_layout.tsx` catches render-time errors. AlertTriangle icon in `palette.dancheong + '14'`, body in `palette.ash`, single Retry button (CTA color).
* Crashlytics is called from inside the boundary.
* Copy: title `Something went wrong` · body `Try again, or restart the app if this keeps happening.` · CTA `Try again`.

---

## 15. Dark mode

**Not supported in MVP.** The hanji-paper light theme is the brand's defensible aesthetic. If iOS dark-mode preference triggers a system-wide color shift, K-Journey ignores it (`userInterfaceStyle: 'light'` in `app.json`).

V2.0 may consider an **ink night** variant (deep `meok` + warm `hwanggeum`) but that's an explicit product decision, not a free system follower. No half-way implementation.

---

## 16. Microcopy & voice guidelines

The complete microcopy authority lives in `docs/MICROCOPY.md`. This section is the **designer-facing summary** for in-component copy decisions. Anything you ship to a user — button label, empty state line, error body, toast text, push payload — passes this voice check first.

### 16.1 Voice in one sentence

**Warm authority.** A knowledgeable cultural guide who has lived in Korea for years and is glad you're here. Not a tour bus megaphone, not a startup growth-hack copywriter, not a life coach.

| Trait | Yes | No |
|---|---|---|
| Warm | "Your first week starts here." | "Welcome aboard! 🎉" |
| Authoritative | "Visit Gwangjang Market (광장시장) before 8 PM — that's when the food stalls peak." | "You should probably check out Gwangjang!" |
| Calm | "Phase 2 unlocked." | "BOOM 💥 You did it!" |
| Reverent | "The 8-panel byeongpung was traditionally painted over a season." | "Cool Korean folding screen!" |

### 16.2 Hard rules (every string must pass)

* **Sentence case** for all UI labels and body copy. Korean follows natural Korean capitalization. Only badge labels (11–12 px) use ALL CAPS. (CLAUDE.md MUST #4, NEVER #4)
* **English first.** Korean only in parentheses for proper nouns: `Try Tteokbokki (떡볶이)`. (ADR-0018)
* **No emoji** anywhere — minhwa motifs replace decorative emoji. (CLAUDE.md NEVER #3)
* **No tech jargon** in user-facing strings — never "Firestore", "JWT", "MMKV". Translate to product language.
* **No urgency-scare** — never "Don't miss out!", "Last chance!", "Hurry!" (ADR-0015 brand principle)
* **No emotional escalation** — never "Oops!", "Sorry!", "Yay!", "Whoops!"
* **No patronizing waits** — never "Please wait…", "Just a moment…", "Hang on…"

### 16.3 Length budgets per surface

| Surface | Target | Hard max |
|---|---|---|
| Button label | ≤ 3 words | 5 words |
| Empty state message | ≤ 9 words | 12 words |
| Toast body | ≤ 8 words | 12 words |
| Modal title | ≤ 5 words | 8 words |
| Modal body | ≤ 18 words | 30 words |
| Push title | ≤ 5 words | 30 chars (iOS lock-screen) |
| Push body | ≤ 14 words | 110 chars |
| VoiceOver `accessibilityLabel` | ≤ 12 words | 20 words |

If the thought won't fit, the thought is too big — refactor the thought.

### 16.4 Button label patterns

Verbs first, specific over generic:

| Context | Use | Avoid |
|---|---|---|
| Mission complete | `Mark complete` | `Done`, `OK` |
| Bucket save | `Save bucket` | `Save`, `Submit` |
| Photo add | `Add photo` | `Upload` (jargon) |
| Sign in | `Sign in with Apple` | `Continue` |
| Settings deep-link | `Open Settings` | `Settings`, `Go` |
| Retry | `Try again` | `Retry`, `OK` |
| Discard after error | `Discard` | `Cancel`, `No` |

### 16.5 Celebration copy

Used at panel unlock, phase transition, journey complete. Slightly elevated, never giddy.

| Moment | Title | Body |
|---|---|---|
| Mission complete (overlay) | (text-free choreography during stages 1–3) | (stage 4) `Panel N unlocked` |
| Panel unlock (push or overlay) | `Panel ${n} of 8 unlocked` | `Open the byeongpung to see your scroll grow.` |
| Phase 1→2 | `You've arrived` | `Phase 2 is unlocked. Your first week starts here.` |
| Phase 2→3 | `Settling in` | `Phase 3 missions are now in your home.` |
| Phase 3→4 | `Final stretch` | `Phase 4 — gather what you want to remember.` |
| Journey complete | `Your K-Journey is complete` | `Open your gallery to revisit the four months.` |

### 16.6 Confirmation (destructive) copy

When the user might lose data: two buttons, **never** `OK / Cancel`.

| Action | Title | Body | Primary | Destructive |
|---|---|---|---|---|
| Delete bucket | `Delete this bucket?` | `This will remove the bucket and its items.` | `Cancel` | `Delete bucket` |
| Sign out | `Sign out?` | `Your byeongpung stays. You can sign back in to continue.` | `Cancel` | `Sign out` |
| Remove photo | `Remove this photo?` | `The mission stays complete.` | `Cancel` | `Remove photo` |

### 16.7 Voice review checklist

Run through before merging any PR that adds or changes user-facing strings:

- [ ] Sentence case (not title case, not caps)
- [ ] English first; Korean only in parentheses for proper nouns
- [ ] No emoji
- [ ] No "Oops!", "Sorry!", "Yay!"
- [ ] No "Please wait…", "Just a moment…"
- [ ] No tech jargon
- [ ] No urgency-scare
- [ ] Length within budget for the surface
- [ ] Buttons are specific verbs, not "OK" / "Done"
- [ ] Errors are factual, not apologetic
- [ ] Empty states project the future, not blame the present

Full guide and templates: `docs/MICROCOPY.md`. Error code → copy: `docs/ERROR_MESSAGES.md`. Empty state per-screen: `docs/EMPTY_STATES.md`. Push catalog: `docs/PUSH_COPY.md`.

---

## 17. Settings pattern

Authority: [ADR-0032](docs/adr/0032-settings-screen-architecture.md). Per-row spec: `docs/SETTINGS.md`.

### 17.1 Entry & frame

* **Single entry**: bottom tab bar → **More** → top-right gear icon (Lucide `Settings`, 24 px, `palette.meok`). Two taps from anywhere. No header gear, no avatar shortcut.
* `SafeAreaView` with `edges={['top','left','right']}`. Header `Settings` (sentence case, 22 pt, `palette.meok`) + back chevron.

### 17.2 SectionList layout

* `SectionList` rendering 5 sections: **Notifications · Era · Profile · Account · About**.
* **Section header**: 12 pt, ALL CAPS, `palette.ash`, 16 pt top padding, 8 pt bottom. (Documented exception to NEVER #4 caps rule — platform Settings convention; ADR-0032.)
* **Row**: 56 pt min height, 16 pt horizontal padding, left-aligned label + right-aligned control. Background `palette.hanji`.
* **Divider**: 1 px `palette.hairline` between rows within a section. None between sections (16 pt gap is the separator).

### 17.3 Row control variants

| Type | Use | Style |
|---|---|---|
| **Switch** | boolean toggles (Notifications) | iOS-native Switch tinted `palette.dancheong` when on |
| **Picker** | enum (Era / Housing / University) | Right side: current value text in `palette.ash` + chevron. Tap opens modal picker. |
| **Text input** | free text (Name) | Right side: current value text + chevron. Tap opens single-field sheet (full-screen on mobile). |
| **Date** | dates (Arrival / Departure) | Right side: formatted date (`Mar 15, 2026`) + chevron. Tap opens native date picker; commit triggers confirm dialog. |
| **Action button** | destructive or navigation (Sign out / Delete / Export) | Full-width row text, `palette.dancheong` for destructive, `palette.cheong` for non-destructive navigation. |
| **Read-only text** | About → version, build | Right side: text in `palette.ash`, no interaction, `accessibilityRole="text"`. |
| **External link** | About → privacy / terms / support | Right side: external icon (Lucide `ExternalLink`, 16 px, `palette.ash`). Opens `Linking.openURL` or `mailto:`. |

### 17.4 Disabled state

When a row's prerequisite is missing (e.g. Notifications toggles when OS push permission `!= granted`):
* Visually: 50% opacity on label and control.
* `accessibilityState={{ disabled: true }}`.
* Add a hint row directly below the disabled group: smaller 12 pt text in `palette.ash`, factual message ("Turn on system notifications to use these.").

---

## 18. Account management pattern (historical — no current account)

Authority: [ADR-0033](docs/adr/0033-account-deletion-and-export.md). Sign-out / Delete / Export flows live under Settings § 4 Account (per `docs/SETTINGS.md`).

### 18.1 Destructive button style

* Background: row default (`palette.hanji`).
* Label color: `palette.dancheong`.
* Press state: row darkens to `palette.dancheongLight` background.
* a11y: `accessibilityRole="button"` + `accessibilityHint="Dangerous action"`.
* Order rule: most-destructive last in section. Sign out → Export → Delete account (Delete is the deepest position to reduce accidental tap risk).

### 18.2 Confirm modal patterns

| Pattern | Buttons | Use |
|---|---|---|
| **Single confirm** | `Cancel` (primary) / `${verb}` (destructive) | Sign out, Remove photo |
| **Two-stage confirm** | First modal: scope warning. Second modal: final lock. | Delete account (per ADR-0033) — first warns about 30-day grace + email, second confirms commit. App Store reviewers test that delete is reachable but not accidentally tappable. |

Voice rules per MICROCOPY.md §6.4 — never `OK / Cancel`, always specific verbs.

### 18.3 Recovery surface

When a user signs back in within the 30-day deletion grace window:

* `useDeletionStatus` returns `pending` → full-screen modal (`accessibilityViewIsModal=true`):
  * Title: `Welcome back. Your account is scheduled for deletion in N days.` (24 pt, `palette.meok`).
  * Body: `Tap Cancel deletion to keep your byeongpung.`
  * Buttons: `Cancel deletion` (primary) / `Continue with deletion` (destructive, dismisses modal but keeps schedule).
* On `Cancel deletion`: clear `_meta.deletionRequestedAt`, toast `Account restored.` (the only celebratory restore-toast in the app).

### 18.4 Export confirmation

Single confirm modal: `Export your K-Journey data?` body `We'll email a ZIP with your byeongpung images, missions, buckets, and photos. Allow up to 10 minutes.` Buttons: `Cancel` / `Send to my email` (both primary; this is not destructive).

After confirm: T1 toast `Export queued. Check your email shortly.`

---

## 19. Permission primer (universal)

Authority: [ADR-0029](docs/adr/0029-push-copy-library-and-priming.md) (push origin). This pattern generalizes to camera and photo library permissions.

### 19.1 When to use

Any time the app needs to call `requestPermissionsAsync()` for the **first time** for a given OS permission. Never request cold. Run a priming card first.

### 19.2 Card layout

Full-screen modal (or full-bleed bottom sheet on Android), centered:

* **Icon** (top, 64×64 pt, `palette.meok` outline) — Lucide `Bell` for push, `Camera` for camera, `ImagePlus` for photos.
* **Title** (24 pt, `palette.meok`, sentence case): single sentence stating the benefit.
* **Body** (16 pt, `palette.meokMid`, ≤ 24 words): two lines explaining what the app will and will not do with the permission. Always include a "won't" — transparency builds trust.
* **Primary CTA**: `Allow ${permission}` (full-width, `palette.dancheong`).
* **Secondary CTA**: `Not now` (full-width text-only, `palette.ash`).

### 19.3 Per-permission copy

| Permission | Title | Body | Primary CTA |
|---|---|---|---|
| **Push notifications** | `Get reminders about milestones` | `We'll only ping you for big moments — D-30, D-14, D-7, phase changes, and panel unlocks. No daily reminders, ever.` | `Allow notifications` |
| **Camera** | `Use your camera to capture missions` | `We'll only open the camera when you tap "Add photo". Your camera roll stays private.` | `Allow camera` |
| **Photo library** | `Pick a photo for your mission` | `We'll only access photos you select. We don't browse your library.` | `Allow photos` |

### 19.4 Re-priming policy

* If the user taps `Not now`: store MMKV `priming:dismissed:${permission} = true`. Do **not** re-show the priming card. Cold OS prompt is also not triggered.
* If permission later becomes truly necessary (e.g. user taps "Add photo" after dismissing photo priming), surface T3 settings deep-link directly (`Open Settings` / `Not now`) — `docs/ERROR_MESSAGES.md` `permission-photos-denied` row.
* V2 (Settings → Notifications surface) may re-offer the toggle within Settings, but never via popup.

### 19.5 a11y

* `accessibilityViewIsModal={true}` on the priming card.
* Title and body are read together as one block: `${title}. ${body}.`
* Primary and secondary CTAs are buttons with `accessibilityRole="button"`.

---

## 20. Photo & sharing guidelines (local save/share only; upload is historical)

Authority for upload: [ADR-0034](docs/adr/0034-photo-upload-pipeline.md). Authority for sharing: deferred to ADR-0036 (V1.1 candidate); this section captures MVP visual rules.

### 20.1 Upload pipeline (visual handoff)

| Stage | Visible | Spec |
|---|---|---|
| Picker open | Native iOS/Android picker | `expo-image-picker` |
| Processing (~200 ms) | Skeleton card with shimmer in mission card | DESIGN.md §14.1 |
| Uploading | Inline progress bar in mission card (compact, 4 px height, `palette.dancheong` fill on `palette.hairline` track) | new primitive |
| Success | Photo renders in mission card with subtle 200 ms fade-in (skip if `useReduceMotion()=true`) | — |
| Failure | T2 modal `Couldn't upload photo` with `Try again` / `Skip photo` | ADR-0028 + ERROR_MESSAGES.md |

### 20.2 Compression / EXIF policy (recap of ADR-0034)

* Resize to 1920 px long edge, JPEG quality 0.85, sRGB color profile.
* Strip GPS EXIF (PII per GDPR + PIPA). Preserve capture timestamp + camera make/model.
* Maximum upload size: 2 MB (Storage Rules cap; client compression should produce 200–500 KB typical).

### 20.3 Mission card photo display

* Aspect ratio: 4:3 within mission card (crop with `resizeMode="cover"`).
* Border radius: 12 px (matches card radius).
* Long press → action sheet: `View full size` / `Replace photo` / `Remove photo` / `Report content` (last opens `mailto:support@kjourney.app`).

### 20.4 Gallery layout

* Grid: 3 columns on phone, 4 on tablet (responsive). Aspect ratio 1:1, gap 4 px.
* Tap → full-screen viewer with pinch-to-zoom and swipe-to-dismiss.
* Header: era-tinted byeongpung composed image at top, photos grid below.

### 20.5 Sharing payload (MVP minimal)

* iOS native share sheet (`Share` API).
* Asset: composed gallery PNG (1080 × 1920, vertical for Stories).
* Caption: pre-filled `My K-Journey — N missions, ${era} era` (user can edit).
* No watermark in MVP. V2 may consider a discreet seal (도장) in the corner.

---

## 21. Offline & sync conflict visuals (historical remote-sync design)

Authority: [ADR-0031](docs/adr/0031-offline-state-visibility.md).

### 21.1 Network indicator dot

* Position: top-right of home screen header (and any other top-level screen with a header).
* Size: 4 × 4 pt circle.
* Color: `palette.ash` (subtle — informative, not alarming).
* Visibility: shown iff `NetInfo.isConnected === false`. No animation.
* a11y: `accessibilityRole="text"`, `accessibilityLabel="Offline — your work is saved on this device"`.

### 21.2 Toast on transition

* `connected → disconnected`: T1 toast `No connection. Your work is saved on this device.` (4 s, dismissable, no Retry button — the dot persists).
* `disconnected → connected` **with pending writes**: T1 toast `Synced.` (4 s, the only positive-confirmation toast in the app).
* `disconnected → connected` **without pending writes**: silent.

### 21.3 No per-item pending badge

Mission cards, bucket items, and gallery photos render with **no visual difference** when offline. Optimistic UI is preserved — celebrations fire on tap regardless of network. The header dot is the only aggregate signal.

This is a deliberate brand choice — see ADR-0031 Notes. The data layer guarantees eventual consistency (ADR-0022 + Firestore offline persistence); UI adds zero per-item anxiety.

### 21.4 Sync conflict surface (rare)

* Mission conflicts: silent — `claimPanelUnlock` (ADR-0009) prevents duplicate celebrations.
* Bucket count decrease across foreground refresh: T1 toast `Updated from another device.` (4 s, dismissable).
* No other sync conflicts surface to the user.

### 21.5 Reduce-motion

The dot does not animate (no fade-in, no pulse). Toasts on transition use `accessibilityLiveRegion="polite"` for offline, `assertive` for the synced reconnect — VoiceOver users hear the good news.

---

*See also*: `docs/SETTINGS.md`, `docs/MICROCOPY.md`, `docs/ERROR_MESSAGES.md`, `docs/EMPTY_STATES.md`, `docs/PUSH_COPY.md`.
