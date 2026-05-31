import type { SignalScenario } from '../model/types';

export const scenarios: SignalScenario[] = [
  {
    id: 'scenario-quality-sample-drift',
    title: 'Quality sample drift needs confirming evidence',
    kind: 'qualitySampleDrift',
    sourceLabel: 'synthetic quality review queue',
    observedAt: '2026-05-30T10:00:00.000Z',
    affectedBrands: ['Brand Atlas'],
    affectedSurfaces: ['pilot format', 'review bench'],
    signalMagnitude: 82,
    knownFacts: [
      { id: 'fact-sample-variance', label: 'quality sample drift observed', strength: 'observed', detail: 'Synthetic samples moved outside a generic demo tolerance band.' },
      { id: 'fact-repeat-request', label: 'repeat review requested', strength: 'observed', detail: 'A second internal check is queued for the same invented surface.' },
      { id: 'fact-surface-contained', label: 'surface appears bounded', strength: 'derived', detail: 'The current packet points to one pilot format and one review bench only.' },
    ],
    inferredRisks: [
      { id: 'risk-quality-drift', label: 'quality sample drift', riskLevel: 'high', rationale: 'The signal may affect release confidence if confirming evidence appears.' },
      { id: 'risk-premature-hold', label: 'premature hold risk', riskLevel: 'medium', rationale: 'A hold recommendation could overstate a thin synthetic sample packet.' },
    ],
    evidenceGaps: [
      { id: 'gap-confirming-sample', label: 'confirming-sample-proof', requiredFor: ['quality-hold-review', 'public-quality-update'], severityImpact: 'none', confidenceImpact: 30 },
      { id: 'gap-handling-window', label: 'handling-window-proof', requiredFor: ['quality-hold-review'], severityImpact: 'none', confidenceImpact: 12 },
    ],
    recommendedChecks: [
      'Compare a second synthetic sample set before any hold review.',
      'Confirm whether the affected surface is local or broader.',
      'Record synthetic evidence only in the review packet.',
    ],
    gatedActions: [
      { id: 'investigate-quality', label: 'Investigate internally', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'quality-hold-review', label: 'Mock quality hold review', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['confirming-sample-proof', 'handling-window-proof'] },
      { id: 'public-quality-update', label: 'Public action blocked', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['confirming-sample-proof'], policyBlocked: true },
    ],
  },
  {
    id: 'scenario-claims-review-blocked',
    title: 'Claims review blocks channel copy',
    kind: 'claimsReviewBlocked',
    sourceLabel: 'synthetic claims review queue',
    observedAt: '2026-05-30T11:00:00.000Z',
    affectedBrands: ['Brand Beacon'],
    affectedSurfaces: ['draft channel note', 'review copy deck'],
    signalMagnitude: 64,
    knownFacts: [
      { id: 'fact-draft-copy', label: 'claims review draft exists', strength: 'observed', detail: 'A synthetic note is waiting for internal review.' },
      { id: 'fact-proof-missing', label: 'substantiation gap noted', strength: 'observed', detail: 'The packet names missing proof rather than implying a supported claim.' },
      { id: 'fact-human-review-open', label: 'human review not cleared', strength: 'observed', detail: 'No approval state is present for public or channel copy.' },
    ],
    inferredRisks: [
      { id: 'risk-substantiation', label: 'substantiation gap', riskLevel: 'medium', rationale: 'Missing proof should block public-facing action.' },
      { id: 'risk-overclaim', label: 'public action blocked', riskLevel: 'high', rationale: 'Publishing without proof would turn an internal draft into an unsafe external message.' },
    ],
    evidenceGaps: [
      { id: 'gap-proof', label: 'substantiation-proof', requiredFor: ['release-channel-claim', 'publish-public-claim'], severityImpact: 'medium', confidenceImpact: 24 },
      { id: 'gap-review', label: 'reviewer-approval-proof', requiredFor: ['release-channel-claim', 'publish-public-claim'], severityImpact: 'low', confidenceImpact: 10 },
    ],
    recommendedChecks: [
      'Request the synthetic substantiation proof before channel copy changes.',
      'Draft internal-only reviewer questions.',
      'Keep public action blocked until human review is explicit.',
    ],
    gatedActions: [
      { id: 'draft-internal-note', label: 'Draft internal note', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'release-channel-claim', label: 'Release channel claim', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['substantiation-proof', 'reviewer-approval-proof'] },
      { id: 'publish-public-claim', label: 'Publish public claim', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['substantiation-proof', 'reviewer-approval-proof'] },
    ],
  },
  {
    id: 'scenario-channel-mismatch',
    title: 'Channel feedback cluster does not prove sustained demand',
    kind: 'channelMismatch',
    sourceLabel: 'synthetic channel feedback cluster',
    observedAt: '2026-05-30T12:00:00.000Z',
    affectedBrands: ['Brand Cedar'],
    affectedSurfaces: ['channel feedback cluster', 'planning note'],
    signalMagnitude: 78,
    knownFacts: [
      { id: 'fact-high-chatter', label: 'high chatter cluster', strength: 'observed', detail: 'Invented comments are clustered in one generic channel window.' },
      { id: 'fact-single-source', label: 'single-source feedback only', strength: 'observed', detail: 'No independent proof field is present for demand.' },
      { id: 'fact-no-repeat-window', label: 'no repeat window yet', strength: 'observed', detail: 'The synthetic packet has not repeated across a second review window.' },
    ],
    inferredRisks: [
      { id: 'risk-amplification', label: 'amplification risk', riskLevel: 'high', rationale: 'High chatter could tempt over-expansion before independent proof exists.' },
      { id: 'risk-channel-mismatch', label: 'channel mismatch', riskLevel: 'medium', rationale: 'A feedback cluster may not represent broader readiness or demand.' },
    ],
    evidenceGaps: [
      { id: 'gap-independent-proof', label: 'independent-proof', requiredFor: ['expand-channel-copy', 'publish-demand-note'], severityImpact: 'none', confidenceImpact: 70 },
      { id: 'gap-repeat-window', label: 'repeat-window-proof', requiredFor: ['expand-channel-copy'], severityImpact: 'none', confidenceImpact: 30 },
    ],
    recommendedChecks: [
      'Wait for an independent proof field before treating chatter as demand.',
      'Compare the cluster against a second synthetic review window.',
      'Keep expansion language internal until proof improves.',
    ],
    gatedActions: [
      { id: 'log-channel-cluster', label: 'Log channel feedback cluster', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'expand-channel-copy', label: 'Expand channel copy', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['independent-proof', 'repeat-window-proof'] },
      { id: 'publish-demand-note', label: 'Publish demand note', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['independent-proof'] },
    ],
  },
  {
    id: 'scenario-launch-readiness-mismatch',
    title: 'New format readiness mismatch blocks expansion',
    kind: 'launchReadinessMismatch',
    sourceLabel: 'synthetic new format readiness review',
    observedAt: '2026-05-30T13:00:00.000Z',
    affectedBrands: ['Brand Drift', 'Brand Ember'],
    affectedSurfaces: ['new format readiness', 'allocation review', 'field guidance'],
    signalMagnitude: 74,
    knownFacts: [
      { id: 'fact-score-below-threshold', label: 'readiness score below threshold', strength: 'observed', detail: 'An invented readiness score is below the generic review threshold.' },
      { id: 'fact-format-proof-missing', label: 'new format proof missing', strength: 'observed', detail: 'The packet lacks an independent check for the new format.' },
      { id: 'fact-cross-brand-surface', label: 'cross-brand surface touched', strength: 'derived', detail: 'Two invented brands share the same launch review surface.' },
    ],
    inferredRisks: [
      { id: 'risk-readiness-mismatch', label: 'new format readiness mismatch', riskLevel: 'high', rationale: 'Expansion could outpace readiness evidence.' },
      { id: 'risk-allocation-pressure', label: 'retail allocation pressure', riskLevel: 'medium', rationale: 'Allocation pressure could bias the review before proof is complete.' },
    ],
    evidenceGaps: [
      { id: 'gap-readiness-threshold', label: 'readiness-threshold-proof', requiredFor: ['expand-new-format', 'amplify-readiness-note'], severityImpact: 'medium', confidenceImpact: 22 },
      { id: 'gap-format-proof', label: 'format-proof', requiredFor: ['expand-new-format'], severityImpact: 'low', confidenceImpact: 16 },
    ],
    recommendedChecks: [
      'Confirm the synthetic readiness threshold before expanding the format.',
      'Ask for independent format proof from a second reviewer.',
      'Separate allocation pressure from readiness evidence in the review note.',
    ],
    gatedActions: [
      { id: 'record-readiness-gap', label: 'Record readiness gap', actionType: 'internal', requiresHumanApproval: false, requiredEvidence: [] },
      { id: 'expand-new-format', label: 'Expand new format', actionType: 'channel', requiresHumanApproval: true, requiredEvidence: ['readiness-threshold-proof', 'format-proof'] },
      { id: 'amplify-readiness-note', label: 'Amplify readiness note', actionType: 'public', requiresHumanApproval: true, requiredEvidence: ['readiness-threshold-proof'] },
    ],
  },
];
