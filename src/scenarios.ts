export type RiskLevel = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type BlastRadius = 'local' | 'surface' | 'system' | 'org';
export type ActionState = 'observe' | 'review' | 'blocked';
export type SignalType = 'launch' | 'quality' | 'demand' | 'operations' | 'feedback' | 'claims';

export interface SignalMagnitude {
  severityScore: number;
  blastRadius: BlastRadius;
  evidenceCompleteness: number;
  actionState: ActionState;
}

export interface ContextItem {
  label: string;
  value: string;
}

export interface Scenario {
  id: string;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  portfolio: string;
  brand: string;
  vertical: string;
  surface: string;
  signalType: SignalType;
  decisionOwner?: string;
  decisionStakes: string;
  controlPattern: string;
  reviewerSignals: string[];
  risk: RiskLevel;
  confidence: ConfidenceLevel;
  severityScore: number;
  blastRadius: BlastRadius;
  evidenceCompleteness: number;
  actionState: ActionState;
  facts: string[];
  inferences: string[];
  proofGaps: string[];
  recommendedChecks: string[];
  approvalGates: string[];
}

export interface ConsoleLane {
  label: string;
  items: string[];
}

export interface ConsoleAction {
  label: string;
  disabled?: boolean;
  disabledReason?: string;
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
  lanes: ConsoleLane[];
  nextChecks: string[];
  actions: ConsoleAction[];
}

export const actions = [
  { label: 'Acknowledge' },
  { label: 'Investigate' },
  { label: 'Ask for more evidence' },
  { label: 'Request owner review', requiresReviewPath: true },
  { label: 'Hold recommendation', requiresReviewPath: true },
  { label: 'Log evidence gap' }
] as const;

