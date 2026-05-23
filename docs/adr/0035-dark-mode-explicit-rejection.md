# 0035. Dark mode explicit rejection (MVP)

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `design-system`, `dark-mode`, `brand`, `mvp`

## Context and Problem Statement

DESIGN.md §15 documents that K-Journey does not support dark mode in MVP. The text reads, in full:

> **Not supported in MVP.** The hanji-paper light theme is the brand's defensible aesthetic. If iOS dark-mode preference triggers a system-wide color shift, K-Journey ignores it (`userInterfaceStyle: 'light'` in `app.json`).
> 
> V2.0 may consider an **ink night** variant (deep `meok` + warm `hwanggeum`) but that's an explicit product decision, not a free system follower. No half-way implementation.

That's a sound paragraph. But it's **not an ADR**. It lives in the design system file as one of fifteen sections. It can be edited, missed, or relitigated by a designer who wonders "why don't we have dark mode?" three months from now. Two failure modes:

1. **Drift via PR**: a future contributor ships partial dark-mode support (e.g. a dark Settings screen) "for nights", because no ADR explicitly forbids it. The brand fragments.
2. **Pressure during launch**: a stakeholder reads the §15 paragraph as soft preference, not policy, and asks "can we just enable system-follow?" the week before App Store submission. Without an ADR, the conversation has no anchor.

The 26 + 6 (Wave 2) ADRs already exist for far smaller decisions. Dark mode — a system-spanning theme question that touches every component, every era, every byeongpung panel — deserves an ADR.

## Decision Drivers

* The hanji-paper aesthetic is the brand's **visual identifier** — a moodboard differentiator vs every other lifestyle app.
* The 24 byeongpung panel PNGs (3 eras × 8 panels per ADR-0008) are **painted on hanji backgrounds**. Inverting them to a dark surround would require either re-painting (massive cost) or a solid dark frame around each panel (jarring).
* Era theming (`src/theme/eras.ts`) — joseon ink, silla gold, goryeo celadon — is calibrated for warm hanji. Inverting these palettes is not a matrix operation; it is a fresh color study.
* iOS `userInterfaceStyle: 'light'` in `app.json` already locks the system following. A drift-PR would have to flip this constant *and* re-tint every component.
* WCAG 2.1 AA contrast ratios (ADR-0025) have been verified on the light theme. Re-verification on a dark theme is a meaningful test surface.

## Considered Options

1. **Reject dark mode for MVP — explicit ADR, force light** (chosen)
2. **Auto-follow system dark mode with current tokens** — let the OS theme our tokens
3. **Ship a partial dark mode** — Settings + Sign-in dark, Home/Gallery light
4. **Build an ink-night variant for V1.0** — full second theme

## Decision Outcome

**Chosen:** K-Journey **explicitly rejects** dark mode for MVP. `userInterfaceStyle: 'light'` in `app.json` is the technical lock; this ADR is the policy lock.

### What this means in practice

* `app.json` sets `expo.userInterfaceStyle: 'light'` for both iOS (`ios.userInterfaceStyle`) and Android (`android.userInterfaceStyle` if applicable). Already the case as of 2026-05-14.
* No `useColorScheme()` calls in the codebase. (A lint rule is acceptable to enforce — see Test plan.)
* No `colorScheme === 'dark'` branches anywhere.
* No `_light` / `_dark` token variants in `design-tokens.ts`. The single token set is the only set.
* The byeongpung PNGs and the era themes ship light-only.

### What user-facing copy says

If a user with iOS Dark Mode enabled opens K-Journey:

* They see the light hanji theme regardless of their OS preference.
* The app **does not surface a "use light mode?" prompt** — no friction. The OS-level setting is silently overridden by `userInterfaceStyle: 'light'`.
* If a user contacts support asking for dark mode, the standard response is: "We're a light-theme app for V1 — the hanji aesthetic is core to the experience. We're considering an ink-night variant for V2 but no timeline."

### V2.0 amendment path

This ADR can be superseded by ADR-NNNN ("Dark mode V2 — ink night variant") once **all** of the following hold:

