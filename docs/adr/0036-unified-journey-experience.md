# ADR-0036: Unify administrative essentials and cultural journey

- Status: accepted
- Date: 2026-08-02
- Product authority: `DEC-040`

## Context

The conditional administrative checklist replaced the original cultural journey as the only
visible product path. Cultural missions, the eight-panel byeongpung, and Want-to buckets remained
implemented but were hidden from navigation. This made the practical product stronger while
removing the experience and memory loop that distinguished K-Journey.

## Decision

K-Journey will keep both product axes in one local-first app:

- `Journey` contains an `Essentials / Culture` switch. Essentials is the existing conditional
  administrative checklist; Culture is the phased cultural mission catalog.
- `Byeongpung` and `Want to` return as first-class tabs. `More` remains the fourth tab.
- Cultural mission and Want-to item completions continue to share one completion total that
  reveals one of eight byeongpung panels every six completions.
- Administrative task completion remains a separate status system and does not reveal panels.
- The detailed v2 condition fields are canonical. Compatibility selectors mirror or derive the
  broad v1 university and housing fields used by cultural content.
- Existing local culture progress is migrated forward where legacy MMKV keys are available.
- A profile that predates the v2 condition axes re-enters the local onboarding flow so the app
  does not invent visa, contract, or eligibility facts needed by the administrative checklist.

`DEC-040` supersedes the product-scope portion of `DEC-024` for cultural missions, byeongpung,
and Want-to buckets. This ADR implements that product decision; an ADR does not override a DEC.
`DEC-001` and `DEC-022` still apply: profiles and progress remain local, with no authentication
or per-user Firestore data path.

## Consequences

- The practical checklist is retained unchanged as the default Journey view.
- Users can move between practical preparation and cultural exploration without entering a
  separate product.
- Legacy server-only progress cannot be recovered without a separately authorized Firebase
  migration path; this ADR only preserves data already present on the device.
