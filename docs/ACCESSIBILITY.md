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

## Contrast token notes

- `palette.stone` was darkened for AA body-text use on hanji.
- `palette.hwanggeum` remains a decorative/icon color; use `hwanggeumDeep` or primary text for small copy.
- Disabled state still needs readable labels; opacity alone is insufficient.

## Verification matrix

Test all four tabs, Journey mode switch, one available/blocked/review/completed task, mission detail, bucket create/detail, all byeongpung states, Settings pickers, export, deletion confirmation, official links, and emergency calls on web keyboard plus one native screen reader.
