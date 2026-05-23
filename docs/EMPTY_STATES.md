# Empty States — Per-Screen Specification

> Implementation guide for [ADR-0027](adr/0027-empty-state-pattern.md). Every "zero" state in K-Journey conforms to this spec. Voice rules: `MICROCOPY.md` §6.1, §6.3. Visual: `DESIGN.md` §14.

## The contract (recap from ADR-0027)

Every empty state is exactly three slots:

1. **Icon** — single Lucide glyph at 48×48 pt, tinted in the screen's category color, OR a single minhwa motif on brand-defining moments. No illustration, no photograph, no emoji.
2. **Message** — one factual sentence ≤ 9 words.
3. **CTA** — at most one. Omit when the next action requires leaving the screen.

Voice rules:
* Factual present-state, never blame.
* Projective when describing what the screen will become.
* No emotional escalation ("Oops!", "Sorry!", "🎉").

Composition target: a future `<EmptyState icon message cta? />` primitive in `src/components/ui/EmptyState.tsx`. Until that primitive lands, screen-level inline implementations follow this spec.

## Per-screen catalog

### 1. Home — mission list (zero completed)

This is the **most important** empty state in the app. The user just finished onboarding and is about to learn what K-Journey actually is.

| Slot | Value |
|---|---|
| Trigger | `aggregateCompletions(...) === 0` AND `phase === 1` |
| Icon | Lucide `Compass` at 48×48 pt, tinted `categoryColors.living` (`palette.cheong`) |
| Message | `Your first mission is below — start anywhere.` |
| CTA | (none — the missions themselves are the CTA, listed below) |
| Below the empty state | The Have-To mission list renders normally. The empty state is a header above the list, not a replacement for it. |
| `accessibilityLabel` | "Your journey starts here. Missions are listed below." |

**Why no button**: The missions list itself is the CTA. Adding a button above the list would be a duplicate "where to start" — bikeshed.

**Why `Compass`**: it tints in `cheong` (royal blue, the "living" category) — not `dancheong` (red is for action confirmations). Compass connotes orientation, not action.

### 2. Home — mission list (zero completed, post-arrival)

Distinct from §1 because the user has been in Korea but has not engaged. This is a re-engagement-flavored empty state.

| Slot | Value |
|---|---|
| Trigger | `aggregateCompletions(...) === 0` AND `phase >= 2` AND `arrival <= today` |
| Icon | Lucide `Sparkles` at 48×48 pt, tinted `palette.hwanggeum` |
| Message | `You're here — your first mission is below.` |
| CTA | (none) |
| Below | Phase-appropriate missions render normally |
| `accessibilityLabel` | "You've arrived. Missions are listed below." |

### 3. Bucket — list overview (zero buckets)

| Slot | Value |
|---|---|
| Trigger | `userBuckets.length === 0` |
| Icon | Lucide `BookmarkPlus` at 48×48 pt, tinted `palette.hwanggeum` |
| Message | `Make a bucket of things you want to remember.` |
| CTA | `Browse templates` (primary) → opens template gallery (6 cards from `src/data/bucketTemplates.ts`) |
| `accessibilityLabel` | "No buckets yet. Tap browse templates to start." |

**Why this exception to "no leaving-the-screen CTA"**: the template gallery is a **navigation push**, not a screen leave. The user remains in the bucket flow.

### 4. Bucket — single bucket detail (zero items)

| Slot | Value |
|---|---|
| Trigger | `bucket.items.length === 0` |
| Icon | Lucide `ListPlus` at 48×48 pt, tinted bucket's accent color |
| Message | `Add your first wish to this bucket.` |
| CTA | `Add a wish` (primary) → opens add-item flow inline |
| `accessibilityLabel` | "Empty bucket. Tap add a wish to start." |

### 5. Gallery — completed-mission gallery (zero photos)

