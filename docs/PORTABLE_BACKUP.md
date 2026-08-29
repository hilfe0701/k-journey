# Portable backup and import design

Status: design approved for a future implementation; import is not shipped in v0.1.0.

## Product contract

K-Journey remains local-first and account-free. A portable backup is a user-initiated file, not cloud sync. Exporting never implies that K-Journey keeps a server copy. Import must be added only when every acceptance criterion below has automated round-trip and corruption coverage.

## File envelope

The future machine-readable file uses UTF-8 JSON and a `.kjourney.json` suffix.

```json
{
  "format": "k-journey-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-08-30T00:00:00.000Z",
  "appVersion": "0.1.0",
  "data": {
    "profile": {},
    "taskProgress": {},
    "completedMissions": [],
    "buckets": [],
    "settings": {}
  },
  "integrity": {
    "algorithm": "sha256",
    "digest": "hex digest of the canonical data object"
  }
}
```

`format` and `schemaVersion` are mandatory. Unknown top-level fields are ignored for forward compatibility; unknown fields inside user-owned records are preserved during migration when practical and never executed as instructions.

## Validation and migration

1. Read the selected file entirely on-device. Do not upload it.
2. Reject invalid UTF-8, non-JSON, files over 10 MB, a wrong `format`, unsupported future schema versions, duplicate record IDs, invalid dates, over-limit bucket sizes, and a digest mismatch.
3. Parse into an isolated candidate object. The live MMKV store is not touched during validation.
4. Migrate one schema version at a time with pure, deterministic functions. Preserve the original file if migration fails.
5. Show a count-only preview: profile present, task states, mission completions, Want-to lists/items, and settings. Do not expose user text in telemetry or crash messages.

## Conflict policy

Import is an explicit whole-journey replacement, not an automatic merge. Before the final replace action, the UI must state that current local data will be replaced and offer a fresh export. The final replace action requires confirmation.

The write uses a staging key and verified read-back:

1. write and verify the complete candidate under `import:staging:v1`;
2. copy each validated namespace to its production key;
3. verify the production snapshot against the candidate;
4. delete staging only after verification;
5. if any write fails, restore the pre-import snapshot and report a factual failure.

This avoids field-level merge rules that could silently combine two different journeys or resurrect deleted items.

## Privacy and safety

- The backup may contain nationality, visa/housing/insurance conditions, dates, completion history, and free-text Want-to items. The chooser and confirmation UI must call it a sensitive local file.
- No backup contents, filenames, paths, hashes, or counts are sent to PostHog or Crashlytics.
- Sharing remains an OS action initiated by the user. Import reads only the file the user selects.
- Import never follows URLs, executes strings, installs content, or changes app permissions.

## Implementation acceptance criteria

- A fresh export imports into an empty install and re-exports to the same canonical `data` object.
- Every supported older schema fixture migrates deterministically.
- Unsupported future versions and corrupted/malicious fixtures leave live data unchanged.
- Duplicate IDs, invalid dates, excessive list sizes, prototype-pollution keys, and oversized files are rejected.
- A forced MMKV write/read-back mismatch rolls back to the exact pre-import snapshot.
- Canceling the picker, preview, or final confirmation changes nothing.
- Import/reset/export flows pass at 390×844 and 1440×900, keyboard, VoiceOver, and TalkBack.

Until these criteria pass, the existing readable text export must continue to say that it is not an importable backup.
