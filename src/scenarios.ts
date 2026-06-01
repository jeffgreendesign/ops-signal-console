import { scenarios as signalScenarios } from './data/scenarios';
import { buildDisplayModel } from './model/scoring';
import type { BlastRadius, GateStatus, RiskLevel, SignalScenario } from './model/types';

export type { BlastRadius };
export type Scenario = SignalScenario;

type DisplayActionState = ReturnType<typeof buildDisplayModel>['actionState'];

export type SignalMagnitude = Record<'severityScore', number> &
  Record<'blastRadius', BlastRadius> &
  Record<'evidenceCompleteness', number> &
  Record<'actionState', DisplayActionState>;

export interface ContextItem {
  label: string;
  value: string;
}

export interface ConsoleLane {
  label: string;
  items: string[];
}

export interface ConsoleAction {
  id: string;
  label: string;
  actionType: 'internal' | 'channel' | 'public';
  gateStatus: GateStatus;
  disabled?: boolean;
  disabledReason?: string;
}

export interface ActionabilityPath {
  id: string;
  label: string;
  state: 'available' | 'blocked' | 'needsApproval' | 'needsEvidence';
  actionType: 'internal' | 'channel' | 'public';
  gateStatus: GateStatus;
  primaryReason: string;
  proofNeeded: string[];
  gateDetails: { label: string; value: string }[];
  nextChecks: string[];
  externalSideEffects: 'none';
}

export interface ActionabilitySummary {
  posture: string;
  availableNow: ActionabilityPath[];
  blocked: ActionabilityPath[];
  nextProof: string[];
}

export interface ConsoleView {
  header: string;
  subheader: string;
  context: ContextItem[];
  riskBadge: RiskLevel;
  confidenceLabel: string;
  magnitude: SignalMagnitude;
  decisionFrame: {
    decisionStakes: string;
    controlPattern: string;
    reviewerSignals: string[];
  };
  proofSummary: ReturnType<typeof buildDisplayModel>['proofSummary'];
  actionability: ActionabilitySummary;
  lanes: ConsoleLane[];
  nextChecks: string[];
  actions: ConsoleAction[];
}

export const scenarios = signalScenarios;

export const kindLabel = (kind: SignalScenario['kind']): string =>
  kind.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);

const formatObservedAt = (observedAt: string): string => observedAt.slice(0, 10);

const decisionCopy = (scenario: SignalScenario): ConsoleView['decisionFrame'] => {
  const surfaceScope = scenario.affectedSurfaces.length > 1 ? 'cross-surface' : 'surface-level';
  const approvalScope = scenario.gatedActions.some((action) => action.actionType === 'public')
    ? 'public/channel actions'
    : 'mock actions';

  return {
    decisionStakes: `${surfaceScope} review for ${scenario.affectedBrands.join(', ')}`,
    controlPattern: `Keep ${approvalScope} gated until deterministic proof clears.`,
    reviewerSignals: [
      'Facts, inferences, evidence gaps, and action gates render as separate lanes.',
      'Scores and action readiness come from the deterministic display model.',
      'Mock actions stay local and require evidence or human approval before unsafe steps.',
    ],
  };
};

const gapText = (gap: ReturnType<typeof buildDisplayModel>['evidenceGaps'][number]): string =>
  `${gap.label}: required for ${gap.requiredFor.join(', ')}; confidence impact ${gap.confidenceImpact}`;

const blockedActionReason = (reasons: string[]): string =>
  reasons.length > 0 ? reasons.join(' ') : 'Human approval required before mock execution.';

const actionabilityState = (action: ReturnType<typeof buildDisplayModel>['blockedActions'][number]): ActionabilityPath['state'] => {
  if (action.gateStatus === 'needsEvidence') return 'needsEvidence';
  if (action.gateStatus === 'needsHumanApproval') return 'needsApproval';
  return 'blocked';
};