1. Designer commits to an ink-night palette (obangsaek inverse + `hwanggeum` warm gold dark variant).
2. All 24 byeongpung panel PNGs are re-painted (or the framing problem is solved with a dark border that doesn't fight the painting).
3. Era themes are re-tuned for dark backgrounds.
4. WCAG 2.1 AA contrast verified on dark theme.
5. `useColorScheme()` rollout PR + token bifurcation PR + per-component sweep PR all sized.

This is intentionally a **high bar**. Dark mode is a project, not a feature flag.

### Positive Consequences
* Stakeholder pressure has an anchor — "see ADR-0035, we decided this".
* Designers and engineers waste no time speculating dark token palettes.
* App Store review is unambiguous — we declare light-only.
* Brand voice stays coherent.

### Negative Consequences
* Some users with strong dark-mode preference may feel friction. Mitigated by the brand promise (this is a 4-month memento, not a daily utility).
* If a competitor ships dark mode and K-Journey is reviewed alongside, "no dark mode" is a checklist disadvantage. Accepted — the brand differentiation outweighs.
* App-wide light forcing means any future system-wide UI element that **expects** dark theming (e.g. an OS-provided activity indicator) may look slightly off in dark-OS environments. None observed in current build.

### Reversibility

Reversible via the V2 amendment path above. The technical reversal is one constant flip + token + theme + asset work. The policy reversal is a new ADR superseding this one.

## Pros and Cons of the Options

### Reject dark mode (explicit ADR, chosen)
* **+** Brand-coherent.
* **+** Anchors against drift PRs.
* **+** Zero engineering cost for MVP.
* **−** Some user friction for dark-OS users.

### Auto-follow with current tokens
* **+** Zero work.
* **−** Hanji yellow on dark background is illegible. All copy contrast breaks. Byeongpung panels look like portraits with bright frames around dark walls.

### Partial dark mode (Settings + Sign-in)
* **+** Compromise.
* **−** Inconsistency is worse than either choice. Users see dark Settings → home → light → "is this a bug?"

### Full V1 dark mode
* **+** "Modern" feel.
* **−** Massive scope: 24 PNG re-paints + era re-tuning + WCAG re-verification + token bifurcation + component sweep. Doubles the design-system surface for marginal V1 differentiation.

## Test plan

* Lint: ESLint rule rejecting `useColorScheme` import in `src/`. (Optional V1.1; not blocking MVP.)
* Manual QA: enable iOS Dark Mode → open K-Journey → confirm hanji theme renders. Toggle off → confirm no visual difference.
* Manual QA: same on Android (Material You / dark theme system setting).
* App Store / Play Store metadata: review form ("Does your app support dark mode?") — answer **No**.

## Implementation status

This ADR is **descriptive of current state**, not forward-looking. No code change required at issue time.

1. **PR-A — Asset audit:** confirm `app.json` has `userInterfaceStyle: 'light'` for both platforms (already true as of 2026-05-14).
2. **PR-B — Lint guard (optional, V1.1):** ESLint rule preventing `useColorScheme` imports.
3. **No PR for the byeongpung / era theming** — they were always light, ADR just records that.

## Links

* **PRD:** §13.2 (V2.0 plan — updated to cite this ADR), §11.6 (a11y — dark mode is **not** an a11y requirement; high-contrast-mode adapters are tracked separately under ADR-0025)
* **Project rules:** none new
* **Related ADRs:** [ADR-0008](0008-byeongpung-png-not-svg.md) (PNG panels would need re-painting for dark variant), [ADR-0017](0017-design-token-only-colors.md) (single token set), [ADR-0025](0025-accessibility-wcag-2-1-aa.md) (contrast verified light-only)
* **DESIGN.md:** §15 (paragraph that this ADR formalizes — keep §15 as a pointer)
* **Code:** `app.json` (`expo.userInterfaceStyle: 'light'`)
* **External:** [iOS userInterfaceStyle](https://docs.expo.dev/versions/latest/config/app/#userinterfacestyle), [WCAG 2.1 contrast verification methodology](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Notes

The decision to write this ADR — for what is essentially a "no" — is itself the point. ADRs catch the decisions that *seem* obvious until you're three months in and a stakeholder asks "wait, why didn't we?" The §15 paragraph is the lyrics; this ADR is the legally-binding contract.

If a future product moment produces strong evidence for dark mode (e.g. user research with N > 50 saying "I'd open the app at night more often if it were dark"), the V2 amendment path is open. The bar is **evidence**, not preference.