export const scenarios: Scenario[] = [
  {
    id: 'kite-launch-readiness-drift',
    title: 'Kite launch readiness drift across retail test allocation',
    summary: 'Allocation plans and readiness notes diverged before a staged hydration rollout.',
    source: 'Launch readiness monitor',
    timestamp: 'Today, 09:42',
    portfolio: 'Northstar Goods Lab',
    brand: 'Kite',
    vertical: 'Hydration',
    surface: 'Retail test allocation',
    signalType: 'launch',
    decisionOwner: 'Launch council',
    decisionStakes: 'Allocation risk across a staged launch path',
    controlPattern: 'Gate launch guidance until evidence is reconciled',
    reviewerSignals: [
      'Separates stale planning evidence from inferred launch impact',
      'Keeps human approval ahead of irreversible guidance changes',
      'Shows deterministic risk scoring without live system access'
    ],
    risk: 'high',
    confidence: 'medium',
    severityScore: 88,
    blastRadius: 'system',
    evidenceCompleteness: 56,
    actionState: 'blocked',
    facts: [
      'Three launch waves show mismatched pack counts between readiness notes and allocation snapshots.',
      'The drift is concentrated in two test regions with different shelf-date assumptions.',
      'Field readiness checks are marked complete, but the allocation snapshot is older than the latest plan.',
      'All names, sources, and measurements are invented for this static prototype.'
    ],
    inferences: [
      'The staged rollout could create uneven first-week availability if the stale snapshot drives planning.',
      'The most likely cause is a planning handoff gap rather than a supply constraint.',
      'The safest next step is a human review gate before any launch-date guidance changes.'
    ],
    proofGaps: [
      'No live planning tool or allocation system is attached.',
      'The prototype cannot prove which snapshot a launch team would use.',
      'Shelf-date assumptions need a second source before changing the rollout path.'
    ],
    recommendedChecks: [
      'Compare the latest readiness note with the allocation snapshot for each test region.',
      'Ask the launch council to confirm which shelf-date assumption is current.',
      'Check whether the mismatch affects launch timing or only pack placement.'
    ],
    approvalGates: [
      'Do not change launch guidance without launch council approval.',
      'Do not notify field teams from the prototype.',
      'Do not write to planning, allocation, or response systems.'
    ]
  },
  {
    id: 'mesa-sample-quality-review',
    title: 'Mesa sample quality concern before frozen snack pilot',
    summary: 'A small quality-sample cluster suggests texture drift, but sample handling is unresolved.',
    source: 'Quality sample digest',
    timestamp: 'Today, 11:18',
    portfolio: 'Northstar Goods Lab',
    brand: 'Mesa',
    vertical: 'Frozen snacks',
    surface: 'Quality sample review',
    signalType: 'quality',
    decisionOwner: 'Quality review lead',
    decisionStakes: 'Pilot readiness with quality uncertainty',
    controlPattern: 'Require owner review before a hold recommendation',
    reviewerSignals: [
      'Shows confidence can be high while proof still has gaps',
      'Keeps a narrow surface concern from becoming an over-broad stop signal'
    ],
    risk: 'medium',
    confidence: 'high',
    severityScore: 66,
    blastRadius: 'surface',
    evidenceCompleteness: 72,
    actionState: 'review',
    facts: [
      'Five display-safe sample notes describe brittle texture after a pilot-pack thaw cycle.',
      'The notes refer to the same trial lot and a shared handling window.',
      'Temperature witness cards are present for four of five samples.',
      'The signal uses invented lot labels and no real production trace.'
    ],
    inferences: [
      'The issue may be handling-related, but formula or pack-material drift has not been ruled out.',
      'The blast radius appears limited to the pilot surface until more samples are reviewed.',
      'A hold recommendation is premature without a handling-window check.'
    ],
    proofGaps: [
      'One sample lacks a witness card.',
      'No live lab notebook, supplier system, or production system is connected.',
      'The prototype cannot compare this lot against real retained samples.'
    ],
    recommendedChecks: [
      'Review the handling window for all five sample notes.',
      'Compare witness-card coverage against the trial-lot sample map.',
      'Collect a second quality review before changing pilot readiness.'
    ],
    approvalGates: [
      'Require quality review lead approval before recommending a pilot hold.',
      'Do not contact partners from the prototype.',
      'Do not mutate trial-lot, lab, or production systems.'
    ]
  },
  {
    id: 'luma-field-feedback-cluster',
    title: 'Luma field feedback cluster with unclear replenishment impact',
    summary: 'Field notes mention confusing refill cues, but the signal is narrow and still forming.',
    source: 'Field-note cluster',
    timestamp: 'Today, 14:06',
    portfolio: 'Northstar Goods Lab',
    brand: 'Luma',
    vertical: 'Home replenishables',
    surface: 'Field feedback',
    signalType: 'feedback',
    decisionOwner: 'Portfolio ops lead',
    decisionStakes: 'Local signal triage before portfolio-wide copy changes',
    controlPattern: 'Observe one more window before escalation',
    reviewerSignals: [
      'Models uncertainty without forcing a false resolution',
      'Makes low-confidence review paths visible and bounded'
    ],
    risk: 'medium',
    confidence: 'low',
    severityScore: 42,
    blastRadius: 'local',
    evidenceCompleteness: 44,
    actionState: 'observe',
    facts: [
      'Seven invented field notes mention refill timing confusion in one regional test cell.',
      'Notes cluster around a new package insert and a shelf sign with similar language.',
      'No repeat signal appears in the other two test cells.',
      'The scenario uses synthetic observations and display-safe labels only.'
    ],
    inferences: [
      'The refill cue may be unclear, but regional staff wording could be the real driver.',
      'Impact is likely local unless the same cue appears in future test cells.',
      'Observation is safer than immediate content changes until one more note window is reviewed.'
    ],
    proofGaps: [
      'No live field platform, transcript, or sales system is attached.',
      'The prototype cannot inspect the actual package insert or shelf sign.',
      'The signal needs a second time window before escalation.'
    ],
    recommendedChecks: [
      'Compare the package insert language with the shelf sign language.',
      'Ask the portfolio ops lead whether the cue is reused outside the test cell.',
      'Review one additional field-note window before escalating.'
    ],
    approvalGates: [
      'Do not revise package or field language without owner approval.',
      'Do not suppress the cluster until the next note window is reviewed.',
      'Do not create external tasks from synthetic notes.'
    ]
  },
  {
    id: 'arc-allocation-risk-reconciliation-gap',
    title: 'Arc allocation risk review with reconciliation gap',
    summary: 'A portfolio shift improves reach but exposes margin sensitivity and unresolved reconciliation evidence.',
    source: 'Allocation risk review',
    timestamp: 'Today, 16:24',
    portfolio: 'Northstar Goods Lab',
    brand: 'Arc',
    vertical: 'Wellness accessories',
    surface: 'Portfolio allocation review',
    signalType: 'operations',
    decisionOwner: 'Finance review chair',
    decisionStakes: 'Financial exposure before a multi-brand launch shift',
    controlPattern: 'Finance review gate until reconciliation evidence is clear',
    reviewerSignals: [
      'Margin sensitivity made visible before allocation changes',
      'Approval trail separates recommendation from action',
      'Evidence clarity is treated as a product surface, not hidden notes'
    ],
    risk: 'high',
    confidence: 'medium',
    severityScore: 74,
    blastRadius: 'org',
    evidenceCompleteness: 61,
    actionState: 'blocked',
    facts: [
      'A proposed allocation shift moves launch support from two stable brands into one faster test surface.',
      'Projected exposure increases when margin sensitivity is applied to the slower replenishment window.',
      'The reconciliation note references a prior estimate that is newer than the review packet.',
      'All values, brands, and review artifacts are invented for deterministic display.'
    ],
    inferences: [
      'The recommendation may still be right, but the financial exposure is not review-ready.',
      'The largest risk is approving a portfolio-level shift from a stale reconciliation packet.',
      'A blocked action state is appropriate until a reviewer can compare the estimate versions.'
    ],
    proofGaps: [
      'No live finance, planning, or reconciliation system is connected.',
      'The prototype cannot verify which estimate is current.',
      'Margin sensitivity needs owner review before the recommendation can advance.'
    ],
    recommendedChecks: [
      'Compare the review packet with the latest reconciliation note.',
      'Ask the finance review chair to confirm the current estimate version.',
      'Record whether exposure changes the allocation recommendation or only the approval sequence.'
    ],
    approvalGates: [
      'Do not advance allocation changes without finance review chair approval.',
      'Do not treat stale estimates as cleared evidence.',
      'Do not write to planning, finance, or approval systems.'
    ]
  }
];

