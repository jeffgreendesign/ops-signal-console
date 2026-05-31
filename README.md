# Ops Signal Console

Synthetic portfolio signal triage console for invented multi-brand launches.

This is a public-safe local prototype. It uses invented scenarios only and does not connect to live systems.

## Portfolio frame

The console is framed for a house-of-brands operator launching multiple new verticals. It helps review signals across brands, surfaces, and launch stages while keeping facts, inferences, evidence gaps, and approval gates separate.

The artifact is fresh, with only general learnings extracted from earlier private work. No private or real-world company context is source material for the product, copy, data model, or visuals.

## What this proves

This repo is meant to be evaluated as a small product proof object, not as a production system. In 2–3 minutes, a reviewer should be able to see that it can:

- Turn invented cross-brand signal packets into a deterministic review surface.
- Keep observed facts, inferred risk, missing proof, and recommended checks visibly separate.
- Treat severity as potential impact and confidence as proof quality, so a loud signal does not become an unsupported action.
- Block channel and public-facing actions when required evidence or human approval is missing.
- Produce typed local mock receipts for allowed internal actions with `externalSideEffects: none`.
- Prove its synthetic/public-safe boundary through tests, docs, and a built-asset scan.

## Architecture flow

```text
Synthetic fixtures
  src/data/scenarios.ts
    ↓
Deterministic model functions
  src/model/scoring.ts, src/model/gates.ts, src/model/receipts.ts
    ↓
Display adapter
  src/scenarios.ts
    ↓
Static console UI
  src/main.ts, src/styles.css
    ↓
Local-only review trail
  typed in-memory mock receipts; no storage, feeds, or external writes
```

## Scenario walkthrough: claims review blocks channel copy

1. The fixture starts with an invented review packet: a draft note exists, substantiation proof is missing, and human review has not cleared channel or public-facing copy.
2. The model records those items as known facts, then separately names the inferred risks: substantiation gap and overclaim risk.
3. Evidence gaps lower confidence and map directly to gated actions: `release-channel-claim` and `publish-public-claim` both require substantiation proof and reviewer approval proof.
4. The UI can still offer the safe internal action `Draft internal note` because it needs no external side effect.
5. Clicking that internal action creates a typed mock receipt with scenario/action IDs, gate status before execution, decision reason, reversibility, timestamp, and `externalSideEffects: none`.
6. Channel and public-facing actions remain blocked until evidence and human approval gates are satisfied. The prototype does not implement a live path for those actions.

## Screenshot notes

No public preview is included in this phase. If run locally with `npm run dev -- --port 5173`, useful reviewer screenshots would be:

- Console overview: scenario selector, deterministic scores, proof-gap summary, and action readiness visible together.
- Claims review scenario: known facts and inferred risks side by side, with channel/public-facing actions blocked.
- Mock receipt state: internal action clicked once, showing the local receipt fields and `externalSideEffects: none`.

## Reviewer proof claims

It is fair to claim this artifact demonstrates:

- Deterministic display-model logic rather than prompt-only classification.
- Explicit fact/inference separation.
- Confidence and severity as separate dimensions.
- Evidence gaps that block action readiness.
- Human gates before channel or public-facing action.
- Inspectable mock receipts without side effects.
- Public-safe synthetic constraints verified by an automated scan.

## Do not claim

Do not present this artifact as:

- Production-ready software.
- Connected to live feeds, alerts, systems, or external action paths.
- Based on real-world source material.
- A deployment, hosted service, or persistent workflow.
- Advice for regulated, nutrition, claims, legal, medical, or operational decisions.

## What it demonstrates

- Synthetic portfolio signal triage across invented brands and verticals.
- Surface-aware context: launch readiness, quality review, field feedback, allocation risk, and review exposure.
- A deterministic model path from `src/data/scenarios.ts` through `src/model/*` into the UI adapter in `src/scenarios.ts`.
- Separation of known facts from inferred risk.
- Confidence as evidence quality, separate from severity as potential impact.
- Evidence-gap, blast-radius, and margin-sensitivity surfacing.
- Display-safe decision-stakes and control-pattern labels for reviewer scanability.
- Recommended next checks before action.
- Human approval gates and approval-trail language before external or irreversible steps.
- Typed in-memory mock receipts with `externalSideEffects: none` for allowed internal actions only.
- A public-safety release gate that scans source, docs, tests, scenarios, and built assets.

## Safety boundaries

Do not add:

- Identifying people, organizations, traces, response records, links, secrets, or private context.
- Live integrations, live alerts, production-system access, scraping, browser automation, telemetry, persistence, or external writes.
- Sign-in, purchasing, user profiles, or irreversible production behavior.
- Domain-specific material from another project.

## Intentional absences

This artifact is not production-ready software. It has no live data input, no external action path, no analytics, no durable state, no sign-in, and no public deployment in this phase.

## Future extensions

Future work may improve visual hierarchy, add a temporary review preview, or expand receipt proof. Those are separate tasks, not current runtime capabilities.

## Run locally

```bash
npm install
npm run dev -- --port 5173
```

## Verify

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```
