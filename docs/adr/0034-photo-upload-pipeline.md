# 0034. Photo upload pipeline (compression · EXIF · moderation · storage path)

* **Status:** proposed
* **Date:** 2026-05-14
* **Deciders:** 김재윤
* **Tags:** `photos`, `storage`, `privacy`, `moderation`, `firebase`

## Context and Problem Statement

K-Journey lets users attach a photo to each completed mission (e.g. their bibimbap, the Han River at sunset, the campus on day one). Photos are the connective tissue of the gallery (PRD §10.1) and a key part of the byeongpung emotional artifact.

Today there is **no photo upload pipeline**. The mission detail screen (`app/mission/[id].tsx`) has no `<PhotoCapture />` component. There is no compression policy, no EXIF policy, no Storage path convention, no moderation policy. When implementation begins, every PR risks introducing arbitrary defaults — and a few of those defaults are **legally consequential**:

* **EXIF GPS data** in user photos is **PII** under both GDPR and PIPA. Uploading raw EXIF to Storage and serving it back unedited can leak a user's exact location.
* **Image moderation**: K-Journey is meant for personal mementos, but a single bad-actor's NSFW upload, if served back via signed URL or shared, exposes the operator to App Store removal.
* **Bandwidth and Storage cost**: a single iPhone 15 photo is 4–5 MB raw. 50 missions × 5 MB × N users scales fast on Firebase Storage's $0.026/GB/month tier.

Without policy, K-Journey ships a vulnerable, costly pipeline. This ADR locks the contract.

## Decision Drivers

* User photos are personal and emotionally weighted — quality and integrity matter, but raw 12 MP is overkill for a 1080p phone display.
* GPS EXIF leak is a privacy red flag — must strip on upload.
* MVP scope: we cannot ship a full Cloud Vision moderation pipeline. We need a credible MVP path with a clear V2 escalation.
* Firebase Storage costs scale linearly with bytes — compression saves real money.
* Upload UX must be **non-blocking** — the user should not stare at a spinner.
* Failure recovery: photo upload failures should be retriable without losing the user's local file.

## Considered Options

1. **1920px JPEG q=0.85 + GPS strip + self-report moderation MVP + ULID storage path** (chosen)
2. **Original quality + GPS strip** — preserve full fidelity
3. **Cloud Vision SafeSearch on every upload** — proactive moderation
4. **No photos at MVP — defer entirely**

## Decision Outcome

**Chosen:** A four-part pipeline.

### Part A — Compression policy

Every uploaded image is processed client-side before upload using `expo-image-manipulator`:

| Step | Setting | Notes |
|---|---|---|
| Resize | Long edge 1920 px (preserve aspect) | Sufficient for retina display + retains "real photo" look. |
| Format | JPEG | PNG only for byeongpung panels (designer assets, not user uploads). |
| Quality | 0.85 | Visually lossless, ~30–40% size reduction vs original. |
| Color profile | sRGB | Wide-gamut (P3) is overkill for share-target compression. |

Expected file size: 200–500 KB per photo (down from 4–5 MB raw). Per-user lifetime storage: 50 missions × ~400 KB = ~20 MB. Manageable.

### Part B — EXIF policy

Strip on the client before upload:

| Field | Action |
|---|---|
| GPS coordinates | **Strip (mandatory).** PII per GDPR + PIPA. |
| Capture timestamp | Preserve. Useful for chronological gallery sort. |
| Camera make/model | Preserve. Statistically aggregated may inform device-tier features. |
| Lens info | Preserve. |
| User comments | Strip. Could leak names from third-party photo apps. |
| Software | Preserve (e.g. "Camera 17.0"). |
| Orientation | Preserve and **honor** at render time (Image Manipulator handles auto-rotate). |

Implementation: `expo-image-manipulator` does not natively strip GPS. Use `piexifjs` or equivalent before upload. Stripped image is the **only** version that ever leaves the device.

### Part C — Storage path & lifecycle

Storage path: `users/{uid}/photos/{missionId}/{ulid}.jpg`

| Component | Reason |
|---|---|
| `users/{uid}/...` | Ownership root — Firestore Rules enforce read/write by `request.auth.uid == uid` (ADR-0021). |
| `photos/{missionId}/...` | Logical grouping — easy to display per-mission gallery. One mission may have one or many photos (V1 = one; V2 may permit multiple). |
| `{ulid}.jpg` | ULID (not UUID) — sortable timestamp prefix aids debugging and chronological listing. Hash collision practically impossible. |

