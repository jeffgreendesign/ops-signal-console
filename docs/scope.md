# Scope

## MVP

Ops Signal Console is a local static prototype. It displays invented operational signal scenarios through a deterministic model layer.

Included:

- Scenario fixtures.
- Known-fact, inferred-risk, and evidence-gap fields.
- Severity, confidence, evidence-completeness, blast-radius, and action-state derivation.
- Internal-safe mock action labels and blocked public/channel action labels.
- Tests and a public-safety release gate that scans source, docs, tests, scenarios, and built assets.

## Non-goals

- Production readiness.
- Live data ingestion.
- External writes or alerts.
- Persistence, sign-in, or user identity flows.
- Transaction or personal-data behavior.
- Real-organization, real-person, or source-identifiable examples.
