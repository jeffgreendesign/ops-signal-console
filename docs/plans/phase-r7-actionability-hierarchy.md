# Phase R7 — Actionability Hierarchy and Gate Visualization Plan

> **For future agents:** This is a proposed local-only implementation plan. Do not deploy, push, open a PR, or merge unless explicitly requested. Read `AGENTS.md` and `docs/master-plan.md` first.

**Goal:** Make the console answer “what can I do now, what is blocked, and what proof would change that?” faster than the current equal-weight panel layout.

**Visual direction:** Stark operator-console hierarchy, not generic SaaS analytics. Use hard dividers, label-like states, rigid gate paths, and confident product utility. Avoid decorative AI/glass/neon/growth-dashboard motifs.

**Architecture:** Add a deterministic display-safe actionability/gate-path summary from existing scenario and display-model fields. Render it as a primary visual module, then demote or merge duplicate action-state panels. Keep the browser layer thin and preserve public-safety scanner boundaries.

**Tech stack:** Vite, TypeScript, existing deterministic model/display adapter, existing CSS only. No new dependencies.

---

## Scope

DO:

- Add one dominant actionability/gate visualization.
- Make the available internal action obvious without reading every panel.
- Map blocked actions to missing proof and/or approval requirements.
- Pair evidence gaps with next checks and gated actions where possible.
- Reduce repeated action-state copy across the page.
- Preserve facts / inferences / gaps / gates separation, but make it supporting evidence rather than the main hierarchy.
- Use existing scenario/display-model data only.
- Add tests before implementation for the new display-safe mapping/rendering invariant.

DO NOT:

- Add new dependencies.
- Add persistence, storage APIs, telemetry, network calls, live integrations, sign-in, scraping, browser automation, or external writes.
- Add real/private/source-identifying data.
- Add generic charts just to add charts.
- Make green mean “good news.” Keep action-readiness separate from upside/risk.
- Change deterministic scoring semantics just for visual impact.
- Deploy, push, open a PR, or merge unless explicitly requested.

---

## Current problems to solve

1. **Panels blend together.** Most modules use similar rectangular card weight, so the user cannot quickly tell which panel is primary.
2. **Actionability is scattered.** Action state appears in the signal summary, gated-action card, recommended checks, mock action boundary, action buttons, and activity trail.
3. **Some information overlaps.** Evidence gaps, recommended checks, and gated actions are related but separated into different text blocks.
4. **Existing graphic elements are not decisive enough.** Signal footprint and evidence clarity are useful, but they do not clearly answer what action is allowed or blocked.
5. **Most actionable path is not visually dominant.** The user must read across the full dashboard to find the allowed action and the blocker.

---

## Proposed product model

Add a display-level summary shaped like:

```ts
type ActionabilityPath = {
  id: string;
  label: string;
  state: 'available' | 'blocked' | 'needsApproval' | 'needsEvidence';
  actionType: string;
  gateStatus: string;
  primaryReason: string;
  proofNeeded: string[];
  nextChecks: string[];
  externalSideEffects: 'none';
};

type ActionabilitySummary = {
  posture: string;
  availableNow: ActionabilityPath[];
  blocked: ActionabilityPath[];
  nextProof: string[];
};
```

Exact type names can change, but keep the meaning: **available now / blocked / next proof**.

Source data should come from existing scenario/display fields:

- `gatedActions`
- `evidenceGaps`
- `recommendedChecks`
- gate/scoring display model
- receipt/action boundary fields

Do not invent new scenario facts unless a test proves the fixture needs an explicit missing relation.

---

## Visual concept

Primary module: **Actionability Stack** or **Decision Gate Stack**.

Suggested structure:

```text
ACTIONABILITY

AVAILABLE NOW
[Investigate internally]
local-only · externalSideEffects: none

BLOCKED
[Public/channel action]
missing proof → human approval → locked

NEXT PROOF
1. Compare second synthetic sample set
2. Confirm handling-window proof
```

