# Ops Signal Console Master Plan

> **For future agents:** This is the authoritative plan. Use this before any `docs/plans/*` handoff. Do not continue a numbered phase from an older local handoff unless it matches this file.

**Last reviewed:** 2026-06-01
**Repo:** project root (`ops-signal-console`)
**Project mode:** Fresh public-safe synthetic prototype, with extracted learnings only.
**Current baseline:** Working static Vite/TypeScript demo with deterministic scenarios, display model, UI adapter, visual shell, proof-gap summary, typed mock receipts, public-safety release gate, product proof packaging, tests, and docs.

---

## 1. Product objective

Build a public-safe synthetic portfolio artifact that demonstrates how an applied-AI product system can:

1. Consolidate noisy cross-brand operational signals.
2. Separate known facts from inferred risks.
3. Track evidence gaps and uncertainty.
4. Score severity, confidence, evidence completeness, blast radius, and action readiness deterministically.
5. Block unsafe public/channel actions until evidence and human approval gates are satisfied.
6. Leave inspectable mock receipts for allowed local/internal actions, with no live side effects.
7. Prove public-safety discipline through tests, scans, docs, UI copy, and built-asset checks.

The artifact should feel like a product control surface, not a generic analytics dashboard.

---

## 2. Source-of-truth hierarchy

Read in this sequence:

1. `AGENTS.md` — hard repo rules and public-safety boundaries.
2. `docs/master-plan.md` — this file; authoritative phase map and current state.
3. `README.md` — public-facing summary and verification commands.
4. `docs/model.md`, `docs/scenarios.md`, `docs/public-safety.md`, `docs/scope.md` — reference docs.
5. `docs/plans/*` — local handoffs and implementation notes only; not authoritative unless this file names them as active.

Deprecated/stale handling:

- `docs/implementation-plan.md` was an early truncated plan. It should point here or be replaced by this master plan.
- `docs/plans/phase-5-next-proof-polish.md` is not the original Phase 5. Treat it as a completed proof-polish interlude, not the current Phase 5 source of truth.
- Untracked `docs/plans/phase-3-*`, `phase-4-*`, and `phase-5-*` files are useful evidence/handoffs but should not drive future work by phase number.

---

## 3. Non-negotiable boundaries

DO NOT add:

- Identifying people, organizations, traces, response records, links, secrets, or private context.
- Real brands, real leader/person names, real suppliers, real retailers, real metrics, exact public phrases, screenshots, logs, route maps, URL path names, user identifiers, operational traces, or source-identifiable examples.
- Live integrations, live alerts, production-system access, scraping, browser automation, telemetry, persistence, external writes, networked feeds, sign-in, buying flows, user-profile flows, or irreversible production behavior.
- Domain-specific material from another project.
- AI auto-approval of public/channel actions.

DO use:

- Invented portfolio, brand, vertical, surface, source, region, and signal names.
- Display-safe facts, inferences, evidence gaps, recommended checks, and gates.
- Deterministic model functions and tests before UI claims.
- Static/demo-first implementation suitable for later Vercel or Netlify hosting.

External gates requiring Jeff approval:

- Creating/changing a public repo.
- Publishing/deploying a public preview beyond temporary local/Cloudflare-style review links.
- Posting about the artifact publicly.
- Adding live integrations, analytics, sign-in, persistence, or external APIs.
- Merging PRs.

---

## 4. Live repo review against original plan

### Verification run on 2026-05-31

Commands run from the project root:

- `npm test` → passed: 7 test files, 54 tests.
- `npm run typecheck` → passed.
- `npm run scan:public-safety` → passed: source, docs, tests, scenario fixtures, and built assets are public-safe.
- `npm run build` → passed; Vite built `dist/index.html`, CSS, and JS assets.
- `git diff --check && git status --short` → whitespace check passed; untracked plan files remain.
- Extra banned API scan over `src`, `docs`, `tests`, `dist`, root docs/config → findings only inside `tests/scenarios.test.ts` banned-list assertions.

### Current implemented baseline

Implemented:

