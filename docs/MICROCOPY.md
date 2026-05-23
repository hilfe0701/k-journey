# Microcopy & Voice Guidelines

> Single source of truth for the **words** in K-Journey's UI. Visual rules: `DESIGN.md`. Voice/tone authority: this file. Decision authority: [ADR-0018](adr/0018-english-first-korean-parenthetical.md), [ADR-0027](adr/0027-empty-state-pattern.md), [ADR-0028](adr/0028-error-recovery-retry-strategy.md), [ADR-0029](adr/0029-push-copy-library-and-priming.md).

## 1. Voice

K-Journey's voice is **warm authority** — a knowledgeable cultural guide who has lived in Korea for years and is glad you're here. Not a tour bus megaphone. Not a startup growth-hack copywriter. Not a life coach.

| Trait | Yes | No |
|---|---|---|
| Warm | "Your first week starts here." | "Welcome aboard! 🎉" |
| Authoritative | "Visit Gwangjang Market (광장시장) before 8 PM — that's when the food stalls peak." | "You should probably check out Gwangjang!" |
| Calm | "Phase 2 unlocked." | "BOOM 💥 You did it!" |
| Bilingual-aware | "Try Tteokbokki (떡볶이)" | "Try 떡볶이" |
| Reverent (of the culture) | "The 8-panel byeongpung was traditionally painted over a season." | "Cool Korean folding screen!" |

**Tone modulators**: vary tone by context.
* **Celebration moments** (panel unlock, phase transition, journey complete) — slightly elevated, never giddy.
* **Errors** — factual, non-blaming, action-oriented.
* **Empty states** — projective ("starts when…"), never apologetic.
* **Onboarding** — direct, brief, no marketing.

## 2. Anti-patterns (do not ship)

| Anti-pattern | Example to reject | Why |
|---|---|---|
| Self-deprecating cute copy | "Oops! Looks like nothing's here." | Erodes authority; clashes with brand. |
| Urgency-scare | "⚠️ Don't miss out!" | Off-brand; ADR-0015 prohibits manufactured urgency. |
| Emoji decoration | "Mission complete! 🎊✨" | CLAUDE.md NEVER #3 — minhwa motifs replace decorative emoji. |
| Marketing superlatives | "Discover the AMAZING flavors of Korea!" | Sounds like an ad; the byeongpung carries emotion, not adjectives. |
| Apology spirals | "We're so sorry, please forgive us, this shouldn't have happened…" | One sentence is enough; over-apologizing infantilizes the user. |
| All-caps emphasis | "DON'T FORGET TO COMPLETE PHASE 2" | CLAUDE.md NEVER #4 — only badge labels (11–12 px) use caps. |
| Korean-as-primary | "떡볶이 (Tteokbokki)" | ADR-0018: English first, Korean parenthetical. |
| Tech-jargon leaks | "Firestore sync failed" | The user does not know what Firestore is; say "Couldn't save." |

## 3. English-Korean pairing rules (extends ADR-0018)

**The rule:** English first. Korean only in parentheses, only for proper nouns the user benefits from recognizing in-place (food names, neighborhood names, market names, university names).

| Case | Format | Example |
|---|---|---|
| Food | `English (한글)` | `Bibimbap (비빔밥)` |
| Neighborhood | `English (한글)` | `Itaewon (이태원)` |
| Landmark | `English (한글)` | `Gwangjang Market (광장시장)` |
| University (long form) | `English` only | `Seoul National University` |
| University (display, alternate) | `English (한글)` for first mention | `Yonsei University (연세대학교)` |
| Person's name (rare in app) | `English (한글)` first mention only | `King Sejong (세종대왕)` |
| Generic verb / common noun | `English` only | `Visit`, `Try`, `Book`, `Photo` |
| Cultural artifact (decorative use) | `English (한글)` first mention | `Byeongpung (병풍)` |

**What never gets the parenthetical**: button labels, menu items, error messages, push notifications. Push payloads are English-only — no parentheticals on lock screens.

**Apostrophe / quote rule**: use straight quotes (`'` and `"`) in code; the renderer may transform to typographic quotes, but source strings are straight.

**Long-form vs short-form**: in lists, prefer the short form. Repeating `(한글)` in a 30-item list is visual noise. Show the parenthetical on first mention or on detail screens; omit in cards.

## 4. Sentence case (extends CLAUDE.md MUST #4)

All UI labels and body copy use **sentence case**. Korean follows natural Korean capitalization (no concept of case).

