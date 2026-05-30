import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildConsoleView, scenarios } from '../src/scenarios';

const term = (parts: string[]): string => parts.join('');
const phrase = (...parts: string[]): string => parts.join(' ');

const forbiddenPublicArtifactTerms = [
  term(['da', 'vid']),
  term(['me', 'dici']),
  term(['pro', 'tein']),
  term(['e', 'pg']),
  term(['epo', 'gee']),
  phrase(term(['pe', 'ter']), term(['ra', 'hal'])),
  phrase(term(['ju', 'lia']), term(['fo', 'x'])),
  term(['shop', 'ify']),
  term(['check', 'out']),
  term(['ca', 'rt']),
  term(['or', 'der']),
  term(['pay', 'ment']),
  term(['cus', 'tomer']),
  term(['mer', 'chant']),
  term(['store', 'front']),
  term(['p', 'dp']),
  term(['au', 'th']),
  term(['ac', 'count']),
  term(['cre', 'dential']),
  term(['tele', 'gram']),
  term(['her', 'mes']),
  term(['u', 'cp']),
  term(['m', 'cp']),
  term(['a', 'cp']),
  term(['com', 'merce']),
  term(['tick', 'et']),
  term(['inci', 'dent']),
  phrase(term(['pri', 'vate']), term(['lo', 'g'])),
  phrase(term(['per', 'sonal']), term(['pur', 'chase']))
];

const publicArtifactPaths = [
  'src',
  'README.md',
  'AGENTS.md',
  'docs',
  'index.html',
  'package.json',
  'vite.config.ts'
];

function searchableScenarioText(): string {
  return scenarios
    .map((scenario) =>
      [
        scenario.id,
        scenario.title,
        scenario.summary,
        scenario.source,
        scenario.portfolio,
        scenario.brand,
        scenario.vertical,
        scenario.surface,
        scenario.signalType,
        scenario.decisionOwner ?? '',
        ...scenario.facts,
        ...scenario.inferences,
        ...scenario.proofGaps,
        ...scenario.recommendedChecks,
        ...scenario.approvalGates
      ].join('\n')
    )
    .join('\n')
    .toLowerCase();
}

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function collectTextFiles(path: string): string[] {
  const absolutePath = join(process.cwd(), path);
  const stats = statSync(absolutePath);

  if (stats.isFile()) {
    return [path];
  }

  return readdirSync(absolutePath).flatMap((entry) => collectTextFiles(join(path, entry)));
}