- Vite/TypeScript static app scaffold.
- `AGENTS.md`, README, scope/model/scenario/public-safety docs.
- Deterministic `SignalScenario` model and pure scoring/gate functions.
- Five synthetic scenarios:
  - `qualitySampleDrift`
  - `claimsReviewBlocked`
  - `channelMismatch`
  - `launchReadinessMismatch`
  - `opportunitySignal`
- UI adapter in `src/scenarios.ts` that maps deterministic model output into render shape.
- UI shell in `src/main.ts` and visual system in `src/styles.css`.
- Proof-gap summary in display model and UI.
- `DecisionReceipt` type, `createReceiptShape` helper, and typed `executeReceiptAction` result.
- In-memory local activity trail with typed mock receipts for allowed internal actions.
- Tests for scoring, gates, phase-2 scenarios, UI adapter, public-safety terms/API boundaries, public-safety scanner, responsive visual constraints, proof-gap summary, and receipts.
- Public-safety scanner covering source, docs, tests, scenario fixtures, built assets, banned APIs, forbidden terms, fixture isolation, live URLs, and live/source implication copy.

Partially implemented or weak:

- Visual hierarchy can better foreground signal magnitude, evidence quality, proof gaps, and approval gates now that receipts and the release gate are implemented.
- Repo planning docs: conflicting plan files caused phase drift.

Not implemented / do not claim yet:

- Production readiness.
- Live integrations.
- Public deployment.
- Rollback flow.

### Drift found

Original controlling plan defined Phase 5 as **Public-safety scans, banned APIs, and documentation**.

Repo-local `docs/plans/phase-5-next-proof-polish.md` redefined Phase 5 as **Next Proof Polish**, adding proof-gap summary. That work appears useful and verified, but it was not the original Phase 5. Rename mentally as **Phase 4b / proof-polish interlude**.

Do not advance to old Phase 6 until the reset phases below are complete.

---

## 5. New phase map from current baseline

### Phase R0 — Plan reset and documentation hierarchy

**Status:** complete.
**Goal:** Make this master plan discoverable and stop phase-number drift.  
**Stop condition:** Future agents start from this file and understand older handoffs are reference-only.

Checklist:

- [x] Review original plan against live repo.
- [x] Create `docs/master-plan.md`.
- [x] Update `AGENTS.md` to name `docs/master-plan.md` as authoritative.
- [x] Replace or patch `docs/implementation-plan.md` so it cannot be mistaken for current full plan.
- [x] Add `docs/README.md` with doc hierarchy if absent.
- [x] Decide whether to commit or delete untracked local handoff files.

Verification:

- `git diff --check`
- Read changed doc snippets.

Commit suggestion:

```bash
git add AGENTS.md docs/master-plan.md docs/implementation-plan.md docs/README.md
git commit -m "docs: reset ops signal master plan"
```

### Reference handoff carry-forward

The old `docs/plans/phase-3-*`, `phase-4-*`, and `phase-5-*` files are not active phase authorities, but their concrete specs are preserved here at summary level so future agents do not need to rediscover them.

Phase 3 reference — UI wired to deterministic display model:

- Goal: visible console consumes `buildDisplayModel(scenario)` instead of duplicated hand-authored UI state.
- Source-of-truth rule: keep `src/data/scenarios.ts` as scenario fixture source and `src/model/scoring.ts#buildDisplayModel` as severity/confidence/evidence/gate source.
- Adapter rule: `src/scenarios.ts` should remain a thin UI adapter over `SignalScenario + DisplayModel`; no hand-authored severity, confidence, evidence-completeness, blast-radius, or action-state values.
- Test carry-forward: `tests/ui-adapter.test.ts` should verify scenario IDs/counts match fixture source, model-derived severity/confidence/evidence/blast/action fields match, and blocked/allowed action labels/status/reasons derive from the model.
- Content carry-forward: UI-facing output must include known facts, inferred risks, evidence gaps, recommended checks, gated/blocked actions, affected brands/surfaces, deterministic scores, disabled non-internal actions, and visible available internal actions.
- Scenario carry-forward: quality sample drift, claims review blocked, channel mismatch, and launch readiness mismatch must all render through the UI-facing view.
- Negative assertions: channel mismatch must not treat sustained demand as proven; non-internal missing-proof actions must remain disabled with display-safe reasons; rendered/view-model output must remain free of live links and source-identifying terms.
- Implementation path: update tests first, then replace `src/scenarios.ts` with adapter helpers, then patch `src/main.ts` to consume adapter-safe fields only.
- Verification: targeted UI-adapter tests, scenario tests, full `npm test`, `npm run typecheck`, `npm run build`, `npm run scan:public-safety`, and `git diff --check`.
- Review/commit rule: use no-edit review if multiple files changed; commit only verified Phase 3 files.

