import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { scenarios as rawScenarios } from '../src/data/scenarios';
import { buildDisplayModel } from '../src/model/scoring';
import { buildConsoleView, scenarios as uiScenarios } from '../src/scenarios';
import { forbiddenPublicArtifactTerms } from './public-safety-terms';

const scenarioSource = readFileSync(new URL('../src/scenarios.ts', import.meta.url), 'utf8');
const flatten = (value: unknown): string => JSON.stringify(value).toLowerCase();
const findRawScenario = (kind: (typeof rawScenarios)[number]['kind']) => {
  const scenario = rawScenarios.find((candidate) => candidate.kind === kind);
  expect(scenario).toBeDefined();
  return scenario!;
};

describe('Phase 3 UI adapter', () => {
  it('uses deterministic scenarios as the UI-facing scenario source', () => {
    expect(uiScenarios.map(({ id }) => id)).toEqual(rawScenarios.map(({ id }) => id));
    expect(uiScenarios).toHaveLength(rawScenarios.length);
    expect(uiScenarios.map(({ kind }) => kind)).toEqual(rawScenarios.map(({ kind }) => kind));
  });

  it('maps deterministic display-model fields into the console view', () => {
    for (const rawScenario of rawScenarios) {
      const uiScenario = uiScenarios.find((scenario) => scenario.id === rawScenario.id);
      expect(uiScenario).toBeDefined();

      const display = buildDisplayModel(rawScenario);
      const view = buildConsoleView(uiScenario!);

      expect(view.riskBadge).toBe(display.severity.label);
      expect(view.confidenceLabel).toBe(`${display.confidence.label} confidence · ${display.confidence.score}/100`);
      expect(view.magnitude).toEqual({
        severityScore: display.severity.score,
        blastRadius: display.blastRadius,
        evidenceCompleteness: display.evidenceCompleteness.score,
        actionState: display.actionState,
      });
      expect(view.actions.filter((action) => !action.disabled).map((action) => action.label)).toEqual(
        display.allowedInternalActions.map((action) => action.label)
      );
      expect(view.actions.filter((action) => action.disabled).map((action) => ({ label: action.label, status: action.gateStatus, reason: action.disabledReason }))).toEqual(
        display.blockedActions.map((action) => ({
          label: action.label,
          status: action.gateStatus,
          reason: action.blockedReasons.join(' '),
        }))
      );
    }
  });

  it('does not retain hand-authored score and gate fields in the UI adapter', () => {
    expect(scenarioSource).not.toMatch(/severityScore\s*:/);
    expect(scenarioSource).not.toMatch(/evidenceCompleteness\s*:/);
    expect(scenarioSource).not.toMatch(/actionState\s*:/);
    expect(scenarioSource).not.toMatch(/risk\s*:/);
    expect(scenarioSource).not.toMatch(/confidence\s*:/);
    expect(scenarioSource).not.toMatch(/blastRadius\s*:/);
  });

  it('includes required scenario content in every UI-facing view', () => {
    for (const scenario of uiScenarios) {
      const view = buildConsoleView(scenario);
      const text = flatten(view);

      expect(view.lanes.find((lane) => lane.label === 'Known facts')?.items.length).toBeGreaterThan(0);
      expect(view.lanes.find((lane) => lane.label === 'Inferred risks')?.items.length).toBeGreaterThan(0);
      expect(view.lanes.find((lane) => lane.label === 'Evidence gaps')?.items.length).toBeGreaterThan(0);
      expect(view.nextChecks.length).toBeGreaterThan(0);
      expect(view.actions.length).toBeGreaterThan(0);
      expect(text).toContain(scenario.affectedBrands[0].toLowerCase());
      expect(text).toContain(scenario.affectedSurfaces[0].toLowerCase());
    }
  });

  it('renders Phase 2 proof, mismatch, and blocked-action states through the console view', () => {
    const claimsText = flatten(buildConsoleView(findRawScenario('claimsReviewBlocked')));
    expect(claimsText).toContain('substantiation-proof');
    expect(claimsText).toContain('reviewer-approval-proof');

    const channelText = flatten(buildConsoleView(findRawScenario('channelMismatch')));
    expect(channelText).toContain('single-source feedback only');
    expect(channelText).not.toContain('supported conclusion: sustained demand');
    expect(channelText).not.toContain('sustained demand is proven');

    const launchText = flatten(buildConsoleView(findRawScenario('launchReadinessMismatch')));
    expect(launchText).toContain('expand new format');
    expect(launchText).toContain('amplify readiness note');
    expect(launchText).toContain('needsevidence');

    const qualityText = flatten(buildConsoleView(findRawScenario('qualitySampleDrift')));
    expect(qualityText).toContain('mock quality hold review');
    expect(qualityText).toContain('needsevidence');
    expect(qualityText).toContain('confirming-sample-proof');
  });

  it('maps proof gaps to blocked actions through a reviewer-ready summary', () => {
    const scenario = findRawScenario('claimsReviewBlocked');
    const display = buildDisplayModel(scenario);
    const view = buildConsoleView(scenario);

    expect(display.proofSummary.posture).toBe('Action remains blocked until required proof and human approval clear.');
    expect(display.proofSummary.blockedBecause).toContain('Missing required evidence: substantiation-proof, reviewer-approval-proof.');
    expect(display.proofSummary.gapToActionMap).toEqual([
      'substantiation-proof blocks Release channel claim',
      'substantiation-proof blocks Publish public claim',
      'reviewer-approval-proof blocks Release channel claim',
      'reviewer-approval-proof blocks Publish public claim',
    ]);
    expect(view.proofSummary).toEqual(display.proofSummary);
  });

  it('excludes orphan evidence gaps from blocked-action proof summaries', () => {
    const baseScenario = findRawScenario('claimsReviewBlocked');
    const scenario = {
      ...baseScenario,
      evidenceGaps: [
        ...baseScenario.evidenceGaps,
        {
          id: 'orphan-proof-gap',
          label: 'orphan-proof-gap',
          requiredFor: [],
          severityImpact: 'low' as const,
          confidenceImpact: 5,
        },
      ],
    };

    const display = buildDisplayModel(scenario);

    expect(display.proofSummary.blockedBecause.join(' ')).not.toContain('orphan-proof-gap');
    expect(display.proofSummary.gapToActionMap.join(' ')).not.toContain('orphan-proof-gap');
  });

  it('builds an actionability summary from existing gate, proof, and check fields', () => {
    const scenario = findRawScenario('claimsReviewBlocked');
    const view = buildConsoleView(scenario);

    expect(view.actionability.posture).toBe('Action remains blocked until required proof and human approval clear.');
    expect(view.actionability.availableNow.map((path) => path.label)).toEqual(['Draft internal note']);
    expect(view.actionability.availableNow.every((path) => path.externalSideEffects === 'none')).toBe(true);
    expect(view.actionability.availableNow.every((path) => path.state === 'available')).toBe(true);
    expect(view.actionability.blocked.map((path) => ({ label: path.label, state: path.state, gateStatus: path.gateStatus }))).toEqual([
      { label: 'Release channel claim', state: 'needsEvidence', gateStatus: 'needsEvidence' },
      { label: 'Publish public claim', state: 'needsEvidence', gateStatus: 'needsEvidence' },
    ]);
    expect(view.actionability.blocked[0].proofNeeded).toEqual(['substantiation-proof', 'reviewer-approval-proof']);
    expect(view.actionability.blocked[0].nextChecks.length).toBeGreaterThan(0);
    expect(view.actionability.nextProof).toEqual(['substantiation-proof', 'reviewer-approval-proof']);

    for (const path of view.actionability.availableNow) {
      expect(path.actionType).toBe('internal');
    }
  });

  it('renders the opportunity signal as promising but not proven through the deterministic adapter', () => {
    const opportunity = findRawScenario('opportunitySignal');
    const display = buildDisplayModel(opportunity);
    const view = buildConsoleView(opportunity);
    const text = flatten(view);

    expect(opportunity.title).toBe('Promising channel lift needs independent proof');
    expect(text).toContain('promising channel lift');
    expect(text).toContain('not proven');
    expect(text).toContain('independent-proof');
    expect(text).toContain('repeat-window-proof');
    expect(display.severity.score).toBe(80);
    expect(display.severity.label).toBe('high');
    expect(display.confidence.score).toBeLessThan(45);
    expect(display.evidenceCompleteness.label).toBe('partial');
    expect(view.actions.filter((action) => !action.disabled).map((action) => action.label)).toEqual([
      'Log opportunity review packet',
    ]);
    expect(view.actions.filter((action) => action.disabled).map((action) => ({ label: action.label, status: action.gateStatus }))).toEqual([
      { label: 'Expand channel test', status: 'needsEvidence' },
      { label: 'Publish opportunity note', status: 'needsEvidence' },
    ]);
    expect(text).not.toContain('good news');
    expect(text).not.toContain('proven demand');
    expect(text).not.toContain('ready to scale');
  });

  it('keeps UI-facing output public-safe and blocks non-internal actions with safe reasons', () => {
    for (const scenario of uiScenarios) {
      const view = buildConsoleView(scenario);
      const text = flatten(view);

      for (const term of forbiddenPublicArtifactTerms) {
        expect(text).not.toContain(term);
      }

      expect(view.actions.some((action) => action.actionType === 'internal' && !action.disabled)).toBe(true);

      const rawActionTypes = new Map(scenario.gatedActions.map((action) => [action.label, action.actionType]));
      for (const action of view.actions) {
        if (rawActionTypes.get(action.label) !== 'internal') {
          expect(action.disabled).toBe(true);
          expect(action.disabledReason).toMatch(/missing required evidence|blocked by demo policy|human approval required/i);
        }
      }
    }
  });
});