Storage Rules (`storage.rules`, new):

```
match /users/{uid}/photos/{allPaths=**} {
  allow read: if request.auth.uid == uid;
  allow write: if request.auth.uid == uid
                && request.resource.size < 2 * 1024 * 1024
                && request.resource.contentType.matches('image/jpeg');
}
```

The 2 MB cap is a defense-in-depth — client compression should never produce > 1 MB files; the rule is the safety net.

### Part D — Moderation (MVP self-report → V2 Cloud Vision)

**MVP**: no proactive moderation. Users see only their own photos (no public feeds, no shared galleries in MVP). Self-report path:

1. Gallery item long-press → "Report content" (developer-only contact: `support@kjourney.app`).
2. The report stores `_admin/contentReports/{ulid}` with `uid`, `path`, `reportedAt`, `reportedBy` (always self in MVP — there is no other-user discovery).
3. Operator manually reviews and (if necessary) deletes via Firebase console.

Why this is acceptable for MVP: K-Journey has no social graph in V1. A user only ever sees their own photos. The risk surface is the user reporting their own past upload (e.g. accidentally captured private content) — the self-report flow handles that.

**V2** (when sharing-public is contemplated): integrate Cloud Vision SafeSearch in a Cloud Function triggered on upload. Reject high-confidence NSFW. Cost: ~$1.50 per 1000 images. Out of MVP scope; tracked in ADR-0033 backlog or a future ADR-0040.

### Part E — Upload UX

The user taps "Add photo" on a mission → photo picker (camera or library, ADR-0029 priming for camera if undetermined) → image processed (resize + EXIF strip) → upload to Storage with `uploadBytesResumable` → Firestore write of metadata reference.

| Stage | UX surface | Reference |
|---|---|---|
| Picker open | Native iOS/Android | `expo-image-picker` |
| Processing (~200 ms) | Skeleton card with shimmer in mission detail | DESIGN.md §14.1 |
| Upload (background) | Inline progress bar in mission card (compact) | new primitive |
| Upload success | Photo renders in mission card | optimistic if Firestore write succeeds first |
| Upload failure | T2 modal: title `Couldn't upload photo` body `The upload didn't finish. Try again or skip the photo.` Buttons: `Try again` (primary) / `Skip photo` (destructive — keeps mission complete, drops photo) | ADR-0028 + `docs/ERROR_MESSAGES.md` `image-upload-fail` row (already documented) |
| Mid-upload app close | Resume on next app open via `uploadBytesResumable` recovery | iOS/Android background limits apply |

The mission **completion** is independent of photo success — completing the mission does not block on the photo. If the photo fails, the mission still counts. This is intentional: users in poor connectivity should not lose mission progress because of a photo upload.

### Positive Consequences
* Predictable per-photo size + storage cost.
* GPS leak avoided — compliance hygiene.
* Storage path supports per-user Rules cleanly.
* Self-report is realistic for MVP without overpromising moderation.
* Mission completion decoupled from photo upload — graceful degradation.

### Negative Consequences
* `piexifjs` is an extra dependency. Footprint ~30 KB. Acceptable.
* No proactive moderation = a bad-actor uploading NSFW will see it themselves until manual removal. No third-party exposure in MVP since photos are private — risk bounded.
* `uploadBytesResumable` adds complexity vs simple `uploadBytes`. Worth it for the resume affordance.
* 1920px is irreversible — once compressed and uploaded, the original quality is lost. Client-side: keep the original in the device's photo library (we do not delete the source).

### Reversibility

Reversible at the policy layer. Compression + EXIF settings are constants in `src/lib/photoUpload.ts` — change in one place. Storage path is harder to change post-launch (would require migration). ULID choice is reversible per file (mix-and-match works).

## Pros and Cons of the Options

### 1920px JPEG + GPS strip + self-report (chosen)
* **+** Cost-controlled.
* **+** Privacy-compliant (GPS).
* **+** Realistic moderation MVP.
* **−** No proactive content safety (acceptable since photos are private in MVP).

### Original quality + GPS strip
* **+** Maximum fidelity.
* **−** Storage costs ~10× higher.
* **−** Slow uploads on poor connections.

### Cloud Vision on every upload
* **+** Best moderation.
* **−** $1.50/1000 images at scale.
* **−** Extra latency on upload.
* **−** Engineering surface (Cloud Function).

