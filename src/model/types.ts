export type EvidenceStrength = 'observed' | 'derived' | 'missing';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type BlastRadius = 'local' | 'surface' | 'system' | 'portfolio';
export type ActionState = 'observe' | 'review' | 'blocked';
export type GateStatus = 'available' | 'needsEvidence' | 'needsHumanApproval' | 'blockedByPolicy' | 'executedMock' | 'rolledBackMock';
export type ScenarioKind =
  | 'qualitySampleDrift'
  | 'claimsReviewBlocked'
  | 'retailAllocationPressure'
  | 'channelMismatch'
  | 'launchReadinessMismatch'
  | 'ingredientConstraint';

export interface EvidenceItem {
  id: string;
  label: string;
  strength: EvidenceStrength;
  detail: string;
}

export interface InferredRisk {
  id: string;
  label: string;
  riskLevel: RiskLevel;
  rationale: string;
}

export interface EvidenceGap {
  id: string;
  label: string;
  requiredFor: string[];
  severityImpact: 'none' | 'low' | 'medium' | 'high';
  confidenceImpact: number;
}

export interface GatedAction {
  id: string;
  label: string;
  actionType: 'internal' | 'channel' | 'public';
  requiresHumanApproval: boolean;
  requiredEvidence: string[];
  approved?: boolean;
  policyBlocked?: boolean;
}

export interface SignalScenario {
  id: string;
  title: string;
  kind: ScenarioKind;
  sourceLabel: string;
  observedAt: string;
  affectedBrands: string[];
  affectedSurfaces: string[];
  signalMagnitude: number;
  knownFacts: EvidenceItem[];
  inferredRisks: InferredRisk[];
  evidenceGaps: EvidenceGap[];
  recommendedChecks: string[];
  gatedActions: GatedAction[];
}

export interface GatedActionDisplay extends GatedAction {
  gateStatus: GateStatus;
  blockedReasons: string[];
}

export interface DecisionReceipt {
  receiptId: string;
  scenarioId: string;
  actionId: string;
  actor: 'operator';
  gateStatusBefore: GateStatus;
  evidenceSnapshot: EvidenceItem[];
  decisionReason: string;
  reversibility: 'reversible' | 'reviewRequired' | 'notAvailable';
  externalSideEffects: 'none';
  createdAt: string;
}

export interface DisplayModel {
  scenarioId: string;
  title: string;
  sourceLabel: string;
  severity: { score: number; label: RiskLevel };
  confidence: { score: number; label: 'low' | 'medium' | 'high' };
  evidenceCompleteness: { score: number; label: 'thin' | 'partial' | 'supported' };
  blastRadius: BlastRadius;
  actionState: ActionState;
  knownFacts: EvidenceItem[];
  inferredRisks: InferredRisk[];
  evidenceGaps: EvidenceGap[];
  recommendedChecks: string[];
  proofSummary: {
    posture: string;
    blockedBecause: string[];
    gapToActionMap: string[];
  };
  allowedInternalActions: GatedActionDisplay[];
  blockedActions: GatedActionDisplay[];
}