Phase 4 reference — visual/product polish:

- Goal: improve scan clarity and product framing while preserving the deterministic, synthetic-only boundary.
- Scope: minimal UI-focused changes; clarify deterministic display-model framing; improve scenario selection, evidence/gates, review-readiness hierarchy, and responsive spacing.
- Non-goals: no live integrations, telemetry, persistence, sign-in, scraping, external writes, new dependencies, deployment, PR, merge, push, or remote access-token work.
- Implementation rule: use existing display-safe fields only; treat as rendering/legibility polish, not data-contract or model behavior work.
- Verification: full test/typecheck/build/public-safety/whitespace checks plus bounded browser/static preview smoke if UI changes are visible.
- Commit rule: commit only Phase 4 implementation files; do not automatically include local handoff files.

Proof-polish interlude reference — old repo-local “Phase 5”:

- Goal: add one small deterministic improvement that helps reviewers understand the console as product proof without broad redesign.
- Chosen slice: display-model-backed proof-gap summary.
- Required questions answered: what changed in review posture; why action is blocked/gated; which missing proof maps to which gated action.
- Constraints: synthetic/display-safe data only; TDD for display-model/helper/data-contract changes; thin UI wiring that renders fields from the deterministic display model.
- Verification: targeted RED/GREEN test for proof summary, full verification commands, and browser/preview smoke if visible UI changes are made.
- Current status: implemented in the live baseline as `proofSummary`; keep it as completed proof-polish evidence, not as the active Phase 5 definition.

### Phase R1 — True receipt state machine

**Status:** complete.
**Goal:** Finish original Phase 4 as deterministic, typed, tested mock receipts.  
**Stop condition:** Allowed internal mock actions create typed in-memory receipts; blocked/channel/public actions cannot create receipts; tests prove no side effects.

Files likely touched:

- `src/model/receipts.ts`
- `src/model/gates.ts`
- `src/model/types.ts`
- `src/main.ts`
- `src/scenarios.ts`
- `tests/receipts.test.ts` or equivalent
- `tests/scenarios.test.ts` / `tests/ui-adapter.test.ts` if UI adapter fields change

Acceptance criteria:

- [x] Add tests for `createReceiptShape`.
- [x] Add tests that blocked actions cannot create receipts.
- [x] Add tests that approval-required actions cannot execute without approved state.
- [x] Model receipt creation as a function that returns `{ receipt, nextGateStatus }` or a typed blocked result.
- [x] UI action trail renders typed receipt fields, not only a string.
- [x] Receipt UI shows `receiptId`, `scenarioId`, `actionId`, `gateStatusBefore`, `decisionReason`, `reversibility`, `externalSideEffects: none`, and `createdAt`.
- [x] No persistence, storage APIs, telemetry, or external writes.
- [x] Disabled public/channel actions remain disabled.

Required verification:

```bash
npm test
npm run typecheck
npm run scan:public-safety
npm run build
git diff --check
```

Stop and hand off if:

- Receipt implementation wants persistence/storage.
- A live action/integration/notification path seems tempting.
- Any public/channel action becomes executable.

### Phase R2 — True public-safety scanner and docs release gate

**Status:** complete.
**Goal:** Complete original Phase 5.  
**Stop condition:** One command scans source/docs/tests/build output for banned APIs, forbidden terms, fixture isolation, and synthetic-only constraints; README/docs explain what is intentionally absent.

Files likely touched:

