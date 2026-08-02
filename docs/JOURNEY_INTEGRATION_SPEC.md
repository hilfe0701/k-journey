# Journey integration specification

> Current implementation companion to PRD v2.0 and `DEC-040`.

## Product axes

| Axis | User question | State owner | Contributes to byeongpung |
|---|---|---|---|
| Essentials | What must I do to stay administratively ready? | condition rules + task status | No |
| Culture | What can I experience in this phase? | completed mission IDs | Yes |
| Want to | What do I personally want to do? | buckets and item checks | Yes |
| Byeongpung | What has my journey become? | derived aggregate | Read-only result |

Administrative completion is intentionally excluded from the artwork loop. Mixing it in would turn required compliance work into a game mechanic and make the 48-moment promise unstable when checklist rules change.

## Navigation contract

- `Journey` is the first tab and remembers the local `Essentials / Culture` choice.
- Essentials is the first-run default.
- Byeongpung and Want to are first-class tabs, not rows hidden in More.
- Gallery and Campus remain secondary destinations under More.
- A detail screen must return to the initiating surface without losing the selected mode or phase.

## First-screen hierarchy

### Essentials

1. Journey mode switch
2. One consolidated dates/setup prompt when dates are missing
3. Current available action
4. Review-required and blocked groups

### Culture

1. Journey mode switch
2. Compact byeongpung progress
3. Current phase and `Start here` mission
4. Remaining mission list

### Byeongpung

1. Total progress and next unlock
2. Eight-panel physical screen
3. Save/share actions only when meaningful

### Want to

1. Existing lists or clear creation CTA
2. Image-led template choices
3. Explanation that checked items reveal the same byeongpung

## Shared completion contract

```text
cultureTotal = completedMissionIds.length + checkedBucketItemCount
panelProgress(i) = clamp((cultureTotal - i * 6) / 6, 0, 1)
completedPanels = floor(min(cultureTotal, 48) / 6)
```

- `i` is zero-based from 0 to 7.
- Values above 48 remain completed but do not create a ninth panel.
- Undoing an item may reduce reveal. The UI must not claim a panel is permanently earned.
- Era switching changes artwork only; it does not change totals.

## Empty and unknown states

- Unknown facts are not errors and are never guessed.
- A screen uses at most one primary setup prompt for the same missing cause.
- Empty-state copy contains: what is empty, why it matters, and one next action.
- Hidden or inactive tab content must be removed from the web accessibility tree.

## Responsive contract

- Native phones use the available width.
- Web content is centered in a maximum 760px paper-like shell.
- Cards do not stretch into dashboard-sized slabs on desktop.
- The eight-panel artwork remains one visual object; it may horizontally scroll on narrow screens but must not wrap into unrelated rows.
