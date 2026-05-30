import { describe, expect, it } from 'vitest';
import { scenarios } from '../src/data/scenarios';
import { buildDisplayModel } from '../src/model/scoring';

const forbiddenTerms = [
  'http://',
  'https://',
  'www.',
  'shopify',
  'amazon',
  'walmart',
  'target',
  'costco',
  'tiktok',
  'instagram',
  'twitter',
  'x.com',
  'linkedin',
  'stripe',
  'auth0',
  'openai',
  'anthropic',
  'gemini',
  'slack',
  'jira',
  'zendesk',
  'salesforce',
  'ticket',
  'incident',
  'customer',
  'merchant',
  'checkout',
  'cart',
  'payment',
  'order',
  'account',
  'credential',
  'endpoint',
  'api/',
  'founder',
  'ceo',
];

const textForScenario = (scenario: (typeof scenarios)[number]): string =>
  JSON.stringify(scenario).toLowerCase();

const findScenario = (kind: (typeof scenarios)[number]['kind']) => {
  const scenario = scenarios.find((candidate) => candidate.kind === kind);
  expect(scenario).toBeDefined();
  return scenario!;
};

describe('phase 2 high-proof synthetic scenarios', () => {
  it('requires each scenario to include schema fields and build a deterministic display model', () => {
    expect(scenarios.map((scenario) => scenario.kind)).toEqual(
      expect.arrayContaining([
        'qualitySampleDrift',
        'claimsReviewBlocked',
        'channelMismatch',
        'launchReadinessMismatch',
      ])
    );

    for (const scenario of scenarios) {
      expect(scenario.knownFacts.length).toBeGreaterThan(0);
      expect(scenario.inferredRisks.length).toBeGreaterThan(0);
      expect(scenario.evidenceGaps.length).toBeGreaterThan(0);
      expect(scenario.recommendedChecks.length).toBeGreaterThan(0);
      expect(scenario.gatedActions.length).toBeGreaterThan(0);
      expect(scenario.affectedBrands.length).toBeGreaterThan(0);
      expect(scenario.affectedSurfaces.length).toBeGreaterThan(0);
      expect(scenario.signalMagnitude).toBeGreaterThanOrEqual(0);
      expect(scenario.signalMagnitude).toBeLessThanOrEqual(100);

      const display = buildDisplayModel(scenario);
      expect(display.scenarioId).toBe(scenario.id);
      expect(display.knownFacts).toEqual(scenario.knownFacts);
      expect(display.inferredRisks).toEqual(scenario.inferredRisks);
      expect(display.evidenceGaps).toEqual(scenario.evidenceGaps);
      expect(display.recommendedChecks).toEqual(scenario.recommendedChecks);
    }
  });

  it('keeps deterministic scenario fixtures free of live URLs and source-identifying terms', () => {
    for (const scenario of scenarios) {
      const text = textForScenario(scenario);
      for (const term of forbiddenTerms) {
        expect(text).not.toContain(term);
      }
    }
  });

  it('keeps scenario ids, action ids, and action evidence references deterministic', () => {
    expect(new Set(scenarios.map((scenario) => scenario.id)).size).toBe(scenarios.length);

    for (const scenario of scenarios) {
      const actionIds = scenario.gatedActions.map((action) => action.id);
      expect(new Set(actionIds).size).toBe(actionIds.length);

      const gapLabels = new Set(scenario.evidenceGaps.map((gap) => gap.label));
      for (const action of scenario.gatedActions) {
        for (const evidence of action.requiredEvidence) {
          expect(gapLabels.has(evidence)).toBe(true);
        }
      }
    }
  });

  it('requires human approval for every non-internal scenario action', () => {
    for (const scenario of scenarios) {
      for (const action of scenario.gatedActions.filter((candidate) => candidate.actionType !== 'internal')) {
        expect(action.requiresHumanApproval).toBe(true);
        expect(action.requiredEvidence.length > 0 || action.policyBlocked).toBe(true);
      }
    }
  });

  it('keeps high chatter from a single-source channel mismatch from becoming sustained demand', () => {
    const scenario = findScenario('channelMismatch');
    const display = buildDisplayModel(scenario);

    expect(scenario.signalMagnitude).toBeGreaterThanOrEqual(70);
    expect(scenario.knownFacts.some((fact) => fact.label.includes('single-source'))).toBe(true);
    expect(scenario.inferredRisks.map((risk) => risk.label)).not.toContain('sustained demand');
    expect(display.confidence.label).toBe('low');
    expect(display.blockedActions.filter((action) => action.actionType !== 'internal').map((action) => action.id)).toEqual(
      expect.arrayContaining(['expand-channel-copy', 'publish-demand-note'])
    );
    expect(display.blockedActions.some((action) => action.blockedReasons.some((reason) => reason.includes('independent-proof')))).toBe(true);
  });

  it('blocks public and channel claims actions when substantiation proof is missing', () => {
    const scenario = findScenario('claimsReviewBlocked');
    const display = buildDisplayModel(scenario);

    expect(scenario.evidenceGaps.map((gap) => gap.label)).toContain('substantiation-proof');
    expect(display.evidenceGaps.map((gap) => gap.label)).toContain('substantiation-proof');
    expect(display.blockedActions.filter((action) => action.actionType !== 'internal').map((action) => action.id)).toEqual(
      expect.arrayContaining(['release-channel-claim', 'publish-public-claim'])
    );
    expect(display.blockedActions.every((action) => action.actionType === 'internal' || action.gateStatus === 'needsEvidence')).toBe(true);
  });

  it('blocks readiness expansion when readiness proof is missing or below threshold', () => {
    const scenario = findScenario('launchReadinessMismatch');
    const display = buildDisplayModel(scenario);

    expect(scenario.evidenceGaps.map((gap) => gap.label)).toEqual(expect.arrayContaining(['readiness-threshold-proof', 'format-proof']));
    expect(display.blockedActions.filter((action) => action.actionType !== 'internal').map((action) => action.id)).toEqual(
      expect.arrayContaining(['expand-new-format', 'amplify-readiness-note'])
    );
    expect(display.blockedActions.some((action) => action.gateStatus === 'needsEvidence')).toBe(true);
  });

  it('requires confirming evidence before a quality hold can advance beyond evidence-needed', () => {
    const scenario = findScenario('qualitySampleDrift');
    const display = buildDisplayModel(scenario);
    const holdAction = display.blockedActions.find((action) => action.id === 'quality-hold-review');

    expect(scenario.evidenceGaps.map((gap) => gap.label)).toContain('confirming-sample-proof');
    expect(holdAction?.gateStatus).toBe('needsEvidence');
    expect(holdAction?.blockedReasons).toContain('Missing required evidence: confirming-sample-proof.');
  });
});