* ✅ "Mission complete"
* ✅ "Open the byeongpung"
* ❌ "Mission Complete" (title case)
* ❌ "MISSION COMPLETE" (caps — except in 11–12 px badge)

Headings (H1, H2) are **not** title case — they are sentence case too. Korean parenthetical uses Korean spacing (no extra space before `(`).

## 5. Length budgets

| Surface | Target | Max |
|---|---|---|
| Button label | ≤ 3 words | 5 words |
| Card title | ≤ 6 words | 9 words |
| Card body | ≤ 14 words | 20 words |
| Modal title | ≤ 5 words | 8 words |
| Modal body | ≤ 18 words | 30 words |
| Toast | ≤ 8 words | 12 words |
| Push title | ≤ 5 words | 30 chars (iOS lock-screen) |
| Push body | ≤ 14 words | 110 chars (iOS lock-screen) |
| Empty-state message | ≤ 9 words | 12 words |
| VoiceOver `accessibilityLabel` | ≤ 12 words | 20 words |

If you cannot fit a thought in budget, **the thought is too big**, not the budget too small. Refactor the thought.

## 6. Templates

### 6.1 Button labels

Verbs first. Reach for **specific** verbs over `OK`/`Done`/`Submit`.

| Context | Use | Avoid |
|---|---|---|
| Mission complete | `Mark complete` | `Done`, `OK` |
| Bucket save | `Save bucket` | `Save`, `Submit` |
| Photo add | `Add photo` | `Upload` (jargon) |
| Sign in | `Sign in with Apple` | `Continue` |
| Settings deep-link | `Open Settings` | `Settings`, `Go` |
| Retry after error | `Try again` | `Retry`, `OK` |
| Discard after error | `Discard` | `Cancel`, `No` |
| Dismiss empty state | (omit — no button) | "Dismiss", "X" |
| Phase tab | (phase name) | `Tab 2` |

### 6.2 Loading copy

Loading is a **state**, not a sentence. Prefer skeletons (per DESIGN.md §14.1) over spinners with text. When text is needed:

| Wait length | Pattern | Example |
|---|---|---|
| < 200 ms | Show no copy — skeleton or instant transition | — |
| 200 ms – 2 s | Skeleton only | — |
| 2 s – 5 s | Skeleton + small inline text | "Loading missions" (no ellipsis — pronouncible by VoiceOver) |
| > 5 s | Inline text + reassurance | "Still loading. This sometimes takes a moment on slow networks." |
| > 30 s | Treat as failure — surface T1 toast (ADR-0028) | — |

Never use "Please wait…" — it is patronizing and non-specific.

### 6.3 Celebration copy

Used at: mission complete (cardSink + inkRingOut), panel unlock (overlay), phase transition (banner), journey complete (full-screen).

| Moment | Title | Body | Notes |
|---|---|---|---|
| Mission complete (overlay text) | (none — cardSink animation only) | (none) | Text-free; choreography carries the meaning. |
| Panel unlock | `Panel {n} of 8 unlocked` | `Open the byeongpung to see your scroll grow.` | `n` literal, not "third"; matches push copy. |
| Phase 1→2 | `You've arrived` | `Phase 2 is unlocked. Your first week starts here.` | Past-tense framing — the user has already done it. |
| Phase 2→3 | `Settling in` | `Phase 3 missions are now in your home.` | Reflects the user's lived state. |
| Phase 3→4 | `Final stretch` | `Phase 4 — gather what you want to remember.` | Slightly bittersweet — by design. |
| Journey complete | `Your K-Journey is complete` | `Open your gallery to revisit the four months.` | Per CLAUDE.md NEVER #14 — never auto-switch; this is a prompt. |

### 6.4 Confirmation copy (destructive actions)

When the user might lose data: confirm with two buttons, primary = continue, destructive = the lossy action. Never `OK / Cancel`.

| Action | Title | Body | Primary | Destructive |
|---|---|---|---|---|
| Delete bucket | `Delete this bucket?` | `This will remove the bucket and its items.` | `Cancel` | `Delete bucket` |
| Sign out | `Sign out?` | `Your byeongpung stays. You can sign back in to continue.` | `Cancel` | `Sign out` |
| Clear photo | `Remove this photo?` | `The mission stays complete.` | `Cancel` | `Remove photo` |
| Reset onboarding (dev) | `Reset onboarding?` | `Local data will be cleared. Account stays.` | `Cancel` | `Reset` |