function containsForbiddenTerm(text: string, term: string): boolean {
  if (term.includes(' ')) {
    return text.includes(term);
  }

  return new RegExp(`(?<![a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i').test(text);
}

describe('Ops Signal Console scenario model', () => {
  it('ships exactly three public-safe synthetic portfolio signal scenarios', () => {
    expect(scenarios).toHaveLength(3);
    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      'kite-launch-readiness-drift',
      'mesa-sample-quality-review',
      'luma-field-feedback-cluster'
    ]);
  });

  it('requires portfolio, brand, vertical, surface, and signal type context on every scenario', () => {
    const allowedSignalTypes = ['launch', 'quality', 'demand', 'operations', 'feedback', 'claims'];

    for (const scenario of scenarios) {
      expect(scenario.portfolio).toMatch(/\S/);
      expect(scenario.brand).toMatch(/\S/);
      expect(scenario.vertical).toMatch(/\S/);
      expect(scenario.surface).toMatch(/\S/);
      expect(allowedSignalTypes).toContain(scenario.signalType);
    }
  });

  it('covers multiple invented brands and verticals across the portfolio', () => {
    expect(new Set(scenarios.map((scenario) => scenario.brand)).size).toBeGreaterThanOrEqual(2);
    expect(new Set(scenarios.map((scenario) => scenario.vertical)).size).toBeGreaterThanOrEqual(2);
  });

  it('keeps scenario and render-facing action data free of identifying, domain, and integration terms', () => {
    const serialized = `${searchableScenarioText()}\n${JSON.stringify(buildConsoleView(scenarios[0]).actions).toLowerCase()}`;

    for (const term of forbiddenPublicArtifactTerms) {
      expect(serialized).not.toContain(term);
    }
  });

  it('keeps public source artifacts free of forbidden terms outside the banned-list test fixture', () => {
    const artifactText = publicArtifactPaths
      .flatMap(collectTextFiles)
      .filter((path) => !path.endsWith('tests/scenarios.test.ts'))
      .map((path) => readProjectFile(path).toLowerCase())
      .join('\n');

    for (const term of forbiddenPublicArtifactTerms) {
      expect(containsForbiddenTerm(artifactText, term)).toBe(false);
    }
  });

  it('uses portfolio-specific page metadata', () => {
    const html = readProjectFile('index.html');

    expect(html).toContain('synthetic portfolio signal triage');
    expect(html).toContain('multi-brand');
  });

  it('separates observed facts from inferred risk and human approval gates', () => {
    for (const scenario of scenarios) {
      expect(scenario.facts.length).toBeGreaterThanOrEqual(3);
      expect(scenario.inferences.length).toBeGreaterThanOrEqual(2);
      expect(scenario.approvalGates.length).toBeGreaterThanOrEqual(2);
      expect(scenario.proofGaps.length).toBeGreaterThanOrEqual(1);
      expect(scenario.recommendedChecks.length).toBeGreaterThanOrEqual(2);
      expect(scenario.severityScore).toBeGreaterThanOrEqual(0);
      expect(scenario.severityScore).toBeLessThanOrEqual(100);
      expect(scenario.evidenceCompleteness).toBeGreaterThanOrEqual(0);
      expect(scenario.evidenceCompleteness).toBeLessThanOrEqual(100);
    }
  });

  it('builds a display-safe console view with portfolio context, magnitude, triage lanes, and action buttons', () => {
    const view = buildConsoleView(scenarios[0]);

    expect(view.header).toContain('Kite');
    expect(view.context).toEqual([
      { label: 'Portfolio', value: 'Northstar Goods Lab' },
      { label: 'Brand', value: 'Kite' },
      { label: 'Vertical', value: 'Hydration' },
      { label: 'Surface', value: 'Retail test allocation' },
      { label: 'Signal', value: 'launch' },
      { label: 'Owner', value: 'Launch council' }
    ]);
    expect(view.riskBadge).toBe('high');
    expect(view.magnitude.severityScore).toBe(88);
    expect(view.magnitude.blastRadius).toBe('system');
    expect(view.magnitude.evidenceCompleteness).toBe(56);
    expect(view.magnitude.actionState).toBe('blocked');
    expect(view.lanes.map((lane) => lane.label)).toEqual([
      'Known facts',
      'Inferred risk',
      'Evidence gaps',
      'Approval gates'
    ]);
    expect(view.actions.map((action) => action.label)).toEqual([
      'Acknowledge',
      'Investigate',
      'Ask for more evidence',
      'Request owner review',
      'Hold recommendation',
      'Log evidence gap'
    ]);
  });

  it('marks outbound-style mock actions as disabled when a scenario is blocked', () => {
    const blockedView = buildConsoleView(scenarios[0]);
    const reviewView = buildConsoleView(scenarios[1]);

    expect(blockedView.actions.filter((action) => action.disabled).map((action) => action.label)).toEqual([
      'Request owner review',
      'Hold recommendation'
    ]);
    expect(blockedView.actions.every((action) => !action.disabled || action.disabledReason)).toBe(true);
    expect(reviewView.actions.every((action) => !action.disabled)).toBe(true);
  });

  it('models visual importance with varied severity, blast radius, and evidence completeness', () => {
    expect(scenarios.map((scenario) => scenario.severityScore)).toEqual([88, 66, 42]);
    expect(scenarios.map((scenario) => scenario.blastRadius)).toEqual(['system', 'surface', 'local']);
    expect(scenarios.map((scenario) => scenario.evidenceCompleteness)).toEqual([56, 72, 44]);
  });

  it('does not use browser network, storage, or telemetry APIs in source code', () => {
    const source = ['src/main.ts', 'src/scenarios.ts', 'vite.config.ts']
      .map((file) => readProjectFile(file).toLowerCase())
      .join('\n');
    const bannedApis = [
      'fetch(',
      'xmlhttprequest',
      'websocket',
      'eventsource',
      'localstorage',
      'sessionstorage',
      'indexeddb',
      'sendbeacon',
      'serviceworker',
      'caches.open',
      'document.cookie'
    ];

    for (const api of bannedApis) {
      expect(source).not.toContain(api);
    }
  });

  it('disables Vite modulepreload polyfill so built assets do not add network helpers', () => {
    const config = readProjectFile('vite.config.ts');

    expect(config).toContain('modulePreload');
    expect(config).toContain('polyfill: false');
  });
});
