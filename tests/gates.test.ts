import { describe, expect, it } from 'vitest';
import { deriveActionState, deriveAllowedInternalActions, deriveBlockedActions } from '../src/model/gates';
import type { GatedAction, SignalScenario } from '../src/model/types';

const actions: GatedAction[] = [
  { id: 'investigate', label: 'Investigate internally', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
  { id: 'public-note', label: 'Publish channel note', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['substantiation-packet'] },
  { id: 'escalate', label: 'Escalate review', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['blast-radius-proof'] },
];

const scenario: SignalScenario = {
  id: 'scenario-test-gates',
  title: 'Synthetic claims review blocked',
  kind: 'claimsReviewBlocked',
  sourceLabel: 'synthetic claims queue',
  observedAt: '2026-05-30T10:00:00.000Z',
  affectedBrands: ['Brand Beacon'],
  affectedSurfaces: ['draft channel note'],
  signalMagnitude: 65,
  knownFacts: [{ id: 'fact-1', label: 'draft requires review', strength: 'observed', detail: 'Synthetic copy is staged for internal review only.' }],
  inferredRisks: [{ id: 'risk-1', label: 'substantiation gap', riskLevel: 'medium', rationale: 'Missing proof should block public action.' }],
  evidenceGaps: [
    { id: 'gap-proof', label: 'substantiation-packet', requiredFor: ['public-note'], severityImpact: 'medium', confidenceImpact: 20 },
    { id: 'gap-blast', label: 'blast-radius-proof', requiredFor: ['escalate'], severityImpact: 'none', confidenceImpact: 10 },
  ],
  recommendedChecks: ['Request substantiation packet'],
  gatedActions: actions,
};

describe('action gates', () => {
  it('blocks public and channel actions when required proof is missing', () => {
    const blocked = deriveBlockedActions(scenario);

    expect(blocked.map((action) => action.id)).toEqual(['public-note', 'escalate']);
    expect(blocked.every((action) => action.gateStatus === 'needsEvidence')).toBe(true);
  });

  it('does not allow approval-required actions to execute without approval state', () => {
    const approvedEvidenceScenario = { ...scenario, evidenceGaps: [] } satisfies SignalScenario;

    expect(deriveBlockedActions(approvedEvidenceScenario).map((action) => [action.id, action.gateStatus])).toEqual([
      ['public-note', 'needsHumanApproval'],
      ['escalate', 'needsHumanApproval'],
    ]);
  });

  it('allows safe internal actions while public actions remain gated', () => {
    expect(deriveAllowedInternalActions(scenario).map((action) => action.id)).toEqual(['investigate']);
    expect(deriveActionState(scenario)).toBe('blocked');
  });
});
