# Public Safety

This repo is designed as a public-safe synthetic artifact.

## Data rules

Use invented brands, surfaces, sources, scenario IDs, and signal values only. Do not add real names, exact public claims, private labels, screenshots, logs, work items, identifiers, source traces, or production operational data.

## System rules

The MVP must not include live integrations, scraping, telemetry, persistence, sign-in, production actions, external writes, or networked feeds. Public/channel actions must remain gated by missing proof and human approval state.

## Verification

Run:

```bash
npm run scan:public-safety
npm test
npm run build
```

The scanner is intentionally initial and conservative for source APIs. TODO: expand forbidden-term inventories before any public release.