- `scripts/scan-public-safety.mjs`
- `tests/public-safety-terms.ts`
- `tests/scenarios.test.ts`
- `README.md`
- `docs/public-safety.md`
- `docs/scope.md`
- `docs/model.md`
- `docs/scenarios.md`

Scanner requirements:

- [x] Scan source files.
- [x] Scan docs.
- [x] Scan scenario fixtures.
- [x] Scan built assets after `npm run build`.
- [x] Detect banned browser/network/storage/telemetry APIs.
- [x] Detect forbidden/source-identifying terms with word boundaries for short terms.
- [x] Allow exact forbidden terms only inside banned-list fixture/test files.
- [x] Fail if scenario data contains live URLs.
- [x] Fail if docs imply real-company source material or live production behavior.
- [x] Print clear findings with file paths.

README/docs requirements:

- [x] What this is.
- [x] Why it exists.
- [x] What it demonstrates.
- [x] Deterministic model and UI adapter path.
- [x] Evidence/risk separation.
- [x] Confidence vs severity distinction.
- [x] Human approval gates.
- [x] Mock receipts and `externalSideEffects: none`.
- [x] Synthetic/public-safe design.
- [x] Verification commands.
- [x] What is intentionally not included.
- [x] Future extensions clearly separated from current claims.

Required verification:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

### Phase R3 — Product proof packaging

**Status:** complete.
**Goal:** Make the artifact evaluable as a hiring proof object without overclaiming.  
**Stop condition:** A reviewer can understand the product judgment, architecture, safety constraints, verification path, and non-goals in 2–3 minutes.

Scope:

- [x] Add a concise “What this proves” README section.
- [x] Add one model-flow diagram or text architecture flow.
- [x] Add a scenario walkthrough for one scenario.
- [x] Add screenshot captions or browser-captured screenshot notes if a preview is available.
- [x] Add “reviewer proof claims” and “do not claim” sections.

Allowed proof claims:

- Deterministic display model, not prompt-only classification.
- Known facts separated from inference.
- Confidence separated from severity.
- Evidence gaps block action.
- Public/channel actions require human gates.
- Mock receipts prove inspectable execution without side effects.
- Synthetic-only constraints are tested.

Do not claim:

- Production readiness.
- Live integrations.
- Real company fit.
- Real operational source material.
- Real nutrition/regulatory/claims advice.

### Phase R4 — Visual hierarchy pass, only after R1/R2

**Status:** complete.
**Goal:** Improve scan clarity once receipts and public-safety proof are complete.  
**Stop condition:** Signal magnitude, evidence quality, and approval gates are legible on desktop and mobile without relying on long copy.

Rules:

- Do not change product model just for aesthetics.
- Do not add generic SaaS/glass/neon/AI motifs.
- Do not introduce decorative state colors that conflict with semantic risk/gate colors.
- Keep proof and public safety intact.

Verification:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

### Phase R5 — Opportunity signal scenario

**Status:** complete.
**Goal:** Add one positive/upside signal that proves the console can detect opportunity without prematurely recommending external action.
**Stop condition:** A synthetic opportunity scenario renders through the deterministic model/UI adapter, distinguishes upside from proof/readiness, and keeps public/channel actions gated until evidence and human approval clear.

Rules:

- Frame the scenario as **promising but not proven**, not celebratory green status.
- Do not make green mean “good news”; preserve green primarily for available/internal action readiness.
- Do not add generic SaaS/growth-dashboard motifs or decorative optimism.
- Do not change the deterministic scoring model just to make the opportunity look positive.
- Keep scenario data synthetic/public-safe with invented brands, surfaces, sources, checks, and proof gaps.
- Preserve typed receipts, public-safety scanner coverage, and no-side-effect action boundaries.

Suggested scenario shape:

- Title direction: “Promising channel lift needs independent proof” or equivalent.
- Kind direction: `opportunitySignal` / `positiveSignal` only if the type/model change is minimal and tested.
- Known facts: early synthetic lift or quality signal, bounded source, one repeat/independent proof missing.
- Inferred risks: amplification risk, sample bias, or premature expansion risk.
- Evidence gaps: independent proof, repeat window, or readiness threshold.
- Actions:
  - Available internal action: log/review opportunity packet.
  - Gated channel/public actions: expand/amplify only after proof and human approval.

