import { describe, expect, it } from 'vitest';
import { buildDisplayModel, calculateConfidence, calculateEvidenceCompleteness, calculateSeverity } from '../src/model/scoring';
import type { SignalScenario } from '../src/model/types';

const baseScenario: SignalScenario = {
  id: 'scenario-test-quality',
  title: 'Synthetic quality sample drift',
  kind: 'qualitySampleDrift',
  sourceLabel: 'synthetic QA review queue',
  observedAt: '2026-05-30T10:00:00.000Z',
  affectedBrands: ['Brand Atlas'],
  affectedSurfaces: ['pilot format'],
  signalMagnitude: 82,
  knownFacts: [
    { id: 'fact-1', label: 'sample variance observed', strength: 'observed', detail: 'Synthetic samples moved outside a demo tolerance band.' },
    { id: 'fact-2', label: 'repeat review requested', strength: 'observed', detail: 'A second internal check is queued.' },
  ],
  inferredRisks: [
    { id: 'risk-1', label: 'quality sample drift', riskLevel: 'high', rationale: 'The synthetic signal could affect more than one surface.' },
  ],
  evidenceGaps: [],
  recommendedChecks: ['Compare a second synthetic sample set'],
  gatedActions: [],
};

describe('deterministic scoring', () => {
  it('keeps high severity separate from high confidence', () => {
    const scenario: SignalScenario = {
      ...baseScenario,
      evidenceGaps: [
        { id: 'gap-1', label: 'missing second source', requiredFor: ['public-action'], severityImpact: 'none', confidenceImpact: 35 },
        { id: 'gap-2', label: 'missing blast-radius proof', requiredFor: ['escalation'], severityImpact: 'none', confidenceImpact: 25 },
      ],
    };

    expect(calculateSeverity(scenario)).toBeGreaterThanOrEqual(80);
    expect(calculateConfidence(scenario)).toBeLessThan(70);
  });

  it('lowers confidence for missing evidence without automatically raising severity', () => {
    const complete = { ...baseScenario, signalMagnitude: 35, inferredRisks: [{ id: 'risk-low', label: 'localized review', riskLevel: 'low', rationale: 'Synthetic localized signal only.' }] } satisfies SignalScenario;
    const incomplete = {
      ...complete,
      evidenceGaps: [
        { id: 'gap-1', label: 'missing proof packet', requiredFor: ['channel-action'], severityImpact: 'none', confidenceImpact: 40 },
      ],
    } satisfies SignalScenario;

    expect(calculateConfidence(incomplete)).toBeLessThan(calculateConfidence(complete));
    expect(calculateSeverity(incomplete)).toBe(calculateSeverity(complete));
  });

  it('calculates evidence completeness from observed and missing evidence', () => {
    const scenario = {
      ...baseScenario,
      knownFacts: [
        ...baseScenario.knownFacts,
        { id: 'fact-derived', label: 'derived comparison', strength: 'derived', detail: 'Derived from synthetic fixture fields.' },
      ],
      evidenceGaps: [
        { id: 'gap-1', label: 'missing proof packet', requiredFor: ['channel-action'], severityImpact: 'none', confidenceImpact: 20 },
      ],
    } satisfies SignalScenario;

    expect(calculateEvidenceCompleteness(scenario)).toBe(63);
  });

  it('derives display state from model fields', () => {
    const display = buildDisplayModel(baseScenario);

    expect(display.title).toBe(baseScenario.title);
    expect(display.severity.score).toBe(calculateSeverity(baseScenario));
    expect(display.confidence.score).toBe(calculateConfidence(baseScenario));
    expect(display.evidenceCompleteness.score).toBe(calculateEvidenceCompleteness(baseScenario));
    expect(display.knownFacts).toEqual(baseScenario.knownFacts);
  });
});
