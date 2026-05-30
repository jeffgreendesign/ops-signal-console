# Ops Signal Console

Synthetic portfolio signal triage console for invented multi-brand launches.

This is a public-safe local prototype. It uses invented scenarios only and does not connect to live systems.

## Portfolio frame

The console is framed for a house-of-brands operator launching multiple new verticals. It helps review signals across brands, surfaces, and launch stages while keeping facts, inferences, evidence gaps, and approval gates separate.

The artifact is fresh, with only general learnings extracted from earlier private work. No private or real-world company context is source material for the product, copy, data model, or visuals.

## What it demonstrates

- Synthetic portfolio signal triage across invented brands and verticals.
- Surface-aware context: launch readiness, quality review, field feedback, and allocation risk.
- Separation of known facts from inferred risk.
- Confidence, evidence-gap, and blast-radius surfacing.
- Recommended next checks before action.
- Human approval gates before external or irreversible steps.
- In-memory mock actions only.

## Safety boundaries

Do not add:

- Identifying people, organizations, traces, response records, links, secrets, or private context.
- Live integrations, live alerts, production-system access, scraping, browser automation, telemetry, persistence, or external writes.
- Domain-specific material from another project.

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
git diff --check
```
