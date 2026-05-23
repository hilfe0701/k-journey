# 0015. Behavior-triggered push only (no daily / weekly / marketing)

* **Status:** accepted (retroactive)
* **Date:** 2026-04 (decision) · 2026-05-13 (retroactive record)
* **Deciders:** 김재윤
* **Tags:** `notifications`, `ux`, `product`

## Context and Problem Statement

Many lifestyle apps spam users with daily "did you do your habit?" or weekly recap notifications. This is the *exact opposite* of the K-Journey brand voice (DESIGN.md §1 — "calm, contemplative, hanji-paper aesthetic"). The product spec explicitly limits push notifications to **behavior-triggered milestones**:

* D-Day milestones: D-30, D-14, D-7 to departure
* Phase boundary crossings (Phase 1→2, 2→3, 3→4)
* Byeongpung panel unlocks (single-fire — see ADR-0009)

No daily reminders. No weekly summaries. No marketing pushes. Ever.

## Decision Drivers

* Brand voice is the product's defensible differentiator (CLAUDE.md *Stack (locked)*, DESIGN.md voice rules).
* iOS notification permission cost is high — opting users in once means we must not abuse the channel.
* Firebase FCM quota is generous but cost still scales with volume.

## Considered Options

1. **Behavior-triggered only** (chosen)
2. **Optional daily reminders (off by default)**
3. **Weekly recap notifications**

## Decision Outcome

**Chosen:** Behavior-triggered notifications only. Scheduled through `src/lib/notifications.ts`. CLAUDE.md MUST #10 and NEVER #15 lock this.

### Positive Consequences
* Notification permission grant rate higher because users see immediate value (D-30 ping is genuinely useful).
* Brand calm preserved.
* FCM cost stays trivial.

### Negative Consequences
* Lower notification-driven re-engagement than a daily-reminder app.
* If retention KPI (PRD §1.2) slips, we cannot reach for the "send a daily" lever without violating this ADR. (Considered a feature: the constraint pushes us to find brand-aligned re-engagement instead.)

### Reversibility
Reversible by editing this ADR, CLAUDE.md MUST #10, NEVER #15, and adding scheduler logic. Should require a re-deciding moment, not a casual PR.

## Pros and Cons of the Options

### Behavior-triggered only
* **+** Brand-aligned, high signal-to-noise.
* **−** Lower push-driven engagement.

### Optional daily (off by default)
* **+** User control.
* **−** Settings UI for opt-in adds scope; defaults-off engagement is near zero.

### Weekly recap
* **+** Lifestyle-app baseline.
* **−** Off-brand.

## Links

* **PRD:** §7.4, §7.5, §7.6, §7.7
* **Project rules:** `CLAUDE.md` MUST #10, NEVER #15
* **Code:** `src/lib/notifications.ts` (`rescheduleAllNotifications`, `firePanelUnlock`)
* **Related ADRs:** [ADR-0009](0009-single-fire-panel-unlock.md), [ADR-0022](0022-kst-timezone-single-source.md) (D-Day notifications fire at KST 9am)
