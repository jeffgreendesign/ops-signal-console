# Phase R2 Public-Safety Release Gate Continuation Plan

> Continue Phase R2 only. Do not push, PR, preview, deploy, add dependencies, or add live integrations.

**Goal:** Finish the true public-safety scanner and docs release gate after the interrupted partial implementation.

**Architecture:** Keep `scripts/scan-public-safety.mjs` as the single release-gate command behind `npm run scan:public-safety`. The scanner should inspect source, docs, tests, scenario fixtures, and built assets, while allowing forbidden inventory terms only in explicit test/fixture files. Tests should import scanner helpers and cover behavior deterministically without leaving literal banned API or source-identifying text in ordinary source or tests.

**Tech Stack:** Vite, TypeScript, Vitest, Node ESM script. No new dependencies.

---

## Current WIP state

A prior session partially implemented R2 and stopped because `npm run scan:public-safety` still failed.

Known local changes likely present:
- `scripts/scan-public-safety.mjs`: upgraded scanner with exports and richer findings.
- `tests/public-safety-scanner.test.ts`: new scanner tests.
- `tests/scan-public-safety.d.ts`: attempted module declaration.
- `tests/scenarios.test.ts`: banned API fixture strings partially split.
- `docs/master-plan.md`: small wording change.
- `docs/plans/2026-05-30-portfolio-signal-console-reframe.md`: changed one reframe label to a safer launch-oriented label.

Last known scanner failure:
- `tests/public-safety-scanner.test.ts` contained a literal storage API token in an expected finding.
- Context: expected detail used a direct string rather than a composed fixture value.

Primary fix: do not leave literal banned API strings in scanner tests except inside explicit allowlisted fixture files. Build expected strings from split parts.

---

## Guardrails

DO:
- Keep everything synthetic and public-safe.
- Use TDD for scanner behavior changes.
- Build first before final scan so `dist/` exists.
- Keep forbidden terms/banned API inventories isolated in explicit fixture/test files or split strings.
- Print clear scanner findings with file path, line, column, finding type, detail, and context.
- Update README/docs only to accurately describe the actual scanner/release gate.

DO NOT:
- Add live integrations, network calls, telemetry, persistence, storage APIs, external writes, sign-in, deployment, PR, preview, or new dependencies.
- Weaken the scanner to pass tests.
- Add private/source-identifying terms to public docs or fixtures except explicit forbidden inventory fixtures.
- Change visual design.
- Push, open PR, deploy, or preview.

---

## Task 1: Inspect and stabilize WIP

**Objective:** Re-anchor on actual files and avoid overwriting unrelated staged R0/R1 work.

**Files:**
- Read: `AGENTS.md`
- Read: `docs/master-plan.md`
- Read: `README.md`
- Read: `docs/public-safety.md`
- Read: `docs/scope.md`
- Read: `docs/model.md`
- Read: `docs/scenarios.md`
- Read: `scripts/scan-public-safety.mjs`
- Read: `tests/public-safety-terms.ts`
- Read: all `tests/*.ts`

**Steps:**
1. Run `git status --short --branch`.
2. Note that there may already be staged changes from R0/R1. Do not unstage or revert them unless necessary.
3. Read the files above in sequence.
4. Run the scoped diff for scanner, scanner tests, scenario tests, README, and docs.

**Expected:** You understand the partial R2 diff and current scanner failure.

---

## Task 2: Fix literal banned API strings in scanner tests

**Objective:** Let the scanner enforce its own rule over tests without false fixture leaks.

**Files:**
- Modify: `tests/public-safety-scanner.test.ts`

**Steps:**
1. Search within the file for direct banned API text.
2. For expected details, build strings from split parts, e.g. use a helper that joins parts.
3. Keep the test inputs realistic by composing strings at runtime.
4. Do not add allowlist exceptions for this file just to pass.

**Verification:**
- Run `npm test -- --run tests/public-safety-scanner.test.ts`.
- Expected: pass.

---

## Task 3: Run scanner and fix real findings without weakening it

**Objective:** Make `npm run scan:public-safety` pass by fixing docs/tests/content or narrowing fixture isolation correctly.

**Files likely touched:**
- `scripts/scan-public-safety.mjs`
- `tests/public-safety-scanner.test.ts`
- `tests/scenarios.test.ts`
- `README.md`
- `docs/public-safety.md`
- `docs/scope.md`
- `docs/model.md`
- `docs/scenarios.md`
- Possible old docs under `docs/plans/` only if scanner includes them and they contain unsafe literal terms.

