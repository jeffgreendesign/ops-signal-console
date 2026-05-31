import type { ActionState, GateStatus, GatedAction, GatedActionDisplay, SignalScenario } from './types';

const missingEvidenceLabels = (scenario: SignalScenario): Set<string> =>
  new Set(scenario.evidenceGaps.map((gap) => gap.label));

export const deriveGateStatus = (scenario: SignalScenario, action: GatedAction): GateStatus => {
  if (action.executionStatus) return action.executionStatus;
  if (action.policyBlocked) return 'blockedByPolicy';

  const missing = missingEvidenceLabels(scenario);
  const needsEvidence = action.requiredEvidence.some((evidenceLabel) => missing.has(evidenceLabel));
  if (needsEvidence) return 'needsEvidence';

  if (action.requiresHumanApproval && !action.approved) return 'needsHumanApproval';

  return 'available';
};

export const toActionDisplay = (scenario: SignalScenario, action: GatedAction): GatedActionDisplay => {
  const gateStatus = deriveGateStatus(scenario, action);
  const missing = missingEvidenceLabels(scenario);
  const blockedReasons: string[] = [];

  if (action.policyBlocked) blockedReasons.push('Blocked by demo policy.');
  if (gateStatus === 'executedMock') blockedReasons.push('Mock execution receipt already exists.');
  if (gateStatus === 'rolledBackMock') blockedReasons.push('Mock execution has been rolled back.');
  for (const evidence of action.requiredEvidence) {
    if (missing.has(evidence)) blockedReasons.push(`Missing required evidence: ${evidence}.`);
  }
  if (gateStatus === 'needsHumanApproval') blockedReasons.push('Human approval required before mock execution.');

  return { ...action, gateStatus, blockedReasons };
};

export const deriveBlockedActions = (scenario: SignalScenario): GatedActionDisplay[] =>
  scenario.gatedActions.map((action) => toActionDisplay(scenario, action)).filter((action) => action.gateStatus !== 'available');

export const deriveAllowedInternalActions = (scenario: SignalScenario): GatedActionDisplay[] =>
  scenario.gatedActions
    .map((action) => toActionDisplay(scenario, action))
    .filter((action) => action.actionType === 'internal' && action.gateStatus === 'available');

export const deriveActionState = (scenario: SignalScenario): ActionState => {
  const blocked = deriveBlockedActions(scenario);
  if (blocked.some((action) => action.actionType === 'public' || action.actionType === 'channel' || action.gateStatus === 'blockedByPolicy')) return 'blocked';
  if (blocked.length > 0 || scenario.evidenceGaps.length > 0) return 'review';
  return 'observe';
};
