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
