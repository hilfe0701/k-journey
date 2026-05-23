# 0030. Haptics & sound feedback policy

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `ux`, `haptics`, `sound`, `accessibility`, `motion`

## Context and Problem Statement

K-Journey's brand voice (DESIGN.md §1) is **calm, deliberate, reverent** — the opposite of an arcade game. But "calm" is not the same as "silent". The mission-complete choreography (DESIGN.md §7.1) carries the brand's emotional peak; users who have just completed a meaningful real-world action (going to a market, eating bibimbap for the first time, attending a class) deserve a tactile confirmation that the app registered the moment.

Today there is **no haptic call** anywhere in the codebase. There is also no sound asset — and the team has not decided whether MVP should include sounds. Without a decision, two failure modes:

1. **Silent first impression.** The mission-complete moment, panel-unlock celebration, and destructive-action confirmations all feel "weightless" — the user wonders if the action registered.
2. **Inconsistent additions over time.** Without an explicit policy, future PRs will sprinkle `Haptics.impactAsync(Heavy)` or `Sound.play('chime.mp3')` ad-hoc. The brand voice degrades into another "buzzy" lifestyle app.

This ADR locks the policy in both directions: which moments **get** feedback, and which moments **must not**.

## Decision Drivers

* Brand voice: tactile feedback should feel like a soft seal-stamp pressing into hanji, never like a slot machine.
* Reduce-motion accessibility users (ADR-0025 §11.6, `useReduceMotion()`) typically also want reduced haptics — not zero, but downgraded.
* Sound is binary at the platform level (the app is "loud" or it isn't). MVP shipping with no sound is the safer default.
* Battery and OS jank: aggressive haptic patterns drain battery and can stutter on low-end Android.
* Test surface: every haptic call site needs a code path that respects user OS settings (Settings → Accessibility → Reduce Motion / Haptic feedback off).

## Considered Options

1. **3-moment haptic policy + no sound MVP** (chosen)
2. **Full haptic + sound suite** — chime on mission complete, swoosh on panel unlock, etc.
3. **No haptic, no sound MVP** — pure visual brand
4. **Haptics on every interaction** — Material Design baseline

## Decision Outcome

**Chosen:** Haptics fire at exactly **three moments**, using `expo-haptics`. Sound is **not** used at MVP.

### Haptic moments

| Moment | API call | Reason |
|---|---|---|
| **Panel unlock** | `Haptics.notificationAsync(NotificationFeedbackType.Success)` | Brand-defining moment — the "seal-stamp" feel. Fires from inside `firePanelUnlock` after `claimPanelUnlock(n) === true` (ADR-0009). |
| **Mission complete (stage 2 inkRingOut, ~400 ms after tap)** | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` | Subtle confirmation that the tap registered, timed to the visual ink-ring. Light intensity, never Heavy. |
| **Destructive confirm (Delete bucket / Sign out / Remove photo)** | `Haptics.notificationAsync(NotificationFeedbackType.Warning)` | Warning level — the user is about to lose data. Fires when the destructive button is tapped, before the action commits. |

### What does NOT fire haptics

* Empty state appearance (no event)
* Toast/modal dismiss
* Tab switch, scroll, swipe
* Phase transitions (visual + push only — no haptic)
* Era selection in onboarding
* Photo capture / upload start
* Button presses in general
* OS push notification arrival (OS handles this)

### Sound

* MVP ships with **zero audio assets**.
* No background music, no chime on success, no error tone.
* The OS push-notification sound is the **only** audio the user hears, and it follows their device-level notification sound preference (out of our control).
* V2 may consider a single ink-brush stroke sound on panel unlock — explicit ADR amendment required.

### Reduce-motion / accessibility downgrade

When `AccessibilityInfo.isReduceMotionEnabled() === true`:

| Moment | Default haptic | Reduced |
|---|---|---|
| Panel unlock | `Success` | `impactAsync(Light)` (down 1 step) |
| Mission complete | `impactAsync(Light)` | (none) |
| Destructive confirm | `Warning` | `Warning` (kept — safety-critical) |

The destructive-confirm haptic is **kept** even under reduce-motion — losing data is more annoying than losing one haptic event, and a user who silenced motion likely values warning signals.

When iOS Settings → Sounds & Haptics → System Haptics is OFF, all three calls become silent OS-side. We do not need code to detect this.

### Implementation surface

Single helper module `src/lib/haptics.ts` exporting:

```ts
export function hapticPanelUnlock(): void
export function hapticMissionComplete(): void
export function hapticDestructiveConfirm(): void
```

Each helper internally checks `useReduceMotion()` (or its imperative equivalent) and downgrades. **No call site calls `expo-haptics` directly** — drift prevention identical to the push-copy / error-copy pattern.

### Positive Consequences
* Brand voice preserved — three calm seal-presses, not a buzz fest.
* Single helper module = single review surface for any haptic change.
* Reduce-motion respect is automatic — call sites don't need to know.
* Zero audio assets = zero asset bundle weight, zero licensing risk.

### Negative Consequences
* Some users may expect a sound on mission complete — they get silence. This is a brand bet.
* Three call sites total — small surface, easy to forget the helper convention. Mitigated by Jest assertion: no `expo-haptics` import outside `src/lib/haptics.ts` (lint rule).
* Sound deferral means the panel-unlock moment relies on visual + haptic only. Acceptable for MVP — V2 can revisit with user data.

### Reversibility

Reversible — three call sites, one helper module. Adding sound later is additive (new module + assets + ADR amendment). Removing all haptics is `useEffect`-free, no lock-in.

## Pros and Cons of the Options

### 3-moment haptic + no sound (chosen)
* **+** Brand-coherent, minimal surface.
* **+** Reduce-motion respect baked in.
* **+** Zero audio asset complexity.
* **−** Some users expect sound — brand bet.

### Full haptic + sound suite
* **+** "Premium" feel.
* **−** Off-brand (calm vs buzzy).
* **−** Asset bundle weight, licensing.
* **−** Battery and jank risk.

### No haptic, no sound
* **+** Maximum minimalism.
* **−** Mission-complete moment loses its emotional peak — visual alone is too thin.

### Haptic everywhere
* **+** OS feel.
* **−** Anti-brand. Habituates the user; the panel-unlock moment loses its uniqueness.

## Test plan

* Unit (`__tests__/haptics.test.ts`): every helper calls the right `expo-haptics` API; `useReduceMotion=true` produces downgraded calls per the table.
* Lint: a future ESLint rule rejects `expo-haptics` imports outside `src/lib/haptics.ts`.
* Manual QA: mission complete → faint Light tap. Panel unlock → distinct Success bump. Delete bucket → warning Warning bump. Reduce Motion ON → mission complete silent, panel unlock downgraded to Light, delete still Warning.
* Manual QA: device-level Haptics OFF (iOS Settings → Sounds & Haptics) → all three silent. App must not crash, log, or visually indicate the silence.

## Migration plan

This ADR is forward-looking — `src/lib/haptics.ts` does not exist today. No call site invokes `expo-haptics`. PRs:

1. **PR-A — Helper module:** ship `src/lib/haptics.ts` exporting the three helpers + reduce-motion downgrade.
2. **PR-B — Call site wiring:** insert `hapticPanelUnlock()` into `firePanelUnlock` (`src/lib/notifications.ts`), `hapticMissionComplete()` into the mission-complete tap handler (`app/mission/[id].tsx`), `hapticDestructiveConfirm()` into the three destructive `Alert.alert` callbacks.
3. **PR-C — Lint rule:** ESLint rule forbidding `expo-haptics` imports outside `src/lib/haptics.ts`.

## Links

* **PRD:** §11.13 (new — haptics·offline·photo bundle pointer)
* **Project rules:** none new (haptics is opt-in, not a CLAUDE.md MUST)
* **Related ADRs:** [ADR-0009](0009-single-fire-panel-unlock.md) (panel unlock fire condition), [ADR-0019](0019-reanimated-worklet-inline-rule.md) (motion / reduce-motion related), [ADR-0025](0025-accessibility-wcag-2-1-aa.md) (Reduce Motion respect), [ADR-0027](0027-empty-state-pattern.md) (no haptic on empty state)
* **Code (target):** `src/lib/haptics.ts` (new), `src/lib/notifications.ts` (caller), `app/mission/[id].tsx` (caller), destructive Alert call sites
* **External:** [Apple HIG — Haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics), [expo-haptics docs](https://docs.expo.dev/versions/latest/sdk/haptics/)

## Notes

The choice of `Light` over `Medium` for mission-complete is deliberate — `Medium` reads as "achievement", `Light` reads as "noted". Mission completion is supposed to feel quiet. Panel unlock is the moment that should feel like an event.

The choice of `Warning` for destructive confirm — instead of a heavier `Error` — is because the user has not yet **made** the destructive action; they're being warned. Using `Error` would feel like blame.

If MVP user testing shows mission completion feels too thin without sound, the V2 amendment path is a single ink-brush stroke (200–400 ms) on panel unlock only. Mission complete stays haptic-only.