export function buildConsoleView(scenario: Scenario): ConsoleView {
  return {
    header: `${scenario.brand} · ${scenario.title}`,
    subheader: `${scenario.timestamp} · ${scenario.summary}`,
    context: [
      { label: 'Portfolio', value: scenario.portfolio },
      { label: 'Brand', value: scenario.brand },
      { label: 'Vertical', value: scenario.vertical },
      { label: 'Surface', value: scenario.surface },
      { label: 'Signal', value: scenario.signalType },
      ...(scenario.decisionOwner ? [{ label: 'Owner', value: scenario.decisionOwner }] : [])
    ],
    riskBadge: scenario.risk,
    confidenceLabel: `${scenario.confidence} confidence`,
    magnitude: {
      severityScore: scenario.severityScore,
      blastRadius: scenario.blastRadius,
      evidenceCompleteness: scenario.evidenceCompleteness,
      actionState: scenario.actionState
    },
    decisionFrame: {
      decisionStakes: scenario.decisionStakes,
      controlPattern: scenario.controlPattern,
      reviewerSignals: scenario.reviewerSignals
    },
    lanes: [
      { label: 'Known facts', items: scenario.facts },
      { label: 'Inferred risk', items: scenario.inferences },
      { label: 'Evidence gaps', items: scenario.proofGaps },
      { label: 'Approval gates', items: scenario.approvalGates }
    ],
    nextChecks: scenario.recommendedChecks,
    actions: actions.map((action) => {
      const disabled = scenario.actionState === 'blocked' && 'requiresReviewPath' in action;

      return {
        label: action.label,
        ...(disabled
          ? { disabled: true, disabledReason: 'Blocked until the approval gate is cleared.' }
          : {})
      };
    })
  };
}
