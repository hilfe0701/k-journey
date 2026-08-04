# Accessibility acceptance

Target: WCAG 2.1 AA for web and equivalent VoiceOver/TalkBack behavior on native.

## Global rules

- Interactive targets are at least 44×44pt including hit area.
- Body text contrast is at least 4.5:1; large text and non-text controls at least 3:1.
- `Text` roles `hero` through `h4` expose heading semantics.
- Icon-only controls have names; toggles, tabs, disclosure controls, and progress bars expose role/state/value.
- Color is never the only task, lock, completion, or review signal.
- Reduce Motion avoids decorative transitions and preserves the final state.
- Text at 200% does not clip essential copy or controls.

## Integrated product

- Essentials/Culture is announced as one mutually exclusive choice with selected state.
- Inactive tabs are detached or hidden from the accessibility tree.
- Screen focus moves to a meaningful title after navigation.
- Missing facts are announced as “Unknown / not sure,” not as failure.
- Task state includes readable reason, unlock condition, and actionable official source.
- Byeongpung progress announces total out of 48, completed panels out of 8, and the next requirement.
- Locked artwork has equivalent text and is not announced as complete.
- Save/share buttons expose disabled state and reason.

## Web keyboard/focus

- Tab order follows visual order and never enters an inactive screen.
- Enter/Space activates buttons and choices.
- Escape closes modal sheets where supported.
- Every actionable element has a visible focus indicator with at least 3:1 contrast.
- Direct route refresh does not shift focus to an unrelated splash/home page.

## Two React Native Web gaps this app has to work around

Both are silent — the native build is correct and the code reads correctly, so
neither shows up without opening a browser. Re-check them after any RNW upgrade.

1. **`accessibilityState` is dropped by RNW's `Pressable`.** Only
   `TouchableWithoutFeedback` reads it, so `accessibilityState={{ selected }}`
   emits no `aria-selected`. Use `a11yState()` from `src/lib/a11y.ts`, which
   emits both dialects, on every selectable, checkable, or expandable control.
2. **`hitSlop` does not exist on web.** It is absent from RNW's `Pressable`, so a
   24pt icon with `hitSlop={8}` is a 24×24 target in a browser. Icon-only
   controls must use `IconButton` (`src/components/ui/IconButton.tsx`), which
   lays down a real 44×44 box; never rely on `hitSlop` to reach the minimum.

RNW also resets `outline` to none on every `Pressable`, which is why
`installWebFocusRing()` runs from the root layout.

## Verifying the first three global rules

Run this in the browser console on each route. It should return empty arrays.

```js
const sel = '[role="button"],[role="link"],[role="tab"],[role="radio"],[role="checkbox"],[role="switch"],[tabindex="0"]';
const c = [...document.querySelectorAll(sel)].filter(e => !e.closest('[aria-hidden="true"]'));
({
  // under the 44pt minimum
  small: c.filter(e => { const r = e.getBoundingClientRect();
    return r.height > 0 && (r.height < 44 || r.width < 44); }),
  // icon-only control with no accessible name
  unnamed: c.filter(e => !e.getAttribute('aria-label') && !e.innerText.trim()),
  // stateful role that never announces its state
  stateless: c.filter(e => {
    const r = e.getAttribute('role');
    if (r === 'tab' || r === 'radio') return e.getAttribute('aria-selected') === null;
    if (r === 'checkbox' || r === 'switch') return e.getAttribute('aria-checked') === null;
    return false;
  }),
})
```

## Contrast token notes

- `palette.stone` was darkened for AA body-text use on hanji.
- `palette.hwanggeum` remains a decorative/icon color; use `hwanggeumDeep` or primary text for small copy.
- Disabled state still needs readable labels; opacity alone is insufficient.

## Verification matrix

Test all four tabs, Journey mode switch, one available/blocked/review/completed task, mission detail, bucket create/detail, all byeongpung states, Settings pickers, export, deletion confirmation, official links, and emergency calls on web keyboard plus one native screen reader.