**Steps:**
1. Ensure `dist/` exists: run `npm run build`.
2. Run `npm run scan:public-safety`.
3. For each finding:
   - If it is unsafe public/docs wording, rewrite to synthetic-safe wording.
   - If it is a scanner test fixture, split the banned string or isolate it in an explicit fixture allowlist file.
   - If it is an old plan doc finding, prefer safe rewording. Do not hide docs/plans unless the master plan explicitly says old plans are out of scan scope.
   - If it is a false positive on explicit negation, narrow the pattern only enough to avoid the false positive while still catching positive claims.
4. Re-run the scanner only after changing the finding.

**Expected:** `npm run scan:public-safety` passes and reports source/docs/tests/scenarios/dist coverage.

---

## Task 4: Add/adjust deterministic scanner tests if coverage is incomplete

**Objective:** Ensure Phase R2 behaviors are covered by unit tests, not just manual scan output.

**Files:**
- Modify: `tests/public-safety-scanner.test.ts`

**Required test behaviors:**
- Forbidden terms fail outside explicit fixture allowlist.
- Explicit fixture/test file can contain forbidden inventory.
- Short terms use word boundaries.
- Scenario data with live URLs fails.
- Built assets are scanned after build and unexpected network helpers fail.
- Banned APIs/storage/network/telemetry calls fail.
- Docs implying real-source/live-production behavior fail.
- Findings include file path and enough context.

**Steps:**
1. Compare current tests against the list above.
2. Add any missing tests using runtime-composed forbidden strings.
3. Do not use literal forbidden terms unless the file is explicitly allowlisted.
4. Run `npm test -- --run tests/public-safety-scanner.test.ts`.

**Expected:** targeted scanner tests pass.

---

## Task 5: Update README/docs for actual release gate

**Objective:** Make public docs accurate without overclaiming.

**Files:**
- Modify: `README.md`
- Modify: `docs/public-safety.md`
- Modify as needed: `docs/scope.md`, `docs/model.md`, `docs/scenarios.md`

**Required doc content:**
- What this is.
- Why it exists.
- What it demonstrates.
- Deterministic model and UI adapter path.
- Evidence/risk separation.
- Confidence vs severity distinction.
- Human approval gates.
- Mock receipts and `externalSideEffects: none`.
- Synthetic/public-safe design.
- Verification commands including `npm run scan:public-safety` after `npm run build`.
- What is intentionally not included.
- Future extensions clearly separated from current claims.

**Steps:**
1. Keep wording concise and public-safe.
2. Avoid phrases that scanner treats as live/source implication claims unless they are clearly negative and tested.
3. Do not mention real companies, live systems, private source material, or production behavior as current capability.
4. Run `npm run scan:public-safety` after docs edits.

**Expected:** Docs accurately describe a static synthetic local prototype and the R2 release gate.

---

## Task 6: Full required verification

**Objective:** Prove Phase R2 is complete locally.

Run from repo root, in this sequence:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
git status --short
```

**Expected:**
- All commands pass.
- `git status --short` shows only intended local changes.

If a command fails:
- Fix once if the cause is clear.
- If failure is due to scanner detecting unsafe wording/fixtures, fix wording or fixture isolation.
- Do not weaken guardrails to pass.

---

## Task 7: Commit locally only if verification passes

**Objective:** Finish with a local commit, no push/PR.

**Files:**
- Stage only intended R2 files plus any pre-existing R0/R1 files that are already staged and intentionally part of this branch. Inspect carefully.

**Steps:**
1. Run `git status --short`.
2. Run `git diff --name-only` and `git diff --cached --name-only`.
3. Stage intended changed files explicitly.
4. Commit:

```bash
git add <changed files>
git commit -m "test: harden public safety release gate"
```

5. Run `git status --short --branch`.

**Expected:** Local commit exists. No push, PR, preview, deploy, or merge.

---

## Final report requirements

Report these exact lifecycle states:
- Implementation: complete or partial.
- Verification: each command and exact pass/fail result.
- Preview: not created unless explicitly requested.
- PR: not created unless explicitly requested.
- CI: not run unless PR exists.
- Merge: not applicable.
- Cleanup / git status.
- Public safety status.
- Remaining next step from `docs/master-plan.md`: Phase R3 product proof packaging.
