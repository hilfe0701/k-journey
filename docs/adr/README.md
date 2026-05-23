# Architecture Decision Records (ADRs)

This directory captures the architectural decisions behind K-Journey. Each ADR follows the [MADR 3.0.0](https://adr.github.io/madr/) format (see `template.md`).

## How to use

* **Reading:** if you're wondering *why* a piece of K-Journey works the way it does, search this index first. ADRs explain *why* the codebase looks the way it does — `CLAUDE.md` enforces *what* (the locked rules), but the *why* lives here.
* **Writing:** when introducing a new architectural decision (new stack component, security model change, irreversible data shape, cross-cutting policy), copy `template.md` to `NNNN-short-title.md` (next available number) and fill it in. Add a one-line entry to the table below. Reference it from `CLAUDE.md` *Source-of-truth files* if the decision is load-bearing.
* **Superseding:** never edit an *accepted* ADR's decision retroactively. If the decision changes, write a new ADR with status `accepted` and update the old one's status to `superseded by ADR-NNNN`.

## Status legend

| Status | Meaning |
|---|---|
| `proposed` | Drafted but not yet validated / not yet implemented |
| `accepted` | In effect — the codebase reflects this decision |
| `deprecated` | No longer in effect; not replaced. Code may still contain artifacts being phased out. |
| `superseded by ADR-NNNN` | Replaced by a newer decision; see the linked ADR |

## Index

### Foundation (stack & framework choices)
| ADR | Title | Status | Date |
|---|---|---|---|
| [0001](0001-react-native-expo-over-flutter.md) | React Native + Expo over Flutter | accepted (retroactive) | 2026-04-XX |
| [0002](0002-mmkv-over-hive-for-cache.md) | MMKV over Hive for local cache | accepted (retroactive) | 2026-04-XX |
| [0003](0003-firebase-rn-modular-sdk.md) | Firebase RN Modular SDK over Web SDK | accepted (retroactive) | 2026-04-XX |
| [0004](0004-posthog-primary-analytics.md) | PostHog as primary product analytics | accepted (retroactive) | 2026-05-04 |
| [0005](0005-firebase-analytics-secondary.md) | Firebase Analytics as secondary | accepted (retroactive) | 2026-04-XX |

### Domain patterns (codebase-level rules)
| ADR | Title | Status | Date |
|---|---|---|---|
| [0006](0006-dev-mock-bypass-pattern.md) | Dev-mock bypass pattern (`isDevMock`) | accepted (retroactive) | 2026-05-04 |
| [0007](0007-cold-start-splash-handler-ref.md) | Cold-start splash handler ref | accepted (retroactive) | 2026-05-06 |
| [0008](0008-byeongpung-png-not-svg.md) | Byeongpung PNG full-paintings (not SVG) | accepted (retroactive) | 2026-05-08 |
| [0009](0009-single-fire-panel-unlock.md) | Single-fire panel unlock gate (`claimPanelUnlock`) | accepted (retroactive) | 2026-05-05 |
| [0010](0010-housing-applies-to-tagging.md) | Housing-specific mission tagging (`appliesTo`) | accepted (retroactive) | 2026-05-05 |
| [0011](0011-single-source-completion-aggregation.md) | Single-source completion aggregation (`aggregateCompletions`) | accepted (retroactive) | 2026-05-05 |
| [0012](0012-async-mutator-error-contract.md) | Async mutator error contract (`showOperationError`) | accepted (retroactive) | 2026-05-05 |

### Auth & users
| ADR | Title | Status | Date |
|---|---|---|---|
| [0013](0013-apple-primary-google-deferred.md) | Apple Sign-In primary, Google deferred | accepted (retroactive) | 2026-05-04 |
| [0014](0014-anonymous-auth-removed.md) | Anonymous auth removed | accepted (retroactive) | 2026-05-04 |

### Notifications
| ADR | Title | Status | Date |
|---|---|---|---|
| [0015](0015-behavior-triggered-push-only.md) | Behavior-triggered push only (no daily/weekly) | accepted (retroactive) | 2026-04-XX |

### Design system
| ADR | Title | Status | Date |
|---|---|---|---|
| [0016](0016-no-css-framework-inline-styles.md) | No CSS framework — inline RN styles + tokens | accepted (retroactive) | 2026-04-XX |
| [0017](0017-design-token-only-colors.md) | Design-token only color policy | accepted (retroactive) | 2026-04-XX |
| [0018](0018-english-first-korean-parenthetical.md) | English first, Korean parenthetical for proper nouns | accepted (retroactive) | 2026-04-XX |
| [0019](0019-reanimated-worklet-inline-rule.md) | Reanimated worklet inline-only rule | accepted (retroactive) | 2026-05-05 |

### Quality & test tooling
| ADR | Title | Status | Date |
|---|---|---|---|
| [0020](0020-jest-with-rn-mocks.md) | Jest with React Native mocks | accepted (retroactive) | 2026-04-XX |

### New decisions (Round 2 review — 2026-05-13)
| ADR | Title | Status | Date |
|---|---|---|---|
| [0021](0021-firestore-rules-acl-model.md) | Firestore Rules ACL model | proposed | 2026-05-13 |
| [0022](0022-kst-timezone-single-source.md) | KST timezone as single source of truth | proposed | 2026-05-13 |
| [0023](0023-mmkv-key-versioning-migration.md) | MMKV key versioning & migration | proposed | 2026-05-13 |
| [0024](0024-environment-separation-dev-staging-prod.md) | Environment separation (dev/staging/prod) | proposed | 2026-05-13 |
| [0025](0025-accessibility-wcag-2-1-aa.md) | Accessibility WCAG 2.1 AA target | proposed | 2026-05-13 |
| [0026](0026-eas-channel-strategy.md) | EAS channel strategy & version policy | proposed | 2026-05-13 |

### UX layer (Round 2.5 — 2026-05-14, Wave 1 morning)
| ADR | Title | Status | Date |
|---|---|---|---|
| [0027](0027-empty-state-pattern.md) | Empty state pattern — icon + factual message + optional CTA | proposed | 2026-05-14 |
| [0028](0028-error-recovery-retry-strategy.md) | Error recovery & retry strategy — 4-tier decision tree | proposed | 2026-05-14 |
| [0029](0029-push-copy-library-and-priming.md) | Push notification copy library & permission priming | proposed | 2026-05-14 |

### UX layer (Round 2.5 — 2026-05-14, Wave 2 evening)
| ADR | Title | Status | Date |
|---|---|---|---|
| [0030](0030-haptics-and-sound-feedback.md) | Haptics & sound feedback policy | proposed | 2026-05-14 |
| [0031](0031-offline-state-visibility.md) | Offline state visibility & sync conflict resolution | proposed | 2026-05-14 |
| [0032](0032-settings-screen-architecture.md) | Settings screen architecture | proposed | 2026-05-14 |
| [0033](0033-account-deletion-and-export.md) | Account deletion & data export (GDPR / PIPA) | proposed | 2026-05-14 |
| [0034](0034-photo-upload-pipeline.md) | Photo upload pipeline (compression · EXIF · moderation) | proposed | 2026-05-14 |
| [0035](0035-dark-mode-explicit-rejection.md) | Dark mode explicit rejection (MVP) | proposed | 2026-05-14 |

---

## Cross-references

* **Project rules:** `CLAUDE.md` (locked decisions, MUST/NEVER lists — operates as a quick checklist over the ADRs)
* **Product spec:** `reference/K-Journey_PRD_v1_1_KR.md` (v1.2 in-place revision, 2026-05-14)
* **Architecture overview:** `docs/architecture/ARCHITECTURE.md`
* **Security model:** `docs/SECURITY.md` (links to ADR-0021)
* **Accessibility:** `docs/ACCESSIBILITY.md` (links to ADR-0025)
* **i18n & timezone:** `docs/I18N_TIMEZONE.md` (links to ADR-0022)
* **Microcopy (voice/tone):** `docs/MICROCOPY.md` (links to ADR-0018, ADR-0027, ADR-0028, ADR-0029)
* **Error copy catalog:** `docs/ERROR_MESSAGES.md` (links to ADR-0012, ADR-0028)
* **Empty state spec:** `docs/EMPTY_STATES.md` (links to ADR-0027)
* **Push copy catalog:** `docs/PUSH_COPY.md` (links to ADR-0015, ADR-0029)
* **Settings screen spec:** `docs/SETTINGS.md` (links to ADR-0032, ADR-0029, ADR-0033, ADR-0035)
