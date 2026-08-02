# Incident response

## First actions

1. Confirm the affected artifact, version, route/content ID, and time window.
2. Classify availability, local data, privacy, content safety, or visual/accessibility impact.
3. Mitigate with hosting rollback, feature/config disable, or corrected static content as appropriate.
4. Preserve minimal evidence without copying sensitive local values.
5. Verify mitigation on the exact production artifact.

## Special cases

### Local-data loss or corruption

- Do not promise server restore; none exists.
- Stop further writes if a migration is destructive.
- Preserve a reproducible corrupted fixture when possible without user identifiers.
- Ship an idempotent migration or safe reset path and document unrecoverable scope honestly.

### Prohibited telemetry data

- Disable capture/key, remove unsafe properties, request processor deletion, assess notification duties, and add a regression test.
- Session replay must remain off.

### Incorrect administrative or emergency guidance

- Mark the item unavailable or needs-review.
- Link users to the final official authority.
- Record source, previous/new copy, affected versions, and checked date.
- Treat visa, eligibility, deadline, fee, and emergency errors as higher severity than ordinary editorial defects.

### Broken deployment/routes

- Roll back to the recorded verified deployment.
- Confirm SPA rewrites and direct URL refresh before re-promoting.

## Closeout

An incident closes only after root cause, affected versions, mitigation, permanent fix, regression coverage, content/privacy follow-up, and release evidence are recorded. Firestore/Auth runbooks in historical docs do not apply to the current product.
