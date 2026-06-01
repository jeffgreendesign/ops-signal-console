import { describe, expect, it } from 'vitest';
import { executeReceiptAction } from '../src/model/receipts';
import { scenarios } from '../src/data/scenarios';
import type { GatedAction, SignalScenario } from '../src/model/types';

const baseActions: GatedAction[] = [
  {
    id: 'inspect-internally',
    label: 'Inspect internally',
    actionType: 'internal',
    requiresHumanApproval: false,
    requiredEvidence: [],
  },
  {
    id: 'hold-review',
    label: 'Hold review',
    actionType: 'internal',
    requiresHumanApproval: false,
    requiredEvidence: ['confirming-proof'],
  },
  {
    id: 'approval-review',
    label: 'Approval review',
    actionType: 'internal',
    requiresHumanApproval: true,
    requiredEvidence: [],
  },
  {
    id: 'public-note',
    label: 'Public note',
    actionType: 'public',
    requiresHumanApproval: true,
    requiredEvidence: [],
    approved: true,
  },
];

const scenario: SignalScenario = {
  id: 'scenario-receipt-test',
  title: 'Synthetic receipt test',
  kind: 'qualitySampleDrift',
  sourceLabel: 'synthetic review bench',
  observedAt: '2026-05-30T10:00:00.000Z',
  affectedBrands: ['Brand Atlas'],
  affectedSurfaces: ['review bench'],
  signalMagnitude: 62,
  knownFacts: [
    {
      id: 'fact-1',
      label: 'internal review opened',
      strength: 'observed',
      detail: 'Synthetic operator opened an internal review.',
    },
  ],
  inferredRisks: [
    {
      id: 'risk-1',
      label: 'review drift',
      riskLevel: 'medium',
      rationale: 'Synthetic signal may need a follow-up check.',
    },
  ],
  evidenceGaps: [
    {
      id: 'gap-confirming-proof',
      label: 'confirming-proof',
      requiredFor: ['hold-review'],
      severityImpact: 'low',
      confidenceImpact: 20,
    },
  ],
  recommendedChecks: ['Request confirming proof'],
  gatedActions: baseActions,
};

const action = (id: string): GatedAction => {
  const found = baseActions.find((candidate) => candidate.id === id);
  expect(found).toBeDefined();
  return found!;
};

describe('typed decision receipts', () => {
  it('creates exactly one typed receipt for an allowed internal action', () => {
    const result = executeReceiptAction(scenario, action('inspect-internally'), {
      createdAt: '2026-05-30T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected receipt result');
    expect(result.nextGateStatus).toBe('executedMock');
    expect(Array.isArray(result.receipt)).toBe(false);
    expect(result.receipt).toEqual({
      receiptId: 'receipt-scenario-receipt-test-inspect-internally',
      scenarioId: 'scenario-receipt-test',
      actionId: 'inspect-internally',
      actor: 'operator',
      gateStatusBefore: 'available',
      evidenceSnapshot: scenario.knownFacts,
      decisionReason: 'Allowed internal mock action executed locally with no external side effects.',
      reversibility: 'reversible',
      externalSideEffects: 'none',
      createdAt: '2026-05-30T12:00:00.000Z',
    });
  });

  it('does not create a receipt for a blocked action', () => {
    const result = executeReceiptAction(scenario, action('hold-review'));

    expect(result).toEqual({
      ok: false,
      gateStatus: 'needsEvidence',
      blockedReasons: ['Missing required evidence: confirming-proof.'],
    });
  });

  it('does not execute approval-required actions without approval state', () => {
    const result = executeReceiptAction({ ...scenario, evidenceGaps: [] }, action('approval-review'));

    expect(result).toEqual({
      ok: false,
      gateStatus: 'needsHumanApproval',
      blockedReasons: ['Human approval required before mock execution.'],
    });
  });

  it('creates only a typed local mock receipt for the opportunity scenario internal action', () => {
    const opportunity = scenarios.find((candidate) => candidate.kind === 'opportunitySignal');
    expect(opportunity).toBeDefined();
    const internalAction = opportunity!.gatedActions.find((candidate) => candidate.id === 'log-opportunity-packet');
    const channelAction = opportunity!.gatedActions.find((candidate) => candidate.id === 'expand-channel-test');
    expect(internalAction).toBeDefined();
    expect(channelAction).toBeDefined();
    const publicResult = executeReceiptAction({ ...scenario, evidenceGaps: [] }, action('public-note'));

    const internalResult = executeReceiptAction(opportunity!, internalAction!, {
      createdAt: '2026-05-30T14:30:00.000Z',
    });
    const channelResult = executeReceiptAction(opportunity!, channelAction!);

    expect(internalResult.ok).toBe(true);
    if (!internalResult.ok) throw new Error('expected opportunity receipt result');
    expect(internalResult.receipt).toMatchObject({
      scenarioId: 'scenario-promising-channel-lift',
      actionId: 'log-opportunity-packet',
      gateStatusBefore: 'available',
      externalSideEffects: 'none',
      reversibility: 'reversible',
      createdAt: '2026-05-30T14:30:00.000Z',
    });
    expect(channelResult).toEqual({
      ok: false,
      gateStatus: 'blockedByPolicy',
      blockedReasons: ['Only internal mock actions can create local receipts in this demo.'],
    });
    expect(publicResult).toEqual({
      ok: false,
      gateStatus: 'blockedByPolicy',
      blockedReasons: ['Only internal mock actions can create local receipts in this demo.'],
    });
  });
});
