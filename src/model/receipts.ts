import type { DecisionReceipt, GatedAction, GateStatus, SignalScenario } from './types';

export const createReceiptShape = (
  scenario: SignalScenario,
  action: GatedAction,
  gateStatusBefore: GateStatus,
  createdAt = '2026-05-30T12:00:00.000Z',
): DecisionReceipt => ({
  receiptId: `receipt-${scenario.id}-${action.id}`,
  scenarioId: scenario.id,
  actionId: action.id,
  actor: 'operator',
  gateStatusBefore,
  evidenceSnapshot: scenario.knownFacts,
  decisionReason: 'Synthetic mock receipt shape only; no execution side effects.',
  reversibility: action.actionType === 'internal' ? 'reversible' : 'reviewRequired',
  externalSideEffects: 'none',
  createdAt,
});
