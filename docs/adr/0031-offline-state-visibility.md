# 0031. Offline state visibility & sync conflict resolution

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `offline`, `sync`, `ux`, `network`, `firestore`

## Context and Problem Statement

K-Journey users go offline regularly. They open the app on the subway, in cafés with weak Wi-Fi, in flight to and from Korea. The app already handles offline writes correctly at the **data layer** — Firestore offline persistence (default-on per RN-Firebase) queues writes, MMKV persists local snapshots, and `markMissionComplete` succeeds optimistically (`docs/EDGE_CASES.md` §1).

But the **UI layer** does not surface offline state. A user who taps "Mark complete" while offline sees the same UI as a user with full connectivity — the mission flips to complete, the byeongpung reveals, the panel-unlock animation plays. The write is queued silently. From the user's perspective there is nothing wrong — until they switch devices, or until a sync conflict resolves "wrong" three days later, and now they wonder why their byeongpung looks different.

Three concrete failure modes today:

1. **Silent offline drift.** User completes 5 missions offline; thinks their byeongpung is at 5 panels. Comes online; backend says 4 (because one mission's MMKV write got corrupted). UI silently reconciles, the user notices nothing — until they screenshot for a friend and the screenshot shows a different state next month.
2. **Sync conflict on multi-device.** User completes mission X on phone A while offline. Spouse opens K-Journey on phone B (shared Apple ID? rare but possible) and also marks mission X complete. Both devices come online. `last-write-wins` resolves — but the user has no idea which "win" is reflected.
3. **Anxiety from no signal.** A diligent user **wants** to know if their work is "saved" — silent optimism breeds doubt. "Did it actually save?" "Should I close the app?" "Will I lose this if my phone dies?"

The data-layer behavior is correct (per ADR-0022 KST + serverTimestamp + ADR-0011 single-source completion aggregation). What's missing is the **affordance** — the UI signal that lets the user trust silent sync.

## Decision Drivers

* The user must be able to trust that "offline complete" === "complete when online". No anxiety, no second-guessing.
* The user must be **subtly informed** that they are offline — informed enough to understand "your work is saved here, will sync later", not so loudly that the brand voice feels chatty.
* Conflict resolution is a backend decision (`last-write-wins` per ADR-0022) that must remain **silent** to the user — surfacing every conflict would be alarming and almost always meaningless (most "conflicts" are duplicate confirmations).
* The pattern must work cleanly with the optimistic UI we already ship. We do not want to introduce a "pending" visual state that delays celebrations.
* Reduce-motion / a11y users still need a non-visual cue when offline-with-pending-sync.

## Considered Options

1. **Toast-once + persistent header dot + silent conflict resolution** (chosen)
2. **Always-on offline banner** — bright "You are offline" bar at top
3. **Per-mission "syncing" badge** — show a spinner on every offline-completed mission
4. **No UI at all** — status quo, trust the offline-first stack

## Decision Outcome

**Chosen:** A three-part policy.

### Part A — Network-state surface

When `NetInfo.isConnected` transitions from `true → false`:

* **Toast (T1, ADR-0028)**: bottom toast, 4 s, dismissable, no Retry button. Body: `No connection. Your work is saved on this device.`
* **Persistent indicator**: a small dot (4 px) appears in the top-right corner of the home screen header (`palette.ash` color). The dot stays as long as `NetInfo.isConnected === false`.
* **No second toast** until the user reconnects, then disconnects again. We do not nag.

When `NetInfo.isConnected` transitions from `false → true`:

* **Indicator dot disappears.**
* **No "you're back online" toast** by default — the user usually notices. Exception: if there were ≥ 1 pending writes that synced on reconnect, fire a single short toast: `Synced.` (4 s, dismissable, no CTA). This is the only "good news" toast in the app.

### Part B — Optimistic UI is preserved

Mission complete, bucket save, profile edit — all fire their full visual choreography immediately on tap, regardless of network state. **No "pending sync" badge on individual items.** This is deliberate:

* Per-item pending badges train the user to treat their actions as provisional. Brand voice rejects this.
* The data layer already guarantees eventual consistency (ADR-0022 + Firestore offline queue).
* The header dot conveys aggregate offline state — sufficient for trust.

### Part C — Sync conflict is silent

When the same mission is completed on two devices with different `serverTimestamp()` values:

* Backend resolves `last-write-wins` (ADR-0022). The earlier `completedAtIso` is overwritten.
* UI does not surface the conflict to the user. Both devices ultimately show the mission as complete. The byeongpung count stays correct via `aggregateCompletions` (ADR-0011).
* If the conflict produces a **count discrepancy** that the user could observe (e.g. one device thought panel 4 unlocked, other thought panel 3), the next foreground refresh of `useTotalCompletions` reconciles silently.
* `claimPanelUnlock` (ADR-0009) ensures no duplicate celebration overlays — even across devices, each device fires the celebration at most once per panel.

**Visible conflict edge case**: if a user's bucket item count ever decreases on refresh (because the other device deleted it), surface a single T1 toast: `Updated from another device.` (4 s, dismissable, no CTA). Not for missions (which are append-only via merge), only for buckets which permit user delete.

### Reduce-motion / a11y

* The header dot has `accessibilityLabel="Offline — your work is saved on this device"` and `accessibilityRole="text"`. VoiceOver announces it on screen focus.
* The toast uses `accessibilityLiveRegion="polite"` (offline) and `assertive` is reserved for the synced T1 toast on reconnect (so a11y users hear the good news).
* The dot does not animate. No motion concern.

### Positive Consequences
* The user always knows the network state without us screaming about it.
* Optimistic UI is preserved — celebrations fire on tap, the brand peak moments are not diluted.
* `last-write-wins` conflicts stay silent — no notification fatigue.
* Single primitive (`<NetworkIndicator />`) wires up everywhere via the root layout; new screens get it for free.

### Negative Consequences
* The header dot is small — some users may miss it on their first offline session. Acceptable: the toast at the transition moment is the louder signal; the dot is a persistent reminder for those who care.
* Multi-device conflict handling for buckets requires one extra toast we don't have today. Small surface.
* Trust hinges on actual sync reliability — if Firestore offline queue ever drops a write silently, the user has no surface to detect it. Mitigated by `crashlytics().recordError` on sync failures (ADR-0012).

### Reversibility

Reversible — toast and dot are two thin components. Removing them returns to the silent-optimism status quo. The conflict-toast for buckets is one line.

## Pros and Cons of the Options

### Toast + dot + silent conflicts (chosen)
* **+** Brand-coherent. Quiet but informative.
* **+** Single primitive surface.
* **+** Optimistic UI preserved.
* **−** Dot is easy to miss on first offline session.

### Always-on offline banner
* **+** Maximum visibility.
* **−** Off-brand. Trains user to dismiss the banner.
* **−** Eats screen real estate that a 4-month visual diary needs.

### Per-mission syncing badge
* **+** Detailed transparency.
* **−** Trains the user to distrust their actions ("did this really save?").
* **−** Ugly visual surface — every list item gets a pending dot.
* **−** Doesn't actually inform — the user already knows they're offline.

### No UI at all (status quo)
* **+** Zero work.
* **−** Anxiety. Multi-device drift surprises. Brand-honor failure (the app should respect the user's awareness).

## Test plan

* Unit (`__tests__/networkIndicator.test.ts`): toast fires once on `connected → disconnected`; not again until next transition. Dot visible iff `!isConnected`. `Synced.` toast fires only when reconnect coincides with pending writes.
* Unit (`__tests__/buckets.test.ts`): bucket count decrease across foreground transition triggers `Updated from another device.` toast.
* Integration: airplane mode toggle on iOS sim → toast + dot. Disable airplane → dot disappears, optional sync toast.
* Manual QA (`docs/TESTING.md`): complete 3 missions offline → all show full celebration → reconnect → `Synced.` toast (one only) → byeongpung count matches.
* Manual QA: complete same mission on two devices → both show complete → no UI conflict → server consistent.
* a11y: VoiceOver announces dot label on focus. Toast announcements respect `accessibilityLiveRegion`.

## Migration plan

This ADR is forward-looking — none of the surface exists today. Users on the current build see no offline indicator at all.

1. **PR-A — Network primitive:** ship `src/components/ui/NetworkIndicator.tsx` (header dot) and `src/state/useNetwork.ts` (NetInfo hook). Mount the dot in the home screen header.
2. **PR-B — Toast wiring:** add `network-offline` (T1) toast firing on transition (already documented in `docs/ERROR_MESSAGES.md` row). Add new `synced` (T1) toast for the reconnect-with-pending case.
3. **PR-C — Bucket conflict toast:** detect bucket count decrease in `useUserBuckets` hook → fire `bucket-conflict` toast (new `ERROR_MESSAGES.md` row).
4. **PR-D — Doc additions:** add `network-offline-recovered` (`Synced.`) and `bucket-conflict` (`Updated from another device.`) rows to `docs/ERROR_MESSAGES.md`.

## Links

* **PRD:** §11.13 (new — haptics·offline·photo bundle pointer)
* **Project rules:** none new
* **Related ADRs:** [ADR-0011](0011-single-source-completion-aggregation.md) (count source), [ADR-0012](0012-async-mutator-error-contract.md) (error wrapping), [ADR-0015](0015-behavior-triggered-push-only.md) (no offline push), [ADR-0022](0022-kst-timezone-single-source.md) (server-truth + serverTimestamp), [ADR-0028](0028-error-recovery-retry-strategy.md) (toast tier T1), [ADR-0009](0009-single-fire-panel-unlock.md) (single-fire across devices)
* **Code (target):** `src/components/ui/NetworkIndicator.tsx` (new), `src/state/useNetwork.ts` (new), `src/components/ui/Toast.tsx` (shared with ADR-0028)
* **Docs:** `docs/ERROR_MESSAGES.md` (new rows), `docs/EDGE_CASES.md` (cross-link)

## Notes

The single most important design choice here is **not** showing a per-mission pending badge. Every product manager's instinct is to add one. The reason we don't: K-Journey is a 4-month emotional artifact, not a productivity tool. We must choose user trust over engineering transparency. If the data layer is sound (it is, per ADR-0022 + Firestore offline persistence), trust is the right product choice.

The `Synced.` toast on reconnect is the **only** "positive confirmation" toast in the app. We are deliberately stingy with positive surfaces — overuse breeds noise. Reserve it for the single moment when a user might genuinely worry their work was lost.
