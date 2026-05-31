# Ops Signal Console Implementation Plan

## Objective

Build a public-safe synthetic portfolio artifact that demonstrates:

- Consolidated operational signals across invented brands and surfaces.
- Known facts separated from inferred risks.
- Evidence gaps and uncertainty.
- Deterministic severity, confidence, evidence completeness, blast radius, and action readiness.
- Human approval gates before unsafe public or channel actions.
- Mock receipts with no external side effects.
- Public-safety discipline through docs, tests, and scans.

## Public-safety constraints

Use invented brands, invented signals, invented sources, invented surfaces, invented lots, invented regions, and invented scenario data only.

Do not include real people, real organizations, source-identifiable examples, exact public phrases, private labels, screenshots, logs, route maps, service path names, identifiers, operational traces, live integrations, networked feeds, persistence, sign-in, public alerts, external writes, or production actions.

## Phase 0 — Project setup and context lock

Goal: repo skeleton and public-safety boundaries before implementation.

Checklist:

- Create local project directory.
- Add README and AGENTS guidance.
- Add docs for scope, public safety, model, scenarios, and this plan.
- Add static app scaffold.
- Add test runner.
- Add initial public-safety scan script.
- Verify app builds and tests run.
- Keep work local unless publishing is explicitly approved.

Stop condition: static app builds, docs exist, and forbidden inheritance is explicit.

## Phase 1 — Deterministic scenario and display model

Goal: core data model and deterministic derivation layer before UI polish.

Types:

- `SignalScenario`
- `EvidenceItem`
- `InferredRisk`
- `EvidenceGap`
- `BlastRadius`
- `ActionState`
- `GatedAction`
- `GateStatus`
- `DecisionReceipt`

Pure functions:

- `calculateSeverity`
- `calculateConfidence`
- `calculateEvidenceCompleteness`
- `deriveBlastRadius`
- `deriveActionState`
- `deriveBlockedActions`
- `deriveAllowedInternalActions`
- `buildDisplayModel`

Required invariants:

- High severity does not imply high confidence.
- Missing evidence lowers confidence but does not automatically raise severity.
- Single-source chatter cannot become sustained demand.
- Public/channel actions are blocked when required proof is missing.
- Approval-required actions cannot execute without approval state.
- UI display state derives from model fields.

## Handoff template

```md
# Ops Signal Console Handoff

## Phase attempted

## Completed
-

## Verification run
- Command:
- Result:

## Public-safety checks
- Forbidden-term scan:
- Banned API scan:
- Synthetic-only data check:

## Files changed
-

## Decisions made
-

## Blockers / risks
-

## Next recommended phase/step
-

## Lifecycle status
- Implementation:
- Verification:
- Preview:
- PR:
- CI:
- Merge:
- Cleanup:
```
