# Ops Signal Console

Synthetic portfolio signal triage console for invented multi-brand launches.

This is a public-safe local prototype. It uses invented scenarios only and does not connect to live systems.

## Portfolio frame

The console is framed for a house-of-brands operator launching multiple new verticals. It helps review signals across brands, surfaces, and launch stages while keeping facts, inferences, evidence gaps, and approval gates separate.

The artifact is fresh, with only general learnings extracted from earlier private work. No private or real-world company context is source material for the product, copy, data model, or visuals.

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

Future work may package the artifact for reviewer comprehension, add a concise model-flow diagram, and improve visual hierarchy. Those are future proof-packaging tasks, not current runtime capabilities.

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
