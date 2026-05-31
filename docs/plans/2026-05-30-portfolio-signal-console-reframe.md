# Portfolio Signal Console Reframe Plan

> **For future agents:** Use this as a fresh-context handoff. Keep the project public-safe, synthetic, and non-identifiable. Production copy, docs, scenarios, built assets, and repo metadata must avoid private-source vocabulary. Keep explicit banned-word fixtures inside guardrail tests only.

**Goal:** Reframe Ops Signal Console from generic ops triage into a forward-looking synthetic console for multi-brand / multi-vertical portfolio operators managing launch risk, operational ambiguity, and approval gates.

**Architecture:** Keep the current static Vite/TypeScript demo. Extend the display-safe data model to include portfolio, brand, vertical, surface, signal type, blast radius, evidence confidence, and action gates. Keep all scenarios invented and in-memory. Preserve the Bonefield visual system unless a later explicit design pass changes it.

**Tech Stack:** Vite, TypeScript, vanilla DOM rendering, Vitest, CSS.

---

## Product Positioning

Current artifact:
- `Ops Signal Console`
- Synthetic AI-assisted ops/signal triage console.
- Strong visual identity: graphite field, bone evidence plates, amber review gates.

Launch reframe:
- Public-facing naming can remain `Ops Signal Console` for now unless renamed deliberately.
- The concept should read as a cross-brand judgment layer for fast-moving consumer/product portfolios.

Core idea:
- A growing portfolio launches multiple brands, product lines, and surfaces.
- Signals appear across launch operations, quality, inventory, content, retail, and digital surfaces.
- The console separates facts, inferences, missing evidence, blast radius, confidence, and human approval gates before action.

## Public-Safety Boundary

DO NOT add:
- Identifying people, organizations, products, private names, links, service paths, logs, routes, images, or non-public metrics.
- Private-source domain vocabulary in production copy, docs, scenarios, built assets, or repo metadata.
- Network calls, telemetry, browser automation, persistence, scraping, live integrations, sign-in, or external writes.

DO use:
- Invented portfolio and brand names.
- Invented verticals such as hydration, frozen snacks, home replenishables, wellness accessories, and retail trial packs.
- Synthetic signal sources like launch monitor, retail digest, quality sample, field-note cluster, channel drift report.
- Display-safe facts/inferences/gaps.
- Human approval gates before recommendations become action.

## Recommended Synthetic Frame

Invented parent company:
- `Northstar Goods Lab`, `Orchard Works`, or `Fictional Portfolio Group`.

Invented brands:
- `Kite`, `Mesa`, `Luma`, `Field`, `Arc`.

Invented verticals:
- hydration
- frozen snacks
- home replenishables
- wellness accessories
- retail trial packs

Invented surfaces:
- launch readiness
- retail allocation
- quality sample
- field feedback
- content/claims review
- inventory freshness
- support signal cluster

Use only two or three scenarios at first. YAGNI.

## Acceptance Criteria

The implementation pass is complete when:
- The scenario model includes portfolio/multi-brand dimensions.
- The rendered UI clearly shows brand, vertical, surface, signal type, severity, confidence, evidence completeness, blast radius, and action gate.
- At least three synthetic scenarios demonstrate different brand/vertical/surface combinations.
- The README and AGENTS.md describe the portfolio/multi-brand frame without real-world identifiable context.
- Tests verify the new fields and forbid leakage terms.
- Build assets are searched for forbidden terms.
- No network/storage/telemetry APIs are introduced.
- Existing verification commands pass.

## Task 1: Patch the Project Frame Docs

**Objective:** Make the active project docs reflect the multi-brand / portfolio-ops direction.

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

**Steps:**
1. Update README one-liner from generic ops triage to synthetic portfolio signal triage.
2. Add a `Portfolio frame` section:
   - multi-brand operators
   - new vertical launches
   - signal triage across surfaces
   - facts/inferences/gaps/gates
