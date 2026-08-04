# Operations

## Current service surface

K-Journey has a static web deployment and optional native builds. Core user journey data is device-local; there is no Auth/Firestore user backend, server sync queue, or remote account support operation.

Operational owners must distinguish:

- **artifact availability**: hosting, JS/assets, SPA routing;
- **content correctness**: static administrative/cultural guidance;
- **client reliability**: crashes, local persistence, permissions;
- **optional telemetry availability**: PostHog/Crashlytics configuration.

## Routine checks

- Weekly: production smoke, direct URL refresh, failed asset/network requests.
- Before release: source freshness for changed Class A/B content, full quality gate, privacy configuration diff.
- Monthly: dependency/permission review, source ledger review, analytics forbidden-property audit if enabled.

## User support truth

- There is no password, account recovery, or server data restore.
- Explain that data stays on the current device and that readable export is not importable.
- Never request passport/residence-card numbers, document photos, or full Want-to exports in a support ticket.
- For incorrect high-consequence guidance, provide the official authority first and escalate the content incident.

## Change records

Every production deployment records source SHA, build command, environment, deployment ID/URL, verifier, smoke result, and rollback target. Every content correction records source URL, checked date, affected item IDs, and release version.
