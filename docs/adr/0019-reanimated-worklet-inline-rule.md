# 0019. Reanimated worklet inline-only rule

* **Status:** accepted (retroactive)
* **Date:** 2026-05-05 (decision after a crash incident) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `animation`, `worklets`, `gotcha`

## Context and Problem Statement

Reanimated 3's `useAnimatedStyle` (and related hooks) runs on the UI thread via worklets — JavaScript code marked with the `"worklet"` directive. The Babel plugin auto-worklets the *callback passed inline* to these hooks, but **does not** worklet a function returned from a factory that's then passed in.

Concrete incident (during Phase B): a teammate refactored a `useAnimatedStyle` callback into a `makeAnimatedStyle()` factory that captured a closure. Babel did not worklet the factory's return value. Runtime crash on the UI thread the moment the animation hooked up. The crash was non-obvious because the JS thread reported nothing — only Reanimated's worklet runtime panicked.

## Decision Drivers

* Crashes from worklet boundary violations are obscure to debug.
* The team's "vibe coding" pace makes this exact refactor likely to recur.
* Documenting the rule prevents the same incident.

## Considered Options

1. **Hard rule: `useAnimatedStyle` callback must be an inline arrow at the call site** (chosen)
2. **Use `'worklet';` directive manually on factory-returned functions**
3. **Avoid factories — accept callback duplication**

## Decision Outcome

**Chosen:** Hard rule. `useAnimatedStyle(() => ({ ... }))` only — never `useAnimatedStyle(makeStyle())`. If style logic must be reused, extract the *values* as worklet helpers (`'worklet';` directive) but compose them inside the inline callback.

### Positive Consequences
* No repeat of the crash.
* Inline callbacks are also where Babel's optimisation works best.
* Code review can check for this with a quick visual scan.

### Negative Consequences
* Some duplication if the same animated style is reused across components (acceptable at K-Journey scale).
* Worklets remain a sharp tool — this ADR addresses one specific gotcha but does not exhaust them.

### Reversibility
The rule can evolve as Reanimated tooling improves. Currently inline-only is the safest expression.

## Pros and Cons of the Options

### Inline arrow only
* **+** Babel auto-worklets correctly.
* **+** Simple rule.
* **−** Some duplication.

### Manual `'worklet';` directive
* **+** Allows factories.
* **−** Easy to forget; the bug already happened once.

### No factories
* **+** Worst-case duplication only.
* **−** Same as inline-only but less clearly named.

## Links

* **Memory:** `feedback_reanimated_worklet.md`
* **Project rules:** *follow-up*: CLAUDE.md should add this as MUST item (currently implicit via the memory).
* **Code:** every `useAnimatedStyle` call site — `src/components/mission/MissionCompleteOverlay.tsx`, byeongpung animation in `src/components/byeongpung/ByeongpungStrip.tsx`
* **External:** [Reanimated worklets](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/worklets/)
