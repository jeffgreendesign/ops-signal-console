import './styles.css';
import { buildConsoleView, scenarios, type BlastRadius, type ContextItem, type Scenario } from './scenarios';

const appRoot = document.querySelector<HTMLElement>('#app');

if (!appRoot) {
  throw new Error('Missing #app root');
}

const app = appRoot;

let selectedScenario = scenarios[0];
let activityTrail: string[] = ['Console opened in synthetic portfolio demo mode.'];

const radiusLabels: Record<BlastRadius, string> = {
  local: 'Local',
  surface: 'Surface',
  system: 'System',
  org: 'Org'
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };

    return entities[character];
  });
}

function renderScenarioButton(scenario: Scenario): string {
  const active = scenario.id === selectedScenario.id ? 'true' : 'false';
  return `
    <button class="signal-tab signal-${scenario.risk}" data-scenario-id="${escapeHtml(scenario.id)}" aria-pressed="${active}">
      <span class="tab-score">${scenario.severityScore}</span>
      <span class="tab-copy">
        <strong>${escapeHtml(scenario.brand)} · ${escapeHtml(scenario.surface)}</strong>
        <small>${escapeHtml(scenario.vertical)} · ${escapeHtml(scenario.signalType)} · ${radiusLabels[scenario.blastRadius]} radius</small>
      </span>
    </button>
  `;
}

function renderList(items: string[], className = ''): string {
  return `<ul class="plate-list ${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderScale(label: string, value: number): string {
  return `
    <div class="scale-row">
      <div class="scale-label"><span>${label}</span><strong>${value}</strong></div>
      <div class="scale-track"><i style="width: ${value}%"></i></div>
    </div>
  `;
}

function renderBlastRadius(active: BlastRadius): string {
  const steps: BlastRadius[] = ['local', 'surface', 'system', 'org'];
  return `
    <div class="radius-ladder" aria-label="Blast radius">
      ${steps
        .map(
          (step) => `
            <span class="radius-step ${step === active ? 'active' : ''}">
              <i></i>${radiusLabels[step]}
            </span>
          `
        )
        .join('')}
    </div>
  `;
}

function renderLane(label: string, items: string[], modifier: string): string {
  return `
    <article class="evidence-plate ${modifier}">
      <div class="plate-topline"><span>${label}</span><b>${items.length}</b></div>
      ${renderList(items)}
    </article>
  `;
}

function renderContextStrip(context: ContextItem[]): string {
  return `
    <section class="context-strip" aria-label="Portfolio signal context">
      ${context
        .map(
          (item) => `
            <div class="context-item">
              <span>${item.label}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          `
        )
        .join('')}
    </section>
  `;
}

function renderActionButton(action: { label: string; disabled?: boolean; disabledReason?: string }): string {
  const disabledAttributes = action.disabled
    ? `disabled aria-disabled="true" title="${escapeHtml(action.disabledReason ?? 'Blocked until review clears.') }"`
    : '';

  return `<button data-action="${escapeHtml(action.label)}" ${disabledAttributes}>${escapeHtml(action.label)}</button>`;
}

function render(): void {
  const view = buildConsoleView(selectedScenario);
  const [facts, inferences, gaps, gates] = view.lanes;
  const actionBlocked = view.magnitude.actionState === 'blocked';

  app.innerHTML = `
    <section class="shell">
      <aside class="operator-rail" aria-label="Synthetic signals">
        <div class="rail-mark">OSC</div>
        <p class="eyebrow">Synthetic portfolio console</p>
        <h1>Ops Signal Console</h1>
        <p class="lede">Portfolio launch signals across invented brands. Bone evidence plates. Amber review gates. No live systems.</p>
        <div class="signal-tabs">
          ${scenarios.map(renderScenarioButton).join('')}
        </div>
        <div class="boundary-note">
          <strong>[PUBLIC-SAFE]</strong>
          <span>No identifying traces, live integrations, or production actions.</span>
        </div>
      </aside>

      <section class="console-stage" aria-live="polite">
        <header class="signal-hero signal-hero-${view.riskBadge}">
          <div class="signal-score-block">
            <span class="score-label">Severity</span>
            <strong>${view.magnitude.severityScore}</strong>
            <span class="score-scale">/100</span>
          </div>
          <div class="signal-copy">
            <p class="eyebrow">Current signal · ${selectedScenario.timestamp}</p>
            <h2>${escapeHtml(selectedScenario.title)}</h2>
            <p>${escapeHtml(selectedScenario.summary)}</p>
            <div class="hero-tags">
              <span>[${view.riskBadge.toUpperCase()} RISK]</span>
              <span>[${view.confidenceLabel.toUpperCase()}]</span>
              <span>[${view.magnitude.actionState.toUpperCase()}]</span>
              <span>[${selectedScenario.signalType.toUpperCase()} SIGNAL]</span>
            </div>
          </div>
        </header>

        ${renderContextStrip(view.context)}

        <section class="magnitude-deck" aria-label="Signal magnitude">
          <article class="bone-card dominant">
            <p class="eyebrow">Signal footprint</p>
            ${renderBlastRadius(view.magnitude.blastRadius)}
          </article>
          <article class="bone-card">
            <p class="eyebrow">Evidence clarity</p>
            ${renderScale('Completeness', view.magnitude.evidenceCompleteness)}
            ${renderScale('Severity', view.magnitude.severityScore)}
          </article>
          <article class="gate-card ${actionBlocked ? 'locked' : ''}">
            <span>${actionBlocked ? '[ACTION BLOCKED]' : '[REVIEW PATH]'}</span>
            <strong>${gates.items[0]}</strong>
          </article>
        </section>

        <section class="evidence-grid" aria-label="Evidence plates">
          ${renderLane(facts.label, facts.items, 'facts')}
          ${renderLane(inferences.label, inferences.items, 'inference')}
          ${renderLane(gaps.label, gaps.items, 'gaps')}
          ${renderLane(gates.label, gates.items, 'gates')}
        </section>

        <section class="review-strip">
          <div>
            <p class="eyebrow">Recommended next checks</p>
            <h3>Inspect before acting</h3>
          </div>
          ${renderList(view.nextChecks, 'checks')}
        </section>

        <section class="action-console" aria-label="Mock actions">
          ${view.actions.map(renderActionButton).join('')}
        </section>

        <section class="trail-panel" aria-label="Local in-memory action trail">
          <p class="eyebrow">Local action trail</p>
          ${renderList(activityTrail, 'trail-list')}
        </section>
      </section>
    </section>
  `;

  document.querySelectorAll<HTMLButtonElement>('[data-scenario-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = scenarios.find((scenario) => scenario.id === button.dataset.scenarioId);
      if (!next) return;
      selectedScenario = next;
      activityTrail = [`Switched to synthetic signal: ${next.brand} · ${next.surface}.`];
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.action ?? 'Action';
      activityTrail = [
        `${action} selected for ${selectedScenario.brand} · ${selectedScenario.surface}. No external action was taken.`,
        ...activityTrail
      ].slice(0, 5);
      render();
    });
  });
}

render();
