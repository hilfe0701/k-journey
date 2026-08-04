# Current data flows

## Onboarding and profile

```text
User input → validation → updateUserProfile
  → verified MMKV write → useProfile reactive update
  → condition rules and phase recompute locally
```

Unknown is persisted as `unknown`; a missing answer triggers review/setup UI, not an inferred value.

## Administrative task

```text
Profile + dates → deterministic rule evaluation → task state
User changes status → saveTaskProgress → read-back verification
  ├─ success: UI and event update
  └─ failure: error surface; do not claim completion
```

Official-source metadata is static content. Pressing a source launches the OS browser; the app does not proxy or cache the page.

## Cultural mission

```text
User taps I did this → markMissionComplete → verified MMKV write
  → completed mission hook updates
  → aggregateCompletions recalculates
  → optional one-time threshold celebration/event
```

Undo removes the local completion and may reduce partial panel reveal.

## Want-to

```text
Template selection → local bucket creation
Item check → verified bucket write → aggregateCompletions recalculates
```

Raw names and item text stay local and are included only in a user-requested readable export.

## Byeongpung

```text
completedMissionCount + checkedBucketItemCount
  → aggregate total
  → panelReveal for 8 panels
  → on-device render
  → optional local Save / OS Share
```

No artwork or progress is uploaded by K-Journey.

## Export and reset

```text
MMKV profile + task + missions + buckets
  → human-readable text → OS share sheet
```

The export is not an importable backup. Delete all local data enumerates K-Journey keys, resets the first-run tour, and returns to onboarding.

## Optional telemetry

```text
allowlisted interaction + coarse props → PostHog only when key configured
render/runtime error → Crashlytics only in configured native build
```

No session replay. No raw profile answers, dates, names, emails, coordinates, or Want-to text.