### No photos at MVP
* **+** Zero work.
* **−** Gallery loses its emotional weight. Users complain. Brand failure.

## Test plan

* Unit (`__tests__/photoUpload.test.ts`): 12 MP fixture image → resize to 1920px long edge → output ≤ 600 KB; GPS EXIF removed; capture timestamp preserved.
* Unit (`__tests__/storagePath.test.ts`): path generator produces `users/{uid}/photos/{missionId}/{ulid}.jpg`; ULID is sortable lexicographically by time.
* Storage Rules emulator test (`firestore.rules` extension): writes > 2 MB rejected; non-JPEG rejected; cross-user reads rejected.
* Integration: tap "Add photo" → process → upload → photo renders in mission card. Kill app mid-upload → reopen → upload resumes.
* Manual QA (`docs/TESTING.md`): airplane-mode upload → T2 modal `Try again / Skip photo`. Skip → mission stays complete, no photo. Try again on reconnect → photo uploads.
* Security: Storage Rules + Firestore Rules cross-check; no path leak via metadata.
* Privacy audit: download an uploaded photo from Firebase console → inspect EXIF → confirm GPS stripped.

## Migration plan

This ADR is forward-looking — no photo upload code today.

1. **PR-A — Photo helper:** ship `src/lib/photoUpload.ts` exporting `processAndUpload(file: File): Promise<{ path: string }>` (resize + EXIF strip + Storage write). Add `__tests__/photoUpload.test.ts`.
2. **PR-B — Storage Rules:** add the rules block above to `storage.rules` (currently empty). Emulator tests.
3. **PR-C — UI primitives:** ship `<PhotoCaptureButton />` (picker invocation + camera permission priming per ADR-0029) and `<PhotoUploadProgress />` (inline progress bar in mission card).
4. **PR-D — Mission detail wiring:** wire `app/mission/[id].tsx` to call `processAndUpload` and surface T2 modal on failure (ADR-0028).
5. **PR-E — Self-report path:** long-press menu on gallery item → modal → write `_admin/contentReports/{ulid}`.
6. **PR-F — Documentation:** add `image-upload-fail` row already exists in `docs/ERROR_MESSAGES.md`; ensure `docs/EDGE_CASES.md` covers airplane-mode and skip-photo paths.

## Links

* **PRD:** §11.13 (new — haptics·offline·photo bundle pointer), §10.1 (gallery cross-ref)
* **Project rules:** CLAUDE.md NEVER #16 (no committed secrets)
* **Related ADRs:** [ADR-0021](0021-firestore-rules-acl-model.md) (Storage Rules sibling — `storage.rules` is added here), [ADR-0028](0028-error-recovery-retry-strategy.md) (T2 upload-fail modal), [ADR-0029](0029-push-copy-library-and-priming.md) (camera permission priming generalization), [ADR-0031](0031-offline-state-visibility.md) (offline upload behavior), [ADR-0033](0033-account-deletion-and-export.md) (export bundles photos)
* **Docs:** `docs/SECURITY.md` (PII classification — GPS now explicitly listed), `docs/ERROR_MESSAGES.md` (`image-upload-fail` row already exists)
* **Code (target):** `src/lib/photoUpload.ts` (new), `src/components/photo/PhotoCaptureButton.tsx` (new), `src/components/photo/PhotoUploadProgress.tsx` (new), `storage.rules` (new — was empty), `app/mission/[id].tsx` (wire-up)
* **External:** [expo-image-manipulator](https://docs.expo.dev/versions/latest/sdk/image-manipulator/), [piexifjs](https://github.com/hMatoba/piexifjs), [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)

## Notes

The decision to **not** use Cloud Vision in MVP rests on the assumption that K-Journey has no public sharing in V1. If that assumption changes — e.g. if "Share to friends" feature ships in V1.1 — Cloud Vision becomes mandatory before launch of that feature. Track in ADR-0033 backlog.

ULID over UUID is a small but meaningful choice. It costs us nothing (same library) and gives us human-debuggable ordering. Firebase console listings of `users/{uid}/photos/{missionId}/` will sort by upload time naturally.

The 2 MB Storage rule cap and the 1920px client compression are intentionally redundant — defense in depth. If a future PR accidentally bypasses the client compression, the rule rejects oversize uploads at the network edge.

Skipping the photo (destructive button on T2 fail modal) is a deliberate UX choice — users in poor signal would otherwise be stuck. The mission count is more important than the photo. Users can always add a photo later (V2 — re-edit gallery items).
