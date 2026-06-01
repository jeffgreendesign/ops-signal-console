# Ops Signal Console

<p align="center">
  <a href="https://github.com/jeffgreendesign/ops-signal-console/commits/main/"><img src="https://img.shields.io/github/last-commit/jeffgreendesign/ops-signal-console?style=flat-square" alt="Last commit"></a>
  <a href="https://github.com/jeffgreendesign/ops-signal-console/blob/main/package.json"><img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6.0">
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8.0">
  <img src="https://img.shields.io/badge/data-synthetic-7C3AED?style=flat-square" alt="Synthetic data only">
  <img src="https://img.shields.io/badge/status-active-16A34A?style=flat-square" alt="Active project">
</p>

Synthetic signal triage console for invented multi-brand launches.

Ops Signal Console is a local portfolio prototype for reviewing noisy launch, quality, allocation, and claims signals without turning every signal into an unsupported action. It keeps known facts, inferred risk, evidence gaps, confidence, severity, and approval gates visibly separate.

The project is public-safe by design: invented scenarios only, no live feeds, no private source material, no telemetry, no persistence, and no external writes.

## What it demonstrates

This repo is meant to be reviewed as a small product proof object, not as production software. In a few minutes, it shows how a console can:

- turn synthetic cross-brand signal packets into deterministic review state
- separate observed facts from inferred risks and recommended checks
- treat severity as potential impact and confidence as evidence quality
- block channel, public-facing, or irreversible actions when proof or approval is missing
- allow safe internal-only actions and create typed in-memory mock receipts
- prove its synthetic/public-safe boundary through tests, docs, and a built-asset scan

## Product frame

The console is framed for a house-of-brands operator reviewing multiple new verticals. It helps answer:

- What happened?
- Which parts are observed facts versus inferred risk?
- What proof is missing?
- Which actions are safe, blocked, or approval-gated?
- What would a reviewer need before releasing channel or public-facing copy?

The artifact is fresh and generalized. It does not copy private work systems, private workflows, real companies, real people, real operational records, or live data.

## Architecture

```text
Synthetic fixtures
  src/data/scenarios.ts
    ↓
Deterministic model functions
  src/model/scoring.ts
  src/model/gates.ts
  src/model/receipts.ts
    ↓
Display adapter
  src/scenarios.ts
    ↓
Static console UI
  src/main.ts
  src/styles.css
    ↓
Local-only review trail
  typed in-memory mock receipts; no storage, feeds, or external writes
```

## Scenario walkthrough

One representative scenario reviews a draft claims note:

1. The fixture starts with an invented review packet: a draft note exists, substantiation proof is missing, and human review has not cleared channel or public-facing copy.
2. The model records those items as known facts.
3. It separately names inferred risks such as substantiation gap and overclaim risk.
4. Evidence gaps lower confidence and map to blocked actions: `release-channel-claim` and `publish-public-claim` both require proof and reviewer approval.
5. The UI can still offer the safe internal action `Draft internal note` because it has no external side effect.
6. Clicking that action creates a typed mock receipt with scenario/action IDs, decision reason, reversibility, timestamp, and `externalSideEffects: none`.

## Run locally

```bash
npm install
npm run dev -- --port 5173
```

Open the local Vite URL, usually:

```text
127.0.0.1:5173
```

Useful inspection path:

1. Start on the console overview.
2. Switch between scenarios and compare score, confidence, proof gaps, and action readiness.
3. Inspect known facts and inferred risks side by side.
4. Click a safe internal action and confirm the mock receipt appears.
5. Confirm blocked actions remain blocked when evidence or approval is missing.

## Verify

```bash
npm test
npm run typecheck
npm run build
npm run scan:public-safety
git diff --check
```

## Safety boundaries

Do not add:

- identifying people, organizations, operational records, support traces, links, secrets, screenshots, or private context
- live integrations, live alerts, production-system access, scraping, browser automation, telemetry, persistence, analytics, or external writes
- sign-in, purchasing, user profiles, or irreversible production behavior
- domain-specific material copied from another project

The prototype is intentionally local and synthetic. It has no durable state, no public deployment, no live action path, and no production decision authority.

## Reviewer proof claims

It is fair to claim this artifact demonstrates:

- deterministic display-model logic rather than prompt-only classification
- explicit fact/inference separation
- confidence and severity as separate dimensions
- evidence gaps that block action readiness
- human gates before channel or public-facing action
- inspectable mock receipts without side effects
- public-safety release checks over source, tests, docs, scenarios, and built assets

Do not present it as production-ready software, a hosted service, a live monitoring system, or advice for regulated, legal, medical, financial, claims, or operational decisions.

## Project structure

```text
ops-signal-console/
├── src/data/        # synthetic scenario fixtures
├── src/model/       # deterministic scoring, gates, receipts, and types
├── src/main.ts      # static browser UI entrypoint
├── src/scenarios.ts # display adapter
├── src/styles.css   # console styling
├── tests/           # Vitest coverage for model and UI adapter behavior
└── scripts/         # public-safety scan
```

## Future extensions

Future work may add a temporary review preview, improve visual hierarchy, expand receipt proof, or add more synthetic scenario families. Those are separate tasks, not current runtime capabilities.

## License

MIT, as declared in `package.json`.
