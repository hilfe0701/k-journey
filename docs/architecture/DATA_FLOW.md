# K-Journey Data Flow

> Five sequence diagrams covering the load-bearing flows. Each includes the exception path that the happy-path narrative tends to omit.

For the layer overview, see [`ARCHITECTURE.md`](ARCHITECTURE.md). For per-module contracts, see [`MODULE_OWNERSHIP.md`](MODULE_OWNERSHIP.md).

---

## Flow 1 — Apple Sign-In

```
User       sign-in.tsx        useAuth        firebase.ts        Apple        Firestore
 │              │                 │                │              │              │
 │ tap "Sign in"│                 │                │              │              │
 │─────────────▶│                 │                │              │              │
 │              │ signInWithApple │                │              │              │
 │              │────────────────────────────────────────────────▶│              │
 │              │                 │                │   id_token   │              │
 │              │                 │                │              │              │
 │              │                 │                │ ◀─ nonce + token ─          │
 │              │                 │                │              │              │
 │              │ Firebase.signInWithCredential('apple.com', token)              │
 │              │────────────────────────────────────────────────────────────▶  │
 │              │                                                                │
 │              │ ◀─ user ─                                                      │
 │              │                                                                │
 │              │      onAuthStateChanged(user)                                  │
 │              │◀───────────────│                │              │              │
 │              │                │ ensureUserDocument(user)                      │
 │              │                │────────────────────────────────────────────▶ │
 │              │                │                │              │              │
 │              │                │ ◀─ users/{uid} merged ─                       │
 │              │                │                                               │
 │              │                │ identify(uid) → PostHog                       │
 │              │                │ track('sign_in', { provider: 'apple' })       │
 │              │                │ setState({ initializing:false, user })        │
 │              │                │                                               │
 │              │ ◀─ rerender ─  │                                               │
 │              │                                                                │
 │  router.replace('/(onboarding)/dates' if no profile, else '/(tabs)')          │
```

### Exception branches

| Failure | Where | Recovery |
|---|---|---|
| User cancels Apple sheet | `appleAuth.signIn` throws `ERR_CANCELLED` | sign-in.tsx swallows the cancel quietly (no error UI). |
| No `identityToken` returned | Apple bug / sim quirk | `showOperationError('sign in', new Error('No identity token'))` |
| Nonce mismatch | Firebase rejects credential | `showOperationError('sign in', e)` |
| `ensureUserDocument` Firestore write fails | Network / Rules / quota | (Round 2 fix Part E.4) `try/catch` in `onAuthStateChanged` callback → `recordError` + keep `state.user` set so user can retry from inside the app. |

---

## Flow 2 — Mission complete (online)

```
User    mission/[id].tsx    useCompletedMissions    firebase.ts    Firestore    posthog    notifications
 │            │                       │                  │             │           │             │
 │ tap "Done" │                       │                  │             │           │             │
 │───────────▶│                       │                  │             │           │             │
 │            │ markMissionComplete(uid, missionId)      │             │           │             │
 │            │─────────────────────────────────────────▶│             │           │             │
 │            │                       │                  │ set({completedAtIso: serverTimestamp()}, merge:true)
 │            │                       │                  │────────────▶│           │             │
 │            │                       │                  │             │           │             │
 │            │                       │                  │ ◀─ ack ─    │           │             │
 │            │                       │                  │             │           │             │
 │            │ ◀─ success ─          │                  │             │           │             │
 │            │                       │                  │             │           │             │
 │            │ track('mission_complete', { id, phase, category })     │           │             │
 │            │───────────────────────────────────────────────────────▶│           │             │
 │            │                       │                                            │             │
 │            │ (onSnapshot from useCompletedMissions delivers new total)          │             │
 │            │ ◀─ new total ─        │◀─ snapshot ─                                │             │
 │            │                       │                                            │             │
 │            │ if (total % 6 === 0 && total ≤ 48)                                 │             │
 │            │   panel := total / 6                                               │             │
 │            │   if (claimPanelUnlock(panel))                                     │             │
 │            │     ─ MissionCompleteOverlay fires                                 │             │
 │            │     ─ track('panel_unlock', { panel, source:'mission' })           │             │
 │            │     ─ firePanelUnlock(panel, eraNameEn) ─────────────────────────▶│
 │                                                                                              │
 │                                                                          OS shows notif
```

### Exception branches

| Failure | Where | Recovery |
|---|---|---|
| Network offline | Firestore offline queue holds write | UI shows success (optimistic). Snapshot arrives on reconnect. ADR-0022 |
| Firestore quota exceeded | `set` throws | `showOperationError('save mission', e)` — Alert + Crashlytics. |
| Notification permission denied | `firePanelUnlock` | `getPermissionsAsync` returns `granted: false` → no notification scheduled, overlay still fires. |
| Same mission already complete | `markMissionComplete` | `merge: true` → idempotent. Counter stays at correct total. |
| Toggle off and re-on (mission unmark + mark) | `claimPanelUnlock` already fired | Returns `false` → overlay does **not** re-fire. ADR-0009. |