const gateDetailsForAction = (action: ReturnType<typeof buildDisplayModel>['blockedActions'][number]): ActionabilityPath['gateDetails'] => [
  { label: 'Evidence required', value: action.requiredEvidence.length ? action.requiredEvidence.join(', ') : 'none' },
  { label: 'Human approval', value: action.requiresHumanApproval ? 'required' : 'not required' },
  { label: 'Action surface', value: action.actionType },
  { label: 'External side effects', value: 'none' },
];

const buildActionabilitySummary = (display: ReturnType<typeof buildDisplayModel>): ActionabilitySummary => {
  const nextProof = Array.from(new Set(display.blockedActions.flatMap((action) => action.requiredEvidence)));

  return {
    posture: display.proofSummary.posture,
    availableNow: display.allowedInternalActions.map((action) => ({
      id: action.id,
      label: action.label,
      state: 'available',
      actionType: action.actionType,
      gateStatus: action.gateStatus,
      primaryReason: 'Local internal review is available with no external side effects.',
      proofNeeded: [],
      gateDetails: gateDetailsForAction(action),
      nextChecks: display.recommendedChecks,
      externalSideEffects: 'none',
    })),
    blocked: display.blockedActions.map((action) => ({
      id: action.id,
      label: action.label,
      state: actionabilityState(action),
      actionType: action.actionType,
      gateStatus: action.gateStatus,
      primaryReason: blockedActionReason(action.blockedReasons),
      proofNeeded: action.requiredEvidence,
      gateDetails: gateDetailsForAction(action),
      nextChecks: display.recommendedChecks,
      externalSideEffects: 'none',
    })),
    nextProof,
  };
};

export function buildConsoleView(scenario: Scenario): ConsoleView {
  const display = buildDisplayModel(scenario);
  const severityScore = display.severity.score;
  const blastRadius = display.blastRadius;
  const evidenceCompleteness = display.evidenceCompleteness.score;
  const actionState = display.actionState;

  return {
    header: `${scenario.affectedBrands.join(', ')} · ${display.title}`,
    subheader: `${formatObservedAt(scenario.observedAt)} · ${display.sourceLabel}`,
    context: [
      { label: 'Brands', value: scenario.affectedBrands.join(', ') },
      { label: 'Surfaces', value: scenario.affectedSurfaces.join(', ') },
      { label: 'Signal', value: kindLabel(scenario.kind) },
      { label: 'Source', value: display.sourceLabel },
      { label: 'Observed', value: formatObservedAt(scenario.observedAt) },
      { label: 'Evidence clarity', value: `${display.evidenceCompleteness.label} · ${display.evidenceCompleteness.score}/100` },
    ],
    riskBadge: display.severity.label,
    confidenceLabel: `${display.confidence.label} confidence · ${display.confidence.score}/100`,
    magnitude: {
      severityScore,
      blastRadius,
      evidenceCompleteness,
      actionState,
    },
    decisionFrame: decisionCopy(scenario),
    proofSummary: display.proofSummary,
    actionability: buildActionabilitySummary(display),
    lanes: [
      { label: 'Known facts', items: display.knownFacts.map((fact) => `${fact.label}: ${fact.detail}`) },
      { label: 'Inferred risks', items: display.inferredRisks.map((risk) => `${risk.label}: ${risk.rationale}`) },
      { label: 'Evidence gaps', items: display.evidenceGaps.map(gapText) },
      {
        label: 'Gated actions',
        items: [...display.allowedInternalActions, ...display.blockedActions].map(
          (action) => `${action.label}: ${action.gateStatus}${action.blockedReasons.length ? `; ${action.blockedReasons.join(' ')}` : ''}`
        ),
      },
    ],
    nextChecks: display.recommendedChecks,
    actions: [
      ...display.allowedInternalActions.map((action) => ({
        id: action.id,
        label: action.label,
        actionType: action.actionType,
        gateStatus: action.gateStatus,
      })),
      ...display.blockedActions.map((action) => ({
        id: action.id,
        label: action.label,
        actionType: action.actionType,
        gateStatus: action.gateStatus,
        disabled: true,
        disabledReason: blockedActionReason(action.blockedReasons),
      })),
    ],
  };
}
