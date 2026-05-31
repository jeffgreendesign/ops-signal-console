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
- `DecisionReceipt`: typed no-side-effect receipt for allowed local/internal mock execution.

## Pure functions

- `calculateSeverity(scenario)`
- `calculateConfidence(scenario)`
- `calculateEvidenceCompleteness(scenario)`
- `deriveBlastRadius(scenario)`
- `deriveActionState(scenario)`
- `deriveBlockedActions(scenario)`
- `deriveAllowedInternalActions(scenario)`
- `buildDisplayModel(scenario)`
- `executeReceiptAction(scenario, action)`

Receipt execution returns a typed success or blocked result. Only available internal actions create in-memory receipts, and every receipt records `externalSideEffects: none`. Public/channel actions and actions missing evidence or human approval do not create receipts.