Acceptance criteria:

- [x] Add or update tests before implementation for the opportunity scenario.
- [x] Scenario appears in the UI via the existing adapter path.
- [x] Opportunity/upside copy is visible without implying proof or production readiness.
- [x] Severity/risk remains separate from opportunity size or upside potential.
- [x] Evidence gaps still lower confidence/evidence completeness.
- [x] Public/channel actions remain disabled or approval-gated until proof clears.
- [x] Available internal action can create only a typed local mock receipt.
- [x] Public-safety scanner still passes over source, docs, tests, scenarios, and built assets.

Verification:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

### Phase R6 — Optional preview / PR / deployment lifecycle

**Status:** blocked on Jeff approval.  
**Goal:** Make a reviewable preview or PR only when explicitly requested.  
**Stop condition:** Preview/PR status is explicit; no merge without Jeff saying `merge`.

Before any preview:

- [ ] Inspect existing preview processes for this repo.
- [ ] Run tests/typecheck/build/public-safety scan.
- [ ] Confirm no unapproved live integrations.
- [ ] Start local server.
- [ ] Verify with browser/HTTP.
- [ ] Create shareable temporary preview only if appropriate.

Before PR/push:

- [ ] Check git status.
- [ ] Commit logical changes.
- [ ] Push/open PR only if requested or consistent with current repo workflow.
- [ ] Report CI status.
- [ ] Do not merge without Jeff explicitly saying `merge`.

### Phase R7 — Proposed next local-only phase

**Status:** proposed / unassigned; do not implement without Jeff naming this or another build slice.
**Goal:** Add one small local-only product behavior slice that makes the console more useful as an inspectable decision surface without changing external lifecycle state.
**Stop condition:** Jeff explicitly approves a local implementation slice, or this proposal remains docs-only.

Candidate local-only slices:

1. **Scenario comparison mode** — compare two synthetic scenarios side by side using existing deterministic display-model fields.
2. **Gate reason drill-down** — expand one action gate to show the exact missing evidence and human approval requirements that keep it blocked.
3. **Receipt replay view** — render the in-memory mock receipt trail as a review log grouped by scenario/action, still with `externalSideEffects: none`.
4. **Proof checklist export copy** — generate display-safe local copy from known facts, inferred risks, evidence gaps, recommended checks, and blocked actions.

Constraints for any R7 implementation:

- Local-only static app behavior; no preview, push, PR, deployment, or merge unless separately requested.
- No new dependencies unless Jeff approves.
- No persistence, storage APIs, telemetry, network calls, live integrations, sign-in, scraping, browser automation, or external writes.
- Synthetic/public-safe data only.
- Prefer TDD through existing model/adapter tests before UI wiring.
- Preserve the existing public-safety scanner and no-side-effect receipt boundaries.

Recommended first R7 candidate, if Jeff wants local implementation: **Gate reason drill-down**. It is the smallest behavior-focused continuation after R5, reinforces the artifact’s core product judgment, and avoids premature lifecycle or presentation work.

---

## 6. Recommended next action

Phase R6 remains available but approval-gated: create a preview, push/open a PR, deploy, or merge only if Jeff explicitly requests that lifecycle step.

For local-only continuation, do not deploy/push/open PR. Ask Jeff to choose a Phase R7 candidate or name a different build slice. If Jeff says to proceed locally without a specific direction, start with the proposed R7 **Gate reason drill-down** slice and stop after a verified local commit.

---

## 7. Completion report contract

Every future coding completion must state:

- Implementation: done / partial / not started.
- Verification: exact commands and results.
- Preview: URL or not created.
- PR: link or not created.
- CI: status or not applicable.
- Merge: not merged unless Jeff said `merge`.
- Cleanup: processes/branches handled or remaining.
- Public safety: scanner/build/source/doc status.
- Remaining actions: next phase/task from this master plan.

Do not say “Phase N complete” unless the stop condition in this file is satisfied.