| Slot | Value |
|---|---|
| Trigger | `completedMissionsWithPhotos.length === 0` |
| Icon | minhwa `chaekgeori` motif (책거리 — scholar's books, fitting for "collected memories"), 48×48 pt, `palette.meok` ink |
| Message | `Your gallery starts when you complete your first mission.` |
| CTA | (none — user must complete a mission elsewhere) |
| `accessibilityLabel` | "Gallery is empty. Complete missions to fill it." |

**Why minhwa motif here**: the gallery is a brand-defining moment (it is the artifact of the journey). Lucide would feel transactional.

### 6. Gallery — post-journey, zero photos

Edge case: user reached departure but never completed a mission. PRD §10.2 prompts a journey-complete CTA which the user can dismiss to land here.

| Slot | Value |
|---|---|
| Trigger | `phase === 4 && completedMissionsWithPhotos.length === 0 && today > departure` |
| Icon | minhwa `chaekgeori`, `palette.ash` (muted) |
| Message | `Your journey ended without saved memories.` |
| CTA | (none — the data is what it is) |
| `accessibilityLabel` | "Gallery is empty. The journey ended without saved memories." |

**Why no encouraging CTA**: false-cheer here would be cruel. State the fact.

### 7. Byeongpung — strip (zero panels revealed)

The byeongpung itself shows the unrevealed first-panel art at low opacity per ADR-0008 — that **is** the visual empty state. We do not overlay a copy block on the byeongpung. But the surrounding `Home` screen's progress text needs an empty form:

| Slot | Value |
|---|---|
| Trigger | `revealedPanels === 0` (no panels crossed the 6-completion threshold) |
| Icon | (none — the byeongpung art is the icon) |
| Message | `Complete missions to reveal your byeongpung (병풍).` |
| CTA | (none) |
| Placement | Caption text below the `<ByeongpungStrip />` component |
| `accessibilityLabel` | "Byeongpung — 0 of 8 panels revealed. Complete missions to reveal them." |

**Why the parenthetical**: byeongpung is a brand-defining proper noun and gets the Korean parenthetical on first mention per MICROCOPY.md §3.

### 8. Search — zero results

(MVP may not ship search, but if/when added the spec is locked here.)

| Slot | Value |
|---|---|
| Trigger | `query.length > 0 && results.length === 0` |
| Icon | Lucide `SearchX` at 48×48 pt, tinted `palette.ash` |
| Message | `No matches for "{query}".` |
| CTA | `Clear search` → resets the input |
| `accessibilityLabel` | `No results for {query}. Tap clear search to try again.` |

### 9. Universities — selection (zero matching filter)

| Slot | Value |
|---|---|
| Trigger | filter active, no university matches |
| Icon | Lucide `MapPinOff` at 48×48 pt, tinted `palette.ash` |
| Message | `No universities match this filter.` |
| CTA | `Clear filter` → resets filter |
| `accessibilityLabel` | "No universities match this filter. Tap clear filter to start over." |

### 10. Notifications inbox (V2 — placeholder)

(Not in MVP. Listed here so the V2 contributor doesn't reinvent the spec.)

| Slot | Value |
|---|---|
| Icon | Lucide `Bell` at 48×48 pt, `palette.ash` |
| Message | `No new pings. We'll let you know about milestones.` |
| CTA | (none) |

### 11. Buckets — template gallery (zero matching) — N/A

Templates are a hard-coded set of 6 (`src/data/bucketTemplates.ts`); cannot be empty. No empty-state needed.

### 12. Onboarding partial-resume — N/A

Onboarding has its own resumption flow (per project memory `project_phase_b_qa_pass_2026_05_06`); not an empty state, a different concern.

## Cross-cutting rules

* **Stay above the fold.** Empty-state slot stack should fit within the visible viewport on iPhone SE (smallest target). Icon (48 pt) + 16 pt gap + message (1 line) + 24 pt gap + optional CTA (44 pt) = ~132 pt total — well within budget.
* **Never share a screen with another empty state.** If two regions are empty (e.g. bucket list + bucket detail when the user lands fresh), only the **outermost** screen renders an empty state. Inner regions render nothing or a subtle skeleton placeholder.
* **Animations.** Empty states may use a one-time fade-in (200 ms ease-out) when the screen opens. No continuous motion. Reduce-motion respected (no fade if `useReduceMotion()` true).
* **Color tinting.** Icon tint follows the screen's category color where possible (categoryColors), never `dancheong` red (red is reserved for primary action confirmation). When no category context, use `palette.ash` (muted neutral).
* **Spacing.** 64 pt top gap from the screen's safe area; 48 pt bottom gap to next content. Center-aligned.

## Test plan

* Visual regression — one snapshot per row above, on light theme (MVP only).
* a11y — VoiceOver focuses the empty state's `accessibilityLabel` first when the screen is opened with zero data.
* Lint (future) — empty-state components must call the shared `<EmptyState />` primitive once it lands, not roll their own.
* Voice review — every message string passes MICROCOPY.md §8 checklist.

## Adding a new empty state

1. Add a row to the catalog above with all six fields.
2. Verify the message passes MICROCOPY.md §8.
3. Pick the icon: **Lucide first**, **minhwa motif only for brand moments** (gallery, byeongpung).
4. Decide CTA: is there an obvious next action *that does not require leaving this screen*? If yes, one CTA. If no, omit.
5. Add a snapshot test.

## Links

* **Authority ADR:** [ADR-0027](adr/0027-empty-state-pattern.md)
* **Voice rules:** `MICROCOPY.md`
* **Visual primitive:** `DESIGN.md` §14.2 (planned), `src/components/ui/EmptyState.tsx` (target)
* **Color tokens:** `design-tokens.ts` (categoryColors, palette)
* **Icons:** Lucide React Native (existing dependency); minhwa motifs in `src/components/byeongpung/motifs.tsx`
* **PRD:** `reference/K-Journey_PRD_v1_1_KR.md` §4.5 (new — Empty State policy)
