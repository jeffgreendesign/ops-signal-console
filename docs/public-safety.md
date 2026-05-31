# Public Safety

This repo is designed as a public-safe synthetic artifact: invented data, deterministic behavior, local-only mock execution, and no live side effects.

## Data rules

Use invented brands, surfaces, sources, scenario IDs, and signal values only. Do not add real names, exact public claims, private labels, screenshots, logs, work items, identifiers, source traces, or production operational data.

## System rules

The MVP must not include live integrations, scraping, telemetry, persistence, sign-in, production actions, external writes, or networked feeds. Public/channel actions must remain gated by missing proof and human approval state.

Allowed action behavior is local and inspectable only: internal mock actions can create typed in-memory receipts, and every receipt records `externalSideEffects: none`.

## Release gate

Run the release gate after a build so built assets exist:

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

`npm run scan:public-safety` scans source, docs, tests, scenario fixtures, and `dist/` assets. It fails on banned browser/network/storage/telemetry API tokens, forbidden source-identifying terms outside explicit inventory fixtures, live URLs in scenario data, built-asset network helper surprises, and docs that imply real-source or live-production behavior.

Findings include file path, line, column, kind, detail, and nearby context so unsafe wording or fixtures can be fixed directly.

## What is intentionally absent

There is no live data input, networked feed, sign-in, durable state, telemetry, external write path, public action execution, or deployment claim in this phase.

## Future extensions

Future work may add proof packaging, a concise architecture flow, and visual hierarchy polish. Those extensions must stay separate from current claims until implemented and verified.
