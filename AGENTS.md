# Agent Entry Point

This file is a map, not the full manual. Start here, then open the linked
source of truth for the part of the repo you are changing.

## Project Shape

- Runtime: Cloudflare Workers with scheduled cron execution.
- Main entrypoint: `src/index.ts`.
- Scraped outputs: `boba.json`, `hawker.json`, and `index.html` in R2.
- Package manager: npm. Use `package-lock.json` as the lockfile authority.
- Formatting and linting: Biome.

## Where To Look

- [ARCHITECTURE.md](ARCHITECTURE.md): system map, boundaries, and data flow.
- [docs/README.md](docs/README.md): knowledge base index.
- [docs/HARNESS_ENGINEERING.md](docs/HARNESS_ENGINEERING.md): how this repo
  applies the OpenAI harness engineering research.
- [docs/QUALITY.md](docs/QUALITY.md): validation commands and quality bars.
- [docs/RELIABILITY.md](docs/RELIABILITY.md): scraper reliability rules.
- [docs/PLANS.md](docs/PLANS.md): when to create execution plans.

## Working Rules

- Keep scraper changes local to the relevant source under `src/sources/`.
- Preserve output schemas unless the consumer-facing change is intentional and
  documented.
- Prefer typed parsing and explicit assertions at external boundaries.
- Make retry, fallback, and partial-failure behavior visible in logs.
- Avoid broad rewrites while fixing a single scraper.
- Do not commit generated Worker type updates unless `npm run cf-typegen` was
  part of the task.

## Commit Rules

- Use Conventional Commits, for example `feat: add playmade scraper`.
- Agent-authored commits must include a `Co-Authored-By` trailer for the agent.

## Validation

Run the smallest useful loop while developing, then finish with:

```sh
npm run validate
```

If a validation command cannot run locally, record the command and the concrete
reason in your final handoff.