---

## Flow 3 — Mission complete (offline → reconnect)

```
User       mission/[id].tsx       firebase.ts       Firestore offline-Q    snapshot listener
 │                │                     │                   │                       │
 │ (offline)      │                     │                   │                       │
 │ tap "Done"     │                     │                   │                       │
 │───────────────▶│                     │                   │                       │
 │                │ markMissionComplete │                   │                       │
 │                │────────────────────▶│                   │                       │
 │                │                     │ enqueue (set, doc) │                       │
 │                │                     │──────────────────▶│                       │
 │                │ ◀─ resolves ─       │                   │                       │
 │                │ (optimistic UI)     │                   │                       │
 │                │                     │                   │                       │
 │ ... time passes ...                  │                   │                       │
 │                │                     │                   │                       │
 │ network back   │                     │                   │                       │
 │                │                     │                   │ flush queue           │
 │                │                     │                   │──── set ────▶ Firestore
 │                │                     │                   │                       │
 │                │                     │                   │ ack arrives           │
 │                │                     │                   │ → snapshot fires      │
 │                │                     │ ◀─ snapshot ─     │──────────────────────▶│
 │                │                     │ → update MMKV cache                       │
 │                │ ◀─ rerender (same total, now confirmed) ─                       │
```

### Exception branches

| Failure | Where | Recovery |
|---|---|---|
| User signs out before flush | `useAuth.signOut` clears MMKV; Firestore queue is per-Firebase-instance and survives signOut (but writes will fail Rules if anonymous-by-then). **Round 2 follow-up:** add `clearOrphanQueueOnUidChange`. |
| App killed mid-queue | Firestore offline persistence survives process death; queue replays on next launch. |
| Queue entry rejected by Rules | Server returns permission-denied | Firestore logs the failure; client doesn't surface to user. (Round 2 follow-up: subscribe to Firestore's queue-error event and `showOperationError`.) |

---

## Flow 4 — Panel unlock + push notification

```
mission/[id].tsx      notifications.ts        OS                  PostHog
 │                          │                  │                    │
 │ claimPanelUnlock(3)      │                  │                    │
 │─────────────────────────▶│                  │                    │
 │                          │  read firedPanelUnlocks (MMKV)        │
 │                          │  [1,2] does not include 3 → append    │
 │                          │  → returns true                       │
 │ ◀─ true ─                │                                       │
 │                          │                                       │
 │ MissionCompleteOverlay fires (cardSink → inkRing → panelReveal → fadeUp)
 │ track('panel_unlock', { panel:3, source:'mission' }) ───────────────────▶│
 │                          │                                       │
 │ firePanelUnlock(3, era)  │                                       │
 │─────────────────────────▶│                                       │
 │                          │ getPermissionsAsync                   │
 │                          │ ── granted? ──▶ scheduleNotification  │
 │                          │                  ─────────────────────▶│
 │                          │                                       │  shows
 │                          │ ── denied? ──▶ silently skip          │
```

### Exception branches

| Failure | Where | Recovery |
|---|---|---|
| MMKV `firedPanelUnlocks` corrupted | `getJson` returns null | Treated as empty array → unlock fires once (acceptable). Migration runner backs up corruption. ADR-0023 |
| Notification scheduling throws | `firePanelUnlock` try/catch | Swallowed with intentional comment: never block UI on a notification failure. |

---

## Flow 5 — Era switch

```
User    More tab era picker    useProfile / firebase.ts    Firestore     Theme    Byeongpung re-render
 │            │                            │                  │            │              │
 │ tap era=goryeo                          │                  │            │              │
 │───────────▶│                            │                  │            │              │
 │            │ updateUserProfile(uid, { era:'goryeo' })      │            │              │
 │            │───────────────────────────▶│                  │            │              │
 │            │                            │ merge update     │            │              │
 │            │                            │─────────────────▶│            │              │
 │            │                            │ ◀─ snapshot ─    │            │              │
 │            │                            │ track('era_switch', { from:'silla', to:'goryeo' })
 │            │                            │                  │            │              │
 │            │ ◀─ useProfile rerenders ─  │                  │            │              │
 │            │            ThemeProvider picks goryeo palette ───────────▶│              │
 │            │                                                              │ swap PNG sources for byeongpung panels
 │            │                                                              │ panel reveal stays (same totalCompleted)
 │            │                                                              │ CLAUDE.md MUST #9
```

### Exception branches

| Failure | Where | Recovery |
|---|---|---|
| Firestore update fails | `updateUserProfile` catch | `showOperationError('switch era', e)`. UI stays on previous era. |
| PNG load fails after era swap | `<PanelImage>` `onError` | Fall back to ink-colour solid (Part E.6, ADR-0008). |
| Snapshot lag → UI flicker | Briefly shows old era's panels | Accept — sub-frame visual that resolves on snapshot arrival. |
