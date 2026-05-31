import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { buildConsoleView, scenarios } from '../src/scenarios';
import { forbiddenPublicArtifactTerms } from './public-safety-terms';

const publicArtifactPaths = ['src', 'README.md', 'AGENTS.md', 'docs', 'index.html', 'package.json', 'vite.config.ts'];

function searchableScenarioText(): string {
  return scenarios.map((scenario) => JSON.stringify({ scenario, view: buildConsoleView(scenario) })).join('\n').toLowerCase();
}

function readProjectFile(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function collectTextFiles(path: string): string[] {
  const absolutePath = join(process.cwd(), path);
  const stats = statSync(absolutePath);

  if (stats.isFile()) return [path];

  return readdirSync(absolutePath).flatMap((entry) => collectTextFiles(join(path, entry)));
}

function containsForbiddenTerm(text: string, term: string): boolean {
  if (term.includes(' ')) return text.includes(term);
  return new RegExp(`(?<![a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i').test(text);
}

describe('Ops Signal Console scenario model', () => {
  it('ships exactly four deterministic public-safe synthetic portfolio signal scenarios', () => {
    expect(scenarios).toHaveLength(4);
    expect(scenarios.map((scenario) => scenario.id)).toEqual([
      'scenario-quality-sample-drift',
      'scenario-claims-review-blocked',
      'scenario-channel-mismatch',
      'scenario-launch-readiness-mismatch'
    ]);
  });

  it('requires brand, surface, kind, source, and observed context on every scenario', () => {
    for (const scenario of scenarios) {
      expect(scenario.affectedBrands.length).toBeGreaterThan(0);
      expect(scenario.affectedSurfaces.length).toBeGreaterThan(0);
      expect(scenario.kind).toMatch(/\S/);
      expect(scenario.sourceLabel).toMatch(/\S/);
      expect(scenario.observedAt).toMatch(/\S/);
    }
  });

  it('covers multiple invented brands and surfaces across the portfolio', () => {
    expect(new Set(scenarios.flatMap((scenario) => scenario.affectedBrands)).size).toBeGreaterThanOrEqual(2);
    expect(new Set(scenarios.flatMap((scenario) => scenario.affectedSurfaces)).size).toBeGreaterThanOrEqual(2);
  });

  it('keeps scenario and render-facing action data free of identifying, domain, and integration terms', () => {
    const serialized = searchableScenarioText();

    for (const term of forbiddenPublicArtifactTerms) {
      expect(serialized).not.toContain(term);
    }
  });

  it('keeps public source artifacts free of forbidden terms outside local planning and banned-list test fixtures', () => {
    const artifactText = publicArtifactPaths
      .flatMap(collectTextFiles)
      .filter((path) => !path.startsWith('tests/'))
      .filter((path) => !path.startsWith('docs/plans/'))
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
      const view = buildConsoleView(scenario);
      expect(scenario.knownFacts.length).toBeGreaterThanOrEqual(3);
      expect(scenario.inferredRisks.length).toBeGreaterThanOrEqual(2);
      expect(scenario.evidenceGaps.length).toBeGreaterThanOrEqual(1);
      expect(scenario.recommendedChecks.length).toBeGreaterThanOrEqual(2);
      expect(scenario.gatedActions.length).toBeGreaterThanOrEqual(2);
      expect(view.magnitude.severityScore).toBeGreaterThanOrEqual(0);
      expect(view.magnitude.severityScore).toBeLessThanOrEqual(100);
      expect(view.magnitude.evidenceCompleteness).toBeGreaterThanOrEqual(0);
      expect(view.magnitude.evidenceCompleteness).toBeLessThanOrEqual(100);
    }
  });

  it('adds reviewer proof labels for decision stakes, control pattern, and reviewer signals', () => {
    for (const scenario of scenarios) {
      const view = buildConsoleView(scenario);
      expect(view.decisionFrame.decisionStakes).toMatch(/\S/);
      expect(view.decisionFrame.controlPattern).toMatch(/\S/);
      expect(view.decisionFrame.reviewerSignals.length).toBeGreaterThanOrEqual(2);
    }

    const launchScenario = scenarios.find((scenario) => scenario.id === 'scenario-launch-readiness-mismatch');
    expect(launchScenario).toBeDefined();
    expect(buildConsoleView(launchScenario!).decisionFrame.controlPattern).toContain('gated');
  });

  it('builds a display-safe console view with context, magnitude, triage lanes, and action buttons', () => {
    const scenario = scenarios[0];
    const view = buildConsoleView(scenario);

    expect(view.header).toContain('Brand Atlas');
    expect(view.context).toEqual([
      { label: 'Brands', value: 'Brand Atlas' },
      { label: 'Surfaces', value: 'pilot format, review bench' },
      { label: 'Signal', value: 'quality sample drift' },
      { label: 'Source', value: 'synthetic quality review queue' },
      { label: 'Observed', value: '2026-05-30' },
      { label: 'Evidence clarity', value: 'partial · 50/100' }
    ]);
    expect(view.riskBadge).toBe('high');
    expect(view.magnitude.severityScore).toBe(82);
    expect(view.magnitude.blastRadius).toBe('surface');
    expect(view.magnitude.evidenceCompleteness).toBe(50);
    expect(view.magnitude.actionState).toBe('blocked');
    expect(view.lanes.map((lane) => lane.label)).toEqual(['Known facts', 'Inferred risks', 'Evidence gaps', 'Gated actions']);
    expect(view.actions.map((action) => action.label)).toEqual([
      'Investigate internally',
      'Mock quality hold review',
      'Public action blocked'
    ]);
  });

  it('marks non-internal mock actions as disabled when proof or approval is missing', () => {
    const blockedView = buildConsoleView(scenarios[0]);
    const claimsView = buildConsoleView(scenarios[1]);

    expect(blockedView.actions.filter((action) => action.disabled).map((action) => action.label)).toEqual([
      'Mock quality hold review',
      'Public action blocked'
    ]);
    expect(blockedView.actions.every((action) => !action.disabled || action.disabledReason)).toBe(true);
    expect(claimsView.actions.filter((action) => action.disabled).map((action) => action.label)).toEqual([
      'Release channel claim',
      'Publish public claim'
    ]);
  });

  it('models visual importance with varied severity, blast radius, and evidence completeness', () => {
    const views = scenarios.map(buildConsoleView);
    expect(views.map((view) => view.magnitude.severityScore)).toEqual([82, 91, 80, 91]);
    expect(views.map((view) => view.magnitude.blastRadius)).toEqual(['surface', 'surface', 'surface', 'system']);
    expect(views.map((view) => view.magnitude.evidenceCompleteness)).toEqual([50, 60, 60, 50]);
  });

  it('does not use browser network, storage, or telemetry APIs in source code', () => {
    const source = ['src/main.ts', 'src/scenarios.ts', 'vite.config.ts']
      .map((file) => readProjectFile(file).toLowerCase())
      .join('\n');
    const bannedApis = [
      ['fet', 'ch('],
      ['xml', 'http', 'request'],
      ['web', 'socket'],
      ['event', 'source'],
      ['local', 'storage'],
      ['session', 'storage'],
      ['indexed', 'db'],
      ['send', 'beacon'],
      ['service', 'worker'],
      ['caches', '.open'],
      ['document', '.cookie']
    ].map((parts) => parts.join(''));

    for (const api of bannedApis) expect(source).not.toContain(api);
  });

  it('disables Vite modulepreload polyfill so built assets do not add network helpers', () => {
    const config = readProjectFile('vite.config.ts');

    expect(config).toContain('modulePreload');
    expect(config).toContain('polyfill: false');
  });

  it('updates mock action receipts without re-rendering the full console shell', () => {
    const source = readProjectFile('src/main.ts');

    expect(source).toContain('function renderActivityTrail');
    expect(source).toContain('renderActivityTrail();');
    expect(source).toContain('const trailPanel = document.querySelector<HTMLElement>');
    expect(source).toContain('executeReceiptAction(selectedScenario, action');
    expect(source).toContain('data-action-id');
    expect(source).toContain('receipt.receiptId');
    expect(source).toContain('receipt.scenarioId');
    expect(source).toContain('receipt.actionId');
    expect(source).toContain('receipt.gateStatusBefore');
    expect(source).toContain('receipt.decisionReason');
    expect(source).toContain('receipt.reversibility');
    expect(source).toContain('receipt.externalSideEffects');
    expect(source).toContain('receipt.createdAt');

    const actionHandler = source.slice(source.indexOf("document.querySelectorAll<HTMLButtonElement>('[data-action-id]')"));
    expect(actionHandler).not.toContain('render();');
  });

  it('keeps mobile action controls at a non-zooming touch font size', () => {
    const css = readProjectFile('src/styles.css');

    expect(css).toContain('touch-action: manipulation');
    expect(css).toContain('.action-console button');
    expect(css).toContain('font-size: 1rem');
  });

  it('keeps the motion layer tokenized and stable for reduced-motion users', () => {
    const css = readProjectFile('src/styles.css');

    expect(css).toContain('--motion-quick');
    expect(css).toContain('--ease-instrument');
    expect(css).toContain('@keyframes console-enter');
    expect(css).toContain('@keyframes score-calibrate');
    expect(css).toContain('@keyframes evidence-settle');
    expect(css).toContain('@keyframes instrument-sweep');
    expect(css).toContain('@keyframes receipt-insert');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('animation-duration: 0.001ms !important');
    expect(css).toContain('transform: none !important');
  });

  it('keeps desktop signal header responsive when the window is short or resized', () => {
    const css = readProjectFile('src/styles.css');

    expect(css).toContain('font-size: clamp(2rem, min(5vw, 9vh), 5.2rem);');
    expect(css).toContain('grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr);');
    expect(css).toContain('min-height: clamp(16rem, 45vh, 21rem);');
    expect(css).toContain('@media (min-width: 921px) and (max-height: 720px)');
    expect(css).toContain('.signal-hero { min-height: clamp(13.5rem, 42vh, 17rem); }');
    expect(css).toContain('.signal-copy { align-content: center; padding: 1rem 1.25rem; }');
  });

  it('separates Bonefield identity accents from warning and danger state colors', () => {
    const css = readProjectFile('src/styles.css');

    expect(css).toContain('--brass:');
    expect(css).toContain('--brass-bright:');
    expect(css).toContain('--warning:');
    expect(css).toContain('--danger:');
    expect(css).toContain('.signal-medium .tab-score');
    expect(css).toContain('.signal-high .tab-score');
    expect(css).toContain('--risk-color: var(--warning);');
    expect(css).toContain('--risk-color: var(--danger);');
    expect(css).toContain('border-color: color-mix(in srgb, var(--risk-bright) 78%, transparent);');
    expect(css).toContain('box-shadow: inset 4px 0 0 var(--risk-bright, var(--brass-bright))');
  });
});
