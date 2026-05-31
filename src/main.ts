import './styles.css';
import { executeReceiptAction } from './model/receipts';
import type { DecisionReceipt } from './model/types';
import { buildConsoleView, kindLabel, scenarios, type BlastRadius, type ContextItem, type Scenario } from './scenarios';

const appRoot = document.querySelector<HTMLElement>('#app');

if (!appRoot) {
  throw new Error('Missing #app root');
}

const app = appRoot;

type ActivityTrailEntry = DecisionReceipt | { message: string };

let selectedScenario = scenarios[0];
let activityTrail: ActivityTrailEntry[] = [{ message: 'Console opened in synthetic portfolio demo mode.' }];

const radiusLabels: Record<BlastRadius, string> = {
  local: 'Local',
  surface: 'Surface',
  system: 'System',
  portfolio: 'Portfolio'
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
  const view = buildConsoleView(scenario);
  const brandLabel = scenario.affectedBrands.join(', ');
  const surfaceLabel = scenario.affectedSurfaces.join(', ');

  return `
    <button class="signal-tab signal-${view.riskBadge}" data-scenario-id="${escapeHtml(scenario.id)}" aria-pressed="${active}">
      <span class="tab-score">${view.magnitude.severityScore}</span>
      <span class="tab-copy">
        <strong>${escapeHtml(brandLabel)} · ${escapeHtml(surfaceLabel)}</strong>
        <small>${escapeHtml(kindLabel(scenario.kind))} · ${radiusLabels[view.magnitude.blastRadius ?? 'local']} radius</small>
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
  const steps: BlastRadius[] = ['local', 'surface', 'system', 'portfolio'];
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

function renderDecisionFrame(view: ReturnType<typeof buildConsoleView>): string {
  return `
    <section class="decision-frame" aria-label="Why this matters for review">
      <article>
        <p class="eyebrow">Decision stakes</p>
        <strong>${escapeHtml(view.decisionFrame.decisionStakes)}</strong>
      </article>
      <article>
        <p class="eyebrow">Control pattern</p>
        <strong>${escapeHtml(view.decisionFrame.controlPattern)}</strong>
      </article>
      <article class="reviewer-proof">
        <p class="eyebrow">Reviewer proof</p>
        ${renderList(view.decisionFrame.reviewerSignals, 'proof-list')}
      </article>
    </section>
  `;
}

function renderProofSummary(view: ReturnType<typeof buildConsoleView>): string {
  return `
    <section class="proof-summary" aria-label="Proof gaps mapped to gated actions">
      <article>
        <p class="eyebrow">What changed / why blocked</p>
        <strong>${escapeHtml(view.proofSummary.posture)}</strong>
        ${renderList(view.proofSummary.blockedBecause, 'proof-gap-list')}
      </article>
      <article>
        <p class="eyebrow">Proof gap → gated action</p>
        ${renderList(view.proofSummary.gapToActionMap, 'proof-map-list')}
      </article>
    </section>
  `;
}

function renderActionButton(action: { id: string; label: string; disabled?: boolean; disabledReason?: string }): string {
  const disabledAttributes = action.disabled
    ? `disabled aria-disabled="true" title="${escapeHtml(action.disabledReason ?? 'Blocked until review clears.') }"`
    : '';

  return `<button data-action-id="${escapeHtml(action.id)}" ${disabledAttributes}>${escapeHtml(action.label)}</button>`;
}

function renderReceipt(receipt: DecisionReceipt): string {
  return `
    <li>
      <strong>${escapeHtml(receipt.receiptId)}</strong>
      <span>Scenario: ${escapeHtml(receipt.scenarioId)} · Action: ${escapeHtml(receipt.actionId)}</span>
      <span>Actor: ${escapeHtml(receipt.actor)} · Gate before: ${escapeHtml(receipt.gateStatusBefore)}</span>
      <span>Reason: ${escapeHtml(receipt.decisionReason)}</span>
      <span>Evidence snapshot: ${receipt.evidenceSnapshot.map((fact) => escapeHtml(fact.label)).join(', ')}</span>
      <span>Reversibility: ${escapeHtml(receipt.reversibility)} · External side effects: ${escapeHtml(receipt.externalSideEffects)}</span>
      <span>Created: ${escapeHtml(receipt.createdAt)}</span>
    </li>
  `;
}

function renderActivityEntry(entry: ActivityTrailEntry): string {
  if ('message' in entry) return `<li>${escapeHtml(entry.message)}</li>`;
  return renderReceipt(entry);
}

function renderActivityTrail(): void {
  const trailPanel = document.querySelector<HTMLElement>('[data-trail-panel]');
  if (!trailPanel) return;

  trailPanel.innerHTML = `
    <p class="eyebrow">Local action trail</p>
    <ul class="plate-list trail-list">${activityTrail.map(renderActivityEntry).join('')}</ul>
  `;
}

function renderShell(): void {
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
        <div class="mode-stack" aria-label="Demo mode and data boundary">
          <span>Deterministic display model</span>
          <span>Synthetic scenarios only</span>
        </div>
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
            <p class="eyebrow">Current signal · ${escapeHtml(selectedScenario.observedAt.slice(0, 10))}</p>
            <h2>${escapeHtml(selectedScenario.title)}</h2>
            <p>${escapeHtml(view.subheader)}</p>
            <div class="model-note">
              <span>Display-safe model output</span>
              <span>Invented facts, risks, gaps, and gates</span>
            </div>
            <div class="hero-tags">
              <span class="risk-tag">[${view.riskBadge.toUpperCase()} RISK]</span>
              <span>[${view.confidenceLabel.toUpperCase()}]</span>
              <span class="action-tag action-${view.magnitude.actionState}">[${view.magnitude.actionState.toUpperCase()}]</span>
              <span>[${kindLabel(selectedScenario.kind).toUpperCase()} SIGNAL]</span>
            </div>
          </div>
        </header>

        ${renderContextStrip(view.context)}

        ${renderDecisionFrame(view)}

        ${renderProofSummary(view)}

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
          <article class="gate-card action-${view.magnitude.actionState} ${actionBlocked ? 'locked' : ''}">
            <span>${actionBlocked ? '[ACTION BLOCKED]' : '[REVIEW PATH]'}</span>
            <strong>${escapeHtml(gates.items[0] ?? 'No gated actions')}</strong>
          </article>
        </section>

        <section class="evidence-grid" aria-label="Evidence plates">
          <div class="section-kicker evidence-kicker">
            <p class="eyebrow">Evidence model</p>
            <strong>Facts, inferences, gaps, and gates stay visually separated.</strong>
          </div>
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
          <div class="action-context">
            <p class="eyebrow">Mock action boundary</p>
            <strong>Buttons update only the local in-memory trail.</strong>
          </div>
          ${view.actions.map(renderActionButton).join('')}
        </section>

        <section class="trail-panel" data-trail-panel aria-label="Local in-memory action trail">
          <p class="eyebrow">Local action trail</p>
          <ul class="plate-list trail-list">${activityTrail.map(renderActivityEntry).join('')}</ul>
        </section>
      </section>
    </section>
  `;

  document.querySelectorAll<HTMLButtonElement>('[data-scenario-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = scenarios.find((scenario) => scenario.id === button.dataset.scenarioId);
      if (!next) return;
      selectedScenario = next;
      activityTrail = [{ message: `Switched to synthetic signal: ${next.affectedBrands.join(', ')} · ${next.affectedSurfaces.join(', ')}.` }];
      renderShell();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-action-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = selectedScenario.gatedActions.find((candidate) => candidate.id === button.dataset.actionId);
      if (!action) return;

      const result = executeReceiptAction(selectedScenario, action, { createdAt: new Date().toISOString() });
      if (!result.ok) return;

      activityTrail = [result.receipt, ...activityTrail].slice(0, 5);
      renderActivityTrail();
    });
  });
}

renderShell();
