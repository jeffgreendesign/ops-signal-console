# Model

## Core entities

- `SignalScenario`: synthetic signal packet and fixture boundary.
- `EvidenceItem`: known fact with `observed`, `derived`, or `missing` strength.
- `InferredRisk`: model-visible risk claim separated from facts.
- `EvidenceGap`: missing proof that lowers confidence and may block actions.
- `BlastRadius`: `local`, `surface`, `system`, or `portfolio`.
- `ActionState`: `observe`, `review`, or `blocked`.
- `GatedAction`: internal/channel/public action candidate with evidence and approval requirements.
- `GateStatus`: `available`, `needsEvidence`, `needsHumanApproval`, `blockedByPolicy`, `executedMock`, or `rolledBackMock`.
- `DecisionReceipt`: no-side-effect receipt shape for later mock execution.

## Pure functions

- `calculateSeverity(scenario)`
- `calculateConfidence(scenario)`
- `calculateEvidenceCompleteness(scenario)`
- `deriveBlastRadius(scenario)`
- `deriveActionState(scenario)`
- `deriveBlockedActions(scenario)`
- `deriveAllowedInternalActions(scenario)`
- `buildDisplayModel(scenario)`

The UI should consume `buildDisplayModel` instead of duplicating model logic.
