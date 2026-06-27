# Knowledge Base

This directory is the repo-local system of record for agent work. Keep
`AGENTS.md` short and put durable details here.

## Index

- [Harness Engineering](HARNESS_ENGINEERING.md): implementation of the OpenAI
  harness engineering research in this repo.
- [Plans](PLANS.md): execution-plan conventions for larger tasks.
- [Quality](QUALITY.md): checks, invariants, and review expectations.
- [Reliability](RELIABILITY.md): scraper-specific operational rules.
- [Execution Plans](exec-plans/README.md): active and completed plan storage.

## Maintenance

- Update docs in the same change that changes behavior, structure, or commands.
- Prefer specific repo facts over generic guidance.
- If a rule becomes important enough to repeat, encode it in a script or lint
  check and link it from [Quality](QUALITY.md).
