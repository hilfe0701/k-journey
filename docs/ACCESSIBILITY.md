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

## Four React Native Web gaps this app has to work around

All of them are silent — the native build is correct and the code reads
correctly, so none shows up without opening a browser. Re-check them after any
RNW upgrade.

1. **`accessibilityState` is dropped by RNW's `Pressable`.** Only
   `TouchableWithoutFeedback` reads it, so `accessibilityState={{ selected }}`
   emits no `aria-selected`. Use `a11yState()` from `src/lib/a11y.ts`, which
   emits both dialects, on every selectable, checkable, or expandable control.
2. **`hitSlop` does not exist on web.** It is absent from RNW's `Pressable`, so a
   24pt icon with `hitSlop={8}` is a 24×24 target in a browser. Icon-only
   controls must use `IconButton` (`src/components/ui/IconButton.tsx`), which
   lays down a real 44×44 box; never rely on `hitSlop` to reach the minimum.
   Text links are the same problem in a different shape: a one-line URL is 17px
   tall, so an official-source link needs `minHeight: MIN_TARGET` of its own —
   the 44pt row *around* it is not the target.
3. **`aria-hidden` does not remove anything from the tab order.** The tab
   screens hid their inactive selves from the accessibility tree correctly, and
   keyboard focus still walked straight into them: on Byeongpung the tree
   exposed six controls while Tab reached "Emergency guide", the
   Essentials/Culture switch, and the Journey task list — focus landing inside
   an `aria-hidden` subtree, which announces nothing. Root views of tab screens
   spread `useInactiveScreen()` (`src/lib/inactiveScreen.ts`), which adds the
   `inert` attribute on web; `inert` is what removes focus, hit-testing, and the
   accessibility tree together.
4. **`Alert` is an empty function.** RNW ships
   `class Alert { static alert() {} }`, so every confirmation and blocking
   error was invisible on web — including "Delete all local data", which made
   the only local-erase control unusable in a browser, and the T2/T3 tiers of
   the error catalog, which made failed mutations look like no-ops. Use
   `showAlert()` from `src/lib/alert.ts`; `AlertHost` renders it as a real
   `alertdialog`, with `window.confirm` as the fallback if no host is mounted.

RNW also resets `outline` to none on every `Pressable`, which is why
`installWebFocusRing()` runs from the root layout.

## Verifying the first three global rules

```
npm run build:web && npm run audit:a11y
```

`scripts/a11y-audit.mjs` serves `dist/` with the production catch-all rewrite,
seeds a completed local profile, sweeps every route at 390×844 and 1440×900,
and exits non-zero on an undersized target, an unnamed control, a stateful role
with no state, horizontal page overflow, an uncaught error, or a Tab stop
inside an inactive tab screen. Chromium comes from
`npx playwright install chromium`.

The same checks by hand — run this in the browser console on a route. It should
return empty arrays.

```js
const sel = '[role="button"],[role="link"],[role="tab"],[role="radio"],[role="checkbox"],[role="switch"],[tabindex="0"]';
const c = [...document.querySelectorAll(sel)]
  .filter(e => !e.closest('[aria-hidden="true"]') && !e.closest('[inert]'));
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
