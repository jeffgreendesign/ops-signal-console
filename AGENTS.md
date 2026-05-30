# AGENTS.md — Ops Signal Console

Build behavior first. Keep it public-safe.

## Project frame

Ops Signal Console is a synthetic portfolio signal triage prototype for a house-of-brands operator launching multiple invented verticals. It demonstrates cross-brand signal consolidation, evidence/proof warnings, uncertainty, and human approval gates before action.

## Artifact mode

Fresh project with extracted learnings. Prior private or real-world context is inspiration only, not source material.

## Hard boundaries

DO NOT add:

- Identifying people, organizations, traces, response records, links, secrets, or private context.
- Live integrations, live alerts, production-system access, scraping, browser automation, telemetry, persistence, or external writes.
- Sign-in, purchasing, or irreversible production behavior.
- Company-specific labels, route maps, internal route names, or non-public metrics.
- Domain-specific material from another project.

DO use:

- Synthetic portfolio, brand, vertical, surface, and signal names.
- Invented system names.
- Display-safe facts/inferences/gaps.
- Tests for scenario, display-model, leakage, and API-boundary invariants.
- Static/demo-first implementation suitable for Vercel or Netlify later.

## Verification

Run before reporting completion:

```bash
npm test
npm run typecheck
npm run build
git diff --check
```
