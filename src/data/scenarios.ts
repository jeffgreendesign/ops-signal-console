import type { SignalScenario } from '../model/types';

export const scenarios: SignalScenario[] = [
  {
    id: 'scenario-quality-sample-drift',
    title: 'Quality sample drift needs review',
    kind: 'qualitySampleDrift',
    sourceLabel: 'synthetic QA review queue',
    observedAt: '2026-05-30T10:00:00.000Z',
    affectedBrands: ['Brand Atlas'],
    affectedSurfaces: ['pilot format', 'review bench'],
    signalMagnitude: 82,
    knownFacts: [
      { id: 'fact-sample-variance', label: 'sample variance observed', strength: 'observed', detail: 'Synthetic samples moved outside a demo tolerance band.' },
      { id: 'fact-repeat-request', label: 'repeat review requested', strength: 'observed', detail: 'A second internal check is queued.' },
    ],
    inferredRisks: [
      { id: 'risk-quality-drift', label: 'quality sample drift', riskLevel: 'high', rationale: 'The signal may affect more than one demo surface.' },
    ],
    evidenceGaps: [
      { id: 'gap-confirming-sample', label: 'confirming-sample', requiredFor: ['quality-hold'], severityImpact: 'none', confidenceImpact: 25 },
    ],
    recommendedChecks: ['Compare a second synthetic sample set', 'Confirm whether the affected surface is local or broader'],
    gatedActions: [
      { id: 'investigate', label: 'Investigate internally', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'quality-hold', label: 'Mock quality hold', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['confirming-sample'] },
    ],
  },
  {
    id: 'scenario-claims-review-blocked',
    title: 'Claims review blocks channel copy',
    kind: 'claimsReviewBlocked',
    sourceLabel: 'synthetic claims review queue',
    observedAt: '2026-05-30T11:00:00.000Z',
    affectedBrands: ['Brand Beacon'],
    affectedSurfaces: ['draft channel note'],
    signalMagnitude: 64,
    knownFacts: [
      { id: 'fact-draft-copy', label: 'draft copy exists', strength: 'observed', detail: 'A synthetic note is waiting for internal review.' },
    ],
    inferredRisks: [
      { id: 'risk-substantiation', label: 'substantiation gap', riskLevel: 'medium', rationale: 'Missing proof should block public-facing action.' },
    ],
    evidenceGaps: [
      { id: 'gap-proof', label: 'substantiation-packet', requiredFor: ['publish-channel-note'], severityImpact: 'medium', confidenceImpact: 20 },
    ],
    recommendedChecks: ['Request the synthetic substantiation packet', 'Draft internal-only reviewer questions'],
    gatedActions: [
      { id: 'draft-internal-note', label: 'Draft internal note', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'publish-channel-note', label: 'Publish channel note', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['substantiation-packet'] },
    ],
  },
];