### 6.5 Form / input copy

* **Field label**: 1–3 words, sentence case, above the field.
* **Helper text**: below the field, optional, ≤ 12 words. Use to explain *why*, not *what*.
* **Error text**: replaces helper text on validation fail; specific to the rule violated.
* **Placeholder**: a real example, not the rule. ("Mar 15, 2026" not "Enter date").

| Bad | Good |
|---|---|
| `Date *` (placeholder: `Required`) | `Arrival date` (placeholder: `Mar 15, 2026`) |
| `Invalid input` | `Arrival date must be before departure date.` |
| `Field required` | `Pick an arrival date to continue.` |

## 7. Microcopy by surface (cheat sheet)

| Surface | Pattern | Reference |
|---|---|---|
| Empty state | Icon + 1 line + optional CTA | [ADR-0027](adr/0027-empty-state-pattern.md), `EMPTY_STATES.md` |
| Error toast (T1) | "{factual statement}." + Retry button | [ADR-0028](adr/0028-error-recovery-retry-strategy.md), `ERROR_MESSAGES.md` |
| Error modal (T2) | Title (≤ 5 words) + body (≤ 18 words) + Try again / Discard | [ADR-0028](adr/0028-error-recovery-retry-strategy.md) |
| Settings deep-link (T3) | Title + reason + `Open Settings` / `Not now` | [ADR-0028](adr/0028-error-recovery-retry-strategy.md) |
| App-level banner (T4) | Title + 1-tap action button | [ADR-0028](adr/0028-error-recovery-retry-strategy.md) |
| Push notification | Title (≤ 30 chars) + body (≤ 110 chars), no emoji, no time-of-day | [ADR-0029](adr/0029-push-copy-library-and-priming.md), `PUSH_COPY.md` |
| Permission priming | Title + 2-line reason + Allow / Not now | [ADR-0029](adr/0029-push-copy-library-and-priming.md) |
| Mission complete overlay | (text-free choreography; "Panel N unlocked" only after stage 4) | DESIGN.md §7.1 |

## 8. Voice review checklist

Run through this list before merging any PR that adds or changes user-facing strings.

- [ ] Sentence case (not title case, not caps)
- [ ] English first; Korean only in parentheses for proper nouns (ADR-0018)
- [ ] No emoji (CLAUDE.md NEVER #3)
- [ ] No "Oops!", "Sorry!", "Whoops!", "Yay!" — no emotional escalation
- [ ] No "Please wait…", "Just a moment…", "Hang on…" — no patronizing copy
- [ ] No tech jargon ("Firestore", "JWT", "MMKV") — use product language
- [ ] No urgency-scare ("Don't miss out!", "Last chance!") — ADR-0015 anti-pattern
- [ ] Length within budget for surface (§5)
- [ ] Buttons are specific verbs ("Save bucket", not "Save")
- [ ] Errors are factual, not apologetic
- [ ] Empty states project the future ("starts when…"), not blame the present
- [ ] Strings are not assembled from variables in ways that break sentence integrity (use template literals with full sentences, not `${a} + ${b} + ".".`)

## 9. Localization-readiness (forward-looking)

K-Journey is English-only at MVP (PRD §11.7). When localization arrives, every string in this guide becomes a key with a default English value:

```ts
// future shape
copy.button.markComplete // "Mark complete" / "완료 표시"
copy.empty.home          // "No missions completed yet" / "아직 완료한 미션이 없어요"
```

Today, all strings live as inline literals in components or in catalog modules (`src/lib/notifications/copy.ts`, `src/lib/errorAlert.ts`'s message map). The catalog modules are already i18n-shaped. Migrating the inline literals later is a mechanical refactor — but **avoid string concatenation today** because that pattern doesn't translate.

## Links

* **Authority ADRs:** [ADR-0018](adr/0018-english-first-korean-parenthetical.md), [ADR-0027](adr/0027-empty-state-pattern.md), [ADR-0028](adr/0028-error-recovery-retry-strategy.md), [ADR-0029](adr/0029-push-copy-library-and-priming.md)
* **Visual system:** `DESIGN.md` (esp. §1, §11, §14, §17)
* **Project rules:** `CLAUDE.md` MUST #4, NEVER #3, NEVER #4
* **Sister docs:** `ERROR_MESSAGES.md`, `EMPTY_STATES.md`, `PUSH_COPY.md`
* **PRD:** `reference/K-Journey_PRD_v1_1_KR.md` §11.7 (English-first commitment)