Graphic treatment:

- Hard horizontal/vertical divisions.
- Label-like uppercase states.
- Lock/gate markers or stepped path segments.
- Available path visually prominent, but not celebratory.
- Blocked paths visually constrained/dashed/locked.
- Motion only as functional state settling on scenario change; respect reduced motion.

Avoid:

- Smooth line charts.
- Generic dashboard sparklines.
- Decorative blobs/glass/neon.
- Colorful “success” celebration.

---

## Implementation tasks

### Task 1: Add failing actionability summary tests

**Objective:** Prove the display model exposes a reviewer-safe actionability summary before UI work.

**Files:**

- Modify: `tests/ui-adapter.test.ts` or `tests/scenarios.test.ts`
- Modify later: `src/scenarios.ts` and/or `src/model/scoring.ts`

**Steps:**

1. Add tests that build the console view for a scenario with at least one available internal action and blocked actions.
2. Assert the view exposes:
   - one or more `availableNow` entries,
   - one or more `blocked` entries,
   - `nextProof` / missing proof copy,
   - `externalSideEffects: 'none'` for allowed local actions,
   - no public/channel action marked available unless existing gates allow it.
3. Run targeted test and confirm RED.

Suggested command:

```bash
npm test -- --run tests/ui-adapter.test.ts -t actionability
```

Expected: FAIL because the actionability summary does not exist yet.

### Task 2: Build deterministic actionability summary

**Objective:** Add the smallest pure helper or adapter mapping to satisfy the tests.

**Files:**

- Modify: `src/scenarios.ts` and/or `src/model/scoring.ts`
- Modify: related type exports if needed

**Steps:**

1. Derive available actions from existing gate/action disabled state.
2. Derive blocked actions from existing gated actions and disabled reasons.
3. Map evidence gaps to blocked actions where existing labels allow it.
4. Use static display-safe fallback copy when a relation is missing.
5. Return the summary from `buildConsoleView`.
6. Run targeted tests and confirm GREEN.

Suggested command:

```bash
npm test -- --run tests/ui-adapter.test.ts -t actionability
```

### Task 3: Render the primary actionability module

**Objective:** Make actionability the dominant product decision surface.

**Files:**

- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify/add: CSS/rendering source-level tests if following existing patterns

**Steps:**

1. Add a render function for the actionability summary.
2. Place it near the top of `.console-stage`, before or alongside lower-priority evidence panels.
3. Demote or remove the most redundant action-state card if it duplicates the new module.
4. Keep action buttons and local trail, but visually lower priority than the actionability module.
5. Add CSS with strong hierarchy and no new visual system theme.
6. Preserve mobile layout: the actionability stack should remain readable in one column.

### Task 4: Reduce duplicate action-state copy

**Objective:** Make repeated panels support the primary module rather than restating it.

**Files:**

- Modify: `src/main.ts`
- Modify: `src/styles.css`

**Steps:**

1. Identify action-state copy repeated in:
   - top action card,
   - gated actions card,
   - recommended checks,
   - mock action boundary,
   - action buttons.
2. Keep one primary answer in the new module.
3. Keep supporting details only where they add distinct evidence, receipt, or safety information.
4. Do not remove public-safety boundary copy entirely.

### Task 5: Verify full project

Run:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

If visual changes are substantial and a preview is explicitly requested, follow Phase R6. Otherwise stop local-only after a verified commit.

---

## Acceptance criteria

- The user can identify the available action within a few seconds.
- Blocked actions visibly map to missing proof or approval gates.
- Evidence gaps and recommended checks are connected, not isolated lists.
- The primary actionability module is visually more important than supporting evidence cards.
- Duplicate action-state copy is reduced.
- Existing deterministic scoring, receipts, gates, and public-safety constraints remain intact.
- All tests/typecheck/build/public-safety/whitespace checks pass.

---

## Suggested commit message

```bash
git commit -m "feat: add actionability gate visualization"
```