3. Add the public-safety boundary to AGENTS.md without listing private-source terms outside tests.
4. Add instruction that private/real-world company context is inspiration only, not source material.
5. Run `git diff --check`.

**Expected verification:**
- Docs mention portfolio/multi-brand direction.
- Docs do not mention real company names or private-source terms.

## Task 2: Extend Scenario Types

**Objective:** Add portfolio dimensions to the display-safe data model.

**Files:**
- Modify: `src/scenarios.ts`
- Modify: `tests/scenarios.test.ts`

**Fields to add to `Scenario`:**
- `portfolio: string`
- `brand: string`
- `vertical: string`
- `surface: string`
- `signalType: 'launch' | 'quality' | 'demand' | 'operations' | 'feedback' | 'claims'`
- optional if useful: `decisionOwner: string`

**TDD steps:**
1. Add a failing test that every scenario has portfolio, brand, vertical, surface, and signalType.
2. Add a failing test that at least two brands and at least two verticals appear across scenarios.
3. Add the fields to the TypeScript interface and scenario objects.
4. Run `npm test` and verify pass.

## Task 3: Rewrite Scenarios as Multi-Brand Portfolio Signals

**Objective:** Replace generic ops examples with invented portfolio-launch examples.

**Files:**
- Modify: `src/scenarios.ts`
- Modify: `tests/scenarios.test.ts`

**Scenario direction:**
1. High severity: launch-readiness drift across an invented hydration brand and retail test surface.
2. Medium severity: quality-sample concern for an invented frozen snack vertical.
3. Lower/uncertain severity: field-feedback cluster for an invented home replenishables brand.

**Rules:**
- Keep all names invented.
- Keep private-source terms out of production copy and docs.
- Keep approval gates human-centered.
- Keep facts/inferences/gaps distinct.

**Verification:**
- `npm test`
- Search source for forbidden terms.

## Task 4: Update Rendering for Portfolio Context

**Objective:** Make the UI visibly communicate multi-brand / multi-vertical triage.

**Files:**
- Modify: `src/main.ts`
- Modify: `src/styles.css` only if existing classes are insufficient

**UI additions:**
- Add a compact context strip near the top:
  - portfolio
  - brand
  - vertical
  - surface
  - signal type
- Add brand/vertical labels to scenario tabs.
- Keep the existing severity score, blast radius, evidence plates, and approval gates.
- Prefer existing Bonefield components and CSS variables.
- Do not do a full visual redesign in this task.

**Verification:**
- `npm test`
- `npm run typecheck`
- `npm run build`

## Task 5: Add Leakage and API Guard Tests

**Objective:** Prevent old/private/domain-specific context from leaking into source and scenarios.

**Files:**
- Modify: `tests/scenarios.test.ts`

**Test coverage:**
- Scenario IDs, titles, summaries, sources, facts, inferences, proof gaps, recommended checks, and gates should not contain forbidden terms.
- Render-facing action labels should not contain forbidden terms.
- No network/storage APIs in source files if not already covered.

**Verification:**
- `npm test`

## Task 6: Final Verification and Commit

**Objective:** Verify and checkpoint the reframe.

**Commands:**
```bash
npm test
npm run typecheck
npm run build
git diff --check
```

**Additional grep:**
Search `src`, `tests`, `README.md`, `AGENTS.md`, and `dist` for forbidden terms. Terms may appear only inside banned-list tests; production/source copy and built assets must be clean.

**Commit:**
```bash
git add README.md AGENTS.md src tests docs
git commit -m "feat: reframe console for portfolio signal triage"
```

## Stop Conditions

Stop and report instead of improvising if:
- You need real-world identifiers to make the artifact understandable.
- You are tempted to add integrations, data fetching, persistence, sign-in, telemetry, or external writes.
- The UI direction requires a major visual redesign beyond context labels and scenario content.
- Tests fail after one focused fix attempt.
- Public-safety grep finds forbidden terms in production code, docs, or built assets and you cannot remove them cleanly.
