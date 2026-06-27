# Harness Engineering

Source: OpenAI, `https://openai.com/index/harness-engineering/`.

This repo applies the article's practical ideas at a scale appropriate for a
small scheduled scraper.

## Applied Principles

- `AGENTS.md` is a table of contents, not a manual.
- Durable project knowledge lives in versioned docs under `docs/`.
- Architecture and quality rules are made discoverable before an agent edits
  code.
- Execution plans are first-class artifacts for complex or multi-step work.
- The repository validates its own harness with
  `npm run validate:harness`.

## Local Harness

- [AGENTS.md](../AGENTS.md) gives agents the minimum starting map.
- [ARCHITECTURE.md](../ARCHITECTURE.md) describes runtime flow and source
  boundaries.
- [docs/PLANS.md](PLANS.md) defines when a checked-in execution plan is needed.
- [docs/QUALITY.md](QUALITY.md) defines validation and review bars.
- [scripts/validate-agent-harness.mjs](../scripts/validate-agent-harness.mjs)
  checks that the harness remains present and linked.

## What Is Intentionally Small

The OpenAI article describes large-product practices such as dedicated
observability stacks, domain-layer linters, and recurring documentation agents.
This repo does not need all of that yet. The first useful step is a small
knowledge base plus executable checks that future work can extend when a
repeated failure pattern appears.
