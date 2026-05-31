import { toActionDisplay } from './gates';
import type { DecisionReceipt, GatedAction, GateStatus, SignalScenario } from './types';

export type ReceiptExecutionResult =
  | { ok: true; receipt: DecisionReceipt; nextGateStatus: Extract<GateStatus, 'executedMock'> }
  | { ok: false; gateStatus: GateStatus; blockedReasons: string[] };

export interface ReceiptExecutionOptions {
  createdAt?: string;
}

const defaultCreatedAt = '2026-05-30T12:00:00.000Z';
const nonInternalReceiptBlock = 'Only internal mock actions can create local receipts in this demo.';
const allowedInternalDecisionReason = 'Allowed internal mock action executed locally with no external side effects.';

const assertReceiptEligible = (action: GatedAction, gateStatusBefore: GateStatus): void => {
  if (action.actionType !== 'internal') throw new Error(nonInternalReceiptBlock);
  if (gateStatusBefore !== 'available') throw new Error('Only available actions can create local receipts.');
};

export const createReceiptShape = (
  scenario: SignalScenario,
  action: GatedAction,
  gateStatusBefore: GateStatus,
  createdAt = defaultCreatedAt,
): DecisionReceipt => {
  assertReceiptEligible(action, gateStatusBefore);

  return {
    receiptId: `receipt-${scenario.id}-${action.id}`,
    scenarioId: scenario.id,
    actionId: action.id,
    actor: 'operator',
    gateStatusBefore,
    evidenceSnapshot: scenario.knownFacts,
    decisionReason: allowedInternalDecisionReason,
    reversibility: action.actionType === 'internal' ? 'reversible' : 'reviewRequired',
    externalSideEffects: 'none',
    createdAt,
  };
};

export const executeReceiptAction = (
  scenario: SignalScenario,
  action: GatedAction,
  options: ReceiptExecutionOptions = {},
): ReceiptExecutionResult => {
  const actionDisplay = toActionDisplay(scenario, action);

  if (action.actionType !== 'internal') {
    return {
      ok: false,
      gateStatus: 'blockedByPolicy',
      blockedReasons: [nonInternalReceiptBlock],
    };
  }

  if (actionDisplay.gateStatus !== 'available') {
    return {
      ok: false,
      gateStatus: actionDisplay.gateStatus,
      blockedReasons: actionDisplay.blockedReasons,
    };
  }

  return {
    ok: true,
    receipt: createReceiptShape(scenario, action, actionDisplay.gateStatus, options.createdAt ?? defaultCreatedAt),
    nextGateStatus: 'executedMock',
  };
};
