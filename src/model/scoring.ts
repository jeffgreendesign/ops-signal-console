import { deriveActionState, deriveAllowedInternalActions, deriveBlockedActions } from './gates';
import type { BlastRadius, DisplayModel, RiskLevel, SignalScenario } from './types';

const riskScores: Record<RiskLevel, number> = { low: 20, medium: 50, high: 80, critical: 95 };

const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

export const calculateSeverity = (scenario: SignalScenario): number => {
  const highestRisk = Math.max(...scenario.inferredRisks.map((risk) => riskScores[risk.riskLevel]), 0);
  const severityGapImpact = scenario.evidenceGaps.reduce((total, gap) => {
    if (gap.severityImpact === 'high') return total + 15;
    if (gap.severityImpact === 'medium') return total + 8;
    if (gap.severityImpact === 'low') return total + 3;
    return total;
  }, 0);

  return clamp(Math.max(scenario.signalMagnitude, highestRisk) + severityGapImpact);
};

export const calculateEvidenceCompleteness = (scenario: SignalScenario): number => {
  const observed = scenario.knownFacts.filter((fact) => fact.strength === 'observed').length;
  const derived = scenario.knownFacts.filter((fact) => fact.strength === 'derived').length;
  const missing = scenario.evidenceGaps.length;
  const denominator = observed + derived + missing;
  if (denominator === 0) return 0;
  return clamp(((observed + derived * 0.5) / denominator) * 100);
};

export const calculateConfidence = (scenario: SignalScenario): number => {
  const base = calculateEvidenceCompleteness(scenario);
  const missingPenalty = scenario.evidenceGaps.reduce((total, gap) => total + gap.confidenceImpact, 0) / 4;
  const derivedPenalty = scenario.knownFacts.filter((fact) => fact.strength === 'derived').length * 5;
  return clamp(base - missingPenalty - derivedPenalty);
};

export const deriveBlastRadius = (scenario: SignalScenario): BlastRadius => {
  if (scenario.affectedBrands.length > 2) return 'portfolio';
  if (scenario.affectedSurfaces.length > 2) return 'system';
  if (scenario.affectedSurfaces.length > 1 || scenario.affectedBrands.length > 1) return 'surface';
  return 'local';
};

const riskLabel = (score: number): RiskLevel => {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

const confidenceLabel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 75) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
};

const evidenceLabel = (score: number): 'thin' | 'partial' | 'supported' => {
  if (score >= 75) return 'supported';
  if (score >= 40) return 'partial';
  return 'thin';
};

export { deriveActionState, deriveAllowedInternalActions, deriveBlockedActions };

const buildProofSummary = (scenario: SignalScenario, blockedActions: ReturnType<typeof deriveBlockedActions>): DisplayModel['proofSummary'] => {
  const blockingGapLabels = new Set(
    scenario.evidenceGaps
      .filter((gap) => blockedActions.some((action) => action.requiredEvidence.includes(gap.label)))
      .map((gap) => gap.label)
  );
  const missingEvidence = [...blockingGapLabels];
  const needsHumanApproval = blockedActions.some((action) => action.requiresHumanApproval && !action.approved);
  const policyBlocked = blockedActions.some((action) => action.policyBlocked);
  const gapToActionMap = scenario.evidenceGaps.flatMap((gap) =>
    blockedActions
      .filter((action) => action.requiredEvidence.includes(gap.label))
      .map((action) => `${gap.label} blocks ${action.label}`)
  );

  const blockedBecause = [
    ...(missingEvidence.length > 0 ? [`Missing required evidence: ${missingEvidence.join(', ')}.`] : []),
    ...(needsHumanApproval ? ['Human approval is still required for gated action.'] : []),
    ...(policyBlocked ? ['Demo policy blocks external or irreversible action.'] : []),
  ];

  return {
    posture:
      blockedBecause.length > 0
        ? 'Action remains blocked until required proof and human approval clear.'
        : 'Internal review path is available; continue observing before wider action.',
    blockedBecause,
    gapToActionMap,
  };
};

export const buildDisplayModel = (scenario: SignalScenario): DisplayModel => {
  const severityScore = calculateSeverity(scenario);
  const confidenceScore = calculateConfidence(scenario);
  const evidenceScore = calculateEvidenceCompleteness(scenario);
  const allowedInternalActions = deriveAllowedInternalActions(scenario);
  const blockedActions = deriveBlockedActions(scenario);

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    sourceLabel: scenario.sourceLabel,
    severity: { score: severityScore, label: riskLabel(severityScore) },
    confidence: { score: confidenceScore, label: confidenceLabel(confidenceScore) },
    evidenceCompleteness: { score: evidenceScore, label: evidenceLabel(evidenceScore) },
    blastRadius: deriveBlastRadius(scenario),
    actionState: deriveActionState(scenario),
    knownFacts: scenario.knownFacts,
    inferredRisks: scenario.inferredRisks,
    evidenceGaps: scenario.evidenceGaps,
    recommendedChecks: scenario.recommendedChecks,
    proofSummary: buildProofSummary(scenario, blockedActions),
    allowedInternalActions,
    blockedActions,
  };
};
